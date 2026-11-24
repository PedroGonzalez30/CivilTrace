/**
 * @archivo PantallaHistorialAsistencia.tsx
 * @proyecto Civil Trace
 * @descripcion Historial de asistencia del trabajador (Figma TRA-HIstorial asistencia, 96:389):
 *   alerta de faltas solo si tiene al menos una (D-16), calendario con $ y detalle del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia,
 *   D-13, D-16
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CalendarioAsistencia from '@/componentes/CalendarioAsistencia';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import HojaDetalleDia from '@/componentes/HojaDetalleDia';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import TarjetaTrabajador from '@/componentes/TarjetaTrabajador';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA, MENSAJES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useCalendario } from '@/hooks/useCalendario';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { obtenerFechaLocal } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface PantallaHistorialAsistenciaProps {
  sesion: SesionAutenticacion;
  onRegresar: () => void;
}

// 3. Constantes del módulo
const ZONA_POR_DEFECTO = 'America/Tijuana';

// 4. Componente principal
export default function PantallaHistorialAsistencia({
  sesion,
  onRegresar,
}: PantallaHistorialAsistenciaProps) {
  const mesActual = obtenerFechaLocal(new Date(), ZONA_POR_DEFECTO).slice(0, 7);
  const { mes, cambiarMes, calendario, detalle, cerrarDia, abrirDia, error } = useCalendario(
    sesion.token,
    sesion.usuario.id,
    mesActual,
  );
  const faltas = calendario?.resumen.faltas ?? 0;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          </Pressable>
          <Text style={estilos.titulo}>Asistencia</Text>
        </View>
        <Text style={estilos.subtitulo}>Asistencias del mes</Text>
        {faltas >= 1 ? (
          <View style={estilos.alerta}>
            <Text style={estilos.alertaTitulo}>
              Tienes {faltas} {faltas === 1 ? 'falta' : 'faltas'} este mes
            </Text>
            <Text style={estilos.alertaTexto}>{MENSAJES_ASISTENCIA.recordatorioFaltas}</Text>
          </View>
        ) : null}
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        <View style={estilos.tarjeta}>
          <CalendarioAsistencia
            mes={mes}
            dias={calendario?.dias ?? []}
            onCambiarMes={cambiarMes}
            onTocarDia={(dia) => void abrirDia(dia)}
          />
        </View>
        <TarjetaTrabajador
          nombre={sesion.usuario.nombre}
          oficio={calendario?.trabajador.oficio ?? null}
        />
      </ScrollView>
      {detalle ? (
        <HojaDetalleDia detalle={detalle} zonaHoraria={ZONA_POR_DEFECTO} onCerrar={cerrarDia} />
      ) : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 14, paddingBottom: 40 },
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
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.titulo3, color: COLORES.texto },
  alerta: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    borderColor: COLORES_ASISTENCIA.alertaBorde,
    borderWidth: 1,
    borderRadius: RADIOS.accion,
    padding: 12,
    gap: 4,
  },
  alertaTitulo: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.alertaTitulo },
  alertaTexto: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.alertaTexto },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    ...SOMBRAS.tarjeta,
  },
});
