// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgroShieldPool
 * @dev Liquidity pool for AgroShield parametric crop insurance
 * Accepts cUSD deposits from liquidity providers and manages funds for policies
 */
contract AgroShieldPool is Ownable, ReentrancyGuard {
    // cUSD token on Celo Alfajores testnet
    IERC20 public immutable cusdToken;
    
    // Pool statistics
    uint256 public totalLiquidity;
    uint256 public totalReserve;
    uint256 public totalActivePayouts;
    
    // Liquidity provider tracking
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userShares;
    uint256 public totalShares;
    
    // Policy tracking
    mapping(address => bool) public authorizedPolicies;
    
    // Constants
    uint256 public constant RESERVE_RATIO = 1000; // 10% reserve ratio (1000/10000)
    uint256 public constant BASIS_POINTS = 10000;
    
    event LiquidityProvided(address indexed provider, uint256 amount, uint256 shares);
    event LiquidityWithdrawn(address indexed provider, uint256 amount, uint256 shares);
    event PolicyAuthorized(address indexed policy);
    event PolicyDeauthorized(address indexed policy);
    event PayoutProcessed(address indexed policy, uint256 amount);
    event ReserveUpdated(uint256 newReserve);
    
    constructor(address _cusdToken) {
        cusdToken = IERC20(_cusdToken);
    }
    
    /**
     * @dev Provide liquidity to the pool
     * @param amount Amount of cUSD to deposit
     */
    function provideLiquidity(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        // Calculate shares based on current pool state
        uint256 shares;
        if (totalShares == 0) {
            shares = amount;
        } else {
            shares = (amount * totalShares) / totalLiquidity;
        }
        
        // Transfer cUSD from user to this contract
        require(
            cusdToken.transferFrom(msg.sender, address(this), amount),
            "cUSD transfer failed"
        );
        
        // Update user and pool state
        userDeposits[msg.sender] += amount;
        userShares[msg.sender] += shares;
        totalLiquidity += amount;
        totalShares += shares;
        
        // Update reserve
        _updateReserve();
        
        emit LiquidityProvided(msg.sender, amount, shares);
    }
    
    /**
     * @dev Withdraw liquidity from the pool
     * @param shares Amount of shares to withdraw
     */
    function withdrawLiquidity(uint256 shares) external nonReentrant {
        require(shares > 0, "Shares must be greater than 0");
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        
        // Calculate withdrawal amount based on share ratio
        uint256 withdrawalAmount = (shares * totalLiquidity) / totalShares;
        
        // Check if withdrawal would breach reserve ratio
        uint256 newLiquidity = totalLiquidity - withdrawalAmount;
        uint256 requiredReserve = (newLiquidity * RESERVE_RATIO) / BASIS_POINTS;
        require(
            totalReserve >= requiredReserve,
            "Withdrawal would breach reserve ratio"
        );
        
        // Update user and pool state
        userDeposits[msg.sender] -= withdrawalAmount;
        userShares[msg.sender] -= shares;
        totalLiquidity -= withdrawalAmount;
        totalShares -= shares;
        
        // Transfer cUSD to user
        require(
            cusdToken.transfer(msg.sender, withdrawalAmount),
            "cUSD transfer failed"
        );
        
        // Update reserve
        _updateReserve();
        
        emit LiquidityWithdrawn(msg.sender, withdrawalAmount, shares);
    }
    
    /**
     * @dev Authorize a policy contract to request payouts
     * @param policy Address of the policy contract
     */
    function authorizePolicy(address policy) external onlyOwner {
        authorizedPolicies[policy] = true;
        emit PolicyAuthorized(policy);
    }
    
    /**
     * @dev Deauthorize a policy contract
     * @param policy Address of the policy contract
     */
    function deauthorizePolicy(address policy) external onlyOwner {
        authorizedPolicies[policy] = false;
        emit PolicyDeauthorized(policy);
    }
    
    /**
     * @dev Process a payout from the pool (called by authorized policy)
     * @param amount Amount to payout
     */
    function processPayout(uint256 amount) external {
        require(authorizedPolicies[msg.sender], "Policy not authorized");
        require(amount > 0, "Amount must be greater than 0");
        require(totalLiquidity - totalReserve >= amount, "Insufficient available liquidity");
        
        totalActivePayouts += amount;
        totalLiquidity -= amount;
        
        // Update reserve after payout
        _updateReserve();
        
        // Transfer cUSD to policy contract
        require(
            cusdToken.transfer(msg.sender, amount),
            "cUSD transfer failed"
        );
        
        emit PayoutProcessed(msg.sender, amount);
    }
    
    /**
     * @dev Update the reserve based on current liquidity
     */
    function _updateReserve() internal {
        uint256 newReserve = (totalLiquidity * RESERVE_RATIO) / BASIS_POINTS;
        totalReserve = newReserve;
        emit ReserveUpdated(newReserve);
    }
    
    /**
     * @dev Get user's share of the pool
     * @param user Address of the user
     * @return shareAmount User's share amount in cUSD
     */
    function getUserShare(address user) external view returns (uint256 shareAmount) {
        if (totalShares == 0) return 0;
        shareAmount = (userShares[user] * totalLiquidity) / totalShares;
    }
    
    /**
     * @dev Get available liquidity for payouts
     * @return availableLiquidity Amount available for payouts
     */
    function getAvailableLiquidity() external view returns (uint256 availableLiquidity) {
        availableLiquidity = totalLiquidity - totalReserve;
    }
    
    /**
     * @dev Emergency function to recover tokens (owner only)
     * @param token Token address
     * @param amount Amount to recover
     */
    function emergencyRecover(address token, uint256 amount) external onlyOwner {
        require(token != address(cusdToken), "Cannot recover cUSD");
        IERC20(token).transfer(owner(), amount);
    }
}
