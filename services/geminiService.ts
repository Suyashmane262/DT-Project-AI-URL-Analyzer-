
import { GoogleGenAI, Type } from "@google/genai";
import { ThreatAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeUrl = async (url: string): Promise<ThreatAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Perform a deep security analysis on the following URL: ${url}. 
  Evaluate specifically:
  1. SSL Certificate validity (if known/standard).
  2. Presence in security blacklists.
  3. Phishing indicators (brand impersonation, suspicious paths).
  4. Domain Age/Reputation.
  
  Identify specific threat categories (e.g., Worm, Spyware, Trojan, Phishing, Adware).
  Provide a concise summary and a clear warning message for the user if dangerous.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isSafe: { type: Type.BOOLEAN },
          riskScore: { type: Type.NUMBER },
          threatLevel: { type: Type.STRING, enum: ["Safe", "Suspicious", "Dangerous", "Critical"] },
          summary: { type: Type.STRING },
          checks: {
            type: Type.OBJECT,
            properties: {
              ssl: { 
                type: Type.OBJECT,
                properties: { status: { type: Type.BOOLEAN }, label: { type: Type.STRING } },
                required: ["status", "label"]
              },
              blacklist: { 
                type: Type.OBJECT,
                properties: { status: { type: Type.BOOLEAN }, label: { type: Type.STRING } },
                required: ["status", "label"]
              },
              phishing: { 
                type: Type.OBJECT,
                properties: { status: { type: Type.BOOLEAN }, label: { type: Type.STRING } },
                required: ["status", "label"]
              },
              domainAge: { 
                type: Type.OBJECT,
                properties: { status: { type: Type.BOOLEAN }, label: { type: Type.STRING } },
                required: ["status", "label"]
              }
            },
            required: ["ssl", "blacklist", "phishing", "domainAge"]
          },
          detectedThreatTypes: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          warningMessage: { type: Type.STRING }
        },
        required: ["isSafe", "riskScore", "threatLevel", "summary", "checks", "detectedThreatTypes", "warningMessage"]
      }
    }
  });

  const analysis: ThreatAnalysis = JSON.parse(response.text || "{}");
  return { ...analysis, url };
};
