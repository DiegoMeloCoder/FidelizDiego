const cron = require('node-cron');
const anomalyDetectionService = require('../services/anomalyDetectionService');

/**
 * Tarea programada para detectar anomalías en las asignaciones de puntos.
 * Se ejecuta diariamente a las 2:00 AM (America/Bogota).
 */
const scheduleAnomalyDetection = () => {
  cron.schedule(
    '0 2 * * *',
    async () => {
      console.log('[Cron Job] Ejecutando verificación diaria de anomalías...');

      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const checkEndTime = new Date(yesterday);
        checkEndTime.setDate(yesterday.getDate() + 1);

        const anomalies = await anomalyDetectionService.checkAnomalies(
          yesterday,
          checkEndTime
        );

        if (anomalies.length > 0) {
          console.warn(
            '[Cron Job] Se encontraron posibles anomalías:',
            JSON.stringify(anomalies, null, 2)
          );
          // TODO: Implementar mecanismo de alerta (ej. email, guardar en BD).
        } else {
          console.log('[Cron Job] No se detectaron anomalías.');
        }
      } catch (error) {
        // En lugar de dejar que el cron falle silenciosamente, podemos registrarlo.
        console.error(
          '[Cron Job] Error catastrófico ejecutando la verificación de anomalías:',
          error
        );
      }
    },
    {
      scheduled: true,
      timezone: 'America/Bogota',
    }
  );

  console.log(
    '[Cron Job] Tarea de detección de anomalías programada para las 2:00 AM (America/Bogota).'
  );
};

module.exports = {
  scheduleAnomalyDetection,
};
