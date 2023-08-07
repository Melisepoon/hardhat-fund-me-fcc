// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

//constant, immutable
// 837,297
// 817,767 --> amt saved after adding constant keyword

// error codes: easier to understand which contract is throwing error
error FundMe__NotOwner();

// interfaces, libraries, contracts
// natspec comments: /// or /** */
/** @title A contract for crowd funding
 *  @author Melise Poon
 *  @notice this contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    //type declaration
    using PriceConverter for uint256;

    // state variables
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmoundFunded;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    // now, pricefeed depends on which chain we are on
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // now, we pass in address of pricefeed depending on what chain we are on
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     *  @notice This function funds this contract
     *  @dev This implements price feeds as our library
     */
    // to fund the contract
    function fund() public payable {
        //msg.value considered first parameter for library functions, no need to pass into function as parameter
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        s_addressToAmoundFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // to withdraw money from the contract
    function withdraw() public onlyOwner {
        // reset funders and addressToAmountFunded
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmoundFunded[funder] = 0;
        }
        //reset array
        s_funders = new address[](0);
        // actually withdraw fund
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // mappings cannot be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmoundFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmoundFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
// functions order:
//// constructor
//// receive
//// fallback
//// external
//// public
//// internal
//// private
//// view / pure
