const functions = require("firebase-functions");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors")({ origin: true });

// The system instruction from the frontend's constants.ts
const SYSTEM_INSTRUCTION = `
Rôle :
Tu es l'Expert IA "Nexus", un moteur RAG (Retrieval Augmented Generation) de nouvelle génération spécialisé dans l'analyse de documents propriétaires pour les TPE/PME françaises. Ton objectif est de transformer les documents bruts en décisions métier concrètes.

Instructions Opérationnelles :
- Ancrage Documentaire : Tu ne dois répondre qu'en utilisant les informations présentes dans les documents fournis en contexte (fichiers PDF, textes, tableaux). Si l'information est absente, réponds : "Je ne trouve pas cette information dans vos documents internes".
- Réduction des Hallucinations : Applique une stratégie de vérification stricte pour réduire les hallucinations de 35%. Cite toujours la source ou le document spécifique pour chaque affirmation (ex: "D'après le contrat de maintenance, page 12...").
- Traitement du Contexte : Pour chaque document, restaure le contexte sémantique en tenant compte de la hiérarchie des titres et des tableaux.
- Style et Ton : Adopte un ton professionnel, précis et synthétique. Ton but est de faire gagner 40% de temps aux employés dans leurs recherches.

Sécurité et Confidentialité :
- Respecte strictement la confidentialité : ne partage jamais les données d'un "Context Lake" avec un autre utilisateur.
- En conformité avec l'AI Act de 2026, toutes tes réponses doivent être explicables et auditables.

Format de Sortie (Output) :
- Analyse les demandes complexes en étapes logiques.
- Utilise des listes à puces pour la clarté.
- Termine chaque réponse par une suggestion d'étape suivante pour l'utilisateur.
`;

// It's recommended to set the region for your functions for consistency.
exports.geminiProxy = functions.region('us-central1').https.onRequest((req, res) => {
  // Enable CORS
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method Not Allowed" });
    }

    try {
      const { files, prompt } = req.body;

      if (!prompt) {
        return res.status(400).send({ error: "Prompt is required." });
      }

      // Retrieve API key from environment variables (set in Firebase config)
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.error("API_KEY environment variable is not set.");
        return res.status(500).send({ error: "Server configuration error: API key not found." });
      }
      
      const ai = new GoogleGenAI({ apiKey });

      const fileParts = (files || []).map((file) => {
        const base64Data = file.data.split(",")[1];
        if (!base64Data) {
            console.warn(`Skipping malformed file data for ${file.name}`);
            return null;
        }
        return {
          inlineData: {
            mimeType: file.mimeType,
            data: base64Data,
          },
        };
      }).filter(Boolean); // Filter out any null parts

      const textPart = { text: prompt };

      // Model as requested by the user: Gemini 1.5 Flash -> 'gemini-flash-latest'
      const modelName = 'gemini-flash-latest';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [...fileParts, textPart] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.2,
        },
      });

      if (response.text) {
        return res.status(200).json({ text: response.text });
      }
      
      // Handle cases where the response might be blocked or empty
      const candidate = response.candidates?.[0];
      if (candidate && candidate.finishReason !== 'STOP') {
        return res.status(200).json({ text: `La réponse a été bloquée. Raison: ${candidate.finishReason}` });
      }

      return res.status(500).json({ error: "Failed to get a valid response from Gemini API." });

    } catch (error) {
      console.error("Error in geminiProxy function:", error);
      res.status(500).send({ error: `An internal server error occurred: ${error.message}` });
    }
  });
});
