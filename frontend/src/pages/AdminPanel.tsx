import React from 'react';
import { useMidnight } from '../contexts/MidnightContext';
import { ShieldAlert, Trash2, Award, RefreshCw } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { credentials, revokeExistingCredential, refreshCredentials, isLoading } = useMidnight();

  const handleRevoke = async (id: string) => {
    const confirm = window.confirm(`Are you sure you want to revoke credential #${id}? This action is irreversible.`);
    if (!confirm) return;

    try {
      await revokeExistingCredential(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fade-in space-y-8">
      {/* Title */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white-5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Administrative Portal</h2>
          <p className="text-sm text-slate-400">Audit the on-chain ledger state and revoke issued credentials.</p>
        </div>
        <button
          onClick={refreshCredentials}
          disabled={isLoading}
          className="btn btn-secondary flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {credentials.length === 0 ? (
        <div className="card text-center py-16 space-y-4 bg-glass border border-white-5">
          <Award className="w-16 h-16 text-slate-500 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Ledger Registry Empty</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            No credentials have been registered on the simulated/live Midnight ledger yet. Use the Issuer Portal to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-semibold text-white text-sm uppercase tracking-wider text-slate-400">Global Ledger Audit</h3>
          
          <div className="overflow-x-auto rounded-2xl border border-white-5 bg-glass">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white-5 bg-slate-900-50 text-slate-400 text-xs uppercase font-semibold">
                  <th className="p-4">Cred ID</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Hash Commitment</th>
                  <th className="p-4">Issuer</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white-5 text-slate-300">
                {credentials.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900-20 transition-colors">
                    <td className="p-4 font-bold text-white font-mono">#{c.id}</td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500-10 text-violet-300 border border-violet-500-20">
                        {c.credentialType}
                      </span>
                    </td>
                    <td className="p-4">
                      <code className="text-xs font-mono text-indigo-300 break-all max-w-xs block truncate" title={`0x${c.credentialHash}`}>
                        0x{c.credentialHash}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs break-all max-w-xs block truncate" title={c.issuer}>
                        {c.issuer}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.revoked 
                          ? 'bg-red-500-10 border border-red-500-20 text-red-400' 
                          : 'bg-green-500-10 border border-green-500-20 text-green-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.revoked ? 'bg-red-400' : 'bg-green-400'}`} />
                        <span>{c.revoked ? 'Revoked' : 'Active'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {!c.revoked ? (
                        <button
                          onClick={() => handleRevoke(c.id)}
                          disabled={isLoading}
                          className="btn py-1.5 px-3 bg-red-500-10 border border-red-500-20 text-red-400 hover:bg-red-500-20 text-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Revoked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900-30 border border-white-5 flex gap-3 text-xs text-slate-400">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-300 mb-1">Administrative Rules Checklist:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Only the matching Issuer Wallet address is authorized to submit revocation signatures to the ledger.</li>
                <li>Once a credential's revocation state transitions to <code>true</code>, all ZK ownership proofs generated by the holder will fail validation checks.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
