/**
 * Clase de Error Personalizada para la Aplicación.
 * Nos permite crear errores operacionales que sabemos cómo manejar.
 * @extends Error
 */
class AppError extends Error {
  /**
   * @param {string} message - El mensaje de error para el cliente.
   * @param {number} statusCode - El código de estado HTTP (ej. 400, 404, 500).
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marcamos el error como operacional.

    // Capturamos el stack trace, excluyendo el constructor de AppError.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
