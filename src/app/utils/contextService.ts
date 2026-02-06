/**
 * Context Service - Recibe y almacena contexto de la página anfitriona y API REST
 * para que el chatbot responda preguntas sobre ese contenido.
 */

export interface ApiConfig {
  baseUrl: string;
  endpoints?: string[];
  token?: string;
}

export interface ContextState {
  pageContent: string;
  apiConfig: ApiConfig | null;
  apiData: string;
}

const state: ContextState = {
  pageContent: '',
  apiConfig: null,
  apiData: '',
};

type MessageHandler = (state: ContextState) => void;
const listeners: Set<MessageHandler> = new Set();

/**
 * Inicializa el listener de postMessage desde la ventana padre.
 * Debe llamarse cuando el chatbot está en modo embed (iframe).
 */
export function initContextListener(allowedOrigins?: string[]): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('message', (event: MessageEvent) => {
    // Validar origen si se especifica
    if (allowedOrigins?.length && event.origin && !allowedOrigins.includes(event.origin)) {
      return;
    }

    const data = event.data;
    if (!data || typeof data !== 'object' || !data.type) return;

    switch (data.type) {
      case 'PAGE_CONTENT':
        if (typeof data.content === 'string') {
          state.pageContent = data.content;
          notifyListeners();
        }
        break;

      case 'API_CONFIG':
        if (data.baseUrl && typeof data.baseUrl === 'string') {
          state.apiConfig = {
            baseUrl: data.baseUrl.replace(/\/$/, ''),
            endpoints: Array.isArray(data.endpoints) ? data.endpoints : ['/'],
            token: typeof data.token === 'string' ? data.token : undefined,
          };
          notifyListeners();
          fetchApiData();
        }
        break;

      case 'INIT':
        if (typeof data.pageContent === 'string') {
          state.pageContent = data.pageContent;
        }
        if (data.apiConfig?.baseUrl) {
          state.apiConfig = {
            baseUrl: data.apiConfig.baseUrl.replace(/\/$/, ''),
            endpoints: Array.isArray(data.apiConfig.endpoints) ? data.apiConfig.endpoints : ['/'],
            token: typeof data.apiConfig.token === 'string' ? data.apiConfig.token : undefined,
          };
          fetchApiData();
        }
        notifyListeners();
        break;
    }
  });
}

/**
 * Obtiene los datos de la API REST configurada.
 */
async function fetchApiData(): Promise<void> {
  const config = state.apiConfig;
  if (!config) return;

  const endpoints = config.endpoints?.length ? config.endpoints : ['/'];
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.token) {
    headers['Authorization'] = `Bearer ${config.token}`;
  }

  const results: string[] = [];

  for (const endpoint of endpoints) {
    const url = `${config.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        results.push(`[Error ${response.status} en ${endpoint}]`);
        continue;
      }
      const data = await response.json();
      results.push(JSON.stringify(data, null, 0));
    } catch (err) {
      results.push(`[Error de red en ${endpoint}]`);
    }
  }

  state.apiData = results.join('\n\n');
  notifyListeners();
}

/**
 * Suscribe a cambios en el contexto.
 */
export function subscribeToContext(handler: MessageHandler): () => void {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

function notifyListeners(): void {
  const snapshot = { ...state };
  listeners.forEach((h) => h(snapshot));
}

/**
 * Obtiene el contexto combinado para inyectar en el prompt.
 */
export async function getContextForPrompt(): Promise<string> {
  // Si hay apiConfig pero apiData está vacío, intentar fetch
  if (state.apiConfig && !state.apiData) {
    await fetchApiData();
  }

  const parts: string[] = [];

  if (state.pageContent.trim()) {
    parts.push('CONTENIDO DE LA PÁGINA:\n' + state.pageContent.trim());
  }

  if (state.apiData.trim()) {
    parts.push('DATOS DE LA API:\n' + state.apiData.trim());
  }

  return parts.join('\n\n---\n\n');
}

/**
 * Obtiene el estado actual del contexto (sin hacer fetch).
 */
export function getContextState(): ContextState {
  return { ...state };
}

/**
 * Notifica a la ventana padre que el chatbot está listo.
 */
export function notifyChatbotReady(): void {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'CHATBOT_READY' }, '*');
  }
}
