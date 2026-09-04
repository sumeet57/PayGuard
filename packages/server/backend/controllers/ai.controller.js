import { requestPayGuardAssistantService } from "../services/ai.service.js";


export const requestPayGuardAssistantController = async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await requestPayGuardAssistantService(prompt);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};