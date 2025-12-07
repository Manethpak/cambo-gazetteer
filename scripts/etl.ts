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
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

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

export interface AdministrativeUnit {
  code: string;
  name_km: string;
  name_en: string;
  type: "province" | "municipality" | "district" | "commune" | "village";
  type_km?: string; // Original Khmer type name (ស្រុក, ឃុំ, ភូមិ, etc.)
  type_en?: string; // Original English type name (Srok, Khum, Phum, etc.)
  parent_code?: string;
  reference?: string;
  official_note?: string;
  checker_note?: string;
}

/**
 * Load provinces data from provinces.json
 */
function loadProvinces(): Array<{
  code: string;
  name_en: string;
  name_km: string;
  type: "province" | "municipality";
}> {
  const provincesPath = join("public", "data", "provinces.json");
  const provincesData = readFileSync(provincesPath, "utf-8");
  return JSON.parse(provincesData);
}

/**
 * Build province mapping from sheet names to province data
 */
function buildProvinceMapping() {
  const provinces = loadProvinces();
  const mapping: Record<
    string,
    {
      code: string;
      name_en: string;
      name_km: string;
      type: "province" | "municipality";
    }
  > = {};

  for (const province of provinces) {
    const sheetName = `${province.code}. ${province.name_en}`;
    mapping[sheetName] = {
      code: province.code,
      name_en: province.name_en,
      name_km: province.name_km,
      type: province.type,
    };
  }

  return mapping;
}

// Type mapping from Khmer to English
const typeMapping: Record<string, "district" | "commune" | "village"> = {
  ស្រុក: "district",
  ក្រុង: "district", // Municipality (city)
  ខណ្ឌ: "district", // Khan (urban district)
  សង្កាត់: "commune", // Sangkat (urban commune)
  ឃុំ: "commune",
  ភូមិ: "village",
};

// Mapping from Khmer type to English type name
const typeNameMapping: Record<string, string> = {
  ស្រុក: "Srok", // District
  ក្រុង: "Krong", // Municipality (city)
  ខណ្ឌ: "Khan", // Urban District
  សង្កាត់: "Sangkat", // Urban Commune
  ឃុំ: "Khum", // Commune
  ភូមិ: "Phum", // Village
};

/**
 * Determine administrative type based on code length and context
 */
function determineType(code: string, typeKhmer: string): "district" | "commune" | "village" {
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

  // Build province mapping from provinces.json
  const provinceMapping = buildProvinceMapping();

  console.log(`📊 Found ${workbook.SheetNames.length} sheets (provinces/municipalities)`);

  // Add provinces first
  for (const sheetName of workbook.SheetNames) {
    const provinceInfo = provinceMapping[sheetName];
    if (provinceInfo) {
      allUnits.push({
        code: provinceInfo.code,
        name_km: provinceInfo.name_km,
        name_en: provinceInfo.name_en,
        type: provinceInfo.type,
        type_km: provinceInfo.type === "municipality" ? "រាជធានី" : "ខេត្ត",
        type_en: provinceInfo.type === "municipality" ? "Municipality" : "Province",
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
        type_km: typeKhmer || undefined,
        type_en: typeNameMapping[typeKhmer] || undefined,
        parent_code: parentCode,
      };

      // Add optional fields if they exist
      if (row.Reference) unit.reference = String(row.Reference).trim();
      if (row["Official Note"]) unit.official_note = String(row["Official Note"]).trim();
      if (row["Note (by Checker)"]) unit.checker_note = String(row["Note (by Checker)"]).trim();

      allUnits.push(unit);
    }
  }

  console.log(`✅ Extracted ${allUnits.length} administrative units`);
  return allUnits;
}

/**
 * Main ETL process
 */
function main() {
  console.log("🚀 Starting ETL process for Cambodia Gazetteer Data\n");

  const inputFile = join("public", "data", "2024.10.14.xlsx");
  const outputDir = join("public", "data");

  // Extract
  const units = extractData(inputFile);

  // Load (Save outputs)
  console.log("\n💾 Saving output files...");

  // 1. Normalized format (flat, ready for DB insertion)
  const normalizedOutput = join(outputDir, "gazetteer-normalized.json");
  writeFileSync(normalizedOutput, JSON.stringify(units, null, 2), "utf-8");
  console.log(`  ✓ ${normalizedOutput}`);

  const stats = {
    total_units: units.length,
    provinces: units.filter((u) => u.type === "province" || u.type === "municipality").length,
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
