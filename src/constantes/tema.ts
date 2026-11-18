/**
 * @archivo tema.ts
 * @proyecto Civil Trace
 * @descripcion Fuentes, tipografía, radios, tamaños y sombras compartidos por los componentes.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 15/11/2026
 * @version 1.0.0
 */

import type { TextStyle } from 'react-native';

import { COLORES } from '@/constantes/colores';

export const FUENTES = {
  regular: 'Poppins_400Regular',
  seminegrita: 'Poppins_600SemiBold',
  negrita: 'Poppins_700Bold',
  media: 'Poppins_500Medium',
};

export const TIPOGRAFIA = {
  marca: { fontFamily: FUENTES.negrita, fontSize: 24, lineHeight: 36 },
  titulo1: { fontFamily: FUENTES.negrita, fontSize: 28, lineHeight: 42 },
  titulo2: { fontFamily: FUENTES.negrita, fontSize: 24, lineHeight: 36 },
  titulo3: { fontFamily: FUENTES.negrita, fontSize: 18, lineHeight: 27 },
  titulo4: { fontFamily: FUENTES.negrita, fontSize: 20, lineHeight: 30 },
  subtitulo: { fontFamily: FUENTES.regular, fontSize: 16, lineHeight: 24 },
  leyenda: { fontFamily: FUENTES.regular, fontSize: 14, lineHeight: 21 },
  etiqueta: { fontFamily: FUENTES.seminegrita, fontSize: 14, lineHeight: 21 },
  enlace: { fontFamily: FUENTES.seminegrita, fontSize: 14, lineHeight: 21 },
  entrada: { fontFamily: FUENTES.regular, fontSize: 16, lineHeight: 24 },
  boton: { fontFamily: FUENTES.seminegrita, fontSize: 16, lineHeight: 24 },
  tituloPortada: { fontFamily: FUENTES.negrita, fontSize: 26, lineHeight: 39 },
  etiquetaCampo: { fontFamily: FUENTES.media, fontSize: 13, lineHeight: 20, letterSpacing: 0.26 },
  valorCampo: { fontFamily: FUENTES.media, fontSize: 16, lineHeight: 24 },
  etiquetaNavegacion: { fontFamily: FUENTES.media, fontSize: 12, lineHeight: 18 },
  etiquetaNavegacionActiva: { fontFamily: FUENTES.seminegrita, fontSize: 12, lineHeight: 18 },
  botonPequeno: { fontFamily: FUENTES.seminegrita, fontSize: 14, lineHeight: 21 },
  etiquetaResumen: { fontFamily: FUENTES.media, fontSize: 13, lineHeight: 18 },
  valorResumen: { fontFamily: FUENTES.seminegrita, fontSize: 15, lineHeight: 21 },
  subtituloPantalla: {
    fontFamily: FUENTES.regular,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.15,
  },
} satisfies Record<string, TextStyle>;

export const RADIOS = {
  acento: 2,
  entrada: 14,
  modal: 16,
  tarjeta: 20,
  encabezado: 24,
  pildora: 999,
  accion: 12,
  mosaico: 8,
  casilla: 6,
};

export const TAMANOS = {
  encabezadoApp: 96,
  altoBarraAcento: 56,
  anchoBarraAcento: 4,
  entrada: 52,
  entradaModal: 48,
  boton: 56,
  opcion: 48,
  flecha: 20,
  tarjetaInicioSesion: 278,
  tarjetaRegistro: 430,
  encabezadoRegistroSuperior: 49,
  tarjetaRegistroSuperior: 31,
  botonRegistroSuperior: 39,
  sangriaTarjeta: 2,
  modalSuperior: 299,
  navegacionInferior: 74,
  botonFlotante: 56,
  botonRegresar: 40,
  mosaico: 32,
  mosaicoPequeno: 28,
  anchoMenu: 184,
  menuSuperior: 31,
  menuSeparacion: 21,
  menuInferior: 39,
  opcionMenu: 67,
  desenfoque: 20,
  entradaMultilinea: 72,
  casilla: 22,
  listaSeleccion: 260,
};

export const SOMBRAS = {
  tarjeta: {
    shadowColor: COLORES.texto,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  encabezado: {
    shadowColor: COLORES.primario,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  boton: {
    shadowColor: COLORES.primario,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
  modal: {
    shadowColor: COLORES.negro,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  desplegable: {
    shadowColor: COLORES.texto,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  encabezadoMarca: {
    shadowColor: COLORES.marca,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  botonMarca: {
    shadowColor: COLORES.marca,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
  botonFlotante: {
    shadowColor: COLORES.marca,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 11,
    elevation: 8,
  },
  navegacion: {
    shadowColor: COLORES.texto,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 12,
  },
  botonRegresar: {
    shadowColor: COLORES.texto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 7,
    elevation: 4,
  },
  opcion: {
    shadowColor: COLORES.negro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
};
