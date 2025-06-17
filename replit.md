# Replit.md - Fluide Dating Platform

## Overview

This is a full-stack web application for a polyamory and alternative relationship dating platform called "Fluide". The application is built with a modern tech stack featuring React + TypeScript for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence. The platform includes features for user profiles, event management, messaging, resource sharing, and community building around ethical non-monogamy and conscious relationships.

**Next Phase**: User is interested in integrating AI functionalities to enhance the platform experience, particularly around intelligent matching, educational chatbots, and automated moderation features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express session with PostgreSQL store
- **File Structure**: Monorepo with shared types and schemas

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on login
- **Authorization**: Middleware-based route protection

### Database Schema
- **Users**: Core user information from Replit Auth
- **Profiles**: Extended dating profile data (bio, preferences, values)
- **Events**: Community events and workshops
- **Messages**: Private messaging between users
- **Resources**: Educational content and guides
- **Interactions**: User likes, matches, and social actions
- **Profile Photos**: Image management for user profiles

### API Structure
- **Authentication**: `/api/auth/*` - Login/logout/user info
- **Profiles**: `/api/profiles/*` - Profile CRUD operations
- **Events**: `/api/events/*` - Event management and registration
- **Messages**: `/api/messages/*` - Messaging system
- **Resources**: `/api/resources/*` - Content management
- **Interactions**: `/api/interactions/*` - Social features

### Frontend Pages
- **Landing**: Unauthenticated welcome page
- **Home**: Dashboard with recent activity
- **Profile**: User profile management
- **Search**: Profile discovery with filters
- **Events**: Event browsing and registration
- **Messages**: Private messaging interface
- **Resources**: Educational content library

## Data Flow

### Authentication Flow
1. User clicks login on landing page
2. Redirected to Replit OAuth provider
3. User authorizes application
4. Server receives user info and creates/updates user record
5. Session established with PostgreSQL store
6. User redirected to authenticated application

### Profile Discovery Flow
1. User sets search filters (age, location, practices, values)
2. Frontend sends filtered search request to `/api/profiles/search`
3. Backend queries database with filters using Drizzle ORM
4. Results returned and displayed as profile cards
5. User can like/message profiles directly from search

### Event Management Flow
1. Events are created by community organizers
2. Users browse events with category and date filters
3. Registration creates event_registrations record
4. Users receive notifications about event updates
5. Events support capacity limits and waitlists

### Messaging Flow
1. Users initiate conversations from profiles or events
2. Messages stored in PostgreSQL with read status
3. Real-time updates via polling (5-second intervals)
4. Message threads support safety features (reporting, blocking)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI components
- **passport**: Authentication middleware
- **express-session**: Session management

### Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Backend bundling for production

### Replit-Specific Dependencies
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling (conditional)

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev`
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Automatic connection to provisioned PostgreSQL
- **Port**: Application runs on port 5000

### Production Build
- **Frontend Build**: `vite build` outputs to `dist/public`
- **Backend Build**: `esbuild` bundles server to `dist/index.js`
- **Start Command**: `npm run start` runs production server
- **Static Files**: Express serves built frontend assets

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Environment**: Automatic DATABASE_URL provisioning
- **Secrets**: SESSION_SECRET, REPLIT_DOMAINS, REPL_ID

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
- June 17, 2025. Integration complete AI features system including:
  * Intelligent compatibility matching with personalized scoring
  * Educational AI assistant specialized in tantra and polyamory
  * Automated content moderation for safety
  * Smart conversation starters generator
  * Personalized event recommendations
  * Complete AI features page with tabbed interface
  * Integration in navigation and existing pages
- June 17, 2025. Complete professional entry system implementation:
  * Professional profiles for therapists, coaches, and practitioners
  * Service listings with pricing and booking capabilities
  * Professional verification and rating system
  * Advanced search and filtering for professionals
  * Complete database schema with professional tables
  * Professional section in navigation and routing
  * Dedicated professional interface and management system
- June 17, 2025. Added love coaching sessions functionality:
  * Dedicated "Love Coaching" tab in professionals section
  * Specialized services for individual, couple, and polyamory coaching
  * Detailed service descriptions with pricing and duration
  * Professional booking system integration
  * Educational content about love coaching benefits
  * Complete API routes for professional services management
- June 17, 2025. Comprehensive community platform implementation:
  * Complete forums system with categories, topics, and threaded replies
  * Private community groups with approval systems and moderation
  * Personal wellness journal with mood tracking and energy monitoring
  * Meditation content library with guided sessions and difficulty levels
  * Relationship challenges and daily exercises system
  * Badge and certification system for user achievements
  * Mentorship matching platform for peer support
  * Premium subscription tiers with exclusive features
  * Identity verification and advanced security systems
  * Blog platform for community-generated content
  * Complete database schema with 20+ new tables
  * Advanced matchmaking algorithms and compatibility scoring
  * Comprehensive navigation updates for all new sections
- June 17, 2025. Complete monetization and affiliate system integration:
  * Multi-tier subscription plans (Gratuit, Premium, Expert) with Stripe-ready infrastructure
  * Comprehensive affiliate program with commission tracking and referral management
  * Advanced payment history and commission payout systems
  * Professional affiliate dashboard with earnings analytics and conversion tracking
  * Marketing resources center for affiliates with banners and templates
  * Integration of subscription controls in user interface
  * Badge system rewards tied to monetization activities
  * Complete API infrastructure for subscription management and affiliate operations
- June 17, 2025. Complete forum categories and community structure implementation:
  * 15 comprehensive forum categories covering all aspects of alternative relationships
  * Specialized categories: Polyamorie, Tantra & Spiritualité, Communication, Sexualité Consciente
  * Support categories: Questions Débutants, Support & Entraide, LGBTQ+, Parentalité Alternative
  * Advanced moderation system with approval requirements for sensitive topics
  * Private categories for adult/advanced discussions with restricted access
  * Color-coded and icon-based category identification system
  * 20 diverse community groups across 7 thematic categories
  * Local groups (Paris, Lyon, Marseille), spiritual practices, personal development
  * Identity-specific groups (LGBTQ+, parents, seniors), advanced practices (BDSM, sacred sexuality)
  * Support groups, creative/cultural groups, and activity-based communities
  * Varied privacy settings and approval mechanisms for different group types
  * Complete API endpoints for forum categories, topics, and community groups
- June 17, 2025. Complete implementation of all 10 major platform improvements:
  * Real-time notifications system with categorized alerts and activity tracking
  * Advanced global search with multi-type results (profiles, forums, groups, events)
  * Enhanced messaging with group conversations and media sharing capabilities
  * Interactive calendar view for events with waitlist management and recurring events
  * Intelligent mentorship matching system with compatibility scoring
  * Comprehensive courses platform with lessons, progress tracking, and certifications
  * Community marketplace for digital and physical products with advanced filtering
  * Certification and badge system with progress tracking and skill validation
  * Enhanced AI features integration across all platform components
  * Complete navigation redesign with organized sections and improved user experience
  * All new pages fully integrated with existing authentication and data systems
  * Responsive design implementation across all new components and features
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Language: French (user communicates in French)
Interest: AI functionality integration for the dating platform
```