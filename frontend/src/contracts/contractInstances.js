import { Contract } from "ethers";

import { CONTRACT_ADDRESSES } from "./addresses";

import {
  RAINFALL_ORACLE_ABI,
  PAYOUT_POOL_ABI,
  POLICY_MANAGER_ABI,
} from "./abis";

export function getContractInstances(signerOrProvider) {
  return {
    oracle: new Contract(
      CONTRACT_ADDRESSES.oracle,
      RAINFALL_ORACLE_ABI,
      signerOrProvider
    ),

    payoutPool: new Contract(
      CONTRACT_ADDRESSES.payoutPool,
      PAYOUT_POOL_ABI,
      signerOrProvider
    ),

    policyManager: new Contract(
      CONTRACT_ADDRESSES.policyManager,
      POLICY_MANAGER_ABI,
      signerOrProvider
    ),
  };
}
