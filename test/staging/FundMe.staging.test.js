const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

// only run describe if we are on developer chain
// ? ternary operator: 1 liner if statement
// let variable = true
// let someVar = variable ? "yes" : "no"
developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let deployer
          let fundMe
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              // assumed already deployed
              // no need mock because we are in testnet
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal..."
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
