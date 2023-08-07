// to deploy mock pricefeed contract
// for networks that does not have pricefeed contracts, etc locally

const { network } = require("hardhat")
const {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const chainId = network.config.chainId

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks.")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            // can choose price of price feed
            // parameters are decimals and initialAnswer
            // initialAnswer is the starting price
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed")
        log("-------------------------------------------------")
    }
}

// to deploy only 00-deploy-mocks.js
// when we run yarn hardhat deploy --tags mocks
// only run deploy scripts that have special tags
module.exports.tags = ["all", "mocks"]
