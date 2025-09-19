import { type GameState, type InsertGameState } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getGameState(id: string): Promise<GameState | undefined>;
  getGameStateByPlayer(playerName: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: string, gameData: any): Promise<GameState>;
  deleteGameState(id: string): Promise<boolean>;
  listGameStates(): Promise<GameState[]>;
}

export class MemStorage implements IStorage {
  private gameStates: Map<string, GameState>;

  constructor() {
    this.gameStates = new Map();
  }

  async getGameState(id: string): Promise<GameState | undefined> {
    return this.gameStates.get(id);
  }

  async getGameStateByPlayer(playerName: string): Promise<GameState | undefined> {
    return Array.from(this.gameStates.values()).find(
      (gameState) => gameState.playerName === playerName,
    );
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const id = randomUUID();
    const gameState: GameState = {
      ...insertGameState,
      id,
      turn: insertGameState.turn || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.gameStates.set(id, gameState);
    return gameState;
  }

  async updateGameState(id: string, gameData: any): Promise<GameState> {
    const existingGameState = this.gameStates.get(id);
    if (!existingGameState) {
      throw new Error("Game state not found");
    }
    
    const updatedGameState: GameState = {
      ...existingGameState,
      gameData,
      updatedAt: new Date(),
    };
    
    this.gameStates.set(id, updatedGameState);
    return updatedGameState;
  }

  async deleteGameState(id: string): Promise<boolean> {
    return this.gameStates.delete(id);
  }

  async listGameStates(): Promise<GameState[]> {
    return Array.from(this.gameStates.values());
  }
}

export const storage = new MemStorage();
