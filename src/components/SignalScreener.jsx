import React, { useState } from 'react';
import { Search, SlidersHorizontal, AlertTriangle, Cpu, Coins, Layers, Eye, ShieldAlert, Database, HelpCircle } from 'lucide-react';

export default function SignalScreener({ 
  tokens, 
  onSelectToken, 
  walletAddress, 
  onRegisterSignal, 
  blockchainSignals = [], 
  onResolveSignal,
  resolvingSignalId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [minProbability, setMinProbability] = useState(40);

  // Filter tokens
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || token.category === categoryFilter;
    const matchesProb = token.probabilityScore >= minProbability;
    return matchesSearch && matchesCategory && matchesProb;
  });

  // Sort by Probability Score descending (highest alpha opportunities first)
  const sortedTokens = [...filteredTokens].sort((a, b) => b.probabilityScore - a.probabilityScore);

  const formatUsd = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  const getProbabilityBadge = (score) => {
    if (score >= 75) return 'text-amber-500 bg-amber-950/20 border-amber-900/40 glow-amber';
    if (score >= 60) return 'text-emerald-500 bg-emerald-950/20 border-emerald-900/40 glow-emerald';
    return 'text-blue-500 bg-blue-950/20 border-blue-900/40';
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'AI': return <Cpu size={14} className="text-purple-650 dark:text-purple-400" />;
      case 'Meme': return <Coins size={14} className="text-amber-400" />;
      default: return <Layers size={14} className="text-blue-400" />;
    }
  };

  // Sparkline drawer using pure SVG
  const renderSparkline = (sparkline, change24h) => {
    if (!sparkline || sparkline.length < 2) return null;
    
    const minVal = Math.min(...sparkline);
    const maxVal = Math.max(...sparkline);
    const range = maxVal - minVal || 1;
    const height = 32;
    const width = 120;
    const padding = 2;
    
    const points = sparkline.map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * width;
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = change24h >= 0 ? '#10b981' : '#ef4444';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header text */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-main font-sans">Alpha Move Signals</h2>
          <p className="text-gray-505 text-sm mt-1">
            Emerging tokens sorted by probability of near-term velocity moves.
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-purple-950/10 border border-purple-900/25 rounded-2xl max-w-sm">
          <AlertTriangle size={18} className="text-purple-500 shrink-0 animate-pulse" />
          <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-normal">
            <strong>Move Probability Score (60-70% win-rate threshold)</strong> indicates historical overlap triggers where smart wallets lead to 2-5x price moves.
          </p>
        </div>
      </div>

      {/* Filters and options panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl glass-panel border border-main">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-neutral-95/60 dark:bg-neutral-950/60 border border-main rounded-xl px-3.5 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Filter by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-main w-full placeholder:text-gray-500 font-mono"
          />
        </div>

        {/* Category switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-505 font-semibold uppercase tracking-wider">Sector:</span>
          <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-main flex-1">
            {['ALL', 'DeFi', 'AI', 'Meme'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex-1 text-center ${
                  categoryFilter === cat 
                    ? 'bg-purple-600 text-white font-semibold shadow-sm' 
                    : 'text-muted hover:bg-neutral-200/50 dark:hover:bg-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Probability Threshold slider */}
        <div className="flex items-center gap-4 bg-neutral-100/40 dark:bg-neutral-950/40 px-3.5 py-1.5 rounded-xl border border-main justify-between">
          <span className="text-xs text-gray-550 font-medium whitespace-nowrap">Min Prob: <span className="font-mono font-bold text-main">{minProbability}%</span></span>
          <input
            type="range"
            min="30"
            max="80"
            value={minProbability}
            onChange={(e) => setMinProbability(parseInt(e.target.value))}
            className="w-32 accent-purple-600 bg-neutral-900 cursor-pointer h-1.5 rounded-lg border-none"
          />
        </div>
      </div>

      {/* Grid of opportunity cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTokens.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-550 text-sm font-mono">
            No emerging indicators fit the search settings.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const canRegister = token.probabilityScore >= 60;
            return (
              <div
                key={token.symbol}
                className="glass-panel glass-panel-hover rounded-2xl border border-main p-6 flex flex-col justify-between h-[340px] overflow-hidden relative group"
              >
                {/* Backglow accent decoration */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-950/5 rounded-full filter blur-xl group-hover:bg-purple-900/10 transition-colors pointer-events-none"></div>
                
                <div>
                  {/* Upper row: Symbol and probability rating */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-main text-xl tracking-tight font-mono">${token.symbol}</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-505 bg-neutral-100 dark:bg-neutral-950 border border-main px-1.5 py-0.5 rounded font-mono">
                          {getCategoryIcon(token.category)}
                          {token.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-555 leading-none block mt-1">{token.name}</span>
                    </div>

                    <div className={`flex flex-col items-end border border-transparent px-2.5 py-1.5 rounded-xl ${getProbabilityBadge(token.probabilityScore)}`}>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Move Prob</span>
                      <span className="text-xl font-black font-mono leading-none mt-0.5">{token.probabilityScore}%</span>
                    </div>
                  </div>

                  {/* Key stats details */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Current Price</span>
                      <p className="font-semibold text-main mt-0.5 font-mono text-sm">
                        ${token.price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">24h Gain/Loss</span>
                      <p className={`font-semibold mt-0.5 text-sm font-mono ${
                        token.change24h >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Smart Overlap</span>
                      <p className="font-semibold text-main mt-0.5 text-sm">
                        {token.smartHoldersCount} Wallets
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Smart Capital</span>
                      <p className="font-semibold text-emerald-500 mt-0.5 text-sm font-mono">
                        {formatUsd(token.smartInflow)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SVG trend and action buttons */}
                <div className="mt-4 pt-4 border-t border-main space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      {renderSparkline(token.sparkline, token.change24h)}
                    </div>
                    <button
                      onClick={() => onSelectToken(token.symbol)}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-all font-sans"
                    >
                      <Eye size={12} />
                      Analyze Flows
                    </button>
                  </div>

                  {/* GenLayer Register Signal Button */}
                  {canRegister && (
                    <button
                      onClick={() => onRegisterSignal(token)}
                      disabled={!walletAddress}
                      className={`w-full py-2 rounded-xl text-[11px] font-extrabold uppercase border flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        walletAddress
                          ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-md hover:scale-[1.01]'
                          : 'bg-neutral-100 dark:bg-neutral-900 text-gray-450 dark:text-neutral-650 border-main cursor-not-allowed'
                      }`}
                      title={!walletAddress ? "Connect GenLayer Wallet to register signals on-chain" : "Lock forecast on-chain"}
                    >
                      <Database size={12} />
                      {walletAddress ? "Lock forecast on GenLayer" : "Connect Wallet to Lock On-Chain"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* On-Chain Verified Signal Ledger */}
      <div className="glass-panel rounded-2xl border border-main overflow-hidden mt-12">
        <div className="p-5 border-b border-main bg-neutral-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-purple-650 dark:text-purple-400 animate-pulse" />
            <h3 className="font-bold text-main text-base">On-Chain Verified Signal Ledger</h3>
          </div>
          <span className="text-[10px] text-gray-500 font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-main rounded font-semibold">
            GENLAYER INTELLIGENT CONTRACTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-main bg-neutral-100/50 dark:bg-neutral-950/50 text-[10px] font-mono text-gray-505 uppercase tracking-wider">
                <th className="py-3.5 px-6">Sig ID</th>
                <th className="py-3.5 px-6">Submitter</th>
                <th className="py-3.5 px-6">Symbol</th>
                <th className="py-3.5 px-6 text-right">Entry Price</th>
                <th className="py-3.5 px-6 text-right">Target Price</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6">Consensus Verdict</th>
                <th className="py-3.5 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main text-xs font-mono">
              {blockchainSignals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 text-sm font-sans">
                    No predictions registered on-chain yet. Connect wallet and register high-probability signals above!
                  </td>
                </tr>
              ) : (
                blockchainSignals.map((sig) => {
                  const isPending = sig.status === "pending";
                  const isSuccess = sig.status === "success";
                  return (
                    <tr key={sig.id} className="hover:bg-neutral-100/10 dark:hover:bg-neutral-900/10">
                      <td className="py-4.5 px-6 text-gray-400">#{sig.id}</td>
                      <td className="py-4.5 px-6 text-purple-700 dark:text-purple-300">
                        {sig.submitter.slice(0, 6)}...{sig.submitter.slice(-4)}
                      </td>
                      <td className="py-4.5 px-6 text-main font-extrabold font-sans text-sm">${sig.symbol}</td>
                      <td className="py-4.5 px-6 text-right">${sig.entryPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}</td>
                      <td className="py-4.5 px-6 text-right text-emerald-500 font-bold">${sig.targetPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}</td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          isPending 
                            ? 'text-blue-500 bg-blue-950/20 border-blue-900/30' 
                            : isSuccess 
                              ? 'text-emerald-500 bg-emerald-950/20 border-emerald-900/30 glow-emerald' 
                              : 'text-red-500 bg-red-950/20 border-red-900/30'
                        }`}>
                          {sig.status}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-main font-sans max-w-xs truncate" title={sig.verdictReason}>
                        {sig.verdictReason || "Awaiting target timeframe check..."}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        {isPending ? (
                          <button
                            onClick={() => onResolveSignal(sig.id)}
                            disabled={!walletAddress || resolvingSignalId === sig.id}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              !walletAddress 
                                ? 'bg-neutral-100 dark:bg-neutral-900 text-gray-450 dark:text-neutral-600 border-main cursor-not-allowed'
                                : resolvingSignalId === sig.id
                                  ? 'bg-purple-950/30 text-purple-400 border-purple-900/20 animate-pulse'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm'
                            }`}
                          >
                            {resolvingSignalId === sig.id ? "Running Consensus..." : "Verify Target"}
                          </button>
                        ) : (
                          <span className="text-gray-500 font-bold">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
