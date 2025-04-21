const { PointAssignment, User, Justification, sequelize } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai'); // Import OpenAI

// Initialize OpenAI client (reuse from reportService or centralize later)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Asignar puntos a un empleado (solo Admin)
const assignPoints = async (req, res) => {
  const adminUserId = req.dbUser.id; // UID del admin autenticado
  const adminCompanyId = req.dbUser.companyId;
  const { empleadoId, cantidad, justificacionId } = req.body; // empleadoId es el UID del empleado

  // --- Validaciones ---
  if (!empleadoId || cantidad === undefined || !justificacionId) {
    return res.status(400).send({ message: 'Se requiere ID de empleado, cantidad y ID de justificación.' });
  }
  if (!adminCompanyId) {
     return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }
  const pointsAmount = parseInt(cantidad);
  if (isNaN(pointsAmount) || pointsAmount === 0) {
     return res.status(400).send({ message: 'La cantidad debe ser un número entero distinto de cero.' });
  }
   if (isNaN(parseInt(justificacionId))) {
     return res.status(400).send({ message: 'El ID de justificación debe ser un número.' });
  }

  // --- Validación de Límites por Transacción ---
  const MAX_POINTS_ASSIGN = 1000; // Límite superior
  const MIN_POINTS_ASSIGN = -500; // Límite inferior (para quitar puntos)

  if (pointsAmount > MAX_POINTS_ASSIGN) {
      return res.status(400).send({ message: `No se pueden asignar más de ${MAX_POINTS_ASSIGN} puntos en una sola transacción.` });
  }
  if (pointsAmount < MIN_POINTS_ASSIGN) {
      return res.status(400).send({ message: `No se pueden quitar más de ${Math.abs(MIN_POINTS_ASSIGN)} puntos en una sola transacción.` });
  }

  let transaction; // Variable para la transacción

  try {
    // Iniciar transacción
    transaction = await sequelize.transaction();

    // 1. Validar que el empleado exista, esté activo y pertenezca a la misma compañía que el admin
    const employee = await User.findOne({
      where: {
        id: empleadoId,
        role: 'Employee',
        companyId: adminCompanyId,
        // isActive: true, // ¿Permitir asignar puntos a inactivos? Decisión de negocio. Por ahora sí.
      },
      attributes: ['id', 'points', 'isActive'], // Traer puntos actuales
      transaction // Incluir en la transacción
    });

    if (!employee) {
      await transaction.rollback(); // Revertir transacción
      return res.status(404).send({ message: 'Empleado no encontrado, inactivo o no pertenece a esta compañía.' });
    }

    // 2. Validar que la justificación exista, esté activa y sea global o de la compañía del admin
    const justification = await Justification.findOne({
      where: {
        id: parseInt(justificacionId),
        estaActiva: true,
        [Op.or]: [
          { companyId: null, esPredeterminada: true }, // Global activa
          { companyId: adminCompanyId } // O específica de la compañía (activa ya filtrado)
        ]
      },
      attributes: ['id', 'textoJustificacion'], // Traer texto para denormalizar
      transaction // Incluir en la transacción
    });

    if (!justification) {
       await transaction.rollback();
       return res.status(404).send({ message: 'Justificación no encontrada, inactiva o no válida para esta compañía.' });
    }

    // 3. Crear el registro de asignación de puntos
    const newAssignment = await PointAssignment.create({
      adminId: adminUserId,
      empleadoId: employee.id,
      companyId: adminCompanyId,
      cantidad: pointsAmount,
      justificacionId: justification.id,
      justificacionTexto: justification.textoJustificacion, // Guardar texto actual
      fechaAsignacion: new Date(), // O usar defaultValue
    }, { transaction }); // Incluir en la transacción

    // 4. Actualizar el saldo de puntos del empleado
    // Usamos increment para evitar condiciones de carrera si hubiera concurrencia
    await User.increment(
        { points: pointsAmount },
        { where: { id: employee.id }, transaction } // Incluir en la transacción
    );

    // Si todo fue bien, confirmar la transacción
    await transaction.commit();

    // Devolver la asignación creada y quizás el nuevo saldo del empleado
    // Volver a consultar el empleado para obtener el saldo actualizado
    const updatedEmployee = await User.findByPk(employee.id, { attributes: ['points'] });

    res.status(201).json({
        assignment: newAssignment,
        employeeNewBalance: updatedEmployee ? updatedEmployee.points : null // Nuevo saldo
    });

  } catch (error) {
    // Si hubo algún error, revertir la transacción
    if (transaction) await transaction.rollback();

    console.error('Error al asignar puntos:', error);
    // Manejar errores específicos si es necesario (ej. validación de Sequelize)
    if (error.name && error.name.includes('Sequelize')) {
       return res.status(400).send({ message: `Error de base de datos: ${error.message}` });
    }
    res.status(500).send({ message: 'Error interno al asignar puntos.' });
  }
};

// Helper function to calculate median
const calculateMedian = (values) => {
  if (values.length === 0) return 0;
  values.sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  if (values.length % 2) return values[half];
  return (values[half - 1] + values[half]) / 2.0;
};

