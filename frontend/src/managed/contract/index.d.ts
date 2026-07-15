export interface PublicCredential {
  credentialHash: Uint8Array;
  issuer: string;
  credentialType: string;
  issueDate: bigint;
  revoked: boolean;
  verificationCount: bigint;
}

export interface PrivateWitness {
  ownerName: string;
  studentID: string;
  employeeID: string;
  email: string;
  dateOfBirth: string;
  documentMetadata: string;
  secretVerificationData: string;
  salt: Uint8Array;
}

export interface LedgerState {
  credentials: Map<bigint, PublicCredential>;
}

export function computeCredentialHash(witness: Omit<PrivateWitness, 'salt'> & { salt: Uint8Array }): Uint8Array;

export const contract: {
  name: string;
  version: string;
  schema: {
    ledger: {
      credentials: string;
    };
  };
  simulator: {
    ledger: LedgerState;
    issueCredential(caller: string, id: bigint, hash: Uint8Array, type: string, date: bigint): void;
    verifyCredential(id: bigint): boolean;
    proveOwnership(id: bigint, witness: PrivateWitness): boolean;
    proveOwnershipAndDiscloseEmail(id: bigint, witness: PrivateWitness): string;
    revokeCredential(caller: string, id: bigint): void;
    incrementVerification(id: bigint): void;
  };
};
