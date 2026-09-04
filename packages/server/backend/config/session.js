// src/config/session.js

import session from "express-session";
import MongoStore from "connect-mongo";
import env from "./env.js";

export const configureSession = () =>
  session({
    secret: env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: env.MONGO_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),

    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,

      httpOnly: true,

      // Required when your API is behind Cloud Run's HTTPS proxy
      secure: env.NODE_ENV === "production",

      // Allows cross-site cookie usage
      sameSite: env.NODE_ENV === "production"
        ? "none"
        : "lax",
    },
  });