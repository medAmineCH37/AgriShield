
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract RainfallOracle {

     address public admin;

     mapping(uint256 => uint256) public rainfallByPeriod;
     mapping(uint256 => bool) public dataAvailable;

     event RainfallUpdated(
         uint256 indexed period,
         uint256 rainfall
     );

     constructor() {
         admin = msg.sender;
     }

     modifier onlyAdmin() {
         require(msg.sender == admin, "Not authorized");
         _;
     }

     function updateRainfall(
         uint256 _period,
         uint256 _rainfall
     ) public onlyAdmin {

         require(
             _period > 0,
             "Invalid period"
         );

         require(
             !dataAvailable[_period],
             "Rainfall already published"
         );

         rainfallByPeriod[_period] = _rainfall;
         dataAvailable[_period] = true;

         emit RainfallUpdated(_period, _rainfall);
     }

     function getRainfall(
         uint256 _period
     ) public view returns (uint256) {

         require(
             dataAvailable[_period],
             "Rainfall data not available"
         );

         return rainfallByPeriod[_period];
     }
 }
