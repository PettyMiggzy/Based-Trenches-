// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Shared.sol";

contract ArmoryVault {
    address public token;
    address public creator;
    address public factory;
    bool    private initialized;

    uint256 public voteId;
    uint256 public totalETH;
    uint256 public totalBuyback;
    uint256 public totalLiquidity;

    struct Vote { uint256 start; uint256 end; uint256 buyVotes; uint256 sellVotes; uint256 totalSnap; bool executed; }
    mapping(uint256 => Vote) public votes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voteWeight;

    uint256 constant VOTE_DURATION = 7 days;
    uint256 constant QUORUM        = 300; // 3%

    event ETHReceived(uint256 amount, string reason);
    event VoteStarted(uint256 id, uint256 start, uint256 end);
    event Voted(address voter, uint256 voteId, uint8 choice, uint256 weight);
    event VoteExecuted(uint256 id, uint8 result, uint256 amount);

    receive() external payable { totalETH += msg.value; emit ETHReceived(msg.value, "received"); }

    function initialize(address _token, address _creator, address _factory) external {
        require(!initialized); initialized = true;
        token = _token; creator = _creator; factory = _factory;
    }

    function startVote() external {
        require(IERC20(token).balanceOf(msg.sender) > 0);
        uint256 snap = IERC20(token).totalSupply();
        require(voteId == 0 || votes[voteId].executed, "Active vote");
        voteId++;
        votes[voteId] = Vote(block.timestamp, block.timestamp + VOTE_DURATION, 0, 0, snap, false);
        emit VoteStarted(voteId, block.timestamp, block.timestamp + VOTE_DURATION);
    }

    function vote(uint8 choice) external {
        Vote storage v = votes[voteId];
        require(block.timestamp >= v.start && block.timestamp <= v.end, "Not active");
        require(!v.executed, "Executed");
        require(!hasVoted[voteId][msg.sender], "Already voted");
        uint256 w = IERC20(token).balanceOf(msg.sender);
        require(w > 0, "No tokens");
        hasVoted[voteId][msg.sender] = true;
        voteWeight[voteId][msg.sender] = w;
        if (choice == 1) v.buyVotes += w; else v.sellVotes += w;
        emit Voted(msg.sender, voteId, choice, w);
    }

    function executeVote() external {
        Vote storage v = votes[voteId];
        require(!v.executed, "Executed");
        require(block.timestamp > v.end || v.buyVotes + v.sellVotes >= v.totalSnap * QUORUM / 10000, "Not ready");
        v.executed = true;
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH");
        uint8 result = v.buyVotes >= v.sellVotes ? 1 : 2;
        if (result == 1) {
            totalBuyback += bal;
            // buyback logic here
        } else {
            totalLiquidity += bal;
        }
        emit VoteExecuted(voteId, result, bal);
    }
}
