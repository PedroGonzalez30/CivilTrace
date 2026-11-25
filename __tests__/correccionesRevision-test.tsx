/**
 * @archivo correccionesRevision-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de las correcciones de la revisión del equipo: supervisor obligatorio al
 *   crear una obra (D-24), código de trabajadores para el supervisor (D-23), logotipo de la
 *   empresa en el encabezado (D-25) y barra inferior oculta con el teclado abierto (D-27).
 * @autor Emilio Manuel Esquivel
 * @fecha 24/11/2026
 * @version 1.0.0
 * @requerimientos D-23, D-24, D-25, D-27 (feature 002)
 * @historial 24/11/2026 - Emilio Manuel Esquivel - Creación (feature 002)
 */

// 1. Importaciones
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import * as Portapapeles from 'expo-clipboard';
import type { ReactElement } from 'react';
import { Keyboard } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as clienteApi from '@/conexion/clienteApi';
import EncabezadoApp from '@/componentes/EncabezadoApp';
import NavegacionInferior from '@/componentes/NavegacionInferior';
import ProveedorLogoEmpresa from '@/componentes/ProveedorLogoEmpresa';
import SeccionCodigoTrabajadores from '@/componentes/SeccionCodigoTrabajadores';
import TarjetaCodigoAcceso from '@/componentes/TarjetaCodigoAcceso';
import { useTecladoVisible } from '@/hooks/useTecladoVisible';
import PantallaAgregarObra from '@/pantallas/dueno/PantallaAgregarObra';
import * as servicioEmpresa from '@/servicios/servicioEmpresa';
import type { DatosNuevaObra } from '@/tipos/obra';
import { MENSAJE_SUPERVISOR_REQUERIDO, validarObra } from '@/utilidades/validacionObra';

// 3. Constantes del módulo
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }));
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));

const OBRA_VALIDA: DatosNuevaObra = {
  nombre: 'Puente Norte',
  descripcion: 'Construcción del puente peatonal',
  cliente: 'Municipio',
  correoCliente: 'obras@municipio.com',
  direccion: 'Av. Principal 123',
  fechaInicio: '01/12/2026',
  fechaFin: '30/06/2027',
  supervisorId: 'maria',
  trabajadoresIds: [],
};

const MEDIDAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const conAreaSegura = (elemento: ReactElement) => (
  <SafeAreaProvider initialMetrics={MEDIDAS}>{elemento}</SafeAreaProvider>
);

// Guarda los oyentes del teclado para simular que se abre y se cierra.
function simularTeclado() {
  const oyentes: Record<string, () => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((evento: string, oyente: () => void) => {
    oyentes[evento] = oyente;
    return { remove: jest.fn() };
  }) as never);
  return oyentes;
}

// 4. Pruebas
afterEach(() => jest.restoreAllMocks());

