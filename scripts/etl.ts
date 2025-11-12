#!/usr/bin/env tsx
/**
 * ETL Script for Cambodia Gazetteer Data
 *
 * This script extracts data from the Excel file (2024.10.14.xlsx),
 * transforms it into structured JSON/YAML formats, and prepares it
 * for database insertion.
 *
 * Usage: pnpm etl
 */

import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Type definitions
interface RawRow {
  Type: string;
  Code: string;
  "Name (Khmer)": string;
  "Name (Latin)": string;
  Reference: string;
  "Official Note": string;
  "Note (by Checker)": string;
}

interface AdministrativeUnit {
  code: string;
  name_km: string;
  name_en: string;
  type: "province" | "municipality" | "district" | "commune" | "village";
  parent_code?: string;
  reference?: string;
  official_note?: string;
  checker_note?: string;
}

interface HierarchicalProvince {
  code: string;
  name_km: string;
  name_en: string;
  type: "province" | "municipality";
  districts: HierarchicalDistrict[];
}

interface HierarchicalDistrict {
  code: string;
  name_km: string;
  name_en: string;
  type: "district";
  parent_code: string;
  communes: HierarchicalCommune[];
}

interface HierarchicalCommune {
  code: string;
  name_km: string;
  name_en: string;
  type: "commune";
  parent_code: string;
  villages: HierarchicalVillage[];
}

interface HierarchicalVillage {
  code: string;
  name_km: string;
  name_en: string;
  type: "village";
  parent_code: string;
}

// Province mapping from sheet names to codes
const provinceMapping: Record<
  string,
  {
    code: string;
    name_en: string;
    name_km: string;
    type: "province" | "municipality";
  }
> = {
  "01. Banteay Meanchey": {
    code: "01",
    name_en: "Banteay Meanchey",
    name_km: "បន្ទាយមានជ័យ",
    type: "province",
  },
  "02. Battambang": {
    code: "02",
    name_en: "Battambang",
    name_km: "បាត់ដំបង",
    type: "province",
  },
  "03. Kampong Cham": {
    code: "03",
    name_en: "Kampong Cham",
    name_km: "កំពង់ចាម",
    type: "province",
  },
  "04. Kampong Chhnang": {
    code: "04",
    name_en: "Kampong Chhnang",
    name_km: "កំពង់ឆ្នាំង",
    type: "province",
  },
  "05. Kampong Speu": {
    code: "05",
    name_en: "Kampong Speu",
    name_km: "កំពង់ស្ពឺ",
    type: "province",
  },
  "06. Kampong Thom": {
    code: "06",
    name_en: "Kampong Thom",
    name_km: "កំពង់ធំ",
    type: "province",
  },
  "07. Kampot": {
    code: "07",
    name_en: "Kampot",
    name_km: "កំពត",
    type: "province",
  },
  "08. Kandal": {
    code: "08",
    name_en: "Kandal",
    name_km: "កណ្ដាល",
    type: "province",
  },
  "09. Koh Kong": {
    code: "09",
    name_en: "Koh Kong",
    name_km: "កោះកុង",
    type: "province",
  },
  "10. Kratie": {
    code: "10",
    name_en: "Kratie",
    name_km: "ក្រចេះ",
    type: "province",
  },
  "11. Mondul Kiri": {
    code: "11",
    name_en: "Mondulkiri",
    name_km: "មណ្ឌលគីរី",
    type: "province",
  },
  "12. Phnom Penh": {
    code: "12",
    name_en: "Phnom Penh",
    name_km: "ភ្នំពេញ",
    type: "municipality",
  },
  "13. Preah Vihear": {
    code: "13",
    name_en: "Preah Vihear",
    name_km: "ព្រះវិហារ",
    type: "province",
  },
  "14. Prey Veng": {
    code: "14",
    name_en: "Prey Veng",
    name_km: "ព្រៃវែង",
    type: "province",
  },
  "15. Pursat": {
    code: "15",
    name_en: "Pursat",
    name_km: "ពោធិ៍សាត់",
    type: "province",
  },
  "16. Ratanak Kiri": {
    code: "16",
    name_en: "Ratanakiri",
    name_km: "រតនគិរី",
    type: "province",
  },
  "17. Siemreap": {
    code: "17",
    name_en: "Siem Reap",
    name_km: "សៀមរាប",
    type: "province",
  },
  "18. Preah Sihanouk": {
    code: "18",
    name_en: "Preah Sihanouk",
    name_km: "ព្រះសីហនុ",
    type: "province",
  },
  "19. Stung Treng": {
    code: "19",
    name_en: "Stung Treng",
    name_km: "ស្ទឹងត្រែង",
    type: "province",
  },
  "20. Svay Rieng": {
    code: "20",
    name_en: "Svay Rieng",
    name_km: "ស្វាយរៀង",
    type: "province",
  },
  "21. Takeo": {
    code: "21",
    name_en: "Takeo",
    name_km: "តាកែវ",
    type: "province",
  },
  "22. Oddar Meanchey": {
    code: "22",
    name_en: "Oddar Meanchey",
    name_km: "ឧត្តរមានជ័យ",
    type: "province",
  },
  "23. Kep": { code: "23", name_en: "Kep", name_km: "កែប", type: "province" },
  "24. Pailin": {
    code: "24",
    name_en: "Pailin",
    name_km: "ប៉ៃលិន",
    type: "province",
  },
  "25. Tboung Khmum": {
    code: "25",
    name_en: "Tboung Khmum",
    name_km: "ត្បូងឃ្មុំ",
    type: "province",
  },
};

