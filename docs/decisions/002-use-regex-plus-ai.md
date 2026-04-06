# Title

Uso de Regex + IA como fallback para parsing

## Status

Accepted

## Context

Los mensajes tienen formato semi-estructurado con pequeñas variaciones.

Opciones:

- Solo regex
- Solo IA
- Híbrido

## Decision

Se implementa un enfoque híbrido:

- Regex como primera capa
- IA como fallback

## Rationale

- Regex es rápido y gratis
- IA permite tolerar errores humanos
- Reduce costos de API

## Consequences

### Positivas

- Alto rendimiento
- Bajo costo
- Mayor robustez

### Negativas

- Mayor complejidad que una sola técnica
- Necesidad de mantener prompts
