
import React from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon } from './Icons';

interface MessageProps {
  message: ChatMessage;
  isLoading?: boolean;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
  </div>
);

const Message: React.FC<MessageProps> = ({ message, isLoading = false }) => {
  const isModel = message.role === 'model';

  // A very simple markdown-like renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-item list-disc">
            {trimmedLine.substring(2)}
          </li>
        );
      }
      return <p key={index}>{line}&nbsp;</p>; // &nbsp; to preserve empty lines
    });
  };

  const containerClasses = `flex items-start gap-4 ${isModel ? '' : 'justify-end'}`;
  const messageBubbleClasses = `max-w-2xl px-5 py-3 rounded-2xl ${
    isModel 
      ? 'bg-slate-700 text-slate-200 rounded-tl-none' 
      : 'bg-indigo-600 text-white rounded-br-none'
  }`;

  const Icon = isModel ? BotIcon : UserIcon;
  const iconClasses = `w-8 h-8 p-1 rounded-full flex-shrink-0 ${
    isModel ? 'bg-slate-700 text-indigo-300' : 'bg-indigo-600 text-white'
  }`;
  
  const content = (
    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5" style={{ whiteSpace: 'pre-wrap' }}>
      {isLoading ? <TypingIndicator /> : renderContent(message.content)}
    </div>
  );

  return (
    <div className={containerClasses}>
      {isModel && <Icon className={iconClasses} />}
      <div className={messageBubbleClasses}>
        {content}
      </div>
      {!isModel && <Icon className={iconClasses} />}
    </div>
  );
};

export default Message;
