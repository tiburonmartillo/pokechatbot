import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { Bot, Moon, Sun, Info } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { sendMessage, getConfigInfo } from './utils/aiService';
import type { Message } from './components/ChatMessage';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA con Material Design 3. Puedo ayudarte con consultas sobre diseño, desarrollo y mejores prácticas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const configInfo = getConfigInfo();

  // Material UI theme siguiendo Material Design 3 - Memoizado para evitar recreación
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#AAC7FF' : '#415F91',
        contrastText: darkMode ? '#0A305F' : '#FFFFFF',
      },
      secondary: {
        main: darkMode ? '#BEC6DC' : '#565F71',
        contrastText: darkMode ? '#283141' : '#FFFFFF',
      },
      background: {
        default: darkMode ? '#111318' : '#F9F9FF',
        paper: darkMode ? '#1D2024' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#E2E2E9' : '#191C20',
        secondary: darkMode ? '#C4C6D0' : '#44474E',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: "'Kumbh Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      h1: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      h2: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      h3: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      h4: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      h5: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
      h6: {
        fontFamily: "'Anek Latin', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
    },
  }), [darkMode]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Aplicar clase dark al documento
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSendMessage = async (content: string) => {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Convertir mensajes al formato esperado por la API
      const apiMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      // Agregar el nuevo mensaje del usuario
      apiMessages.push({
        role: 'user',
        content,
      });

      // Llamar a la API de IA
      const response = await sendMessage(apiMessages);

      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, verifica tu configuración de API o intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex flex-col h-screen bg-[var(--md-background)]">
        {/* App Bar */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            bgcolor: 'var(--md-surface-container)',
            color: 'var(--md-on-surface)',
            borderBottom: '1px solid var(--md-outline-variant)',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Bot size={28} style={{ color: 'var(--md-primary)' }} />
              <Typography variant="h6" component="h1">
                Asistente IA Material Design 3
              </Typography>
            </Box>

            {configInfo.isDemoMode && (
              <Chip 
                label="Modo Demo" 
                size="small" 
                sx={{ 
                  mr: 2,
                  bgcolor: 'var(--md-tertiary-container)',
                  color: 'var(--md-on-tertiary-container)',
                }}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  icon={<Sun size={16} />}
                  checkedIcon={<Moon size={16} />}
                />
              }
              label=""
              sx={{ mr: 0 }}
            />

            <IconButton 
              onClick={() => setShowInfo(true)}
              sx={{ color: 'var(--md-on-surface-variant)' }}
            >
              <Info size={20} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{ backgroundColor: 'var(--md-background)' }}
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping}
          loading={isTyping}
        />

        {/* Info Snackbar */}
        <Snackbar
          open={showInfo}
          autoHideDuration={8000}
          onClose={() => setShowInfo(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowInfo(false)} 
            severity="info"
            sx={{ 
              width: '100%',
              maxWidth: '600px',
              bgcolor: 'var(--md-surface-container-high)',
              color: 'var(--md-on-surface)',
            }}
          >
            {configInfo.isDemoMode ? (
              <>
                <strong>Modo Demo Activado:</strong> Para conectar con una API de IA real, 
                configura tu API key en <code>/src/app/utils/aiService.ts</code>. 
                Actualmente se están usando respuestas simuladas.
              </>
            ) : (
              <>
                <strong>API Configurada:</strong> Conectado a OpenAI
              </>
            )}
          </Alert>
        </Snackbar>
      </div>
    </ThemeProvider>
  );
}

export default App;