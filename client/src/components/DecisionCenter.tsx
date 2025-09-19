import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Handshake, Cog, ChevronRight } from "lucide-react";

interface DecisionCenterProps {
  actionsRemaining: number;
  maxActions: number;
  onActionSelect: (action: string) => void;
  onEndTurn: () => void;
  lastDecisionImpact?: {
    action: string;
    outcome: string;
    probability: number;
    changes: Record<string, number>;
  };
  riskProfile?: {
    marketExposure: number;
    regulatoryRisk: number;
    liquidityRisk: number;
  };
}

export function DecisionCenter({
  actionsRemaining,
  maxActions,
  onActionSelect,
  onEndTurn,
  lastDecisionImpact,
  riskProfile = {
    marketExposure: 68,
    regulatoryRisk: 23,
    liquidityRisk: 35,
  },
}: DecisionCenterProps) {
  const getRiskLevel = (value: number): string => {
    if (value > 70) return "HIGH";
    if (value > 40) return "MED";
    return "LOW";
  };

  const getRiskColor = (value: number): string => {
    if (value > 70) return "text-chart-3";
    if (value > 40) return "text-yellow-500";
    return "text-accent";
  };

  return (
    <Card className="border border-border overflow-y-auto" data-testid="card-decision-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Decision Center</span>
          <Button 
            onClick={onEndTurn}
            disabled={actionsRemaining === maxActions}
            className="hover:shadow-lg transition-all"
            data-testid="button-end-turn"
          >
            End Turn
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Actions */}
        <div>
          <div className="text-sm font-semibold text-muted-foreground mb-2" data-testid="text-actions-remaining">
            Actions Remaining: {actionsRemaining}/{maxActions}
          </div>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full justify-between hover:shadow-lg transition-all"
              onClick={() => onActionSelect("invest")}
              disabled={actionsRemaining === 0}
              data-testid="button-action-invest"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-chart-1" size={16} />
                <div className="text-left">
                  <div className="font-medium">Invest in Assets</div>
                  <div className="text-xs text-muted-foreground">Choose from 6 asset classes</div>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground" size={16} />
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-between hover:shadow-lg transition-all"
              onClick={() => onActionSelect("negotiate")}
              disabled={actionsRemaining === 0}
              data-testid="button-action-negotiate"
            >
              <div className="flex items-center space-x-3">
                <Handshake className="text-chart-2" size={16} />
                <div className="text-left">
                  <div className="font-medium">Negotiate Deal</div>
                  <div className="text-xs text-muted-foreground">Partner with AI rivals</div>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground" size={16} />
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-between hover:shadow-lg transition-all"
              onClick={() => onActionSelect("advanced")}
              disabled={actionsRemaining === 0}
              data-testid="button-action-advanced"
            >
              <div className="flex items-center space-x-3">
                <Cog className="text-chart-3" size={16} />
                <div className="text-left">
                  <div className="font-medium">Advanced Actions</div>
                  <div className="text-xs text-muted-foreground">Influence, Expose, Legal Shield</div>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground" size={16} />
            </Button>
          </div>
        </div>

        {/* Decision Consequences */}
        {lastDecisionImpact && (
          <div>
            <div className="text-sm font-semibold text-muted-foreground mb-2">Recent Decision Impact</div>
            <div className="p-3 bg-muted rounded-lg" data-testid="recent-decision-impact">
              <div className="text-sm font-medium mb-1" data-testid="text-last-action">
                {lastDecisionImpact.action}
              </div>
              <div className="text-xs text-muted-foreground mb-2" data-testid="text-outcome">
                Outcome: {lastDecisionImpact.outcome} ({lastDecisionImpact.probability}% probability achieved)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(lastDecisionImpact.changes).map(([key, value]) => (
                  <div key={key}>
                    {key}: <span className={value >= 0 ? 'text-chart-2' : 'text-destructive'}>
                      {value >= 0 ? '+' : ''}{typeof value === 'number' ? value.toLocaleString() : value}
                      {key === 'Cash' ? '' : key === 'XP' ? '' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        <div>
          <div className="text-sm font-semibold text-muted-foreground mb-2">Current Risk Profile</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Market Exposure</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-chart-3 h-2 rounded-full transition-all" 
                    style={{ width: `${riskProfile.marketExposure}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-mono ${getRiskColor(riskProfile.marketExposure)}`}>
                  {getRiskLevel(riskProfile.marketExposure)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Regulatory Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-chart-3 h-2 rounded-full transition-all" 
                    style={{ width: `${riskProfile.regulatoryRisk}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-mono ${getRiskColor(riskProfile.regulatoryRisk)}`}>
                  {getRiskLevel(riskProfile.regulatoryRisk)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Liquidity Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all" 
                    style={{ width: `${riskProfile.liquidityRisk}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-mono ${getRiskColor(riskProfile.liquidityRisk)}`}>
                  {getRiskLevel(riskProfile.liquidityRisk)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
