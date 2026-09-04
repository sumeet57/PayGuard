import { Router } from "express";
import { getCurrentUser, handleGoogleAuth, handleLogout } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


const authRouter = Router();


authRouter.post("/google", handleGoogleAuth);
authRouter.get("/me", isAuthenticated ,getCurrentUser);
authRouter.post("/logout", isAuthenticated, handleLogout);


export default authRouter;