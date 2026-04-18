import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { deployContracts, getTestUsers, setupUsersWithTokens, DEFAULT_POLICY_PARAMS, DEFAULT_ORACLE_DATA } from "./helpers";

describe("PolicyMarketplace", function () {
  let contracts: any;
  let users: any;
  let marketplace: any;

  beforeEach(async function () {
    contracts = await deployContracts();
    users = await getTestUsers();
    await setupUsersWithTokens(users, contracts);
    
    // Deploy marketplace
    const PolicyMarketplace = await ethers.getContractFactory("PolicyMarketplace");
    marketplace = await PolicyMarketplace.deploy(
      contracts.cUSDToken.address,
      contracts.agroShieldPolicy.address,
      contracts.agroShieldOracle.address
    );
    await marketplace.deployed();
    
    // Approve marketplace to spend tokens
    await contracts.cUSDToken.connect(users.farmer1).approve(marketplace.address, ethers.utils.parseEther("10000"));
    await contracts.cUSDToken.connect(users.farmer2).approve(marketplace.address, ethers.utils.parseEther("10000"));
    await contracts.cUSDToken.connect(users.investor1).approve(marketplace.address, ethers.utils.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await marketplace.owner()).to.equal(users.owner.address);
    });

    it("Should set correct contract addresses", async function () {
      expect(await marketplace.cUSDToken()).to.equal(contracts.cUSDToken.address);
      expect(await marketplace.policyContract()).to.equal(contracts.agroShieldPolicy.address);
      expect(await marketplace.oracleContract()).to.equal(contracts.agroShieldOracle.address);
    });

    it("Should initialize with zero listings", async function () {
      expect(await marketplace.totalListings()).to.equal(0);
    });

    it("Should set default marketplace fee", async function () {
      expect(await marketplace.marketplaceFee()).to.equal(250); // 2.5%
    });
  });

  describe("Policy Listing", function () {
    beforeEach(async function () {
      // Create a policy for listing
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Listable policy"
      );
    });

    it("Should allow policy owner to list policy", async function () {
      const price = ethers.utils.parseEther("1200");
      const duration = 7 * 24 * 60 * 60; // 7 days
      
      await expect(marketplace.connect(users.farmer1).listPolicy(1, price, duration))
        .to.emit(marketplace, "PolicyListed")
        .withArgs(1, 1, users.farmer1.address, price, anyValue);
      
      expect(await marketplace.totalListings()).to.equal(1);
      
      const listing = await marketplace.getListing(1);
      expect(listing.policyId).to.equal(1);
      expect(listing.seller).to.equal(users.farmer1.address);
      expect(listing.price).to.equal(price);
      expect(listing.isActive).to.be.true;
      expect(listing.expiresAt).to.be.gt(block.timestamp);
    });

    it("Should reject listing from non-owner", async function () {
      const price = ethers.utils.parseEther("1200");
      const duration = 7 * 24 * 60 * 60;
      
      await expect(marketplace.connect(users.farmer2).listPolicy(1, price, duration))
        .to.be.revertedWith("Not the policy owner");
    });

    it("Should reject invalid price", async function () {
      const duration = 7 * 24 * 60 * 60;
      
      await expect(marketplace.connect(users.farmer1).listPolicy(1, 0, duration))
        .to.be.revertedWith("Price must be greater than 0");
    });

    it("Should reject invalid duration", async function () {
      const price = ethers.utils.parseEther("1200");
      
      await expect(marketplace.connect(users.farmer1).listPolicy(1, price, 0))
        .to.be.revertedWith("Duration must be greater than 0");
    });

    it("Should reject listing inactive policy", async function () {
      // Deactivate policy
      await contracts.agroShieldPolicy.connect(users.owner).deactivatePolicy(1);
      
      const price = ethers.utils.parseEther("1200");
      const duration = 7 * 24 * 60 * 60;
      
      await expect(marketplace.connect(users.farmer1).listPolicy(1, price, duration))
        .to.be.revertedWith("Policy must be active");
    });

    it("Should reject listing triggered policy", async function () {
      // Pay premium and trigger payout
      await contracts.agroShieldPool.connect(users.investor1).deposit(ethers.utils.parseEther("5000"));
      await contracts.agroShieldPolicy.connect(users.farmer1).payPremium(1, { value: ethers.utils.parseEther("100") });
      
      await contracts.agroShieldOracle.connect(users.oracle).submitWeatherData(
        DEFAULT_POLICY_PARAMS.location,
        DEFAULT_ORACLE_DATA.timestamp,
        "75",
        DEFAULT_ORACLE_DATA.temperature,
        DEFAULT_ORACLE_DATA.humidity
      );
      
      await contracts.agroShieldOracle.connect(users.oracle).triggerPolicyPayout(1);
      
      const price = ethers.utils.parseEther("1200");
      const duration = 7 * 24 * 60 * 60;
      
      await expect(marketplace.connect(users.farmer1).listPolicy(1, price, duration))
        .to.be.revertedWith("Policy already triggered");
    });
  });

  describe("Policy Delisting", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Delistable policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
    });

    it("Should allow seller to delist policy", async function () {
      await expect(marketplace.connect(users.farmer1).delistPolicy(1))
        .to.emit(marketplace, "PolicyDelisted")
        .withArgs(1, 1, users.farmer1.address);
      
      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should reject delisting from non-seller", async function () {
      await expect(marketplace.connect(users.farmer2).delistPolicy(1))
        .to.be.revertedWith("Not the listing owner");
    });

    it("Should reject delisting inactive listing", async function () {
      await marketplace.connect(users.farmer1).delistPolicy(1);
      
      await expect(marketplace.connect(users.farmer1).delistPolicy(1))
        .to.be.revertedWith("Listing not active");
    });
  });

  describe("Offer Making", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Offerable policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
    });

    it("Should allow buyers to make offers", async function () {
      const offerAmount = ethers.utils.parseEther("1300");
      
      await expect(marketplace.connect(users.farmer2).makeOffer(1, offerAmount))
        .to.emit(marketplace, "OfferMade")
        .withArgs(1, 0, users.farmer2.address, offerAmount);
      
      const offers = await marketplace.getOffersByListing(1);
      expect(offers.length).to.equal(1);
      expect(offers[0].buyer).to.equal(users.farmer2.address);
      expect(offers[0].amount).to.equal(offerAmount);
      expect(offers[0].isActive).to.be.true;
    });

    it("Should reject offers below listing price", async function () {
      const offerAmount = ethers.utils.parseEther("1100"); // Below 1200
      
      await expect(marketplace.connect(users.farmer2).makeOffer(1, offerAmount))
        .to.be.revertedWith("Amount below listing price");
    });

    it("Should reject offers on inactive listing", async function () {
      await marketplace.connect(users.farmer1).delistPolicy(1);
      
      await expect(marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1300")))
        .to.be.revertedWith("Listing not active");
    });

    it("Should reject offers on expired listing", async function () {
      // Advance time beyond expiration
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
      await ethers.provider.send("evm_mine", []);
      
      await expect(marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1300")))
        .to.be.revertedWith("Listing expired");
    });
  });

  describe("Offer Acceptance", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Acceptable policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
      
      // Make an offer
      await marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1300"));
    });

    it("Should allow seller to accept offers", async function () {
      const initialSellerBalance = await contracts.cUSDToken.balanceOf(users.farmer1.address);
      const initialBuyerBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      const initialOwnerBalance = await contracts.cUSDToken.balanceOf(users.owner.address);
      
      await expect(marketplace.connect(users.farmer1).acceptOffer(1, 0))
        .to.emit(marketplace, "OfferAccepted")
        .withArgs(1, 0, users.farmer1.address, users.farmer2.address, ethers.utils.parseEther("1300"))
        .and.to.emit(marketplace, "PolicyTransferred")
        .withArgs(1, users.farmer1.address, users.farmer2.address, ethers.utils.parseEther("1300"));
      
      // Check fee calculation (2.5% of 1300 = 32.5)
      const expectedFee = ethers.utils.parseEther("1300").mul(250).div(10000);
      const expectedSellerAmount = ethers.utils.parseEther("1300").sub(expectedFee);
      
      // Verify balances
      const finalSellerBalance = await contracts.cUSDToken.balanceOf(users.farmer1.address);
      const finalBuyerBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      const finalOwnerBalance = await contracts.cUSDToken.balanceOf(users.owner.address);
      
      expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(expectedSellerAmount);
      expect(initialBuyerBalance.sub(finalBuyerBalance)).to.equal(ethers.utils.parseEther("1300"));
      expect(finalOwnerBalance.sub(initialOwnerBalance)).to.equal(expectedFee);
      
      // Verify policy transfer
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(users.farmer2.address);
      
      // Verify listing is inactive
      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should reject offer acceptance from non-seller", async function () {
      await expect(marketplace.connect(users.farmer2).acceptOffer(1, 0))
        .to.be.revertedWith("Not the listing owner");
    });

    it("Should reject accepting inactive offers", async function () {
      // Withdraw offer first
      await marketplace.connect(users.farmer2).withdrawOffer(1, 0);
      
      await expect(marketplace.connect(users.farmer1).acceptOffer(1, 0))
        .to.be.revertedWith("Offer not active");
    });
  });

  describe("Buy Now Functionality", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Buyable policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
    });

    it("Should allow instant purchase at listing price", async function () {
      const initialSellerBalance = await contracts.cUSDToken.balanceOf(users.farmer1.address);
      const initialBuyerBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      
      await expect(marketplace.connect(users.farmer2).buyPolicy(1))
        .to.emit(marketplace, "PolicyTransferred")
        .withArgs(1, users.farmer1.address, users.farmer2.address, ethers.utils.parseEther("1200"));
      
      // Check fee calculation (2.5% of 1200 = 30)
      const expectedFee = ethers.utils.parseEther("1200").mul(250).div(10000);
      const expectedSellerAmount = ethers.utils.parseEther("1200").sub(expectedFee);
      
      // Verify balances
      const finalSellerBalance = await contracts.cUSDToken.balanceOf(users.farmer1.address);
      const finalBuyerBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      
      expect(finalSellerBalance.sub(initialSellerBalance)).to.equal(expectedSellerAmount);
      expect(initialBuyerBalance.sub(finalBuyerBalance)).to.equal(ethers.utils.parseEther("1200"));
      
      // Verify policy transfer
      const policy = await contracts.agroShieldPolicy.getPolicy(1);
      expect(policy.farmer).to.equal(users.farmer2.address);
      
      // Verify listing is inactive
      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });

    it("Should reject buying inactive listings", async function () {
      await marketplace.connect(users.farmer1).delistPolicy(1);
      
      await expect(marketplace.connect(users.farmer2).buyPolicy(1))
        .to.be.revertedWith("Listing not active");
    });
  });

  describe("Offer Withdrawal", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Withdrawable policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
      
      // Make an offer
      await marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1300"));
    });

    it("Should allow offer withdrawal", async function () {
      const initialBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      
      await marketplace.connect(users.farmer2).withdrawOffer(1, 0);
      
      const finalBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("1300"));
      
      const offers = await marketplace.getOffersByListing(1);
      expect(offers[0].isActive).to.be.false;
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(marketplace.connect(users.farmer1).withdrawOffer(1, 0))
        .to.be.revertedWith("Not the offer owner");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Create multiple policies and listings
      for (let i = 0; i < 3; i++) {
        await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
          DEFAULT_POLICY_PARAMS.coverageAmount,
          DEFAULT_POLICY_PARAMS.rainfallThreshold,
          DEFAULT_POLICY_PARAMS.measurementPeriod,
          `${DEFAULT_POLICY_PARAMS.location},${i}`,
          `Query test policy ${i}`
        );
        
        await marketplace.connect(users.farmer1).listPolicy(
          i + 1,
          ethers.utils.parseEther("1000").add(ethers.utils.parseEther(i.toString())),
          7 * 24 * 60 * 60
        );
      }
    });

    it("Should return active listings", async function () {
      const activeListings = await marketplace.getActiveListings();
      expect(activeListings.length).to.equal(3);
      
      for (let i = 0; i < activeListings.length; i++) {
        const listing = await marketplace.getListing(activeListings[i]);
        expect(listing.isActive).to.be.true;
      }
    });

    it("Should return listings by seller", async function () {
      const sellerListings = await marketplace.getListingsBySeller(users.farmer1.address);
      expect(sellerListings.length).to.equal(3);
      
      for (let i = 0; i < sellerListings.length; i++) {
        const listing = await marketplace.getListing(sellerListings[i]);
        expect(listing.seller).to.equal(users.farmer1.address);
      }
    });

    it("Should return offers by listing", async function () {
      // Make offers on first listing
      await marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1100"));
      await marketplace.connect(users.investor1).makeOffer(1, ethers.utils.parseEther("1200"));
      
      const offers = await marketplace.getOffersByListing(1);
      expect(offers.length).to.equal(2);
      expect(offers[0].buyer).to.equal(users.farmer2.address);
      expect(offers[1].buyer).to.equal(users.investor1.address);
    });
  });

  describe("Marketplace Fee Management", function () {
    it("Should allow owner to set marketplace fee", async function () {
      await expect(marketplace.connect(users.owner).setMarketplaceFee(500))
        .to.emit(marketplace, "MarketplaceFeeUpdated")
        .withArgs(500);
      
      expect(await marketplace.marketplaceFee()).to.equal(500);
    });

    it("Should reject fee setting from non-owner", async function () {
      await expect(marketplace.connect(users.farmer1).setMarketplaceFee(300))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject fee exceeding maximum", async function () {
      await expect(marketplace.connect(users.owner).setMarketplaceFee(600))
        .to.be.revertedWith("Fee exceeds maximum");
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      // Create and list a policy
      await contracts.agroShieldPolicy.connect(users.farmer1).createPolicy(
        DEFAULT_POLICY_PARAMS.coverageAmount,
        DEFAULT_POLICY_PARAMS.rainfallThreshold,
        DEFAULT_POLICY_PARAMS.measurementPeriod,
        DEFAULT_POLICY_PARAMS.location,
        "Emergency test policy"
      );
      
      await marketplace.connect(users.farmer1).listPolicy(
        1,
        ethers.utils.parseEther("1200"),
        7 * 24 * 60 * 60
      );
      
      // Make an offer
      await marketplace.connect(users.farmer2).makeOffer(1, ethers.utils.parseEther("1300"));
    });

    it("Should allow owner to emergency pause", async function () {
      const initialBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      
      await marketplace.connect(users.owner).emergencyPause();
      
      // All listings should be inactive
      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
      
      // Offers should be refunded
      const finalBalance = await contracts.cUSDToken.balanceOf(users.farmer2.address);
      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther("1300"));
      
      const offers = await marketplace.getOffersByListing(1);
      expect(offers[0].isActive).to.be.false;
    });

    it("Should reject emergency pause from non-owner", async function () {
      await expect(marketplace.connect(users.farmer1).emergencyPause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
