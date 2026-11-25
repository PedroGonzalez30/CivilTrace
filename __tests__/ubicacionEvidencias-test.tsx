/**
 * @archivo ubicacionEvidencias-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del feature 007 en la app: ubicación automática al tomar la foto, EXIF de la
 *   galería, referencia escrita sin señal GPS, envío a la API y la ubicación en pantallas y reporte.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-08 Capturar evidencia fotográfica, RF-12 Generar reporte de avance de obra
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 007)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as SelectorImagenes from 'expo-image-picker';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TextoUbicacion from '@/componentes/TextoUbicacion';
import * as clienteApi from '@/conexion/clienteApi';
import PantallaSubirEvidencia from '@/pantallas/comunes/PantallaSubirEvidencia';
import * as actividades from '@/servicios/servicioActividades';
import { construirHtmlReporteObra, type DatosReporteObra } from '@/servicios/servicioReportes';
import type { AvanceActividad } from '@/tipos/actividad';
import {
  describirUbicacion,
  leerUbicacionExif,
  leerUbicacionRespuesta,
} from '@/utilidades/ubicacionEvidencia';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

const FOTO = { uri: 'file:///foto.jpg', mimeType: 'image/jpeg', width: 1, height: 1 };

const AVANCE: AvanceActividad = {
  id: 'av1',
  comentario: '',
  estado: 'APROBADO',
  fechaRegistro: '11/11/2026',
  registradoPor: 'María',
  tieneFoto: true,
  tipo: 'DIARIO',
  observacion: null,
  revisadoPor: null,
  ubicacion: null,
  referenciaUbicacion: null,
};

function pantalla() {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <PantallaSubirEvidencia
        tokenAcceso="tkn"
        idObra="o1"
        idActividad="act1"
        nombreActividad="Poner piso"
        onCancelar={jest.fn()}
        onSubida={jest.fn()}
      />
    </SafeAreaProvider>
  );
}

const presionarSubir = () => fireEvent.press(screen.getAllByText('Subir evidencia').at(-1)!);

// 4. Pruebas
describe('Ubicación de la evidencia en la app (feature 007)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('CP12-A15-APP al tomar la foto registra sola la ubicación del teléfono y la envía', async () => {
    jest
      .mocked(SelectorImagenes.launchCameraAsync)
      .mockResolvedValue({ canceled: false, assets: [FOTO] } as never);
    jest.mocked(Location.getCurrentPositionAsync).mockResolvedValueOnce({
      coords: { latitude: 32.6245, longitude: -115.4523, accuracy: 12.4 },
    } as never);
    const subir = jest.spyOn(actividades, 'subirEvidencia').mockResolvedValue(AVANCE);
    await render(pantalla());

    await fireEvent.press(screen.getByText('Tomar foto'));
    expect(await screen.findByText('32.624500, -115.452300 (± 12 m)')).toBeTruthy();
    // La ubicación no se puede escribir a mano cuando hay GPS.
    expect(screen.queryByLabelText('Referencia de ubicación')).toBeNull();
    await presionarSubir();

    await waitFor(() =>
      expect(subir).toHaveBeenCalledWith(
        'tkn',
        'o1',
        'act1',
        expect.objectContaining({
          ubicacion: { latitud: 32.6245, longitud: -115.4523, precisionMetros: 12.4 },
          referenciaUbicacion: '',
        }),
      ),
    );
  });

  it('CP12-A16-APP sin permiso de ubicación marca "Sin ubicación GPS" y exige la referencia', async () => {
    jest
      .mocked(SelectorImagenes.launchCameraAsync)
      .mockResolvedValue({ canceled: false, assets: [FOTO] } as never);
    jest
      .mocked(Location.getForegroundPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as never);
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as never);
    const subir = jest.spyOn(actividades, 'subirEvidencia').mockResolvedValue(AVANCE);
    await render(pantalla());

    await fireEvent.press(screen.getByText('Tomar foto'));
    expect(await screen.findByText('Sin ubicación GPS')).toBeTruthy();
    await presionarSubir();
    expect(screen.getByText('Sin ubicación GPS: escribe dónde se tomó la foto')).toBeTruthy();
    expect(subir).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Referencia de ubicación'), 'Azotea');
    await presionarSubir();
    await waitFor(() =>
      expect(subir).toHaveBeenCalledWith(
        'tkn',
        'o1',
        'act1',
        expect.objectContaining({ ubicacion: null, referenciaUbicacion: 'Azotea' }),
      ),
    );
  });

  it('CP12-A17-APP una foto de la galería usa las coordenadas guardadas en sus datos EXIF', async () => {
    jest.mocked(SelectorImagenes.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [
        {
          ...FOTO,
          exif: {
            GPSLatitude: 19.432608,
            GPSLatitudeRef: 'N',
            GPSLongitude: 99.133209,
            GPSLongitudeRef: 'W',
          },
        },
      ],
    } as never);
    await render(pantalla());

    await fireEvent.press(screen.getByText('Galería'));
    expect(await screen.findByText('19.432608, -99.133209')).toBeTruthy();
    expect(SelectorImagenes.launchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({ exif: true }),
    );
  });

  it('CP12-A18-APP sin GPS manda la referencia escrita codificada a la API', async () => {
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      avance: {
        ...AVANCE,
        fechaRegistro: '2026-11-11T18:00:00.000Z',
        referenciaUbicacion: 'Sótano',
      },
    });

    const avance = await actividades.subirEvidencia('tkn', 'o1', 'act1', {
      uri: 'file:///foto.jpg',
      tipoImagen: 'image/jpeg',
      tipo: 'DIARIO',
      comentario: '',
      ubicacion: null,
      referenciaUbicacion: ' Sótano ',
    });

    expect(llamar).toHaveBeenCalledWith(
      '/obras/o1/actividades/act1/avances',
      expect.objectContaining({
        encabezados: expect.objectContaining({ 'x-referencia-ubicacion': 'S%C3%B3tano' }),
      }),
    );
    expect(avance).toMatchObject({ ubicacion: null, referenciaUbicacion: 'Sótano' });
  });

  it('CP12-A19-APP lee y describe la ubicación que manda la API', () => {
    expect(
      leerUbicacionRespuesta({
        ubicacion: { latitud: 32.6, longitud: -115.4, precisionMetros: 5 },
      }),
    ).toEqual({
      ubicacion: { latitud: 32.6, longitud: -115.4, precisionMetros: 5 },
      referenciaUbicacion: null,
    });
    expect(
      leerUbicacionRespuesta({ ubicacion: { latitud: 200, longitud: 0 } }).ubicacion,
    ).toBeNull();
    expect(describirUbicacion({ ubicacion: null, referenciaUbicacion: 'Azotea' })).toBe(
      'Sin ubicación GPS · Referencia: Azotea',
    );
    expect(describirUbicacion({ ubicacion: null, referenciaUbicacion: null })).toBe(
      'Ubicación no registrada',
    );
  });

  it('CP12-A20-APP los EXIF sin GPS o con 0,0 no cuentan como ubicación', () => {
    expect(leerUbicacionExif(null)).toBeNull();
    expect(leerUbicacionExif({ Make: 'Samsung' })).toBeNull();
    expect(leerUbicacionExif({ GPSLatitude: 0, GPSLongitude: 0 })).toBeNull();
    expect(
      leerUbicacionExif({ GPSLatitude: '33.5', GPSLatitudeRef: 'S', GPSLongitude: '70.6' }),
    ).toEqual({ latitud: -33.5, longitud: 70.6, precisionMetros: null });
  });

  it('CP11-A15-APP la ubicación de una foto abre el mapa', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(
      <TextoUbicacion
        datos={{
          ubicacion: { latitud: 32.6245, longitud: -115.4523, precisionMetros: null },
          referenciaUbicacion: null,
        }}
      />,
    );

    expect(screen.getByText('32.624500, -115.452300')).toBeTruthy();
    await fireEvent.press(screen.getByText('Ver mapa'));
    expect(abrir).toHaveBeenCalledWith(
      'https://www.google.com/maps/search/?api=1&query=32.6245,-115.4523',
    );
  });

  it('CP15-A13-APP el reporte en PDF incluye la ubicación de cada foto', () => {
    const reporte: DatosReporteObra = {
      obra: {
        id: 'o1',
        nombre: 'Casa Pérez',
        resumen: '',
        descripcion: '',
        direccion: 'Calle 1',
        fechaInicio: '01/11/2026',
        fechaFinal: '30/11/2026',
        supervisor: 'María',
        cliente: 'Juan',
      },
      fechaInicioFiltro: '01/11/2026',
      fechaFinFiltro: '30/11/2026',
      actividades: [
        {
          id: 'act1',
          nombre: 'Piso',
          estado: 'ACTIVA',
          fechaEntrega: '20/11/2026',
          fechaTerminada: null,
          responsable: 'Ana',
          supervisor: 'María',
          avances: [
            {
              ...AVANCE,
              ubicacion: { latitud: 32.6245, longitud: -115.4523, precisionMetros: null },
              fotoDataUri: null,
            },
            { ...AVANCE, id: 'av2', referenciaUbicacion: 'Azotea', fotoDataUri: null },
          ],
        },
      ],
    };

    const html = construirHtmlReporteObra(reporte);
    expect(html).toContain('32.624500, -115.452300');
    expect(html).toContain('Sin ubicación GPS · Referencia: Azotea');
  });
});
