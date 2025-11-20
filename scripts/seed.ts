import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

function findLocalD1Path(): string | null {
  const base = join(
    process.cwd(),
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject"
  );
  try {
    const files = readdirSync(base);
    const db = files.find((f) => f.endsWith(".sqlite"));
    return db ? join(base, db) : null;
  } catch {
    return null;
  }
}

(async () => {
  const start = Date.now();
  const dbPath = findLocalD1Path();
  if (!dbPath) {
    console.error(
      "Could not find local D1 sqlite file. Did you run 'wrangler dev' or 'db:migrate:local' at least once?"
    );
    process.exit(1);
  }

  // Read seed SQL file
  const seedSQL = readFileSync(
    join(process.cwd(), "public", "data", "seed.sql"),
    "utf-8"
  );
  // Split into statements by semicolon at end of line. Keep semicolons.
  let statements = seedSQL
    .split(/;\s*\n/) // split on ; newline combos
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => (s.endsWith(";") ? s : s + ";"));

  const total = statements.length;
  console.log(`Seeding ${total} statements…`);

  let processed = 0;
  let db: Database.Database;
  try {
    db = new Database(dbPath);
    // Improve bulk insert speed
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = OFF");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }

  try {
    const batchSize = 2000; // bigger batches are faster; adjust as needed
    db.exec("BEGIN;");
    for (let i = 0; i < statements.length; i += batchSize) {
      const chunk = statements.slice(i, i + batchSize).join("\n");
      db.exec(chunk);
      processed = Math.min(i + batchSize, total);
      const pct = ((processed / total) * 100).toFixed(1);
      console.log(`   ⏳ ${processed}/${total} (${pct}%)`);
    }
    db.exec("COMMIT;");
  } catch (e: any) {
    try {
      db.exec("ROLLBACK;");
    } catch {}
    console.error("❌ Seeding failed");
    console.error(e?.message || e);
    process.exit(1);
  } finally {
    const end = Date.now();
    const duration = ((end - start) / 1000).toFixed(2);
    console.log(`✅ Seeding complete in ${duration} seconds`);
    db.close();
  }
})();
