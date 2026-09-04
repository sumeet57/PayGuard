import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import env from "./config/env.js";
import { configureSession } from "./config/session.js";
import authRouter from "./routes/auth.route.js";
import keyRouter from "./routes/key.route.js";
import aiRouter from "./routes/ai.route.js";

const app = express();
app.set("trust proxy", 1);

// middlewares
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(configureSession());

// routes
app.get("/health", (req, res) => {
  res.send({
    status: "ok",
    message: "Server is running",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});
app.use("/api/auth", authRouter);
app.use("/api/keys", keyRouter);
app.use("/api/ai", aiRouter);

export default app;
