const {
  PointAssignment,
  User,
  Justification,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');
const AppError = require('../utils/AppError');
const { POINT_ASSIGNMENT_LIMITS } = require('../utils/constants');

// --- Lógica de Asignación de Puntos ---

const assignPointsService = async (
  adminUserId,
  adminCompanyId,
  assignmentData
) => {
  const { empleadoId, cantidad, justificacionId } = assignmentData;
  const pointsAmount = parseInt(cantidad, 10);

  // Validaciones de negocio
  if (
    pointsAmount > POINT_ASSIGNMENT_LIMITS.MAX ||
    pointsAmount < POINT_ASSIGNMENT_LIMITS.MIN
  ) {
    throw new AppError(
      `La cantidad de puntos debe estar entre ${POINT_ASSIGNMENT_LIMITS.MIN} y ${POINT_ASSIGNMENT_LIMITS.MAX}.`,
      400
    );
  }
  if (!adminCompanyId) {
    throw new AppError(
      'El administrador no tiene una compañía asignada para realizar esta acción.',
      403
    );
  }

  const transaction = await sequelize.transaction();
  try {
    // 1. Validar empleado
    const employee = await User.findOne({
      where: { id: empleadoId, role: 'Employee', companyId: adminCompanyId },
      attributes: ['id', 'points'],
      transaction,
    });
    if (!employee) {
      throw new AppError(
        'Empleado no encontrado o no pertenece a esta compañía.',
        404
      );
    }

    // 2. Validar justificación
    const justification = await Justification.findOne({
      where: {
        id: justificacionId,
        estaActiva: true,
        [Op.or]: [
          { companyId: null, esPredeterminada: true },
          { companyId: adminCompanyId },
        ],
      },
      attributes: ['id', 'textoJustificacion'],
      transaction,
    });
    if (!justification) {
      throw new AppError(
        'Justificación no encontrada, inactiva o no válida para esta compañía.',
        404
      );
    }

    // 3. Crear el registro de asignación
    const newAssignment = await PointAssignment.create(
      {
        adminId: adminUserId,
        empleadoId: employee.id,
        companyId: adminCompanyId,
        cantidad: pointsAmount,
        justificacionId: justification.id,
        justificacionTexto: justification.textoJustificacion,
      },
      { transaction }
    );

    // 4. Actualizar saldo del empleado
    await employee.increment('points', { by: pointsAmount, transaction });

    await transaction.commit();

    return {
      assignment: newAssignment,
      employeeNewBalance: employee.points + pointsAmount,
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Error en PointService al asignar puntos:', error);
    if (error instanceof AppError) throw error;
    throw new AppError('Error interno al asignar los puntos.', 500);
  }
};

// --- Lógica de Sugerencias Estadísticas ---

const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
};

const getSuggestionService = async (adminCompanyId, justificationId) => {
  const assignments = await PointAssignment.findAll({
    where: {
      companyId: adminCompanyId,
      justificacionId: justificationId,
      cantidad: { [Op.gt]: 0 },
    },
    attributes: ['cantidad'],
    raw: true,
  });

  if (assignments.length < 3) {
    return {
      message:
        'No hay suficientes datos históricos para generar una sugerencia.',
      suggestion: null,
    };
  }

  const amounts = assignments.map((a) => a.cantidad);
  const sum = amounts.reduce((acc, val) => acc + val, 0);
  const average = parseFloat((sum / amounts.length).toFixed(2));
  const median = calculateMedian(amounts);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  const suggestionText = `Para esta justificación, usualmente se asignan entre ${min} y ${max} puntos.`;

  return {
    message: suggestionText,
    suggestion: { average, median, min, max, count: amounts.length },
  };
};

// --- Lógica de Integración con IA ---

const generateRecognitionMessageService = async (messageData) => {
  const { employeeName, justificationText, points } = messageData;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      'OPENAI_API_KEY no configurada. Devolviendo mensaje genérico.'
    );
    return [
      `¡Buen trabajo, ${employeeName}! Has sido reconocido por: ${justificationText}`,
    ];
  }

  const openai = new OpenAI({ apiKey });
  const prompt = `
    Eres un asistente de RRHH experto en escribir mensajes de reconocimiento positivos y motivadores en español latinoamericano.
    Genera 2-3 opciones de mensajes cortos y alentadores para un empleado llamado "${employeeName}" que ha recibido ${points} puntos por el siguiente motivo: "${justificationText}".
    Los mensajes deben ser adecuados para un entorno laboral profesional pero cercano. Varía ligeramente el tono y enfoque entre las opciones. No uses emojis. No incluyas la cantidad de puntos en el mensaje final.

    Formato de Salida Esperado (SOLO los mensajes, cada uno en una nueva línea, sin numeración ni guiones):
    [Mensaje opción 1]
    [Mensaje opción 2]
    [Mensaje opción 3]
    `;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente de RRHH experto en escribir mensajes de reconocimiento positivos y motivadores en español latinoamericano.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
      n: 1,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    const suggestions = rawContent
      ? rawContent.split('\n').filter((line) => line.trim() !== '')
      : [
          `¡Excelente trabajo, ${employeeName}!`,
          `¡Gracias por tu gran esfuerzo!`,
        ];
    return suggestions;
  } catch (error) {
    console.error('[AI Service] Error llamando a la API de OpenAI:', error);
    throw new AppError(
      'Error al generar el mensaje de reconocimiento con IA.',
      503
    ); // 503 Service Unavailable
  }
};

module.exports = {
  assignPointsService,
  getSuggestionService,
  generateRecognitionMessageService,
};
