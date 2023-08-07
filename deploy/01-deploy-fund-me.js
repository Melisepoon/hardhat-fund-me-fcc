// whenever we use network.config, we refer to parts of hardhat.config.js file

// import
// main function
// calling of main function

// asyn function deployFunc(hre) {
//     console.log("hi")
// }
// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     // to pull variables out of hre that we can use
//     const { getNamedAccounts, deployments } = hre
//     // hre.getNamedAccounts --> if above, no need to add hre.
// }

// this syntax is same as:
// const helperConfig = require("../helper-hardhat-config")
// const networkConfig = helperConfig.networkConfig
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// can add below for nicer syntax
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X, use address Y
    // ref to aave github
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    // use let so we can update it
    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // mock contracts: if contract doesnt exist, we deploy a minimal ver
    // of it for our local testing

    // when going for localhost or hardhat network, we want to use a mock
    // what happens when we want to change chains?
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeed address here
        log: true,
        // if no blkcfm in hardhat.config, wait 1
        waitConfirmations: network.config.blockConfimations || 1,
    })
    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //verify
        await verify(fundMe.address, args)
    }
    log(
        "------------------------------------------------------------------------"
    )
}

module.exports.tags = ["all", "fundme"]
