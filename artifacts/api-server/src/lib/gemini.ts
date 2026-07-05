import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";

const apiKey = process.env["GEMINI_API_KEY"];

export const geminiEnabled = Boolean(apiKey);

if (!geminiEnabled) {
  logger.warn(
    "GEMINI_API_KEY is not set — AI Decision Dashboard features are disabled.",
  );
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const AI_MODEL = "gemini-2.5-flash";

/**
 * Calls Gemini asking for a JSON response and parses it.
 * Throws if Gemini is not configured, the call fails, or the response is not valid JSON.
 */
export async function generateJson<T>(prompt: string): Promise<T> {
  if (!ai) {
    throw new Error("Gemini AI client is not configured (missing GEMINI_API_KEY).");
  }

  const response = await ai.models.generateContent({
    model: AI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    logger.error({ err, text }, "Failed to parse Gemini JSON response");
    throw new Error("Gemini returned a malformed response.");
  }
}
