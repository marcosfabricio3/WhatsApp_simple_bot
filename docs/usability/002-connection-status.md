# Title

Indicadores de conexión

## Objetivo

Mostrar en tiempo real el estado de conexiones críticas.

## Requisitos

### WhatsApp

- Estado visible:
  - Conectado
  - Desconectado
  - Reconectando
  - Error

- Basado en:
  - whatsapp-web.js eventos

---

## IA (OpenAI)

- Estado visible:
  - Disponible
  - Error de API
  - Timeout

- Basado en:
  - OpenAI API health check

---

## UI

- Indicadores tipo badge:
  - 🟢 Verde → OK
  - 🔴 Rojo → Error
  - 🟡 Amarillo → Reconectando
