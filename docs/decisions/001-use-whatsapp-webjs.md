# Title

Uso de whatsapp-web.js para integración con WhatsApp

## Status

Accepted

## Context

El sistema requiere leer y enviar mensajes de WhatsApp en tiempo real sin costo.

opciones evaluadas:

- WhatsApp business API (oficial)
- Librerias no oficiales

## Decision

se utilizara WhatsApp-web.js

## Rationale

- No requiere pago
- Fácil integración con Node.js
- Permite lectura y envío de mensajes
- Funciona con cuenta personal

## Consequences

- Dependencia de WhatsApp Web (posibles cambios)
- Riesgo de desconexión
- No es solución oficial
