import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, GroundingChunk } from '../types';
import { Bot, User, MapPin, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-emerald-600'} text-white shadow-sm`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm ${
              isUser 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}
          >
            {message.isError ? (
               <span className="text-red-200">{message.text}</span>
            ) : (
              <div className={`markdown-body ${isUser ? 'text-white' : 'text-slate-800'}`}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Grounding Chips (Sources) */}
          {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 w-full">
              {message.groundingChunks.map((chunk, idx) => {
                if (chunk.web) {
                  return (
                    <a 
                      key={idx}
                      href={chunk.web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[150px]">{chunk.web.title}</span>
                    </a>
                  );
                }
                if (chunk.maps) {
                  return (
                    <a 
                      key={idx}
                      href={chunk.maps.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2 py-1 rounded-md text-xs text-emerald-700 hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <MapPin size={10} />
                      <span className="truncate max-w-[150px]">{chunk.maps.title}</span>
                    </a>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;