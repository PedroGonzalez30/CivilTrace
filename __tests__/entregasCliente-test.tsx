/**
 * @archivo entregasCliente-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de la parte de la app del feature 004: enviar entregas al cliente por rango,
 *   listarlas con su estado, descargar reporte y acta, reenviar el enlace del portal y el aviso de
 *   actividades aceptadas por el cliente.
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos RF-13 Enviar entrega al cliente, RF-16 Generar acta de entrega-recepción,
 *   RF-17 Bloquear entrega aceptada, RF-65 Enviar enlace del portal al cliente
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 004)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ReactElement } from 'react';
import { Alert, type AlertButton } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SeccionEntregas from '@/componentes/SeccionEntregas';
import * as clienteApi from '@/conexion/clienteApi';
import PantallaDetalleObra from '@/pantallas/dueno/PantallaDetalleObra';
import PantallaReportesObra from '@/pantallas/dueno/PantallaReportesObra';
import * as servicioEntregas from '@/servicios/servicioEntregas';
import * as servicioObras from '@/servicios/servicioObras';
import * as servicioReportes from '@/servicios/servicioReportes';
import type { Obra } from '@/tipos/obra';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

const OBRA: Obra = {
  id: 'obra1',
  nombre: 'Hospital',
  resumen: 'Hospital general',
  descripcion: 'Construcción del hospital general',
  direccion: 'Av. Reforma',
  fechaInicio: '01/11/2026',
  fechaFinal: '30/12/2026',
  supervisor: 'María Castro',
  cliente: 'Secretaría de Salud',
};

const ENTREGA_API = {
  id: 'ent1',
  estado: 'ACEPTADA',
  fechaInicio: '2026-11-01',
  fechaFin: '2026-11-05',
  enviadaEn: '2026-11-05T18:00:00.000Z',
  enviadaPor: 'María Castro',
  actividades: 2,
  fotos: 3,
  nombreCliente: 'María Fernanda López Ruiz',
  observaciones: null,
  respondidaEn: '2026-11-06T18:00:00.000Z',
  tieneActa: true,
};

// Toca el botón con ese texto en la última alerta mostrada.
function tocarBotonAlerta(alerta: jest.SpyInstance, texto: string): void {
  const botones = alerta.mock.calls.at(-1)?.[2] as AlertButton[] | undefined;
  botones?.find((boton) => boton.text === texto)?.onPress?.();
}

const MEDIDAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const conAreaSegura = (elemento: ReactElement) => (
  <SafeAreaProvider initialMetrics={MEDIDAS}>{elemento}</SafeAreaProvider>
);

// 4. Pruebas
afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('servicioEntregas (feature 004)', () => {
  it('CP16-E1-APP envía el rango del filtro en ISO y devuelve si el correo salió', async () => {
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      id: 'ent1',
      actividades: 2,
      fotos: 3,
      enlacePortal: 'ENVIADO',
    });

    const entrega = await servicioEntregas.enviarEntrega(
      'tkn',
      'obra1',
      '01/11/2026',
      '05/11/2026',
    );

    expect(llamar).toHaveBeenCalledWith('/obras/obra1/entregas', {
      metodo: 'POST',
      tokenAcceso: 'tkn',
      cuerpo: { fechaInicio: '2026-11-01', fechaFin: '2026-11-05' },
    });
    expect(entrega).toEqual({ id: 'ent1', actividades: 2, fotos: 3, enlacePortal: 'ENVIADO' });
    await expect(
      servicioEntregas.enviarEntrega('tkn', 'obra1', '31/02/20', '05/11/2026'),
    ).rejects.toThrow('Revisa las fechas del filtro');
  });

  it('CP16-A3-APP lista las entregas con fechas locales y rechaza respuestas raras', async () => {
    const llamar = jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue([ENTREGA_API]);

    const [entrega] = await servicioEntregas.listarEntregas('tkn', 'obra1');

    expect(entrega).toMatchObject({
      estado: 'ACEPTADA',
      fechaInicio: '01/11/2026',
      fechaFin: '05/11/2026',
      tieneActa: true,
    });
    llamar.mockResolvedValue([{ ...ENTREGA_API, estado: 'OTRO' }]);
    await expect(servicioEntregas.listarEntregas('tkn', 'obra1')).rejects.toThrow(
      'El servidor envió una respuesta inesperada',
    );
  });

  it('CP17-E8-APP descarga el acta con el token y la comparte como PDF', async () => {
    const uri = await servicioEntregas.descargarDocumentoEntrega('tkn', 'obra1', 'ent1', 'acta');

    expect(File.downloadFileAsync).toHaveBeenCalledWith(
      'https://api.prueba/obras/obra1/entregas/ent1/acta.pdf',
      expect.anything(),
      { headers: { Authorization: 'Bearer tkn' }, idempotent: true },
    );
    expect(uri).toBe('file:///cache/Acta_ent1.pdf');
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );

    jest.mocked(File.downloadFileAsync).mockRejectedValueOnce(new Error('UnableToDownload 409'));
    await expect(
      servicioEntregas.descargarDocumentoEntrega('tkn', 'obra1', 'ent2', 'acta'),
    ).rejects.toThrow('No se pudo descargar el documento');
  });

  it('CP16-PORTAL-E1-APP crearObra devuelve si salió el enlace del portal', async () => {
    jest.spyOn(clienteApi, 'llamarApi').mockResolvedValue({
      obra: {
        id: 'obra1',
        nombre: 'Hospital',
        direccion: 'Av. Reforma',
        fechaInicio: '2026-11-01',
        fechaFinal: '2026-12-30',
      },
      enlacePortal: 'FALLIDO',
    });

    const creada = await servicioObras.crearObra('tkn', {
      nombre: 'Hospital',
      descripcion: 'Construcción del hospital general',
      cliente: 'Salud',
      correoCliente: 'salud@ejemplo.com',
      direccion: 'Av. Reforma',
      fechaInicio: '01/11/2026',
      fechaFin: '30/12/2026',
      supervisorId: 'maria',
      trabajadoresIds: [],
    });

    expect(creada.enlacePortal).toBe('FALLIDO');
    expect(creada.obra.id).toBe('obra1');
  });
});

describe('Sección de entregas de la pantalla de reportes', () => {
  it('CP17-E11-APP muestra estado, respuesta del cliente, observaciones y el acta solo si se aceptó', async () => {
    jest.spyOn(servicioEntregas, 'listarEntregas').mockResolvedValue([
      {
        ...ENTREGA_API,
        fechaInicio: '01/11/2026',
        fechaFin: '05/11/2026',
        estado: 'ACEPTADA',
      },
      {
        ...ENTREGA_API,
        id: 'ent2',
        estado: 'CON_OBSERVACIONES',
        fechaInicio: '06/11/2026',
        fechaFin: '10/11/2026',
        observaciones: 'Falta sellar el piso del pasillo',
        tieneActa: false,
      },
    ]);
    const descargar = jest
      .spyOn(servicioEntregas, 'descargarDocumentoEntrega')
      .mockResolvedValue('file:///cache/Acta_ent1.pdf');

    await render(<SeccionEntregas tokenAcceso="tkn" idObra="obra1" versionLista={0} />);

    expect(await screen.findByText('Aceptada')).toBeTruthy();
    expect(screen.getByText('Con observaciones')).toBeTruthy();
    expect(screen.getByText('Falta sellar el piso del pasillo')).toBeTruthy();
    expect(screen.getByText(/Aceptó: María Fernanda/)).toBeTruthy();
    expect(screen.getAllByText('Generar acta')).toHaveLength(1);

    await fireEvent.press(screen.getByText('Generar acta'));
    await waitFor(() => expect(descargar).toHaveBeenCalledWith('tkn', 'obra1', 'ent1', 'acta'));
  });

  it('CP16-A4-APP sin entregas explica cómo enviar una y un error permite reintentar', async () => {
    const listar = jest
      .spyOn(servicioEntregas, 'listarEntregas')
      .mockRejectedValueOnce(new clienteApi.ErrorSinConexion())
      .mockResolvedValueOnce([]);

    await render(<SeccionEntregas tokenAcceso="tkn" idObra="obra1" versionLista={0} />);

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Reintentar'));
    expect(await screen.findByText(/Aún no has enviado entregas/)).toBeTruthy();
    expect(listar).toHaveBeenCalledTimes(2);
  });
});

describe('Reenviar el enlace del portal (RF-65)', () => {
  it('CP16-PORTAL-E3-APP el dueño reenvía el enlace y ve el resultado', async () => {
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const onReenviarEnlace = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(
        new clienteApi.ErrorApi('La obra no tiene correo del cliente', 400, 'SIN_CORREO_CLIENTE'),
      );

    await render(
      conAreaSegura(
        <PantallaDetalleObra
          obra={OBRA}
          onRegresar={jest.fn()}
          onAbrirActividades={jest.fn()}
          onAbrirReportes={jest.fn()}
          onReenviarEnlace={onReenviarEnlace}
        />,
      ),
    );

    await fireEvent.press(screen.getByText('Reenviar enlace al cliente'));
    await waitFor(() => expect(alerta).toHaveBeenCalledWith('Enlace enviado', expect.any(String)));
    await fireEvent.press(screen.getByText('Reenviar enlace al cliente'));
    await waitFor(() =>
      expect(alerta).toHaveBeenLastCalledWith(
        'No se pudo enviar',
        'La obra no tiene correo del cliente',
      ),
    );
  });

  it('CP16-PORTAL-A8-APP el supervisor no ve el botón de reenviar', async () => {
    await render(
      conAreaSegura(
        <PantallaDetalleObra
          obra={OBRA}
          onRegresar={jest.fn()}
          onAbrirActividades={jest.fn()}
          onAbrirReportes={jest.fn()}
        />,
      ),
    );

    expect(screen.queryByText('Reenviar enlace al cliente')).toBeNull();
  });
});

describe('Enviar al cliente desde la vista previa del reporte (RF-13, D-29)', () => {
  it('CP16-E1-APP confirma y envía el rango del filtro; avisa si el correo no salió', async () => {
    jest.spyOn(servicioReportes, 'cargarDatosReporteObra').mockResolvedValue({
      obra: OBRA,
      fechaInicioFiltro: OBRA.fechaInicio,
      fechaFinFiltro: OBRA.fechaFinal,
      actividades: [
        {
          id: 'act1',
          nombre: 'Pisos',
          estado: 'TERMINADA',
          fechaEntrega: '05/11/2026',
          fechaTerminada: '05/11/2026',
          responsable: 'Ana',
          supervisor: 'María',
          avances: [],
        },
      ],
    } as unknown as servicioReportes.DatosReporteObra);
    jest.spyOn(servicioEntregas, 'listarEntregas').mockResolvedValue([]);
    const enviar = jest.spyOn(servicioEntregas, 'enviarEntrega').mockResolvedValue({
      id: 'ent1',
      actividades: 1,
      fotos: 2,
      enlacePortal: 'FALLIDO',
    });
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    await render(
      conAreaSegura(<PantallaReportesObra tokenAcceso="tkn" obra={OBRA} onRegresar={jest.fn()} />),
    );
    await fireEvent.press(await screen.findByText('Vista previa'));
    await fireEvent.press(screen.getByText('Enviar al cliente'));
    expect(alerta).toHaveBeenLastCalledWith(
      'Enviar al cliente',
      expect.stringContaining('del 01/11/2026 al 30/12/2026'),
      expect.any(Array),
    );
    tocarBotonAlerta(alerta, 'Enviar');

    await waitFor(() =>
      expect(enviar).toHaveBeenCalledWith('tkn', 'obra1', '01/11/2026', '30/12/2026'),
    );
    await waitFor(() =>
      expect(alerta).toHaveBeenLastCalledWith(
        'Se envió al cliente',
        expect.stringContaining('no se pudo enviar el correo'),
      ),
    );
  });

  it('CP16-E2-APP muestra el mensaje de la API si no hay fotos aprobadas', async () => {
    jest.spyOn(servicioReportes, 'cargarDatosReporteObra').mockResolvedValue({
      obra: OBRA,
      fechaInicioFiltro: OBRA.fechaInicio,
      fechaFinFiltro: OBRA.fechaFinal,
      actividades: [{ id: 'act1', nombre: 'Pisos', avances: [] }],
    } as unknown as servicioReportes.DatosReporteObra);
    jest.spyOn(servicioEntregas, 'listarEntregas').mockResolvedValue([]);
    jest
      .spyOn(servicioEntregas, 'enviarEntrega')
      .mockRejectedValue(
        new clienteApi.ErrorApi(
          'No hay avances aprobados en ese rango de fechas',
          400,
          'SIN_FOTOS_APROBADAS',
        ),
      );
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    await render(
      conAreaSegura(<PantallaReportesObra tokenAcceso="tkn" obra={OBRA} onRegresar={jest.fn()} />),
    );
    await fireEvent.press(await screen.findByText('Vista previa'));
    await fireEvent.press(screen.getByText('Enviar al cliente'));
    tocarBotonAlerta(alerta, 'Enviar');

    await waitFor(() =>
      expect(alerta).toHaveBeenLastCalledWith(
        'No se pudo enviar',
        'No hay avances aprobados en ese rango de fechas',
      ),
    );
  });
});
