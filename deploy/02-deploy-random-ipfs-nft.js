const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { storeImages, storeTokenURIMetaData } = require("../utils/uploadToPinata");
const { verify } = require("../utils/verify");

const imagesLocation = "./images/random";
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100
        }
    ]
};

const tokenUris = [
    "ipfs://QmZdCwzAhZR5EhPaKxNHPz2r6BpUrTstFkHk6F5SRHfh6g",
    "ipfs://QmWU843S6BMTdoPNKkKV75eaocaMFVuwFsAJcQoFzoH7bs",
    "ipfs://QmPvguzhTyY2PoYBpUZvszw9GhLMZot9M1hYuEq94GVzVF"
];

const FUND_AMOUNT = "1000000000000000000000";
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying contracts...");
    const chainId = network.config.chainId;

    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await handleTokenUris();
    }

    let vrfCoordinatorV2address, subscriptionId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2address = vrfCoordinatorV2Mock.address;

        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReciept = await tx.wait(1);
        subscriptionId = txReciept.events[0].args.subId;
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2address = networkConfig[chainId].vrfCoordinatorV2Address;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    log("--------------------------------------------------");

    const args = [
        vrfCoordinatorV2address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,

        networkConfig[chainId].mintFee
    ];

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.waitConfirmations || 1
    });

    if (!developmentChains.includes(network.name)) {
        await verify(randomIpfsNft.address, args);
    }
};

async function handleTokenUris() {
    tokenUris = [];
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
    for (imageIndex in imageUploadResponses) {
        let tokenUriMetaData = { ...metadataTemplate };
        tokenUriMetaData.name = files[imageIndex].replace(".png", "");
        tokenUriMetaData.image = imageUploadResponses[imageIndex].IpfsHash;
        tokenUriMetaData.description = `An adorable ${tokenUriMetaData.name} pup!`;
        tokenUris.push(tokenUriMetaData);
        console.log(`uploading ${tokenUriMetaData.name}...`);
        const metadataUploadResponse = await storeTokenURIMetaData(tokenUriMetaData);
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
    }

    console.log("tokenUris: ", tokenUris);
    return tokenUris;
}

module.exports.tags = ["all", "randomIpfs", "main"];
