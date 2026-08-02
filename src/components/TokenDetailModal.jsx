import React from 'react';
import { X, ShieldAlert, Cpu, Activity, TrendingUp, Info, Copy, Check } from 'lucide-react';

export default function TokenDetailModal({ token, wallets, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!token) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUsd = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  // Find which of our tracked wallets hold this token
  const holdingWallets = wallets.filter(w => 
    w.holdings.some(h => h.symbol === token.symbol)
  );

  // Math breakdown for the probability score calculation
  const overlapCount = token.smartHoldersCount || 0;
  const overlapPoints = Math.min(overlapCount * 12, 45);
  
  // Simulated velocity calculation
  const velocityPoints = Math.min(Math.round((token.volume24h / 500000) * 5), 20);

  let mcapModifier = 0;
  if (token.marketCap < 2000000) mcapModifier = 15;
  else if (token.marketCap < 10000000) mcapModifier = 10;
  else if (token.marketCap < 50000000) mcapModifier = 5;

  let averageWinRate = 60;
  if (holdingWallets.length > 0) {
    const sum = holdingWallets.reduce((acc, w) => acc + w.winRate, 0);
    averageWinRate = sum / holdingWallets.length;
  }
  const qualityPoints = Math.round((averageWinRate / 100) * 15);

  const calculatedBase = 10 + overlapPoints + velocityPoints + mcapModifier + qualityPoints;
  const finalScore = Math.min(Math.max(calculatedBase, 15), 89);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-main overflow-hidden shadow-2xl glow-purple animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4.5 top-4.5 p-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 text-gray-500 hover:text-main rounded-xl border border-main transition-colors"
        >
          <X size={16} />
        </button>

        {/* Modal Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-main font-mono">${token.symbol}</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-neutral-100 dark:bg-neutral-950 border border-main px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                {token.category} Sector
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{token.name}</p>
            
            {/* Mint Address Block */}
            <div className="mt-3 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-950 px-3 py-2 rounded-xl border border-main w-fit max-w-full">
              <span className="text-[10px] font-mono text-gray-500 truncate select-all">{token.address}</span>
              <button 
                onClick={copyAddress}
                className="text-gray-500 hover:text-purple-500 transition-colors shrink-0"
                title="Copy Address"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metrics Breakdown Grid */}
            <div className="space-y-4">
              <h4 className="font-bold text-main text-sm uppercase tracking-wider text-gray-500">Score Metrics Analytics</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Overlap weight ({overlapCount} wallets)</span>
                  <span className="font-mono text-main">+{overlapPoints}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${(overlapPoints/45)*100}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Buy velocity spikes</span>
                  <span className="font-mono text-main">+{velocityPoints}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(velocityPoints/20)*100}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Market cap speed booster</span>
                  <span className="font-mono text-main">+{mcapModifier}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${(mcapModifier/15)*100}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Wallet win-rate quality</span>
                  <span className="font-mono text-main">+{qualityPoints}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${(qualityPoints/15)*100}%` }}></div>
                </div>
              </div>

              {/* Total Summary Probability */}
              <div className="p-4 bg-purple-95/10 dark:bg-purple-950/20 border border-main dark:border-purple-900/30 rounded-2xl flex justify-between items-center mt-2">
                <div>
                  <h5 className="font-bold text-main text-sm">Combined Move Probability</h5>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 font-semibold">Algorithm Win-Rate Edge Target</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-500 dark:text-purple-450 font-mono">{finalScore}%</span>
                </div>
              </div>
            </div>

            {/* Overlapping Wallets List */}
            <div className="space-y-4">
              <h4 className="font-bold text-main text-sm uppercase tracking-wider text-gray-500">Tracked Holders ({holdingWallets.length})</h4>
              <div className="space-y-2 max-h-[170px] overflow-y-auto">
                {holdingWallets.length === 0 ? (
                  <div className="p-4 bg-inner border border-main rounded-xl text-center text-gray-550 text-xs font-mono">
                    No active elite wallets holding.
                  </div>
                ) : (
                  holdingWallets.map(w => {
                    const tokenHolding = w.holdings.find(h => h.symbol === token.symbol);
                    return (
                      <div key={w.address} className="p-3 bg-inner border border-main rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-semibold text-main">{w.name}</p>
                          <p className="text-[9px] text-gray-500 font-mono tracking-tight mt-0.5">{w.address.slice(0, 8)}...{w.address.slice(-6)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-500 font-mono">
                            {tokenHolding ? formatUsd(tokenHolding.value) : '$0'}
                          </span>
                          <p className="text-[9px] text-gray-505 font-mono mt-0.5">ROI: +{w.roi}%</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* SVG Inflow Volume Trend Area Chart */}
          <div className="p-4 bg-inner border border-main rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-505 font-semibold uppercase tracking-wider flex items-center gap-1 font-sans">
                <Activity size={12} className="text-purple-505" /> Inflow Velocity (24h Trend)
              </span>
              <span className="text-[10px] text-gray-505 font-mono">24h Vol: {formatUsd(token.volume24h)}</span>
            </div>
            
            {/* Draw curve using dynamic coordinates */}
            <div className="h-28 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 30">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Curve */}
                <path
                  d={`M 0,30 
                      ${token.sparkline.map((val, idx) => {
                        const x = (idx / (token.sparkline.length - 1)) * 100;
                        const minVal = Math.min(...token.sparkline);
                        const maxVal = Math.max(...token.sparkline);
                        const range = maxVal - minVal || 1;
                        const y = 30 - ((val - minVal) / range) * 25;
                        return `L ${x},${y}`;
                      }).join(' ')} 
                      L 100,30 Z`}
                  fill="url(#chartGradient)"
                />
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={token.sparkline.map((val, idx) => {
                    const x = (idx / (token.sparkline.length - 1)) * 100;
                    const minVal = Math.min(...token.sparkline);
                    const maxVal = Math.max(...token.sparkline);
                    const range = maxVal - minVal || 1;
                    const y = 30 - ((val - minVal) / range) * 25;
                    return `${x},${y}`;
                  }).join(' ')}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
