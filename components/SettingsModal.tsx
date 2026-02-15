import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onSave: (url: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onSave }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with saved URL if it exists, to allow for editing
      const savedUrl = localStorage.getItem('cloudFunctionUrl');
      if (savedUrl) {
        setUrl(savedUrl);
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    // Basic validation for a URL format
    if (url.trim().startsWith('http://') || url.trim().startsWith('https://')) {
      onSave(url.trim());
    } else {
      alert("Veuillez entrer une URL valide (commençant par http:// ou https://).");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-[#2D2E31] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#3e4042]">
        <h2 className="text-2xl font-bold text-white mb-4">Configuration Requise</h2>
        <p className="text-[#E3E3E3] mb-6">
          Veuillez entrer l'URL de votre Cloud Function Firebase pour continuer. Vous la trouverez dans votre console Firebase après le déploiement.
        </p>
        <div>
          <label htmlFor="cloud-function-url" className="block text-sm font-medium text-[#A8C7FA] mb-2">
            URL de la Cloud Function
          </label>
          <input
            type="url"
            id="cloud-function-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://us-central1-votre-projet.cloudfunctions.net/geminiProxy"
            className="w-full bg-[#3a3b3e] border border-gray-600 rounded-lg py-2 px-4 text-[#E3E3E3] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A8C7FA]"
          />
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-[#A8C7FA] text-[#1E1F20] font-semibold py-2 px-6 rounded-lg hover:bg-[#8ab0f7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!url.trim()}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
