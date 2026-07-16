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
  
  // Real Midnight SDK connections
  private liveContract: any = null;
  private providers: any = null;

  constructor() {
    // Read the contract address from Vite environment variables
    const deployedAddress = import.meta.env.VITE_MIDNIGHT_CONTRACT_ADDRESS;
    if (deployedAddress && deployedAddress.trim() !== '') {
      console.log(`Detected live contract address: ${deployedAddress}. Initializing Midnight SDK...`);
      this.isSimulated = false;
      this.initializeLiveSDK(deployedAddress).catch(err => {
        console.warn("Failed to initialize live Midnight SDK, falling back to Simulation Mode:", err.message);
        this.isSimulated = true;
        this.loadSimulatedLedger();
      });
    } else {
      console.log("No live contract address found in environment configuration. Starting in Simulation Mode.");
      this.isSimulated = true;
      this.loadSimulatedLedger();
    }
  }

  // Initialize production Midnight JS providers
  private async initializeLiveSDK(contractAddress: string) {
    // Dynamically import Midnight JS SDK libraries to prevent runtime errors if not installed
    const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
    const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
    const { FetchZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
    const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
    const midnightContracts: any = await import('@midnight-ntwrk/midnight-js-contracts');
    const findContract = midnightContracts.findContract;

    if (typeof findContract !== 'function') {
      throw new Error(
        'This frontend requires Compact bindings generated for the installed Midnight SDK. ' +
        'Regenerate managed/ from contracts/vault.compact before enabling live mode.'
      );
    }

    const network = import.meta.env.VITE_MIDNIGHT_NETWORK || 'preprod';
    const proverUrl = import.meta.env.VITE_MIDNIGHT_PROVER_URL || 'http://localhost:8080';
    const indexerUrl = import.meta.env.VITE_MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql';
    const indexerWsUrl = import.meta.env.VITE_MIDNIGHT_INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v4/graphql';

    setNetworkId(network);

    const zkConfigProvider = new FetchZkConfigProvider(proverUrl);
    const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);
    const proofProvider = httpClientProofProvider(proverUrl, zkConfigProvider);

    // Wallet provider is injected via the window.midnight.mnLace connector at runtime
    const laceApi = (window as any).midnight?.mnLace;
    if (!laceApi) {
      throw new Error("Lace wallet extension not found in the browser.");
    }
    const walletConnection = await laceApi.enable();
    
    this.providers = {
      publicDataProvider,
      zkConfigProvider,
      proofProvider,
      walletProvider: walletConnection,
      midnightProvider: walletConnection
    };

    // Find and instantiate the contract on-chain
    this.liveContract = await findContract(this.providers, {
      contractAddress,
      compiledContract: contract
    });

    console.log("Successfully connected to live Midnight Smart Contract on-chain!");
  }

  // Set the mode manually
  setMode(simulated: boolean) {
    this.isSimulated = simulated;
    if (simulated) {
      this.loadSimulatedLedger();
    }
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
    if (!this.isSimulated && this.liveContract) {
      // Query the actual public indexer for ledger state
      const state = await this.liveContract.state();
      const list: CredentialRecord[] = [];
      state.ledger.credentials.forEach((val: any, key: any) => {
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

    // Simulation fallback
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
    if (!this.isSimulated && this.liveContract) {
      const state = await this.liveContract.state();
      const cred = state.ledger.credentials.get(BigInt(id));
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

    // Simulation fallback
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
    const salt = new Uint8Array(32);
    window.crypto.getRandomValues(salt);

    const fullWitness: PrivateWitness = { ...witness, salt };
    const hash = computeCredentialHash(fullWitness);
    const bigintId = BigInt(id);
    const date = BigInt(Date.now());

    if (!this.isSimulated && this.liveContract) {
      console.log(`Submitting on-chain transaction to register credential #${id}...`);
      
      // Execute the ZK proving circuit and submit transaction to Preprod node
      const tx = await this.liveContract.callTx.issueCredential(bigintId, hash, type, date);
      const receipt = await tx.submit();
      
      console.log(`Transaction successfully confirmed in block! Tx Hash: ${receipt.txHash}`);

      // Save the private witness details locally in user's browser vault
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

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    contract.simulator.issueCredential(this.currentCaller, bigintId, hash, type, date);
    this.saveSimulatedLedger();

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
    
    if (!this.isSimulated && this.liveContract) {
      console.log(`Querying on-chain state for credential #${id}...`);
      const state = await this.liveContract.state();
      const cred = state.ledger.credentials.get(bigintId);
      return cred && !cred.revoked;
    }

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    return contract.simulator.verifyCredential(bigintId);
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

    if (!this.isSimulated && this.liveContract) {
      console.log(`Executing off-chain ZK circuit for proveOwnership on local proof server...`);
      
      // Generate the actual zero-knowledge proof locally
      const proof = await this.liveContract.circuits.proveOwnership(bigintId, fullWitness);
      return { proof: proof.toString(), isValid: true };
    }

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 2500));
    const isValid = contract.simulator.proveOwnership(bigintId, fullWitness);
    if (isValid) {
      const mockProof = `zk-proof-vault-${id}-${this.bytesToHex(fullWitness.salt).substr(0, 16)}-validated`;
      return { proof: mockProof, isValid: true };
    }
    return { proof: '', isValid: false };
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

    if (!this.isSimulated && this.liveContract) {
      console.log(`Executing off-chain ZK circuit for proveOwnershipAndDiscloseEmail...`);
      
      // Generate proof and retrieve disclosed email from private state execution
      const proof = await this.liveContract.circuits.proveOwnershipAndDiscloseEmail(bigintId, fullWitness);
      return { proof: proof.toString(), isValid: true, disclosedEmail: witness.email };
    }

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 2500));
    try {
      const disclosedEmail = contract.simulator.proveOwnershipAndDiscloseEmail(bigintId, fullWitness);
      const mockProof = `zk-proof-vault-${id}-${this.bytesToHex(fullWitness.salt).substr(0, 16)}-disclose-email-validated`;
      return { proof: mockProof, isValid: true, disclosedEmail };
    } catch (err) {
      return { proof: '', isValid: false, disclosedEmail: '' };
    }
  }

  // 4. revokeCredential()
  async revokeCredential(id: string): Promise<void> {
    const bigintId = BigInt(id);
    
    if (!this.isSimulated && this.liveContract) {
      console.log(`Submitting revocation transaction for credential #${id}...`);
      const tx = await this.liveContract.callTx.revokeCredential(bigintId);
      const receipt = await tx.submit();
      console.log(`Revocation confirmed. Tx Hash: ${receipt.txHash}`);
      return;
    }

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 1200));
    contract.simulator.revokeCredential(this.currentCaller, bigintId);
    this.saveSimulatedLedger();
  }

  // 5. incrementVerification()
  async incrementVerification(id: string): Promise<void> {
    const bigintId = BigInt(id);
    
    if (!this.isSimulated && this.liveContract) {
      console.log(`Submitting incrementVerification transaction for credential #${id}...`);
      const tx = await this.liveContract.callTx.incrementVerification(bigintId);
      const receipt = await tx.submit();
      console.log(`Verification counted. Tx Hash: ${receipt.txHash}`);
      return;
    }

    // Simulation Fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    contract.simulator.incrementVerification(bigintId);
    this.saveSimulatedLedger();
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
