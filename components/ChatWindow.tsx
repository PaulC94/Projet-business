
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import Message from './Message';
import { SendIcon, LogoIcon } from './Icons';

interface ChatWindowProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  hasFiles: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatHistory, isLoading, error, onSendMessage, hasFiles }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && hasFiles) {
      onSendMessage(input);
      setInput('');
    }
  };

  const isSendDisabled = isLoading || !hasFiles || !input.trim();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
            <LogoIcon className="w-16 h-16 mb-4 text-slate-600" />
            <h2 className="text-2xl font-semibold text-slate-300">Bienvenue sur Nexus AI</h2>
            <p className="max-w-md mt-2">
              {hasFiles 
                ? "Vos documents sont prêts. Posez une question pour commencer l'analyse." 
                : "Veuillez téléverser un ou plusieurs documents pour démarrer la conversation."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {chatHistory.map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            {isLoading && <Message message={{ role: 'model', content: '' }} isLoading={true} />}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 text-red-300 border-t border-red-800">
          <p><span className="font-bold">Erreur:</span> {error}</p>
        </div>
      )}

      <div className="p-4 md:p-6 border-t border-slate-700 bg-slate-800/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasFiles ? "Posez votre question ici..." : "Veuillez d'abord charger un document"}
            disabled={!hasFiles || isLoading}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
          />
          <button
            type="submit"
            disabled={isSendDisabled}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Envoyer"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
