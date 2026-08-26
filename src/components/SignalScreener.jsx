import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle, 
  Cpu, 
  Coins, 
  Layers, 
  Eye, 
  Database, 
  Lock, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  XCircle,
  TimerOff
} from 'lucide-react';

export default function SignalScreener({ 
  tokens, 
  onSelectToken, 
  walletAddress, 
  onRegisterSignal, 
  blockchainSignals = [], 
  onResolveSignal,
  onForceResolveExpired,
  onSweepExpiredSignals,
  resolvingSignalId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [minProbability, setMinProbability] = useState(40);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedWindow, setSelectedWindow] = useState(300000); // 5 min default

  // Real-time timer tick for prediction window & settlement countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tokens
  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || token.category === categoryFilter;
    const matchesProb = token.probabilityScore >= minProbability;
    return matchesSearch && matchesCategory && matchesProb;
  });

  // Sort by Probability Score descending
  const sortedTokens = [...filteredTokens].sort((a, b) => b.probabilityScore - a.probabilityScore);

  const formatUsd = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  const getProbabilityBadge = (score) => {
    if (score >= 75) return 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-500 dark:bg-amber-950/20 dark:border-amber-900/40 glow-amber';
    if (score >= 60) return 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/40 glow-emerald';
    return 'text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-500 dark:bg-blue-950/20 dark:border-blue-900/40';
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

  // Count pending signals that are past deadline
  const expiredPendingCount = blockchainSignals.filter(sig => {
    if (sig.status !== "pending") return false;
    const deadline = sig.settlementDeadline || (sig.timestamp + (sig.predictionWindow || 300000) + 300000);
    return currentTime > deadline;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header text */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-main font-sans flex items-center gap-2.5">
            Alpha Move Signals
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              Anti-Gaming Consensus v2
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Emerging tokens bound to canonical price sources and fixed outcome windows for verifiable reputation.
          </p>
        </div>

        {/* Anti-gaming policy banner */}
        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl max-w-md">
          <ShieldCheck size={22} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <div className="text-[11px] text-purple-900 dark:text-purple-200 leading-snug">
            <strong>Strict Accountability:</strong> Signals bind to canonical price endpoints & fixed settlement windows. Abandoned or unverified signals are force-settled to <strong>FAILED (-10 REP)</strong>.
          </div>
        </div>
      </div>

      {/* Filters and options panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl glass-panel border border-main">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-neutral-100/60 dark:bg-neutral-950/60 border border-main rounded-xl px-3.5 py-2">
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
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Sector:</span>
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
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Min Prob: <span className="font-mono font-bold text-main">{minProbability}%</span></span>
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
          <div className="col-span-full py-16 text-center text-gray-500 text-sm font-mono">
            No emerging indicators fit the search settings.
          </div>
        ) : (
          sortedTokens.map((token) => {
            const canRegister = token.probabilityScore >= 60;
            const targetGainPrice = token.price * 1.20;
            return (
              <div
                key={token.symbol}
                className="glass-panel glass-panel-hover rounded-2xl border border-main p-6 flex flex-col justify-between h-[360px] overflow-hidden relative group"
              >
                {/* Backglow accent decoration */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-purple-950/5 rounded-full filter blur-xl group-hover:bg-purple-900/10 transition-colors pointer-events-none"></div>
                
                <div>
                  {/* Upper row: Symbol and probability rating */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-main text-xl tracking-tight font-mono">${token.symbol}</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-neutral-100 dark:bg-neutral-950 border border-main px-1.5 py-0.5 rounded font-mono">
                          {getCategoryIcon(token.category)}
                          {token.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 leading-none block mt-1">{token.name}</span>
                    </div>

                    <div className={`flex flex-col items-end border border-transparent px-2.5 py-1.5 rounded-xl ${getProbabilityBadge(token.probabilityScore)}`}>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold">Move Prob</span>
                      <span className="text-xl font-black font-mono leading-none mt-0.5">{token.probabilityScore}%</span>
                    </div>
                  </div>

                  {/* Key stats details */}
                  <div className="grid grid-cols-2 gap-3.5 mt-5">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Entry Price</span>
                      <p className="font-semibold text-main mt-0.5 font-mono text-sm">
                        ${token.price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">Target (+20%)</span>
                      <p className="font-semibold text-emerald-500 mt-0.5 text-sm font-mono">
                        ${targetGainPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
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

                {/* Canonical source tag & trend line */}
                <div className="mt-3 pt-3 border-t border-main space-y-2.5">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1" title={`Canonical Price Binding: DexScreener | Chain: ${token.chainId || 'solana'} | Pair: ${token.pairAddress || 'Primary'}`}>
                      <ShieldCheck size={11} className="text-purple-500" />
                      Canonical: DexScreener ({token.chainId ? token.chainId.toUpperCase() : 'SOL'})
                    </span>
                    <div>
                      {renderSparkline(token.sparkline, token.change24h)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectToken(token.symbol)}
                      className="flex items-center justify-center gap-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-main text-xs font-semibold px-3 py-2 rounded-xl transition-all font-sans"
                    >
                      <Eye size={12} />
                      Flows
                    </button>

                    {/* GenLayer Register Signal Button */}
                    {canRegister ? (
                      <button
                        onClick={() => onRegisterSignal(token, 300000)}
                        disabled={!walletAddress}
                        className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold uppercase border flex items-center justify-center gap-1.5 transition-all duration-200 ${
                          walletAddress
                            ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-md hover:scale-[1.01]'
                            : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-main cursor-not-allowed'
                        }`}
                        title={!walletAddress ? "Connect GenLayer Wallet to register signals on-chain" : "Lock forecast on-chain (5m Fixed Outcome Window)"}
                      >
                        <Database size={12} />
                        {walletAddress ? "Lock Forecast (5m Window)" : "Connect to Lock"}
                      </button>
                    ) : (
                      <div className="flex-1 text-center py-2 text-[10px] text-gray-400 font-mono">
                        Requires ≥60% Overlap
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* On-Chain Verified Signal Ledger */}
      <div className="glass-panel rounded-2xl border border-main overflow-hidden mt-12">
        <div className="p-5 border-b border-main bg-neutral-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Database size={18} className="text-purple-600 dark:text-purple-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-main text-base">On-Chain Verified Signal Ledger</h3>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                Fixed Outcome Windows & Canonical DexScreener Oracle Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {expiredPendingCount > 0 && (
              <button
                onClick={onSweepExpiredSignals}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all animate-pulse"
                title="Force terminal resolution on all expired pending signals to penalize stale submitters"
              >
                <Zap size={13} />
                Sweep {expiredPendingCount} Expired Signal{expiredPendingCount > 1 ? 's' : ''}
              </button>
            )}

            <span className="text-[10px] text-gray-500 font-mono px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 border border-main rounded-lg font-semibold">
              GENLAYER CONSENSUS
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-main bg-neutral-100/50 dark:bg-neutral-950/50 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Sig ID</th>
                <th className="py-3.5 px-5">Submitter</th>
                <th className="py-3.5 px-5">Symbol</th>
                <th className="py-3.5 px-5">Canonical Source</th>
                <th className="py-3.5 px-5 text-right">Entry</th>
                <th className="py-3.5 px-5 text-right">Target</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Outcome Window & Deadline</th>
                <th className="py-3.5 px-5">Consensus Verdict</th>
                <th className="py-3.5 px-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-main text-xs font-mono">
              {blockchainSignals.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-gray-500 text-sm font-sans">
                    No predictions registered on-chain yet. Connect wallet and register high-probability signals above!
                  </td>
                </tr>
              ) : (
                blockchainSignals.map((sig) => {
                  const isPending = sig.status === "pending";
                  const isSuccess = sig.status === "success";
                  const windowDuration = sig.predictionWindow || 300000;
                  const windowEnd = sig.timestamp + windowDuration;
                  const settlementDeadline = sig.settlementDeadline || (windowEnd + 300000);
                  
                  const isLocked = isPending && currentTime < windowEnd;
                  const isSettlementOpen = isPending && currentTime >= windowEnd && currentTime <= settlementDeadline;
                  const isExpiredPending = isPending && currentTime > settlementDeadline;

                  const remainingWindowSec = Math.max(0, Math.ceil((windowEnd - currentTime) / 1000));
                  const remainingDeadlineSec = Math.max(0, Math.ceil((settlementDeadline - currentTime) / 1000));
                  
                  const winMins = Math.floor(remainingWindowSec / 60);
                  const winSecs = (remainingWindowSec % 60).toString().padStart(2, '0');
                  
                  const deadMins = Math.floor(remainingDeadlineSec / 60);
                  const deadSecs = (remainingDeadlineSec % 60).toString().padStart(2, '0');

                  return (
                    <tr key={sig.id} className="hover:bg-neutral-100/10 dark:hover:bg-neutral-900/10">
                      <td className="py-4 px-5 text-gray-400 font-bold">#{sig.id}</td>
                      <td className="py-4 px-5 text-purple-700 dark:text-purple-300">
                        {sig.submitter.slice(0, 6)}...{sig.submitter.slice(-4)}
                      </td>
                      <td className="py-4 px-5 text-main font-extrabold font-sans text-sm">${sig.symbol}</td>
                      
                      {/* Canonical Source */}
                      <td className="py-4 px-5">
                        <div 
                          className="inline-flex flex-col gap-0.5 text-[10px] text-gray-500 bg-neutral-100 dark:bg-neutral-900 border border-main px-2 py-1 rounded max-w-[170px]"
                          title={`Canonical Binding:\n- Host: api.dexscreener.com\n- Chain: ${sig.chainId || 'solana'}\n- Token: ${sig.tokenAddress}\n- Pair: ${sig.pairAddress || 'Primary Pool'}\n- Endpoint: ${sig.priceSource || `https://api.dexscreener.com/latest/dex/tokens/${sig.tokenAddress}`}`}
                        >
                          <span className="font-semibold text-main flex items-center gap-1">
                            <ShieldCheck size={10} className="text-purple-500 shrink-0" />
                            DexScreener ({sig.chainId ? sig.chainId.toUpperCase() : 'SOL'})
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono truncate">
                            {sig.pairAddress ? `Pair: ${sig.pairAddress.slice(0, 6)}...` : 'Primary Pool'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right font-medium">
                        ${sig.entryPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                      </td>
                      <td className="py-4 px-5 text-right text-emerald-500 font-bold">
                        ${sig.targetPrice.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                      </td>
                      
                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          isPending 
                            ? isExpiredPending
                              ? 'text-amber-600 bg-amber-950/20 border-amber-900/40 animate-pulse'
                              : 'text-blue-500 bg-blue-950/20 border-blue-900/30' 
                            : isSuccess 
                              ? 'text-emerald-500 bg-emerald-950/20 border-emerald-900/30 glow-emerald' 
                              : 'text-red-500 bg-red-950/20 border-red-900/30'
                        }`}>
                          {isSuccess && <CheckCircle2 size={10} />}
                          {!isPending && !isSuccess && <XCircle size={10} />}
                          {isExpiredPending ? "Expired Pending" : sig.status}
                        </span>
                      </td>

                      {/* Outcome Window & Deadline Countdown */}
                      <td className="py-4 px-5 text-center">
                        {isPending ? (
                          isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-900/30">
                              <Lock size={10} /> Locked ({winMins}:{winSecs})
                            </span>
                          ) : isSettlementOpen ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-900/30">
                              <Clock size={10} /> Settle Open ({deadMins}:{deadSecs})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/20 border border-red-300 dark:border-red-900/30">
                              <TimerOff size={10} /> Deadline Passed
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 font-semibold text-[10px]">
                            Resolved {sig.resolvedAt ? `at +${Math.round((sig.resolvedAt - sig.timestamp)/60000)}m` : 'Terminal'}
                          </span>
                        )}
                      </td>

                      {/* Consensus Verdict Reason */}
                      <td className="py-4 px-5 text-main font-sans max-w-xs truncate text-[11px]" title={sig.verdictReason}>
                        {sig.verdictReason || (
                          isLocked 
                            ? `Window active (${winMins}m ${winSecs}s before resolution)` 
                            : isSettlementOpen
                              ? `Ready for canonical oracle resolution (${deadMins}m ${deadSecs}s deadline)`
                              : `Settlement deadline expired. Force terminal failure available.`
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-center">
                        {isPending ? (
                          isLocked ? (
                            <button
                              disabled
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 border-main cursor-not-allowed"
                            >
                              Locked ({winMins}:{winSecs})
                            </button>
                          ) : isSettlementOpen ? (
                            <button
                              onClick={() => onResolveSignal(sig.id)}
                              disabled={resolvingSignalId === sig.id}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                resolvingSignalId === sig.id
                                  ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-750 dark:text-purple-400 border-purple-300 dark:border-purple-900/20 animate-pulse'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm'
                              }`}
                            >
                              {resolvingSignalId === sig.id ? "Resolving..." : "Verify Target"}
                            </button>
                          ) : (
                            <button
                              onClick={() => onForceResolveExpired(sig.id)}
                              disabled={resolvingSignalId === sig.id}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold border bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm transition-all flex items-center gap-1 mx-auto"
                              title="Force terminal failure and apply reputation penalty for expired signal"
                            >
                              <TimerOff size={11} />
                              {resolvingSignalId === sig.id ? "Settling..." : "Force Fail"}
                            </button>
                          )
                        ) : (
                          <span className="text-gray-500 font-bold text-xs">&mdash;</span>
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
