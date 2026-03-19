// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";

contract Fortify {
    address public token;
    address public factory;
    bool    private initialized;

    uint256 public totalStaked;
    uint256 public totalStakedWeighted;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;
    uint256 public totalRewards;

    uint256 constant DURATION_30  = 30 days;
    uint256 constant DURATION_60  = 60 days;
    uint256 constant DURATION_90  = 90 days;
    uint256 constant DURATION_180 = 180 days;
    uint256 constant MULT_30  = 10000;
    uint256 constant MULT_60  = 15000;
    uint256 constant MULT_90  = 20000;
    uint256 constant MULT_180 = 30000;
    uint256 constant EARLY_PENALTY = 1000; // 10%

    struct Stake { uint256 amount; uint256 duration; uint256 start; uint256 end; uint256 rewardDebt; uint256 pendingReward; }
    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 duration, uint256 end);
    event Unstaked(address indexed user, uint256 amount, uint256 reward, bool early);
    event RewardAdded(uint256 amount);

    receive() external payable { _addReward(msg.value); }

    function initialize(address _token, address _factory) external {
        require(!initialized); initialized = true;
        token = _token; factory = _factory;
    }

    function _multiplier(uint256 dur) internal pure returns (uint256) {
        if (dur == DURATION_180) return MULT_180;
        if (dur == DURATION_90)  return MULT_90;
        if (dur == DURATION_60)  return MULT_60;
        return MULT_30;
    }

    function _addReward(uint256 amt) internal {
        if (totalStakedWeighted > 0) rewardPerTokenStored += amt * 1e18 / totalStakedWeighted;
        totalRewards += amt;
        emit RewardAdded(amt);
    }

    function stake(uint256 amount, uint256 duration) external {
        require(stakes[msg.sender].amount == 0, "Already staking");
        require(duration == DURATION_30 || duration == DURATION_60 || duration == DURATION_90 || duration == DURATION_180, "Invalid duration");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        uint256 weighted = amount * _multiplier(duration) / 10000;
        totalStaked         += amount;
        totalStakedWeighted += weighted;
        stakes[msg.sender] = Stake(amount, duration, block.timestamp, block.timestamp + duration, rewardPerTokenStored, 0);
        emit Staked(msg.sender, amount, duration, block.timestamp + duration);
    }

    function unstake() external {
        Stake storage s = stakes[msg.sender];
        require(s.amount > 0, "No stake");
        uint256 weighted = s.amount * _multiplier(s.duration) / 10000;
        uint256 reward   = (rewardPerTokenStored - s.rewardDebt) * weighted / 1e18 + s.pendingReward;
        bool early = block.timestamp < s.end;
        uint256 penalty;
        if (early) { penalty = reward * EARLY_PENALTY / 10000; reward -= penalty; _addReward(penalty); }
        totalStaked         -= s.amount;
        totalStakedWeighted -= weighted;
        uint256 amt = s.amount;
        delete stakes[msg.sender];
        require(IERC20(token).transfer(msg.sender, amt), "Token transfer failed");
        if (reward > 0) { (bool ok,) = payable(msg.sender).call{value: reward}(""); require(ok); }
        emit Unstaked(msg.sender, amt, reward, early);
    }

    function pendingReward(address user) external view returns (uint256) {
        Stake storage s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 weighted = s.amount * _multiplier(s.duration) / 10000;
        return (rewardPerTokenStored - s.rewardDebt) * weighted / 1e18 + s.pendingReward;
    }
}
