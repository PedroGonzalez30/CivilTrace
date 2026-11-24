/**
 * @archivo TarjetaObra.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta que muestra el resumen de una obra (nombre, descripción, dirección y
 * fechas) en la pantalla principal del dueño.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 * @requerimientos RF-44 Mostrar obras
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CampoEtiquetado from '@/componentes/CampoEtiquetado';
import { IconoEdificio } from '@/componentes/Iconos';
import TarjetaFormulario from '@/componentes/TarjetaFormulario';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import type { Obra } from '@/tipos/obra';

// 2. Tipos e interfaces
interface TarjetaObraProps {
  obra: Obra;
  onPresionar: (idObra: string) => void;
}

// 4. Componente principal
export default function TarjetaObra({ obra, onPresionar }: TarjetaObraProps) {
  const manejarPresion = () => {
    onPresionar(obra.id);
  };

  return (
    <Pressable onPress={manejarPresion}>
      <TarjetaFormulario estilo={estilos.tarjeta}>
        <View style={estilos.filaTitulo}>
          <IconoEdificio />
          <Text style={estilos.titulo}>{obra.nombre}</Text>
        </View>
        <CampoEtiquetado etiqueta="Descripción" valor={obra.resumen} />
        <CampoEtiquetado etiqueta="Dirección" valor={obra.direccion} />
        <View style={estilos.fechas}>
          <CampoEtiquetado
            estilo={estilos.fecha}
            etiqueta="Fecha de inicio"
            valor={obra.fechaInicio}
          />
          <CampoEtiquetado estilo={estilos.fecha} etiqueta="Fecha de fin" valor={obra.fechaFinal} />
        </View>
      </TarjetaFormulario>
    </Pressable>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  tarjeta: {
    gap: 12,
    padding: 16,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titulo: {
    flex: 1,
    ...TIPOGRAFIA.titulo4,
    color: COLORES.texto,
  },
  fechas: {
    flexDirection: 'row',
    gap: 16,
  },
  fecha: {
    flex: 1,
  },
});
