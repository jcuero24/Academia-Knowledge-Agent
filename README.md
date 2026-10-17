# Academia Knowledge Agent

Asistente web de preguntas y respuestas que recupera fragmentos de una base de conocimiento, muestra las fuentes y se abstiene cuando no hay evidencia suficiente. Incluye interfaz en español, API REST, modo determinista sin credenciales y conexión opcional a una API compatible con OpenAI Chat Completions.

> **Estado:** prototipo de portafolio. Los documentos incluidos son ficticios y el recuperador usa coincidencia léxica; no es una plataforma de producción ni una base vectorial.

## Ejecutar localmente

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para compilar y ejecutar la versión compilada:

```bash
npm run build
npm start
```

El modo demo funciona sin claves: hace recuperación simple y presenta el fragmento recuperado. Para activar generación, copia `.env.example` a `.env` y configura `LLM_BASE_URL`, `LLM_API_KEY` y `LLM_MODEL` para un proveedor compatible. No publiques credenciales ni envíes datos personales.

## API

- `GET /api/health`: estado y modo activo.
- `GET /api/documents`: lista de documentos públicos de ejemplo.
- `POST /api/chat` con `{"question":"¿Cómo consulto horarios?"}`: respuesta, fuentes, modo y puntaje léxico.

## Diseño y límites

- Recuperación léxica simple con normalización de acentos; la puntuación indica coincidencias, no relevancia semántica.
- El endpoint de generación recibe únicamente documentos recuperados y una instrucción para responder con evidencia.
- Hay abstención si la coincidencia es insuficiente. Aun así, los modelos pueden equivocarse; verificar políticas con una persona.
- No hay autenticación, carga de archivos, historial persistente, evaluación automática, rate limiting ni almacenamiento vectorial.
- El conjunto documental es ilustrativo. Reemplázalo solo por información autorizada y vigente.

## Extensiones de portafolio

Agrega evaluación sobre preguntas/respuestas esperadas, ingestión de documentos con permisos, búsqueda semántica comparada contra la búsqueda léxica, telemetría que oculte datos sensibles y despliegue con controles de acceso. Registra métricas observadas y metodología antes de reportar resultados.
