import React from 'react';
import { Avatar } from '@mui/material';
import { Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar
        sx={{
          bgcolor: isUser ? 'var(--md-primary)' : 'var(--md-secondary)',
          width: 40,
          height: 40,
        }}
      >
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </Avatar>
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]'
              : 'bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)]'
          }`}
          style={{
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <span className="text-xs text-[var(--md-on-surface-variant)] px-2">
          {message.timestamp.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
}
