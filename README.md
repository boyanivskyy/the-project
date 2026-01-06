# Dataroom Management Application

A secure, modern dataroom management system built with Bun, React, and Convex. This application enables users to create and manage datarooms with hierarchical file and folder structures, role-based access control, and secure file storage.

## Features

- 🔐 **User Authentication** - Secure signup and login system
- 📁 **Dataroom Management** - Create and manage multiple datarooms
- 🗂️ **File & Folder Organization** - Hierarchical folder structure with file upload support
- 👥 **Access Control** - Role-based permissions (Owner, Admin, Editor, Viewer)
- 🔍 **Search** - Quick search across datarooms and files
- 👁️ **File Preview** - Preview files directly in the browser
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🌓 **Dark Mode** - Theme toggle support

## Tech Stack

- **Runtime**: [Bun](https://bun.com) - Fast all-in-one JavaScript runtime
- **Frontend**: React 19 with React Router 7
- **Backend**: [Convex](https://convex.dev) - Backend-as-a-Service with real-time database
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## Prerequisites

- [Bun](https://bun.sh) v1.3.5 or higher
- A [Convex](https://convex.dev) account (free tier available)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd the-project
```

2. Install dependencies:

```bash
bun install
```

## Setup

### 1. Convex Configuration

This project uses Convex for backend services. You'll need to set up a Convex project:

1. Install Convex CLI (if not already installed):

```bash
bunx convex dev
```

2. Follow the prompts to:
    - Create a new Convex project (or link to an existing one)
    - Configure your deployment

3. The Convex CLI will automatically:
    - Generate TypeScript types in `convex/_generated/`
    - Deploy your schema and functions
    - Provide environment variables

### 2. Environment Variables

Convex will automatically handle environment configuration. The frontend will connect to your Convex deployment automatically once configured.

## Development

Start the development server with hot reloading:

```bash
bun dev
```

The server will start at `http://localhost:3000` (or the next available port).

### Development Features

- **Hot Module Replacement (HMR)** - Instant updates in the browser
- **Console Logging** - Browser console logs appear in the terminal
- **TypeScript** - Full TypeScript support with type checking
- **Tailwind CSS** - Automatic CSS processing with the Bun Tailwind plugin

## Building for Production

Build the application for production:

```bash
bun run build
```

This will:

- Bundle all assets
- Minify JavaScript and CSS
- Output to the `dist/` directory

Run the production server:

```bash
bun start
```

### Build Options

The build script supports various options:

```bash
bun run build.ts --outdir=dist --minify --sourcemap=linked
```

Run `bun run build.ts --help` for all available options.

## Key Technologies

- **Bun** - Used for running the server, bundling, and package management
- **Convex** - Provides the database, authentication, file storage, and real-time updates
- **React Router** - Client-side routing with data loaders and error boundaries
- **Zustand** - Lightweight state management for UI state
- **shadcn/ui** - High-quality, accessible component library

## Database Schema

The application uses the following main entities:

- **users** - User accounts with authentication
- **datarooms** - Top-level containers for files and folders
- **dataroomAccess** - Access control with role-based permissions
- **folders** - Hierarchical folder structure
- **files** - File metadata and storage references

## Scripts

- `bun dev` - Start development server with HMR
- `bun start` - Run production server
- `bun run build` - Build for production
- `bunx convex dev` - Run Convex development mode

## License

[Add your license here]
