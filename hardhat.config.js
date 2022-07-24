require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");

const RINKEBY_RPC_URL = process.env.RINKBEY_RPC_SERVER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COIN_MARKET_CAP_API_KEY = process.env.COIN_MARKET_CAP_API_KEY;
const MAINET_RPC_URL = process.env.MAINET_RPC_URL;

// console.log({
//     RINKEBY_RPC_URL,
//     PRIVATE_KEY,
//     ETHERSCAN_API_KEY,
//     COIN_MARKET_CAP_API_KEY,
//     MAINET_RPC_URL,
// });
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.4.19" }, { version: "0.6.12" }]
    },
    defaultNetwork: "hardhat",

    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINET_RPC_URL
            }
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4
        }
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        }
    },
    mocha: {
        timeout: 500000
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.log",
        noColors: true,
        currency: "USD",
        coimarketcap: COIN_MARKET_CAP_API_KEY,
        token: "MATIC"
    }
};
