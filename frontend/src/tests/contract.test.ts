import { describe, it, expect, beforeEach } from 'vitest';
import { contract, computeCredentialHash } from '../managed/contract';
import type { PrivateWitness } from '../managed/contract';

describe('Midnight Credential Vault Contract Circuits & Privacy Tests', () => {
  // Test data Setup
  const issuerAddress = '0x1234567890abcdef1234567890abcdef12345678';

  const defaultWitness: PrivateWitness = {
    ownerName: 'Alice Vance',
    studentID: 'STU-1042',
    employeeID: 'EMP-991',
    email: 'alice@university.edu',
    dateOfBirth: '1998-05-15',
    documentMetadata: 'Magna Cum Laude Honours',
    secretVerificationData: 'secret-hash-key',
    salt: new Uint8Array(32).fill(7) // Mock deterministic salt for testing
  };

  const alternateWitness: PrivateWitness = {
    ...defaultWitness,
    ownerName: 'Bob Vance' // modified field
  };

  const credId = 1001n;
  let credHash: Uint8Array;

  beforeEach(() => {
    // Reset simulated ledger state before each test
    contract.simulator.ledger.credentials.clear();
    credHash = computeCredentialHash(defaultWitness);
  });

  // 1. Test Issue Credential
  describe('issueCredential() circuit', () => {
    it('should successfully record a new credential on the public ledger', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const ledgerRecord = contract.simulator.ledger.credentials.get(credId);
      expect(ledgerRecord).toBeDefined();
      expect(ledgerRecord?.issuer).toBe(issuerAddress);
      expect(ledgerRecord?.revoked).toBe(false);
      expect(ledgerRecord?.verificationCount).toBe(0n);
      expect(ledgerRecord?.credentialType).toBe('Academic Degree');
      expect(ledgerRecord?.credentialHash).toEqual(credHash);
    });

    it('should fail if attempting to issue a credential with an existing ID', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      expect(() => {
        contract.simulator.issueCredential(
          issuerAddress,
          credId,
          credHash,
          'Alternate Certification',
          issueDate
        );
      }).toThrowError('Credential already exists');
    });
  });

  // 2. Test Verify Credential
  describe('verifyCredential() circuit', () => {
    it('should return true for an active, valid credential', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const isValid = contract.simulator.verifyCredential(credId);
      expect(isValid).toBe(true);
    });

    it('should throw error if credential does not exist', () => {
      expect(() => {
        contract.simulator.verifyCredential(9999n);
      }).toThrowError('Credential does not exist');
    });
  });

  // 3. Test Revoke Credential
  describe('revokeCredential() circuit', () => {
    it('should successfully mark a credential as revoked if called by the issuer', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      contract.simulator.revokeCredential(issuerAddress, credId);
      const ledgerRecord = contract.simulator.ledger.credentials.get(credId);
      expect(ledgerRecord?.revoked).toBe(true);
    });

    it('should fail if a non-issuer attempts to revoke the credential', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const maliciousCaller = '0xattackeraddress';
      expect(() => {
        contract.simulator.revokeCredential(maliciousCaller, credId);
      }).toThrowError('Only the issuer can revoke');
    });

    it('should fail validation checks after revocation', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      contract.simulator.revokeCredential(issuerAddress, credId);

      expect(() => {
        contract.simulator.verifyCredential(credId);
      }).toThrowError('Credential is revoked');

      expect(() => {
        contract.simulator.proveOwnership(credId, defaultWitness);
      }).toThrowError('Credential is revoked');
    });
  });

  // 4. Test Proof Verification
  describe('proveOwnership() circuit', () => {
    it('should validate successfully when correct witness is provided', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const isOwner = contract.simulator.proveOwnership(credId, defaultWitness);
      expect(isOwner).toBe(true);
    });

    it('should fail validation when an incorrect witness details are provided', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      expect(() => {
        contract.simulator.proveOwnership(credId, alternateWitness);
      }).toThrowError('Invalid private witness details');
    });
  });

  // 4b. Test Selective Disclosure Proof Verification
  describe('proveOwnershipAndDiscloseEmail() circuit', () => {
    it('should validate successfully and disclose the email address when correct witness is provided', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const disclosedEmail = contract.simulator.proveOwnershipAndDiscloseEmail(credId, defaultWitness);
      expect(disclosedEmail).toBe(defaultWitness.email);
    });

    it('should fail validation when an incorrect witness details are provided', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      expect(() => {
        contract.simulator.proveOwnershipAndDiscloseEmail(credId, alternateWitness);
      }).toThrowError('Invalid private witness details');
    });

    it('should fail if credential does not exist', () => {
      expect(() => {
        contract.simulator.proveOwnershipAndDiscloseEmail(9999n, defaultWitness);
      }).toThrowError('Credential does not exist');
    });
  });

  // 5. Test Privacy Validation
  describe('Privacy and Selective Disclosure Validation', () => {
    it('should verify that private witness fields are not stored in the public ledger state', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      const ledgerRecord = contract.simulator.ledger.credentials.get(credId);
      
      // Ensure only public state parameters are accessible in the record
      expect(ledgerRecord).toBeDefined();
      expect(ledgerRecord).toHaveProperty('credentialHash');
      expect(ledgerRecord).toHaveProperty('issuer');
      expect(ledgerRecord).toHaveProperty('credentialType');
      expect(ledgerRecord).toHaveProperty('issueDate');
      expect(ledgerRecord).toHaveProperty('revoked');
      expect(ledgerRecord).toHaveProperty('verificationCount');

      // Assert that none of the private fields exist in the ledger record structure
      const recordKeys = Object.keys(ledgerRecord || {});
      expect(recordKeys).not.toContain('ownerName');
      expect(recordKeys).not.toContain('studentID');
      expect(recordKeys).not.toContain('employeeID');
      expect(recordKeys).not.toContain('email');
      expect(recordKeys).not.toContain('dateOfBirth');
      expect(recordKeys).not.toContain('documentMetadata');
      expect(recordKeys).not.toContain('secretVerificationData');
      expect(recordKeys).not.toContain('salt');
    });

    it('should verify that verification count can be incremented securely', () => {
      const issueDate = BigInt(Date.now());
      contract.simulator.issueCredential(
        issuerAddress,
        credId,
        credHash,
        'Academic Degree',
        issueDate
      );

      contract.simulator.incrementVerification(credId);
      let record = contract.simulator.ledger.credentials.get(credId);
      expect(record?.verificationCount).toBe(1n);

      contract.simulator.incrementVerification(credId);
      record = contract.simulator.ledger.credentials.get(credId);
      expect(record?.verificationCount).toBe(2n);
    });
  });
});
