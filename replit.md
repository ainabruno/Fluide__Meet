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
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Language: French (user communicates in French)
Interest: AI functionality integration for the dating platform
```