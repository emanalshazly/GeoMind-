import React, { useState, useRef, useEffect } from 'react';
import { Send, Map as MapIcon, MessageSquare, Sparkles, Loader2, Navigation, Utensils, Coffee, Landmark, Cloud } from 'lucide-react';
import { Message, ModelType, Coordinates } from '../types';
import ChatMessage from './ChatMessage';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onModelChange: (model: ModelType) => void;
  currentModel: ModelType;
  userLocation: Coordinates | null;
  onRequestLocation: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onModelChange,
  currentModel,
  userLocation,
  onRequestLocation
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/90 backdrop-blur-sm md:bg-white/80 border-r border-slate-200 shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
              <MapIcon size={18} />
            </div>
            GeoMind
          </h1>
          {!userLocation && (
             <button 
               onClick={onRequestLocation}
               className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
             >
               <Navigation size={12} /> Enable Location
             </button>
          )}
        </div>

        {/* Model Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-lg relative">
          <button
            onClick={() => onModelChange(ModelType.LOCATION_SEARCH)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 z-10 ${
              currentModel === ModelType.LOCATION_SEARCH
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapIcon size={14} />
            Maps & Search
          </button>
          <button
            onClick={() => onModelChange(ModelType.DEEP_CHAT)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 z-10 ${
              currentModel === ModelType.DEEP_CHAT
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={14} />
            Pro Chat
          </button>
        </div>
        
        <div className="mt-2 text-xs text-slate-400 text-center">
          {currentModel === ModelType.LOCATION_SEARCH 
            ? "Powered by Gemini 2.5 Flash with Google Grounding" 
            : "Powered by Gemini 3 Pro Preview"}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <MapIcon size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to GeoMind AI</h2>
            <p className="text-slate-500 max-w-xs leading-relaxed mb-8 text-sm">
              Your intelligent companion for exploring the world. I can help you discover local gems, check real-time weather, or discuss complex topics.
            </p>
            
            <div className="w-full max-w-xs space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-left pl-1">Try asking:</p>
              
              <button 
                onClick={() => onSendMessage("Find the best coffee shops within walking distance")}
                className="w-full text-sm bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-amber-300 hover:shadow-md text-left transition-all group flex items-center justify-between"
              >
                <span className="text-slate-700">Find coffee shops nearby</span>
                <Coffee size={16} className="text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => onSendMessage("What is the weather like at this location right now?")}
                className="w-full text-sm bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-blue-300 hover:shadow-md text-left transition-all group flex items-center justify-between"
              >
                <span className="text-slate-700">Check current weather</span>
                <Cloud size={16} className="text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => onSendMessage("Plan a 3-day itinerary for a cultural trip to Tokyo")}
                className="w-full text-sm bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-purple-300 hover:shadow-md text-left transition-all group flex items-center justify-between"
              >
                <span className="text-slate-700">Plan a 3-day trip to Tokyo</span>
                <Sparkles size={16} className="text-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-blue-500" />
              <span className="text-sm text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips (Only for Location Search) */}
      {currentModel === ModelType.LOCATION_SEARCH && !isLoading && (
         <div className="px-4 pt-2 pb-2 flex gap-2 overflow-x-auto scrollbar-hide bg-slate-50/50 border-t border-slate-100">
            <button
              onClick={() => onSendMessage("What are the most interesting landmarks or attractions in this area?")}
              className="flex-shrink-0 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles size={12} className="text-emerald-500" /> Explore Area
            </button>
            <button
              onClick={() => onSendMessage("Recommend some highly rated restaurants nearby.")}
              className="flex-shrink-0 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Utensils size={12} className="text-blue-500" /> Restaurants
            </button>
            <button
              onClick={() => onSendMessage("Where can I find good coffee nearby?")}
              className="flex-shrink-0 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Coffee size={12} className="text-amber-600" /> Coffee
            </button>
             <button
              onClick={() => onSendMessage("What are some historical landmarks nearby?")}
              className="flex-shrink-0 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Landmark size={12} className="text-purple-500" /> Landmarks
            </button>
         </div>
      )}

      {/* Input Area */}
      <div className={`p-4 bg-white ${currentModel !== ModelType.LOCATION_SEARCH ? 'border-t border-slate-200' : ''}`}>
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentModel === ModelType.LOCATION_SEARCH ? "Search maps or ask anything..." : "Ask complex questions..."}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;