# Excel File Consolidation Application

## Overview

This is a web-based Excel file consolidation tool designed for Korean users. The application enables users to merge dispatch records (배차내역) with sales lists (매출리스트) into a standardized format. Built as a full-stack TypeScript application, it processes multiple Excel files, matches records by cargo number (화물번호), and generates a unified output file for download.

The application follows a utility-focused design approach optimized for data processing workflows, emphasizing clarity and efficiency in file handling operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite build system

**UI Component System**: 
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library with "new-york" style preset
- Tailwind CSS for utility-first styling with custom design tokens
- Material Design principles adapted for Korean UI optimization

**Design System**:
- Korean-optimized typography using Pretendard font family via CDN
- Custom color palette with light/dark mode support using HSL color space
- Consistent spacing system based on Tailwind's scale (4px increments)
- Elevated interaction states using CSS custom properties for hover/active effects

**State Management**:
- TanStack Query (React Query) for server state management
- Local React state for UI interactions and file management
- Custom hooks for mobile detection and toast notifications

**Routing**: Wouter for lightweight client-side routing

**File Processing**: 
- SheetJS (xlsx) library for client-side Excel file parsing and generation
- FormData API for multipart file uploads
- Blob API for generating downloadable Excel files

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Design**:
- RESTful endpoint at `/api/merge-excel` accepting multipart/form-data
- Multer middleware for file upload handling with memory storage
- File validation for Excel formats (.xlsx, .xls)
- 10MB file size limit per upload

**Excel Processing Logic**:
- SheetJS library for server-side Excel parsing
- Custom normalization functions for dates, numbers, and text values
- Record matching algorithm based on cargo number (화물번호)
- Data transformation pipeline producing standardized 7-column output

**Development Tooling**:
- Vite middleware for HMR in development mode
- TSX for TypeScript execution without compilation
- ESBuild for production bundling

### Data Storage Solutions

**Current Implementation**: PostgreSQL database for persistent storage of merged file history

**Database Schema**:
- `saved_merged_files` table: Stores merged Excel file results with metadata
  - Columns: id, name, description, createdAt, totalRecords, matchedRecords, unmatchedRecords, data (JSONB), sourceFiles (JSONB)

**Database Configuration**: 
- Drizzle ORM configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts`
- Neon serverless driver for database connectivity via `server/db.ts`
- Migration support via drizzle-kit (`npm run db:push`)
- Storage interface in `server/storage.ts` with methods: saveMergedFile, getSavedFiles, getSavedFileById, deleteSavedFile

**Session Management**: Stateless - each request is independent (no user authentication yet)

### External Dependencies

**Third-Party Services**:
- CDN: jsDelivr for Pretendard Korean font delivery

**NPM Packages**:
- **UI Components**: @radix-ui/* suite (18 component primitives)
- **Styling**: tailwindcss, autoprefixer, class-variance-authority, clsx, tailwind-merge
- **Data Processing**: xlsx (SheetJS), date-fns for date manipulation
- **File Handling**: multer for multipart uploads
- **Validation**: zod for schema validation, drizzle-zod for database schema integration
- **Development**: vite, tsx, esbuild, @replit/vite-plugin-* (runtime error overlay, cartographer, dev banner)

**Database**:
- PostgreSQL via @neondatabase/serverless
- Drizzle ORM for type-safe database queries
- Session store: connect-pg-simple (configured but unused)

**Type Safety**:
- Shared TypeScript schemas between client and server via `@shared` path alias
- Zod schemas for runtime validation matching TypeScript types
- Strict TypeScript configuration with incremental compilation

**Development Environment Optimizations**:
- Replit-specific plugins for enhanced development experience
- Source map support via @jridgewell/trace-mapping
- Path aliases: `@/` (client), `@shared/` (shared), `@assets/` (assets)