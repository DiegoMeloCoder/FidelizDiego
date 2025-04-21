const { PointAssignment, Redemption, Reward, User, Justification } = require('../models');
const { Op, Sequelize } = require('sequelize');
const OpenAI = require('openai'); // Import OpenAI

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in your environment variables (.env file at the root)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gathers aggregated data for a specific company within a date range.
 * @param {string} companyId - The ID of the company.
 * @param {Date} startDate - The start date of the period.
 * @param {Date} endDate - The end date of the period.
 * @returns {Promise<object>} - Aggregated data object.
 */
const getAggregatedReportData = async (companyId, startDateInput, endDateInput) => {
  // Adjust end date to include the whole day
  const startDate = new Date(startDateInput);
  const endDate = new Date(endDateInput);
  endDate.setDate(endDate.getDate() + 1); // Add one day to make the range exclusive of the next day's start

  console.log(`Fetching report data for company ${companyId} from ${startDate.toISOString()} up to (exclusive) ${endDate.toISOString()}`);

  // Use Op.gte (greater than or equal) and Op.lt (less than)
  const dateFilter = {
    [Op.gte]: startDate,
    [Op.lt]: endDate,
  };

  try {
    // --- Run queries concurrently ---
    const [
      totalPointsAssignedResult,
      totalPointsRedeemedResult,
      redemptionCounts,
      activeAssignedUsers,
      activeRedeemedUsers,
      totalEmployeesResult,
      averageBalanceResult,
      justificationCounts,
    ] = await Promise.all([
      // 1. Total points assigned
      PointAssignment.sum('cantidad', {
        where: { companyId, fechaAsignacion: dateFilter },
      }),
      // 2. Total points redeemed
      Redemption.sum('puntosCosto', {
        where: { companyId, fechaCanje: dateFilter },
      }),
      // 3 & 4. Redemption counts by reward (for top/least)
      Redemption.findAll({
        where: { companyId, fechaCanje: dateFilter },
        attributes: [
          'recompensaId',
          [Sequelize.fn('COUNT', Sequelize.col('recompensaId')), 'redemptionCount'],
        ],
        include: [{ model: Reward, as: 'reward', attributes: ['nombre'] }], // Use the alias 'reward'
        group: ['recompensaId', 'reward.id', 'reward.nombre'], // Use alias in group as well
        order: [[Sequelize.literal('"redemptionCount"'), 'DESC']], // Order by count descending
        raw: true, // Get plain objects
        nest: true, // Nest the Reward object
      }),
      // 5a. Active employees (assigned points)
      PointAssignment.findAll({
        where: { companyId, fechaAsignacion: dateFilter },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('empleadoId')), 'userId']],
        raw: true,
      }),
      // 5b. Active employees (redeemed points)
      Redemption.findAll({
        where: { companyId, fechaCanje: dateFilter },
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('empleadoId')), 'userId']],
        raw: true,
      }),
      // 6. Total active employees in the company
      User.count({
        where: { companyId, role: 'Employee', isActive: true }, // Corrected casing
      }),
      // 7. Average point balance for active employees
      User.findOne({
        where: { companyId, role: 'Employee', isActive: true }, // Corrected casing
        attributes: [[Sequelize.fn('AVG', Sequelize.col('points')), 'averageBalance']],
        raw: true,
      }),
      // 8. Top 3 Justifications
      PointAssignment.findAll({
        where: { companyId, fechaAsignacion: dateFilter, justificacionId: { [Op.ne]: null } }, // Exclude null justifications if any
        attributes: [
          'justificacionId',
          [Sequelize.fn('COUNT', Sequelize.col('justificacionId')), 'justificationCount'],
        ],
        include: [{ model: Justification, as: 'justification', attributes: ['textoJustificacion'] }], // Use alias 'justification'
        group: ['justificacionId', 'justification.id', 'justification.textoJustificacion'], // Use alias in group
        order: [[Sequelize.literal('"justificationCount"'), 'DESC']],
        limit: 3,
        raw: true,
        nest: true,
      }),
    ]);

    // --- Process results ---

    // Combine active user IDs and get unique count
    const activeUserIds = new Set([
        ...activeAssignedUsers.map(u => u.userId),
        ...activeRedeemedUsers.map(u => u.userId)
    ]);
    const activeEmployeesCount = activeUserIds.size;
    const totalEmployeesCount = totalEmployeesResult || 0;
    const activeEmployeesPercentage = totalEmployeesCount > 0
      ? parseFloat(((activeEmployeesCount / totalEmployeesCount) * 100).toFixed(2))
      : 0;

    // Format redemption counts (Access nested data using the alias)
    const formattedRedemptions = redemptionCounts.map(r => ({
        name: r.reward.nombre, // Use the alias 'reward' here
        count: parseInt(r.redemptionCount, 10), // Ensure count is integer
    }));

    // Get top 5 and least 5 (if available)
    const topRedeemedRewardsVolume = formattedRedemptions.slice(0, 5);
    // For least redeemed, reverse the full list and take top 5 (rewards redeemed at least once)
    const leastRedeemedRewardsVolume = [...formattedRedemptions].reverse().slice(0, 5);

    // Format justification counts (Access nested data using the alias)
    const topJustifications = justificationCounts.map(j => ({
        name: j.justification.textoJustificacion, // Use alias 'justification' here
        count: parseInt(j.justificationCount, 10),
    }));

    const data = {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      companyId: companyId,
      totals: {
        pointsAssigned: totalPointsAssignedResult || 0,
        pointsRedeemed: totalPointsRedeemedResult || 0,
      },
      engagement: {
         activeEmployeesCount: activeEmployeesCount,
         totalEmployeesCount: totalEmployeesCount,
         activeEmployeesPercentage: activeEmployeesPercentage,
         averagePointBalance: averageBalanceResult ? parseFloat(averageBalanceResult.averageBalance).toFixed(2) : 0,
      },
      rewardsActivity: {
         topRedeemedByVolume: topRedeemedRewardsVolume,
         leastRedeemedByVolume: leastRedeemedRewardsVolume, // Note: These are the least redeemed *among those that were redeemed*
      },
      recognitionPatterns: {
         topJustifications: topJustifications,
      },
      // Raw data can be added here if needed for the prompt, but derived stats are usually better
    };

    console.log("Report data fetched successfully:", JSON.stringify(data, null, 2));
    return data;

  } catch (error) {
    console.error('Error fetching aggregated report data:', error);
    // Return a default structure or throw error? Let's throw for now.
    throw new Error('Failed to fetch report data');
  }
};

