# AgriShield

**Parametric drought insurance for small-scale farmers**

AgriShield is a blockchain-based prototype that simulates agricultural insurance payouts based on rainfall measurements.

## Smart Contracts

- **RainfallOracle:** Stores rainfall measurements for defined periods.
- **PolicyManager:** Manages insurance subscriptions and evaluates indemnity claims.
- **PayoutPool:** Holds funds and transfers indemnities to eligible farmers.

## Technologies

- Solidity
- Remix IDE
- Remix VM for local blockchain simulation

## Current Parameters

- Premium: 0.01 ETH
- Indemnity: 0.05 ETH
- Claim condition: Recorded rainfall must be below the policy's threshold.

## Limitations

Rainfall data is entered manually for demonstration purposes. The prototype does not yet use a live weather oracle and is not a production-ready insurance system.

## Running the Prototype

Compile the contracts with Solidity 0.8.20 or a compatible 0.8.x compiler in Remix. Deploy `RainfallOracle` and `PayoutPool`, then deploy `PolicyManager` using their deployed addresses. Configure the pool with the `PolicyManager` address and fund the pool before testing claims.