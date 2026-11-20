/**
 * @archivo PantallaCodigosAcceso.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla del dueño para consultar, copiar y regenerar los códigos de acceso de
 *              supervisores y trabajadores. Se abre desde el menú de tres rayas.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import * as Portapapeles from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AvisoExito,
  EncabezadoApp,
  ModalEliminarPersonal,
  TarjetaCodigoRegenerable,
  TarjetaFormulario,
} from '@/componentes';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_CODIGOS_ACCESO } from '@/constantes/textos';
import { useCodigosEmpresa } from '@/hooks/useCodigoEmpresa';
import { regenerarCodigoEmpresa, type TipoCodigoEmpresa } from '@/servicios/servicioEmpresa';

// 2. Tipos e interfaces
interface PantallaCodigosAccesoProps {
  tokenAcceso: string;
  onCodigosCambiados: () => void;
}

// 3. Constantes del módulo
const DURACION_AVISO_MS = 3000;

// 4. Componente principal
export default function PantallaCodigosAcceso({
  tokenAcceso,
  onCodigosCambiados,
}: PantallaCodigosAccesoProps) {
  const { codigos, error, reintentar, reemplazarCodigos } = useCodigosEmpresa(tokenAcceso, true);
  const [tipoPorRegenerar, setTipoPorRegenerar] = useState<TipoCodigoEmpresa | null>(null);
  const [estaRegenerando, setEstaRegenerando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // Oculta el aviso de éxito a los 3 segundos.
  useEffect(() => {
    if (!aviso) {
      return undefined;
    }
    const temporizador = setTimeout(() => setAviso(null), DURACION_AVISO_MS);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  const manejarCopiar = async (codigo: string) => {
    try {
      await Portapapeles.setStringAsync(codigo);
      setErrorAccion(null);
      setAviso(TEXTOS_CODIGOS_ACCESO.codigoCopiado);
    } catch {
      setErrorAccion(TEXTOS_CODIGOS_ACCESO.errorCopiar);
    }
  };

  const manejarPedirRegenerar = (tipo: TipoCodigoEmpresa) => {
    setAviso(null);
    setErrorAccion(null);
    setTipoPorRegenerar(tipo);
  };

  const manejarCancelar = () => {
    if (!estaRegenerando) {
      setTipoPorRegenerar(null);
    }
  };

  const manejarConfirmar = async () => {
    if (!tipoPorRegenerar) {
      return;
    }

    setEstaRegenerando(true);
    try {
      const codigosNuevos = await regenerarCodigoEmpresa(tokenAcceso, tipoPorRegenerar);
      reemplazarCodigos(codigosNuevos);
      onCodigosCambiados();
      setAviso(TEXTOS_CODIGOS_ACCESO.codigoCambiado);
    } catch (falla: unknown) {
      setErrorAccion(
        falla instanceof ErrorApi ? falla.message : TEXTOS_CODIGOS_ACCESO.errorRegenerar,
      );
    } finally {
      setEstaRegenerando(false);
      setTipoPorRegenerar(null);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <View style={estilos.cuerpo}>
        <ScrollView contentContainerStyle={estilos.contenido}>
          <View>
            <Text style={estilos.titulo}>{TEXTOS_CODIGOS_ACCESO.titulo}</Text>
            <Text style={estilos.subtitulo}>{TEXTOS_CODIGOS_ACCESO.subtitulo}</Text>
          </View>
          {codigos ? (
            <TarjetaFormulario estilo={estilos.tarjeta}>
              {errorAccion ? <Text style={estilos.error}>{errorAccion}</Text> : null}
              <TarjetaCodigoRegenerable
                titulo={TEXTOS_CODIGOS_ACCESO.tituloSupervisor}
                descripcion={TEXTOS_CODIGOS_ACCESO.descripcionSupervisor}
                codigo={codigos.supervisores}
                etiquetaBoton={TEXTOS_CODIGOS_ACCESO.regenerar}
                onCopiar={() => manejarCopiar(codigos.supervisores)}
                onRegenerar={() => manejarPedirRegenerar('supervisores')}
              />
              <TarjetaCodigoRegenerable
                titulo={TEXTOS_CODIGOS_ACCESO.tituloTrabajador}
                descripcion={TEXTOS_CODIGOS_ACCESO.descripcionTrabajador}
                codigo={codigos.trabajadores}
                etiquetaBoton={TEXTOS_CODIGOS_ACCESO.regenerar}
                onCopiar={() => manejarCopiar(codigos.trabajadores)}
                onRegenerar={() => manejarPedirRegenerar('trabajadores')}
              />
            </TarjetaFormulario>
          ) : (
            <View style={estilos.centro}>
              {error ? (
                <>
                  <Text style={estilos.error}>{error}</Text>
                  <Pressable onPress={reintentar}>
                    <Text style={estilos.reintentar}>{TEXTOS_CODIGOS_ACCESO.reintentar}</Text>
                  </Pressable>
                </>
              ) : (
                <ActivityIndicator color={COLORES.marca} />
              )}
            </View>
          )}
        </ScrollView>
        {aviso ? (
          <View style={estilos.aviso}>
            <AvisoExito mensaje={aviso} />
          </View>
        ) : null}
      </View>
      <ModalEliminarPersonal
        esVisible={tipoPorRegenerar !== null}
        estaCargando={estaRegenerando}
        titulo={TEXTOS_CODIGOS_ACCESO.confirmarTitulo}
        descripcion={TEXTOS_CODIGOS_ACCESO.confirmarDescripcion}
        onCancelar={manejarCancelar}
        onAceptar={manejarConfirmar}
      />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  cuerpo: {
    flex: 1,
  },
  contenido: {
    gap: 20,
    padding: 24,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
  },
  subtitulo: {
    marginTop: 5,
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.textoAtenuado,
  },
  tarjeta: {
    padding: 20,
  },
  aviso: {
    position: 'absolute',
    top: 8,
    right: 24,
  },
  centro: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
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