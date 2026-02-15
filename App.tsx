import React, { useState, useCallback, useEffect } from 'react';
import { UploadedFile, ChatMessage } from './types';
import { generateResponse } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudFunctionUrl, setCloudFunctionUrl] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('cloudFunctionUrl');
    if (savedUrl) {
      setCloudFunctionUrl(savedUrl);
    } else {
      setIsSettingsModalOpen(true);
    }
  }, []);

  const handleSaveUrl = (url: string) => {
    localStorage.setItem('cloudFunctionUrl', url);
    setCloudFunctionUrl(url);
    setIsSettingsModalOpen(false);
    setError(null); // Clear previous errors
  };

  const handleFilesChange = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles(prevFiles => {
      const existingNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
      return [...prevFiles, ...uniqueNewFiles];
    });
    setChatHistory([]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(f => f.name !== fileName));
  }, []);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;
    if (!cloudFunctionUrl) {
      setError("Veuillez configurer l'URL de votre Cloud Function avant de continuer.");
      setIsSettingsModalOpen(true);
      return;
    }

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newHistory);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await generateResponse(uploadedFiles, prompt, cloudFunctionUrl);
      setChatHistory([...newHistory, { role: 'model', content: responseText }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.";
      setError(errorMessage);
       setChatHistory(prev => prev.slice(0, -1)); // Remove the user message if the call fails
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, uploadedFiles, chatHistory, cloudFunctionUrl]);

  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} onSave={handleSaveUrl} />
      <div className="min-h-screen bg-[#1E1F20] text-[#E3E3E3] font-sans flex flex-col">
        <header className="bg-[#1E1F20]/70 backdrop-blur-md p-4 border-b border-[#3e4042] sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoIcon className="h-8 w-8 text-[#A8C7FA]" />
              <h1 className="text-2xl font-bold text-white">
                Nexus AI <span className="text-[#A8C7FA]">RAG</span>
              </h1>
            </div>
            <button onClick={() => setIsSettingsModalOpen(true)} className="text-sm text-gray-400 hover:text-white transition-colors">
              Configuration
            </button>
          </div>
        </header>

        <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <FileUpload 
              files={uploadedFiles}
              onFilesChange={handleFilesChange}
              onRemoveFile={handleRemoveFile}
            />
          </aside>

          <section className="flex-grow flex flex-col bg-[#2D2E31] rounded-lg border border-[#3e4042] overflow-hidden">
            <ChatWindow
              chatHistory={chatHistory}
              isLoading={isLoading}
              error={error}
              onSendMessage={handleSendMessage}
              hasFiles={uploadedFiles.length > 0}
            />
          </section>
        </main>
      </div>
    </>
  );
};

export default App;
