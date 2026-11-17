/**
 * @archivo PilaInicio.tsx
 * @proyecto Civil Trace
 * @descripcion Pila de navegación de la pestaña Inicio: lista de obras y detalle de una obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORES } from '@/constantes/colores';
import PantallaDetalleObra from '@/pantallas/dueno/PantallaDetalleObra';
import PantallaPrincipalDueno from '@/pantallas/dueno/PantallaPrincipalDueno';
import { obtenerObras } from '@/simulados/obras';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaInicio } from '@/tipos/navegacion';
import { useCodigosEmpresa } from '@/hooks/useCodigoEmpresa';

// 2. Tipos e interfaces
interface PilaInicioProps {
  sesion: SesionAutenticacion;
}

// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaInicio>();

// 4. Componente principal
export default function PilaInicio({ sesion }: PilaInicioProps) {
  const obras = obtenerObras(sesion.usuario.id);
  // Los códigos solo se piden mientras la pantalla los muestra (empresa sin obras).
  const codigosEmpresa = useCodigosEmpresa(sesion.token, obras.length === 0);

  return (
    <Pila.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORES.pantalla } }}
    >
      <Pila.Screen name="Obras">
        {({ navigation }) => (
          <PantallaPrincipalDueno
            nombreEmpresa={sesion.usuario.empresa}
            obras={obras}
            codigos={codigosEmpresa.codigos}
            cargandoCodigos={codigosEmpresa.cargando}
            errorCodigos={codigosEmpresa.error}
            onReintentarCodigos={codigosEmpresa.reintentar}
            onAbrirObra={(idObra) => navigation.navigate('Obras' === 'Obras' ? 'ObraDetalle' : 'ObraDetalle', { idObra })}
          />)}
      </Pila.Screen>
      <Pila.Screen name="ObraDetalle">
        {({ navigation, route }) => {
          const obra = obras.find((elemento) => elemento.id === route.params.idObra);
          return obra ? <PantallaDetalleObra obra={obra} onRegresar={navigation.goBack} /> : null;
        }}
      </Pila.Screen>
    </Pila.Navigator>
  );
}