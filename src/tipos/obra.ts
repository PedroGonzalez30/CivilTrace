/**
 * @archivo obra.ts
 * @proyecto Civil Trace
 * @descripcion Interfaz que describe una obra de construcción.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

export interface Obra {
  id: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  direccion: string;
  fechaInicio: string;
  fechaFinal: string;
  supervisor: string;
  cliente: string;
}
