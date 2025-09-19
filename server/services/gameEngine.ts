import { GameStateData, Player, AIRival, Asset, Action, Achievement, NewsItem } from "@shared/schema";
import { MarketService } from "./marketService";
import { AIService } from "./aiService";
import { EventService } from "./eventService";

export class GameEngine {
  private marketService: MarketService;
  private aiService: AIService;
  private eventService: EventService;

  constructor() {
    this.marketService = new MarketService();
    this.aiService = new AIService();
    this.eventService = new EventService();
  }

  createNewGame(playerName: string, seed?: string): GameStateData {
    const gameSeed = seed || this.generateSeed();
    
    // Initialize player
    const player: Player = {
      name: playerName,
      level: 1,
      xp: 0,
      cash: 100000, // Start with $100k
      netWorth: 100000,
      reputation: 50,
      suspicion: 0,
      leverage: 1.0,
      skills: {
        algorithmics: 1,
        negotiation: 1,
        law: 1,
        operations: 1,
      },
      network: [],
      holdings: [],
    };

    // Initialize AI rivals
    const rivals = this.aiService.generateRivals();
    
    // Initialize market assets
    const assets = this.marketService.initializeAssets(gameSeed);
    
    // Initialize achievements
    const achievements = this.initializeAchievements();

    return {
      turn: 0,
      seed: gameSeed,
      player,
      rivals,
      assets,
      marketEvents: [],
      newsItems: [],
      achievements,
      gameSettings: {
        difficulty: "normal",
        marketVolatility: 1.0,
        enableNarrative: true,
      },
    };
  }

  async processTurn(gameState: GameStateData, playerAction: Action): Promise<GameStateData> {
    const newGameState = { ...gameState };
    newGameState.turn += 1;

    // Process player action
    await this.processPlayerAction(newGameState, playerAction);

    // Generate AI actions
    const aiActions = await this.aiService.generateAIActions(newGameState);
    
    // Process AI actions
    for (const [rivalIndex, action] of aiActions.entries()) {
      await this.processAIAction(newGameState, rivalIndex, action);
    }

    // Update market
    this.marketService.updateMarket(newGameState);

    // Generate random events
    const randomEvents = this.eventService.generateRandomEvents(newGameState);
    newGameState.marketEvents.push(...randomEvents);

    // Generate news
    const news = await this.eventService.generateNews(newGameState, playerAction, aiActions);
    newGameState.newsItems.unshift(...news);
    
    // Keep only last 20 news items
    newGameState.newsItems = newGameState.newsItems.slice(0, 20);

    // Check achievements
    this.checkAchievements(newGameState);

    // Update player level and net worth
    this.updatePlayerStats(newGameState);

    return newGameState;
  }

