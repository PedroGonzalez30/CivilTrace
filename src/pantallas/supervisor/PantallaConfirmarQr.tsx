/**
 * @archivo PantallaConfirmarQr.tsx
 * @proyecto Civil Trace
 * @descripcion Confirmación del QR escaneado (Figma Sup_Asistencia_ConfirmarQR, 96:2228): datos,
 *   foto, hora y ubicación del trabajador; "Rechazar" o "Aceptar". Funciona sin conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RNF-07 Captura sin conexión
 *   (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import {
  aceptarEscaneo,
  prepararEscaneo,
  type ResultadoPreparacion,
} from '@/servicios/local/servicioEscaneo';
import { obtenerUbicacionRapida, type Ubicacion } from '@/servicios/local/servicioUbicacion';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { formatearInstante } from '@/utilidades/formatoHoras';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface PantallaConfirmarQrProps {
  sesion: SesionAutenticacion;
  obraId: string;
  codigoQr: string;
  onTerminar: () => void;
}

// 3. Constantes del módulo
const DECIMALES_UBICACION = 4;
const MENSAJE_ERROR_GUARDAR = 'No se pudo guardar el registro. Inténtalo de nuevo.';

// 4. Componente principal
export default function PantallaConfirmarQr({
  sesion,
  obraId,
  codigoQr,
  onTerminar,
}: PantallaConfirmarQrProps) {
  const [preparacion, setPreparacion] = useState<ResultadoPreparacion | null>(null);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null | undefined>(undefined);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    void prepararEscaneo(sesion, obraId, codigoQr).then((r) => vigente && setPreparacion(r));
    void obtenerUbicacionRapida().then((u) => vigente && setUbicacion(u));
    return () => {
      vigente = false;
    };
  }, [codigoQr, obraId, sesion]);

  const manejarAceptar = async () => {
    if (!preparacion?.ok) {
      return;
    }
    setGuardando(true);
    try {
      await aceptarEscaneo(sesion, preparacion, ubicacion ?? null);
      onTerminar();
    } catch {
      setError(MENSAJE_ERROR_GUARDAR);
      setGuardando(false);
    }
  };

  if (!preparacion) {
    return (
      <View style={[estilos.contenedor, estilos.centrado]}>
        <ActivityIndicator color={COLORES_ASISTENCIA.azul} />
      </View>
    );
  }

  if (!preparacion.ok) {
    return (
      <View style={estilos.contenedor}>
        <EncabezadoApp />
        <View style={estilos.contenido}>
          <Text style={estilos.titulo}>Asistencia</Text>
          <View style={estilos.rechazo}>
            <Text style={estilos.textoRechazo}>{preparacion.mensaje}</Text>
          </View>
          <BotonPrincipal etiqueta="Volver a escanear" onPresionar={onTerminar} />
        </View>
      </View>
    );
  }

  const { trabajador } = preparacion;
  const textoUbicacion =
    ubicacion === undefined
      ? 'Obteniendo ubicación…'
      : ubicacion === null
        ? 'Sin ubicación GPS'
        : `${ubicacion.latitud.toFixed(DECIMALES_UBICACION)}, ${ubicacion.longitud.toFixed(DECIMALES_UBICACION)}`;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.titulo}>Asistencia</Text>
        <Text style={estilos.subtitulo}>Verifica la información del trabajador</Text>
        <View style={estilos.tarjeta}>
          <Dato etiqueta="Trabajador" valor={trabajador.nombre} />
          <Dato
            etiqueta={preparacion.tipo === 'ENTRADA' ? 'Hora de entrada' : 'Hora de salida'}
            valor={formatearInstante(preparacion.hora, preparacion.zonaHoraria)}
          />
          <Dato etiqueta="Ubicación" valor={textoUbicacion} />
        </View>
        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Fotografía del trabajador</Text>
          {trabajador.foto ? (
            <Image
              source={trabajador.foto}
              style={estilos.foto}
              accessibilityLabel="Foto del trabajador"
            />
          ) : (
            <View style={[estilos.foto, estilos.sinFoto]}>
              <Text style={estilos.iniciales}>{obtenerIniciales(trabajador.nombre)}</Text>
            </View>
          )}
        </View>
        <Text style={estilos.nombre}>{trabajador.nombre}</Text>
        {trabajador.oficio ? <Text style={estilos.oficio}>{trabajador.oficio}</Text> : null}
        <Text
          style={[
            estilos.faltas,
            {
              color:
                trabajador.faltasMes === 0
                  ? COLORES_ASISTENCIA.verdeTexto
                  : COLORES_ASISTENCIA.rojoTexto,
            },
          ]}
        >
          {trabajador.faltasMes === 0
            ? 'Sin faltas este mes'
            : `${trabajador.faltasMes} ${trabajador.faltasMes === 1 ? 'falta' : 'faltas'} este mes`}
        </Text>
        {preparacion.sinConexion ? (
          <Text style={estilos.aviso}>Sin conexión: se enviará al volver la señal.</Text>
        ) : null}
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        <View style={estilos.botones}>
          <BotonPrincipal
            estilo={estilos.boton}
            variante="contorno"
            etiqueta="Rechazar"
            onPresionar={onTerminar}
          />
          <BotonPrincipal
            estilo={estilos.boton}
            etiqueta="Aceptar"
            estaCargando={guardando}
            onPresionar={() => void manejarAceptar()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  centrado: { alignItems: 'center', justifyContent: 'center' },
  contenido: { padding: 24, gap: 14, paddingBottom: 40 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 10,
    ...SOMBRAS.tarjeta,
  },
  tituloTarjeta: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  dato: { gap: 2 },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  valor: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  foto: { width: '100%', height: 200, borderRadius: RADIOS.accion },
  sinFoto: {
    backgroundColor: COLORES_ASISTENCIA.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.titulo1, color: COLORES_ASISTENCIA.azul },
  nombre: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  oficio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  faltas: { ...TIPOGRAFIA.etiqueta },
  aviso: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.avisoTexto },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  botones: { flexDirection: 'row', gap: 12 },
  boton: { flex: 1 },
  rechazo: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    borderColor: COLORES_ASISTENCIA.alertaBorde,
    borderWidth: 1,
    borderRadius: RADIOS.accion,
    padding: 16,
  },
  textoRechazo: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.alertaTitulo },
});
