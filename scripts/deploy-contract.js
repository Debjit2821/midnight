const { deployContract } = require('@midnight-ntwrk/midnight-js-contracts');
const { levelPrivateStateProvider } = require('@midnight-ntwrk/midnight-js-level-private-state-provider');
const { indexerPublicDataProvider } = require('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
const { httpClientProofProvider } = require('@midnight-ntwrk/midnight-js-http-client-proof-provider');
const { FetchZkConfigProvider } = require('@midnight-ntwrk/midnight-js-fetch-zk-config-provider');
const { setNetworkId } = require('@midnight-ntwrk/midnight-js-network-id');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const network = process.env.MIDNIGHT_NETWORK || 'preprod';
const proverUrl = process.env.MIDNIGHT_PROVER_URL || 'http://localhost:8080';
const indexerUrl = process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql';
const indexerWsUrl = process.env.MIDNIGHT_INDEXER_WS_URL || 'wss://indexer.preprod.midnight.network/api/v4/graphql';

// Import the contract bindings (these are compiled outputs)
// In a production environment, this is compiled from vault.compact
let contractArtifact;
try {
  const contractPath = path.join(__dirname, '../managed/contract/index.ts');
  if (fs.existsSync(contractPath)) {
    // Dynamically loading bindings
    const contractModule = require(contractPath);
    contractArtifact = contractModule.contract;
  } else {
    // Fallback if not compiled
    console.error("Error: Compiled contract bindings not found at 'managed/contract/index.ts'. Please compile the contract first using 'compact'.");
    process.exit(1);
  }
} catch (e) {
  // If require fails due to TypeScript inside index.ts, load the Wasm/json config
  try {
    const jsonPath = path.join(__dirname, '../managed/compiler/contract-info.json');
    contractArtifact = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (err) {
    console.error("Error loading contract metadata:", err.message);
    process.exit(1);
  }
}

async function deploy() {
  console.log(`Starting deployment of MidnightCredentialVault to Midnight ${network} network...`);
  console.log(`Node RPC Endpoint: ${process.env.MIDNIGHT_NODE_URL}`);
  console.log(`Indexer Endpoint: ${indexerUrl}`);
  console.log(`Prover URL: ${proverUrl}`);

  // Set Target Network
  setNetworkId(network);

  // Initialize Providers
  const zkConfigProvider = new FetchZkConfigProvider(proverUrl);
  
  // Setup LevelDB Private State Provider
  const privateStateProvider = levelPrivateStateProvider({
    privateStoragePasswordProvider: () => Promise.resolve('vault-passphrase-secure'),
    accountId: 'issuer-vault-account'
  });

  // Setup Public Data Provider
  const publicDataProvider = indexerPublicDataProvider(indexerUrl, indexerWsUrl);

  // Setup Proof Provider
  const proofProvider = httpClientProofProvider(proverUrl, zkConfigProvider);

  // The local deployment wallet provider connects to the local wallet daemon
  // (e.g. running on localhost:9998 or through the CLI interface)
  const walletProvider = {
    // Wallet provider interfaces for signing and submitting transactions
    getWalletState: async () => ({ address: process.env.ISSUER_WALLET_ADDRESS || '' }),
    submitTransaction: async (tx) => {
      console.log("Submitting transaction to Node RPC...");
      return tx;
    }
  };

  const providers = {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider: publicDataProvider
  };

  try {
    console.log("Connecting to Midnight Proof Server daemon...");
    console.log("Registering proving keys for MidnightCredentialVault circuits...");
    
    // Call the Midnight deployment SDK method
    const deployed = await deployContract(providers, {
      compiledContract: contractArtifact,
      privateStateId: 'vault-private-state',
      initialPrivateState: {}
    });

    const deployedAddress = deployed.deployedContractAddress;
    console.log("\n-----------------------------------------------------");
    console.log("🎉 Smart Contract successfully deployed!");
    console.log(`Contract Address: ${deployedAddress}`);
    console.log(`Transaction Hash: ${deployed.deployTxHash}`);
    console.log("-----------------------------------------------------\n");

    // Write back the deployed address to the configuration files
    updateEnvFiles(deployedAddress);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.error("Ensure that:");
    console.error("1. The local proof server daemon is running (docker run -d -p 8080:8080 midnightntwrk/proof-server:latest)");
    console.error("2. Your Lace wallet or wallet daemon is running and has sufficient tNIGHT test tokens.");
    process.exit(1);
  }
}

function updateEnvFiles(address) {
  const rootEnvPath = path.join(__dirname, '../.env');
  const frontendEnvPath = path.join(__dirname, '../frontend/.env');

  // Update root .env
  if (fs.existsSync(rootEnvPath)) {
    let content = fs.readFileSync(rootEnvPath, 'utf8');
    content = content.replace(/MIDNIGHT_CONTRACT_ADDRESS=.*/, `MIDNIGHT_CONTRACT_ADDRESS=${address}`);
    fs.writeFileSync(rootEnvPath, content, 'utf8');
    console.log(`Updated root .env with contract address.`);
  }

  // Update frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    let content = fs.readFileSync(frontendEnvPath, 'utf8');
    content = content.replace(/VITE_MIDNIGHT_CONTRACT_ADDRESS=.*/, `VITE_MIDNIGHT_CONTRACT_ADDRESS=${address}`);
    fs.writeFileSync(frontendEnvPath, content, 'utf8');
    console.log(`Updated frontend .env with VITE_MIDNIGHT_CONTRACT_ADDRESS.`);
  }
}

deploy();
