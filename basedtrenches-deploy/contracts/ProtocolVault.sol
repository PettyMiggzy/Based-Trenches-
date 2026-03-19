// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";
import "./BasedToken.sol";

interface IWarChest { function triggerPayout(address token) external; }

contract ProtocolVault {
    address public constant WETH      = 0x4200000000000000000000000000000000000006;
    address public constant UNI_FACTORY = 0x33128a8fC17869897dcE68Ed026d694621f6FDfD;
    address public constant POS_MGR   = 0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1;

    uint24  public constant POOL_FEE  = 10000;
    int24   public constant TICK_LOW  = -887200;
    int24   public constant TICK_HIGH =  887200;
    uint256 public constant WAR_BPS   = 5000;
    uint256 public constant FORT_BPS  = 4000;
    uint256 public constant PLAT_BPS  = 1000;

    address public platformWallet;
    address public warChest;
    address public factory;
    bool    public locked;

    struct TData {
        address pool;
        uint256 lpTokenId;
        address armoryVault;
        address fortify;
        address lastBuyer;
        bool    graduated;
    }
    mapping(address => TData) public tdata;
    address[] public allTokens;

    struct Snapshot {
        address[10] holders;
        uint256[10] balances;
        uint256     updated;
    }
    mapping(address => Snapshot) public snapshots;
    mapping(address => bool) public authorizedCurves;
    mapping(address => bool) public authorizedFactories;

    event LiqDeployed(address indexed token, address indexed pool, uint256 tokenId);
    event FeesCollected(address indexed token, uint256 wethAmt);
    event LiqBoosted(address indexed token, uint256 ethAmt);
    event TokenReg(address indexed token);

    modifier noReentrancy() { require(!locked, "Reentrant"); locked = true; _; locked = false; }
    modifier onlyFactory()  { require(authorizedFactories[msg.sender] || msg.sender == factory, "Only factory"); _; }
    modifier onlyCurve()    { require(authorizedCurves[msg.sender], "Only curve"); _; }
    modifier onlyChest()    { require(msg.sender == warChest, "Only WarChest"); _; }

    constructor(address _platform) {
        require(_platform != address(0), "Invalid platform");
        platformWallet = _platform;
    }

    function setWarChest(address _wc) external {
        require(warChest == address(0), "Already set");
        require(_wc != address(0), "Invalid");
        warChest = _wc;
    }

    function setFactory(address _f) external {
        require(factory == address(0), "Already set");
        require(_f != address(0), "Invalid");
        factory = _f;
        authorizedFactories[_f] = true;
    }

    function authorizeCurve(address curve) external onlyFactory {
        authorizedCurves[curve] = true;
    }

    function registerToken(address token, address armory, address fortify, address) external onlyFactory {
        require(token  != address(0), "Invalid token");
        require(armory != address(0), "Invalid armory");
        require(fortify != address(0), "Invalid fortify");
        tdata[token].armoryVault = armory;
        tdata[token].fortify     = fortify;
        allTokens.push(token);
        emit TokenReg(token);
    }

    function deployLiquidity(address token, uint256 tokenAmt, uint256 ethAmt)
        external payable noReentrancy onlyCurve returns (address pool)
    {
        require(msg.value == ethAmt,       "ETH mismatch");
        require(!tdata[token].graduated,   "Already graduated");

        IWETH(WETH).deposit{value: ethAmt}();

        (address t0, address t1) = token < WETH ? (token, WETH) : (WETH, token);
        pool = IUniV3Factory(UNI_FACTORY).getPool(t0, t1, POOL_FEE);
        if (pool == address(0)) {
            pool = IUniV3Factory(UNI_FACTORY).createPool(t0, t1, POOL_FEE);
            IUniV3Pool(pool).initialize(_sqrtPrice(t0, token, ethAmt, tokenAmt));
        }

        IERC20(token).approve(POS_MGR, tokenAmt);
        IWETH(WETH).approve(POS_MGR, ethAmt);

        (uint256 a0, uint256 a1) = token < WETH ? (tokenAmt, ethAmt) : (ethAmt, tokenAmt);

        IPositionManager.MintParams memory p = IPositionManager.MintParams({
            token0: t0, token1: t1, fee: POOL_FEE,
            tickLower: TICK_LOW, tickUpper: TICK_HIGH,
            amount0Desired: a0, amount1Desired: a1,
            amount0Min: 0, amount1Min: 0,
            recipient: address(this), deadline: block.timestamp + 300
        });
        (uint256 tokenId,,,) = IPositionManager(POS_MGR).mint(p);

        tdata[token].pool      = pool;
        tdata[token].lpTokenId = tokenId;
        tdata[token].graduated = true;

        emit LiqDeployed(token, pool, tokenId);
        if (warChest != address(0)) IWarChest(warChest).triggerPayout(token);
    }

    function collectFees(address token) external noReentrancy {
        TData storage d = tdata[token];
        require(d.graduated && d.lpTokenId > 0, "Not eligible");

        IPositionManager.CollectParams memory p = IPositionManager.CollectParams({
            tokenId: d.lpTokenId, recipient: address(this),
            amount0Max: type(uint128).max, amount1Max: type(uint128).max
        });
        (uint256 a0, uint256 a1) = IPositionManager(POS_MGR).collect(p);
        uint256 wethAmt = IUniV3Pool(d.pool).token0() == WETH ? a0 : a1;
        if (wethAmt == 0) return;

        IWETH(WETH).withdraw(wethAmt);

        uint256 warAmt  = (wethAmt * WAR_BPS)  / 10000;
        uint256 fortAmt = (wethAmt * FORT_BPS) / 10000;
        uint256 platAmt = wethAmt - warAmt - fortAmt;

        if (warAmt > 0 && warChest != address(0)) _send(warChest, warAmt);

        address f = d.fortify;
        if (fortAmt > 0 && f != address(0)) { (bool ok,) = payable(f).call{value: fortAmt}(""); require(ok, "Fortify send failed"); }
        else platAmt += fortAmt;

        if (platAmt > 0) _send(platformWallet, platAmt);
        emit FeesCollected(token, wethAmt);
    }

    function collectAllFees() external {
        for (uint256 i = 0; i < allTokens.length; i++) {
            address t = allTokens[i];
            if (tdata[t].graduated) try this.collectFees(t) {} catch {}
        }
    }

    function boostLiquidity(address token) external payable noReentrancy onlyChest {
        require(msg.value > 0, "No ETH");
        TData storage d = tdata[token];
        require(d.graduated && d.lpTokenId > 0, "Not eligible");

        IWETH(WETH).deposit{value: msg.value}();
        IWETH(WETH).approve(POS_MGR, msg.value);

        bool wethIsT0 = IUniV3Pool(d.pool).token0() == WETH;
        (uint256 a0, uint256 a1) = wethIsT0 ? (msg.value, uint256(0)) : (uint256(0), msg.value);

        IPositionManager.IncreaseParams memory p = IPositionManager.IncreaseParams({
            tokenId: d.lpTokenId,
            amount0Desired: a0, amount1Desired: a1,
            amount0Min: 0, amount1Min: 0,
            deadline: block.timestamp + 300
        });
        IPositionManager(POS_MGR).increaseLiquidity(p);
        emit LiqBoosted(token, msg.value);
    }

    function updateHolderSnapshot(
        address token,
        address[10] calldata holders,
        uint256[10] calldata balances
    ) external {
        Snapshot storage s = snapshots[token];
        for (uint256 i = 0; i < 10; i++) {
            s.holders[i]  = holders[i];
            s.balances[i] = balances[i];
        }
        s.updated = block.timestamp;
    }

    function getTopHolders(address token) external view
        returns (address[10] memory holders, uint256[10] memory balances)
    {
        holders  = snapshots[token].holders;
        balances = snapshots[token].balances;
    }

    function getArmoryVault(address token) external view returns (address) { return tdata[token].armoryVault; }
    function getFortify(address token)     external view returns (address) { return tdata[token].fortify; }
    function getPool(address token)        external view returns (address) { return tdata[token].pool; }
    function isGraduated(address token)    external view returns (bool)    { return tdata[token].graduated; }
    function getAllTokens()                 external view returns (address[] memory) { return allTokens; }

    function _sqrtPrice(address t0, address baseToken, uint256 ethAmt, uint256 tokenAmt)
        internal pure returns (uint160)
    {
        uint256 price = t0 == baseToken
            ? (ethAmt * 1e18) / tokenAmt
            : (tokenAmt * 1e18) / ethAmt;
        return uint160((Sqrt.sqrt(price) * (2**96)) / 1e9);
    }

    function _send(address to, uint256 amt) internal {
        if (amt == 0 || to == address(0)) return;
        (bool ok,) = payable(to).call{value: amt}("");
        require(ok, "ETH failed");
    }

    receive() external payable {}
}


// ═══════════════════════════════════════════════════════════════
// TokenDeployer — deploys per-token contracts (keeps Factory small)
// ═══════════════════════════════════════════════════════════════
