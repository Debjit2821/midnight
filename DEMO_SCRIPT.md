# Demo Script: Midnight Credential Vault

This script outlines a **3–5 minute presentation and end-to-end walkthrough** of the Midnight Credential Vault, demonstrating its core features, ZK privacy model, and contract interactions.

---

## 🎬 Act 1: Introduction (30 seconds)
*   **Visual**: The home page of the **Midnight Credential Vault** with a dark, premium glassmorphism layout and interactive navigation.
*   **Narrative**: 
    > "Welcome to the Midnight Credential Vault. This platform is a privacy-first decentralized credential verification engine built on top of the Midnight Network. Today, we'll demonstrate how an institution can issue a degree, how a graduate can prove ownership of that degree, and how an employer can verify it instantly—all without exposing any sensitive personal data on the public blockchain."

---

## 🎬 Act 2: Architecture & Wallet Connection (45 seconds)
*   **Action**: Click the **About** tab in the top navigation. Point to the interaction flow diagram and Mermaid sequence.
*   **Narrative**:
    > "The platform separates data into two distinct layers using Midnight's Kachina model. On-chain, the public ledger only stores non-sensitive parameters: a cryptographic commitment hash, issuer wallet, credential type, timestamp, and a verification counter. All personal details—legal name, student ID, email, and birth dates—remain client-side in the holder's private witness. Let's start by connecting our Lace Wallet."
*   **Action**: Click the **Connect Lace Wallet** button in the header. (Observe the toast: *"Connected to Lace Wallet!"* and the header displaying the truncated wallet address).

---

## 🎬 Act 3: Issuing a Credential (60 seconds)
*   **Action**: Navigate to the **Issuer Portal** tab.
*   **Action**: Fill out the form with the following details:
    *   **Credential ID**: `1042`
    *   **Type**: `Academic Degree`
    *   **Owner Name**: `Alice Vance`
    *   **Email**: `alice@university.edu`
    *   **Student ID**: `STU-1042`
    *   **Date of Birth**: `1998-05-15`
    *   **Description**: `B.Sc. in Cryptographic Engineering`
*   **Action**: Click **Issue Credential to Ledger**. 
*   **Visual**: Note the loading screen overlay: *"Connecting to Proof Server & generating zero-knowledge proof..."* then the success toast: *"Credential #1042 successfully issued on the ledger!"*.
*   **Narrative**:
    > "As an academic registrar, I've just issued a degree to Alice. In the background, the platform hashed Alice's private details locally and generated a salt. The blockchain only recorded ID 1042 and the commitment hash. The personal fields were stored securely in Alice's browser vault, shielded from the public."

---

## 🎬 Act 4: The Holder's Dashboard & Proving Ownership (60 seconds)
*   **Action**: Navigate to the **Dashboard** tab. Select Credential `1042` from the left list.
*   **Action**: Click **Show Private Witness** to inspect the fields. Toggle it back off.
*   **Action**: Click **Generate Zero-Knowledge Proof**.
*   **Visual**: Watch the proving loader activate. Once completed, a copyable text box containing the ZK-SNARK proof receipt (`zk-proof-vault-1042-...-validated`) pops up. Click **Copy Proof**.
*   **Narrative**:
    > "Alice wants to apply for a job. In her Private Vault Dashboard, she can inspect her credential's private details. She triggers the proving circuit. Our local proof server executes the ZK circuit, confirming Alice holds the private witness matching the public ledger commitment for ID 1042. She copies the generated ZK proof receipt."

---

## 🎬 Act 5: Third-Party Verification & Privacy Audit (45 seconds)
*   **Action**: Navigate to the **Verification** tab.
*   **Action**: Enter Credential ID `1042`, paste the copied ZK proof string into the text box, and click **Verify**.
*   **Visual**: Watch the green success panel slide in: *"Verification Successful: The holder has proven ownership of this credential anonymously."*
*   **Narrative**:
    > "The employer receives Alice's proof. They input the credential ID and the ZK proof string. The smart contract validates the proof on-chain against the commitment. The check succeeds, and the public verification count increments on the ledger. Note our Privacy Audit report: the verifier confirms Alice has the degree, but Alice's legal name, email, student ID, and birth date remain entirely hidden."

---

## 🎬 Act 6: Revocation & Admin Audit (30 seconds)
*   **Action**: Navigate to the **Admin Ledger** tab. Find Credential `#1042` and click **Revoke**. Accept the alert window.
*   **Visual**: The status changes to red: *"Revoked"*.
*   **Narrative**:
    > "If a credential is found to be issued in error or must be cancelled, the authorized issuer can trigger the revocation circuit. Once revoked on-chain, any future verification or proving check for ID 1042 will automatically fail, completing our secure lifecycle."
