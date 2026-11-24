/**
 * @archivo PantallaMiAsistencia.tsx
 * @proyecto Civil Trace
 * @descripcion "Mi asistencia" del trabajador (Figma TRA-Asistencia Dia, 96:329): su QR, el
 *   horario de hoy con el estado de entrada y salida, y su nombre con su oficio. El QR se ve
 *   también sin conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, D-17, D-18, RNF-07 Captura sin conexión
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoCalendario } from '@/componentes/Iconos';
import TarjetaHorarioDia from '@/componentes/TarjetaHorarioDia';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA, MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useMiAsistencia } from '@/hooks/useMiAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { obtenerIniciales } from '@/utilidades/obtenerIniciales';

// 2. Tipos e interfaces
interface PantallaMiAsistenciaProps {
  sesion: SesionAutenticacion;
  onVerHistorial: () => void;
}

// 3. Constantes del módulo
const TAMANO_QR = 260;

// 4. Componente principal
export default function PantallaMiAsistencia({
  sesion,
  onVerHistorial,
}: PantallaMiAsistenciaProps) {
  const { codigoQr, miDia, oficio, cargando, sinConexion, error, recargar } =
    useMiAsistencia(sesion);

  // Se actualiza cada vez que el trabajador vuelve a la pestaña.
  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  const obras = miDia?.obras ?? [];
  const sinObra = miDia !== null && obras.length === 0;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      >
        <View style={estilos.filaTitulo}>
          <Text style={estilos.titulo}>Asistencia</Text>
          <Pressable onPress={onVerHistorial} accessibilityLabel="Ver mi historial de asistencia">
            <IconoCalendario tamano={30} color={COLORES.textoTenue} />
          </Pressable>
        </View>
        <Text style={estilos.subtitulo}>
          Presenta el QR a tu supervisor para registrar tu entrada y salida
        </Text>

        {sinConexion ? (
          <Text style={estilos.aviso}>{MENSAJES_ASISTENCIA.estadosDesactualizados}</Text>
        ) : null}
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        {sinObra ? <Text style={estilos.aviso}>{MENSAJES_ASISTENCIA.sinObraAsignada}</Text> : null}

        {obras.map((obra) => (
          <View key={obra.obraId} style={estilos.bloqueObra}>
            {obras.length > 1 ? <Text style={estilos.nombreObra}>{obra.obraNombre}</Text> : null}
            <TarjetaHorarioDia
              variante="chips"
              horaEntrada={obra.horaEntrada}
              horaSalida={obra.horaSalida}
              entradaLista={obra.entrada.estado === 'REGISTRADA'}
              salidaLista={obra.salida.estado === 'REGISTRADA'}
            />
          </View>
        ))}

        <View style={estilos.tarjetaQr}>
          {codigoQr ? (
            <QRCode value={codigoQr} size={TAMANO_QR} />
          ) : (
            <View style={estilos.qrVacio} />
          )}
        </View>

        <View style={estilos.tarjetaPersona}>
          <View style={estilos.avatar}>
            <Text style={estilos.iniciales}>{obtenerIniciales(sesion.usuario.nombre)}</Text>
          </View>
          <View style={estilos.datosPersona}>
            <Text style={estilos.nombre}>{sesion.usuario.nombre}</Text>
            {oficio ? <Text style={estilos.oficio}>{oficio}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 16, paddingBottom: 40 },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado },
  aviso: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES_ASISTENCIA.avisoTexto,
    backgroundColor: COLORES_ASISTENCIA.avisoFondo,
    borderColor: COLORES_ASISTENCIA.avisoBorde,
    borderWidth: 1,
    borderRadius: RADIOS.accion,
    padding: 12,
  },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  bloqueObra: { gap: 8 },
  nombreObra: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  tarjetaQr: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 24,
    alignItems: 'center',
    ...SOMBRAS.tarjeta,
  },
  qrVacio: { width: TAMANO_QR, height: TAMANO_QR, backgroundColor: COLORES.fondoEntrada },
  tarjetaPersona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    ...SOMBRAS.tarjeta,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORES_ASISTENCIA.azulSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciales: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.azul },
  datosPersona: { flex: 1 },
  nombre: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  oficio: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
});
