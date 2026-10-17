# Academia Knowledge Agent

Asistente web de conocimiento que recupera fuentes de una base documental pequeña, muestra evidencia junto a la respuesta y se abstiene cuando la recuperación no supera el umbral configurado. Está pensado como proyecto de portafolio Full Stack e IA aplicada.

> **Estado honesto:** prototipo funcional para demostración local. La búsqueda es léxica tipo BM25 simplificada; no usa embeddings, una base vectorial ni re-ranking semántico. Los documentos son ficticios. El modo LLM es opcional.

## Qué puedes explorar

- Experiencia de chat en español con preguntas sugeridas, conversación efímera y control para borrarla.
- API REST para estado, inventario documental, inspección de recuperación y respuestas.
- Recuperación con normalización de acentos, eliminación de palabras vacías, ponderación de título/categoría y límite de tres fuentes.
- Modo demo sin claves y generación opcional con una API compatible con OpenAI Chat Completions.
- Abstención en preguntas sin evidencia suficiente; vista de fragmentos recuperados y puntaje léxico por fuente.
- Conjunto pequeño de evaluación de recuperación con Hit@1 y Hit@3.
- Imagen Docker de dos etapas para compilar y ejecutar la aplicación.

## Arquitectura

```text
Browser (HTML/CSS/JS)
       │ REST /api
       ▼
Express routes ──► answer service ──► retrieval service ──► knowledge base
                          │
                          └──────────► LLM provider (optional)
```

- `src/routes`: contratos HTTP y validación de entrada.
- `src/services`: recuperación y composición de respuesta.
- `src/data`: documentos de demostración.
- `src/middleware`: manejo centralizado de errores.
- `public`: interfaz accesible y estática.
- `scripts/evaluate-retrieval.ts`: medición reproducible sobre preguntas de ejemplo.

## Requisitos y ejecución local

Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para compilar y servir:

```bash
npm run build
npm start
```

La demo funciona sin credenciales. Para generación con un proveedor compatible, copia `.env.example` a `.env` y define:

```env
LLM_BASE_URL=https://api.example.com/v1
LLM_API_KEY=...
LLM_MODEL=...
```

No incluyas `.env` o claves en GitHub. El servicio envía al proveedor externo la pregunta y hasta tres documentos recuperados; usa contenido público o autorizado.

## API

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/health` | Estado, modo activo y cantidad de documentos |
| `GET` | `/api/documents` | Metadatos de los documentos disponibles |
| `POST` | `/api/retrieve` | Devuelve fragmentos y puntajes sin llamar al LLM |
| `POST` | `/api/chat` | Respuesta, modo, puntaje de recuperación y fuentes |

Ejemplo:

```json
{ "question": "¿Hay clases virtuales?" }
```

## Medir la recuperación

```bash
npm run eval:retrieval
```

El script informa Hit@1 y Hit@3 sobre seis ejemplos creados para esta base. El conjunto es pequeño y construido a mano; sus resultados no representan precisión en producción ni calidad de respuestas generativas.

## Docker

```bash
docker build -t academia-knowledge-agent .
docker run --rm -p 3000:3000 academia-knowledge-agent
```

Para usar un proveedor, pasa las variables al contenedor con un gestor de secretos; no las escribas en la imagen.

## Límites y próximos pasos

No incluye carga documental, extracción PDF, autenticación, autorización, historial persistente, telemetría, limitación de llamadas, base vectorial ni evaluación automática de fidelidad. El umbral y puntajes léxicos no equivalen a confianza calibrada. El prompt reduce instrucciones hostiles, pero no constituye una garantía contra prompt injection. Antes de una publicación real: usar documentos autorizados, construir pruebas de recuperación/respuesta, definir retención y privacidad, controlar el uso del proveedor y agregar controles de seguridad.
