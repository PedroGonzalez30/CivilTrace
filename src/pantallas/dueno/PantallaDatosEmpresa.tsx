/**
 * @archivo PantallaDatosEmpresa.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla del dueño para consultar y editar los datos y el logotipo de su empresa.
 *              Se abre desde el menú de tres rayas.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AvisoExito,
  EncabezadoApp,
  EncabezadoPantalla,
  FormularioDatosEmpresa,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_DATOS_EMPRESA as TEXTOS } from '@/constantes/textos';
import { obtenerDatosEmpresa, type DatosEmpresa } from '@/servicios/servicioEmpresa';

// 2. Tipos e interfaces
interface PantallaDatosEmpresaProps {
  tokenAcceso: string;
  onAceptar: () => void;
  onNombreCambiado: (nombre: string) => void;
}

// 3. Constantes del módulo
const DURACION_AVISO_MS = 3000;

// 4. Componente principal
export default function PantallaDatosEmpresa({ tokenAcceso, onAceptar, onNombreCambiado, }: PantallaDatosEmpresaProps) {
  const [datos, setDatos] = useState<DatosEmpresa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [seGuardo, setSeGuardo] = useState(false);

  useEffect(() => {
    // Evita actualizar el estado si la pantalla se cerró antes de que respondiera la API.
    let cancelado = false;
    setError(null);

    obtenerDatosEmpresa(tokenAcceso)
      .then((respuesta) => {
        if (!cancelado) {
          setDatos(respuesta);
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(falla instanceof ErrorApi ? falla.message : TEXTOS.errorCarga);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [tokenAcceso, intento]);

  // Oculta el aviso de éxito a los 3 segundos.
  useEffect(() => {
    if (!seGuardo) {
      return undefined;
    }
    const temporizador = setTimeout(() => setSeGuardo(false), DURACION_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [seGuardo]);

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {seGuardo ? (
          <View style={estilos.aviso}>
            <AvisoExito mensaje={TEXTOS.exito} />
          </View>
        ) : null}
        <EncabezadoPantalla titulo={TEXTOS.titulo} subtitulo={TEXTOS.subtitulo} />
        {datos ? (
          <FormularioDatosEmpresa
            tokenAcceso={tokenAcceso}
            datos={datos}
            onGuardado={(nombre) => {
              setSeGuardo(true);
              onNombreCambiado(nombre);
            }} onAceptar={onAceptar}
          />
        ) : error ? (
          <View style={estilos.centro}>
            <Text style={estilos.error}>{error}</Text>
            <Pressable onPress={() => setIntento((anterior) => anterior + 1)}>
              <Text style={estilos.reintentar}>{TEXTOS.reintentar}</Text>
            </Pressable>
          </View>
        ) : (
          <ActivityIndicator color={COLORES.marca} />
        )}
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    gap: 12,
    padding: 24,
  },
  aviso: {
    alignItems: 'center',
  },
  centro: {
    alignItems: 'center',
    gap: 8,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
  reintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});