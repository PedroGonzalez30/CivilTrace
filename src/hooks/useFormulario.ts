/**
 * @archivo useFormulario.ts
 * @proyecto Civil Trace
 * @descripcion Hook que maneja los valores, errores y envío de un formulario.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import { useState } from 'react';

type Valores<K extends string> = Record<K, string>;
type Errores<K extends string> = Partial<Record<K, string>>;
type Tocados<K extends string> = Partial<Record<K, boolean>>;

interface OpcionesFormulario<K extends string> {
  campos: readonly K[];
  valoresIniciales: Valores<K>;
  validar: (valores: Valores<K>) => Errores<K>;
  onEnviar: (valores: Valores<K>) => Promise<void>;
}

const MENSAJE_ERROR_INESPERADO = 'Ocurrió un error inesperado';

/**
 * Maneja el estado de un formulario: valores, validación por campo y envío.
 *
 * @param opciones - Campos, valores iniciales, función de validación y función de envío.
 * @returns Valores actuales, estado del envío y funciones para conectar los campos.
 */
export function useFormulario<K extends string>({
  campos,
  valoresIniciales,
  validar,
  onEnviar,
}: OpcionesFormulario<K>) {
  const [valores, setValores] = useState<Valores<K>>(valoresIniciales);
  const [errores, setErrores] = useState<Errores<K>>({});
  const [tocados, setTocados] = useState<Tocados<K>>({});
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const manejarCambio = (campo: K) => (valor: string) => {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
    setErrorEnvio(null);
  };

  const manejarPerdidaFoco = (campo: K) => () => {
    setTocados((anteriores) => ({ ...anteriores, [campo]: true }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: validar(valores)[campo] }));
  };

  const obtenerError = (campo: K) => (tocados[campo] ? errores[campo] : undefined);

  const manejarEnvio = async () => {
    const todosTocados = campos.reduce<Tocados<K>>(
      (acumulado, campo) => ({ ...acumulado, [campo]: true }),
      {},
    );
    const erroresDeValidacion = validar(valores);

    setTocados(todosTocados);
    setErrores(erroresDeValidacion);

    if (campos.some((campo) => erroresDeValidacion[campo])) {
      return;
    }

    setEstaEnviando(true);
    setErrorEnvio(null);
    try {
      await onEnviar(valores);
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : MENSAJE_ERROR_INESPERADO);
    } finally {
      setEstaEnviando(false);
    }
  };

  const reiniciar = () => {
    setValores(valoresIniciales);
    setErrores({});
    setTocados({});
    setErrorEnvio(null);
    setEstaEnviando(false);
  };

  return {
    valores,
    estaEnviando,
    errorEnvio,
    manejarCambio,
    manejarPerdidaFoco,
    manejarEnvio,
    obtenerError,
    reiniciar,
  };
}
