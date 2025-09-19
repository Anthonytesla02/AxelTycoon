import { Asset } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketOverviewProps {
  assets: Asset[];
  marketVolatility: number;
}

export function MarketOverview({ assets, marketVolatility }: MarketOverviewProps) {
  const stockAssets = assets.filter(a => a.type === "stocks");
  const cryptoAssets = assets.filter(a => a.type === "crypto");
  
  const calculateIndexValue = (assetList: Asset[]) => {
    if (assetList.length === 0) return 0;
    return assetList.reduce((sum, asset) => sum + asset.currentPrice, 0) / assetList.length;
  };

  const calculateIndexChange = (assetList: Asset[]) => {
    if (assetList.length === 0) return 0;
    return (Math.random() - 0.5) * 4; // Mock change for now
  };

  const sp500Value = calculateIndexValue(stockAssets) * 35.3;
  const sp500Change = calculateIndexChange(stockAssets);
  const nasdaqValue = calculateIndexValue(stockAssets) * 126.2;
  const nasdaqChange = calculateIndexChange(stockAssets);

  const assetClassPerformance = [
    { name: "Stocks", change: sp500Change },
    { name: "Crypto", change: calculateIndexChange(cryptoAssets) * 2 },
    { name: "Real Estate", change: (Math.random() - 0.5) * 2 },
    { name: "Startups", change: (Math.random() - 0.5) * 8 },
  ];

  const volatilityLevel = marketVolatility > 0.7 ? "HIGH" : marketVolatility > 0.4 ? "MEDIUM" : "LOW";
  const volatilityColor = marketVolatility > 0.7 ? "text-chart-3" : marketVolatility > 0.4 ? "text-yellow-500" : "text-accent";

  return (
    <Card className="border border-border overflow-y-auto" data-testid="card-market-overview">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Market Overview</span>
          <div className="text-sm text-muted-foreground">Live</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Indices */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Major Indices</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div>
                <div className="font-medium">S&P 500</div>
                <div className="text-sm text-muted-foreground" data-testid="text-sp500-value">
                  {sp500Value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono flex items-center ${sp500Change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {sp500Change >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {sp500Change >= 0 ? '+' : ''}{sp500Change.toFixed(1)}%
                </div>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent mt-1"></div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <div>
                <div className="font-medium">NASDAQ</div>
                <div className="text-sm text-muted-foreground" data-testid="text-nasdaq-value">
                  {nasdaqValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono flex items-center ${nasdaqChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {nasdaqChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                  {nasdaqChange >= 0 ? '+' : ''}{nasdaqChange.toFixed(1)}%
                </div>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent mt-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Classes */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">Asset Classes</div>
          <div className="grid grid-cols-2 gap-2">
            {assetClassPerformance.map((asset, index) => (
              <div key={index} className="p-2 bg-muted rounded text-center" data-testid={`asset-class-${asset.name.toLowerCase()}`}>
                <div className="text-xs">{asset.name}</div>
                <div className={`font-mono ${asset.change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Volatility Indicator */}
        <div className="p-3 bg-secondary rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm">Market Volatility</span>
            <span className={`font-mono ${volatilityColor}`} data-testid="text-volatility-level">{volatilityLevel}</span>
          </div>
          <div className="mt-2 bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${volatilityLevel === 'HIGH' ? 'bg-chart-3 animate-pulse' : 'bg-accent'}`}
              style={{ width: `${marketVolatility * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
