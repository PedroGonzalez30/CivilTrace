# Feature 003: actividades y evidencias del supervisor y del trabajador (app)

**Rama**: `003-actividades-evidencias` (sobre `002-correcciones-revision`) · **Fecha**: 24/11/2026 ·
**Autor**: Emilio Manuel Esquivel · **API**: repo `CivilTrace-API`, misma rama (contrato, reglas R1–R8
y migración en su `specs/003-actividades-evidencias/spec.md`).

## Qué cambia para cada rol

### Supervisor: pestaña Inicio (`PilaTrabajoSupervisor`)

| Pantalla (Figma)                                             | Archivo                                                                 | Notas                                                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Mis obras (`SUP_Trabajo_VerObras` 161:402)                   | `PantallaEscogerObra` (reusada, con subtítulo y pie)                    | Al final, el código de trabajadores (D-23). Reemplaza la prueba temporal de almacenamiento de Pedro.           |
| Detalle de obra (`Sup_DetalleObra` 161:475)                  | `dueno/PantallaDetalleObra` (reusada)                                   | Botones "Actividades de la obra" y "Reportes de la obra".                                                      |
| Actividades (`SUP_ACTIVIDADESOBRA` 2139:313, 168:706)        | `dueno/PantallaActividadesObra` + `onAgregar`                           | "+" flotante, vacío "No hay actividades por realizar", aviso "Pendiente de aprobación" en la tarjeta.          |
| Agregar actividad (`Sup_Agregar1ActividadObra` 168:781)      | `supervisor/PantallaAgregarActividad`                                   | Responsable: trabajadores asignados a la obra (resumen de asistencia). Validación en `validacionActividad.ts`. |
| Ver actividad (`SUP_VERACTIVIDADOBRAActiva` 168:922)         | `dueno/PantallaDetalleActividad` + `onSubirEvidencia`/`onRevisarAvance` | Estado de cada evidencia, motivo del rechazo, botón "Revisar" en las pendientes, "+" para subir evidencia.     |
| Revisar avance y confirmación (2138:577, 2142:182, 2142:393) | `supervisor/PantallaRevisarAvance`                                      | Evidencia anterior y en revisión, observaciones 0/500; rechazar sin motivo no se envía.                        |
| Subir evidencia (`SUP_SUBIREVIDENCIA` 2217:122)              | `comunes/PantallaSubirEvidencia`                                        | Cámara o galería, "Avance diario"/"Terminado", comentario opcional. Nace aprobada.                             |

### Trabajador: pestaña Trabajo (`PilaTrabajoTrabajador`)

| Pantalla (Figma)                               | Archivo                                  | Notas                                                                                        |
| ---------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| Mis actividades (`TRA VER ACTIVIDADES` 58:344) | `trabajador/PantallaMisActividades`      | Todas sus obras; días restantes, "Entrega en revisión" y "+" para subir evidencia.           |
| Actividad (`TRA-VERACTIVIDAD` 58:592, 296:176) | `trabajador/PantallaActividadTrabajador` | Instrucción, aviso de evidencia agregada, motivo de rechazo, "Mis evidencias" con su estado. |
| Subir evidencia (58:933)                       | `comunes/PantallaSubirEvidencia`         | Nace pendiente de revisión (D-10).                                                           |

Servicios: `servicioActividades` agrega `crearActividad`, `subirEvidencia` (cabeceras
`x-tipo-avance` y `x-comentario-avance`; `clienteApi` acepta `encabezados`), `revisarAvance` y
`obtenerMisActividades`. Se borran `PantallaPrincipalSupervisor` y `servicioEvidencias` (solo servían
a la prueba temporal de almacenamiento).

## Pendientes de confirmar (en `docs/decisiones.md`)

P-06 (casillas de "Pendientes" no implementadas), P-07 (avance diario del trabajador también pendiente),
P-08 (responsables = trabajadores de la obra) y P-09 (migración por aplicar en Azure antes de desplegar).

## Pruebas

`__tests__/actividadesEvidencias-test.tsx` (16 pruebas, CP10–CP14 con sufijo `-APP`): servicio,
validación, días restantes y las pantallas de los dos roles. Umbral de 60 % por archivo en
`package.json`.

Prueba manual en el celular (después de aplicar P-09 y desplegar la API):

1. Supervisor: Inicio → obra → Actividades → "+" → agregar "Colocar loseta" con Ana como responsable.
2. Trabajador (Ana): Trabajo → la actividad aparece → "+" → foto → "Avance diario" → Subir. Debe decir
   "Pendiente de revisión".
3. Supervisor: abre la actividad → "Revisar" → rechazar sin motivo (no deja) → con motivo → "Actividad
   rechazada".
4. Ana ve el motivo; sube otra foto como "Terminado" → "Entrega en revisión".
5. Supervisor: aprueba → "Actividad aprobada"; la actividad pasa a Terminadas y desaparece de la lista
   de Ana.

## Tareas

- [x] T001 Spec (este archivo).
- [x] T002 Servicio y tipos.
- [x] T003 Pantallas del supervisor y navegación.
- [x] T004 Pantallas del trabajador y navegación.
- [x] T005 Pruebas, tipos, lint, Prettier y cobertura en verde.
- [ ] T006 Prueba manual en el celular.
- [ ] T007 PR revisado (unir después de los PR de la API y de la 002).
