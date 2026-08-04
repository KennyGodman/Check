import React, { useState } from 'react';
import { Search, Plus, TrendingUp, DollarSign, Target, UserCheck, ShieldClose, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SmartLeaderboard({ wallets, onAddWallet, onDeleteWallet, onSelectToken }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStyle, setFilterStyle] = useState('ALL');
  const [sortBy, setSortBy] = useState('roi'); // 'roi', 'winRate', 'netProfit'
  const [expandedWallet, setExpandedWallet] = useState(null);

  // New Wallet form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('Sniper');
  const [newRoi, setNewRoi] = useState('450');
  const [newWinRate, setNewWinRate] = useState('65');

  // Filter wallets
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = filterStyle === 'ALL' || wallet.label === filterStyle;
    return matchesSearch && matchesStyle;
  });

  // Sort wallets
  const sortedWallets = [...filteredWallets].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAddress || !newName) return;
    
    onAddWallet({
      address: newAddress,
      name: newName,
      label: newLabel,
      roi: parseInt(newRoi) || 100,
      winRate: parseInt(newWinRate) || 50,
      netProfit: Math.round((parseInt(newRoi) * (Math.random() * 500 + 200))), // generate custom net profit based on ROI
      trades30d: Math.round(Math.random() * 80 + 10),
      style: `${newLabel} Tracking`,
      description: "Custom user-tracked address added directly via dashboard console.",
      holdings: [],
      history: []
    });

    // Reset Form
    setNewAddress('');
    setNewName('');
    setShowAddForm(false);
  };

  const formatUsd = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val}`;
  };

  const getStyleColor = (label) => {
    switch (label) {
      case 'Sniper': return 'text-amber-400 bg-amber-950/20 border-amber-800/30';
      case 'Accumulator': return 'text-purple-500 dark:text-purple-400 bg-purple-950/20 border-purple-800/30';
      case 'Whale': return 'text-blue-400 bg-blue-950/20 border-blue-800/30';
      default: return 'text-emerald-400 bg-emerald-950/20 border-emerald-800/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-main font-sans">Smart Wallets Directory</h2>
          <p className="text-neutral-550 dark:text-neutral-300 text-sm mt-1">
            Browse and monitor wallets that have proven high-performance edge.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all duration-200 shadow-md border border-transparent hover:scale-[1.02] glow-purple font-sans"
        >
          <Plus size={16} />
          Track Custom Wallet
        </button>
      </div>

      {/* Add Custom Wallet Form modal-like overlay */}
      {showAddForm && (
        <div className="p-6 rounded-2xl glass-panel border border-purple-900/40 glow-purple max-w-xl animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-main text-lg font-sans">Add Custom Blockchain Wallet</h4>
            <button 
              onClick={() => setShowAddForm(false)} 
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg border border-transparent transition-all"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleAddSubmit} className="space-y-4 font-sans">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Wallet Label Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOL-Degen-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3.5 py-2.5 text-sm text-main focus:outline-none focus:border-purple-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-505 uppercase tracking-wider mb-1.5">Wallet Type</label>
                <select
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3.5 py-2.5 text-sm text-main focus:outline-none focus:border-purple-700 transition-colors"
                >
                  <option value="Sniper">Memecoin Sniper</option>
                  <option value="Accumulator">Alpha Accumulator</option>
                  <option value="Whale">High-Roller Whale</option>
                  <option value="Institutional">Institutional Smart Money</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-505 uppercase tracking-wider mb-1.5">Solana Address</label>
              <input
                type="text"
                required
                placeholder="Enter Solana Wallet Public Key Address..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full bg-input border border-main rounded-xl px-3.5 py-2.5 text-sm text-main focus:outline-none focus:border-purple-700 transition-colors font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-505 uppercase tracking-wider mb-1.5">Est. ROI (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newRoi}
                  onChange={(e) => setNewRoi(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3.5 py-2.5 text-sm text-main focus:outline-none focus:border-purple-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-505 uppercase tracking-wider mb-1.5">Win Rate (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={newWinRate}
                  onChange={(e) => setNewWinRate(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3.5 py-2.5 text-sm text-main focus:outline-none focus:border-purple-700 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-950/20"
            >
              Add Wallet to Scanners
            </button>
          </form>
        </div>
      )}

      {/* Directory Filters & Tools */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-main">
        <div className="flex items-center gap-2.5 max-w-md w-full bg-neutral-95/60 dark:bg-neutral-950/60 border border-main rounded-xl px-3.5 py-2">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search address or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-main w-full placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Style Filter */}
          <div className="flex bg-neutral-100 dark:bg-neutral-955 p-1 rounded-xl border border-main">
            {['ALL', 'Sniper', 'Accumulator', 'Whale', 'Institutional'].map((style) => (
              <button
                key={style}
                onClick={() => setFilterStyle(style)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  filterStyle === style 
                    ? 'bg-purple-600 text-white font-semibold shadow-sm' 
                    : 'text-muted hover:bg-neutral-200/50 dark:hover:bg-neutral-900'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-550 font-semibold uppercase tracking-wider font-sans">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-105 dark:bg-neutral-950 border border-main text-xs font-semibold rounded-xl text-main px-3 py-2 focus:outline-none"
            >
              <option value="roi">ROI Multiplier</option>
              <option value="winRate">Win Rate (%)</option>
              <option value="netProfit">Net Profit (USD)</option>
              <option value="trades30d">30d Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-panel rounded-2xl border border-main overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-table-header border-b border-main text-[11px] font-mono text-gray-505 uppercase tracking-widest">
              <th className="py-4 px-6">Rank & Name</th>
              <th className="py-4 px-6 text-center">Type</th>
              <th className="py-4 px-6 text-right">ROI Multiplier</th>
              <th className="py-4 px-6 text-right">Win Rate</th>
              <th className="py-4 px-6 text-right">30d Trades</th>
              <th className="py-4 px-6 text-right">Verified PnL</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-main text-sm">
            {sortedWallets.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-505">
                  No smart wallets match the current criteria.
                </td>
              </tr>
            ) : (
              sortedWallets.map((wallet, index) => {
                const isExpanded = expandedWallet === wallet.address;
                return (
                  <React.Fragment key={wallet.address}>
                    <tr 
                      className={`hover:bg-neutral-100/50 dark:hover:bg-neutral-950/40 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-purple-950/5' : ''
                      }`}
                      onClick={() => setExpandedWallet(isExpanded ? null : wallet.address)}
                    >
                      <td className="py-4.5 px-6 font-semibold text-main">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-505 font-mono">#{index + 1}</span>
                          <div>
                            <span className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">{wallet.name}</span>
                            <p className="text-[10px] text-gray-500 font-mono tracking-tight mt-0.5">{wallet.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.8 rounded border uppercase tracking-wider ${getStyleColor(wallet.label)}`}>
                          {wallet.label}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono font-extrabold text-emerald-500">
                        +{wallet.roi}%
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono font-extrabold text-main">
                        {wallet.winRate}%
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono text-gray-500">
                        {wallet.trades30d}
                      </td>
                      <td className="py-4.5 px-6 text-right font-mono font-extrabold text-main">
                        {formatUsd(wallet.netProfit)}
                      </td>
                      <td className="py-4.5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDeleteWallet(wallet.address)}
                          className="p-1.5 bg-purple-600 hover:bg-purple-705 text-white rounded-lg transition-colors shadow-sm"
                          title="Delete Wallet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expandable row: Wallet Holdings & Trade History */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="7" className="p-6 bg-neutral-50/50 dark:bg-neutral-950/40 border-t border-b border-main">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
                            {/* Holdings Widget */}
                            <div>
                              <div className="flex items-center gap-2 mb-3.5">
                                <UserCheck size={16} className="text-purple-650 dark:text-purple-400" />
                                <h5 className="font-bold text-main tracking-tight font-sans">Active Holdings ({wallet.holdings.length})</h5>
                              </div>
                              <div className="bg-inner rounded-xl border border-main overflow-hidden">
                                {wallet.holdings.length === 0 ? (
                                  <div className="p-6 text-center text-gray-505 text-xs font-mono">
                                    No tracked positions active.
                                  </div>
                                ) : (
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="border-b border-main text-[10px] text-gray-555 font-mono bg-neutral-200/50 dark:bg-neutral-900/50">
                                        <th className="py-2.5 px-4">Asset</th>
                                        <th className="py-2.5 px-4 text-right">Holding Balance</th>
                                        <th className="py-2.5 px-4 text-right">Current Value</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-main font-mono text-xs">
                                      {wallet.holdings.map(h => (
                                        <tr key={h.symbol} className="hover:bg-neutral-100/30 dark:hover:bg-neutral-900/30">
                                          <td className="py-2.5 px-4 font-bold text-main">
                                            <button 
                                              onClick={() => onSelectToken(h.symbol)}
                                              className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded font-mono transition-colors"
                                            >
                                              ${h.symbol}
                                            </button>
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-gray-500">
                                            {h.amount.toLocaleString()}
                                          </td>
                                          <td className="py-2.5 px-4 text-right text-emerald-500 font-semibold">
                                            {formatUsd(h.value)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                              <p className="text-xs text-gray-505 mt-3.5 leading-relaxed italic font-sans">
                                "{wallet.description}"
                              </p>
                            </div>

                            {/* Trade History Widget */}
                            <div>
                              <div className="flex items-center gap-2 mb-3.5">
                                <TrendingUp size={16} className="text-purple-650 dark:text-purple-400" />
                                <h5 className="font-bold text-main tracking-tight font-sans">Recent Scanned Trades</h5>
                              </div>
                              <div className="space-y-2">
                                {wallet.history.length === 0 ? (
                                  <div className="p-6 bg-inner border border-main rounded-xl text-center text-gray-505 text-xs font-mono">
                                    No past trade logs in memory.
                                  </div>
                                ) : (
                                  wallet.history.map((hist, idx) => {
                                    const isBuy = hist.type === "BUY";
                                    return (
                                      <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-inner border border-main hover:border-neutral-300 dark:hover:border-neutral-800 transition-colors">
                                        <div className="flex items-center gap-2.5 font-mono text-xs">
                                          {isBuy ? (
                                            <span className="p-1 rounded bg-emerald-950/40 text-emerald-450 border border-emerald-900/30">
                                              <ArrowUpRight size={12} />
                                            </span>
                                          ) : (
                                            <span className="p-1 rounded bg-red-950/40 text-red-450 border border-red-900/30">
                                              <ArrowDownRight size={12} />
                                            </span>
                                          )}
                                          <div>
                                            <div className="flex items-center gap-1.5 font-sans">
                                              <span className={isBuy ? 'text-emerald-505' : 'text-red-500'}>
                                                {hist.type}
                                              </span>
                                              <button 
                                                onClick={() => onSelectToken(hist.tokenSymbol)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-extrabold px-1 py-0.5 rounded font-mono transition-colors"
                                              >
                                                ${hist.tokenSymbol}
                                              </button>
                                            </div>
                                            <span className="text-[10px] text-gray-500">
                                              {hist.amount.toLocaleString()} at ${hist.price.toLocaleString(undefined, { maximumSignificantDigits: 6 })}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="text-right">
                                          <span className="font-mono text-xs font-semibold text-main">
                                            {formatUsd(hist.value)}
                                          </span>
                                          <p className="text-[9px] text-gray-500 mt-0.5">{hist.time}</p>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
