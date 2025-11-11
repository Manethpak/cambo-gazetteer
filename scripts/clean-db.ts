import fs from "fs";
import path from "path";
import { promisify } from "util";

const rmdir = promisify(fs.rm);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

async function cleanD1Database() {
  const d1Path = path.resolve(".wrangler/state/v3/d1");

  try {
    // Check if directory exists
    const dirExists = await exists(d1Path);

    if (dirExists) {
      console.log("Cleaning D1 database directory...");
      // Remove the directory and all its contents recursively
      await rmdir(d1Path, { recursive: true, force: true });
      console.log("D1 database directory cleaned successfully.");

      // Recreate the empty directory structure
      await mkdir(d1Path, { recursive: true });
      console.log("Empty D1 directory structure recreated.");
    } else {
      console.log("D1 database directory does not exist. Nothing to clean.");
    }
  } catch (error) {
    console.error("Error cleaning D1 database:", error);
  }
}

cleanD1Database();
