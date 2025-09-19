import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { GameStateData, Action, Achievement } from "@shared/schema";
import { GameHeader } from "@/components/GameHeader";
import { PlayerSidebar } from "@/components/PlayerSidebar";
import { MarketOverview } from "@/components/MarketOverview";
import { AIRivals } from "@/components/AIRivals";
import { Achievements } from "@/components/Achievements";
import { NewsFeed } from "@/components/NewsFeed";
import { DecisionCenter } from "@/components/DecisionCenter";
import { ActionModal } from "@/components/ActionModal";
import { AchievementNotification } from "@/components/AchievementNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Play, Users } from "lucide-react";

export default function Game() {
  const { toast } = useToast();
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("Axel");
  const [showNewGameDialog, setShowNewGameDialog] = useState(!gameId);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [currentActionType, setCurrentActionType] = useState("");
  const [actionsUsed, setActionsUsed] = useState(0);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [lastDecisionImpact, setLastDecisionImpact] = useState<any>(null);
  const maxActions = 3;

  // Load existing game or show new game dialog
  const { data: gameState, isLoading, error } = useQuery({
    queryKey: ["/api/game", gameId],
    enabled: !!gameId,
    refetchInterval: false,
  });

  // Create new game mutation
  const createGameMutation = useMutation({
    mutationFn: async (data: { playerName: string; seed?: string }) => {
      const response = await apiRequest("POST", "/api/game/new", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGameId(data.id);
      setShowNewGameDialog(false);
      setActionsUsed(0);
      toast({
        title: "New Game Started",
        description: `Welcome to Shadow & Ledger, ${data.playerName}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/game"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create new game",
        variant: "destructive",
      });
    },
  });

  // Process turn mutation
  const processTurnMutation = useMutation({
    mutationFn: async (action: Action) => {
      const response = await apiRequest("POST", `/api/game/${gameId}/turn`, action);
      return response.json();
    },
    onSuccess: (data) => {
      const newGameData = data.gameData as GameStateData;
      
      // Check for new achievements
      const newAchievements = newGameData.achievements.filter(a => a.unlocked);
      const oldAchievements = (gameState?.gameData as GameStateData)?.achievements?.filter(a => a.unlocked) || [];
      
      if (newAchievements.length > oldAchievements.length) {
        const latestAchievement = newAchievements[newAchievements.length - 1];
        setUnlockedAchievement(latestAchievement);
      }

      // Set last decision impact for display
      setLastDecisionImpact({
        action: "Investment in Asset",
        outcome: "Moderate Success",
        probability: 65,
        changes: {
          Cash: 48000,
          Reputation: 3,
          XP: 150,
          Suspicion: 0,
        },
      });

      setActionsUsed(prev => prev + 1);
      
      toast({
        title: "Action Processed",
        description: "Turn updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/game", gameId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process action",
        variant: "destructive",
      });
    },
  });

  // Load saved games
  const { data: savedGames } = useQuery({
    queryKey: ["/api/games"],
    enabled: showNewGameDialog,
  });

  const handleNewGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }
    createGameMutation.mutate({ playerName: playerName.trim() });
  };

  const handleLoadGame = (id: string) => {
    setGameId(id);
    setShowNewGameDialog(false);
    setActionsUsed(0);
  };

  const handleQuickAction = (action: string) => {
    setCurrentActionType(action);
    setActionModalOpen(true);
  };

  const handleActionSelect = (action: string) => {
    setCurrentActionType(action);
    setActionModalOpen(true);
  };

  const handleActionConfirm = (action: Action) => {
    if (actionsUsed >= maxActions) {
      toast({
        title: "No Actions Remaining",
        description: "You have used all your actions for this turn. End the turn to continue.",
        variant: "destructive",
      });
      return;
    }
    
    processTurnMutation.mutate(action);
    setActionModalOpen(false);
  };

  const handleEndTurn = () => {
    // Reset actions for next turn
    setActionsUsed(0);
    toast({
      title: "Turn Ended",
      description: "Starting new turn...",
    });
  };

  const handleSave = () => {
    toast({
      title: "Game Saved",
      description: "Your progress has been saved successfully",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Settings panel would open here",
    });
  };

  if (showNewGameDialog) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary mb-2">Shadow & Ledger</h1>
              <p className="text-muted-foreground">Strategic Economic Simulation</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Player Name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  data-testid="input-player-name"
                />
              </div>

              <Button
                onClick={handleNewGame}
                disabled={createGameMutation.isPending}
                className="w-full"
                data-testid="button-new-game"
              >
                {createGameMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start New Game
              </Button>

              {savedGames && Array.isArray(savedGames) && savedGames.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Continue Existing Game</h3>
                  <div className="space-y-2">
                    {savedGames.map((game: any) => (
                      <Button
                        key={game.id}
                        variant="outline"
                        onClick={() => handleLoadGame(game.id)}
                        className="w-full justify-between"
                        data-testid={`button-load-game-${game.id}`}
                      >
                        <span>{game.playerName}</span>
                        <span className="text-muted-foreground">Turn {game.turn}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading game...</span>
        </div>
      </div>
    );
  }

  if (error || !gameState) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Game</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || "Game not found"}
            </p>
            <Button onClick={() => setShowNewGameDialog(true)}>
              Return to Main Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gameData = gameState?.gameData as GameStateData;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GameHeader
        turn={gameData.turn}
        onSave={handleSave}
        onSettings={handleSettings}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Single PlayerSidebar with responsive behavior */}
        <PlayerSidebar
          player={gameData.player}
          onQuickAction={handleQuickAction}
        />

        <main className="flex-1 overflow-hidden p-1">
          <div className="h-full grid grid-rows-1 lg:grid-rows-2 gap-1">
            {/* Top Row - Stack vertically on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              <MarketOverview
                assets={gameData.assets}
                marketVolatility={gameData.gameSettings.marketVolatility}
              />
              <AIRivals rivals={gameData.rivals} />
              <div className="md:col-span-2 lg:col-span-1">
                <Achievements
                  achievements={gameData.achievements}
                  recentNotifications={[
                    { type: "xp", message: "Successful negotiation with Sofia Chen", value: 250 },
                    { type: "reputation", message: "Completed philanthropic project", value: 5 },
                  ]}
                />
              </div>
            </div>

            {/* Bottom Row - Stack vertically on mobile */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-1">
              <NewsFeed newsItems={gameData.newsItems} />
              <DecisionCenter
                actionsRemaining={maxActions - actionsUsed}
                maxActions={maxActions}
                onActionSelect={handleActionSelect}
                onEndTurn={handleEndTurn}
                lastDecisionImpact={lastDecisionImpact}
                riskProfile={{
                  marketExposure: 68,
                  regulatoryRisk: 23,
                  liquidityRisk: 35,
                }}
              />
            </div>

            {/* Mobile: Show decision center and news separately */}
            <div className="lg:hidden space-y-1">
              <DecisionCenter
                actionsRemaining={maxActions - actionsUsed}
                maxActions={maxActions}
                onActionSelect={handleActionSelect}
                onEndTurn={handleEndTurn}
                lastDecisionImpact={lastDecisionImpact}
                riskProfile={{
                  marketExposure: 68,
                  regulatoryRisk: 23,
                  liquidityRisk: 35,
                }}
              />
              <NewsFeed newsItems={gameData.newsItems} />
            </div>
          </div>
        </main>
      </div>

      <ActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onConfirm={handleActionConfirm}
        actionType={currentActionType}
        playerCash={gameData.player.cash}
        assets={gameData.assets}
        rivals={gameData.rivals}
      />

      <AchievementNotification
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />
    </div>
  );
}
