import React from 'react';
import { LayoutDashboard, Users, Radio, Settings2, Sun, Moon, ShieldAlert } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSimulationRunning, 
  stats, 
  walletAddress, 
  reputation, 
  onConnectWallet,
  theme,
  onToggleTheme,
  isGenLayerConnected
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Inflow Monitor', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Smart Leaderboard', icon: Users },
    { id: 'screener', label: 'Signal Screener', icon: Radio },
    { id: 'simulation', label: 'Simulation Console', icon: Settings2 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-main flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-main flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-900 flex items-center justify-center glow-purple">
            <span className="font-bold text-white text-lg tracking-wider">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-main flex items-center gap-1.5 font-sans">
              CHECK
            </h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest font-semibold font-sans">SMART MONEY TRACKER</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-purple-600 text-white font-extrabold shadow-md shadow-purple-950/20'
                    : 'text-muted hover:bg-neutral-900/10 dark:hover:bg-neutral-900/60 hover:text-main border border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-main'
                  }`}
                />
                <span className="text-sm">{item.label}</span>
                {item.id === 'screener' && stats.highSignals > 0 && (
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-700"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mode Toggle Switcher */}
        <div className="px-6 py-4 border-t border-main flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Theme Mode</span>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all duration-150 text-xs font-bold shadow-sm border border-transparent"
          >
            {theme === 'light' ? (
              <>
                <Moon size={14} className="text-white" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-white" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Wallet Connection & Reputation Footer */}
      <div>
        <div className="px-4 py-3 border-t border-main">
          {walletAddress ? (
            <div className="bg-purple-950/5 dark:bg-purple-950/10 border border-purple-900/20 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-semibold">GenLayer Addr</span>
                <span className="text-purple-700 dark:text-purple-300 font-mono font-bold" title={walletAddress}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-500 font-semibold">Alpha Reputation</span>
                <span className="text-emerald-505 font-mono font-black">{reputation} REP</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-900 hover:from-purple-650 hover:to-indigo-850 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] glow-purple font-sans"
            >
              Connect GenLayer Wallet
            </button>
          )}
        </div>

        {/* GenLayer Node Connection Status Footer */}
        <div className="p-4 border-t border-main">
          <div className={`rounded-xl p-3 border flex items-center justify-between ${
            isGenLayerConnected 
              ? 'bg-emerald-950/10 border-emerald-900/20' 
              : 'bg-amber-950/10 border-amber-900/20'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  isGenLayerConnected ? 'bg-emerald-400' : 'bg-amber-400'
                } opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isGenLayerConnected ? 'bg-emerald-500' : 'bg-amber-550'
                }`}></span>
              </span>
              <div>
                <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider font-semibold">GenLayer Node</p>
                <p className={`text-xs font-bold ${
                  isGenLayerConnected ? 'text-emerald-600 dark:text-emerald-450' : 'text-amber-600 dark:text-amber-500'
                }`}>
                  {isGenLayerConnected ? 'On-Chain Connected' : 'Offline Simulation'}
                </p>
              </div>
            </div>
            <div 
              title={isGenLayerConnected ? 'On-Chain execution active' : 'Offline mockup fallback mode active'}
              className={`text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded border shadow-sm ${
                isGenLayerConnected ? 'bg-emerald-600 border-emerald-500/20' : 'bg-amber-650 border-amber-500/20'
              }`}
            >
              {isGenLayerConnected ? 'ACTIVE' : 'SIMUL'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
