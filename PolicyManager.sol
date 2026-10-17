
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.20;

 interface IRainfallOracle {
     function rainfallByPeriod(uint256 period)
         external view returns (uint256);

     function dataAvailable(uint256 period)
         external view returns (bool);
 }

 interface IPayoutPool {
     function payFarmer(
         uint256 policyId,
         address payable farmer,
         uint256 amount
     ) external;
 }

 contract PolicyManager {

     uint256 public constant PREMIUM = 0.01 ether;
     uint256 public constant PAYOUT_AMOUNT = 0.05 ether;

     uint256 public nextPolicyId = 1;

     IRainfallOracle public oracle;
     IPayoutPool public payoutPool;

     struct Policy {
         address farmer;
         uint256 premium;
         uint256 rainfallThreshold;
         uint256 payoutAmount;
         uint256 period;
         bool active;
         bool paidOut;
     }

     mapping(uint256 => Policy) public policies;

     event PolicyCreated(
         uint256 indexed policyId,
         address indexed farmer,
         uint256 period,
         uint256 rainfallThreshold
     );

     event IndemnityClaimed(
         uint256 indexed policyId,
         address indexed farmer,
         uint256 amount
     );

     constructor(address _oracle, address _payoutPool) {
         require(_oracle != address(0), "Invalid oracle");
         require(_payoutPool != address(0), "Invalid pool");

         oracle = IRainfallOracle(_oracle);
         payoutPool = IPayoutPool(_payoutPool);
     }

     function subscribe(
         uint256 _period,
         uint256 _rainfallThreshold
     ) public payable {

         require(_period > 0, "Invalid period");
         require(_rainfallThreshold > 0, "Invalid threshold");
         require(msg.value == PREMIUM, "Incorrect premium");

         uint256 policyId = nextPolicyId;

         policies[policyId] = Policy({
             farmer: msg.sender,
             premium: msg.value,
             rainfallThreshold: _rainfallThreshold,
             payoutAmount: PAYOUT_AMOUNT,
             period: _period,
             active: true,
             paidOut: false
         });

         nextPolicyId++;

         emit PolicyCreated(
             policyId,
             msg.sender,
             _period,
             _rainfallThreshold
         );
     }

     function claimIndemnity(uint256 _policyId) external {
         Policy storage policy = policies[_policyId];

         require(
             policy.farmer != address(0),
             "Policy does not exist"
         );

         require(
             msg.sender == policy.farmer,
             "Not the policy owner"
         );

         require(policy.active, "Policy is not active");
         require(!policy.paidOut, "Already paid");

         require(
             oracle.dataAvailable(policy.period),
             "Rainfall data unavailable"
         );

         uint256 rainfall =
             oracle.rainfallByPeriod(policy.period);

         require(
             rainfall < policy.rainfallThreshold,
             "Drought condition not met"
         );

         // Update state before the external payment.
         policy.paidOut = true;
         policy.active = false;

         payoutPool.payFarmer(
             _policyId,
             payable(policy.farmer),
             policy.payoutAmount
         );

         emit IndemnityClaimed(
             _policyId,
             policy.farmer,
             policy.payoutAmount
         );
     }

     function getPolicy(
         uint256 _policyId
     ) public view returns (Policy memory) {

         require(
             policies[_policyId].farmer != address(0),
             "Policy does not exist"
         );

         return policies[_policyId];
     }
 }
