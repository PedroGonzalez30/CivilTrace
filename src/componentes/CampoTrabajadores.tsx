/**
 * @archivo CampoTrabajadores.tsx
 * @proyecto Civil Trace
 * @descripcion Campo del formulario de obra que muestra cuántos trabajadores se asignaron y
 *              abre el checklist para elegirlos.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconoUsuarios } from '@/componentes/Iconos';
import ModalTrabajadores from '@/componentes/ModalTrabajadores';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_ASIGNAR_TRABAJADORES } from '@/constantes/textos';
import type { PersonaEmpresa } from '@/tipos/personal';

// 2. Tipos e interfaces
interface CampoTrabajadoresProps {
  trabajadores: PersonaEmpresa[];
  seleccionados: string[];
  onCambiar: (idsSeleccionados: string[]) => void;
}

// 4. Componente principal
export default function CampoTrabajadores({
  trabajadores,
  seleccionados,
  onCambiar,
}: CampoTrabajadoresProps) {
  const [esModalVisible, setEsModalVisible] = useState(false);

  const cantidad = seleccionados.length;
  const textoResumen =
    cantidad === 0
      ? TEXTOS_ASIGNAR_TRABAJADORES.sinSeleccion
      : `${cantidad} ${cantidad === 1 ? 'trabajador' : 'trabajadores'}`;

  const manejarConfirmar = (idsSeleccionados: string[]) => {
    onCambiar(idsSeleccionados);
    setEsModalVisible(false);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{TEXTOS_ASIGNAR_TRABAJADORES.etiqueta}</Text>
      <Pressable style={estilos.caja} onPress={() => setEsModalVisible(true)}>
        <Text style={estilos.texto}>{textoResumen}</Text>
        <IconoUsuarios />
      </Pressable>
      <ModalTrabajadores
        esVisible={esModalVisible}
        trabajadores={trabajadores}
        seleccionados={seleccionados}
        onConfirmar={manejarConfirmar}
        onCerrar={() => setEsModalVisible(false)}
      />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 8,
  },
  etiqueta: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  caja: {
    height: TAMANOS.entrada,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORES.fondoEntrada,
    borderWidth: 1,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.entrada,
  },
  texto: {
    flex: 1,
    ...TIPOGRAFIA.entrada,
    color: COLORES.textoAtenuado,
  },
});
