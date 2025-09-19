import { Button } from "@/components/ui/button";
import { Crown, Save, Settings } from "lucide-react";

interface GameHeaderProps {
  turn: number;
  onSave: () => void;
  onSettings: () => void;
}

export function GameHeader({ turn, onSave, onSettings }: GameHeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-primary">
            <Crown className="inline mr-2" size={24} />
            Shadow & Ledger
          </div>
          <div className="text-sm text-muted-foreground">
            Strategic Economic Simulation
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Turn Counter */}
          <div className="bg-secondary px-4 py-2 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground">Turn</span>
            <span className="ml-2 font-mono font-bold text-primary" data-testid="turn-counter">{turn}</span>
          </div>
          {/* Game Controls */}
          <Button 
            size="sm" 
            onClick={onSave}
            data-testid="button-save"
            className="hover:shadow-lg transition-all"
          >
            <Save size={16} />
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onSettings}
            data-testid="button-settings"
            className="hover:shadow-lg transition-all"
          >
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
}
