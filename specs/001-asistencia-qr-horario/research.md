# Investigación (fase 0): Asistencia en la app móvil

**Feature**: `001-asistencia-qr-horario` (app) · **Fecha**: 23/11/2026 · **Spec**: [spec.md](./spec.md)

**Fuente**: documentación versionada de Expo SDK 58 (`docs.expo.dev/versions/v58.0.0/…`), consultada el 23/11/2026, como pide `AGENTS.md`. Todos los paquetes nuevos se instalan con `npx expo install` y **vienen incluidos en Expo Go**, así que no hace falta un development build.

## R-01. Almacenamiento local de pendientes y paquete

- **Decisión**: usar `expo-sqlite` (~58.0.18) con la API asíncrona: `openDatabaseAsync`, `runAsync`, `getAllAsync` y `withTransactionAsync`. Se activa `PRAGMA journal_mode = WAL` y las migraciones se controlan con `PRAGMA user_version`.
- **Razón**:
  - los escaneos pendientes son una **cola ordenada** que debe sobrevivir al cierre de la app y al reinicio del teléfono (FR-013, SC-003);
  - con SQL se puede marcar, consultar y borrar de forma transaccional;
  - SQLite persiste entre reinicios y está en Expo Go.
- **Alternativas descartadas**:
  - AsyncStorage o `expo-sqlite/kv-store`: un solo valor JSON con toda la cola se reescribe completo en cada escaneo y no tiene transacciones.
  - Archivos JSON con `expo-file-system`: mismo problema.
- **Nota**: la base local se abre una vez por proceso, en un módulo de servicio (`baseLocal.ts`), y no con `SQLiteProvider`. Así la sincronización, que no es un componente, también puede usarla.

## R-02. QR propio del trabajador

- **Decisión**: guardar `codigoQr` con `expo-secure-store`, que ya está instalado y configurado, con la clave `civiltrace.qrAsistencia.<usuarioId>`. Al abrir "Mi asistencia" se muestra el guardado de inmediato y luego se confirma con `GET /asistencia/mi-credencial`.
- **Razón**: es un dato pequeño y sensible (identifica al trabajador), y debe verse sin señal (FR-003, SC-005).

## R-03. Fotos de trabajadores sin conexión

- **Decisión**: descargar la foto de cada trabajador del paquete con la API nueva de `expo-file-system`: `File.createDownloadTask(url, destino, { headers: { Authorization } })` y luego `downloadAsync()`. El destino es `Paths.document/asistencia/fotos/<obraId>/<trabajadorId>`, y en la confirmación se usa `file.uri`. Si la descarga falla, se muestran las iniciales.
- **Razón**: la API sirve la foto con token (decisión T-09), y el `<Image>` sin conexión necesita un archivo local.
- **Ojo**: hay que importar desde `expo-file-system`, no desde `/legacy`. En la API legacy, los encabezados de descarga aparecen documentados como `undefined`.

## R-04. Lectura del QR

- **Decisión**:
  - usar `CameraView` de `expo-camera` (~58.0.14) con `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}` y `onBarcodeScanned`;
  - pedir el permiso con `useCameraPermissions()`;
  - mostrar la cámara **solo cuando la pantalla tiene el foco** (`useIsFocused` de React Navigation), porque Expo admite una sola vista previa activa;
  - mientras la confirmación esté abierta, ignorar nuevos escaneos (`onBarcodeScanned={undefined}`), para no leer el mismo QR varias veces seguidas.

## R-05. Huella del QR sin conexión

- **Decisión**: calcular `Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, textoSinPrefijo)` con `expo-crypto` (~58.0.8), que devuelve hexadecimal por defecto. Se compara con `huellaCredencial` del paquete (contrato de la API).
- **A verificar en la implementación**: la documentación no dice cómo codifica el texto antes de calcular la huella. El token es base64url (ASCII), así que UTF-8 y ASCII dan lo mismo. Aun así, la primera prueba de la fase de base compara contra una huella generada en la API.

## R-06. Identificador local del escaneo

- **Decisión**: `Crypto.randomUUID()` de `expo-crypto`, que genera un UUID v4 como exige el contrato.
- **A verificar en la implementación**: la consulta a la documentación no cubrió esta función. Si no existe en el SDK 58, se arma el UUID v4 con `Crypto.getRandomBytes(16)`.

## R-07. Detección de conexión

- **Decisión**: usar `expo-network` (~58.0.5).
  - `useNetworkState()` en las pantallas (indicador "Sin conexión").
  - `addNetworkStateListener` en el servicio de sincronización, para enviar los pendientes en cuanto `isInternetReachable` sea `true`.
  - Además se sincroniza al volver la app al frente (`AppState`), al aceptar un escaneo y después de iniciar sesión.
- **Razón**: `isInternetReachable` refleja si de verdad hay internet. Aun así, la app trata cualquier fallo de red en una llamada como "sin conexión", porque la señal en la obra puede estar pero no funcionar.

## R-08. Ubicación del escaneo

- **Decisión**: con `expo-location`, pedir `requestForegroundPermissionsAsync` una vez. En cada escaneo se compite `getCurrentPositionAsync({ accuracy: Balanced })` contra un límite de 4 s (`Promise.race`, porque la API no trae opción de tiempo límite). Si gana el límite, se usa `getLastKnownPositionAsync({ maxAge: 5 min })`, y si tampoco hay, "Sin ubicación GPS" (`null`/`null`).
- **Razón**: la ubicación no debe frenar el escaneo, que tiene que tardar menos de 10 s (SC-001), y su falta no impide registrar (FR-014).

## R-09. Motor de sincronización

- **Decisión**: un servicio único, `servicioSincronizacionAsistencia`, con un candado en memoria para que no corran dos envíos a la vez. En cada ciclo:
  1. toma los pendientes de la sesión actual en orden de captura;
  2. los envía en lotes de hasta 100 a `POST /asistencia/registros`;
  3. si un escaneo vuelve como `GUARDADO` o `DUPLICADO`, lo borra de la cola;
  4. si vuelve como `RECHAZADO`, lo mueve a "rechazados", con nombre y motivo, hasta que el supervisor lo descarte;
  5. si falla la red o el servidor responde 5xx, deja todo igual y lo reintenta en el siguiente evento.

  Un 401 detiene la sincronización hasta un nuevo inicio de sesión (edge case "Sesión vencida").

- **Razón**: el `idLocal` hace que reenviar sea seguro (API R-03). Se borra **solo después** de la confirmación del servidor (FR-011).
- **Alternativa descartada**: tareas en segundo plano (`expo-background-task`). Agregan permisos y no son confiables en Expo Go; los cuatro disparadores cubren el uso real.

## R-10. ¿Entrada o salida sin conexión?

- **Decisión**: tabla local `registro_dia_local`, con trabajador, obra, fecha, `tieneEntrada` y `tieneSalida`.
  - Se llena con el resumen del día (`GET /obras/:obraId/asistencia`) cada vez que hay conexión, y se actualiza con cada escaneo aceptado en el teléfono.
  - Sin conexión decide: sin entrada → ENTRADA; con entrada → SALIDA; con ambas → "La asistencia de hoy ya está completa".
  - El servidor tiene la última palabra al sincronizar.
- **Razón**: reproduce la regla del servidor (FR-007 de la API) con lo que el teléfono conoce (edge case "Mismo trabajador dos veces").

## R-11. Navegación por rol

- **Decisión**: dos navegadores de pestañas nuevos, con el `NavegacionInferior` que ya existe.
  - **Supervisor**: `PestanasSupervisor` con "Inicio", "Asistencia" y "Cuenta". "Inicio" muestra la `PantallaPrincipalSupervisor` actual.
  - **Trabajador**: `PestanasTrabajador` con "Trabajo", "Mi asistencia" y "Cuenta". "Trabajo" es un marcador hasta su feature.
  - Cada pestaña de asistencia tiene una pila nativa (`native-stack`).
  - "Detalles de asistencia" se abre como hoja inferior con el `Modal` de React Native, como `ModalExito`, sin librerías nuevas.
- **Razón**: decisión T-01 (React Navigation) y constitución I (el Figma muestra esas barras).

## R-12. Formato de horas

- **Decisión**: mostrar las horas de horario (`"08:00"`) convertidas a 12 horas sin depender de zonas: `08:00` → "8:00 am". Los instantes de entrada y salida se formatean con `Intl.DateTimeFormat('es-MX', { timeZone: zonaHoraria, hour: 'numeric', minute: '2-digit' })`.
- **A verificar en la implementación**: que Hermes en React Native 0.88 respete `timeZone`. Si no lo hace, se calcula el desfase en la utilidad `formatoHoras.ts`, con pruebas.

## R-13. Pruebas y lint (módulo 00 de la app)

- **Hallazgo**: la app no tiene `test` ni `lint`, y la constitución III exige `jest-expo` con React Native Testing Library y 60 % de cobertura.
- **Decisión**:
  - **Pruebas**: `npx expo install jest-expo jest @types/jest @testing-library/react-native "--" --dev`. Jest 30, porque `jest-expo` 58 lo exige. Se configura el `preset: 'jest-expo'` en `package.json`, se agrega `"jest"` a `types` en `tsconfig` y los scripts `test` y `test:cobertura`. No se usa `react-test-renderer`, porque no soporta React 19.
  - **Lint**: `npx expo lint`, que crea `eslint.config.js` con `eslint-config-expo/flat`. Se le agregan `eslint-config-prettier` y `.prettierrc`, este último igual al de la API.
  - **Módulos nativos en pruebas**: SQLite, la cámara, la red y la ubicación se sustituyen con dobles. Los servicios reciben una interfaz `RepositorioLocal`, que en las pruebas es una implementación en memoria y en la app usa SQLite.

## R-14. Contrato

- **Decisión**: la app usa el contrato de la API tal cual: `CivilTrace-API/specs/001-asistencia-qr-horario/contracts/asistencia-api.md`. Los tipos de TypeScript de las respuestas van en `src/tipos/asistencia.ts`. Los servicios HTTP siguen el patrón de `llamarApi` en `src/conexion/clienteApi.ts`.
