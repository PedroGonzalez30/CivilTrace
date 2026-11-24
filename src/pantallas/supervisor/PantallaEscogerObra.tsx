/**
 * @archivo PantallaEscogerObra.tsx
 * @proyecto Civil Trace
 * @descripcion El supervisor elige la obra donde pasará asistencia (Figma
 *   SUP_Asistencia_EscogerObra, 96:2903).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.1.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 *   24/11/2026 - Emilio Manuel Esquivel - Subtítulo y pie configurables para reusarla como "Mis
 *   obras" en Inicio (SUP_Trabajo_VerObras, feature 003)
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { type ReactNode, useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoEdificio } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useObrasSupervisadas } from '@/hooks/useObrasSupervisadas';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ObraSupervisada } from '@/tipos/asistencia';

// 2. Tipos e interfaces
interface PantallaEscogerObraProps {
  sesion: SesionAutenticacion;
  onElegirObra: (obra: ObraSupervisada) => void;
  // Inicio (feature 003) usa otro subtítulo y agrega el código de trabajadores al final.
  subtitulo?: string;
  pie?: ReactNode;
}

// 3. Constantes del módulo
const MENSAJE_SIN_OBRAS = 'Todavía no supervisas ninguna obra.';
const SUBTITULO_ASISTENCIA = 'Selecciona una de las obras en las que pasarás asistencia';

// 4. Componente principal
export default function PantallaEscogerObra({
  sesion,
  onElegirObra,
  subtitulo = SUBTITULO_ASISTENCIA,
  pie,
}: PantallaEscogerObraProps) {
  const { obras, cargando, error, recargar } = useObrasSupervisadas(sesion.token);

  useFocusEffect(
    useCallback(() => {
      void recargar();
    }, [recargar]),
  );

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView
        contentContainerStyle={estilos.contenido}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
      >
        <Text style={estilos.titulo}>
          Bienvenido{sesion.usuario.empresa ? ` a ${sesion.usuario.empresa}` : ''}
        </Text>
        <Text style={estilos.subtitulo}>{subtitulo}</Text>
        {error ? <Text style={estilos.error}>{error}</Text> : null}
        {!cargando && !error && obras.length === 0 ? (
          <Text style={estilos.subtitulo}>{MENSAJE_SIN_OBRAS}</Text>
        ) : null}
        {obras.map((obra) => (
          <Pressable
            key={obra.id}
            style={estilos.tarjeta}
            onPress={() => onElegirObra(obra)}
            accessibilityRole="button"
          >
            <View style={estilos.filaNombre}>
              <IconoEdificio color={COLORES.textoSutil} />
              <Text style={estilos.nombre}>{obra.nombre}</Text>
            </View>
            <Dato etiqueta="Descripción" valor={obra.descripcion} />
            <Dato etiqueta="Dirección" valor={obra.direccion} />
            <View style={estilos.filaFechas}>
              <Dato etiqueta="Fecha de inicio" valor={formatearFechaCorta(obra.fechaInicio)} />
              <Dato etiqueta="Fecha de fin" valor={formatearFechaCorta(obra.fechaFinal)} />
            </View>
          </Pressable>
        ))}
        {pie}
      </ScrollView>
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.dato}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor || '—'}</Text>
    </View>
  );
}

// "2026-10-12" → "12/10/2026", como en el Figma.
function formatearFechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 16, paddingBottom: 40 },
  titulo: { ...TIPOGRAFIA.titulo1, color: COLORES.texto },
  subtitulo: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 10,
    ...SOMBRAS.tarjeta,
  },
  filaNombre: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nombre: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  filaFechas: { flexDirection: 'row', gap: 24 },
  dato: { gap: 2, flexShrink: 1 },
  etiqueta: { ...TIPOGRAFIA.leyenda, color: COLORES.textoTenue },
  valor: { ...TIPOGRAFIA.subtitulo, color: COLORES.texto },
});
