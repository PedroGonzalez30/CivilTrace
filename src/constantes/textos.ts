/**
 * @archivo textos.ts
 * @proyecto Civil Trace
 * @descripcion Textos fijos de las pantallas de inicio de sesión y registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.0.0
 */

export const TEXTOS_INICIO_SESION = {
  marcadorCorreo: 'nombre@ejemplo.com',
  marcadorContrasena: '••••••••••••',
};

export const TEXTOS_REGISTRO = {
  marcadorNombre: 'Nombre',
  marcadorCorreo: 'nombre@ejemplo.com',
  marcadorContrasena: '••••••••••••',
  marcadorRol: 'Selecciona tu rol',
};

export const TEXTOS_MODAL_NOMBRE_EMPRESA = {
  titulo: 'Nombre de la empresa',
  descripcion: 'Ingresa el nombre de tu empresa para continuar.',
  etiqueta: 'Nombre',
  textoMarcador: 'Ej. Mi Negocio S.A.',
};

export const TEXTOS_MODAL_CODIGO_EMPRESA = {
  titulo: 'Código de la empresa',
  descripcion: 'Ingresa el código de la empresa para continuar.',
  etiqueta: 'Código',
  textoMarcador: 'CA045',
};

export const TEXTOS_AGREGAR_OBRA = {
  titulo: 'Agregar una nueva obra',
  subtitulo: 'Completa los datos de la obra o servicio.',
  etiquetaBoton: 'Agregar',
  errorEnvio: 'No se pudo crear la obra. Intente de nuevo',
};

export const TEXTOS_OBRA_CREADA = {
  titulo: 'Obra creada correctamente',
  descripcionInicio: 'La obra «',
  descripcionFin: '» fue creada correctamente con los siguientes datos.',
  etiquetaNombre: 'Nombre de la obra',
  etiquetaCliente: 'Cliente',
  etiquetaDireccion: 'Dirección',
  etiquetaFechaInicio: 'Fecha de inicio',
  etiquetaFechaFin: 'Fecha de terminación',
  etiquetaSupervisor: 'Supervisor',
  etiquetaBoton: 'Ir al panel principal',
  nota: 'Puedes ver esta obra y todas las demás en el panel principal.',
};

export const TEXTOS_ASIGNAR_TRABAJADORES = {
  etiqueta: 'Trabajadores',
  sinSeleccion: 'Ninguno seleccionado',
  titulo: 'Asignar trabajadores',
  descripcion: 'Selecciona a quienes trabajarán en esta obra.',
  seleccionarTodos: 'Seleccionar todos',
  vacio: 'Aún no hay trabajadores en tu empresa. Comparte el código de acceso para que se unan.',
  etiquetaBoton: 'Listo',
};

export const TEXTOS_PERSONAL = {
  titulo: 'Personal',
  subtitulo: 'Personal inscrito en la empresa',
  supervisores: 'Supervisores',
  trabajadores: 'Trabajadores',
  rolSupervisor: 'Supervisor',
  rolTrabajador: 'Trabajador',
  vacioSupervisores: 'Aún no hay supervisores.',
  vacioTrabajadores: 'Aún no hay trabajadores.',
  exito: 'Personal eliminado correctamente',
  errorEliminar: 'No se pudo eliminar. Intente de nuevo',
  reintentar: 'Reintentar',
};

export const TEXTOS_ELIMINAR_PERSONAL = {
  titulo: '¿Quieres eliminar al empleado?',
  descripcion: 'Si eliminas al trabajador, no podrá volver a acceder a los datos',
  cancelar: 'Cancelar',
  aceptar: 'Aceptar',
};

