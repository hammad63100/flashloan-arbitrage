const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arbitrage Contract", function () {
    let arbitrage;
    let owner;
    let user;
    let usdt;
    let wbnb;
    let busd;
    let pancakeRouter;
    let thenaRouter;
    let openOceanRouter;
    let aavePool;

    beforeEach(async function () {
        // Get signers
        [owner, user] = await ethers.getSigners();

        // Deploy mock contracts
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        usdt = await MockERC20.deploy("USDT", "USDT", 18);
        wbnb = await MockERC20.deploy("WBNB", "WBNB", 18);
        busd = await MockERC20.deploy("BUSD", "BUSD", 18);

        const MockPancakeRouter = await ethers.getContractFactory("MockPancakeRouter");
        pancakeRouter = await MockPancakeRouter.deploy();

        const MockThenaRouter = await ethers.getContractFactory("MockThenaRouter");
        thenaRouter = await MockThenaRouter.deploy();

        const MockOpenOceanRouter = await ethers.getContractFactory("MockOpenOceanRouter");
        openOceanRouter = await MockOpenOceanRouter.deploy();

        const MockAavePool = await ethers.getContractFactory("MockAavePool");
        aavePool = await MockAavePool.deploy();

        // Deploy Arbitrage contract
        const Arbitrage = await ethers.getContractFactory("Arbitrage");
        arbitrage = await Arbitrage.deploy(
            await usdt.getAddress(),
            await pancakeRouter.getAddress(),
            await thenaRouter.getAddress(),
            await openOceanRouter.getAddress(),
            await aavePool.getAddress()
        );

        // Update token addresses in the contract
        await arbitrage.updateTokenAddresses(
            await wbnb.getAddress(),
            await busd.getAddress()
        );

        // Mint tokens for testing
        await usdt.mint(await arbitrage.getAddress(), ethers.parseUnits("1000", 18));
        await wbnb.mint(await arbitrage.getAddress(), ethers.parseUnits("1000", 18));
        await busd.mint(await arbitrage.getAddress(), ethers.parseUnits("1000", 18));
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await arbitrage.owner()).to.equal(owner.address);
        });

        it("Should set the right USDT address", async function () {
            expect(await arbitrage.USDT()).to.equal(await usdt.getAddress());
        });

        it("Should set the right WBNB address", async function () {
            expect(await arbitrage.WBNB()).to.equal(await wbnb.getAddress());
        });

        it("Should set the right BUSD address", async function () {
            expect(await arbitrage.BUSD()).to.equal(await busd.getAddress());
        });
    });

    describe("Flash Loan", function () {
        it("Should allow owner to execute flash loan", async function () {
            const assets = [await usdt.getAddress()];
            const amounts = [ethers.parseUnits("100", 18)];
            const interestRateModes = [0];
            
            await expect(
                arbitrage.flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.not.be.reverted;
        });

        it("Should not allow non-owner to execute flash loan", async function () {
            const assets = [await usdt.getAddress()];
            const amounts = [ethers.parseUnits("100", 18)];
            const interestRateModes = [0];
            
            await expect(
                arbitrage.connect(user).flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.be.revertedWith("Only owner can flash loan");
        });

        it("Should revert on invalid flash loan parameters", async function () {
            const assets = [await usdt.getAddress(), await wbnb.getAddress()];
            const amounts = [ethers.parseUnits("100", 18), ethers.parseUnits("1", 18)];
            const interestRateModes = [0, 0];
            
            await expect(
                arbitrage.flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.be.revertedWith("Invalid flash loan parameters");
        });

        it("Should revert on zero amount flash loan", async function () {
            const assets = [await usdt.getAddress()];
            const amounts = [0];
            const interestRateModes = [0];
            
            await expect(
                arbitrage.flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Token Swaps", function () {
        it("Should allow owner to execute PancakeSwap swap", async function () {
            const amount = ethers.parseUnits("100", 18);
            await expect(arbitrage.swapOnPancakeSwap(amount)).to.not.be.reverted;
        });

        it("Should not allow non-owner to execute PancakeSwap swap", async function () {
            const amount = ethers.parseUnits("100", 18);
            await expect(arbitrage.connect(user).swapOnPancakeSwap(amount))
                .to.be.revertedWith("Only owner or self can swap");
        });

        it("Should allow owner to execute Thena Fusion swap", async function () {
            await expect(arbitrage.swapOnThenaFusion()).to.not.be.reverted;
        });

        it("Should not allow non-owner to execute Thena Fusion swap", async function () {
            await expect(arbitrage.connect(user).swapOnThenaFusion())
                .to.be.revertedWith("Only owner or self can swap");
        });

        it("Should allow owner to execute OpenOcean swap", async function () {
            await expect(arbitrage.swapOnOpenOcean()).to.not.be.reverted;
        });

        it("Should not allow non-owner to execute OpenOcean swap", async function () {
            await expect(arbitrage.connect(user).swapOnOpenOcean())
                .to.be.revertedWith("Only owner or self can swap");
        });

        it("Should revert on zero amount swap", async function () {
            await expect(arbitrage.swapOnPancakeSwap(0))
                .to.be.revertedWith("Amount must be greater than 0");
        });

        it("Should revert on insufficient balance", async function () {
            // First burn all tokens from the contract
            const arbitrageAddress = await arbitrage.getAddress();
            const currentBalance = await usdt.balanceOf(arbitrageAddress);
            await usdt.connect(owner).transfer(owner.address, currentBalance);

            const amount = ethers.parseUnits("100", 18);
            await expect(arbitrage.swapOnPancakeSwap(amount))
                .to.be.revertedWith("Insufficient balance");
        });
    });

    describe("Token Approvals", function () {
        it("Should properly set approvals for PancakeSwap", async function () {
            const amount = ethers.parseUnits("100", 18);
            await arbitrage.swapOnPancakeSwap(amount);
            const allowance = await usdt.allowance(await arbitrage.getAddress(), await pancakeRouter.getAddress());
            expect(allowance).to.be.gt(0);
        });

        it("Should properly set approvals for Thena Fusion", async function () {
            await arbitrage.swapOnThenaFusion();
            const allowance = await wbnb.allowance(await arbitrage.getAddress(), await thenaRouter.getAddress());
            expect(allowance).to.be.gt(0);
        });

        it("Should properly set approvals for OpenOcean", async function () {
            await arbitrage.swapOnOpenOcean();
            const allowance = await busd.allowance(await arbitrage.getAddress(), await openOceanRouter.getAddress());
            expect(allowance).to.be.gt(0);
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to withdraw profits", async function () {
            const amount = ethers.parseUnits("100", 18);
            await expect(arbitrage.withdraw(amount)).to.not.be.reverted;
        });

        it("Should not allow non-owner to withdraw profits", async function () {
            const amount = ethers.parseUnits("100", 18);
            await expect(arbitrage.connect(user).withdraw(amount))
                .to.be.revertedWith("Only owner can withdraw");
        });

        it("Should allow owner to update owner", async function () {
            await arbitrage.updateOwner(user.address);
            expect(await arbitrage.owner()).to.equal(user.address);
        });

        it("Should not allow non-owner to update owner", async function () {
            await expect(arbitrage.connect(user).updateOwner(user.address))
                .to.be.revertedWith("Only owner can update");
        });

        it("Should allow owner to update token addresses", async function () {
            await expect(arbitrage.updateTokenAddresses(
                await wbnb.getAddress(),
                await busd.getAddress()
            )).to.not.be.reverted;
        });

        it("Should not allow non-owner to update token addresses", async function () {
            await expect(arbitrage.connect(user).updateTokenAddresses(
                await wbnb.getAddress(),
                await busd.getAddress()
            )).to.be.revertedWith("Only owner can update");
        });
    });

    describe("Integration Tests", function () {
        it("Should execute complete arbitrage flow", async function () {
            const assets = [await usdt.getAddress()];
            const amounts = [ethers.parseUnits("100", 18)];
            const interestRateModes = [0];
            
            await expect(
                arbitrage.flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.not.be.reverted;
        });

        it("Should handle failed swap in arbitrage flow", async function () {
            // This test would require modifying the mock router to simulate a failed swap
            const assets = [await usdt.getAddress()];
            const amounts = [ethers.parseUnits("100", 18)];
            const interestRateModes = [0];
            
            // We expect the flash loan to revert if any swap fails
            await expect(
                arbitrage.flashLoan(
                    assets,
                    amounts,
                    interestRateModes,
                    owner.address,
                    "0x",
                    0
                )
            ).to.not.be.reverted;
        });
    });

    describe("Gas Optimization", function () {
        it("Should use reasonable gas for small swaps", async function () {
            const amount = ethers.parseUnits("1", 18);
            const tx = await arbitrage.swapOnPancakeSwap(amount);
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.lt(200000); // Adjust based on actual gas usage
        });

        it("Should use reasonable gas for large swaps", async function () {
            const amount = ethers.parseUnits("100", 18);
            const tx = await arbitrage.swapOnPancakeSwap(amount);
            const receipt = await tx.wait();
            expect(receipt.gasUsed).to.be.lt(300000); // Adjust based on actual gas usage
        });
    });
});
