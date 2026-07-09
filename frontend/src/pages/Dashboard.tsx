import React, { useState, useEffect } from 'react';
import { useMidnight } from '../contexts/MidnightContext';
import { midnightSDKService } from '../services/sdk';
import type { CredentialRecord } from '../services/sdk';
import { Shield, Eye, EyeOff, Award, Copy, Check, Cpu, Mail } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { credentials, generateOwnershipProof, generateOwnershipProofAndDiscloseEmail, addToast, isLoading } = useMidnight();
  const [myCredentials, setMyCredentials] = useState<CredentialRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [showPrivate, setShowPrivate] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string>('');
  const [generatedProof, setGeneratedProof] = useState<string>('');

  // Filtering credentials that have a corresponding private witness in our browser vault
  useEffect(() => {
    const list: CredentialRecord[] = [];
    for (const c of credentials) {
      const witness = midnightSDKService.getPrivateWitness(c.id);
      if (witness) {
        list.push({
          ...c,
          privateWitness: witness as any
        });
      }
    }
    setMyCredentials(list);
    if (list.length > 0 && !selectedId) {
      setSelectedId(list[0].id);
    }
  }, [credentials]);

  const togglePrivateVisibility = (id: string) => {
    setShowPrivate(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateProof = async (record: CredentialRecord) => {
    if (!record.privateWitness) return;
    setGeneratedProof('');
    try {
      const result = await generateOwnershipProof(record.id, record.privateWitness);
      if (result.isValid) {
        setGeneratedProof(result.proof);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateProofAndDiscloseEmail = async (record: CredentialRecord) => {
    if (!record.privateWitness) return;
    setGeneratedProof('');
    try {
      const result = await generateOwnershipProofAndDiscloseEmail(record.id, record.privateWitness);
      if (result.isValid) {
        setGeneratedProof(result.proof);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Proof copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(''), 2000);
  };

  const selectedRecord = myCredentials.find(c => c.id === selectedId);

  return (
    <div className="fade-in space-y-8">
      {/* Title */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Private Credential Vault</h2>
          <p className="text-sm text-slate-400">Manage your credentials, view private witnesses, and generate zero-knowledge ownership proofs.</p>
        </div>
      </div>

      {myCredentials.length === 0 ? (
        <div className="card text-center py-16 space-y-4 bg-glass border border-white-5">
          <Award className="w-16 h-16 text-slate-500 mx-auto" />
          <h3 className="text-xl font-semibold text-white">No Credentials Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You do not currently hold any private credentials. Organizations can issue credentials to your wallet address using the Issuer Portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Credentials List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">My Credentials</h3>
            <div className="space-y-3">
              {myCredentials.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedId(c.id);
                    setGeneratedProof('');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    selectedId === c.id
                      ? 'bg-violet-500-10 border-violet-500-40 shadow-violet'
                      : 'bg-glass border-white-5 hover:border-white-20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-violet-500-20 text-violet-300">
                      {c.credentialType}
                    </span>
                    <span className="text-xs text-slate-500">ID: {c.id}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">
                    {c.privateWitness?.ownerName || 'Private Name'}
                  </h4>
                  <div className="flex justify-between items-center mt-3 text-xs text-slate-400">
                    <span>Verifications: {c.verificationCount}</span>
                    <span className={c.revoked ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
                      {c.revoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Inspection / Prover Panel */}
          <div className="lg:col-span-8 space-y-6">
            {selectedRecord && (
              <div className="space-y-6">
                {/* Visual Distinction: Public vs Private */}
                <div className="card bg-glass space-y-6">
                  <div className="flex justify-between items-center border-b border-white-5 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-violet-400" />
                      <span>Credential #{selectedRecord.id} Inspection</span>
                    </h3>
                    <button
                      onClick={() => togglePrivateVisibility(selectedRecord.id)}
                      className="btn btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs"
                    >
                      {showPrivate[selectedRecord.id] ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Sensitive Fields</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Private Witness</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Public State (Visible on-chain) */}
                    <div className="space-y-4 bg-slate-900-30 p-5 rounded-2xl border border-white-5">
                      <h4 className="font-bold text-indigo-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>Public Ledger State</span>
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-slate-500 block text-xs">Credential Hash Commitment</span>
                          <code className="text-violet-300 break-all text-xs font-mono">
                            0x{selectedRecord.credentialHash}
                          </code>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Issuer Wallet Address</span>
                          <span className="text-slate-200 break-all font-mono text-xs">
                            {selectedRecord.issuer}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">Revocation Status</span>
                            <span className={`font-semibold ${selectedRecord.revoked ? 'text-red-400' : 'text-green-400'}`}>
                              {selectedRecord.revoked ? 'REVOKED' : 'ACTIVE'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Verification Count</span>
                            <span className="text-slate-200 font-semibold">{selectedRecord.verificationCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Private State (Local machine only) */}
                    <div className="space-y-4 bg-violet-950-10 p-5 rounded-2xl border border-violet-500-10">
                      <h4 className="font-bold text-violet-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                        <span>Private Witness (Client-Side)</span>
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-slate-500 block text-xs">Owner Name</span>
                          <span className="text-slate-200 font-semibold">
                            {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.ownerName : '••••••••••••'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">Student ID</span>
                            <span className="text-slate-200 font-mono text-xs">
                              {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.studentID : '••••••••'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Employee ID</span>
                            <span className="text-slate-200 font-mono text-xs">
                              {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.employeeID : '••••••••'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-xs">Email Address</span>
                          <span className="text-slate-200">
                            {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.email : '••••••••••••••••'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-slate-500 block text-xs">Date of Birth</span>
                            <span className="text-slate-200">
                              {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.dateOfBirth : '••••••••'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-xs">Witness Salt</span>
                            <span className="text-slate-200 text-xs break-all font-mono">
                              {showPrivate[selectedRecord.id] ? selectedRecord.privateWitness?.salt.substr(0, 16) + '...' : '••••••••'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selective Disclosure Info Box */}
                  <div className="bg-slate-900-40 p-4 rounded-xl border border-white-5 text-xs text-slate-400">
                    <p className="leading-relaxed">
                      💡 <strong>ZK selective disclosure:</strong> When you generate a proof, the Prover Server takes the entire <em>Private Witness</em> to verify correctness, but it only outputs a single cryptographic signature (proof) to the blockchain. The verifier only learns that your credential is valid and active—your Name, IDs, and Birth Date are completely hidden.
                    </p>
                  </div>

                  {/* Prover Action */}
                  <div className="pt-4 border-t border-white-5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleGenerateProof(selectedRecord)}
                        disabled={isLoading || selectedRecord.revoked}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Cpu className="w-4 h-4" />
                        <span>{isLoading ? 'Generating Proof...' : 'Prove Anonymously'}</span>
                      </button>
                      <button
                        onClick={() => handleGenerateProofAndDiscloseEmail(selectedRecord)}
                        disabled={isLoading || selectedRecord.revoked}
                        className="btn btn-secondary flex items-center gap-2 border border-violet-500/30 hover:border-violet-500/60"
                      >
                        <Mail className="w-4 h-4 text-violet-400" />
                        <span>{isLoading ? 'Generating Proof...' : 'Prove & Disclose Email'}</span>
                      </button>
                    </div>
                    {selectedRecord.revoked && (
                      <span className="text-xs text-red-400 font-semibold">Cannot prove ownership of a revoked credential.</span>
                    )}
                  </div>
                </div>

                {/* Proof Output Box */}
                {generatedProof && (
                  <div className="card bg-emerald-500-5 border-emerald-500-20 space-y-4 fade-in">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        <span>ZK-SNARK Ownership Proof Generated</span>
                      </h4>
                      <button
                        onClick={() => copyToClipboard(generatedProof, 'proof')}
                        className="btn btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                      >
                        {copiedId === 'proof' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Proof</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-white-5 text-xs text-slate-300 font-mono break-all whitespace-pre-wrap select-all">
                      {generatedProof}
                    </pre>
                    <p className="text-xs text-slate-400">
                      ✅ Share this proof string and your Credential ID (<code className="text-violet-300 font-semibold">{selectedRecord.id}</code>) with a verifier to validate ownership anonymously.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
