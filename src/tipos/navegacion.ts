/**
 * @archivo navegacion.ts
 * @proyecto Civil Trace
 * @descripcion Parámetros de cada pila y barra de navegación de la aplicación.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 20/11/2026
 * @version 1.3.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Pestañas y pilas de supervisor y trabajador (feature 001)
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

// React Navigation exige "type" (no "interface") para sus listas de parámetros.
export type ParametrosPilaInicio = {
  Obras: undefined;
  ObraDetalle: { idObra: string };
  ActividadesObra: { idObra: string };
  DetalleActividad: { idObra: string; idActividad: string };
  ReportesObra: { idObra: string };
  NuevaObra: undefined;
  CodigosAcceso: undefined;
  DatosEmpresa: undefined;
};

export type ParametrosPestanasPrincipales = {
  Inicio: NavigatorScreenParams<ParametrosPilaInicio> | undefined;
  Personal: undefined;
  Cuenta: undefined;
};

export type ParametrosPilaRaiz = {
  InicioSesion: undefined;
  Registro: undefined;
  Principal: NavigatorScreenParams<ParametrosPestanasPrincipales> | undefined;
};

// Supervisor (feature 001: asistencia).
export type ParametrosPilaAsistenciaSupervisor = {
  EscogerObra: undefined;
  LeerQr: { obraId: string; obraNombre: string };
  ConfirmarQr: { obraId: string; obraNombre: string; codigoQr: string };
  HorarioObra: { obraId: string; obraNombre: string };
  CalendarioTrabajador: { trabajadorId: string; obraId: string; obraNombre: string };
  Rechazados: { obraId: string; obraNombre: string };
};

export type ParametrosPestanasSupervisor = {
  Inicio: undefined;
  Asistencia: NavigatorScreenParams<ParametrosPilaAsistenciaSupervisor> | undefined;
  Cuenta: undefined;
};

// Trabajador (feature 001: asistencia).
export type ParametrosPilaMiAsistencia = {
  MiAsistencia: undefined;
  Historial: undefined;
};

export type ParametrosPestanasTrabajador = {
  Trabajo: undefined;
  MiAsistencia: NavigatorScreenParams<ParametrosPilaMiAsistencia> | undefined;
  Cuenta: undefined;
};
