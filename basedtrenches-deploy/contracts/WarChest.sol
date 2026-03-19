// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";
import "./ProtocolVault.sol";

contract WarChest {
    uint256 public constant THRESHOLD    = 1 ether;
    uint256 public constant MAX_PAYOUT   = 2 ether;
    uint256 public constant LIQ_BPS      = 4000;
    uint256 public constant HOLDERS_BPS  = 2000;
    uint256 public constant LASTBUY_BPS  = 1000;
    uint256 public constant FORTIFY_BPS  = 500;
    uint256 public constant ARMORY_BPS   = 500;
    uint256 public constant PLATFORM_BPS = 2000;

    address public immutable platformWallet;
    address public immutable protocolVault;
    address public factory;

    bool    public locked;
    uint256 public totalReceived;
    uint256 public totalPaidOut;
    uint256 public payoutCount;

    mapping(address => address) public lastBuyer;
    mapping(address => uint256) public lastBuyBlock;
    mapping(address => bool)    public authorizedCurves;
    mapping(address => bool)    public authorizedVaults;

    event EthReceived(address indexed from, uint256 amount);
    event PayoutTriggered(address indexed token, uint256 payout);
    event CurveAuthorized(address indexed curve);

    modifier noReentrancy() { require(!locked, "Reentrant"); locked = true; _; locked = false; }
    modifier onlyCurve()    { require(authorizedCurves[msg.sender], "Not authorized"); _; }
    modifier onlyVault()    { require(authorizedVaults[msg.sender],  "Not authorized"); _; }
    modifier onlyFactory()  { require(msg.sender == factory,          "Only factory"); _; }

    // factory set separately after deployment to avoid chicken-and-egg
    constructor(address _platform, address _vault) {
        require(_platform != address(0), "Invalid platform");
        require(_vault    != address(0), "Invalid vault");
        platformWallet = _platform;
        protocolVault  = _vault;
        authorizedVaults[_vault] = true;
    }

    function setFactory(address _factory) external {
        require(factory == address(0), "Already set");
        require(_factory != address(0), "Invalid");
        factory = _factory;
    }

    receive() external payable {
        totalReceived += msg.value;
        emit EthReceived(msg.sender, msg.value);
    }

    function receiveEth() external payable {
        totalReceived += msg.value;
        emit EthReceived(msg.sender, msg.value);
    }

    function authorizeCurve(address curve) external onlyFactory {
        require(curve != address(0), "Invalid");
        authorizedCurves[curve] = true;
        emit CurveAuthorized(curve);
    }

    function recordBuy(address token, address buyer, uint256) external onlyCurve {
        lastBuyer[token]    = buyer;
        lastBuyBlock[token] = block.number;
    }

    function recordGraduation(address) external onlyCurve {}

    function triggerPayout(address token) external noReentrancy onlyVault {
        uint256 bal = address(this).balance;
        if (bal < THRESHOLD) return;

        uint256 payout   = bal > MAX_PAYOUT ? MAX_PAYOUT : bal;
        uint256 liq      = (payout * LIQ_BPS)      / 10000;
        uint256 holders  = (payout * HOLDERS_BPS)   / 10000;
        uint256 lastBuy  = (payout * LASTBUY_BPS)   / 10000;
        uint256 fort     = (payout * FORTIFY_BPS)   / 10000;
        uint256 army     = (payout * ARMORY_BPS)    / 10000;
        uint256 platform = payout - liq - holders - lastBuy - fort - army;

        totalPaidOut += payout;
        payoutCount++;

        ProtocolVault(payable(protocolVault)).boostLiquidity{value: liq}(token);
        _payHolders(token, holders, platform);
        _payLastBuyer(token, lastBuy, platform);
        _payFortify(token, fort, platform);
        _payArmory(token, army, platform);
        _send(platformWallet, platform);

        emit PayoutTriggered(token, payout);
    }

    // Split into helpers to avoid stack too deep
    uint256 private _tempPlatform;

    function _payHolders(address token, uint256 amount, uint256) internal {
        (address[10] memory h, uint256[10] memory b) = ProtocolVault(payable(protocolVault)).getTopHolders(token);
        uint256 total = 0;
        for (uint256 i = 0; i < 10; i++) if (h[i] != address(0)) total += b[i];
        if (total == 0) { _send(platformWallet, amount); return; }
        uint256 paid = 0;
        for (uint256 i = 0; i < 10; i++) {
            if (h[i] == address(0) || b[i] == 0) continue;
            uint256 share = i == 9 ? amount - paid : (amount * b[i]) / total;
            _send(h[i], share);
            paid += share;
        }
    }

    function _payLastBuyer(address token, uint256 amount, uint256) internal {
        address lb = lastBuyer[token];
        if (lb != address(0)) _send(lb, amount);
        else _send(platformWallet, amount);
    }

    function _payFortify(address token, uint256 amount, uint256) internal {
        address f = ProtocolVault(payable(protocolVault)).getFortify(token);
        if (f != address(0)) { (bool ok,) = payable(f).call{value: amount}(""); require(ok, "Fortify send failed"); }
        else _send(platformWallet, amount);
    }

    function _payArmory(address token, uint256 amount, uint256) internal {
        address a = ProtocolVault(payable(protocolVault)).getArmoryVault(token);
        if (a != address(0)) { (bool ok,) = payable(a).call{value: amount}(""); require(ok, "Armory send failed"); }
        else _send(platformWallet, amount);
    }

    function _send(address to, uint256 amount) internal {
        if (amount == 0 || to == address(0)) return;
        (bool ok,) = payable(to).call{value: amount}("");
        require(ok, "ETH failed");
    }

    function getBalance() external view returns (uint256) { return address(this).balance; }
    function isActive()   external view returns (bool)    { return address(this).balance >= THRESHOLD; }
}

// ═══════════════════════════════════════════════════════════════
// ProtocolVault
// ═══════════════════════════════════════════════════════════════
