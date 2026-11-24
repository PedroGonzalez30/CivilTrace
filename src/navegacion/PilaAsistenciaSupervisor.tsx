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
import PantallaConfirmarQr from '@/pantallas/supervisor/PantallaConfirmarQr';
import PantallaEscogerObra from '@/pantallas/supervisor/PantallaEscogerObra';
import PantallaLeerQr from '@/pantallas/supervisor/PantallaLeerQr';
import PantallaRechazados from '@/pantallas/supervisor/PantallaRechazados';
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
        {({ navigation }) => (
          <PantallaEscogerObra
            sesion={sesion}
            onElegirObra={(obra) =>
              navigation.navigate('LeerQr', { obraId: obra.id, obraNombre: obra.nombre })
            }
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="LeerQr">
        {({ navigation, route }) => (
          <PantallaLeerQr
            sesion={sesion}
            obraId={route.params.obraId}
            obraNombre={route.params.obraNombre}
            onEscaneado={(codigoQr) =>
              navigation.navigate('ConfirmarQr', { ...route.params, codigoQr })
            }
            onEditarHorario={() => navigation.navigate('HorarioObra', route.params)}
            onVerRechazados={() => navigation.navigate('Rechazados', route.params)}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="ConfirmarQr" options={{ presentation: 'modal' }}>
        {({ navigation, route }) => (
          <PantallaConfirmarQr
            sesion={sesion}
            obraId={route.params.obraId}
            codigoQr={route.params.codigoQr}
            onTerminar={() => navigation.goBack()}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="HorarioObra">
        {() => <MarcadorPantalla titulo="Horario de la obra" mensaje="Próximamente" />}
      </Pila.Screen>
      <Pila.Screen name="Rechazados">
        {({ navigation, route }) => (
          <PantallaRechazados
            sesion={sesion}
            obraId={route.params.obraId}
            onRegresar={() => navigation.goBack()}
          />
        )}
      </Pila.Screen>
    </Pila.Navigator>
  );
}
