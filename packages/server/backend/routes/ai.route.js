import {Router} from "express";
import { requestPayGuardAssistantController } from "../controllers/ai.controller.js";
import { isValidRequest } from "../middlewares/ai.middleware.js";



const aiRouter = Router();

aiRouter.post("/request", isValidRequest ,requestPayGuardAssistantController);
export default aiRouter;
