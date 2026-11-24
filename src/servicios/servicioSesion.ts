/**
 * @archivo servicioSesion.ts
 * @proyecto Civil Trace
 * @descripcion Guarda, restaura y elimina la sesión del usuario en el almacenamiento seguro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import * as SecureStore from 'expo-secure-store';

import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { esRolValido } from '@/utilidades/esRolValido';

const CLAVE_SESION = 'session';

function esSesionAutenticacion(valor: unknown): valor is SesionAutenticacion {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  if (!('token' in valor) || typeof valor.token !== 'string') {
    return false;
  }
  if (!('tokenRefresco' in valor) || typeof valor.tokenRefresco !== 'string') {
    return false;
  }
  if (!('venceEn' in valor) || typeof valor.venceEn !== 'number') {
    return false;
  }
  if (!('usuario' in valor) || typeof valor.usuario !== 'object' || valor.usuario === null) {
    return false;
  }

  return (
    'id' in valor.usuario &&
    typeof valor.usuario.id === 'string' &&
    'nombre' in valor.usuario &&
    typeof valor.usuario.nombre === 'string' &&
    'correo' in valor.usuario &&
    typeof valor.usuario.correo === 'string' &&
    'empresaId' in valor.usuario &&
    typeof valor.usuario.empresaId === 'string' &&
    'rol' in valor.usuario &&
    typeof valor.usuario.rol === 'string' &&
    esRolValido(valor.usuario.rol)
  );
}

/**
 * Guarda la sesión en el almacenamiento seguro del dispositivo.
 *
 * @param sesion - Sesión que se va a guardar.
 */
export async function guardarSesion(sesion: SesionAutenticacion): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(sesion));
}

/**
 * Elimina la sesión guardada en el dispositivo.
 */
export async function limpiarSesion(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_SESION);
}

/**
 * Recupera la sesión guardada si existe y tiene la forma correcta. Aunque el token de acceso
 * haya vencido, se devuelve: quien la restaura la renueva con el token de refresco.
 *
 * @returns La sesión guardada, o null si no hay una sesión utilizable.
 */
export async function restaurarSesion(): Promise<SesionAutenticacion | null> {
  try {
    const contenidoGuardado = await SecureStore.getItemAsync(CLAVE_SESION);
    if (contenidoGuardado === null) {
      return null;
    }

    const sesionLeida: unknown = JSON.parse(contenidoGuardado);
    if (!esSesionAutenticacion(sesionLeida)) {
      await limpiarSesion();
      return null;
    }

    return sesionLeida;
  } catch {
    await limpiarSesion();
    return null;
  }
}
