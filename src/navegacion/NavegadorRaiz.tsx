/**
 * @archivo NavegadorRaiz.tsx
 * @proyecto Civil Trace
 * @descripcion Navegador principal: muestra el inicio de sesión y el registro, o la app si hay
 * una sesión activa.
 * @autor  Pedro Iván González Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Pestañas por rol para supervisor y trabajador (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORES } from '@/constantes/colores';
import PestanasPrincipales from '@/navegacion/PestanasPrincipales';
import PestanasSupervisor from '@/navegacion/PestanasSupervisor';
import PestanasTrabajador from '@/navegacion/PestanasTrabajador';
import PantallaInicioSesion from '@/pantallas/comunes/PantallaInicioSesion';
import PantallaRegistro from '@/pantallas/comunes/PantallaRegistro';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaRaiz } from '@/tipos/navegacion';

// 2. Tipos e interfaces
interface NavegadorRaizProps {
  sesion: SesionAutenticacion | null;
  onIniciarSesion: (sesion: SesionAutenticacion) => void;
  onCerrarSesion: () => void;
  onNombreEmpresaCambiado: (nombre: string) => void;
}
// 3. Constantes del módulo
const Pila = createNativeStackNavigator<ParametrosPilaRaiz>();

// 4. Componente principal
export default function NavegadorRaiz({
  sesion,
  onIniciarSesion,
  onCerrarSesion,
  onNombreEmpresaCambiado,
}: NavegadorRaizProps) {
  return (
    <NavigationContainer>
      <Pila.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORES.fondo },
        }}
      >
        {sesion ? (
          <Pila.Screen name="Principal">
            {() =>
              sesion.usuario.rol === RolUsuario.DUENO ? (
                <PestanasPrincipales
                  sesion={sesion}
                  onCerrarSesion={onCerrarSesion}
                  onNombreEmpresaCambiado={onNombreEmpresaCambiado}
                />
              ) : sesion.usuario.rol === RolUsuario.SUPERVISOR ? (
                <PestanasSupervisor sesion={sesion} onCerrarSesion={onCerrarSesion} />
              ) : (
                <PestanasTrabajador sesion={sesion} onCerrarSesion={onCerrarSesion} />
              )
            }
          </Pila.Screen>
        ) : (
          <>
            <Pila.Screen name="InicioSesion">
              {({ navigation }) => (
                <PantallaInicioSesion
                  onInicioExitoso={onIniciarSesion}
                  onIrARegistro={() => navigation.navigate('Registro')}
                />
              )}
            </Pila.Screen>
            <Pila.Screen name="Registro">
              {() => <PantallaRegistro onRegistroExitoso={onIniciarSesion} />}
            </Pila.Screen>
          </>
        )}
      </Pila.Navigator>
    </NavigationContainer>
  );
}
