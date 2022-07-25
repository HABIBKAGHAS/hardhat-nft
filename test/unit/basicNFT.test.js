const { assert } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT", () => {
          let basicNFT, deployer;
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture();
              basicNFT = await ethers.getContract("BasicNFT");
          });

          it("increase token counter after minting", async () => {
              const tokenCounterBefore = await basicNFT.getTokenCounter();
              await basicNFT.mintNft();
              const tokenCounterAfter = await basicNFT.getTokenCounter();

              assert.equal(tokenCounterAfter.toNumber(), tokenCounterBefore.toNumber() + 1);
          });

          it("initialize token counter as 0", async () => {
              const tokenCounter = await basicNFT.getTokenCounter();
              assert.equal(tokenCounter.toNumber(), 0);
          });

          it("returns the token URI", async () => {
              const tokenCounter = await basicNFT.tokenURI(0);
              console.log({ tokenCounter });
              assert.equal(
                  tokenCounter,
                  "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
              );
          });
      });
