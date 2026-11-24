# Contrato de la app: pantallas, navegación y servicios

**Feature**: `001-asistencia-qr-horario` (app)

**API que consume**: `CivilTrace-API/specs/001-asistencia-qr-horario/contracts/asistencia-api.md` (sin cambios). Aquí se define lo que la app expone dentro de sí misma: las rutas de navegación y las funciones de servicio que usan las pantallas.

## Navegación (React Navigation, T-01)

```text
NavegadorRaiz
├── (DUENO)       PestanasPrincipales            (sin cambios)
├── (SUPERVISOR)  PestanasSupervisor
│   ├── Inicio      → PantallaPrincipalSupervisor (existente)
│   ├── Asistencia  → PilaAsistenciaSupervisor
│   │   ├── EscogerObra          SUP_Asistencia_EscogerObra (96:2903)
│   │   ├── LeerQr { obraId }    SUP_Asistencia_LeerQr (2272:117) + avisos (2295:254)
│   │   ├── ConfirmarQr { obraId, escaneo } (modal)   Sup_Asistencia_ConfirmarQR (96:2228)
│   │   ├── HorarioObra { obraId }                   SUP_HorarioObra (2272:170)
│   │   ├── CalendarioTrabajador { trabajadorId, obraId }  SUP_CalendarioTrabajador (2272:354)
│   │   └── Rechazados { obraId }                    (lista simple, mismo estilo que 2295:254)
│   └── Cuenta      → PantallaMiPerfil (con oficio, 2295:313)
└── (TRABAJADOR)  PestanasTrabajador
    ├── Trabajo        → marcador (otro feature)
    ├── MiAsistencia   → PilaMiAsistencia
    │   ├── MiAsistencia          TRA-Asistencia Dia (96:329)
    │   └── Historial             TRA-HIstorial asistencia (96:389)
    └── Cuenta         → PantallaMiPerfil
```

Hojas modales, sin ruta propia:

- `HojaDetallesAsistencia`: `SUP_DetallesAsistencia` (2272:250).
- `HojaDetalleDia`: `SUP_CalendarioTrabajador_DetalleDia` (2272:523), con el $ de 2295:392.

Los tipos de parámetros van en `src/tipos/navegacion.ts`.

## Servicios (`src/servicios/`)

Todas las funciones reciben `tokenAcceso`, usan `llamarApi` y lanzan `ErrorApi` con el mensaje en español. Si la red falla, lanzan `ErrorSinConexion`.

| Archivo                         | Funciones                                                                                                                            | Endpoint                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `servicioAsistencia.ts`         | `obtenerMiCredencial`, `obtenerMiDia`, `listarMisObras`, `obtenerPaquete`, `pedirVistaPrevia`, `enviarEscaneos`, `obtenerResumenDia` | `/asistencia/*` y `/obras/:id/asistencia*`      |
| `servicioHorario.ts`            | `obtenerHorario`, `guardarHorario`                                                                                                   | `/obras/:id/horario`                            |
| `servicioDetallesAsistencia.ts` | `obtenerDetalleDia`, `editarDetalleDia`                                                                                              | `/obras/:id/asistencia/trabajadores/:t/dias/:f` |
| `servicioCalendario.ts`         | `obtenerCalendario`                                                                                                                  | `/asistencia/trabajadores/:t/calendario`        |
| `servicioPerfil.ts` (existente) | se agrega `oficio`                                                                                                                   | `/perfil`                                       |

## Servicios locales (`src/servicios/local/`)

| Archivo                               | Responsabilidad                                                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseLocal.ts`                        | Abre `civiltrace.db`, aplica WAL y migraciones (`user_version`). Expone `RepositorioLocal`                                                                                                    |
| `repositorioAsistenciaLocal.ts`       | Implementación SQLite de `RepositorioLocal`: cola, paquete, registros del día                                                                                                                 |
| `servicioPaqueteObra.ts`              | `actualizarPaquete(obraId)`: descarga el paquete y las fotos y guarda el resumen del día. `buscarPorQr(obraId, codigoQr)`: calcula la huella y busca                                          |
| `servicioEscaneo.ts`                  | `prepararEscaneo(obraId, codigoQr)`: con conexión usa la vista previa; sin conexión, el paquete. `aceptarEscaneo(...)`: guarda en la cola, actualiza el día local y dispara la sincronización |
| `servicioSincronizacionAsistencia.ts` | `sincronizar()` con candado (R-09). `iniciarSincronizacionAutomatica(sesion)`: escucha la red y `AppState`. Expone el conteo de pendientes y rechazados para la UI                            |
| `servicioQrPropio.ts`                 | Lee y guarda el QR del trabajador en Secure Store                                                                                                                                             |
| `servicioUbicacion.ts`                | `obtenerUbicacionRapida()`: posición en 4 s, la última conocida o `null` (R-08)                                                                                                               |

## Hooks (`src/hooks/`)

`useConexion` (de `useNetworkState`), `useMiAsistencia`, `useObrasSupervisadas`, `useLecturaQr(obraId)` (resumen, horario, pendientes y rechazados), `useHorarioObra`, `useDetallesDia`, `useCalendario(trabajadorId, mes, obraId?)`.
