/**
 * @archivo PestanasPrincipales.tsx
 * @proyecto Civil Trace
 * @descripcion Barra de pestañas principal (Inicio, Personal y Cuenta) con navegación inferior.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

// 1. Importaciones
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { NavegacionInferior } from '@/componentes';
import { COLORES } from '@/constantes/colores';
import PilaInicio from '@/navegacion/PilaInicio';
import PantallaMiPerfil from '@/pantallas/comunes/PantallaMiPerfil';
import PantallaPersonal from '@/pantallas/dueno/PantallaPersonal';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPestanasPrincipales } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PestanasPrincipalesProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

// 3. Constantes del módulo
const Pestana = createBottomTabNavigator<ParametrosPestanasPrincipales>();

// 4. Componente principal
export default function PestanasPrincipales({ sesion, onCerrarSesion }: PestanasPrincipalesProps) {
  return (
    <Pestana.Navigator
      tabBar={(propiedades) => <NavegacionInferior {...propiedades} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pestana.Screen name="Inicio">{() => <PilaInicio sesion={sesion} />}</Pestana.Screen>
      <Pestana.Screen name="Personal">
        {() => <PantallaPersonal tokenAcceso={sesion.token} />}
      </Pestana.Screen>      
      <Pestana.Screen name="Cuenta">
        {() => <PantallaMiPerfil sesion={sesion} onCerrarSesion={onCerrarSesion} />}
      </Pestana.Screen>
    </Pestana.Navigator>
  );
}