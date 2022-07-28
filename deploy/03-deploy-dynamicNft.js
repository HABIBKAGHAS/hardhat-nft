const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying contracts...");
    let args = [];

    const chainId = network.config.chainId;
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = await fs.readFileSync("./images/dynamicNft/frown.svg", { encoding: "utf-8" });
    const highSVG = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf-8" });

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG];

    const dynamicNFT = await deploy("DynamicSvgNft", {
        args: args,
        from: deployer,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1
    });

    if (!developmentChains.includes(network.name)) {
        await verify(dynamicNFT.address, args);
    }

    log("--------------------------------------------------");
};

module.exports.tags = ["all", "dynamicSvgNft", "main"];
