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
  // Health check endpoint for Render
  app.get('/', (req, res) => {
    res.send('Fluide Platform is running!');
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

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

  // Forum routes
  app.get('/api/forum/categories', async (req, res) => {
    try {
      const categories = [
        {
          id: 1,
          name: "Polyamorie & Relations Multiples",
          description: "Discussions sur la polyamorie, les relations ouvertes et la gestion de multiples partenaires",
          color: "#E91E63",
          icon: "💕",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 42,
          lastActivity: "Il y a 2 heures"
        },
        {
          id: 2,
          name: "Tantra & Spiritualité",
          description: "Exploration du tantra, méditation et connexions spirituelles dans l'intimité",
          color: "#9C27B0",
          icon: "🕉️",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 28,
          lastActivity: "Il y a 4 heures"
        },
        {
          id: 3,
          name: "Communication & Conflits",
          description: "Techniques de communication consciente et résolution de conflits relationnels",
          color: "#2196F3",
          icon: "💬",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 35,
          lastActivity: "Il y a 1 heure"
        },
        {
          id: 4,
          name: "Sexualité Consciente",
          description: "Discussions sur l'intimité physique, le plaisir et la sexualité éthique",
          color: "#FF5722",
          icon: "🌹",
          isPrivate: false,
          requiresApproval: true,
          moderatorIds: [],
          topicCount: 18,
          lastActivity: "Il y a 3 heures"
        },
        {
          id: 5,
          name: "Développement Personnel",
          description: "Croissance personnelle, estime de soi et développement dans les relations",
          color: "#4CAF50",
          icon: "🌱",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 67,
          lastActivity: "Il y a 30 minutes"
        },
        {
          id: 6,
          name: "Jalousie & Émotions",
          description: "Gestion de la jalousie, des émotions difficiles et de l'attachement",
          color: "#FF9800",
          icon: "💚",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 29,
          lastActivity: "Il y a 1 heure"
        },
        {
          id: 7,
          name: "Communauté & Événements",
          description: "Organisation d'événements, rencontres communautaires et sorties",
          color: "#00BCD4",
          icon: "🎉",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 15,
          lastActivity: "Il y a 6 heures"
        },
        {
          id: 8,
          name: "Témoignages & Expériences",
          description: "Partage d'expériences personnelles et témoignages de parcours",
          color: "#8BC34A",
          icon: "📖",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 52,
          lastActivity: "Il y a 45 minutes"
        },
        {
          id: 9,
          name: "Ressources & Lectures",
          description: "Recommandations de livres, articles, podcasts et autres ressources",
          color: "#795548",
          icon: "📚",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 34,
          lastActivity: "Il y a 2 heures"
        },
        {
          id: 10,
          name: "Questions Débutants",
          description: "Espace sécurisé pour les questions des personnes nouvelles aux relations alternatives",
          color: "#607D8B",
          icon: "❓",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 89,
          lastActivity: "Il y a 15 minutes"
        },
        {
          id: 11,
          name: "Relations LGBTQ+",
          description: "Discussions spécifiques aux identités et relations LGBTQ+ dans les relations alternatives",
          color: "#673AB7",
          icon: "🏳️‍🌈",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 23,
          lastActivity: "Il y a 3 heures"
        },
        {
          id: 12,
          name: "Parentalité Alternative",
          description: "Polyamorie et parentalité, co-parentalité et familles non-conventionnelles",
          color: "#3F51B5",
          icon: "👨‍👩‍👧‍👦",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 17,
          lastActivity: "Il y a 5 heures"
        },
        {
          id: 13,
          name: "Bien-être & Santé",
          description: "Santé mentale, IST, contraception et bien-être dans les relations multiples",
          color: "#009688",
          icon: "🏥",
          isPrivate: false,
          requiresApproval: true,
          moderatorIds: [],
          topicCount: 31,
          lastActivity: "Il y a 2 heures"
        },
        {
          id: 14,
          name: "Pratiques Alternatives",
          description: "BDSM éthique, kink conscient et autres pratiques alternatives",
          color: "#E91E63",
          icon: "🔗",
          isPrivate: true,
          requiresApproval: true,
          moderatorIds: [],
          topicCount: 12,
          lastActivity: "Il y a 4 heures"
        },
        {
          id: 15,
          name: "Support & Entraide",
          description: "Espace de soutien mutuel et d'entraide communautaire",
          color: "#F44336",
          icon: "🤝",
          isPrivate: false,
          requiresApproval: false,
          moderatorIds: [],
          topicCount: 47,
          lastActivity: "Il y a 1 heure"
        }
      ];
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/forum/topics', async (req, res) => {
    try {
      const { categoryId } = req.query;
      
      const topics = [
        {
          id: 1,
          categoryId: 1,
          authorId: "user1",
          authorName: "Sophie L.",
          title: "Comment gérer la communication avec plusieurs partenaires ?",
          content: "Je découvre la polyamorie et j'aimerais des conseils sur la communication...",
          isPinned: true,
          isLocked: false,
          tags: ["débutant", "communication", "conseils"],
          viewCount: 234,
          replyCount: 15,
          lastReplyAt: "2025-01-17T15:30:00Z",
          lastReplyByName: "Marc D.",
          createdAt: "2025-01-15T10:00:00Z"
        },
        {
          id: 2,
          categoryId: 2,
          authorId: "user2",
          authorName: "Luna M.",
          title: "Méditation tantrique en couple : vos expériences",
          content: "Partageons nos expériences de méditation tantrique à deux...",
          isPinned: false,
          isLocked: false,
          tags: ["tantra", "méditation", "couple"],
          viewCount: 156,
          replyCount: 8,
          lastReplyAt: "2025-01-17T12:15:00Z",
          lastReplyByName: "Alex R.",
          createdAt: "2025-01-16T14:20:00Z"
        },
        {
          id: 3,
          categoryId: 5,
          authorId: "user3",
          authorName: "Thomas B.",
          title: "Surmonter ses peurs en relations alternatives",
          content: "Comment avez-vous surmonté vos peurs initiales ?",
          isPinned: false,
          isLocked: false,
          tags: ["développement", "peurs", "témoignage"],
          viewCount: 89,
          replyCount: 12,
          lastReplyAt: "2025-01-17T16:45:00Z",
          lastReplyByName: "Emma K.",
          createdAt: "2025-01-17T09:30:00Z"
        }
      ];

      const filteredTopics = categoryId && categoryId !== 'all' 
        ? topics.filter(topic => topic.categoryId === parseInt(categoryId as string))
        : topics;

      res.json(filteredTopics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.post('/api/forum/topics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categoryId, title, content, tags } = req.body;
      
      // Validation basique
      if (!categoryId || !title || !content) {
        return res.status(400).json({ message: "Données manquantes" });
      }

      const newTopic = {
        id: Math.floor(Math.random() * 10000),
        categoryId: parseInt(categoryId),
        authorId: userId,
        authorName: req.user.claims.firstName || "Utilisateur",
        title,
        content,
        isPinned: false,
        isLocked: false,
        tags: tags || [],
        viewCount: 0,
        replyCount: 0,
        lastReplyAt: new Date().toISOString(),
        lastReplyByName: req.user.claims.firstName || "Utilisateur",
        createdAt: new Date().toISOString()
      };

      res.json(newTopic);
    } catch (error) {
      console.error("Error creating forum topic:", error);
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  app.get('/api/community/groups', async (req, res) => {
    try {
      const groups = [
        // Groupes locaux par ville
        {
          id: 1,
          name: "Polyamorie Paris",
          description: "Groupe local pour les personnes en relations polyamoureuses à Paris. Rencontres mensuelles, cafés poly et discussions ouvertes.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 50,
          currentMembers: 34,
          creatorId: "user1",
          creatorName: "Sophie L.",
          tags: ["Paris", "polyamorie", "local", "rencontres"],
          imageUrl: null,
          membershipStatus: "member"
        },
        {
          id: 2,
          name: "Relations Alternatives Lyon",
          description: "Communauté lyonnaise pour explorer les relations éthiques non-monogames. Événements sociaux et groupes de parole.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 40,
          currentMembers: 28,
          creatorId: "user4",
          creatorName: "Marc D.",
          tags: ["Lyon", "relations", "éthique", "social"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 3,
          name: "Fluide Marseille",
          description: "Groupe méditerranéen pour les relations libres et conscientes. Plage, nature et connexions authentiques.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 60,
          currentMembers: 42,
          creatorId: "user5",
          creatorName: "Océane P.",
          tags: ["Marseille", "nature", "liberté", "authenticité"],
          imageUrl: null,
          membershipStatus: "pending"
        },

        // Groupes thématiques spirituels
        {
          id: 4,
          name: "Tantra & Méditation",
          description: "Pratiques tantriques, méditation et exploration de l'énergie sexuelle sacrée. Séances guidées et partages d'expériences.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 100,
          currentMembers: 67,
          creatorId: "user2",
          creatorName: "Luna M.",
          tags: ["tantra", "méditation", "spiritualité", "énergie"],
          imageUrl: null,
          membershipStatus: "member"
        },
        {
          id: 5,
          name: "Breathwork & Connexion",
          description: "Exploration des techniques de respiration consciente pour approfondir l'intimité et la connexion.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 30,
          currentMembers: 22,
          creatorId: "user6",
          creatorName: "Kai S.",
          tags: ["breathwork", "respiration", "intimité", "connexion"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 6,
          name: "Cercles de Femmes Sacrées",
          description: "Espace exclusif pour l'exploration de la féminité sacrée, des cycles et de la sexualité féminine.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 25,
          currentMembers: 18,
          creatorId: "user7",
          creatorName: "Isis R.",
          tags: ["femmes", "sacré", "cycles", "féminité"],
          imageUrl: null,
          membershipStatus: "pending"
        },

        // Groupes de développement personnel
        {
          id: 7,
          name: "Communication Consciente",
          description: "Développer ses compétences en communication non-violente et écoute empathique dans les relations.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 75,
          currentMembers: 45,
          creatorId: "user3",
          creatorName: "Thomas B.",
          tags: ["communication", "CNV", "empathie", "skills"],
          imageUrl: null,
          membershipStatus: "member"
        },
        {
          id: 8,
          name: "Gestion de la Jalousie",
          description: "Espace de soutien pour comprendre et transformer la jalousie en relations multiples.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 35,
          currentMembers: 24,
          creatorId: "user8",
          creatorName: "Camille F.",
          tags: ["jalousie", "émotions", "transformation", "soutien"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 9,
          name: "Estime de Soi & Relations",
          description: "Cultiver la confiance en soi et l'amour-propre pour des relations plus épanouissantes.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 80,
          currentMembers: 56,
          creatorId: "user9",
          creatorName: "Alexandre V.",
          tags: ["estime", "confiance", "amour-propre", "épanouissement"],
          imageUrl: null,
          membershipStatus: "member"
        },

        // Groupes spécialisés par identité
        {
          id: 10,
          name: "Polyamorie LGBTQ+",
          description: "Espace inclusif pour les personnes LGBTQ+ explorant les relations polyamoureuses et alternatives.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 60,
          currentMembers: 38,
          creatorId: "user10",
          creatorName: "Robin C.",
          tags: ["LGBTQ+", "inclusivité", "diversité", "polyamorie"],
          imageUrl: null,
          membershipStatus: "pending"
        },
        {
          id: 11,
          name: "Parents Polyamoureux",
          description: "Soutien et conseils pour les parents en relations multiples. Co-parentalité et familles recomposées.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 40,
          currentMembers: 26,
          creatorId: "user11",
          creatorName: "Julie & David",
          tags: ["parentalité", "famille", "enfants", "co-parentalité"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 12,
          name: "Seniors & Relations Alternatives",
          description: "Communauté pour les personnes de 50+ explorant de nouvelles formes relationnelles.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 30,
          currentMembers: 19,
          creatorId: "user12",
          creatorName: "Françoise M.",
          tags: ["seniors", "50+", "maturité", "exploration"],
          imageUrl: null,
          membershipStatus: "not_member"
        },

        // Groupes de pratiques avancées
        {
          id: 13,
          name: "BDSM Éthique & Conscient",
          description: "Exploration des pratiques BDSM dans un cadre éthique, consensuel et bienveillant.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 25,
          currentMembers: 17,
          creatorId: "user13",
          creatorName: "Maître K.",
          tags: ["BDSM", "éthique", "consentement", "pratiques"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 14,
          name: "Sexualité Sacrée",
          description: "Approche spirituelle de la sexualité, rituels intimes et pratiques tantriques avancées.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 20,
          currentMembers: 14,
          creatorId: "user14",
          creatorName: "Shakti D.",
          tags: ["sexualité", "sacré", "rituels", "tantra"],
          imageUrl: null,
          membershipStatus: "pending"
        },

        // Groupes de soutien
        {
          id: 15,
          name: "Transitions Relationnelles",
          description: "Soutien pour les personnes en transition : ruptures, nouvelles relations, changements de vie.",
          isPrivate: true,
          requiresApproval: true,
          maxMembers: 50,
          currentMembers: 33,
          creatorId: "user15",
          creatorName: "Dr. Sarah L.",
          tags: ["transition", "rupture", "changement", "soutien"],
          imageUrl: null,
          membershipStatus: "member"
        },
        {
          id: 16,
          name: "Nouveaux dans la Polyamorie",
          description: "Groupe d'accueil pour les débutants. Questions, conseils et accompagnement bienveillant.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 100,
          currentMembers: 78,
          creatorId: "user16",
          creatorName: "Marie & Paul",
          tags: ["débutants", "accueil", "conseils", "apprentissage"],
          imageUrl: null,
          membershipStatus: "not_member"
        },

        // Groupes créatifs et culturels
        {
          id: 17,
          name: "Art & Expression Créative",
          description: "Exploration artistique des thèmes relationnels : peinture, écriture, danse et expression corporelle.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 60,
          currentMembers: 41,
          creatorId: "user17",
          creatorName: "Artémis L.",
          tags: ["art", "créativité", "expression", "culture"],
          imageUrl: null,
          membershipStatus: "member"
        },
        {
          id: 18,
          name: "Lectures & Philosophie",
          description: "Club de lecture autour des ouvrages sur l'amour, la sexualité et les relations alternatives.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 45,
          currentMembers: 32,
          creatorId: "user18",
          creatorName: "Socrate B.",
          tags: ["lecture", "philosophie", "littérature", "réflexion"],
          imageUrl: null,
          membershipStatus: "pending"
        },

        // Groupes d'activités
        {
          id: 19,
          name: "Randonnées & Nature",
          description: "Sorties nature, randonnées et activités outdoor pour créer des liens authentiques.",
          isPrivate: false,
          requiresApproval: false,
          maxMembers: 70,
          currentMembers: 52,
          creatorId: "user19",
          creatorName: "Sylvain N.",
          tags: ["nature", "randonnée", "outdoor", "aventure"],
          imageUrl: null,
          membershipStatus: "not_member"
        },
        {
          id: 20,
          name: "Soirées & Événements Festifs",
          description: "Organisation de soirées thématiques, fêtes et événements conviviaux pour la communauté.",
          isPrivate: false,
          requiresApproval: true,
          maxMembers: 80,
          currentMembers: 64,
          creatorId: "user20",
          creatorName: "Festa M.",
          tags: ["soirées", "fêtes", "événements", "convivialité"],
          imageUrl: null,
          membershipStatus: "member"
        }
      ];
      res.json(groups);
    } catch (error) {
      console.error("Error fetching community groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  // Notifications system
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = [
        {
          id: 1,
          type: "message",
          title: "Nouveau message",
          content: "Luna M. vous a envoyé un message",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          relatedId: "user2",
          actionUrl: "/messages"
        },
        {
          id: 2,
          type: "forum",
          title: "Nouvelle réponse",
          content: "Votre sujet 'Communication' a reçu une réponse",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          relatedId: "topic1",
          actionUrl: "/community?tab=forums"
        },
        {
          id: 3,
          type: "event",
          title: "Événement demain",
          content: "Rappel: Atelier Tantra demain à 19h",
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          relatedId: "event5",
          actionUrl: "/events"
        },
        {
          id: 4,
          type: "match",
          title: "Nouveau match",
          content: "Vous avez une compatibilité de 89% avec Alex R.",
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          relatedId: "user3",
          actionUrl: "/search"
        }
      ];
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      // Mark notification as read
      res.json({ message: "Notification marked as read", id: notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Advanced search endpoint
  app.get('/api/search/global', async (req, res) => {
    try {
      const { q, type, filters } = req.query;
      const query = q as string;
      
      if (!query || query.length < 2) {
        return res.json({ results: [], suggestions: [] });
      }

      const results = {
        profiles: [
          {
            id: "user1",
            type: "profile",
            title: "Sophie L.",
            description: "Polyamorie, communication consciente",
            avatar: null,
            relevanceScore: 0.95
          }
        ],
        forums: [
          {
            id: 1,
            type: "forum_topic",
            title: "Communication avec plusieurs partenaires",
            description: "Discussions sur la gestion de multiples relations",
            category: "Polyamorie & Relations",
            relevanceScore: 0.88
          }
        ],
        groups: [
          {
            id: 7,
            type: "group",
            title: "Communication Consciente",
            description: "Développer ses compétences en CNV",
            memberCount: 45,
            relevanceScore: 0.92
          }
        ],
        events: [
          {
            id: 1,
            type: "event",
            title: "Atelier Communication",
            description: "Techniques de communication en relations multiples",
            date: "2025-01-20",
            relevanceScore: 0.85
          }
        ]
      };

      const suggestions = [
        "communication polyamorie",
        "tantra méditation",
        "gestion jalousie",
        "relations alternatives"
      ];

      res.json({ results, suggestions, totalResults: 12 });
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Enhanced events system
  app.get('/api/events/calendar', async (req, res) => {
    try {
      const { month, year } = req.query;
      const events = [
        {
          id: 1,
          title: "Atelier Tantra Débutants",
          description: "Introduction aux pratiques tantriques",
          date: "2025-01-20",
          time: "19:00",
          duration: 120,
          location: "Paris 11e",
          category: "tantra",
          maxParticipants: 20,
          currentParticipants: 15,
          price: 35,
          isRecurring: false,
          organizerId: "user2",
          organizerName: "Luna M.",
          tags: ["débutant", "tantra", "spiritualité"]
        },
        {
          id: 2,
          title: "Café Polyamorie",
          description: "Rencontre informelle autour d'un café",
          date: "2025-01-22",
          time: "18:30",
          duration: 180,
          location: "Café des Arts, Paris",
          category: "social",
          maxParticipants: 30,
          currentParticipants: 22,
          price: 0,
          isRecurring: true,
          recurringPattern: "weekly",
          organizerId: "user1",
          organizerName: "Sophie L.",
          tags: ["social", "polyamorie", "discussion"]
        },
        {
          id: 3,
          title: "Méditation & Breathwork",
          description: "Séance de méditation et travail respiratoire",
          date: "2025-01-25",
          time: "10:00",
          duration: 90,
          location: "Studio Zen, Lyon",
          category: "wellness",
          maxParticipants: 15,
          currentParticipants: 8,
          price: 25,
          isRecurring: true,
          recurringPattern: "bi-weekly",
          organizerId: "user6",
          organizerName: "Kai S.",
          tags: ["méditation", "breathwork", "bien-être"]
        }
      ];
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Failed to fetch calendar events" });
    }
  });

  app.post('/api/events/:id/join-waitlist', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      res.json({ 
        message: "Ajouté à la liste d'attente",
        eventId,
        userId,
        position: 3
      });
    } catch (error) {
      console.error("Error joining waitlist:", error);
      res.status(500).json({ message: "Failed to join waitlist" });
    }
  });

  // Mentorship system
  app.get('/api/mentorship/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = [
        {
          id: 1,
          mentorId: "user5",
          mentorName: "Océane P.",
          mentorExpertise: ["polyamorie", "communication", "gestion émotions"],
          mentorExperience: "5 ans en relations alternatives",
          compatibilityScore: 0.92,
          availability: "weekends",
          sessionType: "video",
          pricePerSession: 0,
          description: "Accompagnement bienveillant pour débuter en polyamorie"
        },
        {
          id: 2,
          mentorId: "user8",
          mentorName: "Camille F.",
          mentorExpertise: ["jalousie", "estime de soi", "transitions"],
          mentorExperience: "3 ans de coaching relationnel",
          compatibilityScore: 0.87,
          availability: "evenings",
          sessionType: "text_chat",
          pricePerSession: 15,
          description: "Spécialisée dans la gestion des émotions difficiles"
        }
      ];
      res.json(matches);
    } catch (error) {
      console.error("Error fetching mentorship matches:", error);
      res.status(500).json({ message: "Failed to fetch mentorship matches" });
    }
  });

  app.post('/api/mentorship/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mentorId, message, sessionType } = req.body;
      
      res.json({
        message: "Demande de mentorat envoyée",
        requestId: Math.floor(Math.random() * 10000),
        estimatedResponse: "24-48h"
      });
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      res.status(500).json({ message: "Failed to request mentorship" });
    }
  });

  // Educational content system
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = [
        {
          id: 1,
          title: "Fondamentaux de la Polyamorie",
          description: "Introduction complète aux relations polyamoureuses éthiques",
          instructor: "Dr. Sarah L.",
          duration: "6 semaines",
          lessonsCount: 18,
          difficulty: "beginner",
          price: 89,
          isPremium: true,
          rating: 4.8,
          enrolledCount: 234,
          thumbnailUrl: null,
          topics: ["communication", "jalousie", "accords", "sécurité émotionnelle"],
          progress: 0
        },
        {
          id: 2,
          title: "Tantra Moderne pour Couples",
          description: "Pratiques tantriques adaptées aux relations contemporaines",
          instructor: "Luna M.",
          duration: "4 semaines",
          lessonsCount: 12,
          difficulty: "intermediate",
          price: 67,
          isPremium: true,
          rating: 4.9,
          enrolledCount: 156,
          thumbnailUrl: null,
          topics: ["énergie sexuelle", "méditation", "intimité", "connexion"],
          progress: 25
        },
        {
          id: 3,
          title: "Communication Non-Violente en Amour",
          description: "Techniques CNV appliquées aux relations intimes",
          instructor: "Thomas B.",
          duration: "3 semaines",
          lessonsCount: 9,
          difficulty: "beginner",
          price: 45,
          isPremium: false,
          rating: 4.7,
          enrolledCount: 189,
          thumbnailUrl: null,
          topics: ["écoute empathique", "expression besoins", "gestion conflits"],
          progress: 100
        }
      ];
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id/lessons', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = [
        {
          id: 1,
          title: "Qu'est-ce que la polyamorie ?",
          description: "Définitions et principes fondamentaux",
          duration: 45,
          type: "video",
          isCompleted: true,
          isUnlocked: true,
          order: 1
        },
        {
          id: 2,
          title: "Mythes et réalités",
          description: "Déconstruire les idées reçues",
          duration: 38,
          type: "video",
          isCompleted: true,
          isUnlocked: true,
          order: 2
        },
        {
          id: 3,
          title: "Types de relations alternatives",
          description: "Panorama des structures relationnelles",
          duration: 52,
          type: "interactive",
          isCompleted: false,
          isUnlocked: true,
          order: 3
        }
      ];
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Marketplace system
  app.get('/api/marketplace/products', async (req, res) => {
    try {
      const { category, minPrice, maxPrice } = req.query;
      const products = [
        {
          id: 1,
          name: "Guide Complet : Premiers Pas en Polyamorie",
          description: "E-book de 150 pages avec exercices pratiques",
          category: "guides",
          price: 24.99,
          currency: "EUR",
          sellerId: "user15",
          sellerName: "Dr. Sarah L.",
          rating: 4.8,
          reviewCount: 67,
          imageUrl: null,
          isDigital: true,
          tags: ["polyamorie", "débutant", "guide", "e-book"]
        },
        {
          id: 2,
          name: "Méditations Tantriques Audio",
          description: "Collection de 20 méditations guidées",
          category: "audio",
          price: 19.99,
          currency: "EUR",
          sellerId: "user2",
          sellerName: "Luna M.",
          rating: 4.9,
          reviewCount: 89,
          imageUrl: null,
          isDigital: true,
          tags: ["tantra", "méditation", "audio", "relaxation"]
        },
        {
          id: 3,
          name: "Kit Rituels Intimes",
          description: "Bougies, encens et guide pour rituels de couple",
          category: "physical",
          price: 45.00,
          currency: "EUR",
          sellerId: "user14",
          sellerName: "Shakti D.",
          rating: 4.6,
          reviewCount: 34,
          imageUrl: null,
          isDigital: false,
          shippingInfo: "Livraison 3-5 jours",
          tags: ["rituels", "couple", "spiritualité", "accessoires"]
        }
      ];

      let filteredProducts = products;
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice as string));
      }
      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice as string));
      }

      res.json(filteredProducts);
    } catch (error) {
      console.error("Error fetching marketplace products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Certification system
  app.get('/api/certifications', async (req, res) => {
    try {
      const certifications = [
        {
          id: 1,
          name: "Communicateur Conscient",
          description: "Maîtrise des techniques de communication non-violente",
          category: "communication",
          requirements: [
            "Compléter le cours CNV",
            "Participer à 5 discussions de forum",
            "Réussir l'évaluation pratique"
          ],
          badgeColor: "#2196F3",
          badgeIcon: "💬",
          difficultyLevel: "intermédiaire",
          estimatedTime: "3-4 semaines",
          isEarned: false,
          progress: 60
        },
        {
          id: 2,
          name: "Guide Polyamorie",
          description: "Compétences pour accompagner les débutants",
          category: "mentorship",
          requirements: [
            "2 ans d'expérience documentée",
            "Formation aux techniques d'accompagnement",
            "Évaluations positives de mentorat"
          ],
          badgeColor: "#E91E63",
          badgeIcon: "🌟",
          difficultyLevel: "avancé",
          estimatedTime: "6-8 mois",
          isEarned: false,
          progress: 20
        },
        {
          id: 3,
          name: "Praticien Tantra",
          description: "Certification en pratiques tantriques éthiques",
          category: "spirituality",
          requirements: [
            "Formation théorique 40h",
            "Stage pratique supervisé",
            "Mémoire de fin d'études"
          ],
          badgeColor: "#9C27B0",
          badgeIcon: "🕉️",
          difficultyLevel: "expert",
          estimatedTime: "1 an",
          isEarned: true,
          progress: 100
        }
      ];
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  // Enhanced messaging system
  app.get('/api/conversations/:userId/media', isAuthenticated, async (req: any, res) => {
    try {
      const conversationUserId = req.params.userId;
      const currentUserId = req.user.claims.sub;
      
      const mediaMessages = [
        {
          id: 1,
          type: "voice",
          url: "/audio/message1.mp3",
          duration: 45,
          senderId: conversationUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 2,
          type: "image",
          url: "/images/shared2.jpg",
          caption: "Vue de notre balade hier",
          senderId: currentUserId,
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        }
      ];
      
      res.json(mediaMessages);
    } catch (error) {
      console.error("Error fetching conversation media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post('/api/conversations/group', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { participantIds, name, description } = req.body;
      
      const groupConversation = {
        id: Math.floor(Math.random() * 10000),
        name: name || "Nouveau groupe",
        description,
        participantIds: [userId, ...participantIds],
        createdBy: userId,
        createdAt: new Date().toISOString(),
        isGroup: true
      };
      
      res.json(groupConversation);
    } catch (error) {
      console.error("Error creating group conversation:", error);
      res.status(500).json({ message: "Failed to create group conversation" });
    }
  });

  // Subscription and monetization routes
  app.get('/api/subscription/plans', async (req, res) => {
    try {
      const plans = [
        {
          id: 1,
          name: "Gratuit",
          price: 0,
          billingPeriod: "monthly",
          features: [
            "Profil de base",
            "Recherche limitée",
            "3 messages par jour",
            "Forums publics"
          ],
          isPopular: false
        },
        {
          id: 2,
          name: "Premium",
          price: 19.99,
          billingPeriod: "monthly",
          features: [
            "Profil détaillé avec photos",
            "Recherche avancée illimitée",
            "Messages illimités",
            "Accès à tous les événements",
            "IA de compatibilité",
            "Méditations premium",
            "Support prioritaire"
          ],
          isPopular: true
        },
        {
          id: 3,
          name: "Expert",
          price: 39.99,
          billingPeriod: "monthly",
          features: [
            "Tout Premium inclus",
            "Profil professionnel",
            "Outils de coaching",
            "Analytics avancés",
            "Sessions de mentorat",
            "Certification badges",
            "Programme d'affiliation",
            "API access"
          ],
          isPopular: false
        }
      ];
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get('/api/subscription/user', isAuthenticated, async (req, res) => {
    try {
      // Return null if no subscription exists
      res.json(null);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post('/api/subscription/create', isAuthenticated, async (req, res) => {
    try {
      const { planId, billingPeriod } = req.body;
      
      // Note: In production, this would integrate with Stripe
      res.json({ 
        success: true, 
        message: "Abonnement créé avec succès!",
        subscriptionId: "sub_demo_123"
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.post('/api/subscription/cancel', isAuthenticated, async (req, res) => {
    try {
      res.json({ 
        success: true, 
        message: "Abonnement annulé. Il restera actif jusqu'à la fin de la période."
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Affiliate program routes
  app.get('/api/affiliate/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        referrals: 0,
        conversions: 0,
        clickThroughRate: 0,
        conversionRate: 0
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ message: "Failed to fetch affiliate stats" });
    }
  });

  // Wellness and badges routes
  app.get('/api/wellness/journal', isAuthenticated, async (req, res) => {
    try {
      // Return empty array for new users
      res.json([]);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get('/api/wellness/meditations', async (req, res) => {
    try {
      const meditations = [
        {
          id: 1,
          title: "Méditation Tantrique pour Débutants",
          description: "Introduction douce aux pratiques tantriques de respiration et de connexion énergétique",
          category: "Tantra",
          duration: 15,
          difficulty: "Débutant",
          instructor: "Sarah Dubois",
          isPremium: false,
          rating: 4.8
        },
        {
          id: 2,
          title: "Breathwork pour l'Intimité",
          description: "Techniques de respiration pour approfondir la connexion avec votre/vos partenaire(s)",
          category: "Breathwork",
          duration: 20,
          difficulty: "Intermédiaire",
          instructor: "Marc Chen",
          isPremium: true,
          rating: 4.9
        },
        {
          id: 3,
          title: "Méditation de la Communication Consciente",
          description: "Pratique guidée pour développer l'écoute empathique et l'expression authentique",
          category: "Communication",
          duration: 25,
          difficulty: "Tous niveaux",
          instructor: "Luna Martinez",
          isPremium: false,
          rating: 4.7
        }
      ];
      res.json(meditations);
    } catch (error) {
      console.error("Error fetching meditations:", error);
      res.status(500).json({ message: "Failed to fetch meditations" });
    }
  });

  app.get('/api/wellness/challenges', isAuthenticated, async (req, res) => {
    try {
      const challenges = [
        {
          id: 1,
          title: "30 Jours de Communication Consciente",
          description: "Améliorez votre communication relationnelle avec des exercices quotidiens",
          category: "Communication",
          difficulty: "Intermédiaire",
          duration: "30 jours",
          progress: 0,
          status: "available"
        },
        {
          id: 2,
          title: "Semaine de Gratitude Relationnelle",
          description: "Cultivez la reconnaissance envers vos partenaires et relations",
          category: "Bien-être",
          difficulty: "Débutant",
          duration: "7 jours",
          progress: 0,
          status: "available"
        },
        {
          id: 3,
          title: "Exploration des Limites et Consentement",
          description: "Approfondissez votre compréhension du consentement et de vos limites",
          category: "Éducation",
          difficulty: "Avancé",
          duration: "14 jours",
          progress: 0,
          status: "available"
        }
      ];
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/badges/user', isAuthenticated, async (req, res) => {
    try {
      // Return empty array for new users
      res.json([]);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.get('/api/badges/available', async (req, res) => {
    try {
      const { category } = req.query;
      let badges = [
        {
          id: 1,
          name: "Premier Pas",
          description: "Complétez votre profil avec toutes les informations de base",
          category: "skill",
          color: "#10B981",
          requirements: "Profil complété à 100%",
          progress: 0,
          isEarned: false
        },
        {
          id: 2,
          name: "Explorateur",
          description: "Visitez toutes les sections de la plateforme",
          category: "achievement",
          color: "#F59E0B",
          requirements: "Visite de 8 sections différentes",
          progress: 0,
          isEarned: false
        },
        {
          id: 3,
          name: "Méditant",
          description: "Complétez votre première méditation guidée",
          category: "learning",
          color: "#8B5CF6",
          requirements: "1 méditation terminée",
          progress: 0,
          isEarned: false
        },
        {
          id: 4,
          name: "Mentor",
          description: "Aidez d'autres membres de la communauté",
          category: "community",
          color: "#EF4444",
          requirements: "5 réponses utiles dans les forums",
          progress: 0,
          isEarned: false
        },
        {
          id: 5,
          name: "Communicateur",
          description: "Participez activement aux discussions de la communauté",
          category: "community",
          color: "#3B82F6",
          requirements: "10 messages dans les forums",
          progress: 0,
          isEarned: false
        }
      ];

      if (category && category !== 'all') {
        badges = badges.filter(badge => badge.category === category);
      }

      res.json(badges);
    } catch (error) {
      console.error("Error fetching available badges:", error);
      res.status(500).json({ message: "Failed to fetch available badges" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
