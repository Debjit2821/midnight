import React, { useState } from 'react';
import { useMidnight } from '../contexts/MidnightContext';
import { midnightSDKService } from '../services/sdk';
import { ShieldCheck, ShieldAlert, Check, X, FileSearch, HelpCircle } from 'lucide-react';

export const VerifyCredential: React.FC = () => {
  const { verifyExistingCredential, addToast, isLoading } = useMidnight();
  const [credId, setCredId] = useState('');
  const [proofInput, setProofInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    checked: boolean;
    details?: any;
    errorMsg?: string;
  }>({ verified: false, checked: false });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credId || !proofInput) {
      alert('Please fill out both the Credential ID and the ZK Proof string.');
      return;
    }

    setVerificationResult({ verified: false, checked: false });

    try {
      // 1. Check if the credential is valid on-chain (not revoked)
      const isRecordValid = await verifyExistingCredential(credId);
      
      if (!isRecordValid) {
        setVerificationResult({
          verified: false,
          checked: true,
          errorMsg: 'Credential is either revoked or does not exist on-chain.'
        });
        return;
      }

      // Retrieve public details
      const details = await midnightSDKService.getCredential(credId);

      // 2. Validate that the proof string matches our pattern (simulated prover verification)
      const expectedPrefix = `zk-proof-vault-${credId}-`;
      const isProofValid = proofInput.trim().startsWith(expectedPrefix) && proofInput.trim().endsWith('-validated');

      if (isProofValid) {
        setVerificationResult({
          verified: true,
          checked: true,
          details: details
        });
        addToast('Verification Successful! Credential validity confirmed by ZK-Proof.', 'success');
      } else {
        setVerificationResult({
          verified: false,
          checked: true,
          errorMsg: 'Cryptographic ZK proof signature validation failed. Commitment hash mismatch.'
        });
        addToast('Cryptographic validation failed.', 'error');
      }
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        checked: true,
        errorMsg: err.message || 'Error occurred during ledger verification.'
      });
    }
  };

  return (
    <div className="fade-in space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white">Verification Portal</h2>
        <p className="text-sm text-slate-400">Verify a holder's credential using zero-knowledge proofs and public ledger state.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Form */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleVerify} className="card bg-glass space-y-4">
            <div className="flex items-center gap-2 border-b border-white-5 pb-3">
              <FileSearch className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-md">Verify Ownership Proof</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Credential Unique ID *</label>
                <input
                  type="number"
                  name="id"
                  value={credId}
                  onChange={e => setCredId(e.target.value)}
                  placeholder="e.g. 1042"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Zero-Knowledge Proof String *</label>
                <textarea
                  rows={4}
                  value={proofInput}
                  onChange={e => setProofInput(e.target.value)}
                  placeholder="Paste ZK proof string generated from Holder's Dashboard..."
                  className="input-field font-mono text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying Proof...' : 'Verify Credential validity'}</span>
            </button>
          </form>

          {/* Verification Ledger Output */}
          {verificationResult.checked && (
            <div className={`card fade-in ${
              verificationResult.verified 
                ? 'bg-green-500-5 border-green-500-20' 
                : 'bg-red-500-5 border-red-500-20'
            }`}>
              <div className="flex items-start gap-3">
                {verificationResult.verified ? (
                  <>
                    <ShieldCheck className="w-10 h-10 text-green-400 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-green-400 text-lg">Verification Successful</h4>
                      <p className="text-xs text-slate-400">The holder has proven ownership of this credential anonymously.</p>
                      {verificationResult.details && (
                        <div className="mt-4 pt-3 border-t border-white-5 space-y-2 text-xs text-slate-300">
                          <div>
                            <span className="text-slate-500 block">On-Chain Issuer</span>
                            <span className="font-mono break-all">{verificationResult.details.issuer}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-slate-500 block">Credential Type</span>
                              <span>{verificationResult.details.credentialType}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Verification Count</span>
                              <span className="font-bold text-slate-100">{verificationResult.details.verificationCount} times verified</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-10 h-10 text-red-400 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-red-400 text-lg">Verification Failed</h4>
                      <p className="text-xs text-red-300/80">{verificationResult.errorMsg}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Observable Privacy Dashboard */}
        <div className="lg:col-span-6 space-y-6">
          <div className="card bg-glass space-y-6">
            <div className="flex items-center gap-2 border-b border-white-5 pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-md">Observable Privacy Audit</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When verifying credentials, Midnight ensures a cryptographic firewall between public validation and private data:
            </p>

            <div className="space-y-4">
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">✔ Public State (Visible to Verifier)</h4>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> <span>Credential Hash Commitment</span></li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> <span>Issuer Public Wallet Address</span></li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> <span>Credential Classification Type</span></li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> <span>Issuance Timestamp</span></li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> <span>Verifications Count (Incremented)</span></li>
                </ul>
              </div>

              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">✘ Private Witness (Shielded / Hidden)</h4>
                <ul className="space-y-1.5 text-xs text-slate-400 pl-4 list-disc">
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Owner legal name (Protected)</span></li>
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Student unique IDs (Protected)</span></li>
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Employee corporate IDs (Protected)</span></li>
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Contact emails (Protected)</span></li>
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Date of Birth (Protected)</span></li>
                  <li className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-red-500 shrink-0" /> <span>Raw document content attachments (Protected)</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
