# Feature 004: portal web del cliente y entregas (parte de la app)

**Rama**: `004-portal-cliente` · **Fecha**: 24/11/2026 · **Autor**: Emilio Manuel Esquivel ·
**Base**: SRS v5.0 (D-28)

La especificación completa está en el repo de la API:
`CivilTrace-API/specs/004-portal-cliente/spec.md`. El portal va en un repositorio nuevo,
`CivilTrace-Portal` (T-02).

## Lo que toca a la app

- RF-65: al guardar una obra, aviso si el correo con el enlace del portal no salió; opción
  "Reenviar enlace al cliente" para el dueño.
- RF-13: en la vista previa del reporte (`SUP_REporte PDF` `179:2834`, `ReportePdf -Dueño`
  `144:1963`), selección de actividades Verificadas y botón "Enviar al cliente"; aviso "Se envió
  al cliente" (`ReportePdfEnviar -Dueño` `144:2116`). Mensajes si falta el correo del cliente o si
  hay actividades no Verificadas.
- RF-16: "Generar acta" para entregas Aceptadas (`ReporteActa -Dueño` `144:2536`).
- Lista de entregas de la obra con su estado, las observaciones del cliente y el acta.
- RF-17: actividades y evidencias de una entrega Aceptada se muestran sin opciones de edición.

Las tareas se definen en `plan.md` y `tasks.md` del repo de la API.
