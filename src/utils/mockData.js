// Mock Data & Simulation Engine for Check Smart Wallet Tracker

// 1. Initial Tracked Elite Wallets (proven trackers)
export const initialWallets = [
  {
    address: "7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ1",
    name: "Apex Sniper (Solana)",
    label: "Sniper",
    roi: 1142, // +1142%
    winRate: 84, // 84%
    netProfit: 482500, // USD
    trades30d: 148,
    style: "Memecoin Sniper",
    description: "Highly aggressive micro-cap sniper. Average entry duration: < 6 hours. Enters early on developer-deployed contracts.",
    holdings: [
      { symbol: "KRONOS", amount: 14200000, value: 58504 },
      { symbol: "NEIRO", amount: 820000, value: 24320 },
      { symbol: "APEX", amount: 50000, value: 12500 }
    ],
    history: [
      { type: "BUY", tokenSymbol: "KRONOS", amount: 4200000, price: 0.0035, value: 14700, time: "10 mins ago" },
      { type: "BUY", tokenSymbol: "NEIRO", amount: 200000, price: 0.029, value: 5800, time: "42 mins ago" },
      { type: "SELL", tokenSymbol: "WIF", amount: 15000, price: 2.45, value: 36750, time: "2 hours ago" }
    ]
  },
  {
    address: "3yNed7K8vWpQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXWz",
    name: "Alpha Accumulator",
    label: "Accumulator",
    roi: 765,
    winRate: 72,
    netProfit: 298400,
    trades30d: 56,
    style: "Mid-cap Inflows",
    description: "Builds large positions in quality mid-caps during consolidation. Average holding time: 4-12 days.",
    holdings: [
      { symbol: "NEXUS", amount: 850000, value: 89250 },
      { symbol: "POPCAT", amount: 110000, value: 121000 },
      { symbol: "PYTH", amount: 45000, value: 18450 }
    ],
    history: [
      { type: "BUY", tokenSymbol: "NEXUS", amount: 150000, price: 0.098, value: 14700, time: "1 hour ago" },
      { type: "BUY", tokenSymbol: "POPCAT", amount: 25000, price: 1.08, value: 27000, time: "5 hours ago" }
    ]
  },
  {
    address: "G5e9jK8vN3s1hP6r2eT9u4fB5c8nK6q2vXWz3yNed7K",
    name: "DeFi Degen Whale",
    label: "Whale",
    roi: 589,
    winRate: 68,
    netProfit: 1205000,
    trades30d: 32,
    style: "Heavy Bags",
    description: "High volume positions in emerging utilities and liquidity protocols. Enters with $50K+ per trade.",
    holdings: [
      { symbol: "JITO", amount: 84000, value: 235200 },
      { symbol: "BONK", amount: 4500000000, value: 112500 },
      { symbol: "NEXUS", amount: 620000, value: 65100 }
    ],
    history: [
      { type: "BUY", tokenSymbol: "JITO", amount: 8500, price: 2.75, value: 23375, time: "3 hours ago" },
      { type: "BUY", tokenSymbol: "NEXUS", amount: 120000, price: 0.101, value: 12120, time: "6 hours ago" }
    ]
  },
  {
    address: "9rPqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ17xT2y",
    name: "Micro-cap Sniper",
    label: "Sniper",
    roi: 1280,
    winRate: 61,
    netProfit: 324100,
    trades30d: 210,
    style: "Extreme High Risk",
    description: "Snipes freshly launched tokens below $1M market cap. High failure rate but massive winners (100x+).",
    holdings: [
      { symbol: "KRONOS", amount: 3500000, value: 14420 },
      { symbol: "SPARK", amount: 12500000, value: 18750 }
    ],
    history: [
      { type: "BUY", tokenSymbol: "SPARK", amount: 4000000, price: 0.0012, value: 4800, time: "5 mins ago" },
      { type: "BUY", tokenSymbol: "KRONOS", amount: 1200000, price: 0.0041, value: 4920, time: "22 mins ago" },
      { type: "SELL", tokenSymbol: "NEIRO", amount: 150000, price: 0.031, value: 4650, time: "1 hour ago" }
    ]
  },
  {
    address: "H4eQ1w8J3d7fA6b2C9oK4vLQ17xT2yR9PqM5s8KzN5v",
    name: "Smart Beta Vault",
    label: "Institutional",
    roi: 412,
    winRate: 88,
    netProfit: 2140000,
    trades30d: 14,
    style: "Conservative",
    description: "Low-frequency wallet focused on top-tier protocols. Moves massive liquidity with extreme discretion.",
    holdings: [
      { symbol: "PYTH", amount: 250000, value: 102500 },
      { symbol: "JITO", amount: 48000, value: 134400 }
    ],
    history: [
      { type: "BUY", tokenSymbol: "PYTH", amount: 35000, price: 0.40, value: 14000, time: "1 day ago" }
    ]
  }
];

