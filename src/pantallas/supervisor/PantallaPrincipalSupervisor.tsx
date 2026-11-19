/**
 * @archivo PantallaPrincipalSupervisor.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla principal del supervisor. Incluye una sección TEMPORAL para probar la
 * subida de fotos a Blob Storage.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 18/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import * as SelectorImagenes from 'expo-image-picker';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal, EncabezadoApp } from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { ErrorApi } from '@/conexion/clienteApi';
import { subirFotoPrueba } from '@/servicios/servicioEvidencias';
import type { SesionAutenticacion } from '@/tipos/autenticacion';

// 2. Tipos e interfaces
interface PantallaPrincipalSupervisorProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

interface FotoElegida {
  uri: string;
  tipo: string;
}

// 3. Constantes del módulo
const CALIDAD_FOTO = 0.7;
const TIPO_PNG = 'image/png';
const TIPO_JPEG = 'image/jpeg';
const MENSAJE_ERROR_GENERICO = 'No se pudo subir la foto';
const MENSAJE_ERROR_GALERIA = 'No se pudo abrir la galería';

// 4. Componente principal
export default function PantallaPrincipalSupervisor({
  sesion,
  onCerrarSesion,
}: PantallaPrincipalSupervisorProps) {
  const [foto, setFoto] = useState<FotoElegida | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esError, setEsError] = useState(false);

  const mostrarMensaje = (texto: string, error: boolean) => {
    setMensaje(texto);
    setEsError(error);
  };

  const elegirFoto = async () => {
    try {
      const resultado = await SelectorImagenes.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: CALIDAD_FOTO,
      });
      const elegida = resultado.assets?.[0];
      if (resultado.canceled || !elegida) {
        return;
      }
      setFoto({ uri: elegida.uri, tipo: elegida.mimeType === TIPO_PNG ? TIPO_PNG : TIPO_JPEG });
      setMensaje(null);
    } catch {
      mostrarMensaje(MENSAJE_ERROR_GALERIA, true);
    }
  };

  const subirFoto = async () => {
    if (!foto) {
      return;
    }
    setSubiendo(true);
    setMensaje(null);
    try {
      const nombreBlob = await subirFotoPrueba(sesion.token, foto.uri, foto.tipo);
      mostrarMensaje(`Foto guardada en Azure: ${nombreBlob}`, false);
    } catch (error) {
      mostrarMensaje(error instanceof ErrorApi ? error.message : MENSAJE_ERROR_GENERICO, true);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Hola, {sesion.usuario.nombre}</Text>

        {/* TODO(Equipo): sección temporal; se reemplaza por las evidencias reales. */}
        <View style={estilos.tarjeta}>
          <Text style={estilos.subtituloTarjeta}>Prueba de almacenamiento (temporal)</Text>
          <Text style={estilos.texto}>
            Elige una foto y súbela para comprobar que llega a Azure Blob Storage.
          </Text>

          {foto ? <Image source={{ uri: foto.uri }} style={estilos.vistaPrevia} /> : null}

          <BotonPrincipal etiqueta="Elegir foto" variante="contorno" onPresionar={elegirFoto} />
          <BotonPrincipal
            etiqueta="Subir foto"
            onPresionar={foto ? subirFoto : undefined}
            estaCargando={subiendo}
          />

          {mensaje ? (
            <Text style={[estilos.mensaje, esError ? estilos.mensajeError : estilos.mensajeExito]}>
              {mensaje}
            </Text>
          ) : null}
        </View>

        <BotonPrincipal
          etiqueta="Cerrar sesión"
          variante="contorno"
          onPresionar={onCerrarSesion}
        />
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
    gap: 16,
    padding: 24,
  },
  titulo: {
    ...TIPOGRAFIA.titulo3,
    color: COLORES.texto,
  },
  tarjeta: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.borde,
    backgroundColor: COLORES.fondoEntrada,
  },
  subtituloTarjeta: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  texto: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
  },
  vistaPrevia: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mensaje: {
    ...TIPOGRAFIA.leyenda,
  },
  mensajeError: {
    color: COLORES.error,
  },
  mensajeExito: {
    color: COLORES.textoAtenuado,
  },
});
