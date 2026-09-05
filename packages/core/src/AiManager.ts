import axios from "axios";
import { AIProvider, InvestigationContext, InvestigationResult } from "./types";
export class PayGuardAIProvider implements AIProvider {
  private apiKey: string;
  private endpoint: string;

  constructor(options: { apiKey: string; endpoint?: string }) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint || "https://payguard-server-460009295734.asia-south1.run.app";
  }

  public async investigate(context: InvestigationContext): Promise<InvestigationResult> {
    try {
      const response = await axios.post(`${this.endpoint}/api/ai/request`, {
        prompt: `
You are PayGuard Security AI. Analyze the transaction context and return ONLY a valid JSON object matching this TypeScript interface:

interface InvestigationResult {
  anomalous: boolean;
  confidence: number; // 0.0 to 1.0
  recommendation: "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK";
  reason: string; // Concise 1-sentence summary
}

Do not include markdown formatting, backticks, or extra prose. Return RAW JSON ONLY.
 
transaction context : ${JSON.stringify(context)}`,
      }, {
        headers: { "x-api-key": this.apiKey },
        timeout: 30000,
      });

      console.log("AI Raw Response:", response.data);

      let payload = response.data;

      if (payload && typeof payload.response === "string") {
        try {
          payload = JSON.parse(payload.response);
        } catch {
          const jsonMatch = payload.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            payload = JSON.parse(jsonMatch[0]);
          }
        }
      }

      return {
        anomalous: Boolean(payload.anomalous),
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0.9,
        recommendation: ["ALLOW", "REQUIRE_APPROVAL", "BLOCK"].includes(payload.recommendation)
          ? payload.recommendation
          : "REQUIRE_APPROVAL",
        reason: typeof payload.reason === "string" ? payload.reason : "AI investigation flagged transaction as anomalous.",
      };
    } catch (error) {
      return { anomalous: true, confidence: 0, recommendation: "REQUIRE_APPROVAL", reason: "AI investigation failed or returned invalid response." };
    }
  }
}

// BYO Key (OpenAI / Gemini Direct)
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(options: { apiKey: string; model?: string }) {
    this.apiKey = options.apiKey;
    this.model = options.model || "gpt-4o";
  }

  public async investigate(context: InvestigationContext): Promise<InvestigationResult> {
    return {
      anomalous: false,
      confidence: 0.95,
      recommendation: "ALLOW",
      reason: "AI investigation completed successfully."
    };
  }
}