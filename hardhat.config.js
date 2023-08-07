require("dotenv").config()

require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL || "https://eth-sepolia/example"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "@key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY], //this is the private key
            chainId: 11155111,
            blockConfimations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337, //same chainId as hardhat
            // no need give accounts because hardhat will auto gv us 10 fake acc
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            // 31337: 1,
            //means on hardhat, user 1 is deployer
        },
        users: {
            default: 1,
        },
    },
}
