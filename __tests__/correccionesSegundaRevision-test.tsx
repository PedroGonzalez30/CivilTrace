/**
 * @archivo correccionesSegundaRevision-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de la app del feature 006: reglas y confirmación de contraseña al
 *   registrarse (D-12), agregar trabajadores a una obra ya creada (RF-68) y textos del detalle de
 *   obra.
 * @autor Emilio Manuel Esquivel
 * @fecha 25/11/2026
 * @version 1.0.0
 * @requerimientos RF-02 Registrar cuenta, RF-68 Asignar trabajadores a una obra (SRS v5.0)
 * @historial 25/11/2026 - Emilio Manuel Esquivel - Creación (feature 006)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ModalAsignarTrabajadores from '@/componentes/ModalAsignarTrabajadores';
import * as clienteApi from '@/conexion/clienteApi';
import PantallaDetalleObra from '@/pantallas/dueno/PantallaDetalleObra';
import * as servicioObras from '@/servicios/servicioObras';
import { validarRegistro } from '@/utilidades/validacionAutenticacion';

// 3. Constantes del módulo
jest.mock('@/conexion/configuracionApi', () => ({
  URL_API: 'https://api.prueba',
  TIEMPO_ESPERA_API_MS: 1000,
}));

const REGISTRO_VALIDO = {
  nombre: 'Ana Sánchez',
  correo: 'ana@ejemplo.com',
  contrasena: 'Segura123',
  confirmarContrasena: 'Segura123',
  rol: 'TRABAJADOR',
  empresa: 'T-ABC123',
};

const MEDIDAS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const conAreaSegura = (elemento: ReactElement) => (
  <SafeAreaProvider initialMetrics={MEDIDAS}>{elemento}</SafeAreaProvider>
);

// 4. Pruebas
afterEach(() => jest.restoreAllMocks());

describe('Registro: reglas y confirmación de contraseña (D-12)', () => {
  it('CP02-A10-APP pide mayúscula, minúscula, número y que la confirmación coincida', () => {
    expect(validarRegistro(REGISTRO_VALIDO)).toEqual({});
    expect(validarRegistro({ ...REGISTRO_VALIDO, contrasena: 'segura123' }).contrasena).toBe(
      'La contraseña necesita: una letra mayúscula',
    );
    expect(validarRegistro({ ...REGISTRO_VALIDO, contrasena: 'Segura' }).contrasena).toBe(
      'La contraseña necesita: mínimo 8 caracteres',
    );
    expect(
      validarRegistro({ ...REGISTRO_VALIDO, confirmarContrasena: 'Otra1234' }).confirmarContrasena,
    ).toBe('Las contraseñas no coinciden');
    expect(
      validarRegistro({ ...REGISTRO_VALIDO, confirmarContrasena: '' }).confirmarContrasena,
    ).toBe('Confirma tu contraseña');
  });
});

describe('Agregar trabajadores a una obra ya creada (RF-68)', () => {
  it('CP09-A10-APP muestra asignados y disponibles y agrega los elegidos', async () => {
    jest.spyOn(servicioObras, 'listarTrabajadoresDeObra').mockResolvedValue({
      asignados: [{ id: 'ana', nombre: 'Ana Sánchez', oficio: 'Albañil' }],
      disponibles: [
        { id: 'luis', nombre: 'Luis Gómez', oficio: null },
        { id: 'juan', nombre: 'Juan Castro', oficio: 'Plomero' },
      ],
    });
    const asignar = jest.spyOn(servicioObras, 'asignarTrabajadores').mockResolvedValue({
      asignados: [
        { id: 'ana', nombre: 'Ana Sánchez', oficio: 'Albañil' },
        { id: 'luis', nombre: 'Luis Gómez', oficio: null },
      ],
      disponibles: [{ id: 'juan', nombre: 'Juan Castro', oficio: 'Plomero' }],
    });

    await render(
      <ModalAsignarTrabajadores visible tokenAcceso="tkn" idObra="obra1" onCerrar={jest.fn()} />,
    );

    expect(await screen.findByText('✓ Ana Sánchez · Albañil')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Luis Gómez'));
    await fireEvent.press(screen.getByText('Agregar (1)'));

    await waitFor(() => expect(asignar).toHaveBeenCalledWith('tkn', 'obra1', ['luis']));
    expect(await screen.findByText('Se agregó 1 trabajador.')).toBeTruthy();
    expect(screen.getByText('✓ Luis Gómez')).toBeTruthy();
  });

  it('CP09-A11-APP muestra el error de la API sin cerrar la ventana', async () => {
    jest.spyOn(servicioObras, 'listarTrabajadoresDeObra').mockResolvedValue({
      asignados: [],
      disponibles: [{ id: 'luis', nombre: 'Luis Gómez', oficio: null }],
    });
    jest
      .spyOn(servicioObras, 'asignarTrabajadores')
      .mockRejectedValue(
        new clienteApi.ErrorApi('No tienes permiso para realizar esta acción', 403),
      );

    await render(
      <ModalAsignarTrabajadores visible tokenAcceso="tkn" idObra="obra1" onCerrar={jest.fn()} />,
    );
    expect(await screen.findByText('Todavía no hay trabajadores en esta obra.')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Luis Gómez'));
    await fireEvent.press(screen.getByText('Agregar (1)'));

    expect(await screen.findByText('No tienes permiso para realizar esta acción')).toBeTruthy();
  });

  it('CP09-A12-APP el detalle de obra usa textos cortos y abre los trabajadores', async () => {
    jest
      .spyOn(servicioObras, 'listarTrabajadoresDeObra')
      .mockResolvedValue({ asignados: [], disponibles: [] });

    await render(
      conAreaSegura(
        <PantallaDetalleObra
          obra={{
            id: 'obra1',
            nombre: 'Hospital',
            resumen: '',
            descripcion: 'Hospital general',
            direccion: 'Av. Reforma',
            fechaInicio: '01/11/2026',
            fechaFinal: '30/12/2026',
            supervisor: 'María',
            cliente: 'Salud',
          }}
          tokenAcceso="tkn"
          onRegresar={jest.fn()}
          onAbrirActividades={jest.fn()}
          onAbrirReportes={jest.fn()}
        />,
      ),
    );

    expect(screen.getByText('Actividades')).toBeTruthy();
    expect(screen.getByText('Reportes')).toBeTruthy();
    await fireEvent.press(screen.getByText('Trabajadores de la obra'));
    expect(
      await screen.findByText('Todos los trabajadores de la empresa ya están aquí.'),
    ).toBeTruthy();
  });
});