// Type mapping from Khmer to English
const typeMapping: Record<string, "district" | "commune" | "village"> = {
  ស្រុក: "district",
  ឃុំ: "commune",
  ភូមិ: "village",
  ក្រុង: "district", // Khan (urban district)
  សង្កាត់: "commune", // Sangkat (urban commune)
};

/**
 * Determine administrative type based on code length and context
 */
function determineType(
  code: string,
  typeKhmer: string
): "district" | "commune" | "village" {
  // Use Khmer type mapping first
  if (typeMapping[typeKhmer]) {
    return typeMapping[typeKhmer];
  }

  // Fallback to code length analysis
  const codeLength = code.length;
  if (codeLength === 3 || codeLength === 4) return "district";
  if (codeLength === 5) return "commune";
  if (codeLength >= 6) return "village";

  return "village"; // default
}

/**
 * Extract data from Excel file
 */
function extractData(filePath: string): AdministrativeUnit[] {
  console.log("📖 Reading Excel file...");
  const workbook = XLSX.readFile(filePath);
  const allUnits: AdministrativeUnit[] = [];

  console.log(
    `📊 Found ${workbook.SheetNames.length} sheets (provinces/municipalities)`
  );

  // Add provinces first
  for (const sheetName of workbook.SheetNames) {
    const provinceInfo = provinceMapping[sheetName];
    if (provinceInfo) {
      allUnits.push({
        code: provinceInfo.code,
        name_km: provinceInfo.name_km,
        name_en: provinceInfo.name_en,
        type: provinceInfo.type,
      });
    }
  }

  // Process each sheet
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const provinceInfo = provinceMapping[sheetName];

    if (!provinceInfo) {
      console.warn(`⚠️  Unknown sheet: ${sheetName}`);
      continue;
    }

    console.log(`  Processing: ${provinceInfo.name_en} (${provinceInfo.code})`);

    // Convert sheet to JSON, skipping header rows
    const rawData = XLSX.utils.sheet_to_json<RawRow>(sheet, {
      range: 2, // Skip title and empty row, start from header
      defval: "",
    });

    // Track current district and commune for context
    let currentDistrict: string | null = null;
    let currentCommune: string | null = null;

    for (const row of rawData) {
      // Skip empty rows
      if (!row.Code || !row["Name (Latin)"]) continue;

      const code = String(row.Code).trim();
      const typeKhmer = String(row.Type || "").trim();
      const type = determineType(code, typeKhmer);

      // Determine parent code based on type and context
      let parentCode: string | undefined;
      if (type === "district") {
        parentCode = provinceInfo.code;
        currentDistrict = code;
        currentCommune = null;
      } else if (type === "commune") {
        parentCode = currentDistrict || undefined;
        currentCommune = code;
      } else if (type === "village") {
        parentCode = currentCommune || undefined;
      }

      const unit: AdministrativeUnit = {
        code,
        name_km: String(row["Name (Khmer)"] || "").trim(),
        name_en: String(row["Name (Latin)"] || "").trim(),
        type,
        parent_code: parentCode,
      };

      // Add optional fields if they exist
      if (row.Reference) unit.reference = String(row.Reference).trim();
      if (row["Official Note"])
        unit.official_note = String(row["Official Note"]).trim();
      if (row["Note (by Checker)"])
        unit.checker_note = String(row["Note (by Checker)"]).trim();

      allUnits.push(unit);
    }
  }

  console.log(`✅ Extracted ${allUnits.length} administrative units`);
  return allUnits;
}

