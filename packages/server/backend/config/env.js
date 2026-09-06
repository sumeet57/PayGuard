import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const env = process.env.NODE_ENV || "development";

const currentPath = path.join(process.cwd(), ".env");
const environmentPath = `${currentPath}.${env}`;

const finalPath = fs.existsSync(environmentPath)
  ? environmentPath
  : currentPath;

dotenv.config({
  path: finalPath,
  override: true,
});

console.log("Loaded environment from:", finalPath);

export default {
  port: Number(process.env.PORT) || 3000,

  clientUrl:
    process.env.CLIENT_URL || "http://localhost:5173",

  projectId:
    process.env.GOOGLE_CLOUD_PROJECT,

  location:
    process.env.GOOGLE_CLOUD_LOCATION || "global",

  model:
    process.env.MODEL || "gemini-3.5-flash",

  MONGO_URI:
    process.env.MONGO_URI,

  SESSION_SECRET:
    process.env.SESSION_SECRET,

  NODE_ENV:
    process.env.NODE_ENV || "development",
  
    JWT_SECRET:
    process.env.JWT_SECRET || "your_jwt_secret_key_here",
};