import { AIRival, GameStateData, Action } from "@shared/schema";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export class AIService {
  generateRivals(): AIRival[] {
    return [
      {
        id: "victoria",
        name: "Victoria Sterling",
        personality: {
          risk: 0.2,
          reputation: 0.9,
          ethics: 0.8,
          aggression: 0.3,
          shortTermFocus: 0.2,
        },
        stats: {
          cash: 120000,
          netWorth: 180000,
          reputation: 85,
          suspicion: 5,
        },
        holdings: [],
        lastAction: undefined,
      },
      {
        id: "marcus",
        name: "Marcus Kane",
        personality: {
          risk: 0.9,
          reputation: 0.3,
          ethics: 0.2,
          aggression: 0.8,
          shortTermFocus: 0.9,
        },
        stats: {
          cash: 95000,
          netWorth: 315000,
          reputation: 45,
          suspicion: 25,
        },
        holdings: [],
        lastAction: undefined,
      },
      {
        id: "sofia",
        name: "Sofia Chen",
        personality: {
          risk: 0.7,
          reputation: 0.6,
          ethics: 0.7,
          aggression: 0.5,
          shortTermFocus: 0.3,
        },
        stats: {
          cash: 110000,
          netWorth: 193000,
          reputation: 72,
          suspicion: 12,
        },
        holdings: [],
        lastAction: undefined,
      },
      {
        id: "david",
        name: "David Pierce",
        personality: {
          risk: 0.4,
          reputation: 0.8,
          ethics: 0.9,
          aggression: 0.2,
          shortTermFocus: 0.1,
        },
        stats: {
          cash: 105000,
          netWorth: 168000,
          reputation: 91,
          suspicion: 3,
        },
        holdings: [],
        lastAction: undefined,
      },
    ];
  }

  async generateAIActions(gameState: GameStateData): Promise<Action[]> {
    const actions: Action[] = [];
    
    for (const rival of gameState.rivals) {
      try {
        const action = await this.generateRivalAction(rival, gameState);
        actions.push(action);
      } catch (error) {
        console.error(`Error generating action for ${rival.name}:`, error);
        // Fallback to simple action
        actions.push(this.generateFallbackAction(rival));
      }
    }
    
    return actions;
  }

  private async generateRivalAction(rival: AIRival, gameState: GameStateData): Promise<Action> {
    const prompt = `You are ${rival.name}, an AI rival in a strategic economic simulation game.

Your personality traits (0-1 scale):
- Risk tolerance: ${rival.personality.risk}
- Reputation focus: ${rival.personality.reputation}
- Ethics: ${rival.personality.ethics}
- Aggression: ${rival.personality.aggression}
- Short-term focus: ${rival.personality.shortTermFocus}

Your current stats:
- Cash: $${rival.stats.cash.toLocaleString()}
- Net Worth: $${rival.stats.netWorth.toLocaleString()}
- Reputation: ${rival.stats.reputation}
- Suspicion: ${rival.stats.suspicion}

Current turn: ${gameState.turn}
Market volatility: ${gameState.gameSettings.marketVolatility}

Available actions:
1. invest - Choose an asset and amount to invest
2. negotiate - Try to make a deal with another player
3. influence - Spend money to gain reputation and suspicion
4. legalShield - Spend money to reduce suspicion
5. philanthropy - Spend money to gain reputation
6. expose - Try to damage another rival's reputation

Based on your personality and current situation, choose ONE action. Consider:
- Your risk tolerance when investing
- Your ethics when choosing aggressive actions
- Your reputation focus when making decisions
- Market conditions and opportunities

Respond with a JSON object containing:
{
  "type": "action_type",
  "target": "target_id_if_applicable",
  "amount": number_if_applicable,
  "reasoning": "brief explanation of your choice"
}`;

    try {
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
              content: "You are an AI player in an economic simulation game. Always respond with valid JSON.",
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
      const aiResponse = JSON.parse(data.choices[0].message.content || "{}");
      
      return {
        type: aiResponse.type || "invest",
        target: aiResponse.target,
        amount: aiResponse.amount,
        parameters: { reasoning: aiResponse.reasoning },
      };
    } catch (error) {
      console.error("Mistral API error:", error);
      return this.generateFallbackAction(rival);
    }
  }

  private generateFallbackAction(rival: AIRival): Action {
    const actionTypes = ["invest", "negotiate", "influence", "legalShield", "philanthropy"];
    const weights = [
      rival.personality.risk * 2,
      rival.personality.aggression,
      rival.personality.reputation,
      rival.stats.suspicion > 20 ? 2 : 0.5,
      rival.personality.ethics,
    ];
    
    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    const actionType = actionTypes[selectedIndex];
    let amount = 0;
    let target;
    
    switch (actionType) {
      case "invest":
        amount = Math.min(rival.stats.cash * 0.1, rival.stats.cash * rival.personality.risk);
        target = "TECH001"; // Default to tech stock
        break;
      case "influence":
        amount = Math.min(rival.stats.cash * 0.05, 50000);
        break;
      case "legalShield":
        amount = Math.min(rival.stats.cash * 0.03, 25000);
        break;
      case "philanthropy":
        amount = Math.min(rival.stats.cash * 0.02, 20000);
        break;
      case "negotiate":
        target = "0"; // Target first rival (simplified)
        break;
    }
    
    return {
      type: actionType as any,
      target,
      amount,
    };
  }
}
