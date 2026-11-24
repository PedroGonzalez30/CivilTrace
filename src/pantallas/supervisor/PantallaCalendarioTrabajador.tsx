/**
 * @archivo PantallaCalendarioTrabajador.tsx
 * @proyecto Civil Trace
 * @descripcion Calendario de asistencia de un trabajador para el supervisor (Figma
 *   SUP_CalendarioTrabajador, 2272:354): resumen del mes, calendario y detalle del día.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-56 Mostrar días con descuento, RF-58 Mostrar calendario de asistencia, D-08
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CalendarioAsistencia from '@/componentes/CalendarioAsistencia';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import HojaDetalleDia from '@/componentes/HojaDetalleDia';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import TarjetaTrabajador from '@/componentes/TarjetaTrabajador';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useCalendario } from '@/hooks/useCalendario';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { CalendarioMes } from '@/tipos/asistencia';
import { formatearMes, obtenerFechaLocal } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface PantallaCalendarioTrabajadorProps {
  sesion: SesionAutenticacion;
  trabajadorId: string;
  obraId: string;
  obraNombre: string;
  onRegresar: () => void;
}

// 3. Constantes del módulo
const ZONA_POR_DEFECTO = 'America/Tijuana';

// 4. Componente principal
/** "1 falta · 1 media jornada · 1 retardo", como en el Figma. */
export function describirResumen(resumen: CalendarioMes['resumen']): string {
  const partes = [
    [resumen.faltas, 'falta', 'faltas'],
    [resumen.mediasJornadas, 'media jornada', 'medias jornadas'],
    [resumen.retardos, 'retardo', 'retardos'],
    [resumen.salidasTempranas, 'salida temprana', 'salidas tempranas'],
  ] as const;
  const texto = partes
    .filter(([cantidad]) => cantidad > 0)
    .map(([cantidad, singular, plural]) => `${cantidad} ${cantidad === 1 ? singular : plural}`)
    .join(' · ');
  return texto || 'Sin incidencias este mes';
}

export default function PantallaCalendarioTrabajador({
  sesion,
  trabajadorId,
  obraId,
  obraNombre,
  onRegresar,
}: PantallaCalendarioTrabajadorProps) {
  const mesActual = obtenerFechaLocal(new Date(), ZONA_POR_DEFECTO).slice(0, 7);
  const { mes, cambiarMes, calendario, detalle, cerrarDia, abrirDia, cargando, error } =
    useCalendario(sesion.token, trabajadorId, mesActual, obraId);

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
        <Text style={estilos.subtitulo}>
          {formatearMes(mes)} · {obraNombre}
        </Text>
        {calendario ? (
          <View style={estilos.alerta}>
            <Text style={estilos.alertaTitulo}>{describirResumen(calendario.resumen)}</Text>
            <Text style={estilos.alertaTexto}>
              Toca un día de color para ver lo que se anotó ese día.
            </Text>
          </View>
        ) : null}
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        <View style={estilos.tarjeta}>
          {cargando && !calendario ? <ActivityIndicator color={COLORES_ASISTENCIA.azul} /> : null}
          <CalendarioAsistencia
            mes={mes}
            dias={calendario?.dias ?? []}
            onCambiarMes={cambiarMes}
            onTocarDia={(dia) => void abrirDia(dia)}
          />
        </View>
        {calendario ? (
          <TarjetaTrabajador
            nombre={calendario.trabajador.nombre}
            oficio={calendario.trabajador.oficio}
          />
        ) : null}
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
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
});
