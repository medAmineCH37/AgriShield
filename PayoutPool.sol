
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 contract PayoutPool {

     address public admin;
     address public policyManager;

     mapping(uint256 => bool) public alreadyPaid;

     event PoolFunded(
         address indexed funder,
         uint256 amount
     );

     event IndemnityPaid(
         uint256 indexed policyId,
         address indexed farmer,
         uint256 amount
     );

     constructor() {
         admin = msg.sender;
     }

     modifier onlyAdmin() {
         require(msg.sender == admin, "Not authorized");
         _;
     }

     modifier onlyPolicyManager() {
         require(
             msg.sender == policyManager,
             "Only PolicyManager"
         );
         _;
     }

     function setPolicyManager(
         address _policyManager
     ) external onlyAdmin {

         require(
             _policyManager != address(0),
             "Invalid address"
         );

         require(
             policyManager == address(0),
             "PolicyManager already set"
         );

         policyManager = _policyManager;
     }

     function deposit() external payable {
         require(msg.value > 0, "Deposit must be positive");

         emit PoolFunded(msg.sender, msg.value);
     }

     function payFarmer(
         uint256 _policyId,
         address payable _farmer,
         uint256 _amount
     ) external onlyPolicyManager {

         require(_policyId > 0, "Invalid policy ID");
         require(_farmer != address(0), "Invalid farmer");
         require(_amount > 0, "Amount must be positive");

         require(
             !alreadyPaid[_policyId],
             "Policy already paid"
         );

         require(
             address(this).balance >= _amount,
             "Insufficient pool funds"
         );

         // Mark as paid before transferring ETH.
         alreadyPaid[_policyId] = true;

         (bool success, ) = _farmer.call{value: _amount}("");

         require(success, "Payment failed");

         emit IndemnityPaid(
             _policyId,
             _farmer,
             _amount
         );
     }

     function getBalance() external view returns (uint256) {
         return address(this).balance;
     }
 }
