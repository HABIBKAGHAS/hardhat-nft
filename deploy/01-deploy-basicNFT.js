const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying contracts...");
    const args = [];
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1
    });

    if (!developmentChains.includes(network.name)) {
        await verify(Raffle.address, [
            vrfCoordinatorV2Address,
            enteranceFee,
            subscriptionId,
            gasLimit,
            interval
        ]);
    }

    log("--------------------------------------------------");
};
