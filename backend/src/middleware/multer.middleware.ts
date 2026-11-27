import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { Request } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve to <project-root>/backend/public/temp — consistent with getLocalPath()
const TEMP_DIR = path.resolve(__dirname, "../../public/temp");

// Ensure the directory exists at startup
fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb
  ) => {
    cb(null, TEMP_DIR);
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb
  ) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});