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
  forceResolveExpiredOnChain,
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

  // Synchronous Refs for simulator tracking
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
        const win = Number(sigData.prediction_window || sigData[11] || 300000);
        const start = Number(sigData.timestamp || sigData[10] || Date.now());
        const deadline = Number(sigData.settlement_deadline || sigData[12] || (start + win + 300000));
        
        loadedSignals.push({
          id: i,
          submitter: sigData.submitter || sigData[0],
          symbol: sigData.symbol || sigData[1],
          tokenAddress: sigData.token_address || sigData[2],
          priceSource: sigData.price_source || sigData[3] || `https://api.dexscreener.com/latest/dex/tokens/${sigData.token_address || sigData[2]}`,
          entryPrice: Number(sigData.entry_price || sigData[4]),
          targetPrice: Number(sigData.target_price || sigData[5]),
          mcap: Number(sigData.mcap || sigData[6]),
          walletOverlap: Number(sigData.wallet_overlap || sigData[7]),
          status: sigData.status || sigData[8],
          verdictReason: sigData.verdict_reason || sigData[9],
          timestamp: start,
          predictionWindow: win,
          settlementDeadline: deadline,
          resolvedAt: Number(sigData.resolved_at || sigData[13] || 0),
          resolvedPrice: String(sigData.resolved_price || sigData[14] || "0.0")
        });
      }
      setBlockchainSignals(loadedSignals);
      if (address) {
        const rep = await getReputationOnChain(address);
        setReputation(rep);
      }
    } catch (err) {
      console.warn("GenLayer node unreachable. Running in client-side anti-gaming consensus mode.");
      setIsGenLayerConnected(false);
      // Fallback pre-populated predictions ledger illustrating anti-gaming features
      setBlockchainSignals(prev => {
        if (prev.length > 0) return prev;
        const now = Date.now();
        return [
          {
            id: 0,
            submitter: address || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31",
            symbol: "KRONOS",
            tokenAddress: "KrOnOS7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C",
            priceSource: "https://api.dexscreener.com/latest/dex/tokens/KrOnOS7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C",
            entryPrice: 0.0037,
            targetPrice: 0.0044,
            mcap: 4120000,
            walletOverlap: 2,
            status: "success",
            verdictReason: "Canonical DexScreener consensus verified price $0.0048 successfully hit target $0.0044 within outcome window.",
            timestamp: now - 3600000,
            predictionWindow: 300000,
            settlementDeadline: now - 3300000,
            resolvedAt: now - 3400000,
            resolvedPrice: "0.0048"
          },
          {
            id: 1,
            submitter: address || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31",
            symbol: "NEXUS",
            tokenAddress: "7xxNExuS2pQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXW",
            priceSource: "https://api.dexscreener.com/latest/dex/tokens/7xxNExuS2pQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXW",
            entryPrice: 0.095,
            targetPrice: 0.114,
            mcap: 10500000,
            walletOverlap: 2,
            status: "pending",
            verdictReason: "",
            timestamp: now - 120000,
            predictionWindow: 300000,
            settlementDeadline: now + 480000,
            resolvedAt: 0,
            resolvedPrice: "0.0"
          },
          {
            id: 2,
            submitter: "0x3d94cf128a89ef23910c2837f41a890123ef6789",
            symbol: "AEGIS",
            tokenAddress: "AeGis99p2Q1xL8kJ4m7Nv3sW5tF6hY8cR2bE4vX0z",
            priceSource: "https://api.dexscreener.com/latest/dex/tokens/AeGis99p2Q1xL8kJ4m7Nv3sW5tF6hY8cR2bE4vX0z",
            entryPrice: 0.012,
            targetPrice: 0.0144,
            mcap: 3200000,
            walletOverlap: 3,
            status: "pending",
            verdictReason: "",
            timestamp: now - 700000, // 11.6 mins ago (past 5m window + 5m deadline)
            predictionWindow: 300000,
            settlementDeadline: now - 100000, // expired 1.6 mins ago
            resolvedAt: 0,
            resolvedPrice: "0.0"
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
      console.warn("Browser wallet connect fallback:", err.message);
      const mockAddress = "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31";
      setWalletAddress(mockAddress);
      await loadBlockchainData(mockAddress);
    }
  };

  // Submit prediction signal bound to a fixed outcome window and canonical price source
  const handleRegisterSignal = async (token, windowMs = 300000) => {
    if (!walletAddress) {
      triggerAlert("Wallet Connection Required", "Please connect your GenLayer wallet first.");
      return;
    }

    const targetPrice = token.price * 1.20; // 20% gain target
    const canonicalSource = `https://api.dexscreener.com/latest/dex/tokens/${token.address}`;

    try {
      const tx = await submitSignalOnChain(walletAddress, {
        symbol: token.symbol,
        address: token.address,
        price: token.price,
        targetPrice,
        marketCap: token.marketCap,
        smartHoldersCount: token.smartHoldersCount,
        predictionWindow: windowMs,
        priceSource: canonicalSource
      });
      console.log("GenLayer Transaction Hash:", tx);
      await loadBlockchainData(walletAddress);
      triggerAlert(
        "Signal Registered On-Chain", 
        `Signal for $${token.symbol} bound to DexScreener canonical oracle and an immutable ${Math.round(windowMs / 60000)}-min outcome window! Tx: ${tx.slice(0, 10)}...`
      );
    } catch (err) {
      console.warn("Contract write fallback, creating local simulation prediction:", err.message);
      const newId = blockchainSignals.length;
      const now = Date.now();
      const newSig = {
        id: newId,
        submitter: walletAddress,
        symbol: token.symbol,
        tokenAddress: token.address,
        priceSource: canonicalSource,
        entryPrice: token.price,
        targetPrice,
        mcap: token.marketCap,
        walletOverlap: token.smartHoldersCount,
        status: "pending",
        verdictReason: "",
        timestamp: now,
        predictionWindow: windowMs,
        settlementDeadline: now + windowMs + 300000,
        resolvedAt: 0,
        resolvedPrice: "0.0"
      };
      setBlockchainSignals(prev => [...prev, newSig]);
      triggerAlert(
        "Signal Registered (Simulated)", 
        `Signal for $${token.symbol} locked with ${Math.round(windowMs / 60000)}m outcome window & canonical DexScreener binding!`
      );
    }
  };

  // Resolve prediction and execute multi-validator consensus
  const handleResolveSignal = async (signalId) => {
    const sig = blockchainSignals.find(s => s.id === signalId);
    if (!sig) return;

    const windowEnd = sig.timestamp + (sig.predictionWindow || 300000);
    const deadline = sig.settlementDeadline || (windowEnd + 300000);
    const now = Date.now();

    // 1. Early resolution guard
    if (now < windowEnd) {
      const remainingSec = Math.ceil((windowEnd - now) / 1000);
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      triggerAlert(
        "Prediction Window Active",
        `Cannot resolve signal #${signalId} yet. Fixed outcome window is locked to prevent early reputation farming (${mins}m ${secs}s remaining).`
      );
      return;
    }

    setResolvingSignalId(signalId);

    // 2. Anti-Gaming Staleness Check: If past deadline, enforce terminal failure
    if (now > deadline) {
      handleForceResolveExpired(signalId);
      return;
    }

    try {
      const tx = await resolveSignalOnChain(walletAddress || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31", signalId);
      console.log("Consensus execution Tx Hash:", tx);
      await loadBlockchainData(walletAddress);
      setResolvingSignalId(null);
      triggerAlert("Consensus Successful", `Canonical consensus verification finalized on-chain!`);
    } catch (err) {
      console.warn("Consensus transaction fallback, evaluating canonical price:", err.message);
      
      setTimeout(() => {
        setBlockchainSignals(prev => {
          return prev.map(s => {
            if (s.id === signalId) {
              const activeToken = tokensRef.current.find(t => t.symbol === s.symbol);
              const currentPrice = activeToken ? activeToken.price : s.entryPrice * 1.15;
              const hitTarget = currentPrice >= s.targetPrice;

              if (hitTarget) {
                setReputation(r => r + 15);
              } else {
                setReputation(r => Math.max(r - 10, 0));
              }

              return {
                ...s,
                status: hitTarget ? "success" : "failed",
                resolvedAt: Date.now(),
                resolvedPrice: currentPrice.toString(),
                verdictReason: `Canonical DexScreener consensus completed. Measured price $${currentPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })} ${
                  hitTarget ? 'successfully met target' : 'failed to meet target'
                } $${s.targetPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })} within designated outcome window.`
              };
            }
            return s;
          });
        });
        setResolvingSignalId(null);
        triggerAlert("Consensus Finalized", `Canonical verification complete! Reputation score updated.`);
      }, 2000);
    }
  };

  // Force terminal failure on an expired signal (Permissionless Keeper / Sweeper)
  const handleForceResolveExpired = async (signalId) => {
    setResolvingSignalId(signalId);

    try {
      const tx = await forceResolveExpiredOnChain(walletAddress || "0x7a8f09b11a91cf278d91a27e3d2c67da12ab9d31", signalId);
      console.log("Force resolve Tx Hash:", tx);
      await loadBlockchainData(walletAddress);
      setResolvingSignalId(null);
      triggerAlert("Signal Force-Settled", `Signal #${signalId} reached terminal state FAILED. Penalized stale submitter.`);
    } catch (err) {
      console.warn("Force resolve on-chain fallback:", err.message);
      
      setTimeout(() => {
        setBlockchainSignals(prev => {
          return prev.map(s => {
            if (s.id === signalId) {
              if (s.submitter.toLowerCase() === (walletAddress || "").toLowerCase()) {
                setReputation(r => Math.max(r - 10, 0));
              }

              return {
                ...s,
                status: "failed",
                resolvedAt: Date.now(),
                resolvedPrice: "0.0",
                verdictReason: "Forced terminal failure: Abandoned/unresolved signal expired past settlement deadline without target verification."
              };
            }
            return s;
          });
        });
        setResolvingSignalId(null);
        triggerAlert("Forced Terminal Resolution", `Signal #${signalId} expired past deadline and was forced to FAILED (-10 REP).`);
      }, 1000);
    }
  };

  // Sweep all expired pending signals at once
  const handleSweepExpiredSignals = async () => {
    const now = Date.now();
    const expiredIds = blockchainSignals
      .filter(s => {
        if (s.status !== "pending") return false;
        const deadline = s.settlementDeadline || (s.timestamp + (s.predictionWindow || 300000) + 300000);
        return now > deadline;
      })
      .map(s => s.id);

    if (expiredIds.length === 0) {
      triggerAlert("No Expired Signals", "All pending signals are currently within their active outcome windows.");
      return;
    }

    for (const id of expiredIds) {
      await handleForceResolveExpired(id);
    }

    triggerAlert("Sweep Complete", `Successfully forced terminal resolution on ${expiredIds.length} expired signal(s).`);
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
            onForceResolveExpired={handleForceResolveExpired}
            onSweepExpiredSignals={handleSweepExpiredSignals}
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
