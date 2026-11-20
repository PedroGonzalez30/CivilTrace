/**
 * @archivo PilaInicio.tsx
 * @proyecto Civil Trace
 * @descripcion Pila de navegación de la pestaña Inicio: lista de obras, detalle, actividades,
 *              reportes y nueva obra.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.3.0
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { EncabezadoApp } from '@/componentes';
import { COLORES } from '@/constantes/colores';
import { TIPOGRAFIA } from '@/constantes/tema';
import { useCodigosEmpresa } from '@/hooks/useCodigoEmpresa';
import { useObras } from '@/hooks/useObras';
import PantallaActividadesObra from '@/pantallas/dueno/PantallaActividadesObra';
import PantallaAgregarObra from '@/pantallas/dueno/PantallaAgregarObra';
import PantallaCodigosAcceso from '@/pantallas/dueno/PantallaCodigoAcceso';
import PantallaDatosEmpresa from '@/pantallas/dueno/PantallaDatosEmpresa';
import PantallaDetalleActividad from '@/pantallas/dueno/PantallaDetalleActividad';
import PantallaDetalleObra from '@/pantallas/dueno/PantallaDetalleObra';
import PantallaPrincipalDueno from '@/pantallas/dueno/PantallaPrincipalDueno';
import PantallaReportesObra from '@/pantallas/dueno/PantallaReportesObra';
import { crearObra } from '@/servicios/servicioObras';
import type { SesionAutenticacion } from '@/tipos/autenticacion';
import type { ParametrosPilaInicio } from '@/tipos/navegacion';

interface PilaInicioProps {
  sesion: SesionAutenticacion;
  onNombreEmpresaCambiado: (nombre: string) => void;
}

const Pila = createNativeStackNavigator<ParametrosPilaInicio>();

export default function PilaInicio({ sesion, onNombreEmpresaCambiado }: PilaInicioProps) {
  const consultaObras = useObras(sesion.token);
  const obras = consultaObras.obras;
  const codigosEmpresa = useCodigosEmpresa(sesion.token, obras !== null && obras.length === 0);

  if (obras === null) {
    return (
      <View style={estilos.contenedor}>
        <EncabezadoApp />
        <View style={estilos.centro}>
          {consultaObras.error ? (
            <>
              <Text style={estilos.error}>{consultaObras.error}</Text>
              <Pressable onPress={consultaObras.recargar}>
                <Text style={estilos.reintentar}>Reintentar</Text>
              </Pressable>
            </>
          ) : (
            <ActivityIndicator color={COLORES.marca} />
          )}
        </View>
      </View>
    );
  }

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
            onAbrirObra={(idObra) => navigation.navigate('ObraDetalle', { idObra })}
            onNuevaObra={() => navigation.navigate('NuevaObra')}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="ObraDetalle">
        {({ navigation, route }) => {
          const obra = obras.find((elemento) => elemento.id === route.params.idObra);
          return obra ? (
            <PantallaDetalleObra
              obra={obra}
              onRegresar={navigation.goBack}
              onAbrirActividades={(idObra) =>
                navigation.navigate('ActividadesObra', { idObra })
              }
              onAbrirReportes={(idObra) =>
                navigation.navigate('ReportesObra', { idObra })
              }
            />
          ) : null;
        }}
      </Pila.Screen>
      <Pila.Screen name="ReportesObra">
        {({ navigation, route }) => {
          const obra = obras.find((elemento) => elemento.id === route.params.idObra);
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
              navigation.navigate('DetalleActividad', {
                idObra: route.params.idObra,
                idActividad,
              })
            }
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
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="NuevaObra">
        {({ navigation }) => (
          <PantallaAgregarObra
            tokenAcceso={sesion.token}
            onAgregar={async (datos) => {
              await crearObra(sesion.token, datos);
              consultaObras.recargar();
            }}
            onIrAlPanelPrincipal={() => navigation.popToTop()}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="CodigosAcceso">
        {() => (
          <PantallaCodigosAcceso
            tokenAcceso={sesion.token}
            onCodigosCambiados={codigosEmpresa.reintentar}
          />
        )}
      </Pila.Screen>
      <Pila.Screen name="DatosEmpresa">
        {({ navigation }) => (
          <PantallaDatosEmpresa
            tokenAcceso={sesion.token}
            onAceptar={() => navigation.popToTop()}
            onNombreCambiado={onNombreEmpresaCambiado}
          />
        )}
      </Pila.Screen>
    </Pila.Navigator>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.pantalla,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  error: {
    ...TIPOGRAFIA.leyenda,
    textAlign: 'center',
    color: COLORES.error,
  },
  reintentar: {
    ...TIPOGRAFIA.etiqueta,
    color: COLORES.marca,
  },
});
