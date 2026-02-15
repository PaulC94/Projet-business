
import { GoogleGenAI, Part } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import type { UploadedFile } from '../types';

export const generateResponse = async (files: UploadedFile[], prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const fileParts: Part[] = files.map(file => {
    // Expected data format is "data:mime/type;base64,ENCODED_DATA"
    const base64Data = file.data.split(',')[1];
    if (!base64Data) {
      throw new Error(`Invalid file data for ${file.name}`);
    }
    return {
      inlineData: {
        mimeType: file.mimeType,
        data: base64Data
      }
    };
  });

  const textPart: Part = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [...fileParts, textPart] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return response.text;
    }

    // Handle cases where the response might be blocked
    if (!response.candidates || response.candidates.length === 0) {
       return "La réponse a été bloquée pour des raisons de sécurité. Veuillez ajuster votre question.";
    }

    return "Je n'ai pas pu générer une réponse. Veuillez réessayer.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Échec de la communication avec l'API Gemini. Vérifiez la console pour plus de détails.");
  }
};
