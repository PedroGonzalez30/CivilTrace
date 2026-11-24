/**
 * @archivo navegacionPorRol-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas de las barras inferiores del supervisor y del trabajador.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos RF-19 Registrar asistencia propia, RF-27 Registrar asistencia por el
 *   supervisor
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import PestanasSupervisor from '@/navegacion/PestanasSupervisor';
import PestanasTrabajador from '@/navegacion/PestanasTrabajador';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
const sesion = (rol: RolUsuario): SesionAutenticacion => ({
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: { id: 'u1', nombre: 'Ana Sánchez', correo: 'ana@ejemplo.com', rol, empresaId: 'e1' },
});

// 4. Pruebas
describe('Navegación por rol', () => {
  it('CP21-A15-APP el trabajador ve "Trabajo / Mi asistencia / Cuenta"', async () => {
    await render(
      <NavigationContainer>
        <PestanasTrabajador sesion={sesion(RolUsuario.TRABAJADOR)} onCerrarSesion={jest.fn()} />
      </NavigationContainer>,
    );

    expect(screen.getAllByText('Trabajo').length).toBeGreaterThan(0);
    expect(screen.getByText('Mi asistencia')).toBeTruthy();
    expect(screen.getByText('Cuenta')).toBeTruthy();
  });

  it('CP21-A16-APP el supervisor ve "Inicio / Asistencia / Cuenta"', async () => {
    await render(
      <NavigationContainer>
        <PestanasSupervisor sesion={sesion(RolUsuario.SUPERVISOR)} onCerrarSesion={jest.fn()} />
      </NavigationContainer>,
    );

    expect(screen.getByText('Inicio')).toBeTruthy();
    expect(screen.getByText('Asistencia')).toBeTruthy();
    expect(screen.getByText('Cuenta')).toBeTruthy();
  });
});
