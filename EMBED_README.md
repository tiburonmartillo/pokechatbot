# Incrustar el chatbot en una página existente

Este chatbot puede incrustarse en cualquier página web. Consume el contenido de la página y datos de una API REST para responder preguntas sobre ese contenido.

## Inclusión básica

Añade el script antes de cerrar `</body>`:

```html
<script 
  src="https://tu-dominio.com/embed.js" 
  data-chatbot-url="https://tu-dominio.com"
></script>
```

- `data-chatbot-url`: URL base donde está desplegado el chatbot (debe incluir el embed en `/embed.html`).

Esto crea un botón flotante en la esquina inferior derecha. Al hacer clic, se abre el chat. El script extrae automáticamente el texto visible de la página (`document.body.innerText`) y lo envía al chatbot como contexto.

## Con API REST

Si quieres que el chatbot use datos de tu API:

```html
<script 
  src="https://tu-dominio.com/embed.js" 
  data-chatbot-url="https://tu-dominio.com"
  data-api-base-url="https://api.tusitio.com"
  data-api-endpoints="/products,/faq,/content"
  data-api-token="tu-token-opcional"
></script>
```

- `data-api-base-url`: URL base de tu API REST.
- `data-api-endpoints`: Endpoints separados por comas (ej: `/products,/faq`). Por defecto se usa `/`.
- `data-api-token`: Token opcional para `Authorization: Bearer`.

## Envío manual de contexto

Si prefieres enviar el contexto tú mismo (por ejemplo, contenido filtrado o estructurado):

```html
<script src="https://tu-dominio.com/embed.js" data-chatbot-url="https://tu-dominio.com"></script>
<script>
  window.addEventListener('message', function(e) {
    if (e.data?.type === 'CHATBOT_READY') {
      var iframe = document.querySelector('[data-chatbot-iframe]');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'INIT',
          pageContent: 'Tu contenido personalizado aquí...',
          apiConfig: {
            baseUrl: 'https://api.tusitio.com',
            endpoints: ['/products', '/faq'],
            token: 'opcional'
          }
        }, '*');
      }
    }
  });
</script>
```

## Tipos de mensajes postMessage

El iframe del chatbot acepta estos mensajes desde la ventana padre:

| Tipo         | Descripción                          |
|--------------|--------------------------------------|
| `PAGE_CONTENT` | `{ type: 'PAGE_CONTENT', content: string }` |
| `API_CONFIG`   | `{ type: 'API_CONFIG', baseUrl: string, endpoints?: string[], token?: string }` |
| `INIT`         | `{ type: 'INIT', pageContent?: string, apiConfig?: {...} }` |

## CORS

Tu API REST debe permitir el origen del chatbot en los headers CORS, por ejemplo:

```
Access-Control-Allow-Origin: https://tu-dominio.com
```

## Despliegue

1. Ejecuta `npm run build`.
2. Sirve la carpeta `dist/` (incluye `index.html`, `embed.html`, `embed.js` y `assets/`).
3. Configura `VITE_OPENAI_API_KEY` en el entorno de build o en `.env` antes de compilar.
