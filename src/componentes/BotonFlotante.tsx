/**
 * @archivo BotonFlotante.tsx
 * @proyecto Civil Trace
 * @descripcion Botón redondo con "+" en la esquina inferior derecha (Figma: agregar actividad y
 *   subir evidencia del supervisor).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos Feature 003 (SUP_ACTIVIDADESOBRA, SUP_VERACTIVIDADOBRAActiva)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { Pressable, StyleSheet } from 'react-native';

import { IconoMas } from '@/componentes/Iconos';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import { RADIOS, SOMBRAS, TAMANOS } from '@/constantes/tema';

// 2. Tipos e interfaces
interface BotonFlotanteProps {
  etiqueta: string;
  onPresionar: () => void;
}

// 3. Constantes del módulo
const TAMANO_ICONO = 24;

// 4. Componente principal
export default function BotonFlotante({ etiqueta, onPresionar }: BotonFlotanteProps) {
  return (
    <Pressable
      style={estilos.boton}
      onPress={onPresionar}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
    >
      <IconoMas tamano={TAMANO_ICONO} />
    </Pressable>
  );
}

// 5. Estilos
const estilos = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: 24,
    bottom: 19,
    width: TAMANOS.botonFlotante,
    height: TAMANOS.botonFlotante,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIOS.pildora,
    backgroundColor: COLORES_ASISTENCIA.azul,
    ...SOMBRAS.botonFlotante,
  },
});
