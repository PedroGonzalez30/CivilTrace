/**
 * @archivo PantallaSubirEvidencia.tsx
 * @proyecto Civil Trace
 * @descripcion Subir evidencia fotográfica de una actividad (Figma SUP_SUBIREVIDENCIA 2217:122 y
 *   la del trabajador 58:933): foto de la cámara o la galería, tipo "Avance diario" o "Terminado"
 *   y comentario opcional. La del trabajador queda pendiente de revisión (D-10).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF de evidencias (CP12 Capturar evidencia fotográfica), D-10
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import * as SelectorImagenes from 'expo-image-picker';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoCamara, IconoChevronIzquierda } from '@/componentes/Iconos';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { subirEvidencia } from '@/servicios/servicioActividades';
import type { AvanceActividad, TipoAvance } from '@/tipos/actividad';

// 2. Tipos e interfaces
interface PantallaSubirEvidenciaProps {
  tokenAcceso: string;
  idObra: string;
  idActividad: string;
  nombreActividad: string;
  onCancelar: () => void;
  onSubida: (avance: AvanceActividad) => void;
}

interface FotoElegida {
  uri: string;
  tipo: string;
}

// 3. Constantes del módulo
const CALIDAD_FOTO = 0.7;
const TIPO_FOTO_POR_DEFECTO = 'image/jpeg';
const LONGITUD_MAXIMA_COMENTARIO = 500;
const ALTO_FOTO = 190;
const MENSAJE_SIN_FOTO = 'Toma o elige una foto de la evidencia';
const MENSAJE_SIN_PERMISO = 'Permite el acceso a la cámara para tomar la foto';
const MENSAJE_ERROR = 'No se pudo subir la evidencia. Intenta de nuevo.';
const OPCIONES_TIPO: { valor: TipoAvance; etiqueta: string }[] = [
  { valor: 'DIARIO', etiqueta: 'Avance diario' },
  { valor: 'TERMINADO', etiqueta: 'Terminado' },
];

// 4. Componente principal
export default function PantallaSubirEvidencia({
  tokenAcceso,
  idObra,
  idActividad,
  nombreActividad,
  onCancelar,
  onSubida,
}: PantallaSubirEvidenciaProps) {
  const [foto, setFoto] = useState<FotoElegida | null>(null);
  const [tipo, setTipo] = useState<TipoAvance>('DIARIO');
  const [comentario, setComentario] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardarResultado = (resultado: SelectorImagenes.ImagePickerResult) => {
    const elegida = resultado.assets?.[0];
    if (resultado.canceled || !elegida) {
      return;
    }
    setFoto({ uri: elegida.uri, tipo: elegida.mimeType ?? TIPO_FOTO_POR_DEFECTO });
    setError(null);
  };

  const tomarFoto = async () => {
    const permiso = await SelectorImagenes.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setError(MENSAJE_SIN_PERMISO);
      return;
    }
    guardarResultado(
      await SelectorImagenes.launchCameraAsync({ mediaTypes: ['images'], quality: CALIDAD_FOTO }),
    );
  };

  const elegirDeGaleria = async () => {
    guardarResultado(
      await SelectorImagenes.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: CALIDAD_FOTO,
      }),
    );
  };

  const manejarSubir = async () => {
    if (!foto) {
      setError(MENSAJE_SIN_FOTO);
      return;
    }
    setSubiendo(true);
    setError(null);
    try {
      const avance = await subirEvidencia(tokenAcceso, idObra, idActividad, {
        uri: foto.uri,
        tipoImagen: foto.tipo,
        tipo,
        comentario,
      });
      onSubida(avance);
    } catch (falla) {
      setError(falla instanceof ErrorApi ? falla.message : MENSAJE_ERROR);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      {/* En Android de borde a borde el sistema ya no sube la pantalla: se hace aquí (D-27). */}
      <KeyboardAvoidingView style={estilos.teclado} behavior="padding">
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.tarjeta}>
            <View style={estilos.encabezado}>
              <Pressable
                style={estilos.regresar}
                onPress={onCancelar}
                accessibilityLabel="Regresar"
              >
                <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
              </Pressable>
              <View style={estilos.textosEncabezado}>
                <Text style={estilos.antetitulo}>Subir evidencia</Text>
                <Text style={estilos.titulo}>{nombreActividad}</Text>
              </View>
            </View>

            {foto ? (
              <>
                <Image
                  source={{ uri: foto.uri }}
                  style={estilos.foto}
                  accessibilityLabel="Foto de la evidencia"
                />
                <Pressable onPress={() => void elegirDeGaleria()} style={estilos.cambiar}>
                  <Text style={estilos.enlace}>Cambiar foto</Text>
                </Pressable>
              </>
            ) : (
              <View style={estilos.sinFoto}>
                <IconoCamara tamano={28} color={COLORES_ASISTENCIA.azul} />
                <View style={estilos.filaBotones}>
                  <BotonPrincipal
                    etiqueta="Tomar foto"
                    onPresionar={() => void tomarFoto()}
                    estilo={estilos.botonMitad}
                  />
                  <BotonPrincipal
                    etiqueta="Galería"
                    variante="contorno"
                    onPresionar={() => void elegirDeGaleria()}
                    estilo={estilos.botonMitad}
                  />
                </View>
              </View>
            )}

            <Text style={estilos.etiqueta}>Tipo de evidencia</Text>
            <View style={estilos.segmento}>
              {OPCIONES_TIPO.map((opcion) => {
                const activa = tipo === opcion.valor;
                return (
                  <Pressable
                    key={opcion.valor}
                    style={[estilos.opcion, activa && estilos.opcionActiva]}
                    onPress={() => setTipo(opcion.valor)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activa }}
                  >
                    <Text style={[estilos.textoOpcion, activa && estilos.textoOpcionActiva]}>
                      {opcion.etiqueta}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={estilos.ayuda}>
              Elige &quot;Terminado&quot; solo si ya concluiste toda la actividad.
            </Text>

            <Text style={estilos.etiqueta}>
              Comentario <Text style={estilos.opcional}>(opcional)</Text>
            </Text>
            <TextInput
              style={estilos.comentario}
              value={comentario}
              onChangeText={setComentario}
              placeholder="Describe el avance de hoy..."
              placeholderTextColor={COLORES.marcador}
              multiline
              maxLength={LONGITUD_MAXIMA_COMENTARIO}
            />

            {error ? <Text style={estilos.error}>{error}</Text> : null}

            <View style={estilos.filaBotones}>
              <BotonPrincipal
                etiqueta="Cancelar"
                variante="contorno"
                onPresionar={onCancelar}
                estilo={estilos.botonMitad}
              />
              <BotonPrincipal
                etiqueta="Subir evidencia"
                onPresionar={() => void manejarSubir()}
                estaCargando={subiendo}
                estilo={estilos.botonMitad}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  teclado: { flex: 1 },
  contenido: { padding: 18, paddingBottom: 40 },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.tarjeta,
  },
  textosEncabezado: { flex: 1 },
  antetitulo: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  titulo: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  foto: { width: '100%', height: ALTO_FOTO, borderRadius: RADIOS.accion },
  cambiar: { alignSelf: 'flex-end' },
  enlace: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  sinFoto: {
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORES_ASISTENCIA.bordeChip,
  },
  filaBotones: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  botonMitad: { flex: 1 },
  etiqueta: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  opcional: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  segmento: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES_ASISTENCIA.diaInactivo,
  },
  opcion: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIOS.pildora },
  opcionActiva: { backgroundColor: COLORES_ASISTENCIA.azul },
  textoOpcion: { ...TIPOGRAFIA.etiqueta, color: COLORES.textoAtenuado },
  textoOpcionActiva: { color: COLORES.superficie },
  ayuda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  comentario: {
    minHeight: 80,
    padding: 12,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    textAlignVertical: 'top',
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.texto,
  },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
});
