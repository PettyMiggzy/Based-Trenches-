// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";

contract BondingCurve {
    // Constants
    uint256 public constant GRAD_TARGET    = 3 ether;
    uint256 public constant CURVE_SUPPLY   = 800_000_000e18;
    uint256 public constant LP_SUPPLY      = 200_000_000e18;
    uint256 public constant CREATOR_SHARE  = 0.25 ether;
    uint256 public constant PLATFORM_SHARE = 0.25 ether;
    uint256 public constant LP_ETH         = 2.5 ether;
    uint256 public constant VIRT_ETH       = 0.015 ether;
    uint256 public constant VIRT_TOKENS    = 1_073_000_191e18;
    uint256 public constant BUY_FEE_BPS    = 200;
    uint256 public constant SELL_FEE_BPS   = 200;
    uint256 public constant PLATFORM_BPS   = 100;
    uint256 public constant CREATOR_BPS    = 100;

    address public token;
    address public creator;
    address public armory;
    address public platformWallet;
    address public protocolVault;
    address public warChest;
    address public factory;
    bool    private initialized;

    uint256 public virtualETH    = VIRT_ETH;
    uint256 public virtualTokens = VIRT_TOKENS;
    uint256 public realETH;
    uint256 public platformBuffer;
    uint256 public deployBlock;
    bool    public graduated;
    bool    private locked;

    // Raid tracking
    uint256 public buyCount90s;
    uint256 public window90sStart;
    uint256 public ethIn3min;
    uint256 public window3minStart;
    bool    public raidActive;

    // Referral
    mapping(address => address) public referrer;
    mapping(address => uint256) public referralEarned;

    event Buy(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 fee, address referrer);
    event Sell(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 fee);
    event Graduated(uint256 lpETH, uint256 lpTokens);
    event RaidTriggered(string reason);

    modifier noReentrancy() { require(!locked); locked = true; _; locked = false; }
    modifier notGraduated() { require(!graduated); _; }

    function initialize(
        address _token, address _creator, address _armory,
        address _platform, address _vault, address _chest, address _factory
    ) external {
        require(!initialized); initialized = true;
        token = _token; creator = _creator; armory = _armory;
        platformWallet = _platform; protocolVault = _vault;
        warChest = _chest; factory = _factory;
        deployBlock = block.number;
    }

    function buyQuote(uint256 ethIn) external view returns (uint256 tokensOut, uint256 fee) {
        uint256 netFee = ethIn * BUY_FEE_BPS / 10000;
        uint256 netETH = ethIn - netFee;
        uint256 k      = virtualETH * virtualTokens;
        uint256 newETH = virtualETH + netETH;
        uint256 newTok = k / newETH;
        tokensOut = virtualTokens - newTok;
        fee = netFee;
    }

    function sellQuote(uint256 tokensIn) external view returns (uint256 ethOut, uint256 fee) {
        uint256 k      = virtualETH * virtualTokens;
        uint256 newTok = virtualTokens + tokensIn;
        uint256 newETH = k / newTok;
        uint256 grossETH = virtualETH - newETH;
        fee = grossETH * SELL_FEE_BPS / 10000;
        ethOut = grossETH - fee;
    }

    function buy(uint256 minTokensOut, address ref) external payable noReentrancy notGraduated {
        require(msg.value > 0);
        require(block.number > deployBlock, "Same block");
        require(msg.sender != creator, "Creator cant buy");

        uint256 totalFee    = msg.value * BUY_FEE_BPS / 10000;
        uint256 creatorFee  = msg.value * CREATOR_BPS / 10000;
        uint256 platformFee;
        uint256 referFee;

        if (ref != address(0) && ref != msg.sender) {
            if (referrer[msg.sender] == address(0)) referrer[msg.sender] = ref;
            referFee    = msg.value * 2 / 10000;
            platformFee = totalFee - creatorFee - referFee;
            referralEarned[referrer[msg.sender]] += referFee;
            _send(referrer[msg.sender], referFee);
        } else {
            platformFee = totalFee - creatorFee;
        }

        _send(creator, creatorFee);
        platformBuffer += platformFee;

        uint256 netETH  = msg.value - totalFee;
        uint256 k       = virtualETH * virtualTokens;
        uint256 newETH  = virtualETH + netETH;
        uint256 newTok  = k / newETH;
        uint256 tokensOut = virtualTokens - newTok;
        require(tokensOut >= minTokensOut, "Slippage");
        require(realETH + netETH + VIRT_ETH <= GRAD_TARGET + VIRT_ETH, "Exceeds supply");

        virtualETH    = newETH;
        virtualTokens = newTok;
        realETH      += netETH;

        require(IERC20(token).transfer(msg.sender, tokensOut), "Token transfer failed");
        _trackRaid(msg.value);

        emit Buy(msg.sender, msg.value, tokensOut, totalFee, referrer[msg.sender]);
        if (realETH >= GRAD_TARGET) _graduate();
    }

    function sell(uint256 tokensIn, uint256 minETHOut) external noReentrancy notGraduated {
        require(tokensIn > 0);
        require(IERC20(token).transferFrom(msg.sender, address(this), tokensIn), "Transfer failed");

        uint256 k        = virtualETH * virtualTokens;
        uint256 newTok   = virtualTokens + tokensIn;
        uint256 newETH   = k / newTok;
        uint256 grossETH = virtualETH - newETH;
        uint256 platFee  = grossETH * PLATFORM_BPS / 10000;
        uint256 armFee   = grossETH * PLATFORM_BPS / 10000;
        uint256 ethOut   = grossETH - platFee - armFee;

        require(ethOut >= minETHOut, "Slippage");
        require(ethOut <= address(this).balance - platformBuffer, "Insufficient liquidity");

        virtualETH    = newETH;
        virtualTokens = newTok;
        realETH      -= grossETH;

        platformBuffer += platFee;
        _send(armory, armFee);

        if (platformBuffer > 0) {
            uint256 buf = platformBuffer; platformBuffer = 0;
            _send(platformWallet, buf);
        }
        _send(msg.sender, ethOut);
        emit Sell(msg.sender, tokensIn, ethOut, platFee + armFee);
    }

    function flushPlatformBuffer() external {
        require(platformBuffer > 0);
        uint256 buf = platformBuffer; platformBuffer = 0;
        _send(platformWallet, buf);
    }

    function _graduate() internal {
        graduated = true;
        if (platformBuffer > 0) { uint256 buf = platformBuffer; platformBuffer = 0; _send(platformWallet, buf); }
        _send(creator, CREATOR_SHARE);
        _send(platformWallet, PLATFORM_SHARE);
        uint256 remainingTokens = IERC20(token).balanceOf(address(this));
        require(IERC20(token).transfer(protocolVault, remainingTokens), "LP token transfer failed");
        IProtocolVault(protocolVault).addLiquidity{value: LP_ETH}(token, remainingTokens);
        emit Graduated(LP_ETH, remainingTokens);
    }

    function _trackRaid(uint256 ethAmt) internal {
        if (raidActive) return;
        // 90s window: 5 buys
        if (block.timestamp > window90sStart + 90) { buyCount90s = 0; window90sStart = block.timestamp; }
        buyCount90s++;
        // 3min window: 0.5 ETH
        if (block.timestamp > window3minStart + 180) { ethIn3min = 0; window3minStart = block.timestamp; }
        ethIn3min += ethAmt;
        if (buyCount90s >= 5) { raidActive = true; emit RaidTriggered("5 buys in 90s"); }
        else if (ethIn3min >= 0.5 ether) { raidActive = true; emit RaidTriggered("0.5 ETH in 3min"); }
    }

    function resetRaid() external { require(msg.sender == factory); raidActive = false; buyCount90s = 0; ethIn3min = 0; }
    function currentPrice() external view returns (uint256) { return virtualETH * 1e18 / virtualTokens; }

    function _send(address to, uint256 amt) internal {
        if (amt == 0) return;
        (bool ok,) = payable(to).call{value: amt}(""); require(ok);
    }
    receive() external payable {}
}

interface IProtocolVault {
    function addLiquidity(address token, uint256 tokenAmt) external payable;
}
