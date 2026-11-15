/**
 * @archivo autenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Cuenta de prueba que sustituye al servidor mientras no exista la API real.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { RolUsuario } from '@/tipos/autenticacion';

export const CUENTA_SIMULADA = {
  correo: 'user@gmail.com',
  contrasena: '123456',
  token: 'mock-token',
  usuario: {
    id: '1',
    nombre: 'Javier',
    correo: 'user@gmail.com',
    rol: RolUsuario.DUENO,
    empresa: 'Todo Concreto',
  },
};
