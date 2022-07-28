const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const basicNFT = await ethers.getContract("BasicNFT", deployer);
    const basicMintTx = await basicNFT.mintNft();
    await basicMintTx.wait(1);

    console.log(`Basic NFT index 0 has tokenURIL ${await basicNFT.tokenURI(0)}`);

    const randomIPFSNft = await ethers.getContract("RandomIpfsNft", deployer);
    const mintFee = await randomIPFSNft.getMintFee();

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000);
        randomIPFSNft.once("NftMinted", async function() {
            resolve();
        });

        const randomIpfstTx = await randomIPFSNft.requestNft({ value: mintFee.toString() });
        const randomIpfstTxReciept = await randomIpfstTx.wait(1);

        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfstTxReciept.events[1].args.requestId.toString();
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIPFSNft.address);
        }
    });

    console.log(`Random IPFS NFT index 0 tokenURI:  ${await randomIPFSNft.tokenURI(0)}`);

    const highValue = ethers.utils.parseEther("4000");
    const dynamicNft = await ethers.getContract("DynamicSvgNft", deployer);
    const dynamicMintTx = await dynamicNft.mintNft(highValue);
    await dynamicMintTx.wait(1);

    console.log("dynamic SVG NFT index 0 tokenURI: ", await dynamicNft.tokenURIL(0));
};
