/**
 * Drizzle-based seeder for Cambodia Gazetteer
 * Uses Drizzle ORM to insert data, avoiding Wrangler hash index issues
 *
 * Usage:
 *   tsx scripts/seed-drizzle.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { drizzle } from "drizzle-orm/d1";
import { administrativeUnits } from "../src/worker/db/schema";

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

async function seed() {
  // Get D1 database from wrangler
  const env = process.env as any;
  
  if (!env.DB) {
    throw new Error(
      "DB binding not found. Make sure you're running this with wrangler."
    );
  }

  const db = drizzle(env.DB);

  console.log("\n🌱 Starting database seeding...");
  
  const batchSize = 100;
  const batches = Math.ceil(data.length / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);
    
    await db.insert(administrativeUnits).values(
      batch.map((unit: any) => ({
        code: unit.code,
        nameKm: unit.name_km,
        nameEn: unit.name_en,
        type: unit.type,
        parentCode: unit.parent_code || null,
        reference: unit.reference || null,
        officialNote: unit.official_note || null,
        checkerNote: unit.checker_note || null,
      }))
    );
    
    console.log(`   ✓ Inserted batch ${i + 1}/${batches} (${end}/${data.length} records)`);
  }

  console.log(`\n✅ Successfully seeded ${data.length} records!`);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
