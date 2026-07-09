// Lace Wallet Service for the Midnight Network

export interface WalletState {
  address: string;
  networkId: string;
  isConnected: boolean;
  isInstalled: boolean;
}

export class LaceWalletService {
  private api: any = null;

  // Checks if the mnLace extension is present in the browser
  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!(window as any).midnight?.mnLace;
  }

  // Connects to the Lace wallet
  async connect(): Promise<WalletState> {
    if (!this.isInstalled()) {
      return {
        address: '',
        networkId: '',
        isConnected: false,
        isInstalled: false,
      };
    }

    try {
      const mnLace = (window as any).midnight.mnLace;
      this.api = await mnLace.enable();
      const state = await this.api.state();
      const config = await this.api.serviceUriConfig().catch(() => ({}));

      // Fallback network ID check
      const networkId = state.networkId || config.networkId || 'preprod';

      return {
        address: state.address,
        networkId: networkId,
        isConnected: true,
        isInstalled: true,
      };
    } catch (error) {
      console.error('Failed to connect to Lace Wallet:', error);
      throw error;
    }
  }

  // Disconnects / clears connection details
  async disconnect(): Promise<void> {
    this.api = null;
  }

  // Validates if the wallet is connected to the right network
  async validateNetwork(expectedNetwork: string = 'preprod'): Promise<boolean> {
    if (!this.api) return false;
    try {
      const state = await this.api.state();
      const config = await this.api.serviceUriConfig().catch(() => ({}));
      const currentNetwork = state.networkId || config.networkId || 'preprod';
      return currentNetwork.toLowerCase() === expectedNetwork.toLowerCase();
    } catch {
      return false;
    }
  }

  // Gets the current address
  async getAddress(): Promise<string> {
    if (!this.api) return '';
    try {
      const state = await this.api.state();
      return state.address;
    } catch {
      return '';
    }
  }
}

export const laceWalletService = new LaceWalletService();
