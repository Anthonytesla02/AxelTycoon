import { MarketEvent, NewsItem, GameStateData, Action } from "@shared/schema";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export class EventService {
  generateRandomEvents(gameState: GameStateData): MarketEvent[] {
    const events: MarketEvent[] = [];
    
    // 15% chance of a random event each turn
    if (Math.random() < 0.15) {
      const event = this.createRandomEvent();
      events.push(event);
    }
    
    // Special events based on game state
    if (gameState.turn % 10 === 0) {
      events.push(this.createRegularEvent());
    }
    
    return events;
  }

  async generateNews(gameState: GameStateData, playerAction: Action, aiActions: Action[]): Promise<NewsItem[]> {
    const news: NewsItem[] = [];
    
    try {
      // Generate news about player action
      if (playerAction.type === "invest" || playerAction.type === "expose") {
        const playerNews = await this.generatePlayerNews(gameState, playerAction);
        if (playerNews) news.push(playerNews);
      }
      
      // Generate market news
      const marketNews = await this.generateMarketNews(gameState);
      if (marketNews) news.push(marketNews);
      
      // Generate AI rival news
      for (let i = 0; i < aiActions.length; i++) {
        if (Math.random() < 0.3) { // 30% chance to generate news for AI action
          const rivalNews = await this.generateRivalNews(gameState.rivals[i], aiActions[i]);
          if (rivalNews) news.push(rivalNews);
        }
      }
    } catch (error) {
      console.error("Error generating news:", error);
      // Fallback to predefined news
      news.push(this.generateFallbackNews());
    }
    
    return news;
  }

  private createRandomEvent(): MarketEvent {
    const eventTypes = ["crash", "boom", "scandal", "regulatory", "innovation", "merger"];
    const assetTypes = ["stocks", "crypto", "realEstate", "startups", "commodities", "bonds"];
    
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
    const affectedAssets = assetTypes.filter(() => Math.random() < 0.4);
    
    let priceMultiplier = 1.0;
    let title = "";
    let description = "";
    
    switch (type) {
      case "crash":
        priceMultiplier = 0.7 + Math.random() * 0.2; // 70-90%
        title = "Market Crash Shakes Investor Confidence";
        description = "Major market indices plummet amid economic uncertainty";
        break;
      case "boom":
        priceMultiplier = 1.2 + Math.random() * 0.3; // 120-150%
        title = "Economic Boom Drives Markets Higher";
        description = "Strong economic data fuels massive rally across markets";
        break;
      case "scandal":
        priceMultiplier = 0.8 + Math.random() * 0.15; // 80-95%
        title = "Corporate Scandal Rocks Industry";
        description = "Major company faces investigation over questionable practices";
        break;
      case "regulatory":
        priceMultiplier = 0.85 + Math.random() * 0.2; // 85-105%
        title = "New Regulations Announced";
        description = "Government introduces new financial oversight measures";
        break;
      case "innovation":
        priceMultiplier = 1.1 + Math.random() * 0.25; // 110-135%
        title = "Breakthrough Technology Disrupts Market";
        description = "Revolutionary innovation promises to transform industry";
        break;
      case "merger":
        priceMultiplier = 1.05 + Math.random() * 0.2; // 105-125%
        title = "Major Merger Announced";
        description = "Industry giants announce massive consolidation deal";
        break;
    }
    
    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      impact: {
        assetTypes: affectedAssets,
        priceMultiplier,
        duration: Math.floor(Math.random() * 3) + 1,
      },
      probability: Math.random(),
    };
  }

  private createRegularEvent(): MarketEvent {
    return {
      id: `regular_${Date.now()}`,
      type: "regulatory",
      title: "Quarterly Market Review",
      description: "Regulators conduct routine market oversight",
      impact: {
        assetTypes: ["stocks"],
        priceMultiplier: 0.98 + Math.random() * 0.04, // 98-102%
        duration: 1,
      },
      probability: 1.0,
    };
  }

  private async generatePlayerNews(gameState: GameStateData, action: Action): Promise<NewsItem | null> {
    try {
      const prompt = `Generate a financial news headline and brief article about player "Axel" performing action "${action.type}" in a strategic economic simulation game.

Context:
- Current turn: ${gameState.turn}
- Player reputation: ${gameState.player.reputation}
- Player suspicion level: ${gameState.player.suspicion}
- Action details: ${JSON.stringify(action)}

Write a realistic-sounding financial news story. Make it sound like real financial journalism but keep it brief (2-3 sentences).

Respond with JSON:
{
  "title": "News headline",
  "content": "Brief news content",
  "category": "market|regulatory|technology|scandal|general"
}`;

      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "You are a financial news writer. Write realistic but fictional news stories.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const newsData = JSON.parse(data.choices[0].message.content || "{}");
      
      return {
        id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newsData.title,
        content: newsData.content,
        category: newsData.category,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error generating player news:", error);
      return null;
    }
  }

  private async generateMarketNews(gameState: GameStateData): Promise<NewsItem | null> {
    try {
      const assets = gameState.assets;
      const recentAsset = assets[Math.floor(Math.random() * assets.length)];
      const priceChange = recentAsset.priceHistory.length > 1 
        ? ((recentAsset.currentPrice - recentAsset.priceHistory[recentAsset.priceHistory.length - 2]) / recentAsset.priceHistory[recentAsset.priceHistory.length - 2]) * 100
        : 0;

      const prompt = `Generate a financial market news story about ${recentAsset.name} (${recentAsset.type}) which had a ${priceChange.toFixed(1)}% price change.

Current price: $${recentAsset.currentPrice.toFixed(2)}
Asset type: ${recentAsset.type}
Risk level: ${recentAsset.riskLevel}

Write a brief, realistic financial news story explaining the price movement.

Respond with JSON:
{
  "title": "News headline",
  "content": "Brief news content (2-3 sentences)",
  "category": "market"
}`;

      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "You are a financial market reporter writing about asset price movements.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const newsData = JSON.parse(data.choices[0].message.content || "{}");
      
      return {
        id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newsData.title,
        content: newsData.content,
        category: "market",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error generating market news:", error);
      return null;
    }
  }

  private async generateRivalNews(rival: any, action: Action): Promise<NewsItem | null> {
    try {
      const prompt = `Generate a brief financial news story about AI rival "${rival.name}" performing action "${action.type}".

Rival context:
- Current reputation: ${rival.stats.reputation}
- Current suspicion: ${rival.stats.suspicion}
- Net worth: $${rival.stats.netWorth.toLocaleString()}

Write a short, realistic news story about this rival's business activities.

Respond with JSON:
{
  "title": "News headline",
  "content": "Brief news content (1-2 sentences)",
  "category": "market|regulatory|general"
}`;

      const response = await fetch(MISTRAL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "You are a business journalist covering financial market participants.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`);
      }

      const data = await response.json();
      const newsData = JSON.parse(data.choices[0].message.content || "{}");
      
      return {
        id: `rival_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newsData.title,
        content: newsData.content,
        category: newsData.category,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error generating rival news:", error);
      return null;
    }
  }

  private generateFallbackNews(): NewsItem {
    const fallbackNews = [
      {
        title: "Market Volatility Continues",
        content: "Financial markets experience continued uncertainty as investors weigh economic indicators.",
        category: "market" as const,
      },
      {
        title: "Tech Sector Shows Mixed Results",
        content: "Technology companies report varied performance amid changing market conditions.",
        category: "market" as const,
      },
      {
        title: "Regulatory Review Underway",
        content: "Financial authorities announce routine review of market practices and compliance.",
        category: "regulatory" as const,
      },
    ];

    const selectedNews = fallbackNews[Math.floor(Math.random() * fallbackNews.length)];
    
    return {
      id: `fallback_${Date.now()}`,
      title: selectedNews.title,
      content: selectedNews.content,
      category: selectedNews.category,
      timestamp: Date.now(),
    };
  }
}