// Obtener sugerencias de puntos para una justificación específica (solo Admin)
const getPointsSuggestionByJustification = async (req, res) => {
  const adminCompanyId = req.dbUser.companyId;
  const { justificationId } = req.params;

  if (!adminCompanyId) {
    return res.status(403).send({ message: 'El administrador no tiene una compañía asignada.' });
  }
  if (!justificationId || isNaN(parseInt(justificationId))) {
    return res.status(400).send({ message: 'Se requiere un ID de justificación numérico válido.' });
  }

  const justId = parseInt(justificationId);

  try {
    // Buscar asignaciones pasadas para esta justificación en esta compañía
    const assignments = await PointAssignment.findAll({
      where: {
        companyId: adminCompanyId,
        justificacionId: justId,
        cantidad: { [Op.gt]: 0 } // Considerar solo asignaciones positivas para sugerencias? Opcional.
      },
      attributes: ['cantidad'],
      raw: true, // Obtener solo los datos
    });

    if (assignments.length < 3) { // Requiere un mínimo de datos para sugerencia útil
      return res.status(200).json({
        message: 'No hay suficientes datos históricos para esta justificación para generar una sugerencia.',
        suggestion: null,
      });
    }

    const amounts = assignments.map(a => a.cantidad);

    // Calcular estadísticas
    const sum = amounts.reduce((acc, val) => acc + val, 0);
    const average = parseFloat((sum / amounts.length).toFixed(2));
    const median = calculateMedian(amounts);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    // Formatear sugerencia
    // Podríamos hacer algo más inteligente como buscar el rango más común, pero esto es un MVP
    const suggestionText = `Para esta justificación, usualmente se asignan entre ${min} y ${max} puntos (promedio: ${average}, mediana: ${median}).`;

    res.status(200).json({
      message: suggestionText,
      suggestion: {
        average,
        median,
        min,
        max,
        count: amounts.length,
      }
    });

  } catch (error) {
    console.error(`Error al obtener sugerencias para justificación ${justId}:`, error);
    res.status(500).send({ message: 'Error interno al obtener sugerencias de puntos.' });
  }
};


// Generar mensaje de reconocimiento usando IA (solo Admin)
const generateRecognitionMessage = async (req, res) => {
  const { employeeName, justificationText, points } = req.body;

  if (!employeeName || !justificationText || points === undefined) {
    return res.status(400).send({ message: 'Se requiere nombre del empleado, texto de justificación y puntos.' });
  }

  const pointsValue = parseInt(points);
   if (isNaN(pointsValue) || pointsValue === 0) {
     return res.status(400).send({ message: 'Los puntos deben ser un número distinto de cero.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set. Cannot generate AI message.');
    // Return a generic message or indicate AI is unavailable
    return res.status(200).json({ suggestions: [`¡Buen trabajo, ${employeeName}! Recibiste ${pointsValue} puntos por: ${justificationText}`] });
  }

  // Construct prompt for AI
  const prompt = `
Eres un asistente de RRHH experto en escribir mensajes de reconocimiento positivos y motivadores para empleados en español latinoamericano.
Genera 2-3 opciones de mensajes cortos y alentadores para un empleado llamado "${employeeName}" que ha recibido ${pointsValue} puntos por el siguiente motivo: "${justificationText}".
Los mensajes deben ser adecuados para un entorno laboral profesional pero cercano. Varía ligeramente el tono y enfoque entre las opciones. No uses emojis. No incluyas la cantidad de puntos en el mensaje final.

Formato de Salida Esperado (SOLO los mensajes, cada uno en una nueva línea, sin numeración ni guiones):
[Mensaje opción 1]
[Mensaje opción 2]
[Mensaje opción 3]
`;

  console.log(`[AI Message Gen] Generating message for ${employeeName}, reason: ${justificationText}, points: ${pointsValue}`);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Suitable for creative text generation
      messages: [
        { role: "system", content: "Eres un asistente de RRHH experto en escribir mensajes de reconocimiento positivos y motivadores en español latinoamericano." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7, // Higher temperature for more creative/varied outputs
      max_tokens: 200, // Enough for a few short messages
      n: 1, // Request one completion, which should contain multiple suggestions based on prompt
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    // Split the response into individual suggestions (assuming newline separation)
    const suggestions = rawContent ? rawContent.split('\n').filter(line => line.trim() !== '') : ["¡Excelente trabajo!", `¡Gracias por tu esfuerzo, ${employeeName}!`]; // Fallback suggestions

    console.log(`[AI Message Gen] Generated ${suggestions.length} suggestions.`);
    res.status(200).json({ suggestions });

  } catch (error) {
    console.error("[AI Message Gen] Error calling OpenAI API:", error);
    res.status(500).send({ message: 'Error al generar el mensaje de reconocimiento con IA.' });
  }
};


// TODO: Implementar endpoint para obtener historial de puntos asignados (para Admin)
// const getPointAssignmentHistory = async (req, res) => { ... }

module.exports = {
  assignPoints,
  getPointsSuggestionByJustification,
  generateRecognitionMessage, // Exportar la nueva función
  // getPointAssignmentHistory,
};
