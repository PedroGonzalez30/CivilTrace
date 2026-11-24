# Guía de validación: Asistencia en la app móvil

**Feature**: `001-asistencia-qr-horario` (app) · Contratos: [pantallas-y-servicios.md](./contracts/pantallas-y-servicios.md) y el de la API · Modelo local: [data-model.md](./data-model.md)

## Requisitos previos

- Node 24.
- La API local corriendo, con `npm run dev` en `CivilTrace-API` y su base de datos con datos de prueba, o la API de Azure ya desplegada con el feature 001.
- Un teléfono con **Expo Go**. Todos los módulos usados están incluidos (research). La cámara solo funciona en un dispositivo real.
- `src/conexion/configuracionApi.ts` apuntando a la API que se va a usar.

```bash
npm install
npx tsc --noEmit
npm run lint
npm test
npx expo start
```

## Pruebas automáticas (jest-expo + Testing Library)

| Clave       | Qué prueba                                                  | Resultado esperado                                                                                                                                 |
| ----------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CP21-A1-APP | `servicioEscaneo` sin conexión con el paquete en memoria    | Un QR válido da `ENTRADA`, luego `SALIDA`, y un tercer escaneo se rechaza en el teléfono                                                           |
| CP21-A2-APP | Huella calculada en la app                                  | Igual a la huella que da la API para el mismo token (R-05)                                                                                         |
| CP21-A3-APP | `servicioSincronizacionAsistencia` con respuestas simuladas | `GUARDADO` y `DUPLICADO` se borran, `RECHAZADO` queda con su motivo, un error de red no borra nada, y dos llamadas simultáneas envían una sola vez |
| CP21-A4-APP | Lotes                                                       | 150 pendientes se envían como 100 + 50, en orden de captura                                                                                        |
| CP21-A5-APP | Sesión                                                      | Los pendientes de otro usuario no se envían con la sesión actual                                                                                   |
| CP22-A1-APP | Pantalla de horario                                         | El texto "después de las 08:15" cambia con la tolerancia; una salida antes de la entrada muestra el error y no llama a la API                      |
| CP19-A1-APP | Calendario                                                  | Los días ROJO, VERDE y NARANJA y el $ se pintan según la respuesta simulada; la alerta de faltas solo aparece con `faltas >= 1`                    |
| CP19-E3-APP | Hoja de detalles                                            | "Retardo" sin observación muestra "La observación es obligatoria" sin llamar a la API                                                              |
| CP06-A1-APP | Perfil                                                      | El campo Oficio se envía en `PUT /perfil`                                                                                                          |

## Prueba manual en teléfono (dos teléfonos o un teléfono y un emulador)

1. **Trabajador**: inicia sesión y abre "Mi asistencia". Debe ver su QR y los estados "Pendiente". Activa el modo avión, cierra y abre la app: el QR sigue visible.
2. **Supervisor**: abre "Asistencia", elige "Hospital", escanea el QR del trabajador y pulsa "Aceptar". La entrada aparece en el resumen; en el teléfono del trabajador, al deslizar, sale "Registrada".
3. **Supervisor sin señal**: activa el modo avión, escanea a otro trabajador y acepta. Aparece "Sin conexión · 1 registro pendiente de envío". Cierra la app por completo, vuelve a abrirla y quita el modo avión: el aviso desaparece y el registro llega al resumen.
4. **Rechazo al sincronizar**: sin señal, escanea a un trabajador. Antes de reconectar, quítalo de la obra desde la cuenta del dueño. Al reconectar aparece "1 registro no se guardó" con su nombre y el motivo.
5. **Horario**: cambia la tolerancia a 20 min y guarda. La lectura de QR muestra el horario nuevo.
6. **Detalles**: mantén presionado a un trabajador, elige "Media jornada", "Cita médica" y "Medio día", escribe una nota y guarda. Abre el calendario desde el icono: el día sale naranja con $.
7. **Perfil**: escribe el oficio. Debe verse en "Mi asistencia" y en la confirmación del escaneo.

## Revisión contra el Figma (constitución VI.5)

Compara cada pantalla con su `node-id` de la tabla de la spec, incluidas las propuestas `2295:254`, `2295:313` y `2295:392`, una vez que el equipo las apruebe.
