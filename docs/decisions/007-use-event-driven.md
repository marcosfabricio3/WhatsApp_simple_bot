# Title

Arquitectura basada en eventos

## Status

Accepted

## Context

El sistema reacciona a mensajes entrantes.

## Decision

Se implementa un modelo event-driven

## Rationale

- Natural para WhatsApp
- Bajo consumo de recursos
- Escalable

## Consequences

### Positivas

- Eficiencia
- Simplicidad lógica

### Negativas

- Debugging más complejo en eventos encadenados
