import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import InflowMonitor from './components/InflowMonitor';
import SmartLeaderboard from './components/SmartLeaderboard';
import SignalScreener from './components/SignalScreener';
import TokenDetailModal from './components/TokenDetailModal';
import SimulationConsole from './components/SimulationConsole';
import NotificationModal from './components/NotificationModal';

import {
  initialWallets,
  initialTokens,
  initialTransactions,
  calculateProbabilityScore,
  generateSimulatedTrade
} from './utils/mockData';

import {
  connectWallet,
  submitSignalOnChain,
  resolveSignalOnChain,
  getSignalOnChain,
  getSignalCountOnChain,
  getReputationOnChain
} from './lib/genlayerClient';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallets, setWallets] = useState(initialWallets);
  const [tokens, setTokens] = useState(initialTokens);
  const [transactions, setTransactions] = useState(initialTransactions);
  
  // Wallet & Reputation states
  const [walletAddress, setWalletAddress] = useState("");
  const [reputation, setReputation] = useState(100);
  const [blockchainSignals, setBlockchainSignals] = useState([]);
  const [resolvingSignalId, setResolvingSignalId] = useState(null);
  const [isGenLayerConnected, setIsGenLayerConnected] = useState(false);

  // Notification Modal State
  const [alertState, setAlertState] = useState({ isOpen: false, title: "", message: "" });
  const triggerAlert = (title, message) => setAlertState({ isOpen: true, title, message });
  const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));

  // Theme configuration
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Modal selector states
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState(null);

  // Simulator configurations
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);
  const [simulationInterval, setSimulationInterval] = useState(6000); // 6s defaults

  // Synchronous Refs for simulator tracking (avoids stale closures and resets)
  const walletsRef = useRef(wallets);
  const tokensRef = useRef(tokens);
  const transactionsRef = useRef(transactions);

  useEffect(() => { walletsRef.current = wallets; }, [wallets]);
  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { transactionsRef.current = transactions; }, [transactions]);

  // Synchronize on-chain predictions ledger
  const loadBlockchainData = useCallback(async (address) => {
    try {
      const count = await getSignalCountOnChain();
      setIsGenLayerConnected(true);
      const loadedSignals = [];
      for (let i = 0; i < count; i++) {
        const sigData = await getSignalOnChain(i);
        loadedSignals.push({
          id: i,
          submitter: sigData.submitter || sigData[0],
          symbol: sigData.symbol || sigData[1],
          tokenAddress: sigData.token_address || sigData[2],
          entryPrice: Number(sigData.entry_price || sigData[3]),
          targetPrice: Number(sigData.target_price || sigData[4]),
          mcap: Number(sigData.mcap || sigData[5]),
          walletOverlap: Number(sigData.wallet_overlap || sigData[6]),
          status: sigData.status || sigData[7],
          verdictReason: sigData.verdict_reason || sigData[8],
          timestamp: Number(sigData.timestamp || sigData[9]),
          predictionWindow: Number(sigData.prediction_window || sigData[10] || 300000)
        });
      }
      setBlockchainSignals(loadedSignals);
      if (address) {
        const rep = await getReputationOnChain(address);
        setReputation(rep);
      }
    } catch (err) {
      console.warn("GenLayer node unreachable. Running in client-side consensus mode.");
      setIsGenLayerConnected(false);
      // Fallback pre-populated predictions ledger for sandbox feel
      setBlockchainSignals(prev => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 0,
            submitter: address || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31",
            symbol: "KRONOS",
            tokenAddress: "KrOnOS7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C",
            entryPrice: 0.0037,
            targetPrice: 0.0044,
            mcap: 4120000,
            walletOverlap: 2,
            status: "success",
            verdictReason: "DEX pool evaluation verified current price $0.0048 successfully hit target $0.0044.",
            timestamp: Date.now() - 3600000,
            predictionWindow: 300000
          },
          {
            id: 1,
            submitter: address || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31",
            symbol: "NEXUS",
            tokenAddress: "7xxNExuS2pQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXW",
            entryPrice: 0.095,
            targetPrice: 0.114,
            mcap: 10500000,
            walletOverlap: 2,
            status: "pending",
            verdictReason: "",
            timestamp: Date.now() - 120000,
            predictionWindow: 300000
          }
        ];
      });
    }
  }, []);

  // Check connection on load
  useEffect(() => {
    loadBlockchainData(walletAddress);
  }, [walletAddress, loadBlockchainData]);

  // Wallet connection trigger
  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await loadBlockchainData(address);
    } catch (err) {
      console.warn("Browser wallet connect failed:", err.message);
      // Fallback connection for visual testing
      const mockAddress = "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31";
      setWalletAddress(mockAddress);
      await loadBlockchainData(mockAddress);
    }
  };

  // Submit prediction signal to GenLayer contract
  const handleRegisterSignal = async (token, windowMs = 300000) => {
    if (!walletAddress) {
      triggerAlert("Wallet Connection Required", "Please connect your GenLayer wallet first.");
      return;
    }

    const targetPrice = token.price * 1.20; // 20% gain target

    try {
      const tx = await submitSignalOnChain(walletAddress, {
        symbol: token.symbol,
        address: token.address,
        price: token.price,
        targetPrice,
        marketCap: token.marketCap,
        smartHoldersCount: token.smartHoldersCount,
        predictionWindow: windowMs
      });
      console.log("GenLayer Transaction Hash:", tx);
      await loadBlockchainData(walletAddress);
      triggerAlert("Signal Registered", `Signal for $${token.symbol} successfully registered on GenLayer with an enforced ${Math.round(windowMs / 60000)}-min prediction window! Tx Hash: ${tx.slice(0, 10)}...`);
    } catch (err) {
      console.warn("Smart contract write failed, creating local simulation prediction:", err.message);
      const newId = blockchainSignals.length;
      const newSig = {
        id: newId,
        submitter: walletAddress,
        symbol: token.symbol,
        tokenAddress: token.address,
        entryPrice: token.price,
        targetPrice,
        mcap: token.marketCap,
        walletOverlap: token.smartHoldersCount,
        status: "pending",
        verdictReason: "",
        timestamp: Date.now(),
        predictionWindow: windowMs
      };
      setBlockchainSignals(prev => [...prev, newSig]);
      triggerAlert("Signal Simulation Registered", `Signal for $${token.symbol} registered with an enforced ${Math.round(windowMs / 60000)}-min prediction window lock!`);
    }
  };

  // Resolve prediction and execute multi-validator consensus
  const handleResolveSignal = async (signalId) => {
    if (!walletAddress) return;

    // Enforce prediction window check before resolving
    const sig = blockchainSignals.find(s => s.id === signalId);
    if (sig) {
      const windowEnd = sig.timestamp + (sig.predictionWindow || 300000);
      const now = Date.now();
      if (now < windowEnd) {
        const remainingSec = Math.ceil((windowEnd - now) / 1000);
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        triggerAlert(
          "Prediction Window Active",
          `Cannot resolve signal #${signalId} yet. Enforced prediction window lock active to prevent reputation farming (${mins}m ${secs}s remaining).`
        );
        return;
      }
    }

    setResolvingSignalId(signalId);

    try {
      const tx = await resolveSignalOnChain(walletAddress, signalId);
      console.log("Consensus execution Tx Hash:", tx);
      await loadBlockchainData(walletAddress);
      setResolvingSignalId(null);
      triggerAlert("Consensus Successful", `Consensus execution successful! Verdict updated on-chain.`);
    } catch (err) {
      console.warn("Consensus transaction failed, starting client-side validator engine:", err.message);
      
      // Simulate validator delay
      setTimeout(() => {
        setBlockchainSignals(prev => {
          return prev.map(sig => {
            if (sig.id === signalId) {
              const activeToken = tokensRef.current.find(t => t.symbol === sig.symbol);
              const currentPrice = activeToken ? activeToken.price : sig.entryPrice * 1.15;
              const hitTarget = currentPrice >= sig.targetPrice;

              // Modify reputation points
              if (hitTarget) {
                setReputation(r => r + 15);
              } else {
                setReputation(r => Math.max(r - 10, 0));
              }

              return {
                ...sig,
                status: hitTarget ? "success" : "failed",
                verdictReason: `DEX validation consensus finalized. Current price $${currentPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })} ${
                  hitTarget ? 'met or exceeded' : 'failed to meet'
                } target benchmark $${sig.targetPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}.`
              };
            }
            return sig;
          });
        });
        setResolvingSignalId(null);
        triggerAlert("Consensus Simulation Complete", `GenLayer consensus simulation complete! Validation checks logged in the ledger.`);
      }, 2500);
    }
  };

  // Unified Transaction Runner Engine
  const runSimulatedTrade = useCallback((customDetails = null) => {
    const currentWallets = walletsRef.current;
    const currentTokens = tokensRef.current;
    const currentTxs = transactionsRef.current;

    if (currentWallets.length === 0) return;

    let tradeDetails;
    if (customDetails) {
      const { walletAddress, tokenSymbol, type, valueUsd } = customDetails;
      const walletObj = currentWallets.find(w => w.address === walletAddress);
      const tokenObj = currentTokens.find(t => t.symbol === tokenSymbol);
      if (!walletObj || !tokenObj) return;

      const tokenPrice = tokenObj.price;
      const amount = Math.round(valueUsd / tokenPrice);

      const newTx = {
        id: `tx-inject-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        walletAddress: walletObj.address,
        walletName: walletObj.name,
        type,
        tokenSymbol,
        tokenName: tokenObj.name,
        amount,
        valueUsd: Math.round(valueUsd),
        price: tokenPrice,
        txHash: `SCANNER-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(7, 11).toUpperCase()}`
      };

      tradeDetails = { newTx, tokenSymbol, tokenPrice, isBuy: type === 'BUY', wallet: walletObj, usdValue: valueUsd, amount };
    } else {
      tradeDetails = generateSimulatedTrade(currentWallets, currentTokens, currentTxs);
    }

    if (!tradeDetails) return;

    const { newTx, tokenSymbol, tokenPrice, isBuy, wallet, usdValue, amount } = tradeDetails;

    // 1. Calculate Wallet Position Upgrades
    const nextWallets = currentWallets.map(w => {
      if (w.address !== wallet.address) return w;

      let nextHoldings = [...w.holdings];
      const holdingIdx = nextHoldings.findIndex(h => h.symbol === tokenSymbol);

      if (isBuy) {
        if (holdingIdx >= 0) {
          const nextAmount = nextHoldings[holdingIdx].amount + amount;
          nextHoldings[holdingIdx] = {
            ...nextHoldings[holdingIdx],
            amount: nextAmount,
            value: Math.round(nextAmount * tokenPrice)
          };
        } else {
          nextHoldings.push({
            symbol: tokenSymbol,
            amount,
            value: Math.round(amount * tokenPrice)
          });
        }
      } else {
        if (holdingIdx >= 0) {
          const nextAmount = Math.max(nextHoldings[holdingIdx].amount - amount, 0);
          if (nextAmount === 0) {
            nextHoldings = nextHoldings.filter(h => h.symbol !== tokenSymbol);
          } else {
            nextHoldings[holdingIdx] = {
              ...nextHoldings[holdingIdx],
              amount: nextAmount,
              value: Math.round(nextAmount * tokenPrice)
            };
          }
        }
      }

      const nextHistory = [
        {
          type: isBuy ? "BUY" : "SELL",
          tokenSymbol,
          amount,
          price: tokenPrice,
          value: Math.round(usdValue),
          time: "Just now"
        },
        ...w.history
      ].slice(0, 10);

      return {
        ...w,
        holdings: nextHoldings,
        history: nextHistory,
        trades30d: w.trades30d + 1
      };
    });

    // 2. Calculate Token Analytics & Price Shifts
    let nextTokens = currentTokens.map(t => {
      if (t.symbol !== tokenSymbol) return t;

      const priceDeltaPercent = isBuy ? (Math.random() * 2.5 + 0.3) : -(Math.random() * 1.8 + 0.1);
      const nextPrice = Math.max(t.price * (1 + priceDeltaPercent / 100), 0.000001);
      const nextSparkline = [...t.sparkline.slice(1), nextPrice];

      const holdersCount = nextWallets.filter(w => w.holdings.some(h => h.symbol === tokenSymbol)).length;
      const nextInflow = isBuy ? (t.smartInflow + usdValue) : Math.max(t.smartInflow - usdValue, 0);

      return {
        ...t,
        price: nextPrice,
        change24h: parseFloat((t.change24h + priceDeltaPercent).toFixed(2)),
        volume24h: Math.round(t.volume24h + usdValue),
        smartHoldersCount: holdersCount,
        smartInflow: Math.round(nextInflow),
        sparkline: nextSparkline
      };
    });

    const tokenExists = currentTokens.some(t => t.symbol === tokenSymbol);
    if (!tokenExists) {
      const holdersCount = nextWallets.filter(w => w.holdings.some(h => h.symbol === tokenSymbol)).length;
      const initialSparkline = Array(14).fill(tokenPrice * 0.95).concat([tokenPrice]);

      nextTokens.push({
        symbol: tokenSymbol,
        name: newTx.tokenName,
        address: `SOL-Mint-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        price: tokenPrice,
        change24h: isBuy ? 3.4 : -1.5,
        volume24h: Math.round(usdValue),
        smartHoldersCount: holdersCount,
        smartInflow: Math.round(isBuy ? usdValue : 0),
        avgEntryPrice: tokenPrice,
        category: "Meme",
        probabilityScore: 40,
        sparkline: initialSparkline
      });
    }

    // 3. Recalculate probability score outcomes for all active listings
    const nextTxs = [newTx, ...currentTxs].slice(0, 50);
    nextTokens = nextTokens.map(t => {
      const newScore = calculateProbabilityScore(t, nextWallets, nextTxs);
      return {
        ...t,
        probabilityScore: newScore
      };
    });

    // Commit state changes
    setWallets(nextWallets);
    setTokens(nextTokens);
    setTransactions(nextTxs);

  }, []);

  // Set up live simulation loop
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      runSimulatedTrade();
    }, simulationInterval);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationInterval, runSimulatedTrade]);

  // Wallet CRUD controls
  const handleAddWallet = (newWalletObj) => {
    setWallets(prev => [newWalletObj, ...prev]);
  };

  const handleDeleteWallet = (walletAddress) => {
    setWallets(prev => prev.filter(w => w.address !== walletAddress));
  };

  const handleResetData = () => {
    setWallets(initialWallets);
    setTokens(initialTokens);
    setTransactions(initialTransactions);
  };

  const handleClearData = () => {
    setTransactions([]);
  };

  // Helper selectors
  const handleSelectToken = (symbol) => {
    setSelectedTokenSymbol(symbol);
  };

  const handleSelectWallet = (address) => {
    setSelectedWalletAddress(address);
    setActiveTab('leaderboard');
  };

  const activeToken = tokens.find(t => t.symbol === selectedTokenSymbol);

  // App metrics summary
  const appStats = {
    highSignals: tokens.filter(t => t.probabilityScore >= 60).length
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--text-main)] radial-glow grid-bg select-none transition-colors duration-200">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSimulationRunning={isSimulationRunning}
        stats={appStats}
        walletAddress={walletAddress}
        reputation={reputation}
        onConnectWallet={handleConnectWallet}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        isGenLayerConnected={isGenLayerConnected}
      />

      {/* Main View Container */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <InflowMonitor
            transactions={transactions}
            tokens={tokens}
            wallets={wallets}
            onSelectToken={handleSelectToken}
            onSelectWallet={handleSelectWallet}
            triggerSimulatedTrade={() => runSimulatedTrade()}
          />
        )}

        {activeTab === 'leaderboard' && (
          <SmartLeaderboard
            wallets={wallets}
            onAddWallet={handleAddWallet}
            onDeleteWallet={handleDeleteWallet}
            onSelectToken={handleSelectToken}
          />
        )}

        {activeTab === 'screener' && (
          <SignalScreener
            tokens={tokens}
            onSelectToken={handleSelectToken}
            walletAddress={walletAddress}
            onRegisterSignal={handleRegisterSignal}
            blockchainSignals={blockchainSignals}
            onResolveSignal={handleResolveSignal}
            resolvingSignalId={resolvingSignalId}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationConsole
            isSimulationRunning={isSimulationRunning}
            setIsSimulationRunning={setIsSimulationRunning}
            simulationInterval={simulationInterval}
            setSimulationInterval={setSimulationInterval}
            wallets={wallets}
            tokens={tokens}
            triggerSimulatedTrade={() => runSimulatedTrade()}
            onResetData={handleResetData}
            onClearData={handleClearData}
            customInjectTrade={(details) => runSimulatedTrade(details)}
          />
        )}
      </main>

      {/* Detailed Flows Modal */}
      {selectedTokenSymbol && (
        <TokenDetailModal
          token={activeToken}
          wallets={wallets}
          onClose={() => setSelectedTokenSymbol(null)}
        />
      )}

      {/* Custom Notification Modal */}
      <NotificationModal
        isOpen={alertState.isOpen}
        title={alertState.title}
        message={alertState.message}
        onClose={closeAlert}
      />
    </div>
  );
}
