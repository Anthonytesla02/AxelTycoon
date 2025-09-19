import { Asset, GameStateData, MarketEvent } from "@shared/schema";

export class MarketService {
  private rng: () => number;

  constructor() {
    this.rng = Math.random;
  }

  setSeed(seed: string): void {
    // Simple seeded random number generator
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    this.rng = () => {
      hash = ((hash * 1664525) + 1013904223) % Math.pow(2, 32);
      return (hash / Math.pow(2, 32) + 1) / 2;
    };
  }

  initializeAssets(seed: string): Asset[] {
    this.setSeed(seed);
    
    const assets: Asset[] = [
      // Stocks
      {
        id: "TECH001",
        name: "TechCorp Inc.",
        type: "stocks",
        currentPrice: 125.50 + (this.rng() - 0.5) * 20,
        priceHistory: [],
        volatility: 0.15,
        riskLevel: "medium",
        minimumInvestment: 1000,
        description: "Leading technology company specializing in AI and cloud computing",
      },
      {
        id: "BLUE001",
        name: "Global Industries",
        type: "stocks",
        currentPrice: 85.25 + (this.rng() - 0.5) * 10,
        priceHistory: [],
        volatility: 0.08,
        riskLevel: "low",
        minimumInvestment: 500,
        description: "Diversified blue-chip company with stable dividends",
      },
      
      // Cryptocurrency
      {
        id: "BTC001",
        name: "Bitcoin",
        type: "crypto",
        currentPrice: 45000 + (this.rng() - 0.5) * 10000,
        priceHistory: [],
        volatility: 0.35,
        riskLevel: "extreme",
        minimumInvestment: 100,
        description: "The original cryptocurrency with high volatility",
      },
      {
        id: "ETH001",
        name: "Ethereum",
        type: "crypto",
        currentPrice: 2800 + (this.rng() - 0.5) * 500,
        priceHistory: [],
        volatility: 0.32,
        riskLevel: "extreme",
        minimumInvestment: 100,
        description: "Smart contract platform and second-largest cryptocurrency",
      },
      
      // Real Estate
      {
        id: "RE001",
        name: "Manhattan Office Complex",
        type: "realEstate",
        currentPrice: 2500000 + (this.rng() - 0.5) * 500000,
        priceHistory: [],
        volatility: 0.05,
        riskLevel: "low",
        minimumInvestment: 100000,
        description: "Prime commercial real estate in Manhattan",
      },
      {
        id: "RE002",
        name: "Silicon Valley Apartments",
        type: "realEstate",
        currentPrice: 1800000 + (this.rng() - 0.5) * 300000,
        priceHistory: [],
        volatility: 0.08,
        riskLevel: "medium",
        minimumInvestment: 50000,
        description: "Residential complex in high-demand tech area",
      },
      
      // Startups
      {
        id: "START001",
        name: "QuantumLeap AI",
        type: "startups",
        currentPrice: 10.00 + (this.rng() - 0.5) * 5,
        priceHistory: [],
        volatility: 0.45,
        riskLevel: "extreme",
        minimumInvestment: 10000,
        description: "Early-stage AI startup with breakthrough quantum algorithms",
      },
      {
        id: "START002",
        name: "GreenTech Solutions",
        type: "startups",
        currentPrice: 15.75 + (this.rng() - 0.5) * 8,
        priceHistory: [],
        volatility: 0.38,
        riskLevel: "high",
        minimumInvestment: 5000,
        description: "Clean energy startup with promising solar technology",
      },
      
      // Commodities
      {
        id: "GOLD001",
        name: "Gold Futures",
        type: "commodities",
        currentPrice: 1950 + (this.rng() - 0.5) * 100,
        priceHistory: [],
        volatility: 0.12,
        riskLevel: "low",
        minimumInvestment: 1000,
        description: "Precious metals hedge against inflation",
      },
      {
        id: "OIL001",
        name: "Crude Oil",
        type: "commodities",
        currentPrice: 75 + (this.rng() - 0.5) * 15,
        priceHistory: [],
        volatility: 0.25,
        riskLevel: "high",
        minimumInvestment: 500,
        description: "Energy commodity with geopolitical sensitivity",
      },
      
      // Bonds
      {
        id: "BOND001",
        name: "Treasury Bonds",
        type: "bonds",
        currentPrice: 1000 + (this.rng() - 0.5) * 50,
        priceHistory: [],
        volatility: 0.03,
        riskLevel: "low",
        minimumInvestment: 1000,
        description: "Government bonds with guaranteed returns",
      },
    ];

    // Initialize price history
    for (const asset of assets) {
      asset.priceHistory = [asset.currentPrice];
    }

    return assets;
  }

