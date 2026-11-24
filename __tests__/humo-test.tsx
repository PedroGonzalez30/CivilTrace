/**
 * @archivo humo-test.tsx
 * @proyecto Civil Trace
 * @descripcion Prueba humo: confirma que jest-expo y Testing Library renderizan componentes.
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos Constitución III (pruebas primero)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (módulo 00 de la app)
 */

// 1. Importaciones
import { fireEvent, render, screen } from '@testing-library/react-native';

import BotonPrincipal from '@/componentes/BotonPrincipal';

// 4. Pruebas
describe('Prueba humo de la app', () => {
  it('M00-A1-APP renderiza un botón y responde al toque', async () => {
    const onPresionar = jest.fn();
    await render(<BotonPrincipal etiqueta="Guardar" onPresionar={onPresionar} />);

    await fireEvent.press(screen.getByText('Guardar'));

    expect(onPresionar).toHaveBeenCalledTimes(1);
  });

  it('M00-A2-APP un botón deshabilitado no responde', async () => {
    const onPresionar = jest.fn();
    await render(<BotonPrincipal etiqueta="Guardar" onPresionar={onPresionar} deshabilitado />);

    await fireEvent.press(screen.getByText('Guardar'));

    expect(onPresionar).not.toHaveBeenCalled();
  });
});
