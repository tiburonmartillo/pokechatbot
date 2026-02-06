import React, { useState, KeyboardEvent } from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false, loading = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 bg-[var(--md-surface-container)] border-t border-[var(--md-outline-variant)]">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Escribe un mensaje..."
        disabled={disabled || loading}
        rows={1}
        className="flex-1 resize-none rounded-3xl px-6 py-3 bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          minHeight: '48px',
          maxHeight: '120px',
        }}
      />
      
      <IconButton
        onClick={handleSend}
        disabled={!message.trim() || disabled || loading}
        sx={{
          bgcolor: 'var(--md-primary)',
          color: 'var(--md-on-primary)',
          width: 48,
          height: 48,
          '&:hover': {
            bgcolor: 'var(--md-primary)',
            opacity: 0.9,
          },
          '&:disabled': {
            bgcolor: 'var(--md-surface-variant)',
            color: 'var(--md-on-surface-variant)',
            opacity: 0.38,
          },
        }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
      </IconButton>
    </div>
  );
}
