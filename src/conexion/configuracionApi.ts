/**
 * @archivo api.ts
 * @proyecto Civil Trace
 * @descripcion Dirección de la API, tomada de la variable de entorno pública de Expo.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// En el APK se sustituye por la URL https de Azure (se define en eas.json); aquí no hay secretos.
const URL_CONFIGURADA = process.env.EXPO_PUBLIC_API_URL ?? '';

export const URL_API = URL_CONFIGURADA.trim().replace(/\/+$/, '');
export const TIEMPO_ESPERA_API_MS = 15000;
