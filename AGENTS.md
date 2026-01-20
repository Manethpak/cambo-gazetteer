# Agent Guidelines for Cambo Gazetteer

This document provides essential project information for AI agents working on the Cambodia Gazetteer project.

## Project Overview

- **Stack**: TypeScript, Hono (API), React 19, Vite, Cloudflare Workers, Drizzle ORM, SQLite (D1)
- **Architecture**: Dual codebase - Worker API (`src/worker`) and React app (`src/react-app`)
- **Package Manager**: `pnpm` (always use `pnpm`, never `npm` or `yarn`)
- **Node Version**: >=20.0.0

## Project Structure

```
src/
├── worker/              # Cloudflare Worker (API backend) - See src/worker/AGENTS.md
│   ├── modules/         # Feature modules (routes + handlers + schemas)
│   ├── db/              # Database schema and queries
│   ├── utils/           # Utilities (pagination, caching, OpenAPI)
│   └── common/          # Common schemas and types
└── react-app/           # React frontend (documentation site) - See src/react-app/AGENTS.md
    ├── components/      # React components
    ├── pages/           # Route pages
    └── libs/            # Frontend utilities
```

## Build, Lint, and Test Commands

### Development
```bash
pnpm dev                  # Start development server
pnpm build                # TypeScript compile + Vite build
pnpm check                # Full validation: TypeScript + build + dry-run deploy
pnpm preview              # Build and preview production
```

### Linting & Formatting
```bash
pnpm lint                 # Run ESLint on all files
pnpm format               # Format with oxfmt (excludes .ts/.tsx/.js/.jsx)
```

### Database Operations
```bash
pnpm db:generate          # Generate Drizzle migrations
pnpm db:migrate:local     # Apply migrations locally
pnpm db:migrate:remote    # Apply migrations to remote D1
pnpm db:seed:local        # Seed local database
pnpm db:seed:remote       # Seed remote database
pnpm db:setup:local       # Migrate + seed local (full setup)
pnpm db:setup:remote      # Migrate + seed remote (full setup)
pnpm db:studio            # Launch Drizzle Studio
pnpm db:clean             # Clean database
```

### Deployment
```bash
pnpm deploy               # Deploy to Cloudflare Workers
pnpm cf-typegen           # Generate Cloudflare types
```

### Scripts
```bash
pnpm etl                  # Run ETL script (data processing)
```

**Note**: There are no test commands currently configured. When adding tests, prefer Vitest (aligns with Vite).

## General Code Style

### Path Aliases
- Worker code: Use `~/*` for `./src/worker/*`
- React code: Use `@/*` for `./src/react-app/*`

### TypeScript Configuration
- Strict mode enabled with all strictness flags
- Use explicit types for function parameters and return values
- Prefer `type` over `interface` unless extending is needed
- Use Zod schemas for validation and type inference

### Formatting (EditorConfig)
- Indent: 2 spaces (not tabs)
- End of line: LF
- Charset: UTF-8
- ESLint for TypeScript/JavaScript
- `oxfmt` for other files

### Naming Conventions
- Variables & functions: camelCase
- React components & types: PascalCase
- Constants: UPPER_CASE
- Database tables/columns: snake_case

## Additional Notes

- **Cloudflare Workers**: Always test locally with `wrangler` before deploying
- **Database migrations**: Generate with Drizzle Kit, apply with Wrangler
- **Data sources**: ODC + NCDD Gazetteer (see README)
- **Licenses**: Code is MIT, Data is ODbL (requires attribution)

## Module-Specific Guidelines

For detailed code style guidelines specific to each module:
- **Worker API**: See `src/worker/AGENTS.md`
- **React App**: See `src/react-app/AGENTS.md`
