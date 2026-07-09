import { contract, computeCredentialHash } from '../managed/contract';
import type { PrivateWitness } from '../managed/contract';

export interface CredentialRecord {
  id: string; // string-serialized bigint for json safety
  credentialHash: string; // hex-encoded
  issuer: string;
  credentialType: string;
  issueDate: string; // ISO date string
  revoked: boolean;
  verificationCount: number;
  // If stored on owner's machine (private witness)
  privateWitness?: {
    ownerName: string;
    studentID: string;
    employeeID: string;
    email: string;
    dateOfBirth: string;
    documentMetadata: string;
    secretVerificationData: string;
    salt: string; // hex-encoded
  };
}

export class MidnightSDKService {
  private isSimulated = true;
  private currentCaller = '0x0000000000000000000000000000000000000000'; // Default un-auth address

  constructor() {
    this.loadSimulatedLedger();
  }

  // Set the mode (live vs simulated)
  setMode(simulated: boolean) {
    this.isSimulated = simulated;
  }

  // Set the current connected wallet address acting as the caller
  setCaller(address: string) {
    this.currentCaller = address || '0x0000000000000000000000000000000000000000';
  }

  // Helper to convert hex to Uint8Array
  private hexToBytes(hex: string): Uint8Array {
    if (!hex) return new Uint8Array(32);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  // Helper to convert Uint8Array to hex
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Loads ledger state from localStorage to persist mock blockchain updates
  private loadSimulatedLedger() {
    try {
      const stored = localStorage.getItem('midnight_ledger_credentials');
      if (stored) {
        const records: CredentialRecord[] = JSON.parse(stored);
        contract.simulator.ledger.credentials.clear();
        for (const r of records) {
          contract.simulator.ledger.credentials.set(BigInt(r.id), {
            credentialHash: this.hexToBytes(r.credentialHash),
            issuer: r.issuer,
            credentialType: r.credentialType,
            issueDate: BigInt(new Date(r.issueDate).getTime()),
            revoked: r.revoked,
            verificationCount: BigInt(r.verificationCount)
          });
        }
      }
    } catch (e) {
      console.error('Failed to load simulated ledger:', e);
    }
  }

  // Persists ledger state to localStorage
  private saveSimulatedLedger() {
    try {
      const records: CredentialRecord[] = [];
      contract.simulator.ledger.credentials.forEach((val: any, key: any) => {
        records.push({
          id: key.toString(),
          credentialHash: this.bytesToHex(val.credentialHash),
          issuer: val.issuer,
          credentialType: val.credentialType,
          issueDate: new Date(Number(val.issueDate)).toISOString(),
          revoked: val.revoked,
          verificationCount: Number(val.verificationCount)
        });
      });
      localStorage.setItem('midnight_ledger_credentials', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save simulated ledger:', e);
    }
  }

  // Fetch all credentials registered in the system
  async getCredentials(): Promise<CredentialRecord[]> {
    this.loadSimulatedLedger();
    const list: CredentialRecord[] = [];
    contract.simulator.ledger.credentials.forEach((val: any, key: any) => {
      list.push({
        id: key.toString(),
        credentialHash: this.bytesToHex(val.credentialHash),
        issuer: val.issuer,
        credentialType: val.credentialType,
        issueDate: new Date(Number(val.issueDate)).toISOString(),
        revoked: val.revoked,
        verificationCount: Number(val.verificationCount)
      });
    });
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }

  // Fetch a specific credential details
  async getCredential(id: string): Promise<CredentialRecord | null> {
    this.loadSimulatedLedger();
    const cred = contract.simulator.ledger.credentials.get(BigInt(id));
    if (!cred) return null;
    return {
      id: id,
      credentialHash: this.bytesToHex(cred.credentialHash),
      issuer: cred.issuer,
      credentialType: cred.credentialType,
      issueDate: new Date(Number(cred.issueDate)).toISOString(),
      revoked: cred.revoked,
      verificationCount: Number(cred.verificationCount)
    };
  }

  // 1. issueCredential()
  async issueCredential(
    id: string,
    type: string,
    witness: Omit<PrivateWitness, 'salt'>
  ): Promise<CredentialRecord> {
    // Generate salt and compute ZK hash commitment
    const salt = new Uint8Array(32);
    window.crypto.getRandomValues(salt);

    const fullWitness: PrivateWitness = { ...witness, salt };
    const hash = computeCredentialHash(fullWitness);

    const bigintId = BigInt(id);
    const date = BigInt(Date.now());

    if (this.isSimulated) {
      // Simulate proof generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Execute Compact VM Circuit on the simulator
      contract.simulator.issueCredential(this.currentCaller, bigintId, hash, type, date);
      this.saveSimulatedLedger();

      // Save the private witness details in user's browser vault
      const userVaultStr = localStorage.getItem('midnight_private_witnesses') || '{}';
      const userVault = JSON.parse(userVaultStr);
      userVault[id] = {
        ownerName: witness.ownerName,
        studentID: witness.studentID,
        employeeID: witness.employeeID,
        email: witness.email,
        dateOfBirth: witness.dateOfBirth,
        documentMetadata: witness.documentMetadata,
        secretVerificationData: witness.secretVerificationData,
        salt: this.bytesToHex(salt)
      };
      localStorage.setItem('midnight_private_witnesses', JSON.stringify(userVault));
    } else {
      // Live deployment and transaction submission via Midnight.js would go here
      // const deployed = await deployContract(...)
      // await deployed.callTx.issueCredential(bigintId, hash, type, date);
      throw new Error('Live Mode transaction requires ledger pre-funding and wallet signatures');
    }

    return {
      id: id,
      credentialHash: this.bytesToHex(hash),
      issuer: this.currentCaller,
      credentialType: type,
      issueDate: new Date(Number(date)).toISOString(),
      revoked: false,
      verificationCount: 0,
      privateWitness: {
        ...witness,
        salt: this.bytesToHex(salt)
      } as any
    };
  }

  // 2. verifyCredential()
  async verifyCredential(id: string): Promise<boolean> {
    const bigintId = BigInt(id);
    if (this.isSimulated) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return contract.simulator.verifyCredential(bigintId);
    } else {
      // Live SDK check
      throw new Error('Live mode verifyCredential not implemented');
    }
  }

  // 3. proveOwnership()
  async proveOwnership(
    id: string,
    witness: Omit<PrivateWitness, 'salt'> & { salt: string }
  ): Promise<{ proof: string; isValid: boolean }> {
    const bigintId = BigInt(id);
    const fullWitness: PrivateWitness = {
      ...witness,
      salt: this.hexToBytes(witness.salt)
    };

    if (this.isSimulated) {
      // Simulate heavy ZK-SNARK proving process (prover server)
      await new Promise(resolve => setTimeout(resolve, 2500));

      const isValid = contract.simulator.proveOwnership(bigintId, fullWitness);
      if (isValid) {
        // Return a mock cryptographic proof signature
        const mockProof = `zk-proof-vault-${id}-${this.bytesToHex(fullWitness.salt).substr(0, 16)}-validated`;
        return { proof: mockProof, isValid: true };
      }
      return { proof: '', isValid: false };
    } else {
      // Live Prover Server proof generation
      throw new Error('Live Mode proof generation requires Proof Server API');
    }
  }

  // 3b. proveOwnershipAndDiscloseEmail()
  async proveOwnershipAndDiscloseEmail(
    id: string,
    witness: Omit<PrivateWitness, 'salt'> & { salt: string }
  ): Promise<{ proof: string; isValid: boolean; disclosedEmail: string }> {
    const bigintId = BigInt(id);
    const fullWitness: PrivateWitness = {
      ...witness,
      salt: this.hexToBytes(witness.salt)
    };

    if (this.isSimulated) {
      // Simulate heavy ZK-SNARK proving process (prover server)
      await new Promise(resolve => setTimeout(resolve, 2500));

      try {
        const disclosedEmail = contract.simulator.proveOwnershipAndDiscloseEmail(bigintId, fullWitness);
        // Return a mock cryptographic proof signature with 'disclose-email' marker
        const mockProof = `zk-proof-vault-${id}-${this.bytesToHex(fullWitness.salt).substr(0, 16)}-disclose-email-validated`;
        return { proof: mockProof, isValid: true, disclosedEmail };
      } catch (err) {
        return { proof: '', isValid: false, disclosedEmail: '' };
      }
    } else {
      // Live Prover Server proof generation
      throw new Error('Live Mode proof generation requires Proof Server API');
    }
  }

  // 4. revokeCredential()
  async revokeCredential(id: string): Promise<void> {
    const bigintId = BigInt(id);
    if (this.isSimulated) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      contract.simulator.revokeCredential(this.currentCaller, bigintId);
      this.saveSimulatedLedger();
    } else {
      // Live SDK transaction
      throw new Error('Live Mode revoke requires wallet confirmation');
    }
  }

  // 5. incrementVerification()
  async incrementVerification(id: string): Promise<void> {
    const bigintId = BigInt(id);
    if (this.isSimulated) {
      contract.simulator.incrementVerification(bigintId);
      this.saveSimulatedLedger();
    } else {
      // Live SDK transaction
      throw new Error('Live Mode transaction error');
    }
  }

  // Retrieve private witness from browser vault if it exists
  getPrivateWitness(id: string): (Omit<PrivateWitness, 'salt'> & { salt: string }) | null {
    try {
      const userVaultStr = localStorage.getItem('midnight_private_witnesses') || '{}';
      const userVault = JSON.parse(userVaultStr);
      return userVault[id] || null;
    } catch {
      return null;
    }
  }
}

export const midnightSDKService = new MidnightSDKService();
