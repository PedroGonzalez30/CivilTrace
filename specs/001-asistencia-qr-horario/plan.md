# Implementation Plan: Asistencia con QR, horario por obra y calendario (app móvil)

**Branch**: `001-asistencia-qr-horario` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-asistencia-qr-horario/spec.md`

**Requerimientos**: `RF-19 Registrar asistencia propia`, `RF-27 Registrar asistencia por el supervisor`, `RF-56 Mostrar días con descuento`, `RF-58 Mostrar calendario de asistencia`, `RF-60 Registrar retardo o salida anticipada`, `RNF-07 Captura sin conexión` (D-14).

## Summary

La app consume la API del feature 001, que ya está implementada y migrada en Azure. Agrega:

- las pestañas por rol para el supervisor y el trabajador;
- "Mi asistencia" con el QR guardado en el teléfono;
- la lectura de QR con confirmación;
- una **cola local en SQLite** que guarda los escaneos sin conexión y los envía en lotes que no se duplican, con cuatro disparadores: al aceptar, al volver la red, al volver la app al frente y al iniciar sesión;
- el horario de la obra, la hoja de detalles y el calendario con $;
- el oficio en el perfil.

Sin conexión, el QR se valida contra la **huella SHA-256** del paquete de la obra, y las fotos se guardan en archivos locales. Todo usa módulos incluidos en Expo Go (SDK 58). Detalle en [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript ~6.0 estricto. React 19.3, React Native 0.88 y Expo SDK 58.

**Primary Dependencies**:

- Ya instaladas: React Navigation 7 (native-stack, bottom-tabs), `expo-camera`, `expo-location`, `expo-secure-store` y `react-native-qrcode-svg`.
- **Nuevas**, todas incluidas en Expo Go: `expo-sqlite`, `expo-file-system`, `expo-crypto` y `expo-network`.
- **De desarrollo**: `jest-expo`, `jest@30`, `@types/jest`, `@testing-library/react-native`, `eslint-config-expo`, `prettier` y `eslint-config-prettier`.

**Storage**:

- SQLite local (`civiltrace.db`): cola de escaneos, paquete de cada obra y registros del día.
- Secure Store: QR propio del trabajador.
- Archivos: fotos de los trabajadores del paquete.
- Los datos de negocio viven en la API.

**Testing**: `jest-expo` con React Native Testing Library. Los módulos nativos se sustituyen con dobles, y el repositorio local tiene una implementación en memoria. Cobertura mínima de 60 % (constitución III.4).

**Target Platform**: Android e iOS con Expo Go para el MVP. Las compilaciones de entrega se hacen con EAS (fuera de este feature).

**Project Type**: app móvil que consume una API REST.

**Performance Goals**:

- Del escaneo a la confirmación en menos de 2 s con señal y en menos de 1 s sin señal, para cumplir SC-001 (menos de 10 s en total).
- QR del trabajador visible en menos de 2 s (SC-005).

**Constraints**:

- Ningún escaneo aceptado se pierde (SC-003) ni se duplica (SC-004).
- Una sola vista de cámara activa.
- La ubicación no bloquea el escaneo (4 s como máximo).
- La app no inventa reglas: sin conexión solo reproduce entrada, salida o completa (R-10).

**Scale/Scope**: unas 9 pantallas, 2 hojas, 3 propuestas de diseño, 7 servicios locales y hasta unos 50 trabajadores por obra en el paquete.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principio                 | Cómo se cumple                                                                                                                                                                                                                                                                                                       | Estado                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **I. El Figma manda**     | Las 9 pantallas del Figma están citadas por `node-id`. Los 3 agregados necesarios (pendientes y rechazados, oficio, $ en el detalle) se diseñaron con el mismo estilo y se agregaron al Figma como propuesta (`2295:254`, `2295:313`, `2295:392`). Las pantallas del dueño quedan fuera porque no están en el Figma. | ⚠️ Falta que el equipo apruebe las 3 propuestas antes de implementarlas |
| **I.4 Trazabilidad**      | Spec, plan y contrato citan RF-19, RF-27, RF-56, RF-58, RF-60 y RNF-07.                                                                                                                                                                                                                                              | ✅                                                                      |
| **II. ECCT v1.0**         | Pantallas `PascalCase.tsx` en `src/pantallas/supervisor` y `src/pantallas/trabajador`, componentes en `src/componentes`, hooks `useX`, servicios `camelCase.ts`, encabezado y secciones numeradas, estilos con `StyleSheet.create` en un objeto `estilos`, y `try/catch` con mensajes en español en cada llamada.    | ✅                                                                      |
| **III. Pruebas primero**  | Pruebas con `jest-expo` y RNTL, con claves `-APP` derivadas de CP19, CP21, CP22 y CP06 ([quickstart.md](./quickstart.md)), y cobertura de 60 %. **Prerrequisito**: la app no tiene `test` ni `lint`; es la primera fase de tareas (R-13).                                                                            | ⚠️ Se resuelve en la fase de preparación                                |
| **IV. Seguridad**         | Los tokens siguen en Secure Store. El QR propio va en Secure Store y el paquete solo tiene huellas, nunca tokens. Las fotos quedan en el almacenamiento privado de la app. Los pendientes se envían solo con la sesión de quien los capturó.                                                                         | ✅                                                                      |
| **V. Azure**              | Sin cambios de infraestructura.                                                                                                                                                                                                                                                                                      | ✅                                                                      |
| **VI. Forma de trabajar** | La API ya está terminada (VI.2). La rama `001-asistencia-qr-horario` va a PR con revisión.                                                                                                                                                                                                                           | ✅                                                                      |

**Resultado**: pasa, con dos condiciones antes de implementar: la aprobación de las 3 propuestas de diseño y la fase 1 de pruebas y lint.

**Revisión después del diseño (fase 1)**: el modelo local y los servicios no agregan reglas de negocio nuevas (solo reproducen las de la API sin conexión) ni dependencias fuera de Expo. Sigue pasando.

## Project Structure

### Documentation (this feature)

```text
specs/001-asistencia-qr-horario/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/pantallas-y-servicios.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── navegacion/
│   ├── NavegadorRaiz.tsx                (elige pestañas por rol)
│   ├── PestanasSupervisor.tsx
│   ├── PestanasTrabajador.tsx
│   ├── PilaAsistenciaSupervisor.tsx
│   └── PilaMiAsistencia.tsx
├── pantallas/
│   ├── supervisor/
│   │   ├── PantallaEscogerObra.tsx
│   │   ├── PantallaLeerQr.tsx
│   │   ├── PantallaConfirmarQr.tsx
│   │   ├── PantallaHorarioObra.tsx
│   │   ├── PantallaCalendarioTrabajador.tsx
│   │   └── PantallaRechazados.tsx
│   ├── trabajador/
│   │   ├── PantallaMiAsistencia.tsx
│   │   └── PantallaHistorialAsistencia.tsx
│   └── comunes/PantallaMiPerfil.tsx     (oficio)
├── componentes/
│   ├── CalendarioAsistencia.tsx         (colores y $, compartido)
│   ├── HojaDetallesAsistencia.tsx
│   ├── HojaDetalleDia.tsx
│   ├── TarjetaHorarioDia.tsx
│   ├── AvisoSincronizacion.tsx          (pendientes y rechazados, 2295:254)
│   └── ChipOpcion.tsx                   (si SelectorOpcion no basta)
├── hooks/        useConexion, useMiAsistencia, useObrasSupervisadas, useLecturaQr,
│                 useHorarioObra, useDetallesDia, useCalendario
├── servicios/    servicioAsistencia, servicioHorario, servicioDetallesAsistencia,
│                 servicioCalendario, servicioPerfil (oficio)
│   └── local/    baseLocal, repositorioAsistenciaLocal, servicioPaqueteObra,
│                 servicioEscaneo, servicioSincronizacionAsistencia, servicioQrPropio,
│                 servicioUbicacion
├── constantes/textosAsistencia.ts
├── tipos/asistencia.ts, tipos/navegacion.ts
└── utilidades/formatoHoras.ts
__tests__/ (o junto a cada archivo como *-test.ts(x), preset jest-expo)
```

**Structure Decision**: se sigue la estructura que ya tiene `src/`. Los servicios que guardan datos en el teléfono van en `src/servicios/local/`, para separarlos de los HTTP. Los dobles de las pruebas van en `__tests__/dobles/`.

## Pendientes para el equipo

1. **Aprobar las 3 propuestas del Figma** (`2295:254`, `2295:313`, `2295:392`). Sin eso, las tareas de US2 (avisos), US5 ($ en el detalle) y US6 (oficio) no se implementan.
2. **El PR de la API debe unirse primero** a `main`, para que la app pruebe contra Azure. Mientras tanto, se prueba contra la API local.

## Complexity Tracking

No hay violaciones de la constitución que justificar.
