import { expect } from "chai";
import { ethers } from "hardhat";
import { PolicyMarketplace } from "../../typechain-types";

describe("PolicyMarketplace-Enhanced", function () {
  let marketplace: PolicyMarketplace;
  let policyContract: any;
  let cusdToken: any;
  let owner: any;
  let seller: any;
  let buyer: any;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    cusdToken = await MockERC20.deploy("cUSD", "cUSD", 18, ethers.utils.parseEther("10000"));
    await cusdToken.deployed();

    // Deploy mock policy contract
    const MockPolicy = await ethers.getContractFactory("MockPolicy");
    policyContract = await MockPolicy.deploy();
    await policyContract.deployed();

    // Deploy PolicyMarketplace
    const PolicyMarketplaceFactory = await ethers.getContractFactory("PolicyMarketplace");
    marketplace = await PolicyMarketplaceFactory.deploy(cusdToken.address, policyContract.address);
    await marketplace.deployed();

    // Mint tokens to users
    await cusdToken.mint(seller.address, ethers.utils.parseEther("1000"));
    await cusdToken.mint(buyer.address, ethers.utils.parseEther("1000"));
  });

  describe("Advanced Listing Features", function () {
    const policyId = 1;
    const price = ethers.utils.parseEther("100");
    const duration = 7 * 24 * 60 * 60;

    beforeEach(async function () {
      await policyContract.connect(seller).mintPolicy(seller.address, policyId);
    });

    it("Should support batch listing creation", async function () {
      const policies = [1, 2, 3];
      const prices = [100, 150, 200].map(p => ethers.utils.parseEther(p.toString()));
      
      // Mint additional policies
      await policyContract.connect(seller).mintPolicy(seller.address, 2);
      await policyContract.connect(seller).mintPolicy(seller.address, 3);
      
      // Approve total amount
      const totalPrice = prices.reduce((sum, price) => sum.add(price), ethers.BigNumber.from(0));
      await cusdToken.connect(seller).approve(marketplace.address, totalPrice);
      
      const tx = await marketplace.connect(seller).batchListPolicies(policies, prices, duration);
      const receipt = await tx.wait();
      
      expect(receipt.events).to.have.length(3);
      expect(receipt.events[0].event).to.equal("PolicyListed");
    });

    it("Should support featured listings", async function () {
      await cusdToken.connect(seller).approve(marketplace.address, price);
      await marketplace.connect(seller).listPolicy(policyId, price, duration);
      
      await marketplace.connect(seller).setFeaturedListing(1, true);
      
      const listing = await marketplace.getListing(1);
      expect(listing.isFeatured).to.be.true;
    });

    it("Should support listing categories", async function () {
      const category = "Agriculture";
      
      await cusdToken.connect(seller).approve(marketplace.address, price);
      await marketplace.connect(seller).listPolicyWithCategory(policyId, price, duration, category);
      
      const listing = await marketplace.getListing(1);
      expect(listing.category).to.equal(category);
    });

    it("Should support listing descriptions", async function () {
      const description = "High-quality wheat insurance policy";
      
      await cusdToken.connect(seller).approve(marketplace.address, price);
      await marketplace.connect(seller).listPolicyWithDescription(policyId, price, duration, description);
      
      const listing = await marketplace.getListing(1);
      expect(listing.description).to.equal(description);
    });
  });

  describe("Advanced Purchase Features", function () {
    const policyId = 1;
    const price = ethers.utils.parseEther("100");
    const duration = 7 * 24 * 60 * 60;

    beforeEach(async function () {
      await policyContract.connect(seller).mintPolicy(seller.address, policyId);
      await cusdToken.connect(seller).approve(marketplace.address, price);
      await marketplace.connect(seller).listPolicy(policyId, price, duration);
      await cusdToken.connect(buyer).approve(marketplace.address, price);
    });

    it("Should support purchase with escrow", async function () {
      const tx = await marketplace.connect(buyer).buyPolicyWithEscrow(1);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("PolicyPurchased");
      expect(receipt.events[1].event).to.equal("EscrowCreated");
    });

    it("Should support purchase with installment payments", async function () {
      const installments = 3;
      const installmentAmount = price.div(installments);
      
      await cusdToken.connect(buyer).approve(marketplace.address, price);
      
      const tx = await marketplace.connect(buyer).buyPolicyWithInstallments(1, installments);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("InstallmentPlanCreated");
      expect(receipt.events[0].args.installments).to.equal(installments);
    });

    it("Should support purchase with insurance", async function () {
      const insuranceAmount = ethers.utils.parseEther("10");
      
      await cusdToken.connect(buyer).approve(marketplace.address, price.add(insuranceAmount));
      
      const tx = await marketplace.connect(buyer).buyPolicyWithInsurance(1, insuranceAmount);
      const receipt = await tx.wait();
      
      expect(receipt.events[0].event).to.equal("PolicyPurchasedWithInsurance");
    });
  });

  describe("Search and Filtering", function () {
    beforeEach(async function () {
      // Create multiple listings with different attributes
      const listings = [
        { id: 1, price: 100, category: "Agriculture", featured: true },
        { id: 2, price: 150, category: "Livestock", featured: false },
        { id: 3, price: 200, category: "Agriculture", featured: false },
        { id: 4, price: 80, category: "Fisheries", featured: true }
      ];
      
      for (const listing of listings) {
        await policyContract.connect(seller).mintPolicy(seller.address, listing.id);
        await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther(listing.price.toString()));
        await marketplace.connect(seller).listPolicy(listing.id, ethers.utils.parseEther(listing.price.toString()), 7 * 24 * 60 * 60);
        await marketplace.connect(seller).setListingCategory(listing.id, listing.category);
        if (listing.featured) {
          await marketplace.connect(seller).setFeaturedListing(listing.id, true);
        }
      }
    });

    it("Should search listings by category", async function () {
      const agricultureListings = await marketplace.searchListingsByCategory("Agriculture");
      expect(agricultureListings).to.have.length(2);
    });

    it("Should search listings by price range", async function () {
      const priceRangeListings = await marketplace.searchListingsByPriceRange(
        ethers.utils.parseEther("90"),
        ethers.utils.parseEther("160")
      );
      expect(priceRangeListings).to.have.length(2);
    });

    it("Should get featured listings only", async function () {
      const featuredListings = await marketplace.getFeaturedListings();
      expect(featuredListings).to.have.length(2);
    });

    it("Should sort listings by price", async function () {
      const sortedListings = await marketplace.getSortedListings("price", "asc");
      const prices = sortedListings.map(listing => listing.price);
      
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i-1]).to.be.lte(prices[i]);
      }
    });

    it("Should sort listings by creation date", async function () {
      const sortedListings = await marketplace.getSortedListings("createdAt", "desc");
      const dates = sortedListings.map(listing => listing.createdAt);
      
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i-1]).to.be.gte(dates[i]);
      }
    });
  });

  describe("Reputation System", function () {
    beforeEach(async function () {
      await policyContract.connect(seller).mintPolicy(seller.address, 1);
      await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
      await marketplace.connect(seller).listPolicy(1, ethers.utils.parseEther("100"), 7 * 24 * 60 * 60);
      await cusdToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("100"));
      await marketplace.connect(buyer).buyPolicy(1);
    });

    it("Should track seller reputation", async function () {
      const reputation = await marketplace.getSellerReputation(seller.address);
      expect(reputation.totalSales).to.equal(1);
      expect(reputation.averageRating).to.equal(0); // No ratings yet
    });

    it("Should allow buyer to rate seller", async function () {
      const rating = 5;
      const comment = "Great seller, fast delivery!";
      
      await marketplace.connect(buyer).rateSeller(seller.address, rating, comment);
      
      const reputation = await marketplace.getSellerReputation(seller.address);
      expect(reputation.averageRating).to.equal(rating);
      expect(reputation.totalRatings).to.equal(1);
    });

    it("Should prevent duplicate ratings", async function () {
      await marketplace.connect(buyer).rateSeller(seller.address, 5, "Good");
      
      await expect(
        marketplace.connect(buyer).rateSeller(seller.address, 4, "Changed mind")
      ).to.be.revertedWith("Already rated this seller");
    });

    it("Should calculate seller level", async function () {
      // Add more sales to increase level
      for (let i = 2; i <= 10; i++) {
        await policyContract.connect(seller).mintPolicy(seller.address, i);
        await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
        await marketplace.connect(seller).listPolicy(i, ethers.utils.parseEther("100"), 7 * 24 * 60 * 60);
      }
      
      const level = await marketplace.getSellerLevel(seller.address);
      expect(level).to.be.gte(2); // Should be at least level 2
    });
  });

  describe("Analytics and Reporting", function () {
    beforeEach(async function () {
      // Create multiple listings and sales
      for (let i = 1; i <= 5; i++) {
        await policyContract.connect(seller).mintPolicy(seller.address, i);
        await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
        await marketplace.connect(seller).listPolicy(i, ethers.utils.parseEther("100"), 7 * 24 * 60 * 60);
        
        // Create buyers for each policy
        const buyer = ethers.Wallet.createRandom();
        await cusdToken.mint(buyer.address, ethers.utils.parseEther("200"));
        await cusdToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("100"));
        await marketplace.connect(buyer).buyPolicy(i);
      }
    });

    it("Should generate marketplace statistics", async function () {
      const stats = await marketplace.getMarketplaceStats();
      
      expect(stats.totalListings).to.equal(5);
      expect(stats.totalSales).to.equal(5);
      expect(stats.totalVolume).to.equal(ethers.utils.parseEther("500"));
      expect(stats.activeSellers).to.equal(1);
    });

    it("Should generate category statistics", async function () {
      const categoryStats = await marketplace.getCategoryStats();
      
      expect(categoryStats).to.have.property("Agriculture");
      expect(categoryStats.Agriculture.listingCount).to.equal(5);
      expect(categoryStats.Agriculture.totalVolume).to.equal(ethers.utils.parseEther("500"));
    });

    it("Should generate price distribution", async function () {
      const priceDistribution = await marketplace.getPriceDistribution();
      
      expect(priceDistribution).to.have.property("under100");
      expect(priceDistribution).to.have.property("100to200");
      expect(priceDistribution).to.have.property("over200");
    });
  });

  describe("Gas Optimization", function () {
    it("Should optimize batch operations", async function () {
      const policies = [1, 2, 3];
      const prices = [100, 150, 200].map(p => ethers.utils.parseEther(p.toString()));
      
      // Mint policies
      for (const policyId of policies) {
        await policyContract.connect(seller).mintPolicy(seller.address, policyId);
      }
      
      // Approve total amount
      const totalPrice = prices.reduce((sum, price) => sum.add(price), ethers.BigNumber.from(0));
      await cusdToken.connect(seller).approve(marketplace.address, totalPrice);
      
      // Batch vs individual comparison
      const batchTx = await marketplace.connect(seller).batchListPolicies(policies, prices, 7 * 24 * 60 * 60);
      const batchReceipt = await batchTx.wait();
      
      // Individual operations would cost more gas
      expect(batchReceipt.gasUsed).to.be.lessThan(500000);
    });

    it("Should optimize search queries", async function () {
      const gasUsed = await marketplace.estimateGas.getFeaturedListings();
      expect(gasUsed).to.be.lessThan(100000);
    });

    it("Should optimize analytics queries", async function () {
      const gasUsed = await marketplace.estimateGas.getMarketplaceStats();
      expect(gasUsed).to.be.lessThan(150000);
    });
  });

  describe("Security and Access Control", function () {
    it("Should prevent unauthorized fee changes", async function () {
      await expect(
        marketplace.connect(buyer).updateMarketplaceFee(1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent unauthorized listing modifications", async function () {
      await policyContract.connect(seller).mintPolicy(seller.address, 1);
      await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
      await marketplace.connect(seller).listPolicy(1, ethers.utils.parseEther("100"), 7 * 24 * 60 * 60);
      
      await expect(
        marketplace.connect(buyer).updatePrice(1, ethers.utils.parseEther("150"))
      ).to.be.revertedWith("Not listing owner");
    });

    it("Should prevent self-purchase", async function () {
      await policyContract.connect(seller).mintPolicy(seller.address, 1);
      await cusdToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("100"));
      await marketplace.connect(seller).listPolicy(1, ethers.utils.parseEther("100"), 7 * 24 * 60 * 60);
      
      await expect(
        marketplace.connect(seller).buyPolicy(1)
      ).to.be.revertedWith("Cannot buy own policy");
    });

    it("Should handle emergency pause", async function () {
      await marketplace.connect(owner).emergencyPause();
      
      await expect(
        marketplace.connect(buyer).buyPolicy(1)
      ).to.be.revertedWith("Contract is paused");
      
      await marketplace.connect(owner).emergencyUnpause();
    });
  });
});
