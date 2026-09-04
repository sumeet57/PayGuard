import {GoogleGenAI} from "@google/genai";
import env from "../config/env.js";

const model = "gemini-3.5-flash";
const PROJECT_ID = env.projectId;
const LOCATION = env.location || "global";


const ai = new GoogleGenAI({
  vertexai: true,
  project: PROJECT_ID,
  location: LOCATION,
});

export const requestPayGuardAssistantService = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        })
        return response.text;
    } catch (error) {
        throw new Error(`Error generating content: ${error.message}`);
    }
};


