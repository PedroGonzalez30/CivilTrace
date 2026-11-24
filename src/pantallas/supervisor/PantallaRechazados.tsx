/**
 * @archivo PantallaRechazados.tsx
 * @proyecto Civil Trace
 * @descripcion Registros que el servidor no guardó al sincronizar, con el trabajador y el motivo
 *   (estilo de la propuesta aprobada 2295:254, D-21). El supervisor los descarta.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RNF-07 Captura sin conexión (D-14)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import EncabezadoApp from '@/componentes/EncabezadoApp';
import { IconoChevronIzquierda } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, TIPOGRAFIA } from '@/constantes/tema';
import { type EscaneoPendiente, obtenerRepositorioLocal } from '@/servicios/local/repositorioLocal';
import { notificarCambios } from '@/servicios/local/servicioSincronizacionAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import { formatearInstante } from '@/utilidades/formatoHoras';

// 2. Tipos e interfaces
interface PantallaRechazadosProps {
  sesion: SesionAutenticacion;
  obraId: string;
  onRegresar: () => void;
}

// 3. Constantes del módulo
const ZONA_POR_DEFECTO = 'America/Tijuana';

// 4. Componente principal
export default function PantallaRechazados({
  sesion,
  obraId,
  onRegresar,
}: PantallaRechazadosProps) {
  const [rechazados, setRechazados] = useState<EscaneoPendiente[]>([]);
  const [zonaHoraria, setZonaHoraria] = useState(ZONA_POR_DEFECTO);

  const cargar = useCallback(async () => {
    const repositorio = await obtenerRepositorioLocal();
    setRechazados(await repositorio.listarRechazados(sesion.usuario.id, obraId));
    const paquete = await repositorio.obtenerPaquete(obraId);
    if (paquete) {
      setZonaHoraria(paquete.zonaHoraria);
    }
  }, [obraId, sesion.usuario.id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const descartar = async (idLocal: string) => {
    const repositorio = await obtenerRepositorioLocal();
    await repositorio.borrarEscaneos([idLocal]);
    notificarCambios();
    await cargar();
  };

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Pressable onPress={onRegresar} style={estilos.regresar} accessibilityLabel="Regresar">
          <IconoChevronIzquierda tamano={20} color={COLORES.textoAtenuado} />
          <Text style={estilos.titulo}>Registros no guardados</Text>
        </Pressable>
        {rechazados.length === 0 ? (
          <Text style={estilos.vacio}>No hay registros rechazados.</Text>
        ) : null}
        {rechazados.map((escaneo) => (
          <View key={escaneo.idLocal} style={estilos.caja}>
            <Text style={estilos.nombre}>
              {escaneo.trabajadorNombre ?? 'Trabajador desconocido'} ·{' '}
              {escaneo.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}{' '}
              {formatearInstante(escaneo.capturadoEn, zonaHoraria)}
            </Text>
            <Text style={estilos.mensaje}>{escaneo.mensaje ?? 'El servidor no lo aceptó.'}</Text>
            <Pressable onPress={() => void descartar(escaneo.idLocal)} accessibilityRole="button">
              <Text style={estilos.descartar}>Descartar</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.pantalla },
  contenido: { padding: 24, gap: 12 },
  regresar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { ...TIPOGRAFIA.titulo4, color: COLORES.texto },
  vacio: { ...TIPOGRAFIA.subtitulo, color: COLORES.textoAtenuado },
  caja: {
    backgroundColor: COLORES_ASISTENCIA.alertaFondo,
    borderColor: COLORES_ASISTENCIA.alertaBorde,
    borderWidth: 1,
    borderRadius: RADIOS.accion,
    padding: 12,
    gap: 4,
  },
  nombre: { ...TIPOGRAFIA.etiqueta, color: COLORES_ASISTENCIA.alertaTitulo },
  mensaje: { ...TIPOGRAFIA.leyenda, color: COLORES_ASISTENCIA.alertaTexto },
  descartar: { ...TIPOGRAFIA.enlace, color: COLORES_ASISTENCIA.azul, alignSelf: 'flex-end' },
});
