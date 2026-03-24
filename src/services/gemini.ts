import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getSmartSuggestions(query: string) {
  if (!query || query.length < 3) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is searching for "${query}" in a grocery store. Suggest 5 relevant product names or categories. Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

export async function getRecipeRecommendations(items: string[]) {
  if (items.length === 0) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these grocery items: ${items.join(', ')}, suggest a simple recipe. Return a JSON object with 'title', 'ingredients' (array), and 'instructions' (array).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "ingredients", "instructions"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
