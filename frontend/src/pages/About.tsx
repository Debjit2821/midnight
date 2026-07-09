import React from 'react';
import { Network, Database, Key, Server } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="fade-in space-y-12">
      {/* Platform Header */}
      <section className="space-y-4">
        <h2 className="text-3xl font-extrabold text-white">System Architecture & Privacy Model</h2>
        <p className="text-slate-400">
          The Midnight Credential Vault leverages Midnight's dual-state blockchain structure to provide absolute confidentiality for sensitive data while ensuring cryptographically verifiable transparency on the public ledger.
        </p>
      </section>

      {/* Protocol Diagram */}
      <section className="card bg-glass border border-white-10">
        <h3 className="text-xl font-bold text-white mb-6">Interaction Flow (Kachina Model)</h3>
        
        <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-violet-500 before:to-indigo-500">
          {/* Step 1 */}
          <div className="relative pl-12">
            <div className="absolute left-3 w-7 h-7 rounded-full bg-slate-900 border border-violet-500 flex items-center justify-center -translate-x-1/2 text-xs font-bold text-violet-400">
              1
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-violet-400" />
                <span>Credential Issuance & Public Commitment</span>
              </h4>
              <p className="text-sm text-slate-400">
                The Issuer inputs credential parameters (name, IDs, secret). The platform hashes these private witness fields locally using `persistentHash`. The resulting 32-byte commitment is sent to the blockchain alongside non-sensitive public metadata.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-12">
            <div className="absolute left-3 w-7 h-7 rounded-full bg-slate-900 border border-violet-500 flex items-center justify-center -translate-x-1/2 text-xs font-bold text-violet-400">
              2
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-violet-400" />
                <span>Private Witness Storage</span>
              </h4>
              <p className="text-sm text-slate-400">
                The credential holder receives their raw private witness details. These details are stored locally and securely in the holder's browser vault or private state provider.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-12">
            <div className="absolute left-3 w-7 h-7 rounded-full bg-slate-900 border border-violet-500 flex items-center justify-center -translate-x-1/2 text-xs font-bold text-violet-400">
              3
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <span>Zero-Knowledge Proof Generation</span>
              </h4>
              <p className="text-sm text-slate-400">
                When verification is requested, the holder inputs their private witness to execute the Compact circuit locally. The proof server (running in Docker or browser) compiles the witness, validating that the hash of the witness matches the on-chain commitment, and outputs a ZK proof.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative pl-12">
            <div className="absolute left-3 w-7 h-7 rounded-full bg-slate-900 border border-violet-500 flex items-center justify-center -translate-x-1/2 text-xs font-bold text-violet-400">
              4
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-violet-400" />
                <span>On-Chain Verification & Counters</span>
              </h4>
              <p className="text-sm text-slate-400">
                The verifier submits the generated ZK proof and the public credential ID. The ledger verifies the proof against the stored commitment. If valid, it successfully increments the verification count without ever learning who the credential belongs to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">The Compact Compiler (`zkc`)</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Compact compiles contract files (`.compact`) into zero-knowledge circuits, intermediate representations (ZKIR), proving/verifying keys, and JavaScript bindings. It establishes constraints ensuring state transitions can only execute when assertions succeed.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-white-5">
            <code className="text-xs text-violet-300 block">compact compile contracts/vault.compact managed/</code>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">The Proof Server</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            The Midnight Proof Server operates locally or as an API daemon. It receives witness inputs from the dApp and executes the proving key mathematical equations to output a cryptographic zero-knowledge proof receipt.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-white-5">
            <code className="text-xs text-violet-300 block">docker run -d -p 8080:8080 midnightntwrk/proof-server</code>
          </div>
        </div>
      </section>

      {/* Code / Mermaid Text Box */}
      <section className="card bg-glass text-left">
        <h3 className="text-xl font-bold text-white mb-4">Protocol Mermaid Schema</h3>
        <p className="text-sm text-slate-400 mb-4">
          For technical reference, the verification flow executes the following diagram:
        </p>
        <pre className="bg-slate-950 p-6 rounded-2xl border border-white-5 text-xs text-indigo-300 overflow-x-auto">
{`sequenceDiagram
  autonumber
  actor User as Credential Holder
  actor Issuer as Organization
  actor Verifier as Third Party Employer
  participant Ledger as Midnight Blockchain (Public State)
  participant Prover as Local Proof Server (Private Witness)

  Issuer->>Ledger: issueCredential(id, credentialHash, metadata)
  User->>Prover: Load Private Witness (Name, IDs, Email, Secret, Salt)
  Verifier->>User: Request Proof of Validity for ID
  User->>Prover: Run proveOwnership Circuit with Witness
  Prover-->>User: Generate Cryptographic Proof
  User->>Verifier: Send Cryptographic Proof & ID
  Verifier->>Ledger: Submit Proof & Verify Validity
  Ledger->>Ledger: Increment Verification Count
  Ledger-->>Verifier: Return Credential isValid (Success)`}
        </pre>
      </section>
    </div>
  );
};
