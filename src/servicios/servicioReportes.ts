/**
 * @archivo servicioReportes.ts
 * @proyecto Civil Trace
 * @descripcion Consulta el reporte de avances de una obra desde la API, descarga las fotografías
 *              de evidencia autenticadas y genera el reporte en formato PDF.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.2.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Los tipos del reporte omiten los campos de
 *   revisión del feature 003
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import { construirUrlFotoAvance } from '@/servicios/servicioActividades';
import type {
  ActividadDetalle,
  AvanceActividad,
  EstadoActividad,
  EstadoAvance,
} from '@/tipos/actividad';
import type { Obra } from '@/tipos/obra';
import { convertirFechaLocalAIso, convertirIsoAFechaLocal } from '@/utilidades/formatearFecha';

// El reporte no usa los datos de revisión ni de entrega del feature 003.
export interface AvanceReporte extends Omit<
  AvanceActividad,
  'tipo' | 'observacion' | 'revisadoPor'
> {
  fotoDataUri: string | null;
}

export interface ActividadReporte extends Omit<
  ActividadDetalle,
  'avances' | 'descripcion' | 'fechaInicio' | 'responsableId' | 'enRevision'
> {
  avances: AvanceReporte[];
}

export interface DatosReporteObra {
  obra: Obra;
  fechaInicioFiltro: string;
  fechaFinFiltro: string;
  actividades: ActividadReporte[];
}

const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';
const SIN_DATO = '—';
const LONGITUD_FECHA_ISO = 10;

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function textoOSinDato(valor: unknown): string {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : SIN_DATO;
}

function normalizarEstadoActividad(valor: unknown): EstadoActividad {
  return valor === 'TERMINADA' ? 'TERMINADA' : 'ACTIVA';
}

function normalizarEstadoAvance(valor: unknown): EstadoAvance {
  if (valor === 'PENDIENTE' || valor === 'RECHAZADO') {
    return valor;
  }
  return 'APROBADO';
}

function formatearFechaAvance(fechaIso: string): string {
  const prefijoIso = fechaIso.slice(0, LONGITUD_FECHA_ISO);
  const fechaLocal = convertirIsoAFechaLocal(prefijoIso);
  if (fechaLocal) {
    return fechaLocal;
  }
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return SIN_DATO;
  }
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getUTCFullYear());
  return `${dia}/${mes}/${anio}`;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function obtenerFotoComoDataUri(
  tokenAcceso: string,
  idObra: string,
  idActividad: string,
  idAvance: string,
): Promise<string | null> {
  try {
    const url = construirUrlFotoAvance(idObra, idActividad, idAvance);
    const respuesta = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenAcceso}`,
      },
    });
    if (!respuesta.ok) {
      return null;
    }
    const blob = await respuesta.blob();
    return await new Promise<string | null>((resolver) => {
      const lector = new FileReader();
      lector.onloadend = () => {
        resolver(typeof lector.result === 'string' ? lector.result : null);
      };
      lector.onerror = () => resolver(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function cargarDatosReporteObra(
  tokenAcceso: string,
  obra: Obra,
  fechaInicioFiltro: string,
  fechaFinFiltro: string,
): Promise<DatosReporteObra> {
  const params = new URLSearchParams();
  const inicioIso = fechaInicioFiltro.trim()
    ? convertirFechaLocalAIso(fechaInicioFiltro.trim())
    : null;
  const finIso = fechaFinFiltro.trim() ? convertirFechaLocalAIso(fechaFinFiltro.trim()) : null;

  if (inicioIso) {
    params.set('fechaInicio', inicioIso);
  }
  if (finIso) {
    params.set('fechaFin', finIso);
  }

  const query = params.toString();
  const ruta = `/obras/${encodeURIComponent(obra.id)}/reporte${query ? `?${query}` : ''}`;
  const respuesta = await llamarApi(ruta, { tokenAcceso });

  if (!esObjeto(respuesta) || !Array.isArray(respuesta.actividades)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const actividades: ActividadReporte[] = await Promise.all(
    respuesta.actividades.map(async (item) => {
      if (
        !esObjeto(item) ||
        typeof item.id !== 'string' ||
        typeof item.nombre !== 'string' ||
        typeof item.fechaEntrega !== 'string' ||
        !Array.isArray(item.avances)
      ) {
        throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
      }

      const avances: AvanceReporte[] = await Promise.all(
        item.avances.map(async (av) => {
          if (!esObjeto(av) || typeof av.id !== 'string' || typeof av.fechaRegistro !== 'string') {
            throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
          }
          const tieneFoto = av.tieneFoto === true;
          return {
            id: av.id,
            comentario: typeof av.comentario === 'string' ? av.comentario : '',
            estado: normalizarEstadoAvance(av.estado),
            fechaRegistro: formatearFechaAvance(av.fechaRegistro),
            registradoPor: textoOSinDato(av.registradoPor),
            tieneFoto,
            fotoDataUri: tieneFoto
              ? await obtenerFotoComoDataUri(tokenAcceso, obra.id, item.id as string, av.id)
              : null,
          };
        }),
      );

      return {
        id: item.id,
        nombre: item.nombre,
        estado: normalizarEstadoActividad(item.estado),
        fechaEntrega: convertirIsoAFechaLocal(item.fechaEntrega) ?? item.fechaEntrega,
        fechaTerminada:
          typeof item.fechaTerminada === 'string'
            ? (convertirIsoAFechaLocal(item.fechaTerminada) ?? item.fechaTerminada)
            : null,
        responsable: textoOSinDato(item.responsable),
        supervisor: textoOSinDato(item.supervisor),
        avances,
      };
    }),
  );

  return {
    obra,
    fechaInicioFiltro: fechaInicioFiltro.trim() || obra.fechaInicio,
    fechaFinFiltro: fechaFinFiltro.trim() || obra.fechaFinal,
    actividades,
  };
}

export function construirHtmlReporteObra(reporte: DatosReporteObra): string {
  const bloquesActividades = reporte.actividades
    .map((actividad) => {
      const entregablesHtml =
        actividad.avances.length === 0
          ? `<p class="vacio">Sin entregables o avances registrados en este periodo.</p>`
          : actividad.avances
              .map(
                (avance, indice) => `
                  <div class="avance-item">
                    <div class="avance-encabezado">
                      <span class="avance-titulo">Entregable #${indice + 1}</span>
                      <span class="avance-fecha">Fecha: ${escaparHtml(avance.fechaRegistro)}</span>
                    </div>
                    <p class="avance-meta"><strong>Responsable que subió:</strong> ${escaparHtml(avance.registradoPor)}</p>
                    <p class="avance-meta"><strong>Estado:</strong> ${escaparHtml(avance.estado)}</p>
                    <p class="avance-desc"><strong>Descripción del entregable:</strong> ${escaparHtml(avance.comentario || 'Sin descripción registrada.')}</p>
                    ${
                      avance.fotoDataUri
                        ? `<img class="evidencia-img" src="${avance.fotoDataUri}" alt="Evidencia del día ${escaparHtml(avance.fechaRegistro)}" />`
                        : `<p class="sin-foto">Sin fotografía registrada para el día ${escaparHtml(avance.fechaRegistro)}.</p>`
                    }
                  </div>
                `,
              )
              .join('');

      return `
        <section class="actividad-bloque">
          <div class="actividad-header">
            <h2>${escaparHtml(actividad.nombre)}</h2>
            <span class="badge">${escaparHtml(actividad.estado)}</span>
          </div>
          <div class="actividad-datos">
            <span><strong>Responsable de actividad:</strong> ${escaparHtml(actividad.responsable)}</span>
            <span><strong>Supervisor:</strong> ${escaparHtml(actividad.supervisor)}</span>
            <span><strong>Fecha de entrega:</strong> ${escaparHtml(actividad.fechaEntrega)}</span>
          </div>
          <div class="avances-lista">
            ${entregablesHtml}
          </div>
        </section>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
          }
          .encabezado {
            border-bottom: 3px solid #aa280e;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .encabezado h1 {
            margin: 0 0 6px 0;
            font-size: 22px;
            color: #0a0a0a;
          }
          .subinfo {
            font-size: 13px;
            color: #475569;
            margin: 2px 0;
          }
          .actividad-bloque {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 18px;
            background: #f8fafc;
          }
          .actividad-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .actividad-header h2 {
            margin: 0;
            font-size: 17px;
            color: #0f172a;
          }
          .badge {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 700;
          }
          .actividad-datos {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            font-size: 12px;
            color: #475569;
            margin-bottom: 12px;
          }
          .avance-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .avance-encabezado {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .avance-titulo {
            font-weight: 700;
            font-size: 13px;
            color: #aa280e;
          }
          .avance-fecha {
            font-size: 12px;
            color: #475569;
            font-weight: 600;
          }
          .avance-meta, .avance-desc {
            margin: 4px 0;
            font-size: 13px;
            color: #0f172a;
          }
          .evidencia-img {
            width: 100%;
            max-height: 240px;
            object-fit: cover;
            border-radius: 8px;
            margin-top: 8px;
            border: 1px solid #e2e8f0;
          }
          .sin-foto, .vacio {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="encabezado">
          <h1>Reporte de avances — ${escaparHtml(reporte.obra.nombre)}</h1>
          <p class="subinfo"><strong>Cliente:</strong> ${escaparHtml(reporte.obra.cliente)} | <strong>Dirección:</strong> ${escaparHtml(reporte.obra.direccion)}</p>
          <p class="subinfo"><strong>Periodo:</strong> ${escaparHtml(reporte.fechaInicioFiltro)} — ${escaparHtml(reporte.fechaFinFiltro)}</p>
        </div>
        ${bloquesActividades || '<p class="vacio">No hay actividades con avances en esta obra.</p>'}
      </body>
    </html>
  `;
}

export async function generarYCompartirPdfReporte(reporte: DatosReporteObra): Promise<string> {
  const html = construirHtmlReporteObra(reporte);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Reporte_${reporte.obra.nombre}.pdf`,
      UTI: 'com.adobe.pdf',
    });
  }
  return uri;
}
