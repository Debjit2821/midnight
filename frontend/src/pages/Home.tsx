import React from 'react';
import { useMidnight } from '../contexts/MidnightContext';
import { Shield, Eye, Award, CheckCircle, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { mode, toggleMode, wallet, connectWallet } = useMidnight();

  return (
    <div className="fade-in space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 relative overflow-hidden rounded-3xl bg-glass border border-white-10">
        <div className="absolute inset-0 bg-gradient-radial from-violet-500-10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500-10 border border-violet-500-20 text-violet-300 text-sm mb-4">
            <Shield className="w-4 h-4 animate-pulse" />
            <span>Midnight Builder Challenge Level 3 Edition</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-300 bg-clip-text text-transparent">
            Midnight Credential Vault
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A privacy-first decentralized credential verification platform powered by the Midnight Network. Proving who you are and what you accomplished, without exposing your secrets.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {wallet.isConnected ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn btn-primary flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary flex items-center gap-2"
              >
                <span>Connect Lace Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onNavigate('about')}
              className="btn btn-secondary"
            >
              Learn the Architecture
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover-glow">
          <div className="w-12 h-12 rounded-xl bg-indigo-500-10 border border-indigo-500-20 flex items-center justify-center text-indigo-400 mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Public Ledger State</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Only non-sensitive metadata (such as credential ID, expiration dates, revocation status, and verification counts) is recorded directly on-chain, keeping the blockchain ledger lightweight and secure.
          </p>
        </div>

        <div className="card hover-glow">
          <div className="w-12 h-12 rounded-xl bg-violet-500-10 border border-violet-500-20 flex items-center justify-center text-violet-400 mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Private Witness</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sensitive user fields (such as legal name, employee/student IDs, birth dates, and contact emails) remain strictly client-side. They are never published, sent to centralized databases, or recorded on the public ledger.
          </p>
        </div>

        <div className="card hover-glow">
          <div className="w-12 h-12 rounded-xl bg-purple-500-10 border border-purple-500-20 flex items-center justify-center text-purple-400 mb-6">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Selective Disclosure</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Users generate off-chain Zero-Knowledge Proofs (ZKPs) verifying that they own a valid credential matching the public hash commitment, selectively disclosing only what is necessary to the verifier.
          </p>
        </div>
      </section>

      {/* Setup Guide / Quickstart */}
      <section className="card bg-glass relative">
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            mode === 'demo' ? 'bg-amber-500-10 border border-amber-500-20 text-amber-400' : 'bg-green-500-10 border border-green-500-20 text-green-400'
          }`}>
            {mode === 'demo' ? 'Ledger Simulator Active' : 'Live Wallet Active'}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Interactive Playbook</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-slate-300">
              This application has a dual-mode integration to accommodate developers testing without running a local proof server or having Preprod tokens:
            </p>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span><strong>Simulation Mode:</strong> Fully simulates the Compact VM, Lace Wallet address injection, and off-chain prover server using your browser's localStorage. Ideal for immediate review and testing.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                <span><strong>Live Mode:</strong> Attempts connection to a real running Lace wallet extension. Will interact with a live Midnight testnet node and request transaction signing.</span>
              </li>
            </ul>
            <div className="pt-2">
              <button onClick={toggleMode} className="btn btn-secondary text-xs">
                Switch to {mode === 'demo' ? 'Live Wallet' : 'Local Simulator'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900-50 rounded-2xl border border-white-5 p-6 space-y-4">
            <h4 className="font-semibold text-white">How to test the credential lifecycle:</h4>
            <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
              <li>Open the <strong className="text-slate-200">Issuer Portal</strong> and issue a credential (e.g. ID: <code className="text-violet-300">101</code>) with details.</li>
              <li>Go to the <strong className="text-slate-200">Dashboard</strong> to view your issued credential and click "Generate Zero-Knowledge Proof".</li>
              <li>Save the generated proof signature.</li>
              <li>Open the <strong className="text-slate-200">Verification</strong> page, input the credential ID, and click "Verify". Watch the validation complete successfully and increment the ledger's verification count.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};
