/**
 * @archivo PantallaLeerQr.tsx
 * @proyecto Civil Trace
 * @descripcion Lectura de QR de asistencia de una obra (Figma SUP_Asistencia_LeerQr, 2272:117, y
 *   avisos 2295:254): horario del día, cámara para escanear y resumen de asistencia. Funciona sin
 *   conexión con lo guardado en el teléfono.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.1.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, RF-60, RNF-07 Captura sin
 *   conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001, research R-04)
 *   24/11/2026 - Emilio Manuel Esquivel - Botón visible "Detalles" por trabajador (D-26)
 */

// 1. Importaciones
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { type BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import AvisoSincronizacion from '@/componentes/AvisoSincronizacion';
import BotonPrincipal from '@/componentes/BotonPrincipal';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import HojaDetallesAsistencia from '@/componentes/HojaDetallesAsistencia';
import { IconoLapiz } from '@/componentes/Iconos';
import TarjetaHorarioDia from '@/componentes/TarjetaHorarioDia';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useLecturaQr } from '@/hooks/useLecturaQr';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { TrabajadorResumen } from '@/tipos/asistencia';
import { formatearInstante } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface PantallaLeerQrProps {
  sesion: SesionAutenticacion;
  obraId: string;
  obraNombre: string;
  onEscaneado: (codigoQr: string) => void;
  onEditarHorario: () => void;
  onVerRechazados: () => void;
  onVerCalendario: (trabajadorId: string) => void;
}

// 3. Constantes del módulo
const ALTO_CAMARA = 260;
const MENSAJE_PERMISO =
  'Civil Trace necesita la cámara para escanear el QR de asistencia de los trabajadores.';

// 4. Componente principal
export default function PantallaLeerQr({
  sesion,
  obraId,
  obraNombre,
  onEscaneado,
  onEditarHorario,
  onVerRechazados,
  onVerCalendario,
}: PantallaLeerQrProps) {
  const lectura = useLecturaQr(sesion, obraId);
  const { recargar } = lectura;
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [pausado, setPausado] = useState(false);
  // Trabajador cuya hoja de detalles está abierta (al mantenerlo presionado).
  const [seleccionado, setSeleccionado] = useState<{
    trabajador: TrabajadorResumen;
    fecha: string;
  } | null>(null);
  // Solo puede haber una vista de cámara activa: se monta únicamente con la pantalla al frente.
  const estaEnfocada = useIsFocused();

  useFocusEffect(
    useCallback(() => {
      setPausado(false);
      void recargar();
    }, [recargar]),
  );

  const manejarEscaneo = ({ data }: BarcodeScanningResult) => {
    setPausado(true);
    onEscaneado(data);
  };

  const resumen = lectura.resumen;
  const horario = resumen?.horario ?? null;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={lectura.cargando} onRefresh={recargar} />}
      >
        <Text style={estilos.titulo}>Asistencia de personal</Text>
        <Text style={estilos.obra}>{obraNombre}</Text>
        <AvisoSincronizacion
          sinConexion={lectura.sinConexion}
          pendientes={lectura.pendientes}
          rechazados={lectura.rechazados}
          generadoEn={lectura.generadoEn}
          zonaHoraria={lectura.zonaHoraria}
          onVerRechazados={onVerRechazados}
        />
        {lectura.error ? <Text style={estilos.error}>{lectura.error}</Text> : null}

        <TarjetaHorarioDia
          variante="columnas"
          horaEntrada={horario?.horaEntrada ?? null}
          horaSalida={horario?.horaSalida ?? null}
          entradaLista={resumen?.estadoEntrada === 'FINALIZADO'}
          salidaLista={resumen?.estadoSalida === 'FINALIZADO'}
          onEditarHorario={onEditarHorario}
        />

        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Código QR de asistencia</Text>
          {!permiso ? null : permiso.granted ? (
            estaEnfocada ? (
              <CameraView
                style={estilos.camara}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={pausado ? undefined : manejarEscaneo}
              />
            ) : (
              <View style={estilos.camara} />
            )
          ) : (
            <View style={estilos.permiso}>
              <Text style={estilos.textoPermiso}>{MENSAJE_PERMISO}</Text>
              <BotonPrincipal etiqueta="Permitir cámara" onPresionar={() => void pedirPermiso()} />
            </View>
          )}
        </View>

        <Text style={estilos.tituloSeccion}>Resumen de asistencia</Text>
        <Text style={estilos.ayuda}>
          Toca “Detalles” para justificar un retardo o una falta, o para corregir las horas.
        </Text>
        {(resumen?.trabajadores ?? []).map((trabajador) => {
          const abrirDetalles = () =>
            resumen && setSeleccionado({ trabajador, fecha: resumen.fecha });
          return (
            <Pressable
              key={trabajador.id}
              style={estilos.fila}
              onLongPress={abrirDetalles}
              accessibilityHint="Mantén presionado para ver los detalles"
            >
              <Text style={estilos.nombre}>{trabajador.nombre}</Text>
              <View style={estilos.ladoDerecho}>
                <Text
                  style={[
                    estilos.estadoFila,
                    {
                      color: trabajador.entrada
                        ? COLORES_ASISTENCIA.verdeTexto
                        : COLORES_ASISTENCIA.rojoTexto,
                    },
                  ]}
                >
                  {trabajador.entrada
                    ? `Entrada ${formatearInstante(trabajador.entrada, lectura.zonaHoraria)}`
                    : trabajador.tipoJornada === 'FALTA'
                      ? 'Falta'
                      : 'Sin registrar'}
                </Text>
                {/* Botón visible (D-26): mantener presionado no se descubre a simple vista. */}
                <Pressable
                  style={estilos.botonDetalles}
                  onPress={abrirDetalles}
                  accessibilityRole="button"
                  accessibilityLabel={`Detalles de asistencia de ${trabajador.nombre}`}
                  hitSlop={6}
                >
                  <IconoLapiz tamano={12} color={COLORES_ASISTENCIA.azul} />
                  <Text style={estilos.textoDetalles}>Detalles</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {seleccionado ? (
        <HojaDetallesAsistencia
          visible
          sesion={sesion}
          obraId={obraId}
          trabajadorId={seleccionado.trabajador.id}
          fecha={seleccionado.fecha}
          zonaHoraria={lectura.zonaHoraria}
          onCerrar={() => setSeleccionado(null)}
          onGuardado={() => {
            setSeleccionado(null);
            void recargar();
          }}
          onVerCalendario={() => {
            setSeleccionado(null);
            onVerCalendario(seleccionado.trabajador.id);
          }}
        />
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 14, paddingBottom: 40 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  obra: { ...TIPOGRAFIA.titulo3, color: COLORES_ASISTENCIA.azul },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 12,
    alignItems: 'center',
    ...SOMBRAS.tarjeta,
  },
  tituloTarjeta: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  camara: { width: '100%', height: ALTO_CAMARA, borderRadius: RADIOS.accion, overflow: 'hidden' },
  permiso: { gap: 12, alignSelf: 'stretch' },
  textoPermiso: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado, textAlign: 'center' },
  tituloSeccion: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  ayuda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.bordeModal,
  },
  nombre: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado, flexShrink: 1 },
  estadoFila: { ...TIPOGRAFIA.etiqueta },
  ladoDerecho: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  botonDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIOS.pildora,
    borderWidth: 1,
    borderColor: COLORES_ASISTENCIA.azul,
  },
  textoDetalles: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.azul },
});
