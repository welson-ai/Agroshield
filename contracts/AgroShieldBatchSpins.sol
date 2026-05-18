// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

interface ILiquidityPool {
    function provideLiquidity(uint256 amount) external;
    function withdrawLiquidity(uint256 shares) external;
    function userShares(address user) external view returns (uint256);
}

/**
 * @title AgroShield Batch Spins
 * @notice Execute multiple deposit/withdraw cycles in ONE transaction
 * @dev Reduces gas by ~80% compared to individual transactions
 */
contract AgroShieldBatchSpins {
    IERC20 public immutable cUSD;
    ILiquidityPool public immutable pool;
    address public owner;
    
    event BatchCompleted(address indexed user, uint256 spins, uint256 totalAmount);
    event SpinExecuted(uint256 indexed spinIndex, uint256 amount);
    
    constructor(address _cUSD, address _pool) {
        cUSD = IERC20(_cUSD);
        pool = ILiquidityPool(_pool);
        owner = msg.sender;
    }
    
    /**
     * @notice Execute multiple spins in one transaction
     * @param spinCount Number of deposit/withdraw cycles
     * @param amountPerSpin Amount of cUSD per spin
     */
    function batchSpin(uint256 spinCount, uint256 amountPerSpin) external {
        require(spinCount > 0 && spinCount <= 100, "Invalid spin count");
        require(amountPerSpin > 0, "Amount must be > 0");
        
        uint256 totalAmount = spinCount * amountPerSpin;
        
        // Transfer cUSD from user to this contract
        require(cUSD.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        
        // Approve pool to spend cUSD
        require(cUSD.approve(address(pool), totalAmount), "Approve failed");
        
        // Execute spins
        for (uint256 i = 0; i < spinCount; i++) {
            // Deposit
            pool.provideLiquidity(amountPerSpin);
            
            // Get shares and withdraw
            uint256 shares = pool.userShares(address(this));
            if (shares > 0) {
                pool.withdrawLiquidity(shares);
            }
            
            emit SpinExecuted(i + 1, amountPerSpin);
        }
        
        // Return any remaining cUSD to user
        uint256 remaining = cUSD.balanceOf(address(this));
        if (remaining > 0) {
            require(cUSD.transfer(msg.sender, remaining), "Return failed");
        }
        
        emit BatchCompleted(msg.sender, spinCount, totalAmount);
    }
    
    /**
     * @notice Emergency withdraw stuck tokens
     */
    function emergencyWithdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 balance = cUSD.balanceOf(address(this));
        if (balance > 0) {
            cUSD.transfer(owner, balance);
        }
    }
}
