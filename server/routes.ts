import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertIdeaSchema, updateIdeaSchema, insertVoteSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Ideas API routes
  // Get all ideas
  app.get("/api/ideas", async (req: Request, res: Response) => {
    try {
      const ideas = await storage.getIdeasWithPositions();
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  // Get single idea
  app.get("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      res.json(idea);
    } catch (error) {
      console.error("Error fetching idea:", error);
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  // Create new idea
  app.post("/api/ideas", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to create ideas" });
      }

      const validatedData = insertIdeaSchema.parse(req.body);
      const creatorId = req.user!.id;

      const idea = await storage.createIdea(validatedData, creatorId);
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const createdIdeaWithPosition = ideasWithPositions.find(i => i.id === idea.id);

      res.status(201).json(createdIdeaWithPosition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating idea:", error);
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  // Update idea
  app.put("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to update ideas" });
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const validatedData = updateIdeaSchema.parse(req.body);
      
      // Check if the idea exists
      const existingIdea = await storage.getIdea(id);
      if (!existingIdea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Check if the user is the creator of the idea
      if (existingIdea.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only update your own ideas" });
      }

      // Check if the idea has too many votes to be edited (optional)
      const maxVotesForEdit = 100; // Example threshold
      if (existingIdea.votes > maxVotesForEdit) {
        return res.status(403).json({ 
          message: `Ideas with more than ${maxVotesForEdit} votes cannot be edited to prevent manipulation` 
        });
      }

      const updatedIdea = await storage.updateIdea(id, validatedData);
      if (!updatedIdea) {
        return res.status(404).json({ message: "Failed to update idea" });
      }

      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdeaWithPosition = ideasWithPositions.find(i => i.id === updatedIdea.id);

      res.json(updatedIdeaWithPosition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating idea:", error);
      res.status(500).json({ message: "Failed to update idea" });
    }
  });

  // Delete idea
  app.delete("/api/ideas/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to delete ideas" });
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const existingIdea = await storage.getIdea(id);
      if (!existingIdea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Check if the user is the creator of the idea
      if (existingIdea.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own ideas" });
      }

      await storage.deleteIdea(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting idea:", error);
      res.status(500).json({ message: "Failed to delete idea" });
    }
  });

  // Vote for an idea
  app.post("/api/ideas/:id/vote", async (req: Request, res: Response) => {
    try {
      const ideaId = Number(req.params.id);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const userId = req.isAuthenticated() ? req.user!.id : undefined;
      const sessionId = req.sessionID;

      // Check if this user/session has already voted for this idea
      const existingVote = await storage.getVoteByUserOrSession(ideaId, userId, sessionId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted for this idea" });
      }

      // Create the vote
      await storage.createVote({ ideaId }, userId, sessionId);

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("Error voting for idea:", error);
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
