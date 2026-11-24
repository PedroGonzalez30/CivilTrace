/**
 * @archivo PestanasTrabajador.tsx
 * @proyecto Civil Trace
 * @descripcion Barra inferior "Trabajo / Mi asistencia / Cuenta" del trabajador, con el azul del Figma.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MarcadorPantalla from '@/componentes/MarcadorPantalla';
import NavegacionInferior from '@/componentes/NavegacionInferior';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import PilaMiAsistencia from '@/navegacion/PilaMiAsistencia';
import PantallaMiPerfil from '@/pantallas/comunes/PantallaMiPerfil';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPestanasTrabajador } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PestanasTrabajadorProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

// 3. Constantes del módulo
const Pestana = createBottomTabNavigator<ParametrosPestanasTrabajador>();

// 4. Componente principal
export default function PestanasTrabajador({ sesion, onCerrarSesion }: PestanasTrabajadorProps) {
  return (
    <Pestana.Navigator
      tabBar={(propiedades) => (
        <NavegacionInferior {...propiedades} colorActivo={COLORES_ASISTENCIA.azul} />
      )}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pestana.Screen name="Trabajo">
        {() => (
          <MarcadorPantalla titulo="Trabajo" mensaje="Tus actividades de hoy aparecerán aquí." />
        )}
      </Pestana.Screen>
      <Pestana.Screen name="MiAsistencia">
        {() => <PilaMiAsistencia sesion={sesion} />}
      </Pestana.Screen>
      <Pestana.Screen name="Cuenta">
        {() => <PantallaMiPerfil sesion={sesion} onCerrarSesion={onCerrarSesion} />}
      </Pestana.Screen>
    </Pestana.Navigator>
  );
}
