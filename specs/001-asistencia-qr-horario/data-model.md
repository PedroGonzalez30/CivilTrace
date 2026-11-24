# Modelo de datos local: Asistencia en la app móvil

**Feature**: `001-asistencia-qr-horario` (app) · **Spec**: [spec.md](./spec.md) · **Investigación**: [research.md](./research.md)

Los datos de negocio viven en la API (ver su `data-model.md`). Aquí solo se describe lo que la app guarda **en el teléfono** para funcionar sin conexión.

## Base SQLite `civiltrace.db` (research R-01)

La versión del esquema se controla con `PRAGMA user_version`; la versión 1 crea estas tablas.

### `escaneo_pendiente` (FR-010 a FR-013)

| Columna               | Tipo             | Regla                                                           |
| --------------------- | ---------------- | --------------------------------------------------------------- |
| `id_local`            | TEXT PK          | UUID v4 (R-06). Es el `idLocal` que se manda a la API           |
| `usuario_id`          | TEXT NOT NULL    | Supervisor que lo capturó. Solo se envía con su sesión (FR-013) |
| `obra_id`             | TEXT NOT NULL    |                                                                 |
| `codigo_qr`           | TEXT NOT NULL    | Texto leído del QR                                              |
| `trabajador_id`       | TEXT NULL        | Conocido si se validó con el paquete o con la vista previa      |
| `trabajador_nombre`   | TEXT NULL        | Para mostrar en pendientes y rechazados                         |
| `tipo`                | TEXT NOT NULL    | `ENTRADA` o `SALIDA`, según lo que decidió el teléfono          |
| `capturado_en`        | TEXT NOT NULL    | ISO 8601 UTC                                                    |
| `sin_conexion`        | INTEGER NOT NULL | 0 o 1                                                           |
| `latitud`, `longitud` | REAL NULL        | Ambas `null` = "Sin ubicación GPS"                              |
| `estado`              | TEXT NOT NULL    | `PENDIENTE` o `RECHAZADO` (los guardados se borran)             |
| `motivo`              | TEXT NULL        | Motivo que devolvió la API (`NO_ASIGNADO`…)                     |
| `mensaje`             | TEXT NULL        | Mensaje en español que devolvió la API                          |

Índice: `(usuario_id, estado, capturado_en)`.

**Transiciones**:

```text
(aceptado en confirmación) → PENDIENTE
PENDIENTE --lote: GUARDADO | DUPLICADO--> se borra
PENDIENTE --lote: RECHAZADO--> RECHAZADO (motivo, mensaje)
PENDIENTE --error de red / 5xx--> PENDIENTE (se reintenta)
RECHAZADO --el supervisor lo descarta--> se borra
```

### `paquete_obra` (FR-008, R-02 de la API)

| Columna        | Tipo          | Regla                                             |
| -------------- | ------------- | ------------------------------------------------- |
| `obra_id`      | TEXT PK       |                                                   |
| `usuario_id`   | TEXT NOT NULL | Supervisor que lo descargó                        |
| `zona_horaria` | TEXT NOT NULL |                                                   |
| `horario_json` | TEXT NOT NULL | `{ general, excepcionHoy }` tal como lo da la API |
| `generado_en`  | TEXT NOT NULL | Para mostrar "Datos de la obra de hoy, 7:45 am"   |

### `trabajador_paquete`

| Columna             | Tipo      | Regla                                      |
| ------------------- | --------- | ------------------------------------------ |
| `obra_id`           | TEXT      | PK compuesta con `trabajador_id`           |
| `trabajador_id`     | TEXT      |                                            |
| `nombre`, `oficio`  | TEXT      | `oficio` puede ser `null`                  |
| `huella_credencial` | TEXT NULL | SHA-256 hex. Índice para buscar por huella |
| `foto_local`        | TEXT NULL | URI del archivo descargado (R-03) o `null` |
| `faltas_mes`        | INTEGER   |                                            |

### `registro_dia_local` (R-10)

| Columna                             | Tipo      | Regla                                                             |
| ----------------------------------- | --------- | ----------------------------------------------------------------- |
| `obra_id`, `trabajador_id`, `fecha` | TEXT      | PK compuesta. `fecha` en formato `YYYY-MM-DD` local de la empresa |
| `tiene_entrada`                     | INTEGER   | 0 o 1                                                             |
| `tiene_salida`                      | INTEGER   | 0 o 1                                                             |
| `hora_entrada`                      | TEXT NULL | ISO, para mostrarla en el resumen sin conexión                    |

Se reemplaza con el resumen del servidor cada vez que hay conexión y se actualiza con cada escaneo aceptado. Las filas de días anteriores se borran al abrir la obra.

## Secure Store (R-02)

| Clave                                 | Valor                               |
| ------------------------------------- | ----------------------------------- |
| `civiltrace.qrAsistencia.<usuarioId>` | `codigoQr` del trabajador (`ct1.…`) |

## Archivos (R-03)

`Paths.document/asistencia/fotos/<obraId>/<trabajadorId>`: la foto de cada trabajador del paquete. Se sobrescribe al actualizar el paquete y se borra la carpeta de la obra si el supervisor ya no la supervisa.

## Tipos de TypeScript (`src/tipos/asistencia.ts`)

Copian las respuestas del contrato de la API: `CredencialAsistencia`, `MiDia`, `ObraSupervisada`, `PaqueteSinConexion`, `ResumenDia`, `VistaPrevia`, `ResultadoEscaneo`, `HorarioObra`, `DetalleDia`, `CalendarioMes`, con sus enumeraciones `TipoJornada`, `MotivoAsistencia`, `EfectoPago` y `ColorDia`. Las etiquetas en español que muestra la UI ("Media jornada", "Cita médica") van en `src/constantes/textosAsistencia.ts`.
