/**
 * @archivo obras.ts
 * @proyecto Civil Trace
 * @descripcion Obras y códigos de acceso de prueba que sustituyen al servidor.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import type { DatosNuevaObra, Obra } from '@/tipos/obra';
import { CUENTA_SIMULADA } from '@/simulados/autenticacion';

export const OBRAS_SIMULADAS: Obra[] = [
  {
    id: 'hospital',
    nombre: 'Hospital',
    resumen: 'Construcción del hospital general',
    descripcion:
      'Construcción del hospital general de Ensenada Baja California, solicitada por el gobierno',
    direccion: 'Avenida Reforma',
    fechaInicio: '12/10/2026',
    fechaFinal: '12/10/2028',
    supervisor: 'María Castro',
    cliente: 'Gobierno del Estado',
  },
  {
    id: 'departamentos',
    nombre: 'Departamentos',
    resumen: 'Construcción de departamentos tres edificios.',
    descripcion: 'Construcción de departamentos tres edificios.',
    direccion: 'Lomas de San Fernando',
    fechaInicio: '01/11/2026',
    fechaFinal: '25/12/2027',
    supervisor: '—',
    cliente: '—',
  },
];

export const CODIGOS_ACCESO = {
  trabajadores: 'CT-OBRA-9876545',
  supervisores: 'CT-OBRA-987654',
};

// Solo la cuenta de prueba tiene obras; las cuentas nuevas empiezan vacías.
export function obtenerObras(idUsuario: string): Obra[] {
  return idUsuario === CUENTA_SIMULADA.usuario.id ? OBRAS_SIMULADAS : [];
}


export const DATOS_NUEVA_OBRA_SIMULADOS: DatosNuevaObra = {
  nombre: 'Construcción de casa',
  cliente: 'Ramón',
  correoCliente: 'ramon@ejemplo.com',
  direccion: 'Calle Ficticia #123, Colonia San Miguel',
  fechaInicio: '02/04/2024',
  fechaFin: '02/04/2025',
  supervisor: 'María Castro',
};
