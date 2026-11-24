/**
 * @archivo textos.ts
 * @proyecto Civil Trace
 * @descripcion Textos fijos de las pantallas de inicio de sesión y registro.
 * @autor POR_COMPLETAR
 * @fecha POR_COMPLETAR
 * @version 1.1.0
 * @historial 23/11/2026 - Emilio Manuel Esquivel - Oficio del perfil (D-18, feature 001)
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
  descripcion: 'Se quitará de la empresa y de sus obras. Su cuenta no se borra.',
  cancelar: 'Cancelar',
  aceptar: 'Aceptar',
};

export const TEXTOS_UNIRSE_EMPRESA = {
  titulo: 'Unirme a una empresa',
  subtitulo: 'Usa el código que te dio el dueño de la empresa.',
  etiquetaBoton: 'Unirme',
};

export const TEXTOS_CAMBIAR_CONTRASENA = {
  volver: 'Volver a Mi perfil',
  titulo: 'Cambiar contraseña',
  subtitulo: 'Actualiza tu contraseña para mantener tu cuenta segura.',
  etiquetaActual: 'Contraseña actual',
  marcadorActual: 'Ingresa tu contraseña actual',
  etiquetaNueva: 'Nueva contraseña',
  marcadorNueva: 'Ingresa tu nueva contraseña',
  etiquetaConfirmacion: 'Confirmar nueva contraseña',
  marcadorConfirmacion: 'Repite tu nueva contraseña',
  tituloRequisitos: 'Tu nueva contraseña debe tener:',
  requisitos: ['Al menos 8 caracteres.', 'Una mayúscula, una minúscula y un número.'],
  etiquetaBoton: 'Guardar contraseña',
  exitoTitulo: 'Contraseña cambiada correctamente',
  exitoDescripcion: 'Tu contraseña fue actualizada',
  etiquetaAceptar: 'Aceptar',
};

export const TEXTOS_PERFIL = {
  titulo: 'Mi perfil',
  subtitulo: 'Actualiza tus datos personales.',
  cambiarFoto: 'Cambiar foto',
  etiquetaNombre: 'Nombre completo',
  etiquetaCorreo: 'Correo electrónico',
  etiquetaTelefono: 'Teléfono (opcional)',
  marcadorTelefono: '+52 55 1234 5678',
  etiquetaOficio: 'Oficio (opcional)',
  marcadorOficio: 'Plomero',
  etiquetaRol: 'Rol de cuenta',
  noEditable: 'No editable',
  cambiarContrasena: 'Cambiar contraseña',
  etiquetaGuardar: 'Guardar cambios',
  etiquetaCerrarSesion: 'Cerrar sesión',
  exito: 'Cambios guardados',
  errorCarga: 'No se pudo cargar tu perfil.',
  errorGaleria: 'No se pudo abrir la galería',
  reintentar: 'Reintentar',
};

export const TEXTOS_CODIGOS_ACCESO = {
  titulo: 'Códigos de acceso a la empresa',
  subtitulo:
    'Comparte cada código con supervisores o trabajadores para que accedan a la información ' +
    'de la empresa. Los códigos se mantendrán vigentes hasta que se regeneren',
  tituloSupervisor: 'Código del supervisor',
  descripcionSupervisor:
    'Solo tú, como dueño, puedes regenerarlo. El código del trabajador no cambia.',
  tituloTrabajador: 'Código del trabajador',
  descripcionTrabajador:
    'Solo tú, como dueño, puedes regenerarlo. El código del supervisor no cambia.',
  regenerar: 'Regenerar código',
  codigoCopiado: 'Código copiado',
  codigoCambiado: 'Código cambiado correctamente',
  confirmarTitulo: '¿Seguro de que quieres cambiar el código de ingreso?',
  confirmarDescripcion:
    'Si cambias el código los trabajadores ya no podrán acceder con el anterior.',
  errorRegenerar: 'No se pudo cambiar el código. Intente de nuevo',
  errorCopiar: 'No se pudo copiar el código',
  reintentar: 'Reintentar',
};

export const TEXTOS_DATOS_EMPRESA = {
  titulo: 'Datos de la empresa',
  subtitulo: 'Información de tu empresa.',
  cambiarLogotipo: 'Cambiar logotipo',
  formatoLogotipo: 'JPG o PNG · Máximo 5 MB',
  etiquetaNombre: 'Nombre de empresa',
  etiquetaCorreo: 'Correo de empresa',
  marcadorCorreo: 'Agrega correo electrónico...',
  etiquetaDescripcion: 'Descripción',
  marcadorDescripcion: 'Agregar descripción...',
  etiquetaUbicacion: 'Ubicación de la empresa',
  marcadorUbicacion: 'Agregar dirección...',
  editar: 'Editar',
  aceptar: 'Aceptar',
  guardar: 'Guardar cambios',
  confirmarTitulo: '¿Seguro de que quieres actualizar los datos de la empresa?',
  confirmarDescripcion: 'El cambio será permanente',
  exito: 'Datos cambiados correctamente',
  errorCarga: 'No se pudieron cargar los datos de la empresa.',
  errorGuardar: 'No se pudo guardar. Intente de nuevo',
  errorGaleria: 'No se pudo abrir la galería',
  reintentar: 'Reintentar',
};
