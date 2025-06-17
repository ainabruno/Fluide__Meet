import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  calculateCompatibility, 
  getEducationalResponse, 
  moderateContent, 
  generateConversationStarters,
  getEventRecommendations 
} from "./ai";
import { 
  insertProfileSchema, 
  insertEventSchema, 
  insertMessageSchema, 
  insertResourceSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Also get the user's profile
      const profile = await storage.getProfile(userId);
      
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse({ ...req.body, userId });
      
      // Check if profile already exists
      const existingProfile = await storage.getProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile already exists" });
      }
      
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profiles/search', isAuthenticated, async (req: any, res) => {
    try {
      const filters = {
        minAge: req.query.minAge ? parseInt(req.query.minAge) : undefined,
        maxAge: req.query.maxAge ? parseInt(req.query.maxAge) : undefined,
        location: req.query.location as string,
        practices: req.query.practices ? (req.query.practices as string).split(',') : undefined,
        values: req.query.values ? (req.query.values as string).split(',') : undefined,
        intentions: req.query.intentions ? (req.query.intentions as string).split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
      };
      
      const profiles = await storage.searchProfiles(filters);
      res.json(profiles);
    } catch (error) {
      console.error("Error searching profiles:", error);
      res.status(500).json({ message: "Failed to search profiles" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        upcoming: req.query.upcoming === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const registration = await storage.registerForEvent({
        eventId,
        userId,
        status: 'registered',
      });
      
      res.json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.get('/api/events/:id/registrations', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  // Message routes
  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      
      const message = await storage.sendMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Resource routes
  app.get('/api/resources', async (req, res) => {
    try {
      const filters = {
        type: req.query.type as string,
        category: req.query.category as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const resources = await storage.getResources(filters);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get('/api/resources/:id', async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const resource = await storage.getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      console.error("Error fetching resource:", error);
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  // User interaction routes
  app.post('/api/interactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId, type } = req.body;
      
      // Check if interaction already exists
      const existingInteraction = await storage.getInteraction(userId, targetUserId, type);
      if (existingInteraction) {
        return res.status(400).json({ message: "Interaction already exists" });
      }
      
      const interaction = await storage.createInteraction({
        userId,
        targetUserId,
        type,
      });
      
      res.json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      res.status(500).json({ message: "Failed to create interaction" });
    }
  });

  app.get('/api/interactions/likes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likes = await storage.getUserLikes(userId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Professional routes
  app.get('/api/professionals', async (req, res) => {
    try {
      const { search, specialty, location, limit, offset } = req.query;
      const professionals = await storage.getProfessionals({
        search: search as string,
        specialty: specialty as string,
        location: location as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.get('/api/professionals/:id', async (req, res) => {
    try {
      const professional = await storage.getProfessional(parseInt(req.params.id));
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  app.get('/api/professionals/:id/services', async (req, res) => {
    try {
      const services = await storage.getProfessionalServices(parseInt(req.params.id));
      res.json(services);
    } catch (error) {
      console.error("Error fetching professional services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post('/api/professionals/:id/book', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const professionalId = parseInt(req.params.id);
      const bookingData = { ...req.body, clientId: userId, professionalId };
      
      const booking = await storage.createServiceBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Routes IA - Système de matching intelligent
  app.post("/api/ai/compatibility", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId } = req.body;
      
      if (!targetUserId) {
        return res.status(400).json({ message: "ID utilisateur cible requis" });
      }

      const userProfile = await storage.getProfile(userId);
      const targetProfile = await storage.getProfile(targetUserId);

      if (!userProfile || !targetProfile) {
        return res.status(404).json({ message: "Profil non trouvé" });
      }

      const compatibility = await calculateCompatibility(userProfile, targetProfile);
      res.json(compatibility);
    } catch (error) {
      console.error("Erreur calcul compatibilité:", error);
      res.status(500).json({ message: "Erreur lors du calcul de compatibilité" });
    }
  });

  // Assistant éducatif spécialisé
  app.post("/api/ai/assistant", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question requise" });
      }

      const userProfile = await storage.getProfile(userId);
      const userContext = userProfile ? {
        experience: (userProfile.practices?.length || 0) > 3 ? 'expérimenté' : 'débutant',
        interests: userProfile.practices || []
      } : undefined;

      const response = await getEducationalResponse(question, userContext);
      res.json(response);
    } catch (error) {
      console.error("Erreur assistant éducatif:", error);
      res.status(500).json({ message: "Erreur lors de la consultation de l'assistant" });
    }
  });

  // Modération automatique
  app.post("/api/ai/moderate", isAuthenticated, async (req, res) => {
    try {
      const { content, type } = req.body;
      
      if (!content || !type) {
        return res.status(400).json({ message: "Contenu et type requis" });
      }

      const moderation = await moderateContent(content, type);
      res.json(moderation);
    } catch (error) {
      console.error("Erreur modération:", error);
      res.status(500).json({ message: "Erreur lors de la modération" });
    }
  });

  // Suggestions de conversation
  app.post("/api/ai/conversation-starters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId } = req.body;
      
      if (!targetUserId) {
        return res.status(400).json({ message: "ID utilisateur cible requis" });
      }

      const userProfile = await storage.getProfile(userId);
      const targetProfile = await storage.getProfile(targetUserId);

      if (!userProfile || !targetProfile) {
        return res.status(404).json({ message: "Profil non trouvé" });
      }

      const suggestions = await generateConversationStarters(userProfile, targetProfile);
      res.json({ suggestions });
    } catch (error) {
      console.error("Erreur suggestions conversation:", error);
      res.status(500).json({ message: "Erreur lors de la génération de suggestions" });
    }
  });

  // Recommandations d'événements personnalisées
  app.get("/api/ai/event-recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const userProfile = await storage.getProfile(userId);
      if (!userProfile) {
        return res.status(404).json({ message: "Profil utilisateur non trouvé" });
      }

      const events = await storage.getEvents({ upcoming: true, limit: 50 });
      const availableEvents = events.map(event => ({
        title: event.title,
        description: event.description || '',
        category: event.category
      }));

      const recommendations = await getEventRecommendations(userProfile, availableEvents);
      res.json({ recommendations });
    } catch (error) {
      console.error("Erreur recommandations événements:", error);
      res.status(500).json({ message: "Erreur lors de la génération de recommandations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
