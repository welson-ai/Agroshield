// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgroShieldPool
 * @dev Simple liquidity pool for AgroShield parametric crop insurance
 * Accepts cUSD deposits from liquidity providers and manages funds for policies
 */
contract AgroShieldPool is Ownable, ReentrancyGuard {
    IERC20 public immutable cusdToken;
    
    // Pool statistics
    uint256 public totalLiquidity;
    uint256 public totalReserve;
    uint256 public totalActivePayouts;
    
    // Liquidity provider tracking
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userShares;
    uint256 public totalShares;
    
    // Events
    event LiquidityProvided(address indexed provider, uint256 amount, uint256 shares);
    event LiquidityWithdrawn(address indexed provider, uint256 amount, uint256 shares);
    event PayoutProcessed(address indexed beneficiary, uint256 amount);
    
    constructor(address _cusdToken) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdToken);
    }
    
    /**
     * @dev Provide liquidity to the pool
     * @param _amount Amount of cUSD to deposit
     */
    function provideLiquidity(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer cUSD to this contract
        require(
            cusdToken.transferFrom(msg.sender, address(this), _amount),
            "cUSD transfer failed"
        );
        
        // Calculate shares (1:1 ratio for simplicity)
        uint256 shares = _amount;
        
        // Update state
        userDeposits[msg.sender] += _amount;
        userShares[msg.sender] += shares;
        totalLiquidity += _amount;
        totalShares += shares;
        
        emit LiquidityProvided(msg.sender, _amount, shares);
    }
    
    /**
     * @dev Withdraw liquidity from the pool
     * @param _shares Amount of shares to withdraw
     */
    function withdrawLiquidity(uint256 _shares) external nonReentrant {
        require(_shares > 0, "Shares must be greater than 0");
        require(userShares[msg.sender] >= _shares, "Insufficient shares");
        
        // Calculate amount to withdraw (1:1 ratio)
        uint256 withdrawAmount = _shares;
        
        // Ensure pool has enough liquidity
        require(
            totalLiquidity >= withdrawAmount + totalReserve + totalActivePayouts,
            "Insufficient pool liquidity"
        );
        
        // Update state
        userDeposits[msg.sender] -= withdrawAmount;
        userShares[msg.sender] -= _shares;
        totalLiquidity -= withdrawAmount;
        totalShares -= _shares;
        
        // Transfer cUSD back to user
        require(
            cusdToken.transfer(msg.sender, withdrawAmount),
            "cUSD transfer failed"
        );
        
        emit LiquidityWithdrawn(msg.sender, withdrawAmount, _shares);
    }
    
    /**
     * @dev Get user's current position
     * @param _user User address
     */
    function getUserPosition(address _user) external view returns (
        uint256 deposits,
        uint256 shares,
        uint256 sharePercentage
    ) {
        deposits = userDeposits[_user];
        shares = userShares[_user];
        sharePercentage = totalShares > 0 ? (shares * 10000) / totalShares : 0;
    }
    
    /**
     * @dev Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 liquidity,
        uint256 reserve,
        uint256 activePayouts,
        uint256 totalSharesCount,
        uint256 utilizationRate
    ) {
        liquidity = totalLiquidity;
        reserve = totalReserve;
        activePayouts = totalActivePayouts;
        totalSharesCount = totalShares;
        utilizationRate = totalLiquidity > 0 ? ((totalReserve + totalActivePayouts) * 10000) / totalLiquidity : 0;
    }
    
    /**
     * @dev Emergency function for owner to withdraw stuck tokens
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = cusdToken.balanceOf(address(this));
        if (balance > 0) {
            require(cusdToken.transfer(msg.sender, balance), "Transfer failed");
        }
    }
}
