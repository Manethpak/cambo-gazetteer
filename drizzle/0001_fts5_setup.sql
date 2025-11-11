-- Create FTS5 virtual table for full-text search on administrative units
-- This enables fast fuzzy searching on Khmer and English names
CREATE VIRTUAL TABLE administrative_units_fts USING fts5(
  code,
  name_km,
  name_en,
  content='administrative_units',
  content_rowid='rowid'
);
--> statement-breakpoint

-- Populate FTS5 table with existing data (runs after initial seed)
INSERT INTO administrative_units_fts(rowid, code, name_km, name_en)
SELECT rowid, code, name_km, name_en FROM administrative_units;
--> statement-breakpoint

-- Trigger: Keep FTS5 in sync when new administrative units are inserted
CREATE TRIGGER administrative_units_ai AFTER INSERT ON administrative_units BEGIN
  INSERT INTO administrative_units_fts(rowid, code, name_km, name_en)
  VALUES (new.rowid, new.code, new.name_km, new.name_en);
END;
--> statement-breakpoint

-- Trigger: Keep FTS5 in sync when administrative units are updated
CREATE TRIGGER administrative_units_au AFTER UPDATE ON administrative_units BEGIN
  UPDATE administrative_units_fts 
  SET code = new.code, name_km = new.name_km, name_en = new.name_en
  WHERE rowid = new.rowid;
END;
--> statement-breakpoint

-- Trigger: Keep FTS5 in sync when administrative units are deleted
CREATE TRIGGER administrative_units_ad AFTER DELETE ON administrative_units BEGIN
  DELETE FROM administrative_units_fts WHERE rowid = old.rowid;
END;
