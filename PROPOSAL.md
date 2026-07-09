# Project Proposal: Midnight Credential Vault

**Tagline**: Privacy-First Decentralized Credential Verification Platform built on the Midnight Network.

---

## 1. Problem Statement
In current corporate and academic systems, credential verification is highly centralized, slow, and privacy-invasive:
- **Centralized Dependency**: Third parties (like employers or verification agencies) must query university databases or HR systems directly to verify details, introducing single points of failure.
- **Privacy Intrusion**: When verifying a degree or certification, the user has to share their full record, including legal names, birth dates, student ID numbers, grades, or personal contact info. There is no middle ground for sharing *only* the fact of credential ownership.
- **Risk of Data Leaks**: Transferring unencrypted PDFs or sensitive profile details to various verifier HR portals leaves credential holders vulnerable to identity theft and data leaks.

---

## 2. Proposed Solution
The **Midnight Credential Vault** introduces a decentralized, zero-knowledge verification layer. It allows:
1. **Institutions (Issuers)** to register credentials on the Midnight public ledger as cryptographic commitments (hashes) without publishing any personal identity details.
2. **Holders (Users)** to securely download their credential details as a local private witness.
3. **Verifiers** to validate credential ownership cryptographically. The holder runs the Compact proving circuit locally using their private witness, generating a zero-knowledge proof (ZKP). The verifier checks the ZKP against the public ledger commitment—validating the credential without ever learning the holder's name, email, or IDs.

---

## 3. Core Features
- **Public Ledger Registry**: Map tracking credentials by numeric IDs, recording only commitment hashes, issuer addresses, credential types, timestamps, and verification counts.
- **Client-Side Proving Engine**: Holder interface that reads the private witness from local vault storage, constructs a ZK proof, and updates verification statistics.
- **Issuer Portal**: Secure interface for authorized registrars to input data, compute Poseidon/SHA commitment hashes, and call smart contract circuits.
- **Employer Verification Dashboard**: Form validating proof receipts against on-chain ledger state in a single click, showing validation status and incrementing verification counts.
- **Revocation Manager**: Issuer panel allowing immediate contract updates to toggle the `revoked` flag, immediately invalidating any subsequent proving circuits.

---

## 4. Midnight Privacy Model Integration
The application strictly maps to Midnight's core design system:

| Concept | Application Data | Ledger Visibility | Storage Location |
| :--- | :--- | :--- | :--- |
| **Public Ledger State** | Credential ID, commitment hash, issuer wallet, revoked status, verification count | **Public** (Visible to all) | On-Chain Ledger |
| **Private Witness** | Owner Name, Student ID, Employee ID, Email, Date of Birth, Secret Key, Salt | **Shielded** (Secret) | Holder's Local Storage |
| **Selective Disclosure** | Valid proof string of ownership | **Verified** | Passed via Proving Circuit |

---

## 5. Value Proposition
- **For Holders**: Complete control over identity assets. Prove you graduated or hold a security clearance anonymously.
- **For Issuers**: Lower data management liability. Register credentials securely without maintaining long-term exposed public APIs containing personal student info.
- **For Verifiers**: Instant, tamper-proof, cryptographic verification. No more phone calls to registrar offices or waiting weeks for background checks.
