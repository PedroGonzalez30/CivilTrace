/**
 * @archivo PantallaActividadesObra.tsx
 * @proyecto Civil Trace
 * @descripcion Pantalla de actividades de una obra con pestañas Activos y Terminados.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.1.0
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Botón "+" opcional para el supervisor, mensaje
 *   vacío del Figma y recarga al volver a la pantalla (feature 003)
 */

// 1. Importaciones
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  EncabezadoApp,
  IconoFlechaIzquierda,
  TarjetaActividad,
  TarjetaFormulario,
} from '@/componentes';
import BotonFlotante from '@/componentes/BotonFlotante';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { useActividadesObra } from '@/hooks/useActividadesObra';

// 2. Tipos e interfaces
interface PantallaActividadesObraProps {
  tokenAcceso: string;
  idObra: string;
  onRegresar: () => void;
  onAbrirActividad: (idActividad: string) => void;
  // Solo el supervisor agrega actividades (feature 003); el dueño no ve el botón.
  onAgregar?: () => void;
}

type PestanaActividades = 'ACTIVA' | 'TERMINADA';

// 3. Constantes del módulo
const TITULO_PANTALLA = 'Actividades';
const SUBTITULO_PANTALLA =
  'Consulta los avances de las actividades activas y terminadas de la obra';
const ETIQUETA_ACTIVOS = 'Activos';
const ETIQUETA_TERMINADOS = 'Terminados';
const MENSAJE_SIN_ACTIVOS = 'No hay actividades activas en esta obra.';
const MENSAJE_SIN_TERMINADOS = 'No hay actividades terminadas en esta obra.';
const ETIQUETA_REINTENTAR = 'Reintentar';
const TITULO_SIN_ACTIVIDADES = 'No hay actividades por realizar';
const MENSAJE_AGREGA_ACTIVIDADES = 'Agrega nuevas actividades a tu equipo y las verás aquí.';

// 4. Componente principal
export default function PantallaActividadesObra({
  tokenAcceso,
  idObra,
  onRegresar,
  onAbrirActividad,
  onAgregar,
}: PantallaActividadesObraProps) {
  const [pestana, setPestana] = useState<PestanaActividades>('ACTIVA');
  const { actividades, cargando, error, recargar } = useActividadesObra(tokenAcceso, idObra);

  // Al volver de agregar una actividad o de revisar un avance se ve la lista al día.
  const yaEnfocada = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (yaEnfocada.current) {
        recargar();
      }
      yaEnfocada.current = true;
    }, [recargar]),
  );

  const actividadesFiltradas = useMemo(() => {
    if (!actividades) {
      return [];
    }
    return actividades.filter((actividad) => actividad.estado === pestana);
  }, [actividades, pestana]);

  const mensajeVacio = pestana === 'ACTIVA' ? MENSAJE_SIN_ACTIVOS : MENSAJE_SIN_TERMINADOS;

  return (
    <View style={estilos.contenedor}>
      <EncabezadoApp />
      <ScrollView contentContainerStyle={estilos.contenido} showsVerticalScrollIndicator={false}>
        <View style={estilos.bloqueTitulo}>
          <Pressable style={estilos.regresar} onPress={onRegresar} accessibilityLabel="Regresar">
            <IconoFlechaIzquierda />
          </Pressable>
          <Text style={estilos.titulo}>{TITULO_PANTALLA}</Text>
          <Text style={estilos.subtitulo}>{SUBTITULO_PANTALLA}</Text>
        </View>

        <View style={estilos.segmento}>
          <Pressable
            style={[estilos.pestana, pestana === 'ACTIVA' && estilos.pestanaActiva]}
            onPress={() => setPestana('ACTIVA')}
          >
            <Text
              style={[estilos.textoPestana, pestana === 'ACTIVA' && estilos.textoPestanaActiva]}
            >
              {ETIQUETA_ACTIVOS}
            </Text>
          </Pressable>
          <Pressable
            style={[estilos.pestana, pestana === 'TERMINADA' && estilos.pestanaActiva]}
            onPress={() => setPestana('TERMINADA')}
          >
            <Text
              style={[estilos.textoPestana, pestana === 'TERMINADA' && estilos.textoPestanaActiva]}
            >
              {ETIQUETA_TERMINADOS}
            </Text>
          </Pressable>
        </View>

        {cargando && actividades === null ? (
          <View style={estilos.centro}>
            <ActivityIndicator color={COLORES.marca} />
          </View>
        ) : error ? (
          <TarjetaFormulario estilo={estilos.tarjetaVacia}>
            <Text style={estilos.textoError}>{error}</Text>
            <Pressable onPress={recargar}>
              <Text style={estilos.enlaceReintentar}>{ETIQUETA_REINTENTAR}</Text>
            </Pressable>
          </TarjetaFormulario>
        ) : actividadesFiltradas.length === 0 ? (
          <TarjetaFormulario estilo={estilos.tarjetaVacia}>
            {onAgregar && pestana === 'ACTIVA' ? (
              <>
                <Text style={estilos.tituloVacio}>{TITULO_SIN_ACTIVIDADES}</Text>
                <Text style={estilos.textoVacio}>{MENSAJE_AGREGA_ACTIVIDADES}</Text>
              </>
            ) : (
              <Text style={estilos.textoVacio}>{mensajeVacio}</Text>
            )}
          </TarjetaFormulario>
        ) : (
          <View style={estilos.lista}>
            {actividadesFiltradas.map((actividad) => (
              <TarjetaActividad
                key={actividad.id}
                actividad={actividad}
                onPresionar={onAbrirActividad}
              />
            ))}
          </View>
        )}
      </ScrollView>
      {onAgregar ? <BotonFlotante etiqueta="Agregar actividad" onPresionar={onAgregar} /> : null}
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  contenido: {
    // Deja espacio para que el botón "+" no tape la última tarjeta.
    paddingBottom: TAMANOS.botonFlotante + 48,
  },
  bloqueTitulo: {
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 56,
    paddingBottom: 14,
  },
  regresar: {
    position: 'absolute',
    top: 15,
    left: 16,
    width: TAMANOS.botonRegresar,
    height: TAMANOS.botonRegresar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.superficie,
    ...SOMBRAS.botonRegresar,
  },
  titulo: {
    ...TIPOGRAFIA.titulo1,
    color: COLORES.texto,
    textAlign: 'center',
  },
  subtitulo: {
    marginTop: 4,
    ...TIPOGRAFIA.subtituloPantalla,
    color: COLORES.textoAtenuado,
    textAlign: 'center',
  },
  segmento: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES.superficie,
    ...SOMBRAS.tarjeta,
  },
  pestana: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
  },
  pestanaActiva: {
    backgroundColor: COLORES.marca,
  },
  textoPestana: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.textoAtenuado,
  },
  textoPestanaActiva: {
    color: COLORES.superficie,
  },
  lista: {
    gap: 14,
    paddingHorizontal: 16,
  },
  centro: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  tarjetaVacia: {
    marginHorizontal: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  tituloVacio: {
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
    textAlign: 'center',
  },
  textoVacio: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoAtenuado,
    textAlign: 'center',
  },
  textoError: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.error,
    textAlign: 'center',
  },
  enlaceReintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
