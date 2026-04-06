# Title

Uso de OpenAI para parsing fallback

## Status

Accepted

## Context

Regex no cubre todos los casos debido a variaciones humanas.

## Decision

Se utiliza OpenAI solo como fallback

## Rationale

- Alta precisión en texto ambiguo
- Fácil integración

## Consequences

### Positivas

- Mejora detección
- Reduce falsos negativos

### Negativas

- Costo por uso
- Dependencia externa
