/**
 * @archivo FormularioPerfil-test.tsx
 * @proyecto Civil Trace
 * @descripcion Pruebas del campo "Oficio" del perfil (propuesta aprobada 2295:313, D-18, D-21).
 * @autor Emilio Manuel Esquivel
 * @fecha 23/11/2026
 * @version 1.0.0
 * @requerimientos D-18 (oficio en el perfil)
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Creación (feature 001)
 */

// 1. Importaciones
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import FormularioPerfil from '@/componentes/FormularioPerfil';
import * as servicioPerfil from '@/servicios/servicioPerfil';
import { RolUsuario, type SesionAutenticacion } from '@/tipos/autenticacion';
import { validarPerfil } from '@/utilidades/validacionAutenticacion';

// 3. Constantes del módulo
jest.mock('@/servicios/servicioPerfil');
const perfil = jest.mocked(servicioPerfil);

const SESION: SesionAutenticacion = {
  token: 'tkn',
  tokenRefresco: 'ref',
  venceEn: Date.now() + 60_000,
  usuario: {
    id: 'ana',
    nombre: 'Ana Sánchez',
    correo: 'ana@ejemplo.com',
    rol: RolUsuario.TRABAJADOR,
    empresaId: 'e1',
  },
};

// 4. Pruebas
describe('Oficio en el perfil', () => {
  it('CP06-A1-APP el oficio se envía en PUT /perfil', async () => {
    perfil.actualizarPerfil.mockResolvedValue({
      nombre: 'Ana Sánchez',
      correo: 'ana@ejemplo.com',
      telefono: '',
      oficio: 'Albañil',
      tieneFoto: false,
    });
    await render(
      <FormularioPerfil
        sesion={SESION}
        perfil={{
          nombre: 'Ana Sánchez',
          correo: 'ana@ejemplo.com',
          telefono: '',
          oficio: '',
          tieneFoto: false,
        }}
        onCambiarContrasena={jest.fn()}
      />,
    );

    await fireEvent.changeText(screen.getByPlaceholderText('Plomero'), '  Albañil ');
    await fireEvent.press(screen.getByText('Guardar cambios'));

    await waitFor(() =>
      expect(perfil.actualizarPerfil).toHaveBeenCalledWith('tkn', {
        nombre: 'Ana Sánchez',
        correo: 'ana@ejemplo.com',
        telefono: '',
        oficio: 'Albañil',
      }),
    );
  });

  it('CP06-A2-APP más de 60 caracteres es un error', () => {
    const errores = validarPerfil({
      nombre: 'Ana Sánchez',
      correo: 'ana@ejemplo.com',
      telefono: '',
      oficio: 'x'.repeat(61),
    });
    expect(errores.oficio).toBe('El oficio es demasiado largo');
  });
});