  updateMarket(gameState: GameStateData): void {
    const { assets, marketEvents } = gameState;
    
    // Base market update
    for (const asset of assets) {
      this.updateAssetPrice(asset, gameState);
    }
    
    // Apply market events
    for (const event of marketEvents) {
      this.applyMarketEvent(assets, event);
    }
    
    // Generate random market shocks (black swan events)
    if (this.rng() < 0.02) { // 2% chance per turn
      this.generateMarketShock(assets);
    }
  }

  private updateAssetPrice(asset: Asset, gameState: GameStateData): void {
    const baseVolatility = asset.volatility * gameState.gameSettings.marketVolatility;
    
    // Random walk with fat-tailed distribution
    let priceChange = 0;
    
    if (this.rng() < 0.95) {
      // Normal random walk (95% of the time)
      priceChange = (this.rng() - 0.5) * baseVolatility * 2;
    } else {
      // Fat-tail event (5% of the time)
      priceChange = (this.rng() - 0.5) * baseVolatility * 8;
    }
    
    // Apply trend based on asset type
    const trend = this.getAssetTrend(asset.type);
    priceChange += trend;
    
    // Update price
    const newPrice = asset.currentPrice * (1 + priceChange);
    asset.currentPrice = Math.max(newPrice, asset.currentPrice * 0.1); // Prevent prices from going too low
    
    // Update history
    asset.priceHistory.push(asset.currentPrice);
    if (asset.priceHistory.length > 100) {
      asset.priceHistory.shift();
    }
  }

  private getAssetTrend(assetType: string): number {
    const trends = {
      stocks: 0.002,
      crypto: 0.001,
      realEstate: 0.001,
      startups: -0.001,
      commodities: 0.0005,
      bonds: 0.0002,
    };
    
    return trends[assetType as keyof typeof trends] || 0;
  }

  private applyMarketEvent(assets: Asset[], event: MarketEvent): void {
    for (const asset of assets) {
      if (event.impact.assetTypes.includes(asset.type)) {
        asset.currentPrice *= event.impact.priceMultiplier;
      }
    }
  }

  private generateMarketShock(assets: Asset[]): void {
    const shockTypes = ["crash", "boom"];
    const shockType = shockTypes[Math.floor(this.rng() * shockTypes.length)];
    
    const multiplier = shockType === "crash" ? 0.7 + this.rng() * 0.2 : 1.3 + this.rng() * 0.4;
    
    // Apply to random subset of assets
    const affectedAssets = assets.filter(() => this.rng() < 0.3);
    
    for (const asset of affectedAssets) {
      asset.currentPrice *= multiplier;
    }
  }

  getMarketIndices(assets: Asset[]): any {
    const stockAssets = assets.filter(a => a.type === "stocks");
    const cryptoAssets = assets.filter(a => a.type === "crypto");
    
    const stockIndex = stockAssets.reduce((sum, asset) => sum + asset.currentPrice, 0) / stockAssets.length;
    const cryptoIndex = cryptoAssets.reduce((sum, asset) => sum + asset.currentPrice, 0) / cryptoAssets.length;
    
    return {
      sp500: {
        value: stockIndex * 35.3, // Scale to realistic S&P 500 range
        change: (this.rng() - 0.5) * 4, // -2% to +2%
      },
      nasdaq: {
        value: stockIndex * 126.2, // Scale to realistic NASDAQ range
        change: (this.rng() - 0.5) * 6, // -3% to +3%
      },
      crypto: {
        value: cryptoIndex,
        change: (this.rng() - 0.5) * 20, // -10% to +10%
      },
    };
  }

  getMarketVolatility(): number {
    return 0.4 + this.rng() * 0.6; // 40-100% volatility
  }
}
