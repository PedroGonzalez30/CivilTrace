# Feature 002: correcciones de la revisión del equipo (app)

**Rama**: `002-correcciones-revision` · **Fecha**: 24/11/2026 · **Autor**: Emilio Manuel Esquivel
**Origen**: comentarios del equipo al probar el feature 001 en el celular. Decisiones D-22 a D-27 y
T-14 en `docs/decisiones.md`. La parte de la API está en el repo `CivilTrace-API`, en la misma rama.

## Alcance

| #   | Comentario del equipo                                                                   | Cambio en la app                                                                                                                                                     | Decisión |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | "Colocar la foto de la empresa en el header, parte derecha"                             | `ProveedorLogoEmpresa` descarga el logotipo una vez por sesión y `EncabezadoApp` lo muestra a la derecha. Al cambiarlo en Datos de la empresa se actualiza.          | D-25     |
| 2   | "El supervisor debe poder acceder a los códigos, pero solo el de trabajador"            | `SeccionCodigoTrabajadores` en el inicio del supervisor: muestra y copia el código de trabajadores.                                                                  | D-23     |
| 3   | "Al registrar una obra sin supervisor no sale ningún mensaje"                           | Agregar obra ya no ofrece "Sin supervisor"; `validarObra` muestra "Selecciona un supervisor para la obra" y avisa si la empresa no tiene supervisores.               | D-24     |
| 4   | "Todas las entradas se tapan con el teclado y se mueve la barra de navegación de abajo" | `KeyboardAvoidingView behavior="padding"` en Android en todas las pantallas con campos; `NavegacionInferior` se oculta con el teclado abierto (`useTecladoVisible`). | D-27     |
| 5   | "Falta el cómo acceder a los justificantes, a los motivos de retardo"                   | Botón visible "Detalles" por trabajador en "Resumen de asistencia" (antes solo se llegaba manteniendo presionado).                                                   | D-26     |
| 6   | "Validar bien retardo, asistencia y falta"                                              | Se resuelve en la API (D-22); la app solo muestra lo que la API clasifica.                                                                                           | D-22     |

También: se quita un `|` suelto fuera de `<Text>` en `TarjetaCodigoAcceso` (rompía la tarjeta) y
`coverage/` deja de versionarse (T-14). Las fotos de perfil y de la empresa ya funcionan (lo
confirmó el equipo); no se cambian.

## Criterios de aceptación (pruebas)

- `__tests__/correccionesRevision-test.tsx`: CP08-A10/A11-APP (supervisor obligatorio),
  CP04-A10 a A13-APP (código de trabajadores y tarjeta), CP05-A10/A11-APP (logotipo) y
  CP00-A10/A11-APP (teclado y barra inferior).
- `__tests__/PantallasEscaneo-test.tsx`: CP21-A40-APP (el botón "Detalles" abre la hoja).
- Prueba manual en el celular (Expo Go, Android): escribir en Inicio de sesión, Registro, Agregar
  obra, Mi perfil, Cambiar contraseña, Datos de la empresa y el filtro de Reportes; el campo debe
  quedar visible y la barra inferior oculta mientras el teclado está abierto.

## Tareas

- [x] T001 Pruebas de D-23 a D-27.
- [x] T002 Logotipo en el encabezado (D-25).
- [x] T003 Código de trabajadores en el inicio del supervisor (D-23).
- [x] T004 Supervisor obligatorio en Agregar obra (D-24).
- [x] T005 Teclado y barra inferior (D-27).
- [x] T006 Botón "Detalles" (D-26).
- [x] T007 Suite completa con cobertura, tipos, lint y Prettier en verde.
- [ ] T008 Prueba manual del teclado en el celular.
- [ ] T009 PR revisado por el equipo (unir después del PR de la API).
