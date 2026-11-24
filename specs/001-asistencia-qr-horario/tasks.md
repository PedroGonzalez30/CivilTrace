---
description: "Tareas del feature 001 en la app móvil: asistencia con QR, horario por obra y calendario"
---

# Tasks: Asistencia con QR, horario por obra y calendario (app móvil)

**Input**: `specs/001-asistencia-qr-horario/` ([plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/pantallas-y-servicios.md](./contracts/pantallas-y-servicios.md), [quickstart.md](./quickstart.md)) y el contrato de la API, ya desplegada (PR #1 de `CivilTrace-API`).

**Tests**: son **obligatorios** (constitución III). Usan `jest-expo` y React Native Testing Library, y cada uno lleva su clave (`CP21-A3-APP`…). Se escriben primero y deben fallar antes de implementar.

**Aprobaciones**: el equipo aprobó las propuestas del Figma `2295:254`, `2295:313` y `2295:392` (D-21).

## Format: `[ID] [P?] [Story] Description`

**Reglas para todo archivo nuevo** (constitución II), que no se repiten en cada tarea:

- Encabezado ECCT con `@autor Emilio Manuel Esquivel` y `@requerimientos`.
- Secciones numeradas, con `// 5. Estilos` usando `StyleSheet.create` en el objeto `estilos`.
- Identificadores en español sin acentos.
- Toda llamada al servidor en `try/catch` con un mensaje en español.
- Colores de `constantes/colores.ts` y textos de `constantes/textosAsistencia.ts`.
- Paquetes de Expo instalados **siempre** con `npx expo install` (AGENTS.md).

---

## Phase 1: Setup (módulo 00 de la app)

- [ ] T001 Instalar las pruebas con `npx expo install jest-expo jest @types/jest @testing-library/react-native "--" --dev` (jest 30, research R-13). Agregar `"jest": { "preset": "jest-expo", "collectCoverageFrom": ["src/**/*.{ts,tsx}", "!src/simulados/**"], "coverageThreshold": { "global": { "lines": 60 } } }` y los scripts `test` (`jest`) y `test:cobertura` en `package.json`. Agregar `"jest"` a `compilerOptions.types` en `tsconfig.json`.
- [ ] T002 [P] Configurar el lint con `npx expo lint`, que crea `eslint.config.js` con `eslint-config-expo/flat`. Agregar `eslint-config-prettier` y un `.prettierrc` igual al de la API, y los scripts `lint`, `formatear` y `verificar-formato`. Corregir los errores de `src/` sin cambiar comportamiento; si hay commits de solo formato, van aparte.
- [ ] T003 [P] Instalar `expo-sqlite`, `expo-file-system`, `expo-crypto` y `expo-network` con `npx expo install`. Agregar `"expo-sqlite"` a `plugins` en `app.json`, más los textos de permisos de `expo-camera` y `expo-location` en español.
- [ ] T004 Crear `jest.setup.ts`, registrado en `setupFiles`, con dobles de `expo-sqlite`, `expo-file-system`, `expo-network`, `expo-location`, `expo-camera` y `expo-secure-store`. Crear también `__tests__/dobles/repositorioEnMemoria.ts`, con la interfaz `RepositorioLocal` en memoria que se usará desde T009. Escribir una prueba humo `__tests__/humo-test.tsx` que renderice `<BotonPrincipal>`.
- [ ] T005 Verificar `npx tsc --noEmit && npm run lint && npm test`.

**Checkpoint**: la puerta de calidad de la app funciona.

---

## Phase 2: Foundational (bloquea todas las historias)

- [ ] T006 [P] Crear `src/tipos/asistencia.ts` con los tipos de las respuestas del contrato de la API (lista en [data-model.md](./data-model.md), sección "Tipos de TypeScript"), y `src/constantes/textosAsistencia.ts` con las etiquetas de `TipoJornada`, `MotivoAsistencia`, `EfectoPago` y los mensajes de la spec.
- [ ] T007 [P] Escribir primero `__tests__/formatoHoras-test.ts`: `"08:00"` → "8:00 am", `"16:00"` → "4:00 pm", un instante con zona `America/Tijuana` → "8:02 am", y la regla "después de las 08:15". Después implementar `src/utilidades/formatoHoras.ts` (research R-12).
- [ ] T008 Agregar `ErrorSinConexion` en `src/conexion/clienteApi.ts`: un fallo de `fetch` sin respuesta lanza `ErrorSinConexion` en lugar de `ErrorApi`. Exponer el `motivo` de los errores 422 de la API. Prueba en `__tests__/clienteApi-test.ts`.
- [ ] T009 Escribir primero `__tests__/repositorioAsistenciaLocal-test.ts` contra la interfaz `RepositorioLocal`, que cubra la cola, el paquete y el registro del día, con las transiciones de [data-model.md](./data-model.md) `escaneo_pendiente.estado`. Implementar después:
  - `src/servicios/local/baseLocal.ts`: `openDatabaseAsync('civiltrace.db')`, WAL y migración v1 con `user_version`;
  - `src/servicios/local/repositorioAsistenciaLocal.ts`: las tablas `escaneo_pendiente`, `paquete_obra`, `trabajador_paquete` y `registro_dia_local` con las columnas y reglas de [data-model.md](./data-model.md), incluidos `escaneo_pendiente.id_local`, `escaneo_pendiente.usuario_id`, `escaneo_pendiente.latitud`/`longitud` y `registro_dia_local.fecha`.
- [ ] T010 [P] Crear `src/servicios/servicioAsistencia.ts` con `obtenerMiCredencial`, `obtenerMiDia`, `listarMisObras`, `obtenerPaquete`, `pedirVistaPrevia`, `enviarEscaneos` y `obtenerResumenDia` ([contracts/pantallas-y-servicios.md](./contracts/pantallas-y-servicios.md)).
- [ ] T011 [P] Crear `src/hooks/useConexion.ts` sobre `useNetworkState` de `expo-network`, con `isInternetReachable` (R-07).
- [ ] T012 Navegación por rol (R-11):
  - crear `src/navegacion/PestanasSupervisor.tsx` ("Inicio", que usa la `PantallaPrincipalSupervisor` existente; "Asistencia"; "Cuenta") y `src/navegacion/PestanasTrabajador.tsx` ("Trabajo", con un marcador; "Mi asistencia"; "Cuenta");
  - ampliar `NavegacionInferior` con los íconos y etiquetas del Figma;
  - cambiar `src/navegacion/NavegadorRaiz.tsx` para elegir las pestañas por rol;
  - ampliar `src/tipos/navegacion.ts`;
  - prueba de render en `__tests__/navegacionPorRol-test.tsx`.

**Checkpoint**: cada rol ve su barra inferior.

---

## Phase 3: User Story 1: El trabajador muestra su QR (P1) 🎯 MVP

**Goal**: "Mi asistencia" con el QR (también sin señal), el horario y los estados (RF-19, D-17).

**Independent Test**: spec, US1. CP21 manual 1 de [quickstart.md](./quickstart.md).

- [ ] T013 [P] [US1] Escribir primero `__tests__/servicioQrPropio-test.ts` (guardar y leer en Secure Store por usuario) y `__tests__/PantallaMiAsistencia-test.tsx`, que cubra:
  - el QR y los estados con una respuesta simulada;
  - sin conexión, el QR guardado y el aviso;
  - sin obras, el mensaje correspondiente.
- [ ] T014 [P] [US1] Implementar `src/servicios/local/servicioQrPropio.ts` con la clave de [data-model.md](./data-model.md), sección "Secure Store".
- [ ] T015 [US1] Implementar `src/hooks/useMiAsistencia.ts`: lee el QR guardado y luego actualiza con `obtenerMiCredencial` y `obtenerMiDia`; se actualiza al enfocar la pantalla y al deslizar.
- [ ] T016 [US1] Implementar `src/pantallas/trabajador/PantallaMiAsistencia.tsx` según `TRA-Asistencia Dia` (96:329). Usa `react-native-qrcode-svg`, `TarjetaHorarioDia` (nuevo en `src/componentes/TarjetaHorarioDia.tsx`, compartido con US2) y el icono de calendario hacia `Historial`. Crear también `src/navegacion/PilaMiAsistencia.tsx`.

**Checkpoint**: el trabajador ve su QR con y sin señal.

---

## Phase 4: User Story 2: El supervisor escanea con o sin señal (P1)

**Goal**: escoger la obra, leer el QR, confirmar, guardar en la cola y sincronizar sola (RF-27, RNF-07 / D-14).

**Independent Test**: spec, US2. Manuales 2, 3 y 4 de [quickstart.md](./quickstart.md).

- [ ] T017 [P] [US2] Escribir primero `__tests__/servicioEscaneo-test.ts`:
  - `CP21-A1-APP`: sin conexión, el paquete en memoria da ENTRADA, luego SALIDA, y el tercer escaneo se rechaza;
  - `CP21-A2-APP`: la huella de un token conocido es igual a la de la API;
  - un QR que no está en el paquete devuelve el mensaje "No se encontró al trabajador…".
- [ ] T018 [P] [US2] Escribir primero `__tests__/servicioSincronizacionAsistencia-test.ts`:
  - `CP21-A3-APP`: GUARDADO y DUPLICADO se borran, RECHAZADO conserva su motivo, un error de red no borra nada y dos llamadas simultáneas hacen un solo envío;
  - `CP21-A4-APP`: 150 pendientes salen como lotes de 100 + 50, en orden;
  - `CP21-A5-APP`: solo se envían los del usuario de la sesión;
  - un 401 detiene la sincronización.
- [ ] T019 [P] [US2] Implementar `src/servicios/local/servicioUbicacion.ts`: `obtenerUbicacionRapida()` con 4 s de límite, después la última posición conocida, si no `null` (R-08). Con su prueba.
- [ ] T020 [US2] Implementar `src/servicios/local/servicioPaqueteObra.ts`:
  - `actualizarPaquete(sesion, obraId)`: descarga el paquete, las fotos (con `File.createDownloadTask` y el encabezado `Authorization`, R-03) y el resumen del día hacia `registro_dia_local`;
  - `buscarPorQr(obraId, codigoQr)`: con `Crypto.digestStringAsync` SHA-256 del texto sin `ct1.` (R-05), según [data-model.md](./data-model.md) `trabajador_paquete.huella_credencial` y `trabajador_paquete.foto_local`.
- [ ] T021 [US2] Implementar `src/servicios/local/servicioEscaneo.ts`:
  - `prepararEscaneo`: con conexión pide la vista previa; si recibe `ErrorSinConexion`, usa el paquete y `registro_dia_local` (R-10);
  - `aceptarEscaneo`: arma `id_local` con `Crypto.randomUUID()` o, si no existe, con `getRandomBytes` (R-06); obtiene la ubicación; guarda en la cola **antes** de enviar; actualiza el día local y llama a `sincronizar()`.

  Deben pasar las pruebas de T017.

- [ ] T022 [US2] Implementar `src/servicios/local/servicioSincronizacionAsistencia.ts` según R-09:
  - `sincronizar(sesion)` con candado;
  - `iniciarSincronizacionAutomatica(sesion)` con `addNetworkStateListener`, `AppState` y una llamada al iniciar;
  - suscripción para los contadores de pendientes y rechazados.

  Arrancarla al iniciar sesión como SUPERVISOR en `NavegadorRaiz`. Deben pasar las pruebas de T018.

- [ ] T023 [P] [US2] Implementar `src/hooks/useObrasSupervisadas.ts` y `src/pantallas/supervisor/PantallaEscogerObra.tsx` según `96:2903`, reutilizando `TarjetaObra` si se ajusta. Al elegir una obra se llama a `actualizarPaquete` en segundo plano.
- [ ] T024 [US2] Implementar `src/hooks/useLecturaQr.ts` (resumen, horario, pendientes y rechazados; con conexión usa el servidor y sin ella, lo local) y `src/componentes/AvisoSincronizacion.tsx` según `2295:254`.
- [ ] T025 [US2] Implementar `src/pantallas/supervisor/PantallaLeerQr.tsx` según `2272:117` y `2295:254`:
  - `CameraView` con `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`, montada solo con el foco (`useIsFocused`) y en pausa mientras hay una confirmación abierta (R-04);
  - la pantalla de permiso de cámara;
  - `TarjetaHorarioDia` con "Editar horario de la obra";
  - el resumen del día.

  Crear `src/navegacion/PilaAsistenciaSupervisor.tsx`. Prueba de render con datos simulados: aviso de pendientes y rechazados, y el mensaje de permiso.

- [ ] T026 [US2] Implementar `src/pantallas/supervisor/PantallaConfirmarQr.tsx` según `96:2228`, como modal: foto (remota o local), nombre, oficio, hora, ubicación, "Sin faltas este mes" o N faltas, y los botones "Rechazar" y "Aceptar". Implementar también `src/pantallas/supervisor/PantallaRechazados.tsx`, una lista con el estilo de `2295:254` y la opción de descartar. Pruebas de render y de los botones en `__tests__/PantallaConfirmarQr-test.tsx`.

**Checkpoint**: el escaneo funciona con y sin señal, y los pendientes se envían solos.

---

## Phase 5: User Story 3: Horario de la obra (P1)

**Goal**: `SUP_HorarioObra` (2272:170) con guardado (D-06).

- [ ] T027 [P] [US3] Escribir primero `__tests__/PantallaHorarioObra-test.tsx`:
  - `CP22-A1-APP`: el texto de la regla cambia con la tolerancia; una salida antes de la entrada o sin días laborales muestra el error y no llama a la API;
  - los valores por defecto cuando `general` es `null`;
  - sin conexión aparece "Necesitas conexión para guardar el horario".
- [ ] T028 [P] [US3] Implementar `src/servicios/servicioHorario.ts` (`obtenerHorario` y `guardarHorario`) y `src/hooks/useHorarioObra.ts`.
- [ ] T029 [US3] Implementar `src/pantallas/supervisor/PantallaHorarioObra.tsx`: selectores de hora, chips de tolerancia, días L a D y el segmento "Todos los días / Solo hoy". Al guardar, regresa y actualiza la lectura de QR y el paquete.

---

## Phase 6: User Story 4: Detalles de asistencia (P2)

**Goal**: la hoja `SUP_DetallesAsistencia` (2272:250) al mantener presionado (D-07, RF-60).

- [ ] T030 [P] [US4] Escribir primero `__tests__/HojaDetallesAsistencia-test.tsx`:
  - `CP19-E3-APP`: "Retardo" sin observación muestra el error sin llamar a la API;
  - muestra los valores actuales;
  - el error del servidor se muestra sin cerrar la hoja;
  - sin conexión, el aviso correspondiente.
- [ ] T031 [P] [US4] Implementar `src/servicios/servicioDetallesAsistencia.ts` y `src/hooks/useDetallesDia.ts`.
- [ ] T032 [US4] Implementar `src/componentes/HojaDetallesAsistencia.tsx` (un `Modal` que se desliza desde abajo, con chips de tipo y de motivo, el segmento de efecto, las anotaciones y "Editar horas") y conectarla al mantener presionado en el resumen de `PantallaLeerQr`. El icono de calendario lleva a `CalendarioTrabajador`.

---

## Phase 7: User Story 5: Calendario (P2)

**Goal**: los calendarios del supervisor (2272:354) y del trabajador (96:389), y el detalle del día (2272:523 con el $ de 2295:392) (D-08, D-13, D-16, RF-56, RF-58).

- [ ] T033 [P] [US5] Escribir primero `__tests__/CalendarioAsistencia-test.tsx` y `__tests__/HojaDetalleDia-test.tsx`:
  - `CP19-A1-APP`: los colores, el $, las flechas de mes y la alerta solo con `faltas >= 1`;
  - el detalle muestra "Modificado: entrada original 8:20 → 8:00 (olvidó registrarse)".
- [ ] T034 [P] [US5] Implementar `src/servicios/servicioCalendario.ts` y `src/hooks/useCalendario.ts`.
- [ ] T035 [US5] Implementar `src/componentes/CalendarioAsistencia.tsx` (rejilla propia con días de colores y la insignia $ como en el Figma) y `src/componentes/HojaDetalleDia.tsx`.
- [ ] T036 [US5] Implementar `src/pantallas/supervisor/PantallaCalendarioTrabajador.tsx`, con el resumen del mes y la tarjeta del trabajador, y `src/pantallas/trabajador/PantallaHistorialAsistencia.tsx`, con la alerta y el recordatorio de D-16.

---

## Phase 8: User Story 6: Oficio en el perfil (P3)

- [ ] T037 [P] [US6] Escribir primero `__tests__/FormularioPerfil-test.tsx`: `CP06-A1-APP` (el oficio se envía en `PUT /perfil`) y el error de más de 60 caracteres.
- [ ] T038 [US6] Agregar `oficio` a `src/servicios/servicioPerfil.ts` y al tipo del perfil, y el campo "Oficio (opcional)" en `src/componentes/FormularioPerfil.tsx` según `2295:313`.

---

## Phase 9: Polish & Cross-Cutting

- [ ] T039 [P] Correr `npm run test:cobertura` y completar las pruebas hasta tener 60 % o más (constitución III.4).
- [ ] T040 Probar en un teléfono real con Expo Go siguiendo [quickstart.md](./quickstart.md), pasos 1 a 7, contra la API de Azure. Confirmar ahí lo que quedó "a verificar": `Crypto.randomUUID` (R-06), la huella (R-05) y `Intl` con zona horaria en Hermes (R-12). Si algo cambia, registrarlo en `docs/decisiones.md`.
- [ ] T041 Revisar cada pantalla contra su `node-id` del Figma (constitución VI.5).
- [ ] T042 Actualizar `AGENTS.md` y `CLAUDE.md` de la app con los comandos `test`, `lint` y `test:cobertura` y la carpeta `src/servicios/local/`.
- [ ] T043 Correr `npx tsc --noEmit && npm run lint && npm test` y abrir un PR de `001-asistencia-qr-horario` a `master` para que lo revise otro integrante.

---

## Dependencies & Execution Order

- **Fase 1 → Fase 2 → historias.**
- **US1** solo depende de la fase 2.
- **US2** depende de la fase 2; reutiliza `TarjetaHorarioDia` de US1 (T016), y si US1 no está, se crea en T025.
- **US3** depende de la fase 2. Para entrar a ella desde la app se necesita el botón de `PantallaLeerQr` (US2), pero su pantalla y sus pruebas son independientes.
- **US4** depende de US2 (el mantener presionado en el resumen).
- **US5** depende de la fase 2. Al calendario del supervisor se entra desde US4, y al del trabajador desde US1.
- **US6** es independiente.
- **Fase 9** va al final.

### Parallel Opportunities

- Fase 1: T002 y T003 en paralelo después de T001.
- Fase 2: T006, T007, T010 y T011 en paralelo.
- US2: T017, T018 y T019 en paralelo; luego T020 → T021 → T022; T023 en paralelo con T024.
- US3, US5 y US6 pueden avanzar en paralelo con US2 si hay más de una persona.

## Implementation Strategy

1. **MVP**: fases 1 y 2, US1 y US2. Con eso el trabajador ya muestra su QR y el supervisor pasa asistencia con y sin señal.
2. Después US3 (horario: sin él no hay retardos), US4, US5 y US6.
3. Cierre y PR.

## Notes

- Mientras se desarrolla, `EXPO_PUBLIC_API_URL` puede apuntar a la API local o a la de Azure (`https://civiltrace-api-bhffckcachbsb5cn.westus-01.azurewebsites.net`).
- La app no repite reglas de la API. Sin conexión solo decide entrada, salida o completa, y el servidor tiene la última palabra.
