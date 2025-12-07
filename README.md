# Cambodia Gazetteer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data License: ODbL](https://img.shields.io/badge/Data%20License-ODbL-blue.svg)](https://opendatacommons.org/licenses/odbl/)

> **Cambodia's Modern Geographical Data API** - A comprehensive, open-source API providing access to Cambodia's provinces, districts, communes, and villages with full-text search capabilities.

**🌐 Live Website:** [https://cambo-gazetteer.manethpak.dev/](https://cambo-gazetteer.manethpak.dev/)  
**📚 API Documentation:** [https://cambo-gazetteer.manethpak.dev/api/docs](https://cambo-gazetteer.manethpak.dev/api/docs)

---

## Why This Exists

Location data in Cambodia is **fragmented across systems, mistranslated across languages, and stored in inconsistent ways**. This creates real problems for developers, businesses, and government agencies trying to build reliable systems.

### The Problem: Fragmented Data

Every time you fill out a form with your address in Cambodia, you encounter inconsistencies. When developers store this data, they struggle with:

**1. Mistranslation & Inconsistency**
- The same location is written differently across systems
- District names have multiple English spellings with no standardized source of truth
- Examples:
  - "Mongkol Borei" vs "Mongkol Borey" vs "Mongkul Bourey"
  - "Siem Reap District" vs "Krong Siem Reap" vs "ក្រុងសៀមរាប"
  - "Svay Leu" vs "ឃុំស្វាយលើ" (no English equivalent)

**2. Fragmented Database Storage**
- Applications store location data across 4-5 separate columns (province, district, commune, village)
- This creates redundant schemas and makes querying difficult
- No standardized administrative codes or IDs

**3. Data Quality Issues**
- Without a standard, location data becomes unreliable
- Free-text fields lead to typos, incomplete data, and no way to validate against authoritative sources
- No way to detect or correct address mismatches

**Real-World Impact:** Government databases store citizen addresses as free-text strings in Khmer. Each field is manually entered, leading to inconsistent spelling, no validation, difficult querying, and translation errors when converting between Khmer and English systems.

### The Solution: Single Unified Code

Instead of storing fragmented data across multiple columns, **use a single administrative code**. One code contains everything—location name in Khmer & English, hierarchy, and metadata.

**Code Structure:**
```
Province:  02        → Siem Reap Province
District:  0202      → Siem Reap District
Commune:   020205    → Svay Leu Commune
Village:   02020501  → Specific Village
```

**Before vs After:**

| Traditional Approach | Cambodia Gazetteer |
|---------------------|-------------------|
| 4-5 separate columns | Single `administrative_code` field |
| Manual string matching | API lookup with validation |
| Prone to typos and inconsistency | Standardized, immutable codes |
| No hierarchy traversal | Built-in parent-child relationships |
| Difficult to search | FTS5 full-text search with autocomplete |

---

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Manethpak/cambo-gazetteer.git
cd cambo-gazetteer

# Install dependencies
pnpm install
```

### 2. Database Setup

```bash
# Setup local database (migrate + seed)
pnpm db:setup:local
```

### 3. Development Server

```bash
# Run development server
pnpm dev

# Visit http://localhost:5173
```

### 4. Try the API

```bash
# Search for a location
curl "http://localhost:5173/api/v1/search?q=Siem%20Reap"

# Get a specific administrative unit by code
curl "http://localhost:5173/api/v1/code/02"

# Autocomplete suggestions
curl "http://localhost:5173/api/v1/search/autocomplete?q=Phnom"
```

---

## API Endpoints

### Administrative Data
- `GET /api/v1/administrative/:code` - Get administrative unit by code
- `GET /api/v1/administrative/provinces` - List all provinces and municipalities
- `GET /api/v1/administrative/:provinceCode/districts` - List districts in a province
- `GET /api/v1/administrative/:provinceCode/:districtCode/communes` - List communes in a district
- `GET /api/v1/administrative/:provinceCode/:districtCode/:communeCode/villages` - List villages in a commune

### Code Lookup
- `GET /api/v1/code/:code` - Query by administrative code (supports all levels)

### Search
- `GET /api/v1/search?q={query}` - Full-text search with pagination (Khmer & English)
- `GET /api/v1/search/autocomplete?q={query}` - Autocomplete suggestions (limit 10)

### Statistics
- `GET /api/v1/stats` - Database statistics and counts by type

### Documentation
- `GET /api/docs` - Interactive API documentation (Scalar UI)

**📚 Full API Documentation:** [https://cambo-gazetteer.manethpak.dev/api/docs](https://cambo-gazetteer.manethpak.dev/api/docs)

---

## Usage Examples

### Search for a Location

```bash
curl "https://cambo-gazetteer.manethpak.dev/api/v1/search?q=Siem%20Reap&limit=5"
```

**Response:**
```json
{
  "data": [
    {
      "code": "02",
      "name_km": "ខេត្តសៀមរាប",
      "name_en": "Siem Reap",
      "type": "province",
      "parent_code": null
    },
    {
      "code": "0202",
      "name_km": "ក្រុងសៀមរាប",
      "name_en": "Siem Reap",
      "type": "district",
      "parent_code": "02"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 47
  }
}
```

### Get Province Details

```bash
curl "https://cambo-gazetteer.manethpak.dev/api/v1/code/02"
```

### Autocomplete for Dropdowns

```bash
curl "https://cambo-gazetteer.manethpak.dev/api/v1/search/autocomplete?q=Phnom"
```

**Response:**
```json
{
  "data": [
    {
      "code": "12",
      "name_km": "រាជធានីភ្នំពេញ",
      "name_en": "Phnom Penh",
      "type": "municipality"
    }
  ]
}
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Cloudflare Workers** | Serverless edge runtime for global low-latency API responses |
| **Hono.js** | Lightweight, fast web framework with excellent TypeScript support |
| **Cloudflare D1** | SQLite-based distributed database at the edge |
| **Drizzle ORM** | Type-safe ORM with automatic schema inference |
| **TypeScript** | End-to-end type safety and developer experience |
| **React + Vite** | Modern frontend with fast HMR for the documentation website |
| **Tailwind CSS** | Utility-first styling for the UI |
| **SQLite FTS5** | Full-text search extension for fast bilingual search |

---

## Database Schema

The database uses a single `administrative_units` table with hierarchical codes:

```sql
CREATE TABLE administrative_units (
  code TEXT PRIMARY KEY,           -- Hierarchical code (02, 0202, 020205, etc.)
  name_km TEXT NOT NULL,           -- Khmer name
  name_en TEXT,                    -- English name
  type TEXT NOT NULL,              -- province, district, commune, village
  parent_code TEXT,                -- References parent unit
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE administrative_units_fts USING fts5(
  code, name_km, name_en, type,
  content='administrative_units'
);
```

---

## Data

### Dataset Statistics

The gazetteer contains **16,457** administrative units:
- **1 Capital** (Municipality)
- **24 Provinces**
- **210 Districts** (ស្រុក/ក្រុង)
- **1,652 Communes** (ឃុំ/សង្កាត់)
- **14,570 Villages** (ភូមិ)

### Data Sources

The geographical data used in this project is sourced from:
- **[Open Development Cambodia (ODC)](https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer)** - Primary data source
- **[NCDD Gazetteer Database](https://db.ncdd.gov.kh/gazetteer)** - Validation and cross-reference

We have processed, normalized, and validated this data to provide a developer-friendly API with consistent bilingual support.

### Download Raw Data

Visit **[https://cambo-gazetteer.manethpak.dev/data-source](https://cambo-gazetteer.manethpak.dev/data-source)** to download:
- `gazetteer-normalized.json` - Flat list of all administrative units (~1.8 MB)
- `provinces.json` - List of provinces and municipalities (~5 KB)
- `gazetteer-stats.json` - Summary statistics (~1 KB)
- `2024.10.14.xlsx` - Original Excel dataset from ODC (~1.5 MB)

See **[public/data/README.md](public/data/README.md)** for detailed data documentation.

---

## Development

### Database Management

```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations (local)
pnpm db:migrate:local

# Apply migrations (remote/production)
pnpm db:migrate:remote

# Seed database (local)
pnpm db:seed:local

# Seed database (remote)
pnpm db:seed:remote

# Complete setup (migrate + seed)
pnpm db:setup:local
pnpm db:setup:remote

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Clean database
pnpm db:clean
```

### Data Processing

```bash
# Run ETL pipeline (extract, transform, load)
pnpm etl

# Generate seed SQL file
pnpm db:seed:generate
```

### Code Quality

```bash
# Lint code
pnpm lint

# Format code (oxfmt)
pnpm format

# Type check + build check
pnpm check
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy

# Dry-run deployment (test)
pnpm check
```

---

## Deployment

This project is designed to run on **Cloudflare Workers** with **D1 Database**.

### Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
3. Node.js >= 20.0.0

### Setup

1. **Create D1 Database:**
   ```bash
   wrangler d1 create cambo-gazetteer
   ```

2. **Update `wrangler.json`** with your database ID:
   ```json
   {
     "database_id": "your-database-id-here"
   }
   ```

3. **Run Migrations:**
   ```bash
   pnpm db:migrate:remote
   ```

4. **Seed Database:**
   ```bash
   pnpm db:seed:remote
   ```

5. **Deploy:**
   ```bash
   pnpm deploy
   ```

Your API will be live at `https://cambo-gazetteer.<your-subdomain>.workers.dev`

---

## Use Cases

### 1. Address Forms with Autocomplete
Build dropdown menus for provinces, districts, communes, and villages with real-time search suggestions.

### 2. Location-Based Analytics
Aggregate and analyze data by administrative divisions with standardized codes.

### 3. Government Systems Integration
Integrate with citizen databases, land registration, or public service systems requiring standardized location data.

### 4. Mapping Applications
Build interactive maps with accurate administrative boundaries and hierarchical data.

### 5. Data Validation
Validate user-entered addresses against authoritative administrative divisions.

### 6. Research & Data Analysis
Access clean, structured geographical data for research, demographics, or policy analysis.

---

## Contributing

Contributions are welcome! Whether it's bug fixes, new features, documentation improvements, or data corrections.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Reporting Issues

Found a bug or data error? [Open an issue](https://github.com/Manethpak/cambo-gazetteer/issues) with:
- Clear description of the problem
- Steps to reproduce (if applicable)
- Expected vs actual behavior
- Screenshots or API responses (if relevant)

### Code Style

This project uses:
- **ESLint** for JavaScript/TypeScript linting
- **oxfmt** for code formatting
- **Husky** for pre-commit hooks

Run `pnpm lint` and `pnpm format` before committing.

---

## License

### Code

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Copyright (c) 2024 Maneth PAK
```

### Data

The geographical data is licensed under the **Open Data Commons Open Database License (ODbL)**.

**Attribution:**
- Data sourced from [Open Development Cambodia](https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer)
- Processed and normalized by Cambodia Gazetteer project

When using this data, please provide attribution to both Open Development Cambodia and this project.

---

## Roadmap

- [ ] Add GeoJSON support for administrative boundaries
- [ ] Implement caching layer for frequently accessed data
- [ ] Add support for historical administrative divisions
- [ ] Create client libraries (JavaScript, Python, PHP)
- [ ] Add GraphQL endpoint
- [ ] Multi-language support (French, Chinese)
- [ ] Add postal codes and geographic coordinates
- [ ] Community-driven data corrections and updates

---

## Author

**Maneth PAK**  
📧 [manethpak.dev@gmail.com](mailto:manethpak.dev@gmail.com)  
🌐 [https://cambo-gazetteer.manethpak.dev/](https://cambo-gazetteer.manethpak.dev/)  
💻 [GitHub](https://github.com/Manethpak)

---

## Acknowledgments

- **[Open Development Cambodia](https://opendevelopmentcambodia.net/)** - For providing the original dataset
- **[NCDD](https://db.ncdd.gov.kh/)** - For maintaining the official gazetteer database
- **Cambodian Developer Community** - For feedback and support
- **Cloudflare** - For the Workers and D1 platform

---

## Links

- **🌐 Website:** [https://cambo-gazetteer.manethpak.dev/](https://cambo-gazetteer.manethpak.dev/)
- **📚 API Docs:** [https://cambo-gazetteer.manethpak.dev/api/docs](https://cambo-gazetteer.manethpak.dev/api/docs)
- **🔍 Why This Project:** [https://cambo-gazetteer.manethpak.dev/why](https://cambo-gazetteer.manethpak.dev/why)
- **📊 Data Sources:** [https://cambo-gazetteer.manethpak.dev/data-source](https://cambo-gazetteer.manethpak.dev/data-source)
- **🐛 Issues:** [https://github.com/Manethpak/cambo-gazetteer/issues](https://github.com/Manethpak/cambo-gazetteer/issues)

---

<div align="center">

**Made with ❤️ for Cambodia's developer community**

If this project helps you, please consider giving it a ⭐ on GitHub!

</div>
