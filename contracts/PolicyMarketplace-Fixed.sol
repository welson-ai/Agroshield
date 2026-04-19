// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPolicy.sol";
import "./AgroShieldOracle.sol";

contract PolicyMarketplace is ReentrancyGuard, Ownable {
    IERC20 public immutable cusdToken;
    AgroShieldPolicy public policyContract;
    AgroShieldOracle public oracleContract;
    
    constructor(address _cusdToken, address _policyContract, address _oracle) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdToken);
        policyContract = AgroShieldPolicy(_policyContract);
        oracleContract = AgroShieldOracle(_oracle);
    }
    
    struct Listing {
        uint256 policyId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    uint256 public listingCounter;
    
    event PolicyListed(
        uint256 indexed listingId,
        uint256 indexed policyId,
        address indexed seller,
        uint256 price
    );
    
    event PolicySold(
        uint256 indexed listingId,
        uint256 indexed policyId,
        address indexed seller,
        address buyer,
        uint256 price
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        uint256 indexed policyId,
        address indexed seller
    );
    
    function listPolicy(
        uint256 _policyId,
        uint256 _price,
        uint256 _duration
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // Verify policy exists and is owned by seller
        (, address farmer,,,,,,,) = policyContract.getPolicy(_policyId);
        require(farmer == msg.sender, "Not policy owner");
        
        // Create listing
        listings[listingCounter] = Listing({
            policyId: _policyId,
            seller: msg.sender,
            price: _price,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + _duration
        });
        
        userListings[msg.sender].push(listingCounter);
        
        emit PolicyListed(listingCounter, _policyId, msg.sender, _price);
        
        listingCounter++;
    }
    
    function buyPolicy(uint256 _listingId) external nonReentrant {
        require(listings[_listingId].isActive, "Listing not active");
        require(block.timestamp < listings[_listingId].expiresAt, "Listing expired");
        require(msg.sender != listings[_listingId].seller, "Cannot buy own policy");
        
        Listing storage listing = listings[_listingId];
        
        // Check buyer has sufficient cUSD balance
        require(
            cusdToken.balanceOf(msg.sender) >= listing.price,
            "Insufficient cUSD balance"
        );
        
        // Transfer cUSD from buyer to seller
        require(
            cusdToken.transferFrom(msg.sender, listing.seller, listing.price),
            "Payment transfer failed"
        );
        
        // Transfer policy ownership
        policyContract.transferPolicy(listing.policyId, msg.sender);
        
        // Deactivate listing
        listing.isActive = false;
        
        emit PolicySold(_listingId, listing.policyId, listing.seller, msg.sender, listing.price);
    }
    
    function cancelListing(uint256 _listingId) external nonReentrant {
        require(listings[_listingId].seller == msg.sender, "Not listing owner");
        require(listings[_listingId].isActive, "Listing already cancelled");
        
        // Deactivate listing
        listings[_listingId].isActive = false;
        
        emit ListingCancelled(_listingId, listings[_listingId].policyId, msg.sender);
    }
    
    function getListing(uint256 _listingId) external view returns (Listing memory) {
        return listings[_listingId];
    }
    
    function getUserListings(address _user) external view returns (uint256[] memory) {
        return userListings[_user];
    }
    
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](listingCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expiresAt) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(activeListings, count)
        }
        
        return activeListings;
    }
    
    function extendListing(uint256 _listingId, uint256 _additionalDuration) external nonReentrant {
        require(listings[_listingId].seller == msg.sender, "Not listing owner");
        require(listings[_listingId].isActive, "Listing not active");
        require(_additionalDuration > 0, "Duration must be greater than 0");
        
        listings[_listingId].expiresAt += _additionalDuration;
    }
    
    function updatePrice(uint256 _listingId, uint256 _newPrice) external nonReentrant {
        require(listings[_listingId].seller == msg.sender, "Not listing owner");
        require(listings[_listingId].isActive, "Listing not active");
        require(_newPrice > 0, "Price must be greater than 0");
        
        listings[_listingId].price = _newPrice;
    }
}
