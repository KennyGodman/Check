import { createClient } from "genlayer-js";
import { localnet, studionet } from "genlayer-js/chains";

// Deployed contract address on GenLayer Studionet
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x9ea42D715f700D0FF0bd036023b4755C0dfe8989";

// Network Selection
const network = import.meta.env.VITE_NETWORK || "localnet";
export const chain = network === "studionet" ? studionet : localnet;

let readClientInstance = null;

// Read-only client (doesn't require MetaMask connection)
export function getReadClient() {
  if (!readClientInstance) {
    readClientInstance = createClient({
      chain
    });
  }
  return readClientInstance;
}

// Write client (requires MetaMask/Rabby provider)
export function getWriteClient(userAddress) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No browser wallet detected.");
  }
  return createClient({
    chain,
    account: userAddress,
    provider: window.ethereum
  });
}

// ------------------------------------------------------------------
// Wallet Connection
// ------------------------------------------------------------------
export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask or Rabby Wallet not found.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts retrieved.");
  }

  // Auto-switch to correct chain network in wallet
  try {
    const chainIdHex = "0x" + chain.id.toString(16);
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (switchError) {
    // If chain doesn't exist, request wallet to add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x" + chain.id.toString(16),
              chainName: chain.name,
              rpcUrls: [chain.rpcUrls.default.http[0]],
              nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }
            }
          ]
        });
      } catch (addError) {
        console.error("Could not add GenLayer network", addError);
      }
    }
  }

  return accounts[0];
}

// ------------------------------------------------------------------
// Contract Reads
// ------------------------------------------------------------------
export async function getSignalCountOnChain() {
  try {
    const client = getReadClient();
    const count = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_signal_count",
      args: []
    });
    return Number(count);
  } catch (err) {
    console.warn("GenLayer read error (get_signal_count):", err.message);
    throw err;
  }
}

export async function getSignalOnChain(signalId) {
  try {
    const client = getReadClient();
    const sig = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_signal",
      args: [BigInt(signalId)]
    });
    return sig;
  } catch (err) {
    console.warn(`GenLayer read error (get_signal ID ${signalId}):`, err.message);
    throw err;
  }
}

export async function getReputationOnChain(userAddress) {
  try {
    const client = getReadClient();
    const rep = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_reputation",
      args: [userAddress]
    });
    return Number(rep);
  } catch (err) {
    console.warn("GenLayer read error (get_reputation):", err.message);
    return 100; // fallback default
  }
}

// ------------------------------------------------------------------
// Contract Writes
// ------------------------------------------------------------------
export async function submitSignalOnChain(userAddress, { symbol, address, price, targetPrice, marketCap, smartHoldersCount, predictionWindow = 300000 }) {
  try {
    const client = getWriteClient(userAddress);
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "submit_signal",
      args: [
        symbol,
        address,
        parseFloat(price),
        parseFloat(targetPrice),
        parseFloat(marketCap),
        BigInt(smartHoldersCount),
        BigInt(Date.now()),
        BigInt(predictionWindow)
      ]
    });
    return txHash;
  } catch (err) {
    console.error("GenLayer write error (submit_signal):", err.message);
    throw err;
  }
}

export async function resolveSignalOnChain(userAddress, signalId) {
  try {
    const client = getWriteClient(userAddress);
    const txHash = await client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "resolve_signal",
      args: [BigInt(signalId), BigInt(Date.now())]
    });
    return txHash;
  } catch (err) {
    console.error("GenLayer write error (resolve_signal):", err.message);
    throw err;
  }
}
