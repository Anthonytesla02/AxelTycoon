import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Asset, AIRival, Action } from "@shared/schema";
import { TrendingUp, Rocket, Bitcoin, Building, Landmark, ChartLine, DollarSign, Users, Shield, Heart } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: Action) => void;
  actionType: string;
  playerCash: number;
  assets?: Asset[];
  rivals?: AIRival[];
}

export function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  playerCash,
  assets = [],
  rivals = [],
}: ActionModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleConfirm = () => {
    const action: Action = {
      type: actionType as any,
      target: selectedTarget || undefined,
      amount: amount ? parseFloat(amount) : undefined,
    };
    onConfirm(action);
    onClose();
    setSelectedTarget("");
    setAmount("");
  };

  const getModalTitle = (): string => {
    switch (actionType) {
      case "invest":
        return "Investment Options";
      case "negotiate":
        return "Negotiation Partners";
      case "influence":
        return "Influence Campaign";
      case "legalShield":
        return "Legal Protection";
      case "philanthropy":
        return "Philanthropic Projects";
      case "expose":
        return "Expose Rival";
      default:
        return "Select Action";
    }
  };

  const getAssetIcon = (assetType: string) => {
    switch (assetType) {
      case "stocks":
        return <TrendingUp className="text-chart-1" size={20} />;
      case "startups":
        return <Rocket className="text-chart-3" size={20} />;
      case "crypto":
        return <Bitcoin className="text-chart-3" size={20} />;
      case "realEstate":
        return <Building className="text-chart-2" size={20} />;
      case "bonds":
        return <Landmark className="text-accent" size={20} />;
      case "commodities":
        return <ChartLine className="text-chart-4" size={20} />;
      default:
        return <DollarSign className="text-muted-foreground" size={20} />;
    }
  };

  const renderInvestOptions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assets.map((asset) => (
        <Card
          key={asset.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
            selectedTarget === asset.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedTarget(asset.id)}
          data-testid={`asset-option-${asset.id}`}
        >
          <div className="flex items-center space-x-3 mb-2">
            {getAssetIcon(asset.type)}
            <div className="font-medium">{asset.name}</div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">{asset.description}</div>
          <div className="text-xs space-y-1">
            <div>Current Price: ${asset.currentPrice.toLocaleString()}</div>
            <div>Risk Level: {asset.riskLevel}</div>
            <div>Min Investment: ${asset.minimumInvestment.toLocaleString()}</div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderNegotiateOptions = () => (
    <div className="space-y-3">
      {rivals.map((rival, index) => (
        <Card
          key={rival.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
            selectedTarget === index.toString() ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => setSelectedTarget(index.toString())}
          data-testid={`rival-option-${rival.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-chart-2 rounded-full flex items-center justify-center font-bold">
                {rival.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{rival.name}</div>
                <div className="text-sm text-muted-foreground">
                  Rep: {rival.stats.reputation}, Net Worth: ${(rival.stats.netWorth / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>
            <Users className="text-chart-2" size={20} />
          </div>
        </Card>
      ))}
    </div>
  );

  const renderAdvancedOptions = () => {
    const options = [
      {
        type: "influence",
        title: "Influence Campaign",
        description: "Spend money to gain reputation (increases suspicion)",
        icon: <Users className="text-chart-3" size={20} />,
        suggested: Math.min(playerCash * 0.05, 50000),
      },
      {
        type: "legalShield",
        title: "Legal Protection",
        description: "Reduce suspicion level with legal fees",
        icon: <Shield className="text-chart-4" size={20} />,
        suggested: Math.min(playerCash * 0.03, 25000),
      },
      {
        type: "philanthropy",
        title: "Philanthropic Project",
        description: "Donate to charity for reputation boost",
        icon: <Heart className="text-accent" size={20} />,
        suggested: Math.min(playerCash * 0.02, 20000),
      },
    ];

    return (
      <div className="space-y-3">
        {options.map((option) => (
          <Card
            key={option.type}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              actionType === option.type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              // Update the action type for advanced options
              setSelectedTarget("");
              setAmount(option.suggested.toString());
            }}
            data-testid={`advanced-option-${option.type}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {option.icon}
              <div className="font-medium">{option.title}</div>
            </div>
            <div className="text-sm text-muted-foreground mb-2">{option.description}</div>
            <div className="text-xs">Suggested: ${option.suggested.toLocaleString()}</div>
          </Card>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (actionType) {
      case "invest":
        return renderInvestOptions();
      case "negotiate":
        return renderNegotiateOptions();
      case "advanced":
        return renderAdvancedOptions();
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select an option to continue
          </div>
        );
    }
  };

  const needsAmount = ["invest", "influence", "legalShield", "philanthropy"].includes(actionType);
  const needsTarget = ["invest", "negotiate", "expose"].includes(actionType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="modal-action">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderContent()}
          
          {needsAmount && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount ($)
              </label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                max={playerCash}
                data-testid="input-amount"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Available: ${playerCash.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={
              (needsTarget && !selectedTarget) || 
              (needsAmount && (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > playerCash))
            }
            data-testid="button-confirm"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
