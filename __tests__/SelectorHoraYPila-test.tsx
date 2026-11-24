/**
 * @archivo SelectorHoraYPila-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del selector de hora y de la navegación de la pila de asistencia del
 *   supervisor (escoger obra → lectura de QR).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-06, RF-27 Registrar asistencia por el supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import SelectorHora from '@/componentes/SelectorHora';
import * as useLecturaQrModulo from '@/hooks/useLecturaQr';
import PilaAsistenciaSupervisor from '@/navegacion/PilaAsistenciaSupervisor';
import * as asistencia from '@/servicios/servicioAsistencia';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
jest.mock('expo-camera', () => {
  const { View } = jest.requireActual('react-native');
  return {
    CameraView: () => <View testID="camara" />,
    useCameraPermissions: () => [{ granted: true }, jest.fn()],
  };
});

// 4. Pruebas
describe('SelectorHora', () => {
  it('CP22-A7-APP abre la lista, elige una hora y muestra — sin valor', async () => {
    const onCambiar = jest.fn();
    const { rerender } = await render(
      <SelectorHora etiqueta="Entrada" valor="08:00" onCambiar={onCambiar} />,
    );

    await fireEvent.press(screen.getByLabelText('Entrada: 08:00 am'));
    await fireEvent.press(screen.getByText('08:15 am'));
    expect(onCambiar).toHaveBeenCalledWith('08:15');

    await rerender(<SelectorHora etiqueta="Salida" valor={null} onCambiar={onCambiar} />);
    expect(screen.getByLabelText('Salida: —')).toBeTruthy();
  });
});

describe('PilaAsistenciaSupervisor', () => {
  it('CP21-A41-APP al elegir una obra abre su lectura de QR', async () => {
    const sesion: SesionAutenticacion = {
      token: 'tkn',
      tokenRefresco: 'r',
      venceEn: Date.now() + 60_000,
      usuario: {
        id: 'maria',
        nombre: 'María',
        correo: 'm@e.com',
        rol: RolUsuario.SUPERVISOR,
        empresaId: 'e1',
      },
    };
    jest
      .spyOn(asistencia, 'listarMisObras')
      .mockResolvedValue([
        {
          id: 'o1',
          nombre: 'Hospital',
          descripcion: '',
          direccion: '',
          fechaInicio: '2026-01-01',
          fechaFinal: '2026-12-31',
        },
      ]);
    jest.spyOn(useLecturaQrModulo, 'useLecturaQr').mockReturnValue({
      resumen: null,
      zonaHoraria: 'America/Tijuana',
      generadoEn: null,
      sinConexion: false,
      pendientes: 0,
      rechazados: 0,
      cargando: false,
      error: null,
      recargar: jest.fn(async () => undefined),
    });

    await render(
      <NavigationContainer>
        <PilaAsistenciaSupervisor sesion={sesion} />
      </NavigationContainer>,
    );
    await fireEvent.press(await screen.findByText('Hospital'));

    expect(await screen.findByText('Asistencia de personal')).toBeTruthy();
  });
});
