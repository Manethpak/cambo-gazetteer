# Cambodia Gazetteer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Data License: ODbL](https://img.shields.io/badge/Data%20License-ODbL-blue.svg)](https://opendatacommons.org/licenses/odbl/)

**Standardized geographical data for Cambodia's administrative divisions.** Free, open-source API and datasets for research, applications, and data analysis.

**🌐 Live API:** [https://cambo-gazetteer.manethpak.dev/](https://cambo-gazetteer.manethpak.dev/)  
**📚 Documentation:** [https://cambo-gazetteer.manethpak.dev/api/docs](https://cambo-gazetteer.manethpak.dev/api/docs)

---

## What You Get

**16,457 administrative units** with bilingual names (Khmer/English) and hierarchical codes:
- 25 Provinces & Municipalities
- 210 Districts
- 1,652 Communes  
- 14,570 Villages

**Access via:**
- REST API with full-text search (Khmer & English)
- JSON datasets (download and use offline)
- Administrative codes for database normalization

**Why it matters:** Cambodia's location data is fragmented—different spellings, no standardization, scattered across systems. This creates inconsistencies in government databases, business applications, and research. This project provides a single source of truth.

---

## Quick Start

**Use the API (no setup required):**
```bash
# Search for locations
curl "https://cambo-gazetteer.manethpak.dev/api/v1/search?q=Siem%20Reap"

# Get by administrative code
curl "https://cambo-gazetteer.manethpak.dev/api/v1/code/02"

# Autocomplete
curl "https://cambo-gazetteer.manethpak.dev/api/v1/search/autocomplete?q=Phnom"
```

**Download raw data:**  
Visit [cambo-gazetteer.manethpak.dev/data-source](https://cambo-gazetteer.manethpak.dev/data-source) for JSON/Excel datasets.

**Self-host (optional):**
```bash
git clone https://github.com/Manethpak/cambo-gazetteer.git
cd cambo-gazetteer
pnpm install && pnpm db:setup:local && pnpm dev
```

Full documentation: [cambo-gazetteer.manethpak.dev/api/docs](https://cambo-gazetteer.manethpak.dev/api/docs)

---

## Use Cases

**Research & Analytics**  
Clean, structured data for demographics, policy analysis, and academic research.

**Applications**  
Build address forms, location pickers, mapping tools, and geospatial applications.

**Data Integration**  
Standardize location data across government systems, business databases, and legacy applications.

**Validation**  
Verify user-entered addresses against authoritative administrative divisions.

---

## Administrative Codes

Replace fragmented storage (4-5 columns) with a single hierarchical code:

```
02        → Siem Reap Province
0202      → Siem Reap District  
020205    → Svay Leu Commune
02020501  → Specific Village
```

Each code lookup returns full details: Khmer name, English name, type, parent hierarchy.

---

## Data Sources

Sourced from [Open Development Cambodia](https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer) and validated against [NCDD Gazetteer](https://db.ncdd.gov.kh/gazetteer). Processed, normalized, and made accessible via API and downloadable datasets.

**Data License:** [ODbL](https://opendatacommons.org/licenses/odbl/) - Free to use with attribution.

---

## Contributing

Found an error? Want to improve the data? Contributions welcome.

1. Fork the repo
2. Make your changes
3. Submit a pull request

Report issues: [github.com/Manethpak/cambo-gazetteer/issues](https://github.com/Manethpak/cambo-gazetteer/issues)

---

## License

**Code:** MIT License  
**Data:** ODbL (Open Database License)

Attribution required when using the data. Credit both [Open Development Cambodia](https://opendevelopmentcambodia.net/) and this project.

---

## Author

**Maneth PAK**  
[manethpak.dev@gmail.com](mailto:manethpak.dev@gmail.com) | [GitHub](https://github.com/Manethpak)

---

<div align="center">

**Built for Cambodia's research and developer community**

⭐ Star this project if you find it useful

[Website](https://cambo-gazetteer.manethpak.dev/) • [API Docs](https://cambo-gazetteer.manethpak.dev/api/docs) • [Data Download](https://cambo-gazetteer.manethpak.dev/data-source) • [Issues](https://github.com/Manethpak/cambo-gazetteer/issues)

</div>
