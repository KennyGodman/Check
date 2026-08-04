import React from 'react';
import { TrendingUp, Activity, Compass, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InflowMonitor({ 
  transactions, 
  tokens, 
  wallets, 
  onSelectToken, 
  onSelectWallet,
  triggerSimulatedTrade 
}) {
  
  // Calculate aggregated stats
  const totalWallets = wallets.length;
  const totalProfit = wallets.reduce((acc, w) => acc + w.netProfit, 0);
  const avgWinRate = Math.round(wallets.reduce((acc, w) => acc + w.winRate, 0) / totalWallets);
  const activeInflowsCount = tokens.filter(t => t.smartHoldersCount > 0).length;

  // Formatting helper
  const formatUsd = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  // Sort tokens by total smart money inflow
  const topInflows = [...tokens]
    .filter(t => t.smartInflow > 0)
    .sort((a, b) => b.smartInflow - a.smartInflow)
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Upper header */}
      <div className="flex justify-between items-center">
        <div>
          <motion.h2
            animate={{ color: ["var(--text-main)", "#a855f7", "var(--text-main)"] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="text-3xl font-black tracking-tight font-sans"
          >
            Smart Inflow Monitor
          </motion.h2>
          <motion.p
            animate={{ x: [-8, 8] }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut" }}
            className="text-neutral-550 dark:text-neutral-300 text-sm mt-1"
          >
            Analyzing transaction streams from the highest ROI wallets.
          </motion.p>
        </div>
        <button
          onClick={triggerSimulatedTrade}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-purple-950/20 border border-purple-500/20 hover:scale-105 active:scale-95 group"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Force On-Chain Scan
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-main hover:border-purple-900/30 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-purple-950/20 group-hover:text-purple-900/30 transition-colors duration-300">
            <Compass size={80} strokeWidth={1} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider uppercase">Wallets Tracked</p>
          <h3 className="text-3xl font-extrabold text-main mt-2 font-mono">{totalWallets}</h3>
          <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-medium">
            <span>ROI Average: {Math.round(wallets.reduce((acc, w) => acc + w.roi, 0) / wallets.length)}%</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-main hover:border-emerald-800/25 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-emerald-950/20 group-hover:text-emerald-900/30 transition-colors duration-300">
            <TrendingUp size={80} strokeWidth={1} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider uppercase">Net Profit Logged</p>
          <h3 className="text-3xl font-extrabold text-main mt-2 font-mono">{formatUsd(totalProfit)}</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Combined verified profit payouts</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-main hover:border-blue-800/25 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-blue-950/20 group-hover:text-blue-900/30 transition-colors duration-300">
            <Activity size={80} strokeWidth={1} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider uppercase">Avg Win Rate</p>
          <h3 className="text-3xl font-extrabold text-main mt-2 font-mono">{avgWinRate}%</h3>
          <p className="text-xs text-blue-450 mt-2 font-medium">Outperforming standard DEX traders by ~30%</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-main hover:border-amber-800/25 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-amber-950/20 group-hover:text-amber-900/30 transition-colors duration-300">
            <AlertCircle size={80} strokeWidth={1} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider uppercase">Active Inflows</p>
          <h3 className="text-3xl font-extrabold text-main mt-2 font-mono">{activeInflowsCount} <span className="text-xs text-neutral-500 dark:text-neutral-450 font-normal">Tokens</span></h3>
          <p className="text-xs text-amber-450 mt-2 font-medium flex items-center gap-1">
            <span>High probability alerts active</span>
          </p>
        </div>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Trade Stream */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-main overflow-hidden flex flex-col h-[520px]">
          <div className="p-5 border-b border-main bg-neutral-100/50 dark:bg-neutral-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-650 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-700"></span>
              </span>
              <h4 className="font-bold text-main tracking-tight font-sans">On-Chain Transaction Stream</h4>
            </div>
            <span className="text-[11px] font-mono text-gray-505 uppercase">Updates every 4-8s</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-main p-2 space-y-1.5 font-sans">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                <Activity size={32} className="animate-pulse" />
                <p className="text-sm font-mono">Awaiting smart money actions...</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isBuy = tx.type === "BUY";
                return (
                  <div
                    key={tx.id}
                    className={`p-3.5 rounded-xl border border-transparent hover:border-main transition-all duration-200 flex justify-between items-center group relative overflow-hidden ${
                      isBuy ? 'hover:bg-emerald-100/50 dark:hover:bg-emerald-950/10' : 'hover:bg-red-100/50 dark:hover:bg-red-950/10'
                    }`}
                  >
                    <div className="flex items-center gap-4.5 z-10">
                      {/* Buy/Sell Indicator badge */}
                      <span className={`w-20 text-center font-bold font-mono text-xs px-2.5 py-1.5 rounded-lg border uppercase tracking-wider ${
                        isBuy 
                          ? 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40 glow-emerald' 
                          : 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/40'
                      }`}>
                        {tx.type}
                      </span>
                      
                      <div>
                        {/* Wallet metadata */}
                        <button 
                          onClick={() => onSelectWallet(tx.walletAddress)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold font-mono px-2 py-0.5 rounded transition-all duration-150 inline-flex items-center gap-1"
                        >
                          <Wallet size={10} />
                          {tx.walletName}
                        </button>
                        
                        {/* Token Details */}
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-sm font-bold text-main">
                            {tx.amount.toLocaleString()}
                          </span>
                          <button 
                            onClick={() => onSelectToken(tx.tokenSymbol)}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded font-mono transition-colors"
                          >
                            ${tx.tokenSymbol}
                          </button>
                          <span className="text-[11px] text-gray-500 font-mono">
                            @ ${tx.price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right z-10 flex flex-col items-end">
                      <span className={`font-extrabold font-mono text-sm ${isBuy ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isBuy ? '+' : '-'}{formatUsd(tx.valueUsd)}
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Column: Top Inflows */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-main overflow-hidden flex flex-col h-[520px]">
          <div className="p-5 border-b border-main bg-neutral-100/50 dark:bg-neutral-950/30 flex justify-between items-center">
            <h4 className="font-bold text-main tracking-tight font-sans">Alpha Inflows</h4>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/30">
              Total Buys
            </span>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {topInflows.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                No active token inflows.
              </div>
            ) : (
              topInflows.map((token) => (
                <div 
                  key={token.symbol} 
                  className="p-4 rounded-xl bg-neutral-100/50 dark:bg-neutral-950/50 border border-main hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onSelectToken(token.symbol)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-2 py-0.5 rounded transition-colors"
                        >
                          ${token.symbol}
                        </button>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-900 border border-main px-1 py-0.5 rounded">
                          {token.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{token.name}</p>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-500 font-mono">
                        {formatUsd(token.smartInflow)}
                      </span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">Smart Capital</p>
                    </div>
                  </div>

                  {/* Overlap Info */}
                  <div className="mt-4 pt-3 border-t border-main flex justify-between items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                      Overlap: {token.smartHoldersCount} Smart Wallets
                    </span>
                    <button 
                      onClick={() => onSelectToken(token.symbol)}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center transition-all shadow-sm"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
