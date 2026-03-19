// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";

// Minimal interfaces - just what Factory needs
interface IBasedToken {
    function initialize(string calldata name, string calldata symbol, address curve, address factory) external;
    function setMeta(string calldata img, string calldata desc, string calldata web, string calldata tw, string calldata tg) external;
    function transfer(address to, uint256 amt) external returns (bool);
    function totalSupply() external view returns (uint256);
}
interface IArmoryVault  { function initialize(address token, address creator, address factory) external; }
interface IFortify      { function initialize(address token, address factory) external; }
interface IBondingCurve {
    function initialize(address token, address creator, address armory, address platform, address vault, address chest, address factory) external;
}
interface IWarChest     { function authorizeCurve(address curve) external; }
interface IProtocolVault {
    function registerToken(address token, address armory, address fortify, address lp) external;
    function authorizeCurve(address curve) external;
}

contract BasedTrenchesFactory {
    uint256 public constant LAUNCH_FEE = 0.002 ether;

    address public immutable platformWallet;
    address public immutable warChest;
    address public immutable protocolVault;

    // Implementation contracts (deployed once, cloned per token)
    address public immutable tokenImpl;
    address public immutable armoryImpl;
    address public immutable fortifyImpl;
    address public immutable curveImpl;

    uint256 public tokenCount;
    bool    public locked;

    mapping(address => bool)    public isValidToken;
    mapping(address => address) public tokenToCurve;
    mapping(address => address) public tokenToArmory;
    mapping(address => address) public tokenToFortify;
    address[] public allTokens;

    struct Meta {
        string name; string symbol;
        string imageUri; string description;
        string website; string twitter; string telegram;
    }

    event TokenLaunched(address indexed token, address indexed creator, address indexed curve, address armory, address fortify, string name, string symbol, uint256 timestamp);

    modifier noReentrancy() { require(!locked, "Reentrant"); locked = true; _; locked = false; }

    constructor(
        address _platform, address _chest, address _vault,
        address _tokenImpl, address _armoryImpl, address _fortifyImpl, address _curveImpl
    ) {
        require(_platform != address(0));
        require(_chest    != address(0));
        require(_vault    != address(0));
        platformWallet = _platform;
        warChest       = _chest;
        protocolVault  = _vault;
        tokenImpl  = _tokenImpl;
        armoryImpl = _armoryImpl;
        fortifyImpl= _fortifyImpl;
        curveImpl  = _curveImpl;
    }

    // EIP-1167 minimal proxy clone
    function _clone(address impl) internal returns (address instance) {
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(ptr, 0x14), shl(0x60, impl))
            mstore(add(ptr, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, ptr, 0x37)
        }
        require(instance != address(0), "Clone failed");
    }

    function launchToken(Meta calldata m)
        external payable noReentrancy
        returns (address token, address curve, address armory, address fortify)
    {
        require(msg.value == LAUNCH_FEE,     "Send 0.002 ETH");
        require(bytes(m.name).length   > 0,  "Name required");
        require(bytes(m.symbol).length > 0,  "Symbol required");

        address creator = msg.sender;

        // Clone implementations
        token   = _clone(tokenImpl);
        armory  = _clone(armoryImpl);
        fortify = _clone(fortifyImpl);
        curve   = _clone(curveImpl);

        // Initialize each clone
        IBasedToken(token).initialize(m.name, m.symbol, curve, address(this));
        IBasedToken(token).setMeta(m.imageUri, m.description, m.website, m.twitter, m.telegram);
        IArmoryVault(armory).initialize(token, creator, address(this));
        IFortify(fortify).initialize(token, address(this));
        IBondingCurve(curve).initialize(token, creator, armory, platformWallet, protocolVault, warChest, address(this));

        // Send full supply to curve
        require(IBasedToken(token).transfer(curve, IBasedToken(token).totalSupply()), "Supply transfer failed");

        // Register
        IProtocolVault(protocolVault).registerToken(token, armory, fortify, address(0));
        IProtocolVault(protocolVault).authorizeCurve(curve);
        IWarChest(warChest).authorizeCurve(curve);

        isValidToken[token]   = true;
        tokenToCurve[token]   = curve;
        tokenToArmory[token]  = armory;
        tokenToFortify[token] = fortify;
        allTokens.push(token);
        tokenCount++;

        (bool ok,) = payable(platformWallet).call{value: LAUNCH_FEE}("");
        require(ok, "Fee failed");

        emit TokenLaunched(token, creator, curve, armory, fortify, m.name, m.symbol, block.timestamp);
    }

    function getAllTokens() external view returns (address[] memory) { return allTokens; }
    function getTokenData(address t) external view returns (address, address, address, bool) {
        return (tokenToCurve[t], tokenToArmory[t], tokenToFortify[t], isValidToken[t]);
    }
}
