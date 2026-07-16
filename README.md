# Midnight Credential Vault

[![Midnight Credential Vault CI/CD](https://github.com/Debjit2821/midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/Debjit2821/midnight/actions/workflows/ci.yml)

A privacy-first decentralized credential verification platform built on the **Midnight Network** utilizing **Compact Smart Contracts**, **Zero-Knowledge Proofs (ZKPs)**, and **Midnight.js SDK**.

---

## 🔗 Project Links

*   **GitHub Repository**: [Debjit2821/midnight](https://github.com/Debjit2821/midnight)
*   **Frontend demo**: [Midnight Credential Vault Demo](https://frontend-eosin-six-66.vercel.app/)
*   **Demo**: [Demo](https://youtu.be/p2cVU4ouU2I)

---

## 💡 Initial Product Idea & Scoped Proposal

The **Midnight Credential Vault** is a decentralized, privacy-preserving credential issuance and verification platform designed to replace vulnerable public database checks and unencrypted PDF exchanges. Universities and professional institutions act as *Issuers*, registering credentials on the public ledger as cryptographic commitments. Credential *Holders* (e.g., graduates, employees) receive their personal, unredacted records as local *Private Witnesses* and can dynamically generate Zero-Knowledge Proofs (ZKPs) off-chain. Third-party *Verifiers* (e.g., corporate recruiters, compliance officers) check these proofs against the ledger to confirm credential validity instantly, ensuring complete student/employee confidentiality.

---

## 📸 Screenshots & Proof of Architecture

### 1. Landing Portal & Interactive Playground
*The landing interface displaying core concept descriptions, wallet connection action button, and simulator mode status.*
![Landing Portal](docs/screenshots/running_frontend.png)

### 2. Successful Compact Contract Compilation
*Output of the Compact compiler `compactc` generating circuits, proving keys, and TypeScript bindings.*
![Successful Compilation](docs/screenshots/compilation_success.png)

### 3. Passing Automated Contract & Privacy Tests
*Vitest executing 14 passing tests validating circuit logic, ZK proof checks, and privacy protection.*
![Passing Tests](docs/screenshots/tests_passing.png)

### 4. Lace Wallet Connect Flow
*Lace wallet popup interface showing authorization, account balance sync, and network connection confirmation.*
![Wallet Connected](docs/screenshots/wallet_connected.png)

### 5. Private Credential Issuance
*Issuer form compiling Alice's private witness details off-chain and publishing only the commitment hash.*
![Credential Issued](docs/screenshots/credential_issued.png)

### 6. Zero-Knowledge Proof & Verification
*Employer verification dashboard confirming validity of credential #1042 using ZK-SNARK proofs.*
![Credential Verified](docs/screenshots/credential_verified.png)

### 7. Observable Privacy Audit
*Visual privacy audit comparing public ledger parameters against hidden client-side private witness fields.*
![Privacy Demonstration](docs/screenshots/privacy_demonstration.png)

### 8. GitHub Actions CI/CD Pipeline
*Successful build pipeline validating linter, Vitest specs, typescript compiles, and production Vite bundle.*
![CI/CD Success](docs/screenshots/ci_cd_success.png)

### 9. Contract Deployment Trace
*Transaction receipt showing the Compact contract deploying successfully on the Midnight Preprod network.*
![Contract Deployment](docs/screenshots/contract_deployment.png)
### 10. CI/CD Verification and Vitest report in git
*its varified and it passed 14 tests*
![ci/cd and test](https://github.com/Debjit2821/midnight/blob/main/docs/Screenshot%202026-07-09%20184418.png)

## ⛓ Deployed Addresses (Midnight Preprod Testnet)

The frontend environment and deployment documentation use the following Midnight Preprod identifiers.

> The Subscan links below are direct lookups. The official explorer can be used from its [search page](https://explorer.preprod.midnight.network).

*   **Credential Vault Smart Contract (configured contract)**:
    *   **Subscan Explorer**: [View contract](https://midnight-preprod.subscan.io/contract/mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl)
    *   **Alternative Explorer Links**: [Official Explorer](https://explorer.preprod.midnight.network/contract/mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl) | [TexLabs Explorer](https://preprod.midnightexplorer.com/contract/mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl)
    *   **Bech32m Format**: `mn_contract_preprod18drh4lwsxzzkxrq2ljngnwsv6hatgadulk0qy868a8qws6v3vn8q84ppwl`
    *   **Raw Hex Format**: `3b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce`
    *   **01-Prefixed Hex Format**: `013b477afdd03085630c0afca689ba0cd5fab475bcfd9e021f47e9c0e8699164ce`

*   **Issuing Authority (signing wallet)**:
    *   **Subscan Explorer**: [View issuer account](https://midnight-preprod.subscan.io/account/mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js)
    *   **Alternative Explorer Links**: [Official Explorer](https://explorer.preprod.midnight.network/address/mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js) | [TexLabs Explorer](https://preprod.midnightexplorer.com/address/mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js)
    *   **Bech32m Format**: `mn_addr_preprod1l8aq3n0mv6g8zpztycw0xznhxg0ux4wpxctrry4dwy36zcprnhzs53a8js`
    *   **Raw Hex Format**: `e1a00861fb8600e1204b86c0e34277c2e183a1c1c6606182adc1214100236541`
    *   **03-Prefixed Hex Format**: `03e1a00861fb8600e1204b86c0e34277c2e183a1c1c6606182adc1214100236541`

There is intentionally no public receiving/holder address: the Compact contract persists the issuer and a credential commitment, not a recipient identity. The holder receives the private witness out of band and proves possession with `proveOwnership`; publishing a holder address would weaken that privacy guarantee.

---

## 🛡 Privacy Model

The Midnight Credential Vault ensures **rational privacy** by dividing information into public ledger state, private witness, and selective disclosures:

```
                  ┌──────────────────────────────┐
                  │        Private Witness       │
                  │   (Owner Name, IDs, Email)   │
                  └──────────────┬───────────────┘
                                 │
                                 ▼  (Off-chain hash)
  ┌──────────────────────────────┼──────────────────────────────┐
  │     Public Ledger State      │     Selective Disclosure     │
  │  (ID, Hash, Issuer, Status)  │   (ZK Proof of Ownership)    │
  └──────────────────────────────┴──────────────────────────────┘
```

1.  **Public State**: Variables recorded on the public blockchain ledger that are visible to all nodes:
    *   `credentialHash` (32-byte Poseidon/SHA-256 hash commitment of the private fields).
    *   `issuer` (Address of the registering organization).
    *   `credentialType` (Class classification of credential, e.g., "Academic Degree").
    *   `issueDate` (Issuance Unix timestamp).
    *   `revoked` (Boolean flag representing revocation status).
    *   `verificationCount` (Integer counting total verifications).
2.  **Private Witness**: Sensitive holder fields processed strictly off-chain and never revealed:
    *   `ownerName` (Legal full name).
    *   `studentID` / `employeeID` (Unique identifiers).
    *   `email` (Contact email).
    *   `dateOfBirth` (Birth date).
    *   `secretVerificationData` (Secret key).
    *   `salt` (Cryptographic salt).
3.  **Selective Disclosure**: Users run the Compact proving circuit locally. The Prover Server checks the private witness details against the public commitment, and outputs a ZK proof signature.
    *   *Standard Proving*: Confirming credential ownership without exposing any of the private witness fields.
    *   *Selective Email Disclosure*: Using the `disclose(email)` keyword dynamically inside our contract's `proveOwnershipAndDiscloseEmail` circuit. This allows a user to prove credential validity while selectively disclosing ONLY their email address to the verifier, leaving all other private fields (e.g. name, date of birth, IDs) completely hidden.

### 🔍 What an Observer Can and Cannot Learn

#### 👁 What an Observer Can Learn (Publicly Observable)
*   **Validity Status**: Whether a credential corresponding to a specific numeric ID is active, valid, or revoked.
*   **Issuing Authority**: The public wallet address of the organization that issued and signed the credential.
*   **Classification**: The category of the credential (e.g. *Academic Degree* or *Professional Certification*).
*   **Verification Usage**: The cumulative number of times the credential has been verified (though *who* verified it or *when* remains anonymous).
*   **Cryptographic Commitment**: The 32-byte public hash commitment representing the credential data.

#### 🔒 What an Observer Cannot Learn (Shielded & Confidential)
*   **Holder Identity**: The owner's name, email address, date of birth, student ID, or employee ID.
*   **Verification Trace**: Which specific user generated a ZK proof or which third-party verified it. No wallet addresses of the credential holders are ever linked to the public credential ID on the ledger.
*   **Raw Content Secrets**: The secret keys, salts, and specific grade or document metadata used to generate the commitment hash.
*   **Correlation**: Linking multiple credentials to the same holder is impossible since each ZK proof is generated off-chain using local witnesses and custom salts, preventing linkability.

---

## ⚙ Technology Stack & Project Structure

- **Contract Language**: Compact (Minokawa)
- **Frontend Framework**: React (Vite, TypeScript, TailwindCSS/Vanilla)
- **SDK**: Midnight.js SDK, `@midnight-ntwrk/midnight-js-contracts`
- **Wallet Connection**: Lace Wallet API (`window.midnight.mnLace`)
- **Test Runner**: Vitest (11 passing tests)

```
contracts/
  └─ vault.compact           # Compact smart contract logic
managed/
  └─ contract/
      ├─ index.ts            # Simulated Compact compiler TS output
      └─ index.d.ts          # TypeScript type definitions
frontend/
  ├─ src/
  │   ├─ components/         # Common UI components
  │   ├─ contexts/           # MidnightContext state provider
  │   ├─ pages/              # UI tab views (Home, Dashboard, Issuer, Verify, Admin)
  │   ├─ services/           # SDK client & Lace Wallet services
  │   └─ tests/              # Vitest contract test specifications
  ├─ package.json            # React project dependencies
  └─ vite.config.ts          # Vite configuration
.github/
  └─ workflows/
      └─ ci.yml              # GitHub Actions CI/CD configuration
PROPOSAL.md                  # Detailed conceptual proposal
DEMO_SCRIPT.md               # Visual walkthrough script
CHECKLIST.md                 # Challenge checklist compliance mapping
LICENSE                      # MIT License file
```

---

## 🛠 Setup & Running Instructions

### Prerequisites
*   [Node.js](https://nodejs.org) (v22+)
*   [Lace Wallet browser extension](https://www.lace.io/) (configured for Midnight Preprod)

### 1. Install Dependencies
```bash
git clone https://github.com/Debjit2821/midnight.git
cd midnight/frontend
npm install
```

### 2. Run Simulated Automated Tests
To run the automated tests validating contract circuits and ZK privacy bounds:
```bash
npm run test
```

### 3. Run Locally (Dev Server)
Start the Vite development server locally:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚀 Deployment Guide (Preprod Testnet)

Follow these steps to build and deploy the Compact contract to Midnight Preprod:

### 1. Prerequisites
Ensure you have the following installed and configured on your machine:
*   **WSL2** (for Windows users) with **Docker Desktop** running.
*   **Node.js 18+** and **npm** installed.
*   **Lace Wallet Browser Extension** installed and funded with `tNIGHT` tokens from the [Midnight Preprod Faucet](https://docs.midnight.network/).

### 2. Compile the Compact Contract
Compile the Compact smart contract to generate type-safe bindings, WebAssembly targets, and ZK circuits:
```bash
# Using the Midnight compact compiler CLI
npx @midnight-ntwrk/compactc compile contracts/vault.compact -o managed/
```
This generates the Compiled Contract schemas and ZK circuits in the `managed/` folder.

### 3. Start the Local Proof Server Daemon
The off-chain zero-knowledge proving circuits must be processed by a local proof server. Start the Docker container:
```bash
docker run -d -p 8080:8080 midnightntwrk/proof-server:latest
```
Ensure the server is running on `http://localhost:8080`.

### 4. Configure Environment Variables
Copy the environment templates:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```
Ensure `MIDNIGHT_PROVER_URL` is set to `http://localhost:8080` and the Node/Indexer URLs point to the official Preprod endpoints. The frontend reads the `VITE_` variables in `frontend/.env`; root variables are not exposed to the browser.

### 5. Execute Smart Contract Deployment
Install the SDK dependencies in the root folder and run the deployment script:
```bash
npm install
node scripts/deploy-contract.js
```
The script will:
1. Connect to your local proof server and wallet provider daemon.
2. Submit the deployment transaction to the Midnight Preprod Network.
3. Automatically update `.env` and `frontend/.env` with the newly generated contract address.

### 6. Verify Deployment on Block Explorers
After a new deployment, replace the contract id consistently in `.env`, `frontend/.env`, both environment examples, and the deployed-address section above. Do not publish an address until the deployment transaction can be inspected in an explorer.

### 7. Run Frontend Live Mode
Start the frontend development server:
```bash
cd frontend
npm install
npm run dev
```
In the web interface header, toggle **Demo Mode** to **Off (Live Wallet Mode)**. The app will connect to your connected Lace Wallet and queries the ledger state directly from the deployed contract address on the blockchain!
