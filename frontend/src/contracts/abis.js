export const RAINFALL_ORACLE_ABI = [
  "function updateRainfall(uint256 period, uint256 rainfall)",
  "function getRainfall(uint256 period) view returns (uint256)",
  "function dataAvailable(uint256 period) view returns (bool)",
];

export const PAYOUT_POOL_ABI = [
  "function setPolicyManager(address _policyManager)",
  "function deposit() payable",
  "function getBalance() view returns (uint256)",
  "function payFarmer(uint256 policyId, address farmer, uint256 amount)",
  "function policyManager() view returns (address)",
];


export const POLICY_MANAGER_ABI = [
  "function subscribe(uint256 period, uint256 threshold) payable",
  "function claimIndemnity(uint256 id)",
  "function getPolicy(uint256 _policyId) view returns ((address farmer, uint256 premium, uint256 rainfallThreshold, uint256 payoutAmount, uint256 period, bool active, bool paidOut))",
  "function nextPolicyId() view returns (uint256)",
  "function PREMIUM() view returns (uint256)",
  "function PAYOUT_AMOUNT() view returns (uint256)",
];

