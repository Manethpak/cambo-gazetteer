# Cambodia Gazetteer Improvement Plan

> Generated: January 2026

## Current State

The project is well-architected with a modern tech stack:
- **Backend:** Cloudflare Workers + Hono + D1 (SQLite) + Drizzle ORM
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Search:** FTS5 full-text search (bilingual Khmer/English)
- **Data:** 16,457 administrative units across 25 provinces
- **Docs:** OpenAPI with Scalar UI

---

## Phase 1: User Experience Improvements

Focus on making the website more engaging and useful for end users.

### 1.1 Interactive Map (High Priority)

**Why:** Users expect visual geographic representation for a location-based website.

**Tasks:**
- [ ] Install MapLibre GL JS (free, open-source, no API keys)
- [ ] Add map component to homepage showing Cambodia with province boundaries
- [ ] Implement click-to-zoom: Province → Districts → Communes
- [ ] Highlight search results on map with fly-to animation
- [ ] Add "Use my location" geolocation feature
- [ ] Source GeoJSON boundary data (GADM, OpenStreetMap, or HDX)

**Libraries:**
```bash
pnpm add maplibre-gl
pnpm add -D @types/maplibre-gl
```

---

### 1.2 Live Autocomplete Search (High Priority)

**Why:** Current search requires form submission. Live autocomplete is the modern standard.

**Tasks:**
- [ ] Add debounced search (250ms delay) that triggers on keypress
- [ ] Show dropdown with top 5-10 suggestions as user types
- [ ] Display location type badges (Province/District/Commune/Village)
- [ ] Show breadcrumb path in suggestions (e.g., "Battambang > Sangkat...")
- [ ] Keyboard navigation (arrow keys + enter to select)
- [ ] Store recent searches in localStorage (last 5)

---

### 1.3 Individual Location Pages (High Priority)

**Why:** SEO discoverability + shareable links + Google indexing.

**Tasks:**
- [ ] Create route: `/location/:code` or `/provinces/:slug/`
- [ ] Design location detail page with:
  - Location name (Khmer + English)
  - Administrative type and hierarchy breadcrumb
  - Postal code (if available)
  - Child locations list (e.g., districts within a province)
  - Parent location link
  - Copy code/share buttons
  - Map showing location (when available)
- [ ] Add JSON-LD structured data for SEO (see below)
- [ ] Generate URL slugs from English names

**URL Structure Options:**
```
Option A (code-based): /location/0102
Option B (hierarchical): /provinces/phnom-penh/districts/chamkar-mon/
```

---

### 1.4 JSON-LD Structured Data (Medium Priority)

**Why:** Helps Google understand your content and show rich snippets in search results.

**What is JSON-LD?**
JSON-LD (JavaScript Object Notation for Linked Data) is invisible metadata embedded in your HTML that search engines read to understand page content.

**Tasks:**
- [ ] Add JSON-LD script to each location page
- [ ] Include: Place name, postal code, country, hierarchy
- [ ] Add breadcrumb structured data

**Example Implementation:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Place",
  "name": "Phnom Penh",
  "alternateName": "ភ្នំពេញ",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Phnom Penh",
    "addressRegion": "Phnom Penh",
    "postalCode": "12000",
    "addressCountry": "KH"
  },
  "containedInPlace": {
    "@type": "Country",
    "name": "Cambodia"
  }
}
</script>
```

---

### 1.5 UI/UX Enhancements (Medium Priority)

**Tasks:**
- [ ] Add breadcrumb navigation on all pages
- [ ] Improve search results with postal code display
- [ ] Add "Copy link" and "Share" buttons
- [ ] Show location hierarchy visually (tree or breadcrumb)
- [ ] Add loading skeletons for better perceived performance
- [ ] Fix mobile menu dead link (`/why` route doesn't exist)

---

### 1.6 Postal Code Features (Medium Priority)

**Why:** Postal code lookup is a primary use case but currently underutilized.

**Tasks:**
- [ ] Add postal code search endpoint: `GET /api/v1/postcodes/:code`
- [ ] Display postal code prominently in search results
- [ ] Create postal code lookup page/section
- [ ] Allow search by postal code (e.g., searching "12000" returns Phnom Penh)

---

## Phase 2: Developer Experience Improvements (Future)

*To be implemented after Phase 1 is complete.*

### 2.1 Developer Documentation Page
- [ ] Create `/developers` route with comprehensive docs
- [ ] Add quick start guide (5-minute tutorial)
- [ ] Include code examples: cURL, JavaScript, Python, PHP
- [ ] Document all endpoints with request/response examples
- [ ] Add error code reference

### 2.2 API Improvements
- [ ] Fix versioning: Move `/api/search` → `/api/v1/search`
- [ ] Fix OpenAPI title (currently shows "Hono")
- [ ] Add rate limit headers (`X-RateLimit-*`)
- [ ] Create bulk lookup endpoint: `POST /api/v1/codes`
- [ ] Add GeoJSON export format option

### 2.3 Developer Tools
- [ ] Interactive API playground/sandbox
- [ ] SDK packages (npm, pip)
- [ ] Embeddable address picker widget
- [ ] Webhook support for data updates

---

## Phase 3: Data & Infrastructure (Future)

### 3.1 Data Enhancements
- [ ] Add latitude/longitude coordinates
- [ ] Obtain GeoJSON boundary polygons
- [ ] Add alternative names/spellings
- [ ] Implement reverse geocoding (coordinates → location)

### 3.2 Infrastructure
- [ ] Add rate limiting (100 req/hr anonymous, 1000 with API key)
- [ ] Implement optional API key registration
- [ ] Add monitoring and analytics
- [ ] Generate sitemap.xml for SEO
- [ ] Add unit and integration tests

---

## Quick Wins (Can Do Immediately)

These require minimal effort but improve quality:

| Task | Effort | Impact |
|------|--------|--------|
| Fix mobile menu `/why` dead link | 5 min | Prevents user confusion |
| Show postal code in search results | 15 min | Better utility |
| Fix OpenAPI title to "Cambodia Gazetteer API" | 5 min | Professionalism |
| Add breadcrumb to Explore page | 30 min | Better navigation |

---

## Recommended Implementation Order

### Week 1-2: Core UX
1. Live autocomplete search with debounce
2. Individual location pages (basic version)
3. Fix quick wins (dead links, OpenAPI title)

### Week 3-4: Map & Visual
4. MapLibre GL JS integration
5. Province boundaries on map
6. Search result highlighting on map

### Week 5-6: SEO & Polish
7. JSON-LD structured data
8. URL slugs for locations
9. Breadcrumb navigation
10. Sitemap generation

---

## Resources

### Map Data Sources
- **GADM:** https://gadm.org/download_country.html (Cambodia admin boundaries)
- **Geofabrik:** https://download.geofabrik.de/asia/cambodia.html (OSM extracts)
- **HDX:** https://data.humdata.org/dataset/cod-ab-khm (UN OCHA boundaries)

### Libraries
- **MapLibre GL JS:** https://maplibre.org/maplibre-gl-js/docs/
- **React MapLibre:** https://visgl.github.io/react-map-gl/

### Schema.org References
- **Place:** https://schema.org/Place
- **PostalAddress:** https://schema.org/PostalAddress
- **BreadcrumbList:** https://schema.org/BreadcrumbList

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Google-indexed pages | 1,000+ location pages |
| Organic search traffic | 500+ monthly visits |
| API requests | 10,000+ monthly |
| Average session duration | > 2 minutes |
| Bounce rate | < 60% |