/**
 * Transform flat data into hierarchical structure
 */
function transformToHierarchical(
  units: AdministrativeUnit[]
): HierarchicalProvince[] {
  console.log("🔄 Transforming to hierarchical structure...");

  const provinces: HierarchicalProvince[] = [];
  const districtMap = new Map<string, HierarchicalDistrict>();
  const communeMap = new Map<string, HierarchicalCommune>();

  // Build provinces
  for (const unit of units) {
    if (unit.type === "province" || unit.type === "municipality") {
      provinces.push({
        code: unit.code,
        name_km: unit.name_km,
        name_en: unit.name_en,
        type: unit.type,
        districts: [],
      });
    }
  }

  // Build districts
  for (const unit of units) {
    if (unit.type === "district") {
      const district: HierarchicalDistrict = {
        code: unit.code,
        name_km: unit.name_km,
        name_en: unit.name_en,
        type: "district",
        parent_code: unit.parent_code!,
        communes: [],
      };
      districtMap.set(unit.code, district);

      const province = provinces.find((p) => p.code === unit.parent_code);
      if (province) {
        province.districts.push(district);
      }
    }
  }

  // Build communes
  for (const unit of units) {
    if (unit.type === "commune") {
      const commune: HierarchicalCommune = {
        code: unit.code,
        name_km: unit.name_km,
        name_en: unit.name_en,
        type: "commune",
        parent_code: unit.parent_code!,
        villages: [],
      };
      communeMap.set(unit.code, commune);

      const district = districtMap.get(unit.parent_code!);
      if (district) {
        district.communes.push(commune);
      }
    }
  }

  // Build villages
  for (const unit of units) {
    if (unit.type === "village") {
      const village: HierarchicalVillage = {
        code: unit.code,
        name_km: unit.name_km,
        name_en: unit.name_en,
        type: "village",
        parent_code: unit.parent_code!,
      };

      const commune = communeMap.get(unit.parent_code!);
      if (commune) {
        commune.villages.push(village);
      }
    }
  }

  console.log(
    `✅ Created hierarchical structure with ${provinces.length} provinces`
  );
  return provinces;
}

/**
 * Main ETL process
 */
function main() {
  console.log("🚀 Starting ETL process for Cambodia Gazetteer Data\n");

  const inputFile = join("data", "2024.10.14.xlsx");
  const outputDir = join("data");

  // Extract
  const units = extractData(inputFile);

  // Transform
  const hierarchical = transformToHierarchical(units);

  // Load (Save outputs)
  console.log("\n💾 Saving output files...");

  // 1. Normalized format (flat, ready for DB insertion)
  const normalizedOutput = join(outputDir, "gazetteer-normalized.json");
  writeFileSync(normalizedOutput, JSON.stringify(units, null, 2), "utf-8");
  console.log(`  ✓ ${normalizedOutput}`);

  // 2. Hierarchical format (nested, easy to read)
  const hierarchicalOutput = join(outputDir, "gazetteer-hierarchical.json");
  writeFileSync(
    hierarchicalOutput,
    JSON.stringify(hierarchical, null, 2),
    "utf-8"
  );
  console.log(`  ✓ ${hierarchicalOutput}`);

  // 3. Statistics file
  const stats = {
    total_units: units.length,
    provinces: units.filter(
      (u) => u.type === "province" || u.type === "municipality"
    ).length,
    districts: units.filter((u) => u.type === "district").length,
    communes: units.filter((u) => u.type === "commune").length,
    villages: units.filter((u) => u.type === "village").length,
    generated_at: new Date().toISOString(),
  };

  const statsOutput = join(outputDir, "gazetteer-stats.json");
  writeFileSync(statsOutput, JSON.stringify(stats, null, 2), "utf-8");
  console.log(`  ✓ ${statsOutput}`);

  // Print summary
  console.log("\n📊 Statistics:");
  console.log(`  • Total units: ${stats.total_units}`);
  console.log(`  • Provinces/Municipalities: ${stats.provinces}`);
  console.log(`  • Districts: ${stats.districts}`);
  console.log(`  • Communes: ${stats.communes}`);
  console.log(`  • Villages: ${stats.villages}`);
  console.log("\n✨ ETL process completed successfully!");
}

// Run the script
main();
