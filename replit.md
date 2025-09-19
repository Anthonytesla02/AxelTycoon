# Shadow & Ledger - Strategic Economic Simulation Game

## Overview

Shadow & Ledger is a turn-based strategic economic simulation game where players compete as "Axel" against 3-6 AI-controlled rivals in unpredictable markets. The game combines elements of chess (strategic multi-turn decisions), poker (uncertainty and bluffing), and tycoon games (resource building) to create an entertaining and replayable experience.

The application is built as a full-stack web game using React for the frontend and Express for the backend, designed to run in a browser environment on Replit. The game features stochastic market modeling, AI personalities with distinct behaviors, turn-based gameplay with real-time UI feedback, and comprehensive gamification elements including achievements, levels, and narrative events.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI System**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and dark theme support
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Development**: Hot module replacement and error overlay for development experience

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints for game state management and turn processing
- **Game Engine**: Modular service architecture with separate engines for:
  - Market simulation with stochastic price modeling
  - AI rival behavior and decision making
  - Event generation and news creation
  - Turn-based game state processing
- **Storage**: Pluggable storage interface with in-memory implementation (ready for database upgrade)
- **Build System**: ESBuild for production bundling

### Data Architecture
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Game State**: JSON-based game data storage with structured TypeScript schemas
- **Shared Types**: Common type definitions between client and server using Zod validation
- **Player Data**: Hierarchical player stats including skills, holdings, reputation, and network

### Game Systems Design
- **Turn Structure**: Four-phase turn system (Market Update → Decision → Resolution → Narrative)
- **AI Personalities**: Probabilistic behavior models with distinct risk profiles and decision patterns
- **Market Simulation**: Stochastic price movements with volatility shocks and fat-tail risk events
- **Achievement System**: Progressive unlocking with XP-based leveling and milestone tracking
- **News Generation**: Dynamic narrative system with category-based news items and market impact

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon serverless database
- **drizzle-orm**: Type-safe ORM for database operations and schema management
- **@tanstack/react-query**: Server state management and caching for React

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (accordions, dialogs, forms, etc.)
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Type-safe variant handling for component styling
- **lucide-react**: Icon library for consistent UI iconography

### Development Tools
- **vite**: Fast build tool with HMR and optimized production builds
- **typescript**: Static type checking across the entire application
- **@replit/vite-plugin-***: Replit-specific development plugins for enhanced developer experience

### Potential AI Integration
- **Environment Variables**: Configured for MISTRAL_API_KEY suggesting planned AI integration for dynamic content generation (news articles, event descriptions)

### Database Configuration
- **Drizzle Kit**: Database migration and schema management tool
- **PostgreSQL**: Primary database with connection via DATABASE_URL environment variable
- **Migration System**: Schema versioning in dedicated migrations directory

### Form Handling
- **react-hook-form**: Form state management with validation
- **@hookform/resolvers**: Form validation resolvers for schema integration
- **zod**: Runtime type validation and schema definition