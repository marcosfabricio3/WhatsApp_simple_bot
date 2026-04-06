# Title

No uso de base de datos persistente

## Status

Accepted

## Context

El sistema no requiere almacenamiento histórico complejo.

## Decision

No se utiliza base de datos.
Solo:

- Configuración en JSON
- Logs en archivos

## Rationale

- Simplicidad
- Menor mantenimiento
- Menor costo

## Consequences

### Positivas

- Setup rápido
- Menos dependencias

### Negativas

- Sin historial estructurado
- Escalabilidad limitada
