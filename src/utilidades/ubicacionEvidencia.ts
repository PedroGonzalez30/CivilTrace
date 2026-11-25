/**
 * @archivo ubicacionEvidencia.ts
 * @proyecto Civil Trace
 * @descripcion Ubicación de una evidencia fotográfica: leerla de la respuesta de la API o de los
 *   datos EXIF de una foto de la galería, describirla en texto y armar el enlace al mapa.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-08 Capturar evidencia fotográfica, RF-12 Generar reporte de avance de obra
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 007)
 */

// 1. Importaciones
import type { UbicacionEvidencia } from '@/tipos/actividad';

// 2. Tipos e interfaces
export interface DatosUbicacion {
  ubicacion: UbicacionEvidencia | null;
  referenciaUbicacion: string | null;
}

// 3. Constantes del módulo
const DECIMALES_COORDENADA = 6;
const LATITUD_MAXIMA = 90;
const LONGITUD_MAXIMA = 180;
export const TEXTO_SIN_GPS = 'Sin ubicación GPS';
export const TEXTO_SIN_UBICACION = 'Ubicación no registrada';

// 4. Funciones
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function esNumero(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function esCoordenadaValida(latitud: number, longitud: number): boolean {
  return Math.abs(latitud) <= LATITUD_MAXIMA && Math.abs(longitud) <= LONGITUD_MAXIMA;
}

/**
 * Lee la ubicación de un avance tal como la manda la API.
 *
 * @param valor - El avance recibido.
 * @returns Coordenadas (o null) y la referencia escrita (o null).
 */
export function leerUbicacionRespuesta(valor: Record<string, unknown>): DatosUbicacion {
  const ubicacion = valor.ubicacion;
  const valida =
    esObjeto(ubicacion) &&
    esNumero(ubicacion.latitud) &&
    esNumero(ubicacion.longitud) &&
    esCoordenadaValida(ubicacion.latitud, ubicacion.longitud);
  return {
    ubicacion: valida
      ? {
          latitud: ubicacion.latitud as number,
          longitud: ubicacion.longitud as number,
          precisionMetros: esNumero(ubicacion.precisionMetros) ? ubicacion.precisionMetros : null,
        }
      : null,
    referenciaUbicacion:
      typeof valor.referenciaUbicacion === 'string' && valor.referenciaUbicacion.trim()
        ? valor.referenciaUbicacion.trim()
        : null,
  };
}

function aGradosConSigno(valor: unknown, referencia: unknown, negativas: string): number | null {
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  if (!esNumero(numero)) {
    return null;
  }
  const esNegativa = typeof referencia === 'string' && referencia.toUpperCase() === negativas;
  return esNegativa ? -Math.abs(numero) : numero;
}

/**
 * Lee las coordenadas de los datos EXIF de una foto elegida de la galería, si las tiene.
 *
 * @param exif - Datos EXIF que da expo-image-picker (GPSLatitude, GPSLatitudeRef, …).
 * @returns Las coordenadas o null si la foto no las guardó.
 */
export function leerUbicacionExif(exif: unknown): UbicacionEvidencia | null {
  if (!esObjeto(exif)) {
    return null;
  }
  const latitud = aGradosConSigno(exif.GPSLatitude, exif.GPSLatitudeRef, 'S');
  const longitud = aGradosConSigno(exif.GPSLongitude, exif.GPSLongitudeRef, 'W');
  if (latitud === null || longitud === null || !esCoordenadaValida(latitud, longitud)) {
    return null;
  }
  // Muchas cámaras guardan 0,0 cuando no tenían señal.
  if (latitud === 0 && longitud === 0) {
    return null;
  }
  return { latitud, longitud, precisionMetros: null };
}

/**
 * @returns "32.624500, -115.452300" con la precisión si la hay ("± 12 m").
 */
export function formatearCoordenadas(ubicacion: UbicacionEvidencia): string {
  const texto = `${ubicacion.latitud.toFixed(DECIMALES_COORDENADA)}, ${ubicacion.longitud.toFixed(DECIMALES_COORDENADA)}`;
  return ubicacion.precisionMetros === null
    ? texto
    : `${texto} (± ${Math.round(ubicacion.precisionMetros)} m)`;
}

/**
 * Texto de la ubicación para las pantallas y el reporte.
 *
 * @returns Las coordenadas, "Sin ubicación GPS · Referencia: …" o "Ubicación no registrada".
 */
export function describirUbicacion(datos: DatosUbicacion): string {
  if (datos.ubicacion) {
    return formatearCoordenadas(datos.ubicacion);
  }
  if (datos.referenciaUbicacion) {
    return `${TEXTO_SIN_GPS} · Referencia: ${datos.referenciaUbicacion}`;
  }
  return TEXTO_SIN_UBICACION;
}

/**
 * @returns Enlace para abrir el punto en el mapa del teléfono o del navegador.
 */
export function enlaceMapa(ubicacion: UbicacionEvidencia): string {
  return `https://www.google.com/maps/search/?api=1&query=${ubicacion.latitud},${ubicacion.longitud}`;
}
