/**
 * @archivo ModalObraCreada.tsx
 * @proyecto Civil Trace
 * @descripcion Ventana con fondo desenfocado que confirma la creación de una obra y
 *              muestra el resumen de sus datos.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { COLORES } from '@/constantes/colores';
import { RADIOS, SOMBRAS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';
import { TEXTOS_OBRA_CREADA } from '@/constantes/textos';
import type { DatosNuevaObra } from '@/tipos/obra';

// 2. Tipos e interfaces
interface ModalObraCreadaProps {
  datos: DatosNuevaObra;
  nombreSupervisor: string;
  onCerrar: () => void;
  onIrAlPanelPrincipal: () => void;
}

interface FilaResumen {
  etiqueta: string;
  valor: string;
}

// 3. Constantes del módulo
const ESPACIO_SUPERIOR_TARJETA = 64;

// 4. Componente principal
export default function ModalObraCreada({
  datos,
  nombreSupervisor,
  onCerrar,
  onIrAlPanelPrincipal,
}: ModalObraCreadaProps) {
  const margenesSeguros = useSafeAreaInsets();

  const filasResumen: FilaResumen[] = [
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaNombre, valor: datos.nombre },
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaCliente, valor: datos.cliente },
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaDireccion, valor: datos.direccion },
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaFechaInicio, valor: datos.fechaInicio },
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaFechaFin, valor: datos.fechaFin },
    { etiqueta: TEXTOS_OBRA_CREADA.etiquetaSupervisor, valor: nombreSupervisor },
  ];

  return (
    <View style={[estilos.superposicion, { top: TAMANOS.encabezadoApp + margenesSeguros.top }]}>
      <BlurView intensity={TAMANOS.desenfoque} tint="light" style={StyleSheet.absoluteFill} />
      <View style={estilos.tarjeta}>
        <Pressable style={estilos.cerrar} onPress={onCerrar} hitSlop={12}>
          <Text style={estilos.textoCerrar}>X</Text>
        </Pressable>
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>{TEXTOS_OBRA_CREADA.titulo}</Text>
          {/* El margen superior replica la línea en blanco que tiene el texto en el diseño */}
          <Text style={estilos.descripcion}>
            {TEXTOS_OBRA_CREADA.descripcionInicio}
            {datos.nombre}
            {TEXTOS_OBRA_CREADA.descripcionFin}
          </Text>
        </View>
        <View style={estilos.resumen}>
          {filasResumen.map((fila) => (
            <View key={fila.etiqueta}>
              <Text style={estilos.etiquetaResumen}>{fila.etiqueta}</Text>
              <Text style={estilos.valorResumen}>{fila.valor}</Text>
            </View>
          ))}
        </View>
        <BotonPrincipal
          etiqueta={TEXTOS_OBRA_CREADA.etiquetaBoton}
          onPresionar={onIrAlPanelPrincipal}
          estilo={estilos.boton}
        />
        <Text style={estilos.nota}>{TEXTOS_OBRA_CREADA.nota}</Text>
      </View>
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  superposicion: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: ESPACIO_SUPERIOR_TARJETA,
    paddingHorizontal: 23,
    backgroundColor: COLORES.superposicion,
    zIndex: 3,
  },
  tarjeta: {
    paddingTop: 38,
    paddingHorizontal: 12,
    paddingBottom: 18,
    backgroundColor: COLORES.superficie,
    borderWidth: 1,
    borderColor: COLORES.bordeModal,
    borderRadius: RADIOS.modal,
    ...SOMBRAS.modal,
  },
  cerrar: {
    position: 'absolute',
    top: 15,
    right: 12,
  },
  textoCerrar: {
    ...TIPOGRAFIA.leyenda,
    color: COLORES.texto,
  },
  encabezado: {
    gap: 8,
  },
  titulo: {
    width: 310,
    ...TIPOGRAFIA.titulo2,
    textAlign: 'center',
    color: COLORES.texto,
  },
  descripcion: {
    marginTop: 21,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
  resumen: {
    marginTop: 26,
    marginHorizontal: 15,
  },
  etiquetaResumen: {
    ...TIPOGRAFIA.etiquetaResumen,
    color: COLORES.textoTenue,
  },
  valorResumen: {
    ...TIPOGRAFIA.valorResumen,
    color: COLORES.texto,
  },
  boton: {
    marginTop: 3,
  },
  nota: {
    marginTop: 37,
    ...TIPOGRAFIA.leyenda,
    color: COLORES.textoSutil,
  },
});