# Especificación del feature: Asistencia con QR, horario por obra y calendario (app móvil)

**Feature Branch**: `001-asistencia-qr-horario`

**Created**: 2026-11-23

**Status**: Draft

**Input**: Descripción del usuario: "Spec de la app para asistencia con QR, horario por obra y calendario, basada en el contrato de la API ya implementado."

**Relación con la API**: este feature es la parte móvil del feature `001-asistencia-qr-horario` de `CivilTrace-API`. Esa parte ya está implementada y su base de datos ya está migrada en Azure. Las reglas de negocio están en la [especificación de la API](https://github.com/PedroGonzalez30/CivilTrace-API/blob/001-asistencia-qr-horario/specs/001-asistencia-qr-horario/spec.md). Aquí se especifica **lo que ve y hace cada usuario en la app**; la app no repite ni cambia esas reglas.

**Requerimientos del SRS V4.0 que atiende**:

- `RF-19 Registrar asistencia propia`: el trabajador lo cumple mostrando su QR (D-17).
- `RF-27 Registrar asistencia por el supervisor`.
- `RF-56 Mostrar días con descuento` (símbolo $, D-13).
- `RF-58 Mostrar calendario de asistencia`.
- `RF-60 Registrar retardo o salida anticipada`.
- `RNF-07 Captura sin conexión`, aplicado a asistencia (D-14).

Decisiones que aplica: D-06, D-07, D-08, D-13, D-14, D-15, D-16, D-17 y D-18.

**Pantallas del Figma** (archivo `EIXrnioyKFd9EoBY5PINOV`):

| Pantalla                                                                                  | node-id                    | Rol                     |
| ----------------------------------------------------------------------------------------- | -------------------------- | ----------------------- |
| `SUP_Asistencia_EscogerObra`                                                              | `96:2903`                  | Supervisor              |
| `SUP_Asistencia_LeerQr (accesos nuevos)`                                                  | `2272:117`                 | Supervisor              |
| `Sup_Asistencia_ConfirmarQR`                                                              | `96:2228`                  | Supervisor              |
| `SUP_HorarioObra`                                                                         | `2272:170`                 | Supervisor              |
| `SUP_DetallesAsistencia`                                                                  | `2272:250`                 | Supervisor              |
| `SUP_CalendarioTrabajador`                                                                | `2272:354`                 | Supervisor              |
| `SUP_CalendarioTrabajador_DetalleDia`                                                     | `2272:523`                 | Supervisor              |
| `TRA-Asistencia Dia`                                                                      | `96:329`                   | Trabajador              |
| `TRA-HIstorial asistencia`                                                                | `96:389`                   | Trabajador              |
| Barra inferior del trabajador ("Trabajo / Mi asistencia / Cuenta")                        | `59:819` (como referencia) | Trabajador              |
| `SUP_Asistencia_LeerQr_SinConexion (propuesta)`: avisos de pendientes y rechazados        | `2295:254`                 | Supervisor              |
| `Cuenta_Oficio (todos los roles, propuesta)`: campo "Oficio"                              | `2295:313`                 | Todos                   |
| `SUP_CalendarioTrabajador_DetalleDia_Descuento (propuesta)`: $ junto al efecto en el pago | `2295:392`                 | Supervisor y trabajador |

## User Scenarios & Testing _(mandatory)_

### User Story 1: El trabajador muestra su QR (Priority: P1)

El trabajador entra a "Mi asistencia" desde su barra inferior. Ve el horario de hoy de su obra, el estado de la entrada y de la salida ("Pendiente" o "Registrada"), su QR grande y su tarjeta con nombre y oficio. El QR es siempre el mismo (D-17) y se ve aunque el teléfono no tenga señal.

**Why this priority**: sin el QR del trabajador, el supervisor no tiene qué escanear (RF-19, RF-27).

**Independent Test**: un trabajador con obra asignada abre "Mi asistencia". Ve su QR, el horario y ambos estados en "Pendiente". Después de que el supervisor lo escanea y la pantalla se actualiza, la entrada muestra "Registrada".

**Acceptance Scenarios**:

1. **Given** un trabajador asignado a la obra "Hospital" con horario de 08:00 a 16:00, **When** abre "Mi asistencia", **Then** ve "Entrada 8:00 am · Pendiente", "Salida 4:00 pm · Pendiente", su QR y su nombre con su oficio.
2. **Given** un trabajador que ya abrió su QR alguna vez, **When** abre "Mi asistencia" sin señal, **Then** sigue viendo su QR y un aviso de que los estados pueden no estar actualizados.
3. **Given** que el supervisor ya registró su entrada, **When** el trabajador vuelve a la pantalla o la desliza para actualizar, **Then** la entrada muestra "Registrada".
4. **Given** un trabajador sin obras asignadas, **When** abre "Mi asistencia", **Then** ve su QR y un mensaje de que todavía no tiene obra asignada, en lugar del horario.

---

### User Story 2: El supervisor pasa asistencia escaneando QR, con o sin señal (Priority: P1)

El supervisor entra a "Asistencia" desde su barra inferior y elige la obra (`SUP_Asistencia_EscogerObra`). En `SUP_Asistencia_LeerQr` ve:

- el horario del día con el estado de la entrada y la salida ("Finalizado" o "Pendiente");
- el acceso "Editar horario de la obra";
- el área para escanear;
- el "Resumen de asistencia", con cada trabajador y su hora de entrada.

Al escanear un QR aparece `Sup_Asistencia_ConfirmarQR`, con el nombre completo, la hora, la ubicación, la foto, el oficio y si tiene faltas en el mes. El supervisor pulsa "Aceptar" o "Rechazar". Sin señal hace lo mismo: el registro queda pendiente en el teléfono y se envía solo al volver la conexión (D-14).

**Why this priority**: es el registro de asistencia en sí (RF-27). Sin conexión tiene que funcionar porque en la obra a veces no hay señal (D-14).

**Independent Test**: con señal, el supervisor escanea a un trabajador, acepta, y el trabajador aparece en el resumen con su hora. Luego, en modo avión, escanea a otro, acepta y ve "1 registro pendiente de envío". Al quitar el modo avión el registro se envía y aparece en el resumen.

**Acceptance Scenarios**:

1. **Given** un supervisor con dos obras, **When** entra a "Asistencia", **Then** ve las dos tarjetas con nombre, descripción, dirección y fechas, y al tocar una pasa a la lectura de QR de esa obra.
2. **Given** la cámara lista y un trabajador asignado, **When** el supervisor escanea su QR, **Then** ve la confirmación con nombre, oficio, foto, hora, ubicación y "Sin faltas este mes" o el número de faltas.
3. **Given** la confirmación abierta, **When** pulsa "Aceptar", **Then** vuelve a la lectura de QR y el trabajador aparece en el resumen con "Entrada HH:MM". Un segundo escaneo del mismo trabajador ese día registra la salida.
4. **Given** la confirmación abierta, **When** pulsa "Rechazar", **Then** no se registra nada y vuelve a la lectura de QR.
5. **Given** un QR que no es de Civil Trace, de otra empresa, o de un trabajador no asignado a esa obra, **When** se escanea, **Then** no se muestra la confirmación, sino un mensaje claro ("El código no es de Civil Trace o ya no es válido" o "El trabajador no está asignado a esta obra").
6. **Given** un trabajador que ya tiene entrada y salida hoy, **When** se escanea, **Then** el mensaje es "La asistencia de hoy ya está completa".
7. **Given** que el supervisor abrió la obra con señal, **When** pierde la señal y escanea a un trabajador asignado, **Then** ve la confirmación con los datos guardados en el teléfono (incluida la foto) y, al aceptar, el registro queda como "Pendiente de envío".
8. **Given** registros pendientes de envío, **When** vuelve la conexión, **Then** se envían solos y el supervisor ve cuántos se guardaron. Si alguno fue rechazado, ve qué trabajador fue y por qué.
9. **Given** registros pendientes de envío, **When** se cierra la app o se reinicia el teléfono, **Then** los registros siguen pendientes y se envían al recuperar la conexión.
10. **Given** que el supervisor negó el permiso de cámara, **When** abre la lectura de QR, **Then** ve un mensaje que explica por qué se necesita la cámara y un botón para dar el permiso.
11. **Given** que no hay ubicación disponible, **When** acepta un escaneo, **Then** el registro se guarda igual, "Sin ubicación GPS".

---

### User Story 3: El supervisor fija el horario de la obra (Priority: P1)

Desde "Editar horario de la obra", el supervisor abre `SUP_HorarioObra` y elige:

- la hora de entrada y la de salida;
- la tolerancia (10, 15 o 20 min);
- los días laborales;
- si el horario aplica a "Todos los días" o "Solo hoy".

La pantalla explica la regla de retardo con la hora real (por ejemplo, "Una entrada después de las 08:15 se marca como retardo") y guarda con "Guardar horario".

**Why this priority**: sin horario no hay retardos ni faltas (D-06).

**Independent Test**: guardar 08:00–16:00, 15 min, de lunes a sábado, "Todos los días". Al volver a la lectura de QR, el horario mostrado es 8:00 am / 4:00 pm.

**Acceptance Scenarios**:

1. **Given** una obra sin horario, **When** el supervisor abre la pantalla, **Then** ve los valores por defecto (08:00, 16:00, 15 min, de lunes a sábado, "Todos los días").
2. **Given** una obra con horario, **When** abre la pantalla, **Then** ve el horario guardado.
3. **Given** que cambia la tolerancia a 20 min, **When** la elige, **Then** el texto explicativo cambia a "después de las 08:20".
4. **Given** una salida igual o anterior a la entrada, o ningún día elegido, **When** pulsa "Guardar horario", **Then** ve el mensaje de error y no se guarda.
5. **Given** que el horario se guardó, **When** vuelve, **Then** la lectura de QR muestra el horario nuevo.
6. **Given** que no hay señal, **When** intenta guardar, **Then** ve "Necesitas conexión para guardar el horario" y sus cambios siguen en pantalla.

---

### User Story 4: El supervisor revisa y justifica la asistencia (Priority: P2)

En el "Resumen de asistencia", el supervisor mantiene presionado a un trabajador y se abre `SUP_DetallesAsistencia` como hoja inferior. En ella ve el nombre, el oficio, la obra y la fecha, y "Entrada HH:MM · Salida —". Puede cambiar:

- el tipo de jornada;
- el motivo;
- el efecto en el pago;
- las anotaciones;
- las horas, con "Editar horas".

Pulsa "Guardar detalles". La hoja avisa que se guarda quién hizo el cambio, la fecha, la hora y el valor anterior (D-07, RF-60).

**Why this priority**: permite justificar retardos y faltas y decidir su efecto en el pago, que es lo que el cliente pidió (RF-60). Depende de la historia 2.

**Independent Test**: mantener presionado a un trabajador, elegir "Media jornada", "Cita médica" y "Medio día", escribir una anotación y guardar. Al reabrir la hoja se ven los valores guardados.

**Acceptance Scenarios**:

1. **Given** el resumen del día, **When** mantiene presionado a un trabajador, **Then** se abre la hoja con sus datos del día y sus valores actuales.
2. **Given** un tipo distinto de "Completa" sin anotación, **When** pulsa "Guardar detalles", **Then** ve "La observación es obligatoria" y no se cierra la hoja.
3. **Given** que corrige la hora de entrada con "Editar horas", **When** guarda, **Then** el resumen muestra la hora nueva.
4. **Given** la hoja abierta, **When** toca el icono de calendario, **Then** abre el calendario de ese trabajador (historia 5).
5. **Given** que no hay señal, **When** intenta guardar, **Then** ve que necesita conexión y no pierde lo que capturó.

---

### User Story 5: Calendario de asistencia (Priority: P2)

El trabajador abre su historial (`TRA-HIstorial asistencia`) con el icono de calendario de "Mi asistencia". El supervisor abre el de un trabajador (`SUP_CalendarioTrabajador`) desde los detalles. En los dos casos:

- cada día laborable pasado tiene color: verde para completa, naranja para retardo, media jornada o salida temprana, y rojo para falta;
- los días con descuento muestran **$** (D-13);
- hay flechas para cambiar de mes;
- al tocar un día con color se abre su detalle (`SUP_CalendarioTrabajador_DetalleDia`) con tipo, entrada, salida, motivo, efecto en el pago, anotación, quién registró y las modificaciones.

El supervisor ve arriba el resumen del mes ("1 falta · 1 media jornada · 1 retardo"). El trabajador ve "Tienes N falta(s) este mes" y el recordatorio, pero solo si tiene al menos una falta (D-16).

**Why this priority**: el trabajador ve cómo se afecta su pago y el supervisor revisa el historial (RF-56, RF-58). Depende de las historias 2 y 4.

**Independent Test**: con los datos de mayo de 2026 de la spec de la API (13 falta, 14 y 15 completos, 19 media jornada con descuento), el calendario pinta rojo, verde, verde y naranja con $. Al tocar el 19 se ven "Media jornada", la salida a las 12:00 pm, "Cita médica" y "Medio día de pago".

**Acceptance Scenarios**:

1. **Given** el calendario de mayo de 2026, **When** se abre, **Then** los colores y el $ coinciden con los días del servidor, y los domingos y días futuros quedan sin color.
2. **Given** un trabajador sin faltas en el mes, **When** abre su historial, **Then** no ve la alerta ni el recordatorio.
3. **Given** un día con modificación, **When** se toca, **Then** el detalle muestra "Modificado: entrada original 8:20 → 8:00 (olvidó registrarse)".
4. **Given** el calendario abierto, **When** cambia de mes, **Then** se cargan los colores de ese mes.
5. **Given** que no hay señal, **When** abre el calendario, **Then** ve un mensaje de que necesita conexión, sin errores técnicos.

---

### User Story 6: Oficio en el perfil (Priority: P3)

En "Mi perfil", el usuario puede escribir su oficio (por ejemplo, "Plomero"), y este aparece en las pantallas de asistencia (D-18).

**Why this priority**: es un dato que se muestra; sin él, las pantallas solo muestran el nombre.

**Independent Test**: escribir "Albañil" en el perfil y guardar. "Mi asistencia" muestra "Albañil" bajo el nombre.

**Acceptance Scenarios**:

1. **Given** el perfil abierto, **When** escribe el oficio y guarda, **Then** se guarda y se ve en "Mi asistencia" y en la confirmación del escaneo.
2. **Given** un oficio de más de 60 caracteres, **When** intenta guardar, **Then** ve "El oficio es demasiado largo".

---

### Edge Cases

- **Paquete desactualizado:** el supervisor abrió la obra hace días y no ha tenido señal. La app usa los datos guardados (trabajadores, fotos, horario) y muestra desde cuándo no se actualizan. Los escaneos de más de 7 días que no se pudieron enviar los rechaza la API (`FECHA_FUERA_DE_RANGO`), y la app los muestra como rechazados.
- **Trabajador nuevo sin señal:** si el supervisor descargó los datos antes de que asignaran al trabajador, su QR no aparece en el teléfono. Se muestra "No se encontró al trabajador en los datos guardados; conéctate para actualizarlos".
- **Mismo trabajador escaneado dos veces sin señal:** la app sigue el mismo orden que el servidor: el primer escaneo es la entrada y el segundo, la salida. Un tercero se rechaza en el teléfono ("La asistencia de hoy ya está completa").
- **Reenvíos:** si se corta la conexión a mitad de un envío, la app reenvía los mismos escaneos con su identificador. El servidor responde "Duplicado" y no los repite.
- **Cambio de día:** si el supervisor deja la app abierta después de medianoche, el resumen y el horario se recalculan para el nuevo día al volver a la pantalla.
- **Sesión vencida con pendientes:** los registros pendientes no se pierden; se envían cuando el supervisor vuelve a iniciar sesión.
- **Hora del teléfono:** los escaneos sin señal llevan la hora del teléfono (API R-04). La app no intenta corregirla.

## Requirements _(mandatory)_

### Functional Requirements

**Navegación**

- **FR-001**: El supervisor DEBE tener una barra inferior "Inicio / Asistencia / Cuenta", y el trabajador "Trabajo / Mi asistencia / Cuenta", con el estilo de `NavegacionInferior`. Las pestañas "Inicio" y "Trabajo" muestran lo que ya existe hoy para cada rol; su contenido es de otros features.

**Trabajador (RF-19)**

- **FR-002**: "Mi asistencia" DEBE mostrar el QR del trabajador, el horario de hoy por obra con el estado de la entrada y la salida, y su nombre con su oficio.
- **FR-003**: El QR DEBE guardarse en el teléfono de forma segura para mostrarse sin conexión.
- **FR-004**: La pantalla DEBE actualizarse al volver a ella y al deslizar hacia abajo.

**Supervisor: escaneo (RF-27, RNF-07)**

- **FR-005**: La app DEBE listar las obras que supervisa el usuario y abrir la lectura de QR de la que elija.
- **FR-006**: La lectura de QR DEBE mostrar el horario del día con sus estados, el acceso a editar el horario, la cámara y el resumen del día.
- **FR-007**: Con conexión, al escanear un QR la app DEBE pedir la vista previa al servidor y mostrar la confirmación. Los rechazos se muestran con el mensaje del servidor.
- **FR-008**: Al entrar a una obra con conexión, la app DEBE descargar y guardar en el teléfono el paquete sin conexión de esa obra (trabajadores, fotos, huellas de los QR, horario y faltas del mes), y debe actualizarlo cada vez que vuelva a entrar con conexión.
- **FR-009**: Sin conexión, la app DEBE validar el QR contra el paquete guardado. Para eso calcula la huella SHA-256 del texto después de `ct1.`. Debe mostrar la misma confirmación con los datos guardados y decidir si el escaneo es entrada o salida con los registros del día que conoce.
- **FR-010**: Cada escaneo aceptado DEBE guardarse en el teléfono con un identificador único, la obra, el código, la hora, si fue sin conexión y la ubicación (o "Sin ubicación GPS"), **antes** de intentar enviarlo.
- **FR-011**: La app DEBE enviar los escaneos pendientes en orden, por lotes de máximo 100. Lo hace al aceptar un escaneo con conexión, al recuperar la conexión y al abrir la app. Debe quitar de pendientes solo los que el servidor confirme ("Guardado" o "Duplicado").
- **FR-012**: La lectura de QR DEBE mostrar cuántos registros están pendientes de envío y avisar de los rechazados, con el nombre del trabajador y el motivo.
- **FR-013**: Los pendientes DEBEN sobrevivir al cierre de la app, al reinicio del teléfono y al cierre de sesión. Se envían con la sesión del supervisor que los registró.
- **FR-014**: La app DEBE pedir los permisos de cámara y ubicación explicando para qué son. Sin cámara no se escanea; sin ubicación se registra igual.

**Supervisor: horario (D-06)**

- **FR-015**: La pantalla de horario DEBE permitir elegir la entrada, la salida, la tolerancia (10, 15 o 20), los días laborales y "Todos los días" o "Solo hoy". Debe mostrar la regla de retardo con la hora calculada y guardar con conexión.

**Supervisor: detalles (D-07, RF-60)**

- **FR-016**: Mantener presionado a un trabajador en el resumen DEBE abrir la hoja de detalles del día, con los tipos de jornada, los motivos y los efectos en el pago del Figma, las anotaciones y "Editar horas".
- **FR-017**: La app DEBE avisar antes de guardar si falta la observación obligatoria y mostrar los errores del servidor sin cerrar la hoja.

**Calendario (D-08, D-13, D-16, RF-56, RF-58)**

- **FR-018**: El calendario DEBE pintar cada día con el color que manda el servidor, mostrar **$** en los días con descuento y permitir cambiar de mes.
- **FR-019**: Tocar un día con color DEBE abrir su detalle, con quién registró y las modificaciones (valor original → nuevo y motivo).
- **FR-020**: El supervisor ve el resumen del mes. El trabajador ve la alerta de faltas y el recordatorio solo con al menos una falta.

**Perfil (D-18)**

- **FR-021**: "Mi perfil" DEBE tener un campo opcional "Oficio" (máximo 60 caracteres).

**Transversales**

- **FR-022**: Las horas DEBEN mostrarse en formato de 12 horas ("8:00 am"), en la zona horaria que devuelve la API.
- **FR-023**: Toda llamada al servidor DEBE manejar los errores con mensajes claros en español (constitución II). Sin conexión, las pantallas que la necesitan lo dicen en lugar de fallar.
- **FR-024**: Las pantallas DEBEN seguir el Figma: colores, Poppins, tarjetas, chips y barra inferior.

### Key Entities _(include if feature involves data)_

- **Escaneo pendiente** (solo en el teléfono): identificador local, obra, código QR, hora de captura, si fue sin conexión, ubicación, estado (pendiente, enviado o rechazado con motivo) y nombre del trabajador para mostrarlo.
- **Paquete de obra** (solo en el teléfono): copia de lo que entrega la API para validar sin conexión, con la fecha en que se descargó. También guarda los registros del día que el teléfono conoce, para saber si un escaneo es entrada o salida.
- **QR propio** (solo en el teléfono del trabajador): el código de su credencial.

Las demás entidades (horario, registro, cambios, calendario) viven en la API; la app solo las muestra.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El supervisor registra una entrada, del escaneo a "Aceptar", en menos de 10 segundos con o sin señal (spec de la API, SC-001).
- **SC-002**: El supervisor pasa asistencia de 20 trabajadores en menos de 5 minutos.
- **SC-003**: El 100 % de los escaneos aceptados sin señal llegan al servidor después de recuperar la conexión, aunque la app se cierre o el teléfono se reinicie en medio (0 escaneos perdidos en las pruebas).
- **SC-004**: Ningún escaneo se registra dos veces por reenvíos (0 duplicados en las pruebas).
- **SC-005**: El trabajador ve su QR en menos de 2 segundos al abrir "Mi asistencia", con o sin señal.
- **SC-006**: Cada pantalla del feature coincide con su pantalla del Figma, revisada por `node-id` (constitución VI.5).

## Assumptions

- **API:** el contrato es el de `CivilTrace-API/specs/001-asistencia-qr-horario/contracts/asistencia-api.md`, ya desplegado al unir su PR. La app no agrega reglas de negocio; las del teléfono sin conexión copian las del servidor solo para mostrar la confirmación.
- **Dueño:** el Figma no tiene pantallas de asistencia para el dueño. Aunque la API ya le permite ver calendarios y cambiar horarios, en la app eso queda fuera de este feature (constitución I.2).
- **Pantallas propuestas:** el aviso de "registros pendientes de envío", los rechazados al sincronizar, el campo "Oficio" del perfil y el símbolo $ en el detalle del día no estaban en el Figma. Hacen falta para que el sistema funcione (D-14, D-18, D-13). Se diseñaron con el mismo estilo en la sección "Pantallas nuevas — propuesta" (`2295:254`, `2295:313`, `2295:392`, 23/11/2026) y **el equipo debe aprobarlas** antes de implementarlas (constitución I.2).
- **Inicio del supervisor y Trabajo del trabajador:** sus contenidos son de otros features. Aquí solo se crea la barra inferior que los contiene.
- **Lectura del QR:** se usa la cámara trasera, como pide el SRS en las interfaces de hardware (no se usan sensores biométricos).
- **Paquete sin conexión:** se usa mientras la API acepte los escaneos (hasta 7 días). No hay otro límite en la app.
