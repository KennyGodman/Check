import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, PlayCircle, RefreshCw, Terminal, Plus, Radio, Zap } from 'lucide-react';

export default function SimulationConsole({
  isSimulationRunning,
  setIsSimulationRunning,
  simulationInterval,
  setSimulationInterval,
  wallets,
  tokens,
  triggerSimulatedTrade,
  onResetData,
  onClearData,
  customInjectTrade
}) {
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.address || '');
  const [selectedToken, setSelectedToken] = useState(tokens[0]?.symbol || '');
  const [injectType, setInjectType] = useState('BUY');
  const [injectUsd, setInjectUsd] = useState('8500');

  // Logs terminal state
  const [logs, setLogs] = useState([
    { id: 'log-1', time: new Date().toLocaleTimeString(), text: 'System Initialized. Indexing wallets...', type: 'info' },
    { id: 'log-2', time: new Date().toLocaleTimeString(), text: 'Connection established with Solana RPC endpoint.', type: 'success' },
    { id: 'log-3', time: new Date().toLocaleTimeString(), text: 'Scanner active. Listening for Raydium/Orca contract swaps.', type: 'info' }
  ]);
  const terminalEndRef = useRef(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Generate background scanning log events
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      const scanLogs = [
        `[SCANNER] Checking wallets for activity...`,
        `[SCANNER] Scanned DexScreener token pools for liquidity volume changes.`,
        `[DEX INDEXER] Monitored 24 active liquidity pools on Raydium.`,
        `[METRICS] Recalculating wallet overlap scores for emerge alerts.`,
        `[SOL INDEXER] Checked transaction blocks. Zero leakage detected.`
      ];
      
      const randomLog = scanLogs[Math.floor(Math.random() * scanLogs.length)];
      setLogs(prev => [
        ...prev.slice(-25), // keep last 25 logs
        { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString(), text: randomLog, type: 'info' }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  const handleInjectSubmit = (e) => {
    e.preventDefault();
    if (!selectedWallet || !selectedToken) return;

    const walletObj = wallets.find(w => w.address === selectedWallet);
    const tokenObj = tokens.find(t => t.symbol === selectedToken);
    
    if (!walletObj || !tokenObj) return;

    customInjectTrade({
      walletAddress: selectedWallet,
      tokenSymbol: selectedToken,
      type: injectType,
      valueUsd: parseFloat(injectUsd) || 5000
    });

    // Append injection log
    setLogs(prev => [
      ...prev,
      { 
        id: `log-${Date.now()}`, 
        time: new Date().toLocaleTimeString(), 
        text: `[INJECTION] Forced ${walletObj.name} to ${injectType} $${tokenObj.symbol} ($${parseFloat(injectUsd).toLocaleString()})`,
        type: 'inject' 
      }
    ]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'inject': return 'text-purple-400 font-bold';
      case 'error': return 'text-red-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-8 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-main">Simulation Console</h2>
        <p className="text-gray-505 text-sm mt-1">
          Adjust simulation parameters, inject customized trades, and inspect system log streams.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulation Controls & Event Injection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Engine control card */}
          <div className="glass-panel rounded-2xl border border-main p-5 space-y-4">
            <h4 className="font-bold text-main text-base flex items-center gap-2">
              <Zap size={16} className="text-purple-450" />
              Engine Settings
            </h4>

            {/* Run Button */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-200 border border-transparent shadow-md shadow-purple-950/20"
              >
                {isSimulationRunning ? (
                  <>
                    <Pause size={16} /> Pause Scanner Feed
                  </>
                ) : (
                  <>
                    <Play size={16} /> Resume Scanner Feed
                  </>
                )}
              </button>
            </div>

            {/* Stream Speed Settings */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-505 uppercase tracking-wider">Stream Trigger Speed</label>
              <div className="grid grid-cols-3 gap-2 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-main">
                {[
                  { label: 'Slow (12s)', val: 12000 },
                  { label: 'Medium (6s)', val: 6000 },
                  { label: 'Fast (3s)', val: 3000 }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setSimulationInterval(item.val)}
                    className={`py-2 text-[10px] font-bold rounded-lg uppercase transition-colors ${
                      simulationInterval === item.val
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-500 hover:text-main'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual scan force & reset options */}
            <div className="pt-2 border-t border-main grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onResetData}
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl border border-transparent transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw size={12} />
                Reset Datasets
              </button>
              <button
                onClick={onClearData}
                className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl border border-transparent transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                Clear Trade Feed
              </button>
            </div>
          </div>

          {/* Trade Injection Panel */}
          <div className="glass-panel rounded-2xl border border-main p-5 space-y-4">
            <h4 className="font-bold text-main text-base flex items-center gap-2">
              <Plus size={16} className="text-purple-500 animate-pulse" />
              Force Inject Trade Alert
            </h4>
            
            <form onSubmit={handleInjectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-550 uppercase tracking-wider mb-1.5">Selecting Wallet</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3 py-2.5 text-xs text-main focus:outline-none focus:border-purple-600"
                >
                  {wallets.map(w => (
                    <option key={w.address} value={w.address}>{w.name} ({w.label})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-550 uppercase tracking-wider mb-1.5">Asset Token</label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full bg-input border border-main rounded-xl px-3 py-2.5 text-xs text-main focus:outline-none focus:border-purple-600"
                  >
                    {tokens.map(t => (
                      <option key={t.symbol} value={t.symbol}>${t.symbol}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-550 uppercase tracking-wider mb-1.5">Swap Type</label>
                  <select
                    value={injectType}
                    onChange={(e) => setInjectType(e.target.value)}
                    className="w-full bg-input border border-main rounded-xl px-3 py-2.5 text-xs text-main focus:outline-none focus:border-purple-600"
                  >
                    <option value="BUY">BUY Swap</option>
                    <option value="SELL">SELL Swap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-550 uppercase tracking-wider mb-1.5">Position Size (USD)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={injectUsd}
                  onChange={(e) => setInjectUsd(e.target.value)}
                  className="w-full bg-input border border-main rounded-xl px-3 py-2.5 text-xs text-main focus:outline-none focus:border-purple-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 glow-purple"
              >
                <FastForward size={14} />
                Inject Event swap
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns: Systems Terminal log feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-main overflow-hidden flex flex-col h-[525px]">
          <div className="p-4 bg-neutral-100 dark:bg-neutral-950/60 border-b border-main flex items-center gap-2">
            <Terminal size={16} className="text-gray-500" />
            <h4 className="font-bold text-main text-sm">Blockchain Node Indexer Logs</h4>
          </div>

          {/* Terminal Terminal Area */}
          <div className="flex-1 bg-black p-5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-1.5 select-text selection:bg-purple-950 selection:text-purple-200">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <span className="text-gray-700 shrink-0 select-none">[{log.time}]</span>
                <span className={getLogColor(log.type)}>{log.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
