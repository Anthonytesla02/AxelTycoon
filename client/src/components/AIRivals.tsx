import { AIRival } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AIRivalsProps {
  rivals: AIRival[];
}

export function AIRivals({ rivals }: AIRivalsProps) {
  const getPersonalityDescription = (rival: AIRival): string => {
    if (rival.personality.risk > 0.7) return "Aggressive Opportunist";
    if (rival.personality.ethics > 0.8) return "Ethical Leader";
    if (rival.personality.reputation > 0.8) return "Reputation Focused";
    if (rival.personality.aggression > 0.6) return "Aggressive Trader";
    return "Steady Builder";
  };

  const getAvatarColor = (index: number): string => {
    const colors = ["bg-chart-1", "bg-chart-4", "bg-chart-2", "bg-chart-5"];
    return colors[index % colors.length];
  };

  const getNetWorthChange = (rival: AIRival): number => {
    // Mock calculation for demonstration
    return (Math.random() - 0.4) * 20; // -8% to +12% range
  };

  return (
    <Card className="border border-border overflow-y-auto" data-testid="card-ai-rivals">
      <CardHeader>
        <CardTitle>AI Rivals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rivals.map((rival, index) => {
          const netWorthChange = getNetWorthChange(rival);
          const isPositive = netWorthChange >= 0;
          
          return (
            <div key={rival.id} className="p-3 bg-secondary rounded-lg" data-testid={`rival-${rival.id}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-sm font-bold`}>
                    {rival.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium" data-testid={`text-rival-name-${rival.id}`}>{rival.name}</div>
                    <div className="text-xs text-muted-foreground">{getPersonalityDescription(rival)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm" data-testid={`text-rival-networth-${rival.id}`}>
                    ${(rival.stats.netWorth / 1000000).toFixed(1)}M
                  </div>
                  <div className={`text-xs ${isPositive ? 'text-chart-2' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{netWorthChange.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Progress value={rival.stats.reputation} className="h-1" />
                </div>
                <div className="text-xs text-muted-foreground" data-testid={`text-rival-reputation-${rival.id}`}>
                  Rep: {rival.stats.reputation}
                </div>
              </div>
              {rival.lastAction && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Last action: {rival.lastAction}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
