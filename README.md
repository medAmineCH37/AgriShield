# AgriShield

**Blockchain-based parametric drought insurance prototype for
small-scale farmers**

AgriShield is a decentralized application (dApp) prototype that
demonstrates how smart contracts can manage parametric drought
insurance. A farmer subscribes to a policy with a defined period and
rainfall threshold. If the rainfall recorded for that period is strictly
below the threshold, the farmer can request an indemnity, provided the
policy is eligible and the payout pool has sufficient funds.

> **Prototype notice:** AgriShield is an educational demonstration, not
> a production insurance service. Rainfall is entered manually by an
> administrator, and the premium and payout values are test parameters
> rather than actuarially validated amounts.

## Features

### Farmer

-   Connect a wallet using MetaMask.
-   Subscribe to an insurance policy by specifying a period and rainfall
    threshold.
-   Pay the fixed premium of **0.01 ETH**.
-   View policy details and payment status.
-   Read rainfall data published for a period.
-   Request an indemnity when the contract's eligibility rules are
    satisfied.

### Administrator

-   Publish simulated rainfall data for a period.
-   Fund the payout pool with ETH.
-   Read the current payout pool balance.
-   Receive transaction status messages in the frontend.

### Smart-contract protections

-   Only the Oracle administrator can publish rainfall data.
-   Rainfall data can only be published once per period.
-   A subscription requires the exact configured premium.
-   An indemnity requires available rainfall data and rainfall strictly
    below the policy threshold.
-   A policy cannot be claimed more than once.
-   The payout pool checks its available balance before paying.
-   Only the configured PolicyManager contract can initiate pool
    payouts.

## Technology stack

-   **Smart contracts:** Solidity
-   **Local blockchain:** Ganache
-   **Contract development and interaction:** Remix IDE
-   **Wallet:** MetaMask
-   **Frontend:** React + Vite
-   **Blockchain integration:** ethers.js
-   **Styling:** CSS

## Architecture

``` text
Farmer / Administrator
         |
         v
React + Vite frontend
         |
         v
MetaMask + ethers.js
         |
         v
Local Ganache blockchain
         |
         +--------------------+
         |                    |
         v                    v
 RainfallOracle.sol     PolicyManager.sol
                              |
                              v
                        PayoutPool.sol
```

### Contracts

#### `RainfallOracle.sol`

Stores the simulated rainfall measurement for each period. It provides
functions to publish and read rainfall data and to check whether data
exists for a period.

#### `PolicyManager.sol`

Handles subscriptions, stores policy details, checks claim eligibility,
and asks the payout pool to transfer an indemnity when the conditions
are met.

#### `PayoutPool.sol`

Holds ETH reserved for payouts. It supports deposits, exposes the
current balance, and restricts payout execution to the configured
PolicyManager contract.

## Prototype parameters

  Parameter                                                  Value
  ----------------------- ----------------------------------------
  Subscription premium                                    0.01 ETH
  Indemnity payout                                        0.05 ETH
  Eligibility condition     Recorded rainfall `<` policy threshold
  Rainfall source                Manually entered by administrator
  Claim initiation            Farmer submits the claim transaction

The subscription premium is received by `PolicyManager`; it is **not
automatically transferred to `PayoutPool`** in this prototype. The
payout pool must be funded separately by an administrator.

## Requirements

Install or configure the following before running the project:

