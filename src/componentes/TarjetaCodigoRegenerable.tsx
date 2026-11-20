/**
 * @archivo TarjetaCodigoRegenerable.tsx
 * @proyecto Civil Trace
 * @descripcion Tarjeta de un código de acceso con botón para copiarlo y botón para regenerarlo.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';
import { IconoCopiar } from '@/componentes/Iconos';
import { COLORES } from '@/constantes/colores';
import { RADIOS, TAMANOS, TIPOGRAFIA } from '@/constantes/tema';

// 2. Tipos e interfaces
interface TarjetaCodigoRegenerableProps {
  titulo: string;
  descripcion: string;
  codigo: string;
  etiquetaBoton: string;
  onCopiar: () => void;
  onRegenerar: () => void;
}

// 4. Componente principal
export default function TarjetaCodigoRegenerable({
  titulo,
  descripcion,
  codigo,
  etiquetaBoton,
  onCopiar,
  onRegenerar,
}: TarjetaCodigoRegenerableProps) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Copiar ${titulo}`}
          style={estilos.botonCopiar}
          onPress={onCopiar}
        >
          <IconoCopiar />
        </Pressable>
      </View>
      <Text style={estilos.codigo} numberOfLines={1} adjustsFontSizeToFit selectable>
        {codigo}
      </Text>
      <Text style={estilos.descripcion}>{descripcion}</Text>
      <BotonPrincipal
        etiqueta={etiquetaBoton}
        variante="marca"
        estilo={estilos.botonRegenerar}
        onPresionar={onRegenerar}
      />
    </View>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  contenedor: {
    gap: 12,
    padding: 16,
    backgroundColor: COLORES.fondo,
    borderWidth: 2,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.tarjeta,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.texto,
  },
  botonCopiar: {
    width: TAMANOS.mosaico,
    height: TAMANOS.mosaico,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.marca,
    borderRadius: RADIOS.mosaico,
  },
  codigo: {
    ...TIPOGRAFIA.titulo1,
    textAlign: 'center',
    color: COLORES.marca,
  },
  descripcion: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.textoAtenuado,
  },
  botonRegenerar: {
    height: TAMANOS.botonCodigo,
  },
});