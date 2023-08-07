const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChain } = require("../../helper-hardhat-config")

//only run on testnets
!developmentChain.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // convert to 1000... with 18 zeros
          const sendValue = ethers.utils.parseEther("1") // 1 ETH
          beforeEach(async function () {
              // deploy our FundMe contract
              // using hardhat-deploy
              // returns whatever is in accounts section of networks in hardhat config
              // const accounts = await ethers.getSigners()
              // const accountOne = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              // fixture: run entire deploy folder with as many tags as we want
              await deployments.fixture(["all"])
              // getContract gets the most recent deployment of contract we tell it
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  // to check if the response is == mockV3Aggregator address
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("fails if you don't send enough ETH", async function () {
                  // use waffle testing, expect keyword
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue }) // cfm more than min usd
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })
          describe("withdraw", async function () {
              // auto fund contract before we run any tests
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("Withdraw ETH from a single founder", async function () {
                  // arrange the test
                  // get balance of both fundme contract and deployer
                  // so that we can see how much these balance have changed after withdraw
                  // calling from blockchain, is of type bignumber
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // act
                  const transactionResponse = await fundMe.withdraw() // used gas here
                  const transactionReceipt = await transactionResponse.wait(1)
                  // check if gas cost is in transaction receipt. create breakpoint
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // should be able to check that entire fund me balance has been added to deployer balance
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // we need to get the gas cost --> retrieve from transaction receipt
                  // gasUsed x effectiveGasPrice = amt of gas paid
                  // assert
                  // to check if numbers works out
                  assert.equal(endingFundMeBalance, 0) // because withdraw all $
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple getFunder", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  // loop through accounts and have each acc call fund function
                  // 0 index is deployer
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0) // because withdraw all $
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // make sure getFunder are reset properly
                  // check if looking at 0 position of getFunder throw error
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  // ensure that in loop, all accounts balances are 0
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              // only owner can withdraw
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("cheaper withdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  // loop through accounts and have each acc call fund function
                  // 0 index is deployer
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0) // because withdraw all $
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // make sure getFunder are reset properly
                  // check if looking at 0 position of getFunder throw error
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  // ensure that in loop, all accounts balances are 0
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
