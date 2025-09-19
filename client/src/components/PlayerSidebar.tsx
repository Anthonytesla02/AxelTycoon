import { Player } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Handshake, Network, Shield } from "lucide-react";

interface PlayerSidebarProps {
  player: Player;
  onQuickAction: (action: string) => void;
}

export function PlayerSidebar({ player, onQuickAction }: PlayerSidebarProps) {
  const xpProgress = (player.xp / (player.level * 1000)) * 100;

  return (
    <aside className="w-full lg:w-80 bg-card lg:border-r border-border p-4 lg:p-6 overflow-y-auto max-h-screen lg:max-h-none">
      {/* Player Avatar & Level */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold">
            A
          </div>
          <div>
            <h2 className="text-xl font-bold" data-testid="text-player-name">{player.name}</h2>
            <div className="text-sm text-muted-foreground">Level <span data-testid="text-player-level">{player.level}</span></div>
            {/* XP Progress Bar */}
            <div className="mt-2">
              <Progress value={xpProgress} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground mt-1" data-testid="text-xp-progress">
              {player.xp.toLocaleString()} / {(player.level * 1000).toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Core Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Cash</span>
            <span className="font-mono font-bold text-accent" data-testid="text-player-cash">
              ${(player.cash / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Net Worth</span>
            <span className="font-mono font-bold text-chart-2" data-testid="text-player-networth">
              ${(player.netWorth / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Reputation</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold" data-testid="text-player-reputation">{player.reputation}</span>
              <div className="w-16 bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: `${player.reputation}%` }}></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-destructive">Suspicion</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-destructive" data-testid="text-player-suspicion">{player.suspicion}</span>
              <div className="w-16 bg-muted rounded-full h-2">
                <div className="bg-destructive h-2 rounded-full" style={{ width: `${player.suspicion}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Skills</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center bg-secondary rounded-lg p-3">
            <div className="text-xs text-muted-foreground">ALG</div>
            <div className="text-lg font-bold text-chart-1" data-testid="text-skill-alg">{player.skills.algorithmics}</div>
          </div>
          <div className="text-center bg-secondary rounded-lg p-3">
            <div className="text-xs text-muted-foreground">NEG</div>
            <div className="text-lg font-bold text-chart-2" data-testid="text-skill-neg">{player.skills.negotiation}</div>
          </div>
          <div className="text-center bg-secondary rounded-lg p-3">
            <div className="text-xs text-muted-foreground">LAW</div>
            <div className="text-lg font-bold text-chart-3" data-testid="text-skill-law">{player.skills.law}</div>
          </div>
          <div className="text-center bg-secondary rounded-lg p-3">
            <div className="text-xs text-muted-foreground">OPS</div>
            <div className="text-lg font-bold text-chart-4" data-testid="text-skill-ops">{player.skills.operations}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button 
            variant="secondary" 
            className="w-full justify-start hover:shadow-lg transition-all" 
            onClick={() => onQuickAction("invest")}
            data-testid="button-invest"
          >
            <TrendingUp className="mr-3 text-chart-1" size={16} />
            <span className="font-medium">Invest</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start hover:shadow-lg transition-all" 
            onClick={() => onQuickAction("negotiate")}
            data-testid="button-negotiate"
          >
            <Handshake className="mr-3 text-chart-2" size={16} />
            <span className="font-medium">Negotiate</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start hover:shadow-lg transition-all" 
            onClick={() => onQuickAction("influence")}
            data-testid="button-influence"
          >
            <Network className="mr-3 text-chart-3" size={16} />
            <span className="font-medium">Influence</span>
          </Button>
          <Button 
            variant="secondary" 
            className="w-full justify-start hover:shadow-lg transition-all" 
            onClick={() => onQuickAction("legalShield")}
            data-testid="button-legal-shield"
          >
            <Shield className="mr-3 text-chart-4" size={16} />
            <span className="font-medium">Legal Shield</span>
          </Button>
        </div>
      </div>

      {/* Current Holdings */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Portfolio</h3>
        <div className="space-y-2">
          {player.holdings.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No holdings yet
            </div>
          ) : (
            player.holdings.map((holding, index) => {
              const changePercent = ((holding.currentValue - (holding.quantity * holding.purchasePrice)) / (holding.quantity * holding.purchasePrice)) * 100;
              const isPositive = changePercent >= 0;
              
              return (
                <Card key={index} className="p-3 bg-muted" data-testid={`card-holding-${index}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-accent' : 'bg-destructive'}`}></div>
                      <span className="text-sm">{holding.assetId}</span>
                    </div>
                    <span className={`font-mono text-sm ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}
