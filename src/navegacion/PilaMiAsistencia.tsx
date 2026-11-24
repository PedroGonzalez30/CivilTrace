/**
 * @archivo PilaMiAsistencia.tsx
 * @proyecto Civil Trace
 * @descripcion Pila de la pestaña "Mi asistencia" del trabajador: su QR y su historial.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, RF-58 Mostrar calendario de asistencia
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarcadorPantalla from '@/componentes/MarcadorPantalla';
import { COLORES } from '@/constantes/colores';
import PantallaMiAsistencia from '@/pantallas/trabajador/PantallaMiAsistencia';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaMiAsistencia } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PilaMiAsistenciaProps {
  sesion: SesionAutenticacion;
}

// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaMiAsistencia>();

// 4. Componente principal
export default function PilaMiAsistencia({ sesion }: PilaMiAsistenciaProps) {
  return (
    <Pila.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pila.Screen name="MiAsistencia">
        {({ navigation }) => (
          <PantallaMiAsistencia
            sesion={sesion}
            onVerHistorial={() => navigation.navigate('Historial')}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="Historial">
        {() => <MarcadorPantalla titulo="Asistencia" mensaje="Historial del mes" />}
      </Pila.Screen>
    </Pila.Navigator>
  );
}
