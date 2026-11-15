/**
 * @archivo navegacion.ts
 * @proyecto Civil Trace
 * @descripcion Parámetros de cada pila y barra de navegación de la aplicación.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// React Navigation exige "type" (no "interface") para sus listas de parámetros.
export type ParametrosPilaInicio = {
  Obras: undefined;
  ObraDetalle: { idObra: string };
};

export type ParametrosPestanasPrincipales = {
  Inicio: NavigatorScreenParams<ParametrosPilaInicio> | undefined;
  Personal: undefined;
  Cuenta: undefined;
};

export type ParametrosPilaRaiz = {
  InicioSesion: undefined;
  Registro: undefined;
  Principal: undefined;
};
