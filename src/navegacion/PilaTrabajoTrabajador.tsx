/**
 * @archivo PilaTrabajoTrabajador.tsx
 * @proyecto Civil Trace
 * @descripcion Pestaña Trabajo del trabajador (feature 003): sus actividades, el detalle de cada
 *   una y la pantalla para subir evidencia fotográfica.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP11 Consultar actividades, CP12 Capturar evidencia fotográfica, D-10
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORES } from '@/constantes/colores';
import PantallaSubirEvidencia from '@/pantallas/comunes/PantallaSubirEvidencia';
import PantallaActividadTrabajador from '@/pantallas/trabajador/PantallaActividadTrabajador';
import PantallaMisActividades from '@/pantallas/trabajador/PantallaMisActividades';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaTrabajoTrabajador } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PilaTrabajoTrabajadorProps {
  sesion: SesionAutenticacion;
}

// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaTrabajoTrabajador>();

// 4. Componente principal
export default function PilaTrabajoTrabajador({ sesion }: PilaTrabajoTrabajadorProps) {
  return (
    <Pila.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pila.Screen name="MisActividades">
        {({ navigation }) => (
          <PantallaMisActividades
            sesion={sesion}
            onAbrirActividad={(actividad) =>
              navigation.navigate('Actividad', {
                idObra: actividad.obraId,
                idActividad: actividad.id,
              })
            }
            onSubirEvidencia={(actividad) =>
              navigation.navigate('SubirEvidencia', {
                idObra: actividad.obraId,
                idActividad: actividad.id,
                nombreActividad: actividad.nombre,
              })
            }
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="Actividad">
        {({ navigation, route }) => (
          <PantallaActividadTrabajador
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            idActividad={route.params.idActividad}
            evidenciaAgregada={route.params.evidenciaAgregada}
            onRegresar={navigation.goBack}
            onSubirEvidencia={(nombreActividad) =>
              navigation.navigate('SubirEvidencia', {
                idObra: route.params.idObra,
                idActividad: route.params.idActividad,
                nombreActividad,
              })
            }
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="SubirEvidencia">
        {({ navigation, route }) => (
          <PantallaSubirEvidencia
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            idActividad={route.params.idActividad}
            nombreActividad={route.params.nombreActividad}
            onCancelar={navigation.goBack}
            // Al subir se ve la actividad con el aviso "Evidencia agregada correctamente".
            onSubida={() =>
              navigation.popTo('Actividad', {
                idObra: route.params.idObra,
                idActividad: route.params.idActividad,
                evidenciaAgregada: true,
              })
            }
          />
        )}
      </Pila.Screen>
    </Pila.Navigator>
  );
}