// 2. Initial Emerging/Tracked Tokens
export const initialTokens = [
  {
    symbol: "NEXUS",
    name: "Nexus Network",
    address: "7xxNExuS2pQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXW",
    price: 0.105,
    change24h: 18.4,
    volume24h: 1250000,
    marketCap: 10500000, // $10.5M
    smartHoldersCount: 2, // Accumulator & DeFi Degen
    smartInflow: 166420, // total bought by smart wallets
    avgEntryPrice: 0.095,
    category: "DeFi",
    probabilityScore: 68,
    sparkline: [62, 65, 68, 67, 72, 75, 74, 82, 85, 83, 91, 95, 99, 102, 105]
  },
  {
    symbol: "KRONOS",
    name: "Kronos AI",
    address: "KrOnOS7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C",
    price: 0.00412,
    change24h: 38.6,
    volume24h: 840000,
    marketCap: 4120000, // $4.12M
    smartHoldersCount: 2, // Apex Sniper & Micro-cap Sniper
    smartInflow: 72924,
    avgEntryPrice: 0.0037,
    category: "AI",
    probabilityScore: 78,
    sparkline: [22, 25, 29, 31, 30, 33, 35, 37, 36, 39, 41, 40, 42, 41, 41]
  },
  {
    symbol: "NEIRO",
    name: "First Neiro",
    address: "NeIrO3yNed7K8vWpQ5zM1jS3hP6r2eT9u4fB5c8nK",
    price: 0.0296,
    change24h: -4.2,
    volume24h: 4100000,
    marketCap: 29600000, // $29.6M
    smartHoldersCount: 1, // Apex Sniper
    smartInflow: 28970,
    avgEntryPrice: 0.029,
    category: "Meme",
    probabilityScore: 45,
    sparkline: [32, 31, 33, 32, 30, 29, 29, 30, 31, 30, 29, 29, 29, 30, 29]
  },
  {
    symbol: "SPARK",
    name: "Spark Protocol",
    address: "SpArK5e9jK8vN3s1hP6r2eT9u4fB5c8nK6q2vXW3y",
    price: 0.0015,
    change24h: 12.1,
    volume24h: 220000,
    marketCap: 1500000, // $1.5M
    smartHoldersCount: 1, // Micro-cap Sniper
    smartInflow: 18750,
    avgEntryPrice: 0.0012,
    category: "DeFi",
    probabilityScore: 54,
    sparkline: [11, 12, 12, 11, 13, 12, 13, 14, 13, 14, 15, 14, 15, 15, 15]
  },
  {
    symbol: "JITO",
    name: "Jito Network",
    address: "JiTo4eQ1w8J3d7fA6b2C9oK4vLQ17xT2yR9PqM5s8",
    price: 2.80,
    change24h: 3.5,
    volume24h: 12400000,
    marketCap: 336000000, // $336M
    smartHoldersCount: 2, // DeFi Degen Whale & Smart Beta Vault
    smartInflow: 369600,
    avgEntryPrice: 2.76,
    category: "DeFi",
    probabilityScore: 61,
    sparkline: [2.68, 2.70, 2.72, 2.71, 2.73, 2.75, 2.74, 2.78, 2.77, 2.79, 2.80, 2.78, 2.81, 2.80, 2.80]
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    address: "PyTh9rPqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ",
    price: 0.41,
    change24h: 1.8,
    volume24h: 8900000,
    marketCap: 410000000, // $410M
    smartHoldersCount: 2, // Alpha Accumulator & Smart Beta Vault
    smartInflow: 120950,
    avgEntryPrice: 0.40,
    category: "DeFi",
    probabilityScore: 58,
    sparkline: [0.39, 0.40, 0.40, 0.39, 0.41, 0.40, 0.41, 0.41, 0.41, 0.40, 0.41, 0.41, 0.42, 0.41, 0.41]
  }
];

