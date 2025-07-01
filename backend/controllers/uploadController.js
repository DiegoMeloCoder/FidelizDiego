const AppError = require('../utils/AppError');

/**
 * Un manejador genérico para después de una subida de archivo exitosa con multer-s3.
 * Asume que el middleware de multer ya se ejecutó y adjuntó `req.file`.
 * Responde con la URL pública del archivo subido.
 */
const handleUploadSuccess = (req, res, next) => {
  // El middleware 'multer-s3' añade la propiedad 'location' a req.file si la subida fue exitosa.
  if (!req.file || !req.file.location) {
    // Esta es una salvaguarda. Si llegamos aquí sin un archivo, algo salió mal en el middleware.
    // Usamos nuestro manejador de errores global para una respuesta consistente.
    console.error(
      'Controlador de subida alcanzado sin la ubicación del archivo en req.file.'
    );
    return next(
      new AppError(
        'La subida del archivo falló o la ubicación del archivo está ausente.',
        400
      )
    );
  }

  // Respondemos con el formato JSend estandarizado.
  res.status(200).json({
    status: 'success',
    message: 'Archivo subido exitosamente.',
    data: {
      imageUrl: req.file.location, // La URL pública que S3 nos proporciona.
    },
  });
};

module.exports = {
  handleUploadSuccess,
};
