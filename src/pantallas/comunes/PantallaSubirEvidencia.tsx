/**
 * @archivo PantallaSubirEvidencia.tsx
 * @proyecto Civil Trace
 * @descripcion Subir evidencia fotográfica de una actividad (Figma SUP_SUBIREVIDENCIA 2217:122 y
 *   la del trabajador 58:933): foto de la cámara o la galería, tipo "Avance diario" o "Terminado"
 *   y comentario opcional. La del trabajador queda pendiente de revisión (D-10).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.1.0
 * @requerimientos RF-08 Capturar evidencia fotográfica (CP12), D-10
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 *   25/11/2026 - Emilio Manuel Esquivel - Ubicación automática de la foto: GPS del teléfono al
 *   tomarla, EXIF de la galería y, sin señal, referencia escrita obligatoria (feature 007)
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
import TextoUbicacion from '@/componentes/TextoUbicacion';
import { ErrorApi } from '@/conexion/clienteApi';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { obtenerUbicacionEvidencia } from '@/servicios/local/servicioUbicacion';
import { subirEvidencia } from '@/servicios/servicioActividades';
import type { AvanceActividad, TipoAvance, UbicacionEvidencia } from '@/tipos/actividad';
import { leerUbicacionExif, TEXTO_SIN_GPS } from '@/utilidades/ubicacionEvidencia';

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
  // undefined mientras se busca la señal; null si no hubo (RF-08).
  ubicacion: UbicacionEvidencia | null | undefined;
}

// 3. Constantes del módulo
const CALIDAD_FOTO = 0.7;
const TIPO_FOTO_POR_DEFECTO = 'image/jpeg';
const LONGITUD_MAXIMA_COMENTARIO = 500;
const LONGITUD_MAXIMA_REFERENCIA = 200;
const MENSAJE_SIN_REFERENCIA = 'Sin ubicación GPS: escribe dónde se tomó la foto';
const MENSAJE_BUSCANDO = 'Espera a que termine de leer la ubicación';
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
  const [referencia, setReferencia] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // La ubicación se registra sola y no se puede editar (RF-08): de la cámara se toma la del
  // teléfono justo después de la foto; de la galería, la que guardó la foto en sus datos EXIF.
  const guardarResultado = async (
    resultado: SelectorImagenes.ImagePickerResult,
    origen: 'camara' | 'galeria',
  ) => {
    const elegida = resultado.assets?.[0];
    if (resultado.canceled || !elegida) {
      return;
    }
    const tipoFoto = elegida.mimeType ?? TIPO_FOTO_POR_DEFECTO;
    setError(null);
    if (origen === 'galeria') {
      setFoto({ uri: elegida.uri, tipo: tipoFoto, ubicacion: leerUbicacionExif(elegida.exif) });
      return;
    }
    setFoto({ uri: elegida.uri, tipo: tipoFoto, ubicacion: undefined });
    const ubicacion = await obtenerUbicacionEvidencia();
    // Si mientras tanto se cambió la foto, la ubicación ya no le corresponde.
    setFoto((actual) => (actual?.uri === elegida.uri ? { ...actual, ubicacion } : actual));
  };

  const tomarFoto = async () => {
    const permiso = await SelectorImagenes.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setError(MENSAJE_SIN_PERMISO);
      return;
    }
    await guardarResultado(
      await SelectorImagenes.launchCameraAsync({ mediaTypes: ['images'], quality: CALIDAD_FOTO }),
      'camara',
    );
  };

  const elegirDeGaleria = async () => {
    await guardarResultado(
      await SelectorImagenes.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: CALIDAD_FOTO,
        exif: true,
      }),
      'galeria',
    );
  };

  const manejarSubir = async () => {
    if (!foto) {
      setError(MENSAJE_SIN_FOTO);
      return;
    }
    if (foto.ubicacion === undefined) {
      setError(MENSAJE_BUSCANDO);
      return;
    }
    if (foto.ubicacion === null && !referencia.trim()) {
      setError(MENSAJE_SIN_REFERENCIA);
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
        ubicacion: foto.ubicacion,
        referenciaUbicacion: foto.ubicacion ? '' : referencia,
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
                <View style={estilos.filaUbicacion}>
                  {foto.ubicacion === undefined ? (
                    <Text style={estilos.ayuda}>Leyendo la ubicación…</Text>
                  ) : foto.ubicacion ? (
                    <TextoUbicacion
                      datos={{ ubicacion: foto.ubicacion, referenciaUbicacion: null }}
                    />
                  ) : (
                    <Text style={estilos.sinGps}>{TEXTO_SIN_GPS}</Text>
                  )}
                  <Pressable onPress={() => void elegirDeGaleria()}>
                    <Text style={estilos.enlace}>Cambiar foto</Text>
                  </Pressable>
                </View>
                {foto.ubicacion === null ? (
                  <>
                    <Text style={estilos.etiqueta}>Referencia de ubicación</Text>
                    <TextInput
                      style={estilos.campo}
                      value={referencia}
                      onChangeText={setReferencia}
                      placeholder="Ej. Planta alta, recámara principal"
                      placeholderTextColor={COLORES.marcador}
                      maxLength={LONGITUD_MAXIMA_REFERENCIA}
                      accessibilityLabel="Referencia de ubicación"
                    />
                    <Text style={estilos.ayuda}>
                      No se obtuvo la ubicación GPS. Escribe dónde se tomó la foto.
                    </Text>
                  </>
                ) : null}
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
  filaUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sinGps: { ...TIPOGRAFIA.etiqueta, color: COLORES.error },
  campo: {
    padding: 12,
    borderRadius: RADIOS.accion,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.bordeChip,
    ...TIPOGRAFIA.subtitulo,
    color: COLORES.texto,
  },
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
