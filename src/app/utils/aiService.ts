// AI Service - Configuración para conectar con APIs de IA

/**
 * CONFIGURACIÓN DE API
 *
 * OpenAI API (usa fetch, sin paquetes extra):
 *   - Obtén tu API key en: https://platform.openai.com/api-keys
 *   - Configura VITE_OPENAI_API_KEY en .env.local o reemplaza abajo
 *
 * IMPORTANTE:
 * - Nunca expongas API keys en código frontend en producción
 * - Usa variables de entorno o un backend proxy
 */

// Configuración de OpenAI (REST API vía fetch)
const API_CONFIG = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? 'YOUR_OPENAI_API_KEY_HERE',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
};

// Sistema de prompts base
const BASE_SYSTEM_PROMPT = `Eres un asistente de IA para una plataforma que sigue los principios de Material Design 3. 
Debes responder de manera clara, concisa y útil. Cuando proporciones información sobre diseño:

- Prioriza la accesibilidad y los estándares WCAG
- Sugiere colores del tema personalizado cuando sea relevante
- Recomienda componentes que sigan las guías de Material Design 3
- Menciona las jerarquías visuales apropiadas usando los tokens de superficie
- Considera tanto el tema claro como el oscuro en tus recomendaciones

Tema personalizado:
- Color primario: #415F91 (light) / #AAC7FF (dark)
- Color secundario: #565F71 (light) / #BEC6DC (dark)
- Color terciario: #705575 (light) / #DDBCE0 (dark)

Siempre mantén un tono profesional, amigable y educativo.`;

function buildSystemPrompt(context?: string): string {
  if (!context || !context.trim()) {
    return BASE_SYSTEM_PROMPT;
  }
  return `${BASE_SYSTEM_PROMPT}

Tienes acceso al siguiente contexto para responder preguntas sobre la página y sus datos:
---
${context.trim()}
---
Responde ÚNICAMENTE basándote en esta información cuando el usuario pregunte sobre el contenido. Si la pregunta no puede responderse con el contexto proporcionado, indícalo amablemente.`;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Envía un mensaje a la API de OpenAI (REST vía fetch, sin SDK)
 */
async function sendToOpenAI(messages: ChatMessage[], context?: string): Promise<string> {
  const systemPrompt = buildSystemPrompt(context);
  const response = await fetch(API_CONFIG.openai.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.openai.apiKey}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Función principal para enviar mensajes a la IA
 * @param messages - Historial de mensajes
 * @param context - Contexto opcional (página + API) para RAG
 */
export async function sendMessage(messages: ChatMessage[], context?: string): Promise<string> {
  const apiKey = API_CONFIG.openai.apiKey;

  // Modo demo: respuestas simuladas si no hay API key
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    console.warn('OpenAI API key no configurada. Usando modo demo.');
    return simulateAIResponse(messages[messages.length - 1].content);
  }

  try {
    return await sendToOpenAI(messages, context);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return simulateAIResponse(messages[messages.length - 1].content);
  }
}

/**
 * Simula respuestas de IA para modo demo (sin API key)
 */
function simulateAIResponse(userMessage: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `Entiendo tu pregunta sobre "${userMessage}". En Material Design 3, recomendaría usar el color primario #415F91 para elementos interactivos principales, asegurando un contraste adecuado con el fondo.`,

        `Gracias por tu consulta. Según las guías de Material Design 3, para este caso sugiero utilizar los contenedores de superficie (surface-container-high o surface-container-highest) para crear jerarquía visual apropiada.`,

        `Excelente pregunta. Te recomiendo seguir los principios de accesibilidad WCAG, manteniendo un contraste mínimo de 4.5:1 para texto normal. El tema personalizado ya cumple con estos estándares.`,

        `Para "${userMessage}", considera usar componentes elevados con sombras sutiles. En el tema claro, usa surface-container con el outline #74777F para bordes definidos.`,

        `De acuerdo con Material Design 3, te sugiero implementar estados interactivos con overlays del 8-12% para hover y 12-16% para pressed. Esto mejorará la experiencia de usuario.`,
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      resolve(randomResponse);
    }, 1000 + Math.random() * 1500);
  });
}

/**
 * Información de configuración para mostrar al usuario
 */
export function getConfigInfo() {
  const openaiConfigured = !API_CONFIG.openai.apiKey.startsWith('YOUR_');

  return {
    openai: {
      configured: openaiConfigured,
      model: API_CONFIG.openai.model,
    },
    isDemoMode: !openaiConfigured,
  };
}
