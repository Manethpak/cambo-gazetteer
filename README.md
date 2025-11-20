# Cambodia Gazetteer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Open API for Cambodia's geographical data, providing access to provinces, districts, communes, and villages with full-text search capabilities.

## Inspiration

This project was created to address the lack of publicly accessible geographical data and APIs for Cambodia. With the hope that this will be a valuable resource for both local and international developers and researchers working on projects related to Cambodia's administrative divisions, location services, data analysis, and more.

## Features

- **RESTful API** - Query administrative divisions and geographical data
- **Full-Text Search** - FTS5-powered search with fuzzy matching
- **Autocomplete** - Typeahead suggestions for location queries
- **Hierarchical Data** - Navigate through administrative levels
- **Bilingual Support** - Khmer and English names
- **Interactive Docs** - OpenAPI/Scalar documentation
- **Edge Deployment** - Runs on Cloudflare Workers with D1 database

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Frontend**: React + Vite

## API Endpoints

- `GET /api/administrative/:code` - Get administrative unit by code
- `GET /api/administrative/provinces` - List all provinces
- `GET /api/administrative/:provinceCode/districts` - List districts in province
- `GET /api/code/:code` - Query by administrative code
- `GET /api/search?q={query}` - Full-text search with pagination
- `GET /api/autocomplete?q={query}` - Autocomplete suggestions
- `GET /api/stats` - Database statistics
- `GET /api/docs` - Interactive API documentation

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup local database
pnpm db:setup:local

# Run development server
pnpm dev

# Deploy to Cloudflare
pnpm deploy
```

## Database Management

```bash
# Generate migrations
pnpm db:generate

# Apply migrations (local)
pnpm db:migrate:local

# Apply migrations (remote)
pnpm db:migrate:remote

# Seed database
pnpm db:seed:local
```

## Data

The gazetteer contains **16,457** administrative units:
- 25 Provinces/Municipalities
- 210 Districts
- 1,652 Communes
- 14,570 Villages

Data sourced from:
- [Open Development Cambodia](https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer)
- [NCDD Gazetteer Database](https://db.ncdd.gov.kh/gazetteer)

See [public/data/README.md](public/data/README.md) for detailed data documentation.

## License

MIT License - see [LICENSE](LICENSE) file for details.

Data: Open Data Commons Open Database License (ODbL)

## Contributing

Contributions welcome! Open an issue or submit a PR.

## Author

**Maneth PAK** - [manethpak.dev@gmail.com](mailto:manethpak.dev@gmail.com)
