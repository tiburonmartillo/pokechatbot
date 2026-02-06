import React from 'react';
import { Avatar } from '@mui/material';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar
        sx={{
          bgcolor: 'var(--md-secondary)',
          width: 40,
          height: 40,
        }}
      >
        <Bot size={20} />
      </Avatar>
      
      <div className="flex flex-col gap-1">
        <div
          className="rounded-2xl px-4 py-3 bg-[var(--md-surface-container-high)] text-[var(--md-on-surface)]"
          style={{
            borderRadius: '20px 20px 20px 4px',
          }}
        >
          <div className="flex gap-1 items-center">
            <div className="w-2 h-2 rounded-full bg-[var(--md-on-surface-variant)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[var(--md-on-surface-variant)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[var(--md-on-surface-variant)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
