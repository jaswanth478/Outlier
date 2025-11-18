import React from 'react';
import { Message, Role } from '../types';
import { Terminal, Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isUser ? 'border-gray-600 bg-gray-800' : 'border-neon/50 bg-neon/10'}`}>
          {isUser ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-neon" />}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
           <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed tracking-wide ${
             isUser 
               ? 'bg-white text-black rounded-tr-none' 
               : 'bg-charcoal border border-gray-800 text-gray-200 rounded-tl-none shadow-lg shadow-neon/5'
           }`}>
             {message.text.split('\n').map((line, i) => (
               <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
             ))}
           </div>
           {message.role === Role.MODEL && (
             <span className="text-[10px] text-gray-600 mt-1 font-mono uppercase">OutlierOS v3.0</span>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;