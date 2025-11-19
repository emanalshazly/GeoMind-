import { GoogleGenAI, Content } from "@google/genai";
import { Coordinates, Message, ModelType } from '../types';

// Initialize the client
// Note: We create a new instance per call or check for key presence to handle dynamic keys if needed, 
// but per guidelines we assume process.env.API_KEY is available.
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  prompt: string,
  history: Message[],
  modelType: ModelType,
  userLocation?: Coordinates
): Promise<{ text: string; groundingChunks?: any[] }> => {
  
  try {
    // Convert app history to Gemini Content format
    const contents: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const tools: any[] = [];
    let toolConfig: any = undefined;

    // Configure tools based on model type
    if (modelType === ModelType.LOCATION_SEARCH) {
      // Add both Maps and Search grounding for the best location-aware experience
      tools.push({ googleMaps: {} });
      tools.push({ googleSearch: {} });

      if (userLocation) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }
          }
        };
      }
    } else {
      // Gemini 3 Pro is used for deep reasoning, usually without tools in this specific context unless requested.
      // The prompt asks to use gemini-3-pro-preview for chatbot and Flash for search/maps.
      // We'll keep Pro pure for "Chat" mode.
    }

    const response = await genAI.models.generateContent({
      model: modelType,
      contents: contents,
      config: {
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: toolConfig,
      }
    });

    const responseText = response.text || "I couldn't generate a text response.";
    
    // Extract grounding metadata if available
    // Note: The structure depends on the SDK version but usually follows candidates[0].groundingMetadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: responseText,
      groundingChunks: groundingChunks
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to connect to Gemini.");
  }
};