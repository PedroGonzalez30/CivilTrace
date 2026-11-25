/**
 * @archivo SeccionCodigoTrabajadores.tsx
 * @proyecto Civil Trace
 * @descripcion Código de acceso para trabajadores en el inicio del supervisor, para que pueda
 *   invitar a su cuadrilla. Nunca muestra el código de supervisores (D-23).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos D-23 (el supervisor ve solo el código de trabajadores)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 002)
 */

// 1. Importaciones
import * as Portapapeles from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import TarjetaCodigoAcceso from '@/componentes/TarjetaCodigoAcceso';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { obtenerCodigoTrabajadores } from '@/servicios/servicioEmpresa';

// 2. Tipos e interfaces
interface SeccionCodigoTrabajadoresProps {
  tokenAcceso: string;
}

// 3. Constantes del módulo
const DURACION_COPIADO_MS = 2000;
const MENSAJE_ERROR = 'No se pudo cargar el código de trabajadores.';

// 4. Componente principal
export default function SeccionCodigoTrabajadores({ tokenAcceso }: SeccionCodigoTrabajadoresProps) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerCodigoTrabajadores(tokenAcceso)
      .then((valor) => {
        if (!cancelado) {
          setCodigo(valor);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, intento]);

  useEffect(
    () => () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
    },
    [],
  );

  const manejarCopiar = async () => {
    if (!codigo) {
      return;
    }
    await Portapapeles.setStringAsync(codigo);
    setCopiado(true);
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }
    temporizador.current = setTimeout(() => setCopiado(false), DURACION_COPIADO_MS);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Código de acceso</Text>
      {codigo ? (
        <TarjetaCodigoAcceso
          titulo="Código de acceso para trabajadores"
          descripcion="Compártelo con los trabajadores para que se unan a la empresa."
          codigo={codigo}
          copiado={copiado}
          onCopiar={() => void manejarCopiar()}
        />
      ) : error ? (
        <Pressable
          onPress={() => {
            setError(null);
            setIntento((anterior) => anterior + 1);
          }}
        >
          <Text style={estilos.error}>{error} Toca para reintentar.</Text>
        </Pressable>
      ) : (
        <ActivityIndicator color={COLORES.marca} />
      )}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { gap: 10 },
  titulo: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
});