/**
 * Generates a descriptive report summary using an AI model.
 * @param {object} aggregatedData - The data collected by getAggregatedReportData.
 * @returns {Promise<string>} - The AI-generated report summary text.
 */
const generateReportWithAI = async (aggregatedData) => {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set. Returning placeholder summary.');
    return `AI integration disabled. Report Data: ${JSON.stringify(aggregatedData)}`;
  }

  // Construct the prompt for the AI
  const prompt = `
Eres un asistente de análisis de datos para una plataforma de fidelización de empleados llamada FidelizDiego.
Genera un reporte descriptivo conciso y profesional basado en los siguientes datos agregados para una empresa cliente, cubriendo el período desde ${aggregatedData.period.startDate} hasta ${aggregatedData.period.endDate}.

Datos Agregados:
- Puntos Totales Asignados: ${aggregatedData.totals.pointsAssigned}
- Puntos Totales Canjeados: ${aggregatedData.totals.pointsRedeemed}
- Empleados Activos (asignaron/recibieron/canjearon): ${aggregatedData.engagement.activeEmployeesCount} de ${aggregatedData.engagement.totalEmployeesCount} (${aggregatedData.engagement.activeEmployeesPercentage}%)
- Saldo Promedio de Puntos por Empleado Activo: ${aggregatedData.engagement.averagePointBalance}
- Top 5 Recompensas Más Canjeadas (por volumen): ${aggregatedData.rewardsActivity.topRedeemedByVolume.map(r => `${r.name} (${r.count})`).join(', ') || 'Ninguna'}
- Top 5 Recompensas Menos Canjeadas (entre las canjeadas): ${aggregatedData.rewardsActivity.leastRedeemedByVolume.map(r => `${r.name} (${r.count})`).join(', ') || 'Ninguna'}
- Top 3 Justificaciones para Asignación de Puntos: ${aggregatedData.recognitionPatterns.topJustifications.map(j => `${j.name} (${j.count})`).join(', ') || 'Ninguna'}

Instrucciones para el Reporte Avanzado:
1.  **Resumen Ejecutivo (1-2 párrafos):** Escribe un resumen conciso en lenguaje natural destacando los hallazgos más importantes del período. Enfócate en la actividad general (puntos asignados vs. canjeados), el engagement (% empleados activos) y las recompensas/justificaciones más populares.
2.  **Puntos Clave (Lista):** Presenta una lista breve (3-5 puntos) de las métricas o hallazgos más relevantes extraídos directamente de los datos (ej. "El X% de los empleados participaron activamente.", "La recompensa más popular fue Y.").
3.  **Análisis Interno del Período (Lista, si aplica):** Analiza los datos *dentro* de este período. ¿Hay alguna concentración notable en las recompensas canjeadas (pocos ítems dominan)? ¿La justificación principal es significativamente más usada que las otras? ¿Hay un desbalance grande entre puntos asignados y canjeados? Menciona 1-2 observaciones si son evidentes en los datos. No compares con períodos anteriores.
4.  **Insights Preliminares (Lista, 1-2 puntos, si aplica):** Basándote *estrictamente* en los datos proporcionados y el análisis interno, sugiere posibles interpretaciones o áreas a observar. Usa lenguaje cauto (ej. "podría indicar", "sugiere revisar"). Ejemplo: "La concentración de canjes en pocas recompensas podría indicar una oportunidad para diversificar la oferta o ajustar los puntos de otras." o "El alto uso de la justificación X confirma su relevancia."

Formato de Salida Esperado:
**Resumen Ejecutivo:**
[Tu resumen aquí]

**Puntos Clave:**
- [Punto clave 1]
- [Punto clave 2]
...

**Análisis Interno del Período:**
- [Observación interna 1, si aplica]
- [Observación interna 2, si aplica]
...

**Insights Preliminares:**
- [Insight 1, si aplica]
- [Insight 2, si aplica]
...

Sé objetivo y basa todas tus conclusiones estrictamente en los datos proporcionados. No inventes información. No des consejos directos, solo análisis descriptivo e interpretaciones preliminares basadas en datos.
`;

  console.log("Sending prompt to OpenAI...");
  // console.log("Prompt:", prompt); // Uncomment for debugging prompt structure

  try {
    const completion = await openai.chat.completions.create({
      // Consider using a more capable model if gpt-3.5-turbo struggles with insights/trends
      model: "gpt-3.5-turbo", // e.g., "gpt-4o-mini" or "gpt-4-turbo" if available and budget allows
      messages: [
        { role: "system", content: "Eres un asistente experto en análisis de datos para la plataforma de fidelización FidelizDiego. Tu tarea es generar reportes concisos, objetivos y basados estrictamente en datos, identificando tendencias e insights preliminares." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4, // Slightly higher temp might help with insights, but keep it low for factuality
      max_tokens: 600, // Increase max tokens to allow for longer analysis
    }, {
      timeout: 60000, // 60 seconds timeout - Added timeout
    });

    const reportContent = completion.choices[0]?.message?.content?.trim() || "No se pudo generar el reporte avanzado.";
    console.log("AI advanced report generated successfully.");
    // console.log("AI Response:", reportContent); // Uncomment for debugging AI output
    return reportContent; // Return the full report content

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // Check if the error is due to a timeout
    if (error instanceof OpenAI.APIConnectionTimeoutError || error.code === 'ETIMEDOUT' || (error.response && error.response.status === 408)) {
       console.error("OpenAI API request timed out.");
       throw new Error('The AI report generation timed out. Please try again later or with a smaller date range.');
    }
    // Consider more specific error handling (e.g., API key issues, rate limits)
    throw new Error('Failed to generate report summary with AI. Please check server logs for details.');
  }
};

module.exports = {
  getAggregatedReportData,
  generateReportWithAI,
};
