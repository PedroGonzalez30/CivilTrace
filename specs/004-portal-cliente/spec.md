# Feature 004: portal web del cliente (parte de la app)

**Rama**: `004-portal-cliente` · **Fecha**: 24/11/2026 · **Autor**: Emilio Manuel Esquivel

La especificación completa está en el repo de la API:
`CivilTrace-API/specs/004-portal-cliente/spec.md`. La página web va en un repositorio nuevo,
`CivilTrace-Portal` (T-02). Discrepancia con el SRS V4.0 en P-10.

## Lo que toca a la app

- Botón "Enviar al cliente" en la vista previa del reporte (`SUP_REporte PDF` `179:2834`,
  `ReportePdf -Dueño` `144:1963`) y aviso "Se envió al cliente" (`ReportePdfEnviar -Dueño` `144:2116`).
- Mensajes cuando la obra no tiene correo del cliente o no hay evidencias aprobadas en el periodo.
- Lista de entregas de la obra con su estado (Enviada, Aceptada, Con observaciones), el comentario
  del cliente si la rechazó y la descarga del acta si la aceptó (historia 5).

Las tareas se definen en `plan.md` y `tasks.md` del repo de la API.
