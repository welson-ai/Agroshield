// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Solmate
 * @notice AI-powered DeFi yield optimization vault for Celo
 * @dev Users deposit tokens, AI agent optimizes yield strategies
 */
contract Solmate is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Vault token (e.g., cUSD, CELO)
    IERC20 public immutable depositToken;

    // User deposits
    mapping(address => uint256) public deposits;
    
    // Total deposits in vault
    uint256 public totalDeposits;

    // AI agent address (can execute strategies)
    address public aiAgent;

    // Yield earned (for tracking)
    uint256 public totalYieldEarned;

    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldHarvested(uint256 amount);
    event AIAgentUpdated(address indexed oldAgent, address indexed newAgent);
    event StrategyExecuted(string strategyId, uint256 amount);

    modifier onlyAIAgent() {
        require(msg.sender == aiAgent || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _depositToken, address _aiAgent) Ownable(msg.sender) {
        require(_depositToken != address(0), "Invalid token");
        depositToken = IERC20(_depositToken);
        aiAgent = _aiAgent;
    }

    /**
     * @notice Deposit tokens into the vault
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Withdraw tokens from the vault
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(deposits[msg.sender] >= amount, "Insufficient balance");

        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        depositToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Execute a yield strategy (AI agent only)
     * @param strategyId Identifier for the strategy
     * @param amount Amount to allocate
     * @param target Target protocol address
     * @param data Encoded function call
     */
    function executeStrategy(
        string calldata strategyId,
        uint256 amount,
        address target,
        bytes calldata data
    ) external onlyAIAgent nonReentrant returns (bytes memory) {
        require(target != address(0), "Invalid target");
        require(amount <= depositToken.balanceOf(address(this)), "Insufficient funds");

        // Approve target if needed
        if (amount > 0) {
            depositToken.forceApprove(target, amount);
        }

        // Execute strategy
        (bool success, bytes memory result) = target.call(data);
        require(success, "Strategy execution failed");

        emit StrategyExecuted(strategyId, amount);
        return result;
    }

    /**
     * @notice Record harvested yield
     * @param amount Yield amount harvested
     */
    function recordYield(uint256 amount) external onlyAIAgent {
        totalYieldEarned += amount;
        emit YieldHarvested(amount);
    }

    /**
     * @notice Update AI agent address
     * @param newAgent New agent address
     */
    function setAIAgent(address newAgent) external onlyOwner {
        address oldAgent = aiAgent;
        aiAgent = newAgent;
        emit AIAgentUpdated(oldAgent, newAgent);
    }

    /**
     * @notice Get user's share of the vault
     * @param user User address
     */
    function getUserShare(address user) external view returns (uint256) {
        if (totalDeposits == 0) return 0;
        return (deposits[user] * 1e18) / totalDeposits;
    }

    /**
     * @notice Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
