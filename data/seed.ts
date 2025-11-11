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

// Generate SQL INSERT statements
// Using individual INSERTs to avoid Wrangler hash index errors
const generateInsertStatements = () => {
  const statements: string[] = [];

  for (const unit of data) {
    const code = unit.code.replace(/'/g, "''");
    const nameKm = unit.name_km.replace(/'/g, "''");
    const nameEn = unit.name_en.replace(/'/g, "''");
    const type = unit.type.replace(/'/g, "''");
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

    const statement = `INSERT INTO administrative_units (code, name_km, name_en, type, parent_code, reference, official_note, checker_note) VALUES ('${code}', '${nameKm}', '${nameEn}', '${type}', ${parentCode}, ${reference}, ${officialNote}, ${checkerNote});`;

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
console.log(
  `   Local:  wrangler d1 execute cambo-gazetteer --local --file=data/seed.sql`
);
console.log(
  `   Remote: wrangler d1 execute cambo-gazetteer --remote --file=data/seed.sql`
);
