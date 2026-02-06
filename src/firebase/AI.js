import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { app } from "./config";

// Step 1: Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Step 2: Create a `GenerativeModel` instance with a model that supports your use case (use 2.5-flash)
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

export async function sendMessageToGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}
