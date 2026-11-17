/**
 * @archivo servicioAutenticacion.ts
 * @proyecto Civil Trace
 * @descripcion Inicio de sesión, registro, refresco y cierre de sesión contra la API real.
 * @autor Pedro Ivan Gonzalez Valdez
 * @fecha 16/11/2026
 * @version 1.0.0
 */

// 1. Importaciones
import { ErrorApi, llamarApi } from '@/conexion/clienteApi';
import { rolDeApi, rolParaApi } from '@/conexion/traduccionRol';
import type { DatosRegistro, SesionAutenticacion } from '@/tipos/autenticacion';

// 3. Constantes del módulo
const MENSAJE_RESPUESTA_INVALIDA = 'El servidor envió una respuesta inesperada';

// 4. Funciones privadas
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

/**
 * Convierte la respuesta de la API en una sesión de la app, comprobando que traiga todo.
 */
function aSesion(datos: unknown): SesionAutenticacion {
  if (!esObjeto(datos) || !esObjeto(datos.usuario)) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  const { tokenAcceso, tokenRefresco, venceEn, usuario } = datos;
  const rol = typeof usuario.rol === 'string' ? rolDeApi(usuario.rol) : null;

  if (
    typeof tokenAcceso !== 'string' ||
    typeof tokenRefresco !== 'string' ||
    typeof venceEn !== 'number' ||
    typeof usuario.id !== 'string' ||
    typeof usuario.nombre !== 'string' ||
    typeof usuario.correo !== 'string' ||
    typeof usuario.empresaId !== 'string' ||
    typeof usuario.empresa !== 'string' ||
    rol === null
  ) {
    throw new ErrorApi(MENSAJE_RESPUESTA_INVALIDA, null);
  }

  return {
    token: tokenAcceso,
    tokenRefresco,
    venceEn,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol,
      empresaId: usuario.empresaId,
      empresa: usuario.empresa,
    },
  };
}

// 5. Funciones públicas
/**
 * Inicia sesión con correo y contraseña.
 *
 * @param correo - Correo electrónico del usuario.
 * @param contrasena - Contraseña del usuario.
 * @returns Sesión creada para el usuario.
 * @throws ErrorApi si las credenciales son incorrectas o no hay conexión.
 */
export async function iniciarSesion(
  correo: string,
  contrasena: string,
): Promise<SesionAutenticacion> {
  const respuesta = await llamarApi('/auth/login', {
    metodo: 'POST',
    cuerpo: { correo, contrasena },
  });
  return aSesion(respuesta);
}

/**
 * Registra a un usuario nuevo y abre su sesión. Para el dueño, "empresa" es el nombre de la
 * empresa; para supervisor y trabajador, es el código de acceso.
 *
 * @param datos - Datos capturados en el formulario de registro.
 * @returns Sesión creada para el usuario nuevo.
 * @throws ErrorApi si el correo ya está registrado, el código no es válido o no hay conexión.
 */
export async function registrar(datos: DatosRegistro): Promise<SesionAutenticacion> {
  const respuesta = await llamarApi('/auth/registro', {
    metodo: 'POST',
    cuerpo: { ...datos, rol: rolParaApi(datos.rol) },
  });
  return aSesion(respuesta);
}

/**
 * Cambia el token de refresco por una sesión nueva (la API rota el token de refresco).
 *
 * @param tokenRefresco - Token de refresco guardado en el dispositivo.
 * @returns Sesión renovada.
 * @throws ErrorApi con estado 401 si el token ya no sirve (hay que iniciar sesión otra vez).
 */
export async function refrescarSesion(tokenRefresco: string): Promise<SesionAutenticacion> {
  const respuesta = await llamarApi('/auth/refrescar', {
    metodo: 'POST',
    cuerpo: { tokenRefresco },
  });
  return aSesion(respuesta);
}

/**
 * Avisa a la API que cierre la sesión (revoca el token de refresco). Si falla, no importa:
 * la sesión local se borra de todos modos.
 *
 * @param tokenRefresco - Token de refresco de la sesión que se cierra.
 */
export async function cerrarSesionRemota(tokenRefresco: string): Promise<void> {
  try {
    await llamarApi('/auth/cerrar-sesion', { metodo: 'POST', cuerpo: { tokenRefresco } });
  } catch {
    // Sin conexión o token ya inválido: no hay nada más que hacer.
  }
}