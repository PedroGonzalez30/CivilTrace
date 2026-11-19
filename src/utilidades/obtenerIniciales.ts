/**
 * @archivo obtenerIniciales.ts
 * @proyecto Civil Trace
 * @descripcion Obtiene las iniciales de un nombre para mostrarlas en el avatar.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 19/11/2026
 * @version 1.0.0
 */

const MAXIMO_INICIALES = 2;

/**
 * @param nombre - Nombre completo de la persona.
 * @returns Las primeras letras de las dos primeras palabras, en mayúsculas ("María Castro" → "MC").
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 0)
    .slice(0, MAXIMO_INICIALES)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('');
}