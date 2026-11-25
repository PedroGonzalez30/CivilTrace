/**
 * @archivo SeccionEntregas.tsx
 * @proyecto Civil Trace
 * @descripcion Sección "Entregas al cliente" de la pantalla de reportes: carga las entregas de la
 *   obra y descarga su reporte o su acta en PDF.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-13 Enviar entrega al cliente, RF-16 Generar acta de entrega-recepción
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import TarjetaEntrega from '@/componentes/TarjetaEntrega';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { descargarDocumentoEntrega, listarEntregas } from '@/servicios/servicioEntregas';
import type { DocumentoEntrega, Entrega } from '@/tipos/entrega';

// 2. Tipos e interfaces
interface SeccionEntregasProps {
  tokenAcceso: string;
  idObra: string;
  /** Cambia cada vez que se envía una entrega, para volver a cargar la lista. */
  versionLista: number;
}

// 3. Constantes del módulo
const MENSAJE_ERROR_CARGA = 'No se pudieron cargar las entregas.';

// 4. Componente principal
export default function SeccionEntregas({
  tokenAcceso,
  idObra,
  versionLista,
}: SeccionEntregasProps) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [estaCargando, setEstaCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idDescargando, setIdDescargando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setEstaCargando(true);
    setError(null);
    try {
      setEntregas(await listarEntregas(tokenAcceso, idObra));
    } catch (errorCarga) {
      setError(errorCarga instanceof ErrorApi ? errorCarga.message : MENSAJE_ERROR_CARGA);
    } finally {
      setEstaCargando(false);
    }
  }, [tokenAcceso, idObra]);

  useEffect(() => {
    void cargar();
  }, [cargar, versionLista]);

  const manejarDescargar = async (idEntrega: string, documento: DocumentoEntrega) => {
    setIdDescargando(idEntrega);
    try {
      await descargarDocumentoEntrega(tokenAcceso, idObra, idEntrega, documento);
    } catch (errorDescarga) {
      Alert.alert(
        'Error',
        errorDescarga instanceof ErrorApi
          ? errorDescarga.message
          : 'No se pudo descargar el documento.',
      );
    } finally {
      setIdDescargando(null);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Entregas al cliente</Text>
      {estaCargando ? (
        <ActivityIndicator color={COLORES.marca} />
      ) : error ? (
        <View style={estilos.centro}>
          <Text style={estilos.textoError}>{error}</Text>
          <Pressable onPress={() => void cargar()}>
            <Text style={estilos.enlace}>Reintentar</Text>
          </Pressable>
        </View>
      ) : entregas.length === 0 ? (
        <Text style={estilos.textoVacio}>
          Aún no has enviado entregas. Filtra un rango y toca &quot;Enviar al cliente&quot; en la
          vista previa.
        </Text>
      ) : (
        entregas.map((entrega) => (
          <TarjetaEntrega
            key={entrega.id}
            entrega={entrega}
            estaDescargando={idDescargando === entrega.id}
            onDescargar={(documento) => void manejarDescargar(entrega.id, documento)}
          />
        ))
      )}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  titulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  centro: {
    alignItems: 'center',
    gap: 6,
  },
  textoError: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
    textAlign: 'center',
  },
  textoVacio: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  enlace: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
