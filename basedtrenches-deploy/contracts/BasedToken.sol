// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";

contract BasedToken {
    string public name;
    string public symbol;
    uint8  public constant decimals = 18;
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000e18;

    address public curve;
    address public factory;
    bool    private initialized;

    // Metadata
    string public imageUri;
    string public description;
    string public website;
    string public twitter;
    string public telegram;
    bool   public metaSet;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function initialize(
        string calldata _name,
        string calldata _symbol,
        address _curve,
        address _factory
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;
        name    = _name;
        symbol  = _symbol;
        curve   = _curve;
        factory = _factory;
        balanceOf[_factory] = TOTAL_SUPPLY;
        emit Transfer(address(0), _factory, TOTAL_SUPPLY);
    }

    function setMeta(
        string calldata _img, string calldata _desc,
        string calldata _web, string calldata _tw, string calldata _tg
    ) external {
        require(msg.sender == factory && !metaSet);
        metaSet = true;
        imageUri = _img; description = _desc;
        website = _web; twitter = _tw; telegram = _tg;
    }

    function isGraduated() external view returns (bool) {
        return curve != address(0) && IERC20(curve).totalSupply() == 0;
    }

    function transfer(address to, uint256 amt) external returns (bool) { _transfer(msg.sender, to, amt); return true; }
    function approve(address sp, uint256 amt) external returns (bool) { allowance[msg.sender][sp] = amt; emit Approval(msg.sender, sp, amt); return true; }
    function transferFrom(address from, address to, uint256 amt) external returns (bool) {
        if (allowance[from][msg.sender] != type(uint256).max) allowance[from][msg.sender] -= amt;
        _transfer(from, to, amt); return true;
    }
    function totalSupply() external pure returns (uint256) { return TOTAL_SUPPLY; }
    function burn(uint256 amt) external { balanceOf[msg.sender] -= amt; emit Transfer(msg.sender, address(0), amt); }

    function _transfer(address from, address to, uint256 amt) internal {
        require(from != address(0) && to != address(0));
        balanceOf[from] -= amt;
        balanceOf[to]   += amt;
        emit Transfer(from, to, amt);
    }
}
