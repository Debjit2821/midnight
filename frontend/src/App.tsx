import React, { useState } from 'react';
import { MidnightProvider, useMidnight } from './contexts/MidnightContext';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { IssuerDashboard } from './pages/IssuerDashboard';
import { VerifyCredential } from './pages/VerifyCredential';
import { AdminPanel } from './pages/AdminPanel';
import { Shield, Wallet, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const {
    wallet,
    mode,
    toggleMode,
    connectWallet,
    disconnectWallet,
    toasts,
    removeToast,
    isLoading,
    activeTxStatus,
  } = useMidnight();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'dashboard':
        return <Dashboard />;
      case 'issuer':
        return <IssuerDashboard />;
      case 'verify':
        return <VerifyCredential />;
      case 'admin':
        return <AdminPanel />;
      case 'about':
        return <About />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substr(0, 6)}...${addr.substr(addr.length - 4)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white-5 bg-glass backdrop-filter backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-md tracking-tight leading-none">Midnight Vault</h1>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Credential Registry</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 md:gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'issuer', label: 'Issuer Portal' },
              { id: 'verify', label: 'Verification' },
              { id: 'admin', label: 'Admin Ledger' },
              { id: 'about', label: 'About' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white-5 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white-5/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Wallet Actions / Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* Simulation/Live Switch */}
            <div className="flex items-center gap-2 bg-slate-900-50 border border-white-5 rounded-full px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Demo Mode</span>
              <button
                onClick={toggleMode}
                className="text-violet-400 hover:text-violet-300"
                title={mode === 'demo' ? 'Switch to Live Wallet' : 'Switch to Simulation'}
              >
                {mode === 'demo' ? (
                  <ToggleRight className="w-6 h-6 text-violet-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-500" />
                )}
              </button>
            </div>

            {/* Wallet Button */}
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-500-10 to-violet-500-10 border border-violet-500-20 rounded-xl px-3 py-1.5">
                <Wallet className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-mono text-violet-300 font-semibold" title={wallet.address}>
                  {truncateAddress(wallet.address)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="text-slate-500 hover:text-red-400 text-xs pl-2 border-l border-white-10 ml-1 font-semibold"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-secondary py-1.5 px-3 flex items-center gap-2 text-xs"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Lace Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-white-5 py-6 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© 2026 Midnight Credential Vault. Powered by Compact Circuits & ZKPs.</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${mode === 'demo' ? 'bg-amber-400' : 'bg-green-400'}`} />
              <span>{mode === 'demo' ? 'Simulator Active' : 'Live preprod'}</span>
            </span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>

      {/* Transacting / Prover Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-violet-400">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2 max-w-sm px-6">
            <h4 className="font-bold text-white text-lg">Blockchain Event Triggered</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{activeTxStatus}</p>
            <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mx-auto mt-2">
              <div className="skeleton-text w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {/* Toast Alerts Container */}
      <div className="toasts-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast ${
              toast.type === 'success'
                ? 'toast-success'
                : toast.type === 'error'
                ? 'toast-error'
                : 'toast-info'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mr-3" />
            <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-white/70 hover:text-white pl-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <MidnightProvider>
      <AppContent />
    </MidnightProvider>
  );
};

export default App;
