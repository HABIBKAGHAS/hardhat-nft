// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    uint256 s_tokenCounter;
    string private i_lowUri;
    string private i_highUri;
    string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokentIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeed,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("DynamicSvgNft", "DSN") {
        s_tokenCounter = 0;
        i_lowUri = svgToImageURI(lowSvg);
        i_highUri = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBase64Encoded));
    }

    function mintNft(int256 highValue) public {
        s_tokentIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;

        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI Query for non-existent token");
        string memory imageURI = i_lowUri;
        // data:application/jso = n;base64,

        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        if (price > s_tokentIdToHighValue[tokenId]) {
            imageURI = i_highUri;
        }
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(), // You can add whatever name here
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSvgURI() public view returns (string memory) {
        return i_lowUri;
    }

    function getHigSvgURI() public view returns (string memory) {
        return i_highUri;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getPrice() public view returns (int256) {
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        return price;
    }
}
