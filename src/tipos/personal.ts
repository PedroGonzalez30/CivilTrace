/**
 * @archivo personal.ts
 * @proyecto Civil Trace
 * @descripcion Tipos de las personas de la empresa que se pueden asignar a una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 18/11/2026
 * @version 1.0.0
 */

export interface PersonaEmpresa {
  id: string;
  nombre: string;
}

export interface PersonalEmpresa {
  supervisores: PersonaEmpresa[];
  trabajadores: PersonaEmpresa[];
}
