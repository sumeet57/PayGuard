import axios from "axios";
import { AIProvider, InvestigationContext, InvestigationResult } from "./types";

// Option A: Managed PayGuard Cloud Service
export class PayGuardAIProvider implements AIProvider {
  private apiKey: string;
  private endpoint: string;

  constructor(options: { apiKey: string; endpoint?: string }) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint || "https://payguardserver.sumeet.app";
  }

  public async investigate(context: InvestigationContext): Promise<InvestigationResult> {
    try {
      const response = await axios.post(`${this.endpoint}/api/investigate`, context, {
        headers: { "x-payguard-key": this.apiKey },
        timeout: 3000,
      });
      return response.data;
    } catch (error) {
      // Safety fallback if proxy fails
      return { anomalous: true, confidence: 0, recommendation: "REQUIRE_APPROVAL" };
    }
  }
}

// Option B: BYO Key (OpenAI / Gemini Direct)
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(options: { apiKey: string; model?: string }) {
    this.apiKey = options.apiKey;
    this.model = options.model || "gpt-4o";
  }

  public async investigate(context: InvestigationContext): Promise<InvestigationResult> {
    // Call OpenAI direct API...
    return {
      anomalous: false,
      confidence: 0.95,
      recommendation: "ALLOW",
    };
  }
}