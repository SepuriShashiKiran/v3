# 3D Adventure Game - The Hyderabad Chronicles

## Project Overview

This is a 3D adventure game with a spy thriller theme featuring a teenage journalist named Ayaan Malik. The game is built using React, Three.js (via React Three Fiber), and Express.js with PostgreSQL database support.

## Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **3D Rendering**: React Three Fiber (@react-three/fiber) with Three.js
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with custom animations
- **Audio**: Howler.js for game audio
- **State Management**: Zustand stores for game state
- **Build Tool**: Vite with GLSL shader support

### Backend (Server)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Vite middleware for hot reloading

### Project Structure
```
├── client/                 # Frontend React application
│   ├── public/            # Static assets (models, textures, sounds)
│   └── src/
│       ├── components/    # React components (Game, Player, Enemy, etc.)
│       ├── lib/          # Utilities, stores, and constants
│       └── pages/        # Route pages
├── server/                # Backend Express application
├── shared/               # Shared types and schemas
└── migrations/           # Database migration files
```

## Development Setup

### Database
- PostgreSQL database is configured with environment variables
- Using Drizzle ORM for database operations
- User authentication schema implemented

### Key Features
- 3D game environment with physics
- Character controls (WASD movement, gadgets, hacking)
- Mission-based gameplay
- Audio system with background music and effects
- Real-time 3D rendering with shadows and post-processing

## Recent Changes (2025-09-23)

### Project Import and Setup
- Installed all project dependencies via npm
- Configured PostgreSQL database connection
- Updated Vite configuration to allow all hosts (required for Replit proxy)
- Set up development workflow on port 5000
- Configured deployment for autoscale target
- Verified TypeScript compilation without errors
- Confirmed Vite hot reloading is working

### Configuration Updates
- Added `allowedHosts: true` to Vite server config for Replit compatibility
- Configured Express server to bind to 0.0.0.0:5000
- Set up build and production deployment commands

## User Preferences
- No specific user preferences recorded yet

## Deployment
- **Target**: Autoscale deployment
- **Build**: `npm run build` (Vite build + esbuild server bundling)
- **Start**: `npm run start` (production Node.js server)
- **Port**: 5000 (both development and production)