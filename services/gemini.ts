import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL, SYSTEM_INSTRUCTION } from '../constants';

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return null;
  }
  
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  chatSession = genAI.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: message
    });
    return result.text || "";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// Function to analyze the conversation and return stats JSON
// We create a *separate* single-turn request for this to not pollute the main chat context with JSON dumps
export const analyzeStats = async (historyText: string) => {
   if (!genAI) return null;

   try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash', // Use flash for quick analysis
      contents: `Analyze the following conversation history between a coach and a user. 
      Estimate the user's score from 0-100 on these 5 metrics: technical, vision, grit, speed, network.
      Return ONLY a valid JSON object like: {"technical": 50, "vision": 30, "grit": 50, "speed": 40, "network": 20}.
      
      History:
      ${historyText}
      `,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    return JSON.parse(response.text || "{}");
   } catch (e) {
     console.error("Failed to analyze stats", e);
     return null;
   }
};