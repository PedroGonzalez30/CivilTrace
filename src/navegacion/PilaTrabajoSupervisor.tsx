/**
 * @archivo PilaTrabajoSupervisor.tsx
 * @proyecto Civil Trace
 * @descripcion Pestaña Inicio del supervisor (feature 003): sus obras, el detalle, las
 *   actividades, agregar actividad, avances, revisión de evidencias, subir evidencia y reportes.
 *   Reusa las pantallas del dueño para detalle de obra, actividades y reportes.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos CP09–CP15 (obras, actividades, evidencias, revisión y reporte), D-10, D-23
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 003)
 */

// 1. Importaciones
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SeccionCodigoTrabajadores from '@/componentes/SeccionCodigoTrabajadores';
import { COLORES } from '@/constantes/colores';
import { useObras } from '@/hooks/useObras';
import PantallaSubirEvidencia from '@/pantallas/comunes/PantallaSubirEvidencia';
import PantallaActividadesObra from '@/pantallas/dueno/PantallaActividadesObra';
import PantallaDetalleActividad from '@/pantallas/dueno/PantallaDetalleActividad';
import PantallaDetalleObra from '@/pantallas/dueno/PantallaDetalleObra';
import PantallaReportesObra from '@/pantallas/dueno/PantallaReportesObra';
import PantallaAgregarActividad from '@/pantallas/supervisor/PantallaAgregarActividad';
import PantallaEscogerObra from '@/pantallas/supervisor/PantallaEscogerObra';
import PantallaRevisarAvance from '@/pantallas/supervisor/PantallaRevisarAvance';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaTrabajoSupervisor } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface PilaTrabajoSupervisorProps {
  sesion: SesionAutenticacion;
}

// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaTrabajoSupervisor>();
const SUBTITULO_INICIO = 'Gestiona tus obras, equipos y seguimiento desde un solo lugar.';

// 4. Componente principal
export default function PilaTrabajoSupervisor({ sesion }: PilaTrabajoSupervisorProps) {
  // Detalle y reportes usan los datos completos de la obra (cliente, supervisor) de GET /obras.
  const { obras } = useObras(sesion.token);

  return (
    <Pila.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pila.Screen name="Obras">
        {({ navigation }) => (
          <PantallaEscogerObra
            sesion={sesion}
            subtitulo={SUBTITULO_INICIO}
            onElegirObra={(obra) => navigation.navigate('ObraDetalle', { idObra: obra.id })}
            pie={<SeccionCodigoTrabajadores tokenAcceso={sesion.token} />}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="ObraDetalle">
        {({ navigation, route }) => {
          const obra = obras?.find((elemento) => elemento.id === route.params.idObra);
          return obra ? (
            <PantallaDetalleObra
              obra={obra}
              onRegresar={navigation.goBack}
              onAbrirActividades={(idObra) =>
                navigation.navigate('ActividadesObra', { idObra, obraNombre: obra.nombre })
              }
              onAbrirReportes={(idObra) => navigation.navigate('ReportesObra', { idObra })}
            />
          ) : null;
        }}
      </Pila.Screen>
      <Pila.Screen name="ReportesObra">
        {({ navigation, route }) => {
          const obra = obras?.find((elemento) => elemento.id === route.params.idObra);
          return obra ? (
            <PantallaReportesObra
              tokenAcceso={sesion.token}
              obra={obra}
              onRegresar={navigation.goBack}
            />
          ) : null;
        }}
      </Pila.Screen>
      <Pila.Screen name="ActividadesObra">
        {({ navigation, route }) => (
          <PantallaActividadesObra
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            onRegresar={navigation.goBack}
            onAbrirActividad={(idActividad) =>
              navigation.navigate('DetalleActividad', { idObra: route.params.idObra, idActividad })
            }
            onAgregar={() => navigation.navigate('AgregarActividad', route.params)}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="AgregarActividad">
        {({ navigation, route }) => (
          <PantallaAgregarActividad
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            obraNombre={route.params.obraNombre}
            onRegresar={navigation.goBack}
            onAgregada={navigation.goBack}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="DetalleActividad">
        {({ navigation, route }) => (
          <PantallaDetalleActividad
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            idActividad={route.params.idActividad}
            onRegresar={navigation.goBack}
            onSubirEvidencia={(nombreActividad) =>
              navigation.navigate('SubirEvidencia', { ...route.params, nombreActividad })
            }
            onRevisarAvance={(idAvance) =>
              navigation.navigate('RevisarAvance', { ...route.params, idAvance })
            }
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="RevisarAvance">
        {({ navigation, route }) => (
          <PantallaRevisarAvance
            tokenAcceso={sesion.token}
            idObra={route.params.idObra}
            idActividad={route.params.idActividad}
            idAvance={route.params.idAvance}
            onRegresar={navigation.goBack}
            onTerminar={navigation.goBack}
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
            onSubida={navigation.goBack}
          />
        )}
      </Pila.Screen>
    </Pila.Navigator>
  );
}