// 3. Simulated Transactions Feed (Historical Seed)
export const initialTransactions = [
  {
    id: "tx-1",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    walletAddress: "9rPqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ17xT2y",
    walletName: "Micro-cap Sniper",
    type: "BUY",
    tokenSymbol: "SPARK",
    tokenName: "Spark Protocol",
    amount: 4000000,
    valueUsd: 4800,
    price: 0.0012,
    txHash: "5N2d...q8Xz"
  },
  {
    id: "tx-2",
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    walletAddress: "7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ1",
    walletName: "Apex Sniper (Solana)",
    type: "BUY",
    tokenSymbol: "KRONOS",
    tokenName: "Kronos AI",
    amount: 4200000,
    valueUsd: 14700,
    price: 0.0035,
    txHash: "4P2a...k9Lm"
  },
  {
    id: "tx-3",
    timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
    walletAddress: "9rPqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ17xT2y",
    walletName: "Micro-cap Sniper",
    type: "BUY",
    tokenSymbol: "KRONOS",
    tokenName: "Kronos AI",
    amount: 1200000,
    valueUsd: 4920,
    price: 0.0041,
    txHash: "3Mz1...w2Pr"
  },
  {
    id: "tx-4",
    timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
    walletAddress: "7xT2yR9PqM5s8KzN5vH4eQ1w8J3d7fA6b2C9oK4vLQ1",
    walletName: "Apex Sniper (Solana)",
    type: "BUY",
    tokenSymbol: "NEIRO",
    tokenName: "First Neiro",
    amount: 200000,
    valueUsd: 5800,
    price: 0.029,
    txHash: "8T9u...fB5c"
  },
  {
    id: "tx-5",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    walletAddress: "3yNed7K8vWpQ5zM1jS3hP6r2eT9u4fB5c8nK6q2vXWz",
    walletName: "Alpha Accumulator",
    type: "BUY",
    tokenSymbol: "NEXUS",
    tokenName: "Nexus Network",
    amount: 150000,
    valueUsd: 14700,
    price: 0.098,
    txHash: "2nXw...9yZd"
  }
];

