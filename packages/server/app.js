import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import env from "./config/env.js";
import { configureSession } from "./config/session.js";

const app = express();

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

export default app;