-   Node.js and npm
-   Ganache
-   MetaMask browser extension
-   Remix IDE (https://remix.ethereum.org/)
-   Git (optional, for repository management)

## Run the local blockchain

1.  Open Ganache and start the existing workspace named `AGRISHIELD`.
2.  Confirm the RPC endpoint is `http://127.0.0.1:7545`.
3.  Confirm the chain ID returned by the RPC is `1337` (`0x539`).
    Ganache may display Network ID `5777`; Network ID and Chain ID are
    different values.
4.  Keep the workspace running while using the frontend. Do not reset
    the workspace unless you intend to redeploy the contracts and update
    their addresses.

## Contract deployment and configuration

The current local deployment uses these addresses:

  Contract           Address
  ------------------ ----------------------------------------------
  `RainfallOracle`   `0xAd2d0bC8571bE8B6510c77994AE0bb0e9c7FdeB2`
  `PayoutPool`       `0x20eae231742209Cabd45210191dBCbF183fEd127`
  `PolicyManager`    `0xd3A4BA7B760664f1AD9278470690a1f007DF0557`

These addresses refer to the current local Ganache state and are not
public-network deployments. They will stop working if the workspace is
reset or the contracts are redeployed.

The frontend address configuration is in
`frontend/src/contracts/addresses.js`. If redeploying, update this file
and make sure the contract ABIs in `frontend/src/contracts/abis.js`
match the compiled Solidity contracts.

The deployed contracts must be wired together correctly: 1.
`PayoutPool.setPolicyManager(...)` must be configured with the deployed
`PolicyManager` address. 2. The Oracle and payout pool addresses
supplied to the `PolicyManager` constructor must match the intended
deployments. 3. Fund `PayoutPool` separately before testing indemnity
payouts.

## Run the frontend

From the project root, open a terminal and run:

``` bash
cd frontend
npm install
npm install ethers
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

In MetaMask, configure a local network with:

-   **Network name:** AgriShield Local
-   **RPC URL:** `http://127.0.0.1:7545`
-   **Chain ID:** `1337`
-   **Currency symbol:** `ETH`

Use a Ganache test account for local demonstration. Never share its
private key or Secret Recovery Phrase.

## Typical demonstration workflow

1.  Start the `AGRISHIELD` Ganache workspace.
2.  Start the frontend and connect MetaMask.
3.  Read the payout pool balance.
4.  Read rainfall data for a published period.
5.  Subscribe to a policy with a period and rainfall threshold, paying
    `0.01 ETH`.
6.  Retrieve the new policy and inspect its details.
7.  Publish rainfall data as the administrator for a new period.
8.  Fund the payout pool if needed.
9.  For an eligible policy, submit a claim and verify the policy becomes
    inactive and paid out.
10. Attempting a second claim should be rejected.

Use a fresh, unpublished period for each rainfall publication test
because the Oracle prevents duplicate publications.

## Verification performed

The following functional flows were exercised through the React frontend
and local blockchain:

-   MetaMask connection to Ganache Chain ID `1337`.
-   Reading the payout pool balance.
-   Reading rainfall data for periods `20261018` and `20261019`.
-   Creating and viewing a policy, including farmer, premium, threshold,
    payout, period, active status, and paid-out status.
-   Successfully claiming an eligible policy and observing it become
    inactive and paid out.
-   Publishing rainfall data from the administrator interface.
-   Funding the payout pool from the administrator interface.

Negative checks were also attempted in Remix for: - Unauthorized
rainfall publication. - Duplicate rainfall publication. - Subscription
with an incorrect premium. - Claiming when rainfall was not below the
threshold. - Claiming an already-paid policy.

Remix reported gas-estimation failures for these invalid operations,
which is consistent with transaction reverts. The exact revert reasons
were not independently captured for every negative test, so these should
be described as observed rejection behavior rather than a fully
automated test suite. The insufficient-pool-balance scenario has not
been confirmed in the current deployment.

## Known limitations and future improvements

-   Rainfall measurements are simulated and manually entered; no live
    weather API or decentralized oracle is integrated.
-   Claims are initiated by the farmer rather than paid automatically by
    a scheduled process.
-   The premium and indemnity are fixed demonstration values and have
    not been actuarially validated.
-   Premiums are not automatically routed to the payout pool.
-   The prototype uses a local Ganache blockchain and is not deployed
    for production use.
-   The frontend is a demonstration interface; further work could add
    automated tests, transaction history, stronger role-based UI, and
    more detailed event reporting.

## Project structure

``` text
AgriShield/
├── RainfallOracle.sol
├── PolicyManager.sol
├── PayoutPool.sol
├── README.md
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ConnectWallet.jsx
    │   │   ├── PolicyForm.jsx
    │   │   ├── PolicyDetails.jsx
    │   │   └── AdminPanel.jsx
    │   ├── contracts/
    │   │   ├── addresses.js
    │   │   ├── abis.js
    │   │   └── contractInstances.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.css
    └── package.json
```

## Disclaimer

AgriShield is developed for educational purposes as a blockchain course
project. It is not financial, insurance, or agricultural advice, and it
should not be used to sell or administer real insurance policies.
