
import React, { useState, useCallback } from 'react';
import { UploadedFile, ChatMessage } from './types';
import { generateResponse } from './services/geminiService';
import FileUpload from './components/FileUpload';
import ChatWindow from './components/ChatWindow';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles(prevFiles => {
      const existingNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
      return [...prevFiles, ...uniqueNewFiles];
    });
    // Reset chat when new documents are added
    setChatHistory([]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(f => f.name !== fileName));
  }, []);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newHistory);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await generateResponse(uploadedFiles, prompt);
      setChatHistory([...newHistory, { role: 'model', content: responseText }]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.";
      setError(errorMessage);
       setChatHistory(prev => prev.slice(0, -1)); // Remove the user message if the call fails
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, uploadedFiles, chatHistory]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans flex flex-col">
      <header className="bg-slate-900/70 backdrop-blur-md p-4 border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100">
            Nexus AI <span className="text-indigo-400">RAG</span>
          </h1>
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

        <section className="flex-grow flex flex-col bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
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
  );
};

export default App;
