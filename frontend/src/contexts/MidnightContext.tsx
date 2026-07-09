import React, { createContext, useContext, useState, useEffect } from 'react';
import { laceWalletService } from '../services/lace';
import type { WalletState } from '../services/lace';
import { midnightSDKService } from '../services/sdk';
import type { CredentialRecord } from '../services/sdk';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface MidnightContextType {
  wallet: WalletState;
  mode: 'live' | 'demo';
  credentials: CredentialRecord[];
  toasts: Toast[];
  isLoading: boolean;
  activeTxStatus: string;
  toggleMode: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshCredentials: () => Promise<void>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  issueNewCredential: (id: string, type: string, witness: any) => Promise<void>;
  verifyExistingCredential: (id: string) => Promise<boolean>;
  generateOwnershipProof: (id: string, witness: any) => Promise<{ proof: string; isValid: boolean }>;
  revokeExistingCredential: (id: string) => Promise<void>;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export const MidnightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    networkId: '',
    isConnected: false,
    isInstalled: false,
  });
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTxStatus, setActiveTxStatus] = useState('');

  // Sync mode and caller details to the SDK service
  useEffect(() => {
    midnightSDKService.setMode(mode === 'demo');
    if (mode === 'demo') {
      // In demo mode, simulate an issuer address if not connected
      midnightSDKService.setCaller(wallet.address || '0x4f88b8...a7e32');
    } else {
      midnightSDKService.setCaller(wallet.address);
    }
  }, [mode, wallet.address]);

  // Load credentials on initialization or mode switch
  useEffect(() => {
    refreshCredentials();
    setWallet(prev => ({
      ...prev,
      isInstalled: laceWalletService.isInstalled()
    }));
  }, [mode]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleMode = () => {
    const nextMode = mode === 'live' ? 'demo' : 'live';
    setMode(nextMode);
    addToast(`Switched to ${nextMode === 'live' ? 'Live Wallet Mode' : 'Ledger Simulation Mode'}`, 'info');
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setActiveTxStatus('Connecting to Lace Wallet...');
    try {
      if (!laceWalletService.isInstalled()) {
        addToast('Lace Wallet extension is not installed.', 'error');
        setWallet(prev => ({ ...prev, isInstalled: false }));
        setIsLoading(false);
        setActiveTxStatus('');
        return;
      }

      const state = await laceWalletService.connect();
      setWallet(state);
      midnightSDKService.setCaller(state.address);

      if (state.isConnected) {
        addToast('Connected to Lace Wallet!', 'success');
        // Automatically switch to live mode once wallet is authorized
        setMode('live');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to connect to Lace Wallet', 'error');
    } finally {
      setIsLoading(false);
      setActiveTxStatus('');
    }
  };

  const disconnectWallet = async () => {
    await laceWalletService.disconnect();
    setWallet({
      address: '',
      networkId: '',
      isConnected: false,
      isInstalled: laceWalletService.isInstalled(),
    });
    midnightSDKService.setCaller('');
    setMode('demo');
    addToast('Disconnected wallet. Switched to Simulation Mode.', 'info');
  };

  const refreshCredentials = async () => {
    try {
      const list = await midnightSDKService.getCredentials();
      setCredentials(list);
    } catch (e) {
      console.error(e);
    }
  };

  const issueNewCredential = async (id: string, type: string, witness: any) => {
    setIsLoading(true);
    setActiveTxStatus('Generating zero-knowledge commitment and deploying contract...');
    try {
      await midnightSDKService.issueCredential(id, type, witness);
      addToast(`Credential #${id} successfully issued on the ledger!`, 'success');
      await refreshCredentials();
    } catch (err: any) {
      addToast(err.message || 'Failed to issue credential', 'error');
      throw err;
    } finally {
      setIsLoading(false);
      setActiveTxStatus('');
    }
  };

  const verifyExistingCredential = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setActiveTxStatus('Querying ledger status and checking revocation state...');
    try {
      const isValid = await midnightSDKService.verifyCredential(id);
      if (isValid) {
        addToast(`Credential #${id} is VALID and active on-chain.`, 'success');
      }
      return isValid;
    } catch (err: any) {
      addToast(err.message || 'Verification failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
      setActiveTxStatus('');
    }
  };

  const generateOwnershipProof = async (id: string, witness: any) => {
    setIsLoading(true);
    setActiveTxStatus('Connecting to Proof Server & generating zero-knowledge proof...');
    try {
      const result = await midnightSDKService.proveOwnership(id, witness);
      if (result.isValid) {
        addToast('ZK-SNARK proof successfully generated!', 'success');
        // Update verification count as part of mock workflow
        await midnightSDKService.incrementVerification(id);
        await refreshCredentials();
      } else {
        addToast('Invalid credential witness details.', 'error');
      }
      return result;
    } catch (err: any) {
      addToast(err.message || 'Proof generation failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
      setActiveTxStatus('');
    }
  };

  const revokeExistingCredential = async (id: string) => {
    setIsLoading(true);
    setActiveTxStatus('Submitting revocation transaction to the blockchain...');
    try {
      await midnightSDKService.revokeCredential(id);
      addToast(`Credential #${id} revoked successfully.`, 'success');
      await refreshCredentials();
    } catch (err: any) {
      addToast(err.message || 'Revocation failed', 'error');
      throw err;
    } finally {
      setIsLoading(false);
      setActiveTxStatus('');
    }
  };

  return (
    <MidnightContext.Provider
      value={{
        wallet,
        mode,
        credentials,
        toasts,
        isLoading,
        activeTxStatus,
        toggleMode,
        connectWallet,
        disconnectWallet,
        refreshCredentials,
        addToast,
        removeToast,
        issueNewCredential,
        verifyExistingCredential,
        generateOwnershipProof,
        revokeExistingCredential,
      }}
    >
      {children}
    </MidnightContext.Provider>
  );
};

export const useMidnight = () => {
  const context = useContext(MidnightContext);
  if (!context) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
};