// Calculates the Move Probability Score (60-70% win-rate core logic)
// Formula combines: 
// 1. Wallet concentration/overlap (more wallets holding = higher score)
// 2. Buy velocity/activity within 24h
// 3. Market cap ratio (lower MCAP tokens spike faster on smart money buying)
// 4. Win rate index of holding wallets
export function calculateProbabilityScore(token, allWallets, recentTxs) {
  // 1. Overlap Factor
  const overlapCount = token.smartHoldersCount || 0;
  const overlapPoints = Math.min(overlapCount * 12, 45); // up to 45%

  // 2. Buy Velocity Factor (how many buys in last 2 hours)
  const twoHoursAgo = Date.now() - 2 * 3600000;
  const recentBuys = recentTxs.filter(tx => 
    tx.tokenSymbol === token.symbol && 
    tx.type === "BUY" && 
    new Date(tx.timestamp).getTime() > twoHoursAgo
  );
  const velocityPoints = Math.min(recentBuys.length * 8, 20); // up to 20%

  // 3. Market Cap/Liquidity multiplier (Lower MCAP has higher spike potential, capped)
  let mcapModifier = 0;
  if (token.marketCap < 2000000) {
    mcapModifier = 15; // micro cap gets full speed boost
  } else if (token.marketCap < 10000000) {
    mcapModifier = 10;
  } else if (token.marketCap < 50000000) {
    mcapModifier = 5;
  }

  // 4. Wallet Quality Index (Win-rate factor of active buyers)
  const activeBuyers = allWallets.filter(w => 
    w.holdings.some(h => h.symbol === token.symbol)
  );
  let averageWinRate = 60; // base fallback
  if (activeBuyers.length > 0) {
    const sum = activeBuyers.reduce((acc, w) => acc + w.winRate, 0);
    averageWinRate = sum / activeBuyers.length;
  }
  const qualityPoints = (averageWinRate / 100) * 15; // up to 15%

  // Total
  const total = 10 + overlapPoints + velocityPoints + mcapModifier + qualityPoints;
  
  // Return bounded between 15% and 89% (realistic threshold)
  return Math.min(Math.max(Math.round(total), 15), 89);
}

// 4. On-chain transaction generator
export function generateSimulatedTrade(currentWallets, currentTokens, currentTxs) {
  // Select a random wallet
  const wallet = currentWallets[Math.floor(Math.random() * currentWallets.length)];
  
  // Decide whether to buy an existing token (85%) or discover a new memecoin runner (15%)
  const isNewDiscovery = Math.random() < 0.15;
  
  let tokenSymbol;
  let tokenName;
  let tokenPrice;
  let isBuy = Math.random() < 0.80; // 80% Buys, 20% Sells (smart money accumulates)
  
  if (isNewDiscovery) {
    const newMemeSymbols = ["PEPE", "SHIB", "DOGE", "MEW", "NEIRO", "WIF", "BONK", "POPCAT"];
    const unusedSymbols = newMemeSymbols.filter(s => !currentTokens.some(t => t.symbol === s));
    
    if (unusedSymbols.length > 0) {
      tokenSymbol = unusedSymbols[Math.floor(Math.random() * unusedSymbols.length)];
      tokenName = `${tokenSymbol} Protocol`;
      tokenPrice = parseFloat((Math.random() * 0.05 + 0.0001).toFixed(6));
    } else {
      // Fallback to existing
      const randomToken = currentTokens[Math.floor(Math.random() * currentTokens.length)];
      tokenSymbol = randomToken.symbol;
      tokenName = randomToken.name;
      tokenPrice = randomToken.price;
    }
  } else {
    // Select an existing token
    const randomToken = currentTokens[Math.floor(Math.random() * currentTokens.length)];
    tokenSymbol = randomToken.symbol;
    tokenName = randomToken.name;
    tokenPrice = randomToken.price;
  }

  // Generate trade amounts
  // High-rollers buy bigger, Snipers buy faster
  let usdValue = 1000 + Math.random() * 15000;
  if (wallet.label === "Whale" || wallet.label === "Institutional") {
    usdValue = 15000 + Math.random() * 60000;
  }
  
  const amount = Math.round(usdValue / tokenPrice);
  
  // Update transaction list
  const newTx = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    walletAddress: wallet.address,
    walletName: wallet.name,
    type: isBuy ? "BUY" : "SELL",
    tokenSymbol,
    tokenName,
    amount,
    valueUsd: Math.round(usdValue),
    price: tokenPrice,
    txHash: `${Math.floor(Math.random() * 9 + 1)}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(7, 11)}`
  };

  return { newTx, tokenSymbol, tokenName, tokenPrice, isBuy, wallet, usdValue, amount };
}
