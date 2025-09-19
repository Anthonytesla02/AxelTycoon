import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GameEngine } from "./services/gameEngine";
import { insertGameStateSchema, ActionSchema } from "@shared/schema";
import { z } from "zod";

const gameEngine = new GameEngine();

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new game
  app.post("/api/game/new", async (req, res) => {
    try {
      const { playerName, seed } = req.body;
      
      if (!playerName || typeof playerName !== "string") {
        return res.status(400).json({ message: "Player name is required" });
      }

      const gameData = gameEngine.createNewGame(playerName, seed);
      const gameState = await storage.createGameState({
        playerName,
        turn: gameData.turn,
        seed: gameData.seed,
        gameData,
      });

      res.json(gameState);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Load game
  app.get("/api/game/:id", async (req, res) => {
    try {
      const gameState = await storage.getGameState(req.params.id);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(gameState);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Load game by player name
  app.get("/api/game/player/:playerName", async (req, res) => {
    try {
      const gameState = await storage.getGameStateByPlayer(req.params.playerName);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found for player" });
      }
      res.json(gameState);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Process turn
  app.post("/api/game/:id/turn", async (req, res) => {
    try {
      const gameState = await storage.getGameState(req.params.id);
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }

      const actionValidation = ActionSchema.safeParse(req.body);
      if (!actionValidation.success) {
        return res.status(400).json({ 
          message: "Invalid action", 
          errors: actionValidation.error.errors 
        });
      }

      const newGameData = await gameEngine.processTurn(gameState.gameData as any, actionValidation.data);
      const updatedGameState = await storage.updateGameState(req.params.id, newGameData);

      res.json(updatedGameState);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // List all games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.listGameStates();
      res.json(games);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete game
  app.delete("/api/game/:id", async (req, res) => {
    try {
      const success = await storage.deleteGameState(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json({ message: "Game deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
