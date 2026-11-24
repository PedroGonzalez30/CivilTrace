/**
 * @archivo HojaDetallesAsistencia-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de "Detalles de asistencia": valores actuales, observación obligatoria sin
 *   llamar a la API, guardado de solo lo que cambió, errores y sin conexión.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-60 Registrar retardo o salida anticipada, D-07
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ErrorApi, ErrorSinConexion } from '@/conexion/clienteApi';
import HojaDetallesAsistencia from '@/componentes/HojaDetallesAsistencia';
import * as servicioDetalles from '@/servicios/servicioDetallesAsistencia';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import type { DetalleDia } from '@/tipos/asistencia';

// 3. Constantes del módulo
jest.mock('@/servicios/servicioDetallesAsistencia');
const detalles = jest.mocked(servicioDetalles);

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'maria',
    nombre: 'María',
    correo: 'm@e.com',
    rol: RolUsuario.SUPERVISOR,
    empresaId: 'e1',
  },
};

const DETALLE: DetalleDia = {
  fecha: '2026-11-20',
  trabajador: { id: 'ana', nombre: 'Emilio Manuel Esquivel', oficio: 'Plomero' },
  obra: { id: 'hospital', nombre: 'Hospital' },
  entrada: {
    hora: '2026-11-20T16:02:00.000Z',
    sinConexion: false,
    latitud: null,
    longitud: null,
    registradaPor: 'María',
  },
  salida: null,
  tipoJornada: 'RETARDO',
  esFaltaCalculada: false,
  motivo: null,
  efectoPago: 'PAGO_COMPLETO',
  conDescuento: false,
  anotacion: null,
  registradoPor: 'María',
  registradoEn: '2026-11-20T16:02:00.000Z',
  cambios: [],
};

const renderizar = (onGuardado = jest.fn()) =>
  render(
    <HojaDetallesAsistencia
      visible
      sesion={SESION}
      obraId="hospital"
      trabajadorId="ana"
      fecha="2026-11-20"
      zonaHoraria="America/Tijuana"
      onCerrar={jest.fn()}
      onGuardado={onGuardado}
      onVerCalendario={jest.fn()}
    />,
  );

// 4. Pruebas
describe('HojaDetallesAsistencia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    detalles.obtenerDetalleDia.mockResolvedValue(DETALLE);
  });

  it('CP19-A4-APP muestra los datos y los valores actuales del día', async () => {
    await renderizar();

    expect(await screen.findByText('Emilio Manuel Esquivel')).toBeTruthy();
    expect(screen.getByText('Plomero · Hospital · 20/11/2026')).toBeTruthy();
    expect(screen.getByText('Entrada 8:02 am · Salida —')).toBeTruthy();
    expect(
      screen.getByLabelText('Tipo de jornada: Retardo').props.accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('CP19-E3-APP un retardo sin observación muestra el error y no llama a la API', async () => {
    await renderizar();
    await screen.findByText('Emilio Manuel Esquivel');

    await fireEvent.press(screen.getByText('Guardar detalles'));

    expect(screen.getByText('La observación es obligatoria')).toBeTruthy();
    expect(detalles.editarDetalleDia).not.toHaveBeenCalled();
  });

  it('CP19-E1-APP guarda solo lo que cambió', async () => {
    detalles.editarDetalleDia.mockResolvedValue({ ...DETALLE, tipoJornada: 'MEDIA_JORNADA' });
    const onGuardado = jest.fn();
    await renderizar(onGuardado);
    await screen.findByText('Emilio Manuel Esquivel');

    await fireEvent.press(screen.getByText('Media jornada'));
    await fireEvent.press(screen.getByText('Cita médica'));
    await fireEvent.press(screen.getByText('Medio día'));
    await fireEvent.changeText(
      screen.getByLabelText('Anotaciones'),
      'Salió a las 12:00 por cita en el IMSS',
    );
    await fireEvent.press(screen.getByText('Guardar detalles'));

    await waitFor(() => expect(onGuardado).toHaveBeenCalled());
    expect(detalles.editarDetalleDia).toHaveBeenCalledWith('tkn', 'hospital', 'ana', '2026-11-20', {
      tipoJornada: 'MEDIA_JORNADA',
      motivo: 'CITA_MEDICA',
      efectoPago: 'MEDIO_DIA',
      anotacion: 'Salió a las 12:00 por cita en el IMSS',
    });
  });

  it('CP19-A5-APP el error del servidor y la falta de conexión se muestran sin cerrar la hoja', async () => {
    detalles.editarDetalleDia.mockRejectedValueOnce(
      new ErrorApi('Las horas deben ser del mismo día', 400),
    );
    const onGuardado = jest.fn();
    await renderizar(onGuardado);
    await screen.findByText('Emilio Manuel Esquivel');
    await fireEvent.changeText(screen.getByLabelText('Anotaciones'), 'Nota');

    await fireEvent.press(screen.getByText('Guardar detalles'));
    expect(await screen.findByText('Las horas deben ser del mismo día')).toBeTruthy();

    detalles.editarDetalleDia.mockRejectedValueOnce(new ErrorSinConexion());
    await fireEvent.press(screen.getByText('Guardar detalles'));
    expect(await screen.findByText('Necesitas conexión para guardar los cambios.')).toBeTruthy();
    expect(onGuardado).not.toHaveBeenCalled();
  });
});
