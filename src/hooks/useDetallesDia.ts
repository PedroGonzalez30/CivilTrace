/**
 * @archivo useDetallesDia.ts
 * @proyecto Civil Trace
 * @descripcion Formulario de "Detalles de asistencia": carga el día, guarda solo los campos que
 *   cambiaron y valida la observación obligatoria antes de llamar a la API (RF-60).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-60 Registrar retardo o salida anticipada, D-07
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Horas descontadas (feature 006, D-35)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import { MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { editarDetalleDia, obtenerDetalleDia } from '@/servicios/servicioDetallesAsistencia';
import type {
  CambiosDetalle,
  DetalleDia,
  EfectoPago,
  MotivoAsistencia,
  TipoJornada,
} from '@/tipos/asistencia';
import { construirInstanteLocal, obtenerHoraLocal } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
export interface FormularioDetalle {
  tipoJornada: TipoJornada;
  motivo: MotivoAsistencia | null;
  efectoPago: EfectoPago;
  anotacion: string;
  // D-35: texto como se escribe ("1.5"); vacío = sin descuento.
  horasDescontadas: string;
  horaEntrada: string | null;
  horaSalida: string | null;
}

interface ParametrosDia {
  tokenAcceso: string;
  obraId: string;
  trabajadorId: string;
  fecha: string;
  zonaHoraria: string;
}

// 3. Constantes del módulo
const MENSAJE_ERROR = 'No se pudieron guardar los detalles';
const MENSAJE_HORAS_INVALIDAS = 'Las horas a descontar van de 0.5 a 12, en medias horas';
const HORAS_MAXIMAS_DESCUENTO = 12;

/** D-35: de 0.5 a 12 horas en pasos de media hora (igual que la API). */
export function esHorasValidas(texto: string): boolean {
  const horas = Number(texto);
  return (
    Number.isFinite(horas) &&
    horas > 0 &&
    horas <= HORAS_MAXIMAS_DESCUENTO &&
    Number.isInteger(horas * 2)
  );
}

// 4. Funciones auxiliares
function aFormulario(detalle: DetalleDia, zona: string): FormularioDetalle {
  return {
    tipoJornada: detalle.tipoJornada ?? 'COMPLETA',
    motivo: detalle.motivo,
    efectoPago: detalle.efectoPago,
    anotacion: detalle.anotacion ?? '',
    horasDescontadas: detalle.horasDescontadas === null ? '' : String(detalle.horasDescontadas),
    horaEntrada: detalle.entrada ? obtenerHoraLocal(detalle.entrada.hora, zona) : null,
    horaSalida: detalle.salida ? obtenerHoraLocal(detalle.salida.hora, zona) : null,
  };
}

function calcularCambios(
  original: FormularioDetalle,
  actual: FormularioDetalle,
  { fecha, zonaHoraria }: ParametrosDia,
): CambiosDetalle {
  const cambios: CambiosDetalle = {};
  if (actual.tipoJornada !== original.tipoJornada) {
    cambios.tipoJornada = actual.tipoJornada;
  }
  if (actual.motivo !== original.motivo) {
    cambios.motivo = actual.motivo;
  }
  if (actual.efectoPago !== original.efectoPago) {
    cambios.efectoPago = actual.efectoPago;
  }
  if (actual.horasDescontadas.trim() !== original.horasDescontadas) {
    const horas = actual.horasDescontadas.trim();
    cambios.horasDescontadas = horas === '' ? null : Number(horas.replace(',', '.'));
  }
  if (actual.anotacion.trim() !== original.anotacion) {
    cambios.anotacion = actual.anotacion.trim() || null;
  }
  if (actual.horaEntrada !== original.horaEntrada) {
    cambios.entradaEn = actual.horaEntrada
      ? construirInstanteLocal(fecha, actual.horaEntrada, zonaHoraria)
      : null;
  }
  if (actual.horaSalida !== original.horaSalida) {
    cambios.salidaEn = actual.horaSalida
      ? construirInstanteLocal(fecha, actual.horaSalida, zonaHoraria)
      : null;
  }
  return cambios;
}

// 5. Hook
export function useDetallesDia(parametros: ParametrosDia) {
  const { tokenAcceso, obraId, trabajadorId, fecha, zonaHoraria } = parametros;
  const [detalle, setDetalle] = useState<DetalleDia | null>(null);
  const [original, setOriginal] = useState<FormularioDetalle | null>(null);
  const [formulario, setFormulario] = useState<FormularioDetalle | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    obtenerDetalleDia(tokenAcceso, obraId, trabajadorId, fecha)
      .then((datos) => {
        if (vigente) {
          const inicial = aFormulario(datos, zonaHoraria);
          setDetalle(datos);
          setOriginal(inicial);
          setFormulario(inicial);
        }
      })
      .catch((falla: unknown) => {
        if (vigente) {
          setError(
            falla instanceof ErrorSinConexion
              ? MENSAJES_ASISTENCIA.sinConexionGuardar
              : falla instanceof ErrorApi
                ? falla.message
                : MENSAJE_ERROR,
          );
        }
      });
    return () => {
      vigente = false;
    };
  }, [fecha, obraId, tokenAcceso, trabajadorId, zonaHoraria]);

  const cambiar = useCallback((cambios: Partial<FormularioDetalle>) => {
    setFormulario((previo) => (previo ? { ...previo, ...cambios } : previo));
    setError(null);
  }, []);

  /** @returns true si se guardó (o no había nada que guardar). */
  const guardar = useCallback(async (): Promise<boolean> => {
    if (!formulario || !original) {
      return false;
    }
    if (formulario.tipoJornada !== 'COMPLETA' && !formulario.anotacion.trim()) {
      setError(MENSAJES_ASISTENCIA.observacionObligatoria);
      return false;
    }
    const horas = formulario.horasDescontadas.trim().replace(',', '.');
    if (horas !== '' && !esHorasValidas(horas)) {
      setError(MENSAJE_HORAS_INVALIDAS);
      return false;
    }
    const cambios = calcularCambios(original, formulario, parametros);
    if (Object.keys(cambios).length === 0) {
      return true;
    }
    setGuardando(true);
    try {
      const actualizado = await editarDetalleDia(tokenAcceso, obraId, trabajadorId, fecha, cambios);
      setDetalle(actualizado);
      return true;
    } catch (falla) {
      setError(
        falla instanceof ErrorSinConexion
          ? MENSAJES_ASISTENCIA.sinConexionGuardar
          : falla instanceof ErrorApi
            ? falla.message
            : MENSAJE_ERROR,
      );
      return false;
    } finally {
      setGuardando(false);
    }
  }, [fecha, formulario, obraId, original, parametros, tokenAcceso, trabajadorId]);

  return { detalle, formulario, guardando, error, cambiar, guardar };
}
