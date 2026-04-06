## 1. Overview

Sistema de automatización que:

1. Escucha mensajes entrantes desde chats espesificos de WhatsApp
2. Filtra mensajes relevantes mediante reglas (regex)
3. Usa IA como fallback para tolerancia a variantes
4. Extrae datos estructurados (fecha, hora, dirección)
5. Ejecuta acciones configurables:
   - Crear evento en calendario
   - Enviar email
   - Enviar mensaje de WhatsApp

El sistema está diseñado para ejecución continua (24/7), bajo consumo y alta tolerancia a errores en texto.

---

## 2. Tech Stack

Backend

- Node.js
- Express
- whatsapp-web.js
  Frontend
- React
- Vite
  IA (fallback)
- OpenAI API
  Integraciones
- Google Calendar API
- SMTP / Gmail API
  Infraestructura
- VPS (DigitalOcean / AWS)
- PM2 (process manager)

---

## 3. High-Level Architecture

WhatsApp → Bot Listener → Message Filter → Parser → Action Engine
↓
IA Fallback
↓
Structured Data
↓
Calendar / Mail / WhatsApp
↓
Logs

---

## 4. Componentes

### 4.1 WhatsApp Listener

Responsable de:

- Autenticación vía QR
- Escuchar eventos de mensajes
- Filtrar chats permitidos

Tecnología: whatsapp-web.js

---

### 4.2 Message Filter

Primera capa de validación:

- Keywords obligatorias
- Regex de fecha y hora

Objetivo:

- Reducir llamadas a IA
- Procesamiento rápido

---

### 4.3 Parser

Dos modos:

A) Regex Parser

- Extracción directa
- Alto rendimiento
  B) IA Parser (fallback)
- Clasificación (válido / inválido)
- Extracción estructurada

---

### 4.4 Action Engine

Ejecuta acciones según configuración:

- Crear evento
- Enviar email
- Enviar mensaje

Patrón: Strategy Pattern

---

### 4.5 Config Manager

Maneja configuración dinámica:

- Chats permitidos
- Acciones habilitadas
- Destinos

Formato: JSON editable

---

### 4.6 Frontend (React + Vite)

Interfaz para:

- Configurar automatización
- Ver logs
- Activar/desactivar acciones
- Testear mensajes manualmente

Comunicación con backend vía REST API

---

## 5. Data Flow

1. Llega mensaje
2. Validación de chat permitido
3. Filtro regex:
   - Si pasa → parsing directo
   - Si falla → IA fallback
4. Extracción de datos
5. Ejecución de acciones
6. Registro en logs

---

## 6. API Design

Base URL

/api

Endpoints
GET /config

Obtiene configuración actual

POST /config

Actualiza configuración

GET /logs

Devuelve logs recientes

POST /test-message

Simula procesamiento de mensaje

{
"message": "texto..."
}

---

## 7. Data Model

Config

{
"chatsPermitidos": ["string"],
"usarIA": true,
"acciones": {
"calendar": true,
"mail": false,
"whatsapp": true
},
"destinos": {
"email": "string",
"whatsapp": "string"
}
}

---

Parsed Message

{
"fecha": "DD/MM",
"horaInicio": "HH:MM",
"horaFin": "HH:MM",
"direccion": "string"
}

---

Log Entry

{
"timestamp": "ISO",
"type": "INFO | ERROR",
"message": "string"
}

---

## 8. Directory Structure

/project
├─/docs
│ ├── architecture.md
│ ├── whatsapp.js
│ ├── parser.js
│ ├── ia.js
│ ├── config/
│ ├── actions/
│ ├── routes/
│ └── logger.js
│
├─/src
│ ├── src/
│ ├── backend/
│ │ ├── index.js
│ │ ├── whatsapp.js
│ │ ├── parser.js
│ │ ├── ia.js
│ │ ├── config/
│ │ ├── actions/
│ │ ├── routes/
│ │ └── logger.js
│ │
│ ├── frontend/
│ │ ├── assets/
│ │ ├── components/
│ │ ├── services/
│ │ ├── styles/
│ │ └─── pages
│ │
│ │
│ ├─── app.css
│ ├─── index.css
│ ├─── main.js
│ └─── App.jsx
│  
├─.gitignore
├─ vite.config.js
├── index.html  
├─── package.json
├─ package-lock.json
├─ README.md
├─ .env
└── eslint.config.js

---

## 9. Design Patterns

- Pipeline Pattern
  → procesamiento secuencial del mensaje
- Strategy Pattern
  → acciones configurables
- Fallback Pattern
  → regex → IA
- Observer/Event-driven
  → mensajes de WhatsApp

---

## 10. Infraestructura

Ejecución

- Node.js + PM2
- Persistencia mínima (logs)
  Requisitos
- Conexión estable a internet
- Sesión activa de WhatsApp Web

---

## 11. Consideraciones

- Minimizar uso de IA para reducir costo
- Manejo de errores en integraciones externas
- Logs suficientes para debugging
- Sistema tolerante a cambios en formato de mensaje

---
