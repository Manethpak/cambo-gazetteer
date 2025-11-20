This document provides information about the geographical data sources used in this project, as well as detailed documentation on the ETL (Extract, Transform, Load) process that converts raw data into structured JSON formats.

# Table of Contents
- [Data Sources](#data-sources)
  - [Primary Sources](#primary-sources)
    - [Open Development Cambodia - Cambodia Gazetteer Dataset](#open-development-cambodia---cambodia-gazetteer-dataset)
    - [NCDD Gazetteer Database](#ncdd-gazetteer-database)
  - [Data Attributes](#data-attributes)
  - [Data Usage](#data-usage)
  - [Data Accuracy](#data-accuracy)
- [ETL Process Documentation](#etl-process-documentation)
  - [Overview](#overview)
  - [Source Data](#source-data)
  - [Running the ETL Script](#running-the-etl-script)
  - [Output Files](#output-files)
    - [1. `gazetteer-normalized.json`](#1-gazetteer-normalizedjson)
    - [2. `gazetteer-hierarchical.json`](#2 -gazetteer-hierarchicaljson)
    - [3. `gazetteer-stats.json`](#3-gazetteer-statsjson)
  - [Data Statistics](#data-statistics)
  - [Administrative Hierarchy](#administrative-hierarchy)
  - [Code Structure](#code-structure)
    - [Administrative Codes](#administrative-codes)
    - [Type Mapping](#type-mapping)
  - [Database Schema Recommendations](#database-schema-recommendations)
    - [Normalized Schema (Recommended)](#normalized-schema-recommended)
    - [Separate Tables (Alternative)](#separate-tables-alternative)
  - [Loading Data into Database](#loading-data-into-database)
    - [PostgreSQL Example](#postgresql-example)
    - [Node.js Example](#nodejs-example)
  - [API Query Examples](#api-query-examples)
  - [Data Quality](#data-quality)
  - [Troubleshooting](#troubleshooting)
    - [Empty districts array in hierarchical output](#empty-districts-array-in-hierarchical-output)
    - [Missing data](#missing-data)
    - [Character encoding issues](#character-encoding-issues)
  - [License](#license)
  - [Maintenance](#maintenance)
  - [Contact](#contact)

# Data Sources

The geographical data for this project is sourced from:

## Primary Sources

### Open Development Cambodia - Cambodia Gazetteer Dataset

- **URL**: [Cambodia Gazetteer Dataset](https://data.opendevelopmentcambodia.net/dataset/cambodia-gazetteer)
- **Publisher**: Open Development Cambodia (ODC)
- **License**: Open Data Commons Open Database License (ODbL)
- **Format**: CSV, GeoJSON, Shapefile
- **Coverage**: All administrative divisions of Cambodia (Provinces, Districts, Communes, Villages)
- **Last Modified**: 2020-06-30
- **Description**: Comprehensive geographical information about Cambodia's administrative divisions including coordinates, names in Khmer and English, and administrative codes.

### NCDD Gazetteer Database

- **URL**: [National Committee for Sub-National Democratic Development](https://db.ncdd.gov.kh/gazetteer/view/index.castle)
- **Publisher**: National Committee for Sub-National Democratic Development (NCDD)
- **Authority**: Official government database
- **Description**: Authoritative gazetteer information for Cambodia's provinces, districts, communes, and villages with official administrative codes and hierarchical structures.

## Data Attributes

The dataset includes:

- Administrative codes (Province, District, Commune, Village codes)
- Names in Khmer (Unicode) and English (Romanized)
- Geographical coordinates (Latitude/Longitude)
- Administrative hierarchy and relationships
- Population statistics (where available)

## Data Usage

This data is used in accordance with the Open Data Commons Open Database License (ODbL), which allows:

- Free use and redistribution
- Production of derivative works
- Commercial and non-commercial use

Attribution is provided as required by the license terms.

## Data Accuracy

The data represents administrative divisions as of the last update date. For the most current information, please refer to the official NCDD Gazetteer Database.

---

# ETL Process Documentation

## Overview

This ETL (Extract, Transform, Load) script processes Cambodia's gazetteer data from an Excel file into structured JSON formats suitable for database insertion and API consumption.

## Source Data

**File**: `2024.10.14.xlsx`

The Excel file contains 25 sheets, one for each province/municipality in Cambodia:
- Each sheet contains administrative divisions (districts, communes, villages)
- Data includes Khmer and Latin names, administrative codes, and reference information
- Hierarchical structure based on administrative codes

## Running the ETL Script

```bash
pnpm etl
```

## Output Files

The script generates three JSON files:

### 1. `gazetteer-normalized.json` (4.0MB)
Flat, normalized structure ideal for database insertion.

**Structure**:
```json
[
  {
    "code": "01",
    "name_km": "បន្ទាយមានជ័យ",
    "name_en": "Banteay Meanchey",
    "type": "province",
    "parent_code": null
  },
  {
    "code": "102",
    "name_km": "មង្គលបូរី",
    "name_en": "Mongkol Borei",
    "type": "district",
    "parent_code": "01",
    "reference": "ប្រកាសលេខ ៤៩៣ប្រ.ក"
  }
]
```

**Fields**:
- `code`: Administrative code (unique identifier)
- `name_km`: Name in Khmer (Unicode)
- `name_en`: Name in English (Latin script)
- `type`: One of: `province`, `municipality`, `district`, `commune`, `village`
- `parent_code`: Code of the parent administrative unit
- `reference`: (optional) Official reference document
- `official_note`: (optional) Official notes
- `checker_note`: (optional) Checker's notes

### 2. `gazetteer-hierarchical.json` (461KB)
Nested, hierarchical structure for easy browsing and understanding relationships.

**Structure**:
```json
[
  {
    "code": "01",
    "name_km": "បន្ទាយមានជ័យ",
    "name_en": "Banteay Meanchey",
    "type": "province",
    "districts": [
      {
        "code": "102",
        "name_km": "មង្គលបូរី",
        "name_en": "Mongkol Borei",
        "type": "district",
        "parent_code": "01",
        "communes": [
          {
            "code": "10201",
            "name_km": "បន្ទាយនាង",
            "name_en": "Banteay Neang",
            "type": "commune",
            "parent_code": "102",
            "villages": [...]
          }
        ]
      }
    ]
  }
]
```

### 3. `gazetteer-stats.json`
Summary statistics about the extracted data.

**Example**:
```json
{
  "total_units": 16457,
  "provinces": 25,
  "districts": 210,
  "communes": 1652,
  "villages": 14570,
  "generated_at": "2025-11-11T08:05:32.343Z"
}
```

## Data Statistics

- **Total Administrative Units**: 16,457
- **Provinces/Municipalities**: 25
- **Districts**: 210
- **Communes**: 1,652
- **Villages**: 14,570

## Administrative Hierarchy

```
Cambodia
├── Province/Municipality (25)
    ├── District (ស្រុក/ក្រុង)
        ├── Commune (ឃុំ/សង្កាត់)
            └── Village (ភូមិ)
```

## Code Structure

### Administrative Codes
- **Province**: 2 digits (e.g., `01`, `12`, `25`)
- **District**: 3 digits (e.g., `102`, `201`, `1201`)
- **Commune**: 5 digits (e.g., `10201`, `20101`)
- **Village**: 7 digits (e.g., `1020101`, `2010101`)

### Type Mapping

| Khmer | English | Description |
|-------|---------|-------------|
| ស្រុក | district | Rural district |
| ក្រុង | district | Urban district (Khan) |
| ឃុំ | commune | Rural commune |
| សង្កាត់ | commune | Urban commune (Sangkat) |
| ភូមិ | village | Village |

## Database Schema Recommendations

### Normalized Schema (Recommended)

```sql
CREATE TABLE administrative_units (
  code VARCHAR(10) PRIMARY KEY,
  name_km VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  parent_code VARCHAR(10),
  reference TEXT,
  official_note TEXT,
  checker_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_code) REFERENCES administrative_units(code),
  INDEX idx_type (type),
  INDEX idx_parent (parent_code)
);
```

### Separate Tables (Alternative)

```sql
CREATE TABLE provinces (
  code VARCHAR(2) PRIMARY KEY,
  name_km VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL
);

CREATE TABLE districts (
  code VARCHAR(4) PRIMARY KEY,
  name_km VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  province_code VARCHAR(2) NOT NULL,
  FOREIGN KEY (province_code) REFERENCES provinces(code)
);

CREATE TABLE communes (
  code VARCHAR(5) PRIMARY KEY,
  name_km VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  district_code VARCHAR(4) NOT NULL,
  FOREIGN KEY (district_code) REFERENCES districts(code)
);

CREATE TABLE villages (
  code VARCHAR(7) PRIMARY KEY,
  name_km VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  commune_code VARCHAR(5) NOT NULL,
  FOREIGN KEY (commune_code) REFERENCES communes(code)
);
```

## Loading Data into Database

### PostgreSQL Example

```bash
# Using psql with JSON functions
psql -d your_database -c "
COPY administrative_units (code, name_km, name_en, type, parent_code, reference)
FROM PROGRAM 'jq -r '.[] | [.code, .name_km, .name_en, .type, .parent_code // null, .reference // null] | @tsv' < public/data/gazetteer-normalized.json'
WITH (FORMAT csv, DELIMITER E'\t', NULL 'null');
"
```

### Node.js Example

```typescript
import { readFileSync } from 'fs';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ /* your config */ });

const data = JSON.parse(readFileSync('public/data/gazetteer-normalized.json', 'utf-8'));

for (const unit of data) {
  await pool.query(
    `INSERT INTO administrative_units (code, name_km, name_en, type, parent_code, reference, official_note, checker_note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (code) DO UPDATE SET
       name_km = EXCLUDED.name_km,
       name_en = EXCLUDED.name_en`,
    [unit.code, unit.name_km, unit.name_en, unit.type, unit.parent_code, unit.reference, unit.official_note, unit.checker_note]
  );
}
```

## API Query Examples

### Get all provinces
```sql
SELECT * FROM administrative_units WHERE type IN ('province', 'municipality');
```

### Get districts in a province
```sql
SELECT * FROM administrative_units 
WHERE type = 'district' AND parent_code = '01';
```

### Get full hierarchy for a province
```sql
WITH RECURSIVE hierarchy AS (
  SELECT * FROM administrative_units WHERE code = '01'
  UNION ALL
  SELECT a.* FROM administrative_units a
  INNER JOIN hierarchy h ON a.parent_code = h.code
)
SELECT * FROM hierarchy ORDER BY code;
```

### Search by name
```sql
SELECT * FROM administrative_units 
WHERE name_en ILIKE '%phnom%' OR name_km LIKE '%ភ្នំ%';
```

## Data Quality

The ETL script:
- ✅ Validates all administrative codes
- ✅ Preserves Khmer Unicode characters
- ✅ Maintains hierarchical relationships
- ✅ Includes optional metadata (references, notes)
- ✅ Generates both normalized and hierarchical formats
- ✅ Provides statistics for verification

## Troubleshooting

### Empty districts array in hierarchical output
- Ensure the parent-child relationships are correctly established
- Check that district codes are properly extracted from sheet context

### Missing data
- Verify the Excel file structure matches expected format
- Check that sheet names match the province mapping

### Character encoding issues
- Ensure UTF-8 encoding is used when reading JSON files
- Database should use UTF-8 collation for Khmer support

## License

This data transformation follows the same license as the source data (Open Data Commons Open Database License - ODbL).

## Maintenance

To update the data:
1. Replace `2024.10.14.xlsx` with the new Excel file
2. Run `pnpm etl`
3. Verify statistics in `gazetteer-stats.json`
4. Check sample records in both output files
5. Re-import into your database

## Issues

For issues or questions about the ETL process, please open an issue in the project repository.
