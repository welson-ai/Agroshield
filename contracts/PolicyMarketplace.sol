// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPolicy.sol";
import "./AgroShieldOracle.sol";

contract PolicyMarketplace is ReentrancyGuard, Ownable {
    IERC20 public cUSDToken;
    AgroShieldPolicy public policyContract;
    AgroShieldOracle public oracleContract;
    
    struct Listing {
        uint256 policyId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct Offer {
        uint256 listingId;
        address buyer;
        uint256 amount;
        bool isActive;
        uint256 createdAt;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(uint256 => uint256) public listingCounter;
    uint256 public totalListings;
    
    uint256 public marketplaceFee = 250; // 2.5% in basis points
    uint256 public constant MAX_FEE = 500; // 5% max fee
    
    event PolicyListed(
        uint256 indexed listingId,
        uint256 indexed policyId,
        address indexed seller,
        uint256 price,
        uint256 expiresAt
    );
    
    event PolicyDelisted(
        uint256 indexed listingId,
        uint256 indexed policyId,
        address indexed seller
    );
    
    event OfferMade(
        uint256 indexed listingId,
        uint256 indexed offerId,
        address indexed buyer,
        uint256 amount
    );
    
    event OfferAccepted(
        uint256 indexed listingId,
        uint256 indexed offerId,
        address indexed seller,
        address buyer,
        uint256 amount
    );
    
    event PolicyTransferred(
        uint256 indexed policyId,
        address indexed from,
        address indexed to,
        uint256 price
    );
    
    modifier onlyPolicyOwner(uint256 _policyId) {
        require(
            policyContract.getPolicy(_policyId).farmer == msg.sender,
            "Not the policy owner"
        );
        _;
    }
    
    modifier validListing(uint256 _listingId) {
        require(
            _listingId > 0 && _listingId <= totalListings,
            "Invalid listing ID"
        );
        require(listings[_listingId].isActive, "Listing not active");
        require(
            block.timestamp < listings[_listingId].expiresAt,
            "Listing expired"
        );
        _;
    }
    
    constructor(
        address _cUSDToken,
        address _policyContract,
        address _oracleContract
    ) {
        cUSDToken = IERC20(_cUSDToken);
        policyContract = AgroShieldPolicy(_policyContract);
        oracleContract = AgroShieldOracle(_oracleContract);
    }
    
    function listPolicy(
        uint256 _policyId,
        uint256 _price,
        uint256 _duration
    ) external onlyPolicyOwner(_policyId) nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        // Check policy is transferable
        AgroShieldPolicy.Policy memory policy = policyContract.getPolicy(_policyId);
        require(policy.isActive, "Policy must be active");
        require(!policy.payoutTriggered, "Policy already triggered");
        
        // Create listing
        uint256 listingId = ++totalListings;
        uint256 expiresAt = block.timestamp + _duration;
        
        listings[listingId] = Listing({
            policyId: _policyId,
            seller: msg.sender,
            price: _price,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt
        });
        
        listingCounter[_policyId] = listingId;
        
        emit PolicyListed(listingId, _policyId, msg.sender, _price, expiresAt);
    }
    
    function delistPolicy(uint256 _listingId) external nonReentrant {
        require(
            listings[_listingId].seller == msg.sender,
            "Not the listing owner"
        );
        require(listings[_listingId].isActive, "Listing not active");
        
        uint256 policyId = listings[_listingId].policyId;
        
        // Cancel all active offers
        Offer[] storage offerList = offers[_listingId];
        for (uint256 i = 0; i < offerList.length; i++) {
            if (offerList[i].isActive) {
                offerList[i].isActive = false;
                // Refund offer amount
                cUSDToken.transfer(offerList[i].buyer, offerList[i].amount);
            }
        }
        
        listings[_listingId].isActive = false;
        listingCounter[policyId] = 0;
        
        emit PolicyDelisted(_listingId, policyId, msg.sender);
    }
    
    function makeOffer(uint256 _listingId, uint256 _amount) external nonReentrant {
        _validListing(_listingId)();
        
        require(_amount >= listings[_listingId].price, "Amount below listing price");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer cUSD to marketplace
        require(
            cUSDToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Create offer
        Offer memory newOffer = Offer({
            listingId: _listingId,
            buyer: msg.sender,
            amount: _amount,
            isActive: true,
            createdAt: block.timestamp
        });
        
        offers[_listingId].push(newOffer);
        
        uint256 offerId = offers[_listingId].length - 1;
        
        emit OfferMade(_listingId, offerId, msg.sender, _amount);
    }
    
    function acceptOffer(uint256 _listingId, uint256 _offerId) external nonReentrant {
        _validListing(_listingId)();
        
        require(
            listings[_listingId].seller == msg.sender,
            "Not the listing owner"
        );
        
        require(_offerId < offers[_listingId].length, "Invalid offer ID");
        
        Offer storage offer = offers[_listingId][_offerId];
        require(offer.isActive, "Offer not active");
        
        // Calculate fees
        uint256 fee = (offer.amount * marketplaceFee) / 10000;
        uint256 sellerAmount = offer.amount - fee;
        
        // Deactivate listing and offer
        listings[_listingId].isActive = false;
        offer.isActive = false;
        
        // Refund other active offers
        Offer[] storage offerList = offers[_listingId];
        for (uint256 i = 0; i < offerList.length; i++) {
            if (offerList[i].isActive && i != _offerId) {
                offerList[i].isActive = false;
                cUSDToken.transfer(offerList[i].buyer, offerList[i].amount);
            }
        }
        
        // Transfer policy ownership
        uint256 policyId = listings[_listingId].policyId;
        policyContract.transferPolicy(policyId, offer.buyer);
        
        // Transfer funds to seller
        cUSDToken.transfer(listings[_listingId].seller, sellerAmount);
        
        // Transfer fee to owner
        if (fee > 0) {
            cUSDToken.transfer(owner(), fee);
        }
        
        emit OfferAccepted(_listingId, _offerId, msg.sender, offer.buyer, offer.amount);
        emit PolicyTransferred(policyId, msg.sender, offer.buyer, offer.amount);
    }
    
    function buyPolicy(uint256 _listingId) external nonReentrant {
        _validListing(_listingId)();
        
        Listing storage listing = listings[_listingId];
        uint256 price = listing.price;
        
        // Calculate fees
        uint256 fee = (price * marketplaceFee) / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer cUSD from buyer
        require(
            cUSDToken.transferFrom(msg.sender, address(this), price),
            "Transfer failed"
        );
        
        // Deactivate listing
        listing.isActive = false;
        
        // Refund all active offers
        Offer[] storage offerList = offers[_listingId];
        for (uint256 i = 0; i < offerList.length; i++) {
            if (offerList[i].isActive) {
                offerList[i].isActive = false;
                cUSDToken.transfer(offerList[i].buyer, offerList[i].amount);
            }
        }
        
        // Transfer policy ownership
        policyContract.transferPolicy(listing.policyId, msg.sender);
        
        // Transfer funds to seller
        cUSDToken.transfer(listing.seller, sellerAmount);
        
        // Transfer fee to owner
        if (fee > 0) {
            cUSDToken.transfer(owner(), fee);
        }
        
        emit PolicyTransferred(listing.policyId, listing.seller, msg.sender, price);
    }
    
    function withdrawOffer(uint256 _listingId, uint256 _offerId) external nonReentrant {
        require(_offerId < offers[_listingId].length, "Invalid offer ID");
        
        Offer storage offer = offers[_listingId][_offerId];
        require(offer.buyer == msg.sender, "Not the offer owner");
        require(offer.isActive, "Offer not active");
        
        offer.isActive = false;
        
        // Refund offer amount
        cUSDToken.transfer(msg.sender, offer.amount);
    }
    
    function getListing(uint256 _listingId) external view returns (Listing memory) {
        require(
            _listingId > 0 && _listingId <= totalListings,
            "Invalid listing ID"
        );
        return listings[_listingId];
    }
    
    function getOffer(uint256 _listingId, uint256 _offerId) external view returns (Offer memory) {
        require(_offerId < offers[_listingId].length, "Invalid offer ID");
        return offers[_listingId][_offerId];
    }
    
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expiresAt) {
                activeCount++;
            }
        }
        
        uint256[] memory activeListingIds = new uint256[](activeCount);
        uint256 index = 0;
        
        // Populate active listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expiresAt) {
                activeListingIds[index] = i;
                index++;
            }
        }
        
        return activeListingIds;
    }
    
    function getListingsBySeller(address _seller) external view returns (uint256[] memory) {
        uint256 sellerCount = 0;
        
        // Count seller's listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].seller == _seller) {
                sellerCount++;
            }
        }
        
        uint256[] memory sellerListingIds = new uint256[](sellerCount);
        uint256 index = 0;
        
        // Populate seller's listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].seller == _seller) {
                sellerListingIds[index] = i;
                index++;
            }
        }
        
        return sellerListingIds;
    }
    
    function getOffersByListing(uint256 _listingId) external view returns (Offer[] memory) {
        return offers[_listingId];
    }
    
    function setMarketplaceFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE, "Fee exceeds maximum");
        marketplaceFee = _newFee;
    }
    
    function emergencyPause() external onlyOwner {
        // Deactivate all listings
        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isActive) {
                listings[i].isActive = false;
                
                // Refund all active offers
                Offer[] storage offerList = offers[i];
                for (uint256 j = 0; j < offerList.length; j++) {
                    if (offerList[j].isActive) {
                        offerList[j].isActive = false;
                        cUSDToken.transfer(offerList[j].buyer, offerList[j].amount);
                    }
                }
            }
        }
    }
}