  private async processPlayerAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player } = gameState;

    switch (action.type) {
      case "invest":
        await this.processInvestAction(gameState, action);
        break;
      case "negotiate":
        await this.processNegotiateAction(gameState, action);
        break;
      case "influence":
        await this.processInfluenceAction(gameState, action);
        break;
      case "legalShield":
        await this.processLegalShieldAction(gameState, action);
        break;
      case "philanthropy":
        await this.processPhilanthropyAction(gameState, action);
        break;
      case "expose":
        await this.processExposeAction(gameState, action);
        break;
    }
  }

  private async processInvestAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player, assets } = gameState;
    const asset = assets.find(a => a.id === action.target);
    const amount = action.amount || 0;

    if (!asset || amount <= 0 || amount > player.cash) {
      return;
    }

    // Calculate outcome probability based on skills and market conditions
    const successProbability = this.calculateInvestmentSuccess(player, asset);
    const outcome = this.generateRandomOutcome(successProbability);

    let multiplier = 1.0;
    let reputationChange = 0;
    let suspicionChange = 0;
    let xpGain = 0;

    switch (outcome) {
      case "great_success":
        multiplier = 1.5 + Math.random() * 0.5; // 150-200%
        reputationChange = 3;
        xpGain = 200;
        break;
      case "success":
        multiplier = 1.1 + Math.random() * 0.3; // 110-140%
        reputationChange = 1;
        xpGain = 150;
        break;
      case "neutral":
        multiplier = 0.95 + Math.random() * 0.1; // 95-105%
        xpGain = 50;
        break;
      case "failure":
        multiplier = 0.7 + Math.random() * 0.2; // 70-90%
        reputationChange = -1;
        xpGain = 25;
        break;
      case "catastrophic":
        multiplier = 0.3 + Math.random() * 0.3; // 30-60%
        reputationChange = -3;
        suspicionChange = 2;
        xpGain = 10;
        break;
    }

    // Apply investment
    const shares = amount / asset.currentPrice;
    player.holdings.push({
      assetId: asset.id,
      assetType: asset.type,
      quantity: shares,
      purchasePrice: asset.currentPrice,
      currentValue: asset.currentPrice * shares * multiplier,
    });

    player.cash -= amount;
    player.reputation = Math.max(0, Math.min(100, player.reputation + reputationChange));
    player.suspicion = Math.max(0, Math.min(100, player.suspicion + suspicionChange));
    player.xp += xpGain;
  }

  private async processNegotiateAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player, rivals } = gameState;
    const rivalIndex = parseInt(action.target || "0");
    const rival = rivals[rivalIndex];

    if (!rival) return;

    const successProbability = this.calculateNegotiationSuccess(player, rival);
    const outcome = this.generateRandomOutcome(successProbability);

    let cashGain = 0;
    let reputationChange = 0;
    let suspicionChange = 0;
    let xpGain = 0;

    switch (outcome) {
      case "great_success":
        cashGain = player.cash * 0.1; // 10% of current cash
        reputationChange = 5;
        xpGain = 300;
        break;
      case "success":
        cashGain = player.cash * 0.05; // 5% of current cash
        reputationChange = 2;
        xpGain = 200;
        break;
      case "neutral":
        reputationChange = 1;
        xpGain = 100;
        break;
      case "failure":
        reputationChange = -2;
        suspicionChange = 1;
        xpGain = 50;
        break;
      case "catastrophic":
        reputationChange = -5;
        suspicionChange = 3;
        xpGain = 25;
        break;
    }

    player.cash += cashGain;
    player.reputation = Math.max(0, Math.min(100, player.reputation + reputationChange));
    player.suspicion = Math.max(0, Math.min(100, player.suspicion + suspicionChange));
    player.xp += xpGain;
  }

  private async processInfluenceAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player } = gameState;
    const amount = action.amount || 0;

    if (amount <= 0 || amount > player.cash) return;

    const successProbability = 0.6 + (player.skills.negotiation * 0.05);
    const outcome = this.generateRandomOutcome(successProbability);

    let reputationChange = 0;
    let suspicionChange = 0;
    let xpGain = 0;

    switch (outcome) {
      case "great_success":
        reputationChange = 8;
        suspicionChange = 1;
        xpGain = 250;
        break;
      case "success":
        reputationChange = 4;
        suspicionChange = 2;
        xpGain = 150;
        break;
      case "neutral":
        reputationChange = 2;
        suspicionChange = 3;
        xpGain = 75;
        break;
      case "failure":
        reputationChange = -1;
        suspicionChange = 5;
        xpGain = 25;
        break;
      case "catastrophic":
        reputationChange = -5;
        suspicionChange = 10;
        xpGain = 10;
        break;
    }

    player.cash -= amount;
    player.reputation = Math.max(0, Math.min(100, player.reputation + reputationChange));
    player.suspicion = Math.max(0, Math.min(100, player.suspicion + suspicionChange));
    player.xp += xpGain;
  }

  private async processLegalShieldAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player } = gameState;
    const amount = action.amount || 0;

    if (amount <= 0 || amount > player.cash) return;

    const suspicionReduction = Math.min(player.suspicion, amount / 10000); // $10k reduces 1 suspicion
    
    player.cash -= amount;
    player.suspicion = Math.max(0, player.suspicion - suspicionReduction);
    player.xp += 50;
  }

  private async processPhilanthropyAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player } = gameState;
    const amount = action.amount || 0;

    if (amount <= 0 || amount > player.cash) return;

    const reputationGain = Math.min(10, amount / 50000); // $50k for 1 reputation point
    
    player.cash -= amount;
    player.reputation = Math.min(100, player.reputation + reputationGain);
    player.xp += 100;
  }

  private async processExposeAction(gameState: GameStateData, action: Action): Promise<void> {
    const { player, rivals } = gameState;
    const rivalIndex = parseInt(action.target || "0");
    const rival = rivals[rivalIndex];

    if (!rival) return;

    const successProbability = 0.4 + (player.skills.law * 0.06);
    const outcome = this.generateRandomOutcome(successProbability);

    let reputationChange = 0;
    let suspicionChange = 0;
    let xpGain = 0;

    switch (outcome) {
      case "great_success":
        rival.stats.reputation -= 15;
        reputationChange = 5;
        suspicionChange = 2;
        xpGain = 300;
        break;
      case "success":
        rival.stats.reputation -= 8;
        reputationChange = 2;
        suspicionChange = 3;
        xpGain = 200;
        break;
      case "neutral":
        rival.stats.reputation -= 3;
        suspicionChange = 2;
        xpGain = 100;
        break;
      case "failure":
        reputationChange = -3;
        suspicionChange = 5;
        xpGain = 50;
        break;
      case "catastrophic":
        reputationChange = -8;
        suspicionChange = 10;
        xpGain = 25;
        break;
    }

    player.reputation = Math.max(0, Math.min(100, player.reputation + reputationChange));
    player.suspicion = Math.max(0, Math.min(100, player.suspicion + suspicionChange));
    player.xp += xpGain;
    rival.stats.reputation = Math.max(0, rival.stats.reputation);
  }

  private async processAIAction(gameState: GameStateData, rivalIndex: number, action: Action): Promise<void> {
    // Simplified AI action processing
    const rival = gameState.rivals[rivalIndex];
    rival.lastAction = action.type;
    
    // AI actions affect their stats based on their personality
    const riskFactor = rival.personality.risk;
    const successRate = 0.5 + (riskFactor * 0.3);
    
    if (Math.random() < successRate) {
      rival.stats.cash *= 1.02 + (Math.random() * 0.08); // 2-10% gain
      rival.stats.netWorth = rival.stats.cash * 1.5; // Simplified net worth calculation
    } else {
      rival.stats.cash *= 0.95 + (Math.random() * 0.05); // 0-5% loss
      rival.stats.netWorth = rival.stats.cash * 1.3;
    }
  }

  private calculateInvestmentSuccess(player: Player, asset: Asset): number {
    let baseProbability = 0.6;
    
    // Skill bonus
    baseProbability += player.skills.algorithmics * 0.02;
    
    // Risk adjustment
    switch (asset.riskLevel) {
      case "low":
        baseProbability += 0.2;
        break;
      case "medium":
        baseProbability += 0.1;
        break;
      case "high":
        baseProbability -= 0.1;
        break;
      case "extreme":
        baseProbability -= 0.2;
        break;
    }
    
    return Math.max(0.1, Math.min(0.9, baseProbability));
  }

  private calculateNegotiationSuccess(player: Player, rival: AIRival): number {
    let baseProbability = 0.5;
    
    // Player skill bonus
    baseProbability += player.skills.negotiation * 0.03;
    
    // Reputation bonus/penalty
    baseProbability += (player.reputation - 50) * 0.002;
    
    // Rival personality factors
    baseProbability -= rival.personality.aggression * 0.1;
    baseProbability += rival.personality.ethics * 0.05;
    
    return Math.max(0.1, Math.min(0.9, baseProbability));
  }

  private generateRandomOutcome(successProbability: number): string {
    const roll = Math.random();
    
    if (roll < successProbability * 0.1) return "great_success";
    if (roll < successProbability * 0.6) return "success";
    if (roll < successProbability + (1 - successProbability) * 0.3) return "neutral";
    if (roll < successProbability + (1 - successProbability) * 0.8) return "failure";
    return "catastrophic";
  }

  private checkAchievements(gameState: GameStateData): void {
    const { player, achievements } = gameState;
    
    for (const achievement of achievements) {
      if (achievement.unlocked) continue;
      
      let conditionMet = false;
      
      switch (achievement.condition.type) {
        case "netWorth":
          conditionMet = this.checkCondition(player.netWorth, achievement.condition);
          break;
        case "reputation":
          conditionMet = this.checkCondition(player.reputation, achievement.condition);
          break;
        case "suspicion":
          conditionMet = this.checkCondition(player.suspicion, achievement.condition);
          break;
        case "turns":
          conditionMet = this.checkCondition(gameState.turn, achievement.condition);
          break;
      }
      
      if (conditionMet) {
        achievement.unlocked = true;
        player.xp += achievement.reward.xp;
      }
    }
  }

  private checkCondition(value: number, condition: any): boolean {
    switch (condition.comparison) {
      case "greater":
        return value > condition.value;
      case "less":
        return value < condition.value;
      case "equal":
        return value === condition.value;
      default:
        return false;
    }
  }

  private updatePlayerStats(gameState: GameStateData): void {
    const { player } = gameState;
    
    // Calculate net worth from holdings
    let holdingsValue = 0;
    for (const holding of player.holdings) {
      const asset = gameState.assets.find(a => a.id === holding.assetId);
      if (asset) {
        holding.currentValue = holding.quantity * asset.currentPrice;
        holdingsValue += holding.currentValue;
      }
    }
    
    player.netWorth = player.cash + holdingsValue;
    
    // Level up calculation
    const requiredXP = player.level * 1000;
    if (player.xp >= requiredXP) {
      player.level += 1;
      player.xp -= requiredXP;
      
      // Skill point allocation (simplified)
      const skillToUpgrade = Math.floor(Math.random() * 4);
      const skills = ["algorithmics", "negotiation", "law", "operations"] as const;
      player.skills[skills[skillToUpgrade]] += 1;
    }
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: "first_million",
        name: "First Million",
        description: "Reach $1M net worth",
        type: "wealth",
        condition: { type: "netWorth", value: 1000000, comparison: "greater" },
        reward: { xp: 500, unlocks: [] },
        unlocked: false,
      },
      {
        id: "market_survivor",
        name: "Market Survivor",
        description: "Avoid regulator for 20 turns",
        type: "survival",
        condition: { type: "turns", value: 20, comparison: "greater" },
        reward: { xp: 1000, unlocks: ["elite_difficulty"] },
        unlocked: false,
      },
      {
        id: "ghost",
        name: "Ghost",
        description: "Keep suspicion below 10 all game",
        type: "strategic",
        condition: { type: "suspicion", value: 10, comparison: "less" },
        reward: { xp: 1500, unlocks: ["stealth_mode"] },
        unlocked: false,
      },
      {
        id: "respected",
        name: "Respected",
        description: "Reach 90+ reputation",
        type: "reputation",
        condition: { type: "reputation", value: 90, comparison: "greater" },
        reward: { xp: 800, unlocks: ["reputation_boost"] },
        unlocked: false,
      },
    ];
  }

  private generateSeed(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
