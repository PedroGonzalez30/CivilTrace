/**
 * @archivo PestanasSupervisor.tsx
 * @proyecto Civil Trace
 * @descripcion Barra inferior "Inicio / Asistencia / Cuenta" del supervisor, con el azul del Figma.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.1.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor, CP09–CP15
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 *   24/11/2026 - Emilio Manuel Esquivel - Inicio muestra sus obras y actividades (feature 003)
 */

// 1. Importaciones
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';

import NavegacionInferior from '@/componentes/NavegacionInferior';
import { COLORES } from '@/constantes/colores';
import { COLORES_ASISTENCIA } from '@/constantes/textosAsistencia';
import PilaAsistenciaSupervisor from '@/navegacion/PilaAsistenciaSupervisor';
import PilaTrabajoSupervisor from '@/navegacion/PilaTrabajoSupervisor';
import PantallaMiPerfil from '@/pantallas/comunes/PantallaMiPerfil';
import { iniciarSincronizacionAutomatica } from '@/servicios/local/servicioSincronizacionAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPestanasSupervisor } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PestanasSupervisorProps {
  sesion: SesionAutenticacion;
  onCerrarSesion: () => void;
}

// 3. Constantes del módulo
const Pestana = createBottomTabNavigator<ParametrosPestanasSupervisor>();

// 4. Componente principal
export default function PestanasSupervisor({ sesion, onCerrarSesion }: PestanasSupervisorProps) {
  // Envía los escaneos pendientes al volver la red o la app al frente (RNF-07). Se reinicia
  // cuando cambia el token para usar siempre la sesión vigente.
  useEffect(() => iniciarSincronizacionAutomatica(sesion), [sesion]);

  return (
    <Pestana.Navigator
      tabBar={(propiedades) => (
        <NavegacionInferior {...propiedades} colorActivo={COLORES_ASISTENCIA.azul} />
      )}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pestana.Screen name="Inicio">
        {() => <PilaTrabajoSupervisor sesion={sesion} />}
      </Pestana.Screen>
      <Pestana.Screen name="Asistencia">
        {() => <PilaAsistenciaSupervisor sesion={sesion} />}
      </Pestana.Screen>
      <Pestana.Screen name="Cuenta">
        {() => <PantallaMiPerfil sesion={sesion} onCerrarSesion={onCerrarSesion} />}
      </Pestana.Screen>
    </Pestana.Navigator>
  );
}
