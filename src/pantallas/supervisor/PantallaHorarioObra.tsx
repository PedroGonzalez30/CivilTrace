/**
 * @archivo PantallaHorarioObra.tsx
 * @proyecto Civil Trace
 * @descripcion Horario de la obra (Figma SUP_HorarioObra, 2272:170): entrada, salida, tolerancia,
 *   días laborales y si aplica a todos los días o solo hoy.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06, RF-60 Registrar retardo o salida anticipada
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import SelectorHora from '@/componentes/SelectorHora';
import { COLORES } from '@/constantes/colores';
import {
  COLORES_ASISTENCIA,
  DIAS_SEMANA,
  TOLERANCIAS_MINUTOS,
} from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TIPOGRAFIA } from '@/constantes/tema';
import { useHorarioObra } from '@/hooks/useHorarioObra';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { sumarMinutosAHora } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface PantallaHorarioObraProps {
  sesion: SesionAutenticacion;
  obraId: string;
  obraNombre: string;
  onRegresar: () => void;
  onGuardado: () => void;
}

// 4. Componente principal
export default function PantallaHorarioObra({
  sesion,
  obraId,
  obraNombre,
  onRegresar,
  onGuardado,
}: PantallaHorarioObraProps) {
  const { valores, guardando, error, cambiar, guardar } = useHorarioObra(sesion.token, obraId);

  const alternarDia = (numero: number) => {
    const dias = valores.diasLaborales.includes(numero)
      ? valores.diasLaborales.filter((dia) => dia !== numero)
      : [...valores.diasLaborales, numero];
    cambiar({ diasLaborales: [...dias].sort((a, b) => a - b) });
  };

  const manejarGuardar = async () => {
    if (await guardar()) {
      onGuardado();
    }
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          </Pressable>
          <View>
            <Text style={estilos.titulo}>Horario de la obra</Text>
            <Text style={estilos.obra}>{obraNombre}</Text>
          </View>
        </View>
        <Text style={estilos.ayuda}>Aplica a todos los trabajadores asignados a esta obra.</Text>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Jornada</Text>
          <View style={estilos.fila}>
            <SelectorHora
              etiqueta="Entrada"
              valor={valores.horaEntrada}
              onCambiar={(hora) => cambiar({ horaEntrada: hora })}
            />
            <SelectorHora
              etiqueta="Salida"
              valor={valores.horaSalida}
              onCambiar={(hora) => cambiar({ horaSalida: hora })}
            />
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Tolerancia para registrar</Text>
          <View style={estilos.segmento}>
            {TOLERANCIAS_MINUTOS.map((minutos) => (
              <Pressable
                key={minutos}
                style={[
                  estilos.opcionSegmento,
                  valores.toleranciaMinutos === minutos && estilos.opcionActiva,
                ]}
                onPress={() => cambiar({ toleranciaMinutos: minutos })}
              >
                <Text
                  style={[
                    estilos.textoSegmento,
                    valores.toleranciaMinutos === minutos && estilos.textoActivo,
                  ]}
                >
                  {minutos} min
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={estilos.ayuda}>
            Una entrada después de las{' '}
            {sumarMinutosAHora(valores.horaEntrada, valores.toleranciaMinutos)} se marca como
            retardo.
          </Text>
        </View>

        <View style={estilos.tarjeta}>
          <Text style={estilos.tituloTarjeta}>Días laborales</Text>
          <View style={estilos.dias}>
            {DIAS_SEMANA.map(({ numero, letra }) => {
              const activo = valores.diasLaborales.includes(numero);
              return (
                <Pressable
                  key={numero}
                  style={[estilos.dia, activo && estilos.diaActivo]}
                  onPress={() => alternarDia(numero)}
                  accessibilityLabel={`Día ${letra}`}
                  accessibilityState={{ selected: activo }}
                >
                  <Text style={[estilos.textoDia, activo && estilos.textoDiaActivo]}>{letra}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={estilos.tituloTarjeta}>Aplicar</Text>
          <View style={estilos.segmento}>
            {(['TODOS_LOS_DIAS', 'SOLO_HOY'] as const).map((alcance) => (
              <Pressable
                key={alcance}
                style={[
                  estilos.opcionSegmento,
                  valores.alcance === alcance && estilos.opcionActiva,
                ]}
                onPress={() => cambiar({ alcance })}
              >
                <Text
                  style={[
                    estilos.textoSegmento,
                    valores.alcance === alcance && estilos.textoActivo,
                  ]}
                >
                  {alcance === 'TODOS_LOS_DIAS' ? 'Todos los días' : 'Solo hoy'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <Text style={estilos.error}>{error}</Text> : null}
        <BotonPrincipal
          etiqueta="Guardar horario"
          estaCargando={guardando}
          onPresionar={() => void manejarGuardar()}
          estilo={estilos.botonGuardar}
        />
      </ScrollView>
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
  titulo: { ...TIPOGRAFIA.titulo2, color: COLORES.texto },
  obra: { ...TIPOGRAFIA.subtitulo, color: COLORES_ASISTENCIA.azul },
  ayuda: { ...TIPOGRAFIA.leyenda, color: COLORES.textoAtenuado },
  tarjeta: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.tarjeta,
    padding: 16,
    gap: 12,
    ...SOMBRAS.tarjeta,
  },
  tituloTarjeta: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  fila: { flexDirection: 'row', gap: 12 },
  segmento: {
    flexDirection: 'row',
    backgroundColor: COLORES_ASISTENCIA.diaInactivo,
    borderRadius: RADIOS.accion,
    padding: 4,
  },
  opcionSegmento: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIOS.accion,
  },
  opcionActiva: { backgroundColor: COLORES.superficie, ...SOMBRAS.tarjeta },
  textoSegmento: { ...TIPOGRAFIA.leyenda, color: COLORES.textoSutil },
  textoActivo: { ...TIPOGRAFIA.etiqueta, color: COLORES.texto },
  dias: { flexDirection: 'row', justifyContent: 'space-between' },
  dia: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES_ASISTENCIA.diaInactivo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaActivo: { backgroundColor: COLORES_ASISTENCIA.azul },
  textoDia: { ...TIPOGRAFIA.etiqueta, color: COLORES.textoTenue },
  textoDiaActivo: { color: COLORES.superficie },
  error: { ...TIPOGRAFIA.leyenda, color: COLORES.error },
  botonGuardar: { backgroundColor: COLORES_ASISTENCIA.azul },
});
