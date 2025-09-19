import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Game State Schema
export const gameStates = pgTable("game_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerName: text("player_name").notNull(),
  turn: integer("turn").notNull().default(0),
  seed: text("seed").notNull(),
  gameData: jsonb("game_data").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;

// Player Schema
export const PlayerSchema = z.object({
  name: z.string(),
  level: z.number(),
  xp: z.number(),
  cash: z.number(),
  netWorth: z.number(),
  reputation: z.number(),
  suspicion: z.number(),
  leverage: z.number(),
  skills: z.object({
    algorithmics: z.number(),
    negotiation: z.number(),
    law: z.number(),
    operations: z.number(),
  }),
  network: z.array(z.string()),
  holdings: z.array(z.object({
    assetId: z.string(),
    assetType: z.string(),
    quantity: z.number(),
    purchasePrice: z.number(),
    currentValue: z.number(),
  })),
});

// AI Rival Schema
export const AIRivalSchema = z.object({
  id: z.string(),
  name: z.string(),
  personality: z.object({
    risk: z.number(),
    reputation: z.number(),
    ethics: z.number(),
    aggression: z.number(),
    shortTermFocus: z.number(),
  }),
  stats: z.object({
    cash: z.number(),
    netWorth: z.number(),
    reputation: z.number(),
    suspicion: z.number(),
  }),
  holdings: z.array(z.object({
    assetId: z.string(),
    assetType: z.string(),
    quantity: z.number(),
    purchasePrice: z.number(),
  })),
  lastAction: z.string().optional(),
});

// Asset Schema
export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["stocks", "crypto", "realEstate", "startups", "commodities", "bonds"]),
  currentPrice: z.number(),
  priceHistory: z.array(z.number()),
  volatility: z.number(),
  riskLevel: z.enum(["low", "medium", "high", "extreme"]),
  minimumInvestment: z.number(),
  description: z.string(),
});

// Market Event Schema
export const MarketEventSchema = z.object({
  id: z.string(),
  type: z.enum(["crash", "boom", "scandal", "regulatory", "innovation", "merger"]),
  title: z.string(),
  description: z.string(),
  impact: z.object({
    assetTypes: z.array(z.string()),
    priceMultiplier: z.number(),
    duration: z.number(),
  }),
  probability: z.number(),
});

// News Item Schema
export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.enum(["market", "regulatory", "technology", "scandal", "general"]),
  timestamp: z.number(),
  impact: z.object({
    playerReputation: z.number().optional(),
    marketVolatility: z.number().optional(),
    assetPrices: z.record(z.number()).optional(),
  }).optional(),
});

// Achievement Schema
export const AchievementSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["milestone", "survival", "strategic", "wealth", "reputation"]),
  condition: z.object({
    type: z.string(),
    value: z.number(),
    comparison: z.enum(["greater", "less", "equal"]),
  }),
  reward: z.object({
    xp: z.number(),
    unlocks: z.array(z.string()),
  }),
  unlocked: z.boolean().default(false),
});

// Action Schema
export const ActionSchema = z.object({
  type: z.enum(["invest", "negotiate", "hire", "fire", "influence", "expose", "legalShield", "philanthropy"]),
  target: z.string().optional(),
  amount: z.number().optional(),
  parameters: z.record(z.any()).optional(),
});

// Game State Schema
export const GameStateSchema = z.object({
  turn: z.number(),
  seed: z.string(),
  player: PlayerSchema,
  rivals: z.array(AIRivalSchema),
  assets: z.array(AssetSchema),
  marketEvents: z.array(MarketEventSchema),
  newsItems: z.array(NewsItemSchema),
  achievements: z.array(AchievementSchema),
  gameSettings: z.object({
    difficulty: z.enum(["easy", "normal", "hard", "elite"]),
    marketVolatility: z.number(),
    enableNarrative: z.boolean(),
  }),
});

export type Player = z.infer<typeof PlayerSchema>;
export type AIRival = z.infer<typeof AIRivalSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type MarketEvent = z.infer<typeof MarketEventSchema>;
export type NewsItem = z.infer<typeof NewsItemSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type GameStateData = z.infer<typeof GameStateSchema>;
