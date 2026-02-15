import type { UploadedFile } from '../types';

export const generateResponse = async (files: UploadedFile[], prompt: string, cloudFunctionUrl: string): Promise<string> => {

  if (!cloudFunctionUrl) {
    throw new Error("L'URL de la Cloud Function n'est pas configurée.");
  }

  try {
    const response = await fetch(cloudFunctionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files, prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Réponse non-JSON du serveur.' }));
        throw new Error(`Erreur du serveur (${response.status}): ${errorData.error || 'Une erreur inconnue est survenue.'}`);
    }

    const data = await response.json();

    if (data.text) {
        return data.text;
    }

    throw new Error("La réponse du serveur ne contenait pas de texte valide.");

  } catch (error) {
    console.error("Error calling Cloud Function:", error);
    if (error instanceof Error) {
        throw new Error(`Échec de la communication avec le backend : ${error.message}`);
    }
    throw new Error("Une erreur de communication inconnue est survenue.");
  }
};
