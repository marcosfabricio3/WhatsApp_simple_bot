# WhatsApp Automatisation

A web application that enables users to create WhatsApp message automations in a friendly and intuitive way. Users can schedule personalized messages that are sent periodically and configure chat listeners to respond automatically.

---

## Requisitos

- Node.js LTS (v18+)
- npm o yarn
- Docker Desktop (opcional)

---

## Instalación

### Servidor

```powershell
cd packages/server
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Cliente (Frontend)

```powershell
cd packages/client
npm install
```

---

## Uso

### Desarrollo

#### Servidor

```powershell
cd packages/server
npm run dev
```

El servidor corre en `http://localhost:3001`

#### Cliente

```powershell
cd packages/client
npm run dev
```

El cliente corre en `http://localhost:5173`

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificar estado del servidor |

---

## Estructura del Proyecto

```
whatsapp-automatisation/
├── packages/
│   ├── server/           # Backend Express + Prisma
│   │   ├── src/
│   │   │   ├── index.js  # Entry point
│   │   │   └── lib/      # Utilities
│   │   └── prisma/
│   │       └── schema.prisma
│   └── client/           # Frontend React + Vite
├── docker-compose.yml
└── Dockerfile
```

---

## Tecnologías

| Componente | Tecnología |
|------------|-------------|
| Frontend | React ^18 + Vite |
| Backend | Node.js + Express |
| WhatsApp | Baileys ^6 |
| ORM | Prisma ^7 |
| Database | SQLite |

---

## Docker (Opcional)

```powershell
docker-compose up --build
```

---

## Contribución

Proyecto personal de aprendizaje.

---

## Licencia

ISC