/**
 * User-friendly error messages for different error scenarios
 */

export interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
}

export function getErrorInfo(error: Error | string): ErrorInfo {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const lowerError = errorMessage.toLowerCase();

  // Network/Connection errors
  if (lowerError.includes('failed to fetch') || lowerError.includes('network')) {
    return {
      title: 'Error de conexión',
      message: 'No pudimos conectar con el servidor',
      suggestion: 'Verifica tu conexión a internet e intenta nuevamente',
      retryable: true
    };
  }

  // Timeout errors
  if (lowerError.includes('tardó más de') || lowerError.includes('timeout')) {
    return {
      title: 'Tiempo de espera agotado',
      message: 'La solicitud está tardando más de lo esperado',
      suggestion: 'Esto puede deberse a una conexión lenta. Por favor, intenta nuevamente',
      retryable: true
    };
  }

  // Invalid email format
  if (lowerError.includes('formato') && lowerError.includes('correo')) {
    return {
      title: 'Correo inválido',
      message: 'El formato del correo electrónico no es válido',
      suggestion: 'Verifica que tu correo tenga el formato: usuario@dominio.com',
      retryable: false
    };
  }

  // Verification code errors
  if (lowerError.includes('código') && (lowerError.includes('inválido') || lowerError.includes('incorrecto'))) {
    return {
      title: 'Código incorrecto',
      message: 'El código de verificación no es válido',
      suggestion: 'Revisa que hayas ingresado correctamente los 6 dígitos del código',
      retryable: true
    };
  }

  if (lowerError.includes('código') && lowerError.includes('expirado')) {
    return {
      title: 'Código expirado',
      message: 'El código de verificación ya no es válido',
      suggestion: 'Solicita un nuevo código de verificación',
      retryable: true
    };
  }

  // Authentication errors
  if (lowerError.includes('no tiene') && lowerError.includes('código')) {
    return {
      title: 'Sin código de verificación',
      message: 'No se encontró un código de verificación guardado',
      suggestion: 'Por favor, regístrate nuevamente para recibir un nuevo código',
      retryable: false
    };
  }

  // Server errors (5xx)
  if (lowerError.includes('500') || lowerError.includes('servidor')) {
    return {
      title: 'Error del servidor',
      message: 'Ocurrió un problema en nuestros servidores',
      suggestion: 'Nuestro equipo está trabajando en solucionarlo. Por favor, intenta nuevamente en unos minutos',
      retryable: true
    };
  }

  // Webhook errors
  if (lowerError.includes('webhook')) {
    return {
      title: 'Error de comunicación',
      message: 'No pudimos procesar tu solicitud',
      suggestion: 'Por favor, intenta nuevamente. Si el problema persiste, contacta a soporte',
      retryable: true
    };
  }

  // Database errors
  if (lowerError.includes('database') || lowerError.includes('bd')) {
    return {
      title: 'Error de almacenamiento',
      message: 'No pudimos guardar tu información',
      suggestion: 'Por favor, intenta nuevamente en unos momentos',
      retryable: true
    };
  }

  // Validation errors
  if (lowerError.includes('requerido') || lowerError.includes('obligatorio')) {
    return {
      title: 'Campos incompletos',
      message: 'Falta completar información requerida',
      suggestion: 'Por favor, completa todos los campos marcados como obligatorios',
      retryable: false
    };
  }

  // Already exists errors
  if (lowerError.includes('ya existe') || lowerError.includes('duplicado')) {
    return {
      title: 'Ya registrado',
      message: 'Este correo ya está registrado en el sistema',
      suggestion: 'Si ya tienes una cuenta, intenta iniciar sesión en su lugar',
      retryable: false
    };
  }

  // Rate limit errors
  if (lowerError.includes('límite') || lowerError.includes('demasiados')) {
    return {
      title: 'Demasiados intentos',
      message: 'Has excedido el número de intentos permitidos',
      suggestion: 'Por favor, espera unos minutos antes de intentar nuevamente',
      retryable: true
    };
  }

  // Permission/Authorization errors
  if (lowerError.includes('permiso') || lowerError.includes('autorizado')) {
    return {
      title: 'Acceso denegado',
      message: 'No tienes permiso para realizar esta acción',
      suggestion: 'Por favor, verifica tus credenciales e intenta nuevamente',
      retryable: false
    };
  }

  // Generic fallback - but more helpful than before
  return {
    title: 'Ocurrió un problema',
    message: errorMessage || 'No pudimos completar tu solicitud',
    suggestion: 'Por favor, verifica tu información e intenta nuevamente. Si el problema persiste, contacta a soporte',
    retryable: true
  };
}

/**
 * Get a simple, user-friendly error message
 */
export function getSimpleErrorMessage(error: Error | string): string {
  const info = getErrorInfo(error);
  return `${info.message}. ${info.suggestion}`;
}