describe('Supervisor obligatorio en una obra nueva (D-24)', () => {
  it('CP08-A10-APP sin supervisor la validación lo pide; con supervisor no hay error', () => {
    expect(validarObra({ ...OBRA_VALIDA, supervisorId: '' }).supervisorId).toBe(
      MENSAJE_SUPERVISOR_REQUERIDO,
    );
    expect(validarObra(OBRA_VALIDA)).toEqual({});
  });

  it('CP08-A11-APP al presionar Agregar sin supervisor se muestra el mensaje y no se envía', async () => {
    jest
      .spyOn(servicioEmpresa, 'obtenerPersonalEmpresa')
      .mockResolvedValue({ supervisores: [], trabajadores: [] });
    const onAgregar = jest.fn();
    await render(
      conAreaSegura(
        <PantallaAgregarObra
          tokenAcceso="tkn"
          onAgregar={onAgregar}
          onIrAlPanelPrincipal={jest.fn()}
        />,
      ),
    );

    expect(await screen.findByText(/Aún no hay supervisores en tu empresa/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Agregar'));
    expect(screen.getByText(MENSAJE_SUPERVISOR_REQUERIDO)).toBeTruthy();
    expect(screen.queryByText('Sin supervisor')).toBeNull();
    expect(onAgregar).not.toHaveBeenCalled();
  });
});

describe('Código de trabajadores para el supervisor (D-23)', () => {
  it('CP04-A10-APP pide /empresa/codigos y usa solo el de trabajadores', async () => {
    const llamar = jest
      .spyOn(clienteApi, 'llamarApi')
      .mockResolvedValue({ codigos: { trabajadores: 'T-123' } });

    await expect(servicioEmpresa.obtenerCodigoTrabajadores('tkn')).resolves.toBe('T-123');
    expect(llamar).toHaveBeenCalledWith('/empresa/codigos', { tokenAcceso: 'tkn' });

    llamar.mockResolvedValue({ codigos: {} });
    await expect(servicioEmpresa.obtenerCodigoTrabajadores('tkn')).rejects.toThrow(
      'El servidor envió una respuesta inesperada',
    );
  });

  it('CP04-A11-APP el inicio del supervisor muestra el código y lo copia', async () => {
    jest.spyOn(servicioEmpresa, 'obtenerCodigoTrabajadores').mockResolvedValue('T-123');
    await render(<SeccionCodigoTrabajadores tokenAcceso="tkn" />);

    expect(await screen.findByText('T-123')).toBeTruthy();
    expect(screen.queryByText(/supervisores/)).toBeNull();
    await fireEvent.press(screen.getByText('Copiar'));
    expect(Portapapeles.setStringAsync).toHaveBeenCalledWith('T-123');
    expect(await screen.findByText('¡Copiado!')).toBeTruthy();
  });

  it('CP04-A12-APP si falla deja reintentar', async () => {
    const obtener = jest
      .spyOn(servicioEmpresa, 'obtenerCodigoTrabajadores')
      .mockRejectedValueOnce(new clienteApi.ErrorApi('Sin permiso', 403))
      .mockResolvedValueOnce('T-9');
    await render(<SeccionCodigoTrabajadores tokenAcceso="tkn" />);

    await fireEvent.press(await screen.findByText('Sin permiso Toca para reintentar.'));
    expect(await screen.findByText('T-9')).toBeTruthy();
    expect(obtener).toHaveBeenCalledTimes(2);
  });

  it('CP04-A13-APP la tarjeta de código se muestra sin texto suelto fuera de <Text>', async () => {
    await render(
      <TarjetaCodigoAcceso titulo="Código" descripcion="Desc" codigo="T-1" onCopiar={jest.fn()} />,
    );
    expect(screen.getByText('T-1')).toBeTruthy();
  });
});

describe('Logotipo de la empresa en el encabezado (D-25)', () => {
  it('CP05-A10-APP con logotipo se muestra a la derecha', async () => {
    jest
      .spyOn(servicioEmpresa, 'descargarLogoEmpresa')
      .mockResolvedValue('data:image/png;base64,AA');
    await render(
      <ProveedorLogoEmpresa tokenAcceso="tkn">
        <EncabezadoApp />
      </ProveedorLogoEmpresa>,
    );
    expect(await screen.findByLabelText('Logotipo de la empresa')).toBeTruthy();
    expect(screen.getByText('Civil Trace')).toBeTruthy();
  });

  it('CP05-A11-APP sin logotipo (404) solo queda el nombre de la app', async () => {
    const descargar = jest
      .spyOn(servicioEmpresa, 'descargarLogoEmpresa')
      .mockRejectedValue(new clienteApi.ErrorApi('Sin logo', 404));
    await render(
      <ProveedorLogoEmpresa tokenAcceso="tkn">
        <EncabezadoApp />
      </ProveedorLogoEmpresa>,
    );
    await waitFor(() => expect(descargar).toHaveBeenCalled());
    expect(screen.queryByLabelText('Logotipo de la empresa')).toBeNull();
  });
});

describe('Teclado y barra inferior (D-27)', () => {
  it('CP00-A10-APP useTecladoVisible sigue los eventos del teclado', async () => {
    const oyentes = simularTeclado();
    const { result } = await renderHook(() => useTecladoVisible());

    expect(result.current).toBe(false);
    await act(async () => oyentes.keyboardDidShow?.());
    expect(result.current).toBe(true);
    await act(async () => oyentes.keyboardDidHide?.());
    expect(result.current).toBe(false);
  });

  it('CP00-A11-APP la barra inferior se oculta mientras el teclado está abierto', async () => {
    const oyentes = simularTeclado();
    const propiedades = {
      state: { index: 0, routes: [{ key: 'inicio', name: 'Inicio' }] },
      navigation: { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() },
    } as unknown as BottomTabBarProps;
    await render(conAreaSegura(<NavegacionInferior {...propiedades} />));

    expect(screen.getByText('Inicio')).toBeTruthy();
    await act(async () => oyentes.keyboardDidShow?.());
    expect(screen.queryByText('Inicio')).toBeNull();
    await act(async () => oyentes.keyboardDidHide?.());
    expect(screen.getByText('Inicio')).toBeTruthy();
  });
});
