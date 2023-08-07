// library that we will attach to uint256
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // 3000.00000000
        return uint256(price * 1e10); // 10000000000
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }

    // convert msg.value from ETH to USD
    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed); //price of 1 ETH in USD
        // both ethPrice and ethAmount have additional 18 decimal places each
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18; // Price of 1 ETH in USD * number of ETH
        return ethAmountInUsd;
    }
}
