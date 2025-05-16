import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertIdeaSchema, updateIdeaSchema, insertVoteSchema, insertPublicLinkSchema, suggestIdeaSchema, updateProfileSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Ruta para obtener datos del usuario actual
  app.get("/api/user", async (req: Request, res: Response) => {
    console.log("GET /api/user - Auth check:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);
    console.log("Cookies:", req.headers.cookie);

    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).json({ 
        message: "Not authenticated", 
        authenticated: false 
      });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found", 
          authenticated: true 
        });
      }

      // Enviar datos del usuario sin la contraseña
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ 
        message: "Error fetching user data", 
        authenticated: true 
      });
    }
  });

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

  // Ideas API routes
  // Get all ideas
  app.get("/api/ideas", async (req: Request, res: Response) => {
    try {
      // Obtener todas las ideas con posiciones
      const allIdeas = await storage.getIdeasWithPositions();

      // Si el usuario está autenticado y solicita incluir ideas pendientes, incluirlas
      const includePending = req.query.include_pending === 'true' && req.isAuthenticated();

      let ideas = [];

      // Si el usuario está autenticado, filtramos según su rol
      if (req.isAuthenticated()) {
        // Si el usuario es creador, mostrar sus propias ideas (aprobadas y pendientes)
        if (req.user.userRole === 'creator') {
          ideas = allIdeas.filter(idea => 
            // Ideas que el creador ha creado
            idea.creatorId === req.user.id
          );
        } else {
          // Para usuarios con rol 'audience', mostrar todas las ideas aprobadas
          ideas = allIdeas.filter(idea => idea.status === 'approved');
        }
      } else {
        // Para usuarios no autenticados, mostrar solo ideas aprobadas
        ideas = allIdeas.filter(idea => idea.status === 'approved');
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
  app.post("/api/ideas", async (req: Request, res: Response) => {
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

      // Get the ideas with positions for this creator - only approved ideas
      const ideas = await storage.getIdeasWithPositions().then(ideas => 
        ideas.filter(idea => idea.creatorId === creator.id && idea.status === 'approved')
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
    try {
      if (!req.isAuthenticated()) {
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
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to approve ideas" });
      }

      // Verificar que el usuario tenga rol de creador
      if (req.user.userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can approve ideas" });
      }

      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Check if the idea exists
      const idea = await storage.getIdea(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Check if the user is the creator of the idea (the one who can approve it)
      if (idea.creatorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only approve ideas suggested to you" });
      }

      // Check if the idea is pending
      if (idea.status !== 'pending') {
        return res.status(400).json({ message: "Only pending ideas can be approved" });
      }

      // Approve the idea
      const approvedIdea = await storage.approveIdea(id);

      // Get the approved idea with updated position 
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdeaWithPosition = ideasWithPositions.find(i => i.id === approvedIdea!.id);

      res.json(updatedIdeaWithPosition);
    } catch (error) {
      console.error("Error approving idea:", error);
      res.status(500).json({ message: "Failed to approve idea" });
    }
  });

  // Vote on a creator's idea
  app.post("/api/creators/:username/ideas/:ideaId/vote", async (req: Request, res: Response) => {
    try {
      // Require authentication to vote
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required to vote" });
      }

      const { username, ideaId: ideaIdString } = req.params;
      const ideaId = Number(ideaIdString);
      const checkOnly = req.query.check_only === 'true';

      if (isNaN(ideaId)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      // Find the creator by username
      const creator = await storage.getUserByUsername(username);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }

      // Check if the idea exists and belongs to this creator
      const idea = await storage.getIdea(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      if (idea.creatorId !== creator.id) {
        return res.status(403).json({ message: "This idea does not belong to the specified creator" });
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

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("Error voting for idea:", error);
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

      // Get the updated idea with its new position
      const ideasWithPositions = await storage.getIdeasWithPositions();
      const updatedIdea = ideasWithPositions.find(i => i.id === ideaId);

      res.status(201).json(updatedIdea);
    } catch (error) {
      console.error("Error voting for idea on public leaderboard:", error);
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}