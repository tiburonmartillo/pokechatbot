import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { Bot } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { sendMessage } from './utils/aiService';
import {
  initContextListener,
  getContextForPrompt,
  subscribeToContext,
  notifyChatbotReady,
} from './utils/contextService';
import type { Message } from './components/ChatMessage';

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: '¡Hola! Soy tu asistente. Puedo responder preguntas sobre el contenido de esta página y los datos disponibles. ¿En qué puedo ayudarte?',
  timestamp: new Date(),
};

export function EmbeddableChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#415F91', contrastText: '#FFFFFF' },
          secondary: { main: '#565F71', contrastText: '#FFFFFF' },
          background: { default: '#F9F9FF', paper: '#FFFFFF' },
          text: { primary: '#191C20', secondary: '#44474E' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily:
            "'Kumbh Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }),
    []
  );

  useEffect(() => {
    initContextListener();
    notifyChatbotReady();

    const unsubscribe = subscribeToContext((state) => {
      const parts: string[] = [];
      if (state.pageContent) parts.push(state.pageContent);
      if (state.apiData) parts.push(state.apiData);
      setContext(parts.join('\n\n'));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const apiMessages = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content });

      const contextForPrompt = await getContextForPrompt();
      const response = await sendMessage(apiMessages, contextForPrompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col h-full bg-[var(--md-background)]">
        <Box
          sx={{
            py: 1.5,
            px: 2,
            borderBottom: '1px solid var(--md-outline-variant)',
            bgcolor: 'var(--md-surface-container)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Bot size={24} style={{ color: 'var(--md-primary)' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--md-on-surface)' }}>
            Asistente
          </Typography>
        </Box>

        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ backgroundColor: 'var(--md-background)' }}>
          <div className="max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} loading={isTyping} />
      </div>
    </ThemeProvider>
  );
}
