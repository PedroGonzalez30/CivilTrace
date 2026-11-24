/**
 * @archivo PilaAsistenciaSupervisor.tsx
 * @proyecto Civil Trace
 * @descripcion Pila de la pestaña "Asistencia" del supervisor: escoger obra, leer QR, confirmar,
 *   horario, calendario y rechazados.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarcadorPantalla from '@/componentes/MarcadorPantalla';
import { COLORES } from '@/constantes/colores';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaAsistenciaSupervisor } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PilaAsistenciaSupervisorProps {
  sesion: SesionAutenticacion;
}

// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaAsistenciaSupervisor>();

// 4. Componente principal
export default function PilaAsistenciaSupervisor({ sesion }: PilaAsistenciaSupervisorProps) {
  return (
    <Pila.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pila.Screen name="EscogerObra">
        {() => (
          <MarcadorPantalla
            titulo="Asistencia"
            mensaje={`Hola, ${sesion.usuario.nombre}. Aquí pasarás asistencia.`}
          />
        )}
      </Pila.Screen>
    </Pila.Navigator>
  );
}
