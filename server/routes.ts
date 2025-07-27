import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertIdeaSchema, updateIdeaSchema, insertVoteSchema, insertPublicLinkSchema, suggestIdeaSchema, updateProfileSchema, createCheckoutSessionSchema, insertStoreItemSchema, updateStoreItemSchema, insertStoreRedemptionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import { conditionalPremiumAccess } from "./premium-middleware";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // This route is handled by auth.ts - removed duplicate

  // User profile update route
  app.patch("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // Verificar autenticación
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Validar datos con updateProfileSchema
      const validatedData = updateProfileSchema.parse(req.body);

      // Actualizar el perfil del usuario
      const updatedUser = await storage.updateUserProfile(req.user.id, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Devolver el usuario actualizado
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }

      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // User role update route (audience -> creator)
  app.patch("/api/user/role", async (req: Request, res: Response) => {
    try {
      // Verificar autenticación
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Verificar que el rol solicitado sea válido
      const { userRole } = req.body;
      if (userRole !== "creator") {
        return res.status(400).json({ 
          message: "Invalid role. Only upgrading to 'creator' is allowed." 
        });
      }

      // Verificar que el usuario actual sea 'audience'
      if (req.user.userRole !== "audience") {
        return res.status(400).json({ 
          message: "User is already a creator or has a different role." 
        });
      }

      // Actualizar el rol del usuario
      const updatedUser = await storage.updateUserProfile(req.user.id, { userRole: "creator" });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Actualizar el usuario en sesión
      req.user.userRole = "creator";

      // Devolver el usuario actualizado
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // User audience stats route
  app.get("/api/user/audience-stats", async (req: Request, res: Response) => {
    try {
      // Verificar autenticación
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;

      // Obtener estadísticas de audiencia
      const stats = await storage.getUserAudienceStats(userId);

      res.json(stats);
    } catch (error) {
      console.error("Error fetching audience stats:", error);
      res.status(500).json({ message: "Failed to fetch audience stats" });
    }
  });

  // User idea quota route
  app.get("/api/user/idea-quota", async (req: Request, res: Response) => {
    try {
      // Verificar autenticación
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;

      // Obtener cuota de ideas del usuario
      const quota = await storage.getUserIdeaQuota(userId);

      res.json(quota);
    } catch (error) {
      console.error("Error fetching idea quota:", error);
      res.status(500).json({ message: "Failed to fetch idea quota" });
    }
  });

  // Submit idea suggestion with points cost (for audience users)
  app.post("/api/suggestions/submit", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const SUGGESTION_COST = 3;
      const userId = req.user.id;

      // Check if user has enough points
      const userPoints = await storage.getUserPoints(userId);
      if (userPoints.totalPoints < SUGGESTION_COST) {
        return res.status(403).json({ 
          message: "Not enough points",
          currentPoints: userPoints.totalPoints,
          requiredPoints: SUGGESTION_COST
        });
      }

      // Validate suggestion data (expecting creatorId in the body)
      console.log(`[SUGGESTION] Received suggestion data:`, req.body);
      const validatedData = suggestIdeaSchema.parse(req.body);
      console.log(`[SUGGESTION] Validated data:`, validatedData);

      // Deduct points for suggestion
      await storage.updateUserPoints(userId, SUGGESTION_COST, 'spent', 'suggestion_submitted');

      // Create the suggestion
      const idea = await storage.suggestIdea(validatedData, userId);

      // Get updated points
      const updatedPoints = await storage.getUserPoints(userId);

      res.status(201).json({
        success: true,
        message: "Suggestion submitted",
        idea,
        updatedPoints: updatedPoints.totalPoints
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error(`[SUGGESTION] Validation error:`, validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error submitting suggestion:", error);
      res.status(500).json({ message: "Failed to submit suggestion" });
    }
  });

  // Points API routes
  // Get user points
  app.get("/api/user/points", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const points = await storage.getUserPoints(userId);

      res.json(points);
    } catch (error) {
      console.error("Error fetching user points:", error);
      res.status(500).json({ message: "Failed to fetch user points" });
    }
  });

  // Get user point transactions/history
  app.get("/api/user/point-transactions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserPointTransactions(userId, limit);

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching point transactions:", error);
      res.status(500).json({ message: "Failed to fetch point transactions" });
    }
  });

  // Ideas API routes
  // Get all ideas
  app.get("/api/ideas", async (req: Request, res: Response) => {
    try {
      // Obtener todas las ideas con posiciones
      const allIdeas = await storage.getIdeasWithPositions();

      let ideas = [];

      // Si el usuario está autenticado, filtramos según su rol
      if (req.isAuthenticated()) {
        if (req.user.userRole === 'creator') {
          // Para creadores: mostrar solo sus propias ideas
          ideas = allIdeas.filter(idea => 
            idea.creatorId === req.user.id && 
            idea.status === 'approved'
          );
        } else {
          // Para usuarios 'audience': mostrar solo ideas aprobadas
          ideas = [];
        }
      } else {
        // Para usuarios no autenticados: no mostrar ideas
        ideas = [];
      }

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
  app.post("/api/ideas", conditionalPremiumAccess, async (req: Request, res: Response) => {
    try {
      console.log("POST /api/ideas - Request received");
      console.log("Authentication state:", req.isAuthenticated());
      console.log("Session ID:", req.sessionID);
      console.log("Session:", req.session);
      console.log("Cookies:", req.headers.cookie);

      if (!req.isAuthenticated()) {
        console.log("Authentication failed, user is not authenticated");
        return res.status(401).json({ message: "Authentication required to create ideas" });
      }

      console.log("User authenticated:", req.user);

      // Verificar el rol del usuario
      if (req.user!.userRole !== 'creator') {
        console.log("User is not a creator, role:", req.user!.userRole);
        return res.status(403).json({ message: "Only creators can add ideas" });
      }

      console.log("User is a valid creator, proceeding");
      const validatedData = insertIdeaSchema.parse(req.body);
      const creatorId = req.user!.id;

      // Check idea quota for non-premium users
      const quota = await storage.getUserIdeaQuota(creatorId);
      if (quota.hasReachedLimit) {
        return res.status(403).json({ 
          message: "Idea limit reached. Upgrade to premium to create unlimited ideas.",
          premiumRequired: true,
          quota
        });
      }

      console.log("Creating idea for creator:", creatorId);
      const idea = await storage.createIdea(validatedData, creatorId);
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const createdIdeaWithPosition = ideasWithPositions.find(i => i.id === idea.id);

      console.log("Idea created successfully:", idea.id);
      res.status(201).json(createdIdeaWithPosition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.log("Validation error:", validationError.message);
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

      // Esta ruta puede ser utilizada tanto por creadores (para borrar sus propias ideas)
      // como por creadores que rechazan ideas pendientes
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const existingIdea = await storage.getIdea(id);
      if (!existingIdea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Verificar los permisos según el rol y situación:
      // 1. Si es creador y es una idea suya, puede eliminarla
      // 2. Si es creador y es una idea pendiente sugerida para él, puede rechazarla (eliminarla)
      if (req.user.userRole === 'creator') {
        // Si la idea tiene al creador como creatorId, puede eliminarla (es suya)
        // O si es una idea pendiente sugerida para este creador, puede eliminarla (rechazarla)
        if (existingIdea.creatorId === req.user!.id) {
          // Todo ok, puede eliminarla
        } else {
          return res.status(403).json({ message: "You can only delete your own ideas" });
        }
      } else {
        // No es un creador, no puede eliminar ideas
        return res.status(403).json({ message: "Only creators can delete ideas" });
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
      // Require authentication to vote
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to vote" });
      }

      const ideaId = Number(req.params.id);
      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const userId = req.user!.id;

      // Check if this user has already voted for this idea
      const existingVote = await storage.getVoteByUserOrSession(ideaId, userId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted for this idea" });
      }

      // Create the vote
      await storage.createVote({ ideaId }, userId);

      // Award 1 point for voting
      await storage.updateUserPoints(userId, 1, 'earned', 'vote_given', ideaId);

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("Error voting for idea:", error);
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  // Public link API routes
  // Create a new public link
  app.post("/api/public-links", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to create public links" });
      }

      const validatedData = insertPublicLinkSchema.parse(req.body);
      const creatorId = req.user!.id;

      const publicLink = await storage.createPublicLink(creatorId, validatedData);
      res.status(201).json(publicLink);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating public link:", error);
      res.status(500).json({ message: "Failed to create public link" });
    }
  });

  // Get all public links for the authenticated user
  app.get("/api/public-links", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to get public links" });
      }

      const creatorId = req.user!.id;
      const publicLinks = await storage.getUserPublicLinks(creatorId);
      res.json(publicLinks);
    } catch (error) {
      console.error("Error fetching public links:", error);
      res.status(500).json({ message: "Failed to fetch public links" });
    }
  });

  // Toggle public link active status
  app.patch("/api/public-links/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to update public links" });
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }

      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean value" });
      }

      const publicLink = await storage.togglePublicLinkStatus(id, isActive);
      if (!publicLink) {
        return res.status(404).json({ message: "Public link not found" });
      }

      // Create the full URL for sharing
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const url = `${baseUrl}/public/${publicLink.token}`;

      res.json({
        ...publicLink,
        url
      });
    } catch (error) {
      console.error("Error updating public link:", error);
      res.status(500).json({ message: "Failed to update public link" });
    }
  });

  // Delete public link
  app.delete("/api/public-links/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to delete public links" });
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }

      await storage.deletePublicLink(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting public link:", error);
      res.status(500).json({ message: "Failed to delete public link" });
    }
  });

  // Creator public page by username
  app.get("/api/creators/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      // Find the creator by username
      const creator = await storage.getUserByUsername(username);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      // Get all ideas for this creator
      const allIdeas = await storage.getIdeasWithPositions();
      
      // Filter ideas:
      // 1. Ideas created by the creator (status: approved)
      // 2. Ideas suggested to the creator by others (status: approved)
      const ideas = allIdeas.filter(idea => 
        idea.status === 'approved' && 
        (idea.creatorId === creator.id)
      );

      // Enviar datos completos del creador, excluyendo la contraseña
      const { password, ...creatorWithoutPassword } = creator;

      res.json({
        ideas,
        creator: creatorWithoutPassword
      });
    } catch (error) {
      console.error("Error fetching creator page:", error);
      res.status(500).json({ message: "Failed to fetch creator page" });
    }
  });

  // Suggest an idea to a creator
  app.post("/api/creators/:username/suggest", async (req: Request, res: Response) => {
    console.log("=========== INICIO PROCESO DE SUGERENCIA ===========");
    console.log("Recibida petición para sugerir idea:", req.params, req.body);
    console.log("Headers:", req.headers);
    console.log("isAuthenticated:", req.isAuthenticated());
    console.log("session:", req.session);

    try {
      if (!req.isAuthenticated()) {
        console.log("❌ ERROR: Usuario no autenticado");
        return res.status(401).json({ message: "Authentication required to suggest ideas" });
      }

      console.log("✅ Usuario autenticado:", req.user);
      const { username } = req.params;

      // Find the creator by username
      const creator = await storage.getUserByUsername(username);
      if (!creator) {
        console.log(`❌ ERROR: Creador "${username}" no encontrado`);
        return res.status(404).json({ message: "Creator not found" });
      }

      console.log("✅ Creador encontrado:", creator);

      // Parse and validate the idea data
      console.log("Cuerpo de la petición:", req.body);
      console.log("Datos a validar:", {
        ...req.body,
        creatorId: creator.id
      });

      try {
        const validatedData = suggestIdeaSchema.parse({
          ...req.body,
          creatorId: creator.id
        });

        console.log("✅ Datos validados:", validatedData);

        // Check if user has enough points
        const userPoints = await storage.getUserPoints(req.user!.id);
        if (userPoints.totalPoints < 3) {
          console.log("❌ ERROR: Usuario no tiene suficientes puntos:", userPoints.totalPoints);
          return res.status(400).json({ message: "Insufficient points. You need 3 points to suggest an idea." });
        }

        // Deduct 3 points for the suggestion
        await storage.updateUserPoints(req.user!.id, 3, 'spent', 'idea_suggestion', null);
        console.log("✅ 3 puntos descontados del usuario");

        // Store the suggested idea with pending status
        const idea = await storage.suggestIdea(validatedData, req.user!.id);
        console.log("✅ Idea sugerida creada:", idea);

        // Get the username of the suggester for the response
        const suggester = await storage.getUser(req.user!.id);
        console.log("✅ Sugeridor:", suggester);

        const response = {
          ...idea,
          suggestedByUsername: suggester!.username,
          position: { current: null, previous: null, change: null }
        };

        console.log("✅ Enviando respuesta:", response);
        console.log("=========== FIN PROCESO DE SUGERENCIA ===========");
        return res.status(201).json(response);
      } catch (validationError) {
        console.log("❌ ERROR: Validación fallida:", validationError);
        if (validationError instanceof ZodError) {
          const errorMessage = fromZodError(validationError).message;
          console.log("Mensaje de error formateado:", errorMessage);
          return res.status(400).json({ message: errorMessage });
        }
        throw validationError; // Si no es un error de Zod, relanzo el error
      }
    } catch (error) {
      console.error("❌ ERROR GENERAL SUGIRIENDO IDEA:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.log("Mensaje de error:", errorMessage);
      console.log("=========== FIN PROCESO DE SUGERENCIA (CON ERROR) ===========");
      return res.status(500).json({ message: "Failed to suggest idea: " + errorMessage });
    }
  });

  // Get pending ideas for the authenticated creator
  app.get("/api/pending-ideas", async (req: Request, res: Response) => {
    console.log(`[PENDING] === PENDING IDEAS REQUEST START ===`);
    console.log(`[PENDING] User authenticated:`, req.isAuthenticated());
    console.log(`[PENDING] User:`, req.user);
    
    try {
      if (!req.isAuthenticated()) {
        console.log(`[PENDING] DENIED: Not authenticated`);
        return res.status(401).json({ message: "Authentication required to view pending ideas" });
      }

      // Comprobar si el usuario tiene rol de creador
      if (req.user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can view pending ideas" });
      }

      const creatorId = req.user!.id;

      // Get all pending ideas for this creator
      const pendingIdeas = await storage.getPendingIdeas(creatorId);

      // Get the username for each suggester
      const pendingIdeasWithSuggester = await Promise.all(
        pendingIdeas.map(async (idea) => {
          let suggestedByUsername = null;

          if (idea.suggestedBy) {
            const suggester = await storage.getUser(idea.suggestedBy);
            suggestedByUsername = suggester ? suggester.username : null;
          }

          return {
            ...idea,
            suggestedByUsername,
            position: { current: null, previous: null, change: null }
          };
        })
      );

      res.json(pendingIdeasWithSuggester);
    } catch (error) {
      console.error("Error fetching pending ideas:", error);
      res.status(500).json({ message: "Failed to fetch pending ideas" });
    }
  });

  // Approve or reject a pending idea
  app.patch("/api/ideas/:id/approve", async (req: Request, res: Response) => {
    console.log(`[APPROVE] === APPROVAL REQUEST START ===`);
    console.log(`[APPROVE] Request params:`, req.params);
    console.log(`[APPROVE] Request body:`, req.body);
    console.log(`[APPROVE] Session ID:`, req.sessionID);
    console.log(`[APPROVE] Session data:`, req.session);
    console.log(`[APPROVE] Cookies:`, req.headers.cookie);
    console.log(`[APPROVE] User authenticated:`, req.isAuthenticated());
    console.log(`[APPROVE] User from session:`, req.user);
    
    try {
      if (!req.isAuthenticated()) {
        console.log(`[APPROVE] DENIED: Not authenticated - session missing or invalid`);
        return res.status(401).json({ message: "Authentication required to approve ideas" });
      }

      const id = Number(req.params.id);
      console.log(`[APPROVE] Processing idea ID: ${id}`);
      console.log(`[APPROVE] ID from params: ${req.params.id}`);
      console.log(`[APPROVE] Parsed ID: ${id}, isNaN: ${isNaN(id)}`);
      
      // Verificar que el usuario tenga rol de creador
      console.log(`[APPROVE] User ${req.user.id} (${req.user.username}) with role ${req.user.userRole} attempting to approve idea ${id}`);
      if (req.user.userRole !== 'creator') {
        console.log(`[APPROVE] DENIED: User ${req.user.username} is not a creator`);
        return res.status(403).json({ message: "Only creators can approve ideas" });
      }
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Check if the user is the creator of the idea (the one who can approve it)
      console.log(`[APPROVE] Idea ${id} belongs to creator ${idea.creatorId}, current user is ${req.user!.id}`);
      if (idea.creatorId !== req.user!.id) {
        console.log(`[APPROVE] DENIED: User ${req.user!.id} cannot approve idea belonging to creator ${idea.creatorId}`);
        return res.status(403).json({ message: "You can only approve ideas suggested to you" });
      }

      // Check if the idea is pending
      if (idea.status !== 'pending') {
        return res.status(400).json({ message: "Only pending ideas can be approved" });
      }

      // Approve the idea
      console.log(`[APPROVE] Approving idea ${id} for creator ${req.user.id}`);
      const approvedIdea = await storage.approveIdea(id);
      console.log(`[APPROVE] Idea ${id} approved successfully`);

      // Award 2 points to the suggester for approved idea
      if (idea.suggestedBy) {
        await storage.updateUserPoints(idea.suggestedBy, 2, 'earned', 'idea_approved', id);
      }

      // Get the approved idea with updated position 
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdeaWithPosition = ideasWithPositions.find(i => i.id === approvedIdea!.id);

      res.json(updatedIdeaWithPosition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error(`[APPROVE] Validation error:`, validationError.message);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error approving idea:", error);
      res.status(500).json({ message: "Failed to approve idea" });
    }
  });

  // Check vote status for a specific idea
  app.get("/api/creators/:username/ideas/:ideaId/vote-status", async (req: Request, res: Response) => {
    try {
      const { ideaId } = req.params;
      const userId = req.isAuthenticated() ? req.user.id : undefined;
      const sessionId = !userId ? req.sessionID : undefined;

      if (!userId && !sessionId) {
        return res.json({ hasVoted: false });
      }

      // Check if user/session has already voted for this idea
      const existingVote = await storage.getVoteByUserOrSession(
        parseInt(ideaId),
        userId,
        sessionId
      );

      res.json({ hasVoted: !!existingVote });
    } catch (error) {
      console.error("Error checking vote status:", error);
      res.status(500).json({ message: "Failed to check vote status" });
    }
  });

  // Vote on a creator's idea
  app.post("/api/creators/:username/ideas/:ideaId/vote", async (req: Request, res: Response) => {
    try {
      console.log(`[VOTE] POST /api/creators/${req.params.username}/ideas/${req.params.ideaId}/vote`);
      
      // Require authentication to vote
      if (!req.isAuthenticated()) {
        console.log("[VOTE] Authentication failed");
        return res.status(401).json({ message: "Authentication required to vote" });
      }

      const { username, ideaId: ideaIdString } = req.params;
      const ideaId = Number(ideaIdString);
      const checkOnly = req.query.check_only === 'true';
      const userId = req.user!.id;

      console.log(`[VOTE] User ${userId} (${req.user!.username}) voting for idea ${ideaId} by ${username}`);

      if (isNaN(ideaId)) {
        console.log("[VOTE] Invalid idea ID");
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Find the creator by username
      const creator = await storage.getUserByUsername(username);
      if (!creator) {
        console.log(`[VOTE] Creator ${username} not found`);
        return res.status(404).json({ message: "Creator not found" });
      }

      // Check if the idea exists and belongs to this creator
      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        console.log(`[VOTE] Idea ${ideaId} not found`);
        return res.status(404).json({ message: "Idea not found" });
      }

      if (idea.creatorId !== creator.id) {
        console.log(`[VOTE] Idea ${ideaId} doesn't belong to creator ${username}`);
        return res.status(403).json({ message: "This idea does not belong to the specified creator" });
      }

      // Check if this user has already voted for this idea
      const existingVote = await storage.getVoteByUserOrSession(ideaId, userId);
      if (existingVote) {
        console.log(`[VOTE] User ${userId} already voted for idea ${ideaId}`);
        return res.status(400).json({ message: "You have already voted for this idea" });
      }

      // If this is only a check, don't create the vote
      if (checkOnly) {
        console.log(`[VOTE] Check only request for user ${userId} on idea ${ideaId}`);
        return res.status(200).json({ message: "You have not voted for this idea yet" });
      }

      console.log(`[VOTE] Creating vote for user ${userId} on idea ${ideaId}`);
      
      // Create the vote
      await storage.createVote({ ideaId }, userId);
      console.log(`[VOTE] Vote created successfully`);

      // Award 1 point for voting
      await storage.updateUserPoints(userId, 1, 'earned', 'vote_given', ideaId);
      console.log(`[VOTE] 1 point awarded to user ${userId}`);

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      console.log(`[VOTE] Vote process completed successfully for idea ${ideaId}`);
      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("[VOTE] Error voting for idea:", error);
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  // Public leaderboard routes
  app.get("/api/public/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      // Get the public link by token
      const publicLink = await storage.getPublicLinkByToken(token);
      if (!publicLink) {
        return res.status(404).json({ message: "Public leaderboard not found" });
      }

      // Check if the link is active
      if (!publicLink.isActive) {
        return res.status(403).json({ message: "This leaderboard is currently inactive" });
      }

      // Check if the link has expired
      if (publicLink.expiresAt && new Date() > publicLink.expiresAt) {
        return res.status(403).json({ message: "This leaderboard link has expired" });
      }

      // Get the ideas with positions
      const ideas = await storage.getIdeasWithPositions();

      res.json({
        ideas,
        publicLink: {
          ...publicLink,
          url: `${process.env.REPL_SLUG ? `${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'http://localhost:5000'}/public/${token}`
        }
      });
    } catch (error) {
      console.error("Error fetching public leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch public leaderboard" });
    }
  });

  // Vote on a public leaderboard
  app.post("/api/public/:token/ideas/:ideaId/vote", async (req: Request, res: Response) => {
    try {
      // Require authentication to vote
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to vote" });
      }

      const { token, ideaId: ideaIdString } = req.params;
      const ideaId = Number(ideaIdString);
      const checkOnly = req.query.check_only === 'true';

      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Get the public link by token
      const publicLink = await storage.getPublicLinkByToken(token);
      if (!publicLink) {
        return res.status(404).json({ message: "Public leaderboard not found" });
      }

      // Check if the link is active
      if (!publicLink.isActive) {
        return res.status(403).json({ message: "This leaderboard is currently inactive" });
      }

      // Check if the link has expired
      if (publicLink.expiresAt && new Date() > publicLink.expiresAt) {
        return res.status(403).json({ message: "This leaderboard link has expired" });
      }

      // Check if the idea exists
      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      const userId = req.user!.id;

      // Check if this user has already voted for this idea
      const existingVote = await storage.getVoteByUserOrSession(ideaId, userId);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted for this idea" });
      }

      // If this is only a check, don't create the vote
      if (checkOnly) {
        return res.status(200).json({ message: "You have not voted for this idea yet" });
      }

      // Create the vote
      await storage.createVote({ ideaId }, userId);

      // Award 1 point for voting
      await storage.updateUserPoints(userId, 1, 'earned', 'vote_given', ideaId);

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("Error voting for idea on public leaderboard:", error);
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  // Subscription routes
  
  // Start trial
  app.post("/api/subscription/start-trial", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to start trial" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has already used trial
      if (user.hasUsedTrial) {
        return res.status(400).json({ message: "Trial has already been used" });
      }

      // Start the trial
      const updatedUser = await storage.startUserTrial(userId);
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to start trial" });
      }

      // Return user data without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error starting trial:", error);
      res.status(500).json({ message: "Failed to start trial" });
    }
  });

  // Create Stripe checkout session
  app.post("/api/stripe/create-checkout-session", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to create checkout session" });
      }

      // Validate request data
      const validatedData = createCheckoutSessionSchema.parse(req.body);
      const { plan, successUrl, cancelUrl } = validatedData;

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ensure we have a Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
          metadata: {
            userId: userId.toString()
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUserSubscription(userId, {
          stripeCustomerId: customerId
        });
      }

      // Define price mappings
      const priceMap = {
        monthly: 'price_monthly', // Will be created dynamically
        yearly: 'price_yearly'    // Will be created dynamically
      };

      // Create or get product and prices
      let product;
      try {
        const products = await stripe.products.list({ limit: 1 });
        product = products.data.find(p => p.name === 'Fanlist Premium');
        
        if (!product) {
          product = await stripe.products.create({
            name: 'Fanlist Premium',
            description: 'Access to premium features including unlimited ideas, advanced analytics, and priority support',
          });
        }
      } catch (error) {
        console.error("Error creating/getting product:", error);
        throw error;
      }

      // Create or get prices
      let priceId;
      try {
        const prices = await stripe.prices.list({ 
          product: product.id,
          limit: 10 
        });
        
        const targetAmount = plan === 'monthly' ? 500 : 3600; // $5/month or $36/year
        const targetInterval = plan === 'monthly' ? 'month' : 'year';
        
        let price = prices.data.find(p => 
          p.unit_amount === targetAmount && 
          p.recurring?.interval === targetInterval
        );
        
        if (!price) {
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: targetAmount,
            currency: 'usd',
            recurring: {
              interval: targetInterval
            }
          });
        }
        
        priceId = price.id;
      } catch (error) {
        console.error("Error creating/getting price:", error);
        throw error;
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
          plan: plan
        },
        subscription_data: user.hasUsedTrial ? {
          metadata: {
            userId: userId.toString(),
            plan: plan
          }
        } : {
          trial_period_days: 14,
          metadata: {
            userId: userId.toString(),
            plan: plan
          }
        }
      });

      res.json({
        id: session.id,
        url: session.url
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      if (error instanceof ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({ message: errorMessage });
      }
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Cancel subscription
  app.post("/api/stripe/cancel-subscription", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to cancel subscription" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.subscriptionStatus !== 'premium') {
        return res.status(400).json({ message: "No active subscription to cancel" });
      }

      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ message: "No Stripe subscription found" });
      }

      // Cancel the subscription in Stripe
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Update user subscription status
      const updatedUser = await storage.updateUserSubscription(userId, {
        subscriptionStatus: 'free',
        subscriptionPlan: undefined,
        subscriptionEndDate: undefined,
        stripeSubscriptionId: undefined
      });

      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to cancel subscription" });
      }

      res.json({ 
        message: "Subscription cancelled successfully",
        status: "cancelled"
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Testing routes for Stripe flows (only available in development)
  if (process.env.NODE_ENV === 'development') {
    // Simulate successful payment
    app.post("/api/stripe/test/simulate-payment", async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Authentication required" });
        }

        const { plan, scenario } = req.body;
        if (!plan || !['monthly', 'yearly'].includes(plan)) {
          return res.status(400).json({ message: "Valid plan required (monthly or yearly)" });
        }

        const userId = req.user!.id;
        
        if (scenario === 'success') {
          // Simular pago exitoso
          const endDate = new Date();
          if (plan === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }

          const updatedUser = await storage.updateUserSubscription(userId, {
            subscriptionStatus: 'premium',
            subscriptionPlan: plan,
            subscriptionEndDate: endDate,
            stripeCustomerId: `test_customer_${userId}`,
            stripeSubscriptionId: `test_sub_${userId}_${Date.now()}`
          });

          const { password, ...userWithoutPassword } = updatedUser!;
          return res.json({ 
            success: true, 
            message: "Payment simulation successful",
            user: userWithoutPassword,
            confetti: true // Trigger confetti animation
          });
        } else if (scenario === 'cancel') {
          return res.json({ 
            success: false, 
            message: "Payment was cancelled by user",
            cancelled: true 
          });
        } else if (scenario === 'fail') {
          return res.status(400).json({ 
            success: false, 
            message: "Payment failed - insufficient funds",
            error: "payment_failed" 
          });
        }

        res.status(400).json({ message: "Invalid scenario. Use: success, cancel, or fail" });
      } catch (error) {
        console.error("Error simulating payment:", error);
        res.status(500).json({ message: "Failed to simulate payment" });
      }
    });

    // Simulate subscription cancellation
    app.post("/api/stripe/test/simulate-cancellation", async (req: Request, res: Response) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "Authentication required" });
        }

        const userId = req.user!.id;
        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.subscriptionStatus !== 'premium') {
          return res.status(400).json({ message: "No active subscription to cancel" });
        }

        const updatedUser = await storage.updateUserSubscription(userId, {
          subscriptionStatus: 'free',
          subscriptionPlan: undefined,
          subscriptionEndDate: undefined,
          stripeSubscriptionId: undefined
        });

        const { password, ...userWithoutPassword } = updatedUser!;
        res.json({ 
          success: true,
          message: "Subscription cancelled successfully",
          user: userWithoutPassword
        });
      } catch (error) {
        console.error("Error simulating cancellation:", error);
        res.status(500).json({ message: "Failed to simulate cancellation" });
      }
    });

    // Test webhook events
    app.post("/api/stripe/test/webhook", async (req: Request, res: Response) => {
      try {
        const { eventType, userId, plan } = req.body;
        
        if (!userId || !eventType) {
          return res.status(400).json({ message: "userId and eventType required" });
        }

        // Simulate different webhook events
        switch (eventType) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            const endDate = new Date();
            if (plan === 'monthly') {
              endDate.setMonth(endDate.getMonth() + 1);
            } else {
              endDate.setFullYear(endDate.getFullYear() + 1);
            }

            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'premium',
              subscriptionPlan: plan || 'monthly',
              subscriptionEndDate: endDate,
              stripeCustomerId: `test_customer_${userId}`,
              stripeSubscriptionId: `test_sub_${userId}_${Date.now()}`
            });

            res.json({ 
              success: true, 
              message: `Webhook ${eventType} processed successfully` 
            });
            break;
          }

          case 'customer.subscription.deleted': {
            await storage.updateUserSubscription(userId, {
              subscriptionStatus: 'free',
              subscriptionPlan: undefined,
              subscriptionEndDate: undefined,
              stripeSubscriptionId: undefined
            });

            res.json({ 
              success: true, 
              message: "Subscription deleted webhook processed" 
            });
            break;
          }

          case 'invoice.payment_failed': {
            res.json({ 
              success: true, 
              message: "Payment failed webhook processed - subscription remains active" 
            });
            break;
          }

          default:
            res.status(400).json({ message: "Unsupported event type for testing" });
        }
      } catch (error) {
        console.error("Error processing test webhook:", error);
        res.status(500).json({ message: "Failed to process test webhook" });
      }
    });

    // Get test payment cards info
    app.get("/api/stripe/test/cards", async (req: Request, res: Response) => {
      res.json({
        testCards: {
          success: {
            number: "4242424242424242",
            description: "Visa - Always succeeds"
          },
          decline: {
            number: "4000000000000002",
            description: "Visa - Always declined"
          },
          insufficient_funds: {
            number: "4000000000009995",
            description: "Visa - Insufficient funds"
          },
          expired: {
            number: "4000000000000069",
            description: "Visa - Expired card"
          },
          processing_error: {
            number: "4000000000000119",
            description: "Visa - Processing error"
          }
        },
        instructions: "Use any future expiry date (e.g., 12/34) and any 3-digit CVC"
      });
    });
  }

  // Stripe webhook endpoint
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (!user) {
            console.error(`User not found for Stripe customer ${customerId}`);
            break;
          }

          // Determine subscription plan
          const plan = subscription.metadata?.plan || 'monthly';
          
          // Calculate end date
          const endDate = new Date((subscription as any).current_period_end * 1000);
          
          // Update user subscription
          await storage.updateUserSubscription(user.id, {
            subscriptionStatus: 'premium',
            subscriptionPlan: plan as 'monthly' | 'yearly',
            subscriptionEndDate: endDate,
            stripeSubscriptionId: subscription.id,
            hasUsedTrial: true
          });

          console.log(`Updated subscription for user ${user.id}: ${subscription.status}`);
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (!user) {
            console.error(`User not found for Stripe customer ${customerId}`);
            break;
          }

          // Cancel user subscription
          await storage.updateUserSubscription(user.id, {
            subscriptionStatus: 'free',
            subscriptionPlan: undefined,
            subscriptionEndDate: undefined,
            stripeSubscriptionId: undefined
          });

          console.log(`Cancelled subscription for user ${user.id}`);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (!user) {
            console.error(`User not found for Stripe customer ${customerId}`);
            break;
          }

          console.log(`Payment succeeded for user ${user.id}: ${invoice.amount_paid / 100} ${invoice.currency}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (!user) {
            console.error(`User not found for Stripe customer ${customerId}`);
            break;
          }

          console.log(`Payment failed for user ${user.id}`);
          // Could implement retry logic or notifications here
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const customerId = session.customer as string;
          
          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (!user) {
            console.error(`User not found for Stripe customer ${customerId}`);
            break;
          }

          console.log(`Checkout completed for user ${user.id}`);
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Store item management routes (for creators)
  app.get("/api/store/items", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can access store items" });
      }

      const items = await storage.getStoreItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching store items:", error);
      res.status(500).json({ message: "Failed to fetch store items" });
    }
  });

  app.post("/api/store/items", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can create store items" });
      }

      // Check if user has premium access
      const { hasActivePremiumAccess } = await import('@shared/premium-utils');
      const hasPremium = hasActivePremiumAccess({
        subscriptionStatus: user.subscriptionStatus as "free" | "trial" | "premium" | "canceled",
        trialEndDate: user.trialEndDate,
        subscriptionEndDate: user.subscriptionEndDate
      });

      if (!hasPremium) {
        return res.status(403).json({ message: "Premium access required to create store items" });
      }

      // Check if user has reached the 5-item limit
      const existingItems = await storage.getStoreItems(userId);
      if (existingItems.length >= 5) {
        return res.status(400).json({ message: "Maximum of 5 store items allowed" });
      }

      const validatedData = insertStoreItemSchema.parse(req.body);
      const newItem = await storage.createStoreItem(validatedData, userId);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating store item:", error);
      if (error instanceof ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({ message: errorMessage });
      }
      res.status(500).json({ message: "Failed to create store item" });
    }
  });

  app.put("/api/store/items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can update store items" });
      }

      const itemId = parseInt(req.params.id);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      // Check if the item belongs to the user
      const existingItem = await storage.getStoreItem(itemId);
      if (!existingItem || existingItem.creatorId !== userId) {
        return res.status(404).json({ message: "Store item not found" });
      }

      const validatedData = updateStoreItemSchema.parse(req.body);
      const updatedItem = await storage.updateStoreItem(itemId, validatedData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Store item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating store item:", error);
      if (error instanceof ZodError) {
        const errorMessage = fromZodError(error).message;
        return res.status(400).json({ message: errorMessage });
      }
      res.status(500).json({ message: "Failed to update store item" });
    }
  });

  app.delete("/api/store/items/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can delete store items" });
      }

      const itemId = parseInt(req.params.id);
      if (isNaN(itemId)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      // Check if the item belongs to the user
      const existingItem = await storage.getStoreItem(itemId);
      if (!existingItem || existingItem.creatorId !== userId) {
        return res.status(404).json({ message: "Store item not found" });
      }

      await storage.deleteStoreItem(itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting store item:", error);
      res.status(500).json({ message: "Failed to delete store item" });
    }
  });

  // Store redemption routes (for creators to manage redemptions)
  app.get("/api/store/redemptions", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can access redemptions" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const result = await storage.getStoreRedemptions(userId, limit, offset);
      
      res.json({
        redemptions: result.redemptions,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching store redemptions:", error);
      res.status(500).json({ message: "Failed to fetch store redemptions" });
    }
  });

  app.patch("/api/store/redemptions/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can update redemptions" });
      }

      const redemptionId = parseInt(req.params.id);
      if (isNaN(redemptionId)) {
        return res.status(400).json({ message: "Invalid redemption ID" });
      }

      const { status } = req.body;
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedRedemption = await storage.updateRedemptionStatus(redemptionId, status);
      
      if (!updatedRedemption) {
        return res.status(404).json({ message: "Redemption not found" });
      }

      // Verify the redemption belongs to the creator
      if (updatedRedemption.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this redemption" });
      }

      res.json(updatedRedemption);
    } catch (error) {
      console.error("Error updating redemption status:", error);
      res.status(500).json({ message: "Failed to update redemption status" });
    }
  });

  // Public store routes (for audience to view and redeem items)
  app.get("/api/creators/:username/store", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const creator = await storage.getUserByUsername(username);
      
      if (!creator || creator.userRole !== 'creator') {
        return res.status(404).json({ message: "Creator not found" });
      }

      const items = await storage.getStoreItems(creator.id);
      // Only return active and available items to the public
      const publicItems = items.filter(item => item.isActive && item.isAvailable);
      
      res.json(publicItems);
    } catch (error) {
      console.error("Error fetching creator store:", error);
      res.status(500).json({ message: "Failed to fetch creator store" });
    }
  });

  app.post("/api/creators/:username/store/:itemId/redeem", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to redeem items" });
      }

      const { username, itemId } = req.params;
      const userId = req.user!.id;
      
      const creator = await storage.getUserByUsername(username);
      if (!creator || creator.userRole !== 'creator') {
        return res.status(404).json({ message: "Creator not found" });
      }

      const itemIdNum = parseInt(itemId);
      if (isNaN(itemIdNum)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }

      const item = await storage.getStoreItem(itemIdNum);
      if (!item || item.creatorId !== creator.id) {
        return res.status(404).json({ message: "Store item not found" });
      }

      // Check if item is available
      if (!item.isActive || (item.maxQuantity !== null && item.currentQuantity >= item.maxQuantity)) {
        return res.status(400).json({ message: "This item is no longer available" });
      }

      // Check if user has enough points
      const userPoints = await storage.getUserPoints(userId);
      if (userPoints.totalPoints < item.pointsCost) {
        return res.status(400).json({ 
          message: `Insufficient points. You need ${item.pointsCost} points but only have ${userPoints.totalPoints}` 
        });
      }

      // Create redemption and deduct points in transaction
      const redemption = await storage.createStoreRedemption({ storeItemId: itemIdNum }, userId);
      
      // Deduct points from user
      await storage.updateUserPoints(userId, item.pointsCost, 'spent', 'store_redemption', itemIdNum);

      res.status(201).json(redemption);
    } catch (error) {
      console.error("Error redeeming store item:", error);
      res.status(500).json({ message: "Failed to redeem store item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}