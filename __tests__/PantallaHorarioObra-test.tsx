/**
 * @archivo PantallaHorarioObra-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de la pantalla del horario de la obra: valores por defecto, regla de
 *   retardo según la tolerancia, validaciones sin llamar a la API y guardado.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06, RF-60 Registrar retardo o salida anticipada
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ErrorSinConexion } from '@/conexion/clienteApi';
import PantallaHorarioObra from '@/pantallas/supervisor/PantallaHorarioObra';
import * as servicioHorario from '@/servicios/servicioHorario';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
jest.mock('@/servicios/servicioHorario');
const horario = jest.mocked(servicioHorario);

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

const renderizar = (onGuardado = jest.fn()) =>
  render(
    <PantallaHorarioObra
      sesion={SESION}
      obraId="hospital"
      obraNombre="Hospital"
      onRegresar={jest.fn()}
      onGuardado={onGuardado}
    />,
  );

// 4. Pruebas
describe('PantallaHorarioObra', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    horario.obtenerHorario.mockResolvedValue({
      general: null,
      hoy: null,
      zonaHoraria: 'America/Tijuana',
    });
  });

  it('CP22-A1-APP muestra los valores por defecto y la regla cambia con la tolerancia', async () => {
    await renderizar();

    expect(await screen.findByText('08:00 am')).toBeTruthy();
    expect(screen.getByText('04:00 pm')).toBeTruthy();
    expect(
      screen.getByText('Una entrada después de las 08:15 se marca como retardo.'),
    ).toBeTruthy();

    await fireEvent.press(screen.getByText('20 min'));
    expect(
      screen.getByText('Una entrada después de las 08:20 se marca como retardo.'),
    ).toBeTruthy();
  });

  it('CP22-A4-APP sin días laborales muestra el error y no llama a la API', async () => {
    await renderizar();
    await screen.findByText('08:00 am');
    for (const etiqueta of ['L', 'J', 'V', 'S']) {
      await fireEvent.press(screen.getByLabelText(`Día ${etiqueta}`));
    }
    for (const boton of screen.getAllByLabelText('Día M')) {
      await fireEvent.press(boton);
    }

    await fireEvent.press(screen.getByText('Guardar horario'));

    expect(screen.getByText('Elige al menos un día laboral')).toBeTruthy();
    expect(horario.guardarHorario).not.toHaveBeenCalled();
  });

  it('CP22-A5-APP guarda con los valores elegidos y "Solo hoy"', async () => {
    horario.guardarHorario.mockResolvedValue({
      general: null,
      hoy: null,
      zonaHoraria: 'America/Tijuana',
    });
    const onGuardado = jest.fn();
    await renderizar(onGuardado);
    await screen.findByText('08:00 am');

    await fireEvent.press(screen.getByText('Solo hoy'));
    await fireEvent.press(screen.getByText('Guardar horario'));

    await waitFor(() => expect(onGuardado).toHaveBeenCalled());
    expect(horario.guardarHorario).toHaveBeenCalledWith('tkn', 'hospital', {
      horaEntrada: '08:00',
      horaSalida: '16:00',
      toleranciaMinutos: 15,
      diasLaborales: [1, 2, 3, 4, 5, 6],
      alcance: 'SOLO_HOY',
    });
  });

  it('CP22-A6-APP sin conexión avisa y conserva lo capturado', async () => {
    horario.guardarHorario.mockRejectedValue(new ErrorSinConexion());
    await renderizar();
    await screen.findByText('08:00 am');

    await fireEvent.press(screen.getByText('Guardar horario'));

    expect(await screen.findByText('Necesitas conexión para guardar el horario.')).toBeTruthy();
    expect(screen.getByText('08:00 am')).toBeTruthy();
  });
});
