/**
 * Data seeding script for Cambodia Gazetteer
 * Loads data from gazetteer-normalized.json into D1 database
 *
 * Usage:
 *   - Local: pnpm db:seed:local
 *   - Remote: pnpm db:seed:remote
 */

import { readFileSync } from "fs";
import { join } from "path";

// Read the normalized data
const dataPath = join(process.cwd(), "data", "gazetteer-normalized.json");
const data = JSON.parse(readFileSync(dataPath, "utf-8"));

console.log(
  `📊 Loaded ${data.length} administrative units from gazetteer-normalized.json`
);

// Group data by type for statistics
const stats = data.reduce((acc: any, unit: any) => {
  acc[unit.type] = (acc[unit.type] || 0) + 1;
  return acc;
}, {});

console.log("📈 Statistics:");
Object.entries(stats).forEach(([type, count]) => {
  console.log(`   ${type}: ${count}`);
});

// Check for duplicate codes in source data
const seenCodes = new Set<string>();
const duplicates: any[] = [];

for (const unit of data) {
  if (seenCodes.has(unit.code)) {
    duplicates.push(unit);
  }
  seenCodes.add(unit.code);
}

if (duplicates.length > 0) {
  console.warn(
    `\n⚠️  Found ${duplicates.length} duplicate codes in source data:`
  );
  duplicates.forEach((dup) => {
    console.warn(`   - ${dup.code}: ${dup.name_en} (${dup.name_km})`);
  });
  console.warn("   → Using INSERT OR REPLACE to handle duplicates\n");
} else {
  console.log("✅ No duplicate codes found in source data");
}

// Generate SQL INSERT statements
// Using INSERT OR REPLACE to handle duplicates and make script idempotent
const generateInsertStatements = () => {
  const statements: string[] = [];

  for (const unit of data) {
    const code = unit.code.replace(/'/g, "''");
    const nameKm = unit.name_km.replace(/'/g, "''");
    const nameEn = unit.name_en.replace(/'/g, "''");
    const type = unit.type.replace(/'/g, "''");
    const typeKm = unit.type_km
      ? `'${unit.type_km.replace(/'/g, "''")}'`
      : "NULL";
    const typeEn = unit.type_en
      ? `'${unit.type_en.replace(/'/g, "''")}'`
      : "NULL";
    const parentCode = unit.parent_code
      ? `'${unit.parent_code.replace(/'/g, "''")}'`
      : "NULL";
    const reference = unit.reference
      ? `'${unit.reference.replace(/'/g, "''")}'`
      : "NULL";
    const officialNote = unit.official_note
      ? `'${unit.official_note.replace(/'/g, "''")}'`
      : "NULL";
    const checkerNote = unit.checker_note
      ? `'${unit.checker_note.replace(/'/g, "''")}'`
      : "NULL";

    const statement = `INSERT OR REPLACE INTO administrative_units (code, name_km, name_en, type, type_km, type_en, parent_code, reference, official_note, checker_note) VALUES ('${code}', '${nameKm}', '${nameEn}', '${type}', ${typeKm}, ${typeEn}, ${parentCode}, ${reference}, ${officialNote}, ${checkerNote});`;

    statements.push(statement);
  }

  return statements;
};

// Generate the seed SQL file
const statements = generateInsertStatements();
const seedSQL = statements.join("\n\n");

// Write to a SQL file
import { writeFileSync } from "fs";
const outputPath = join(process.cwd(), "data", "seed.sql");
writeFileSync(outputPath, seedSQL, "utf-8");

console.log(`\n✅ Generated seed SQL file: ${outputPath}`);
console.log(`📝 Total INSERT statements: ${statements.length} (one per row)`);
console.log(`📦 Total records: ${data.length}`);
console.log(`\n🚀 Next steps:`);
console.log(`   Local:  pnpm db:seed:local`);
console.log(`   Remote: pnpm db:seed:remote`);
console.warn(
  `\n\x1b[33mNote: wrangler > 3.103.2 is known for HashIndex error when seeding large datasets.
      See issue for more info: https://github.com/cloudflare/workers-sdk/issues/8153\x1b[0m\n\n`
);
