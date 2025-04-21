# Plan de Implementación de Inteligencia Artificial - FidelizDiego

**Objetivo General:** Evolucionar FidelizDiego hacia una plataforma inteligente de engagement y fidelización, utilizando la IA para aportar valor medible y diferenciador a las empresas cliente, sus empleados y los aliados del marketplace.

**Principios Rectores:**

*   **Valor Tangible:** Cada funcionalidad de IA debe resolver un problema real o crear una oportunidad clara.
*   **Implementación Incremental:** Entregar valor en fases manejables, aprendiendo y adaptándose en cada paso.
*   **Experiencia de Usuario Fluida:** La IA debe integrarse de forma natural y mejorar, no complicar, la experiencia.
*   **Ética y Privacidad:** Máximo rigor en el manejo de datos, anonimización y transparencia.
*   **Viabilidad Técnica y Económica:** Seleccionar tecnologías y enfoques sostenibles.

---

**Fase 1: Fundamentos - Insights Descriptivos y Personalización Básica [COMPLETADO]**

*   **Objetivo:** Ofrecer valor inmediato a Administradores y Empleados utilizando los datos existentes y funcionalidades de IA relativamente sencillas, sentando las bases para análisis futuros.

    **1.1 Reportes Inteligentes Descriptivos (Generación Automatizada) [COMPLETADO]**
    *   **Concepto:** Permitir a los Administradores generar, con un clic, reportes periódicos (ej. mensuales) que combinen datos clave con un resumen descriptivo generado por IA.
    *   **Implementación Backend:** [COMPLETADO]
        *   [HECHO] Crear un nuevo servicio (`services/reportService.js`) y un endpoint (`POST /api/v1/reports/generate`).
        *   Este servicio recopilará datos agregados y anonimizados para el período seleccionado y la empresa específica:
            *   Total puntos asignados/canjeados.
            *   Top 5 recompensas más/menos canjeadas (por volumen y por puntos).
            *   Número y porcentaje de empleados activos (que asignaron/recibieron/canjearon).
            *   Saldo promedio de puntos.
            *   Tiempo medio entre recepción de puntos y primer canje (si es relevante).
            *   Distribución de puntos por justificación (top 3).
        *   Seleccionar una API de IA Generativa (inicialmente puede ser un modelo eficiente como GPT-3.5-Turbo, Claude-Instant, Gemini 1.0 Pro).
        *   Diseñar un prompt claro y estructurado que instruya a la IA para:
            *   Generar un **Resumen Ejecutivo** (1-2 párrafos) destacando los puntos clave del período en lenguaje natural y profesional.
            *   Identificar y listar claramente los **Datos Clave** (ej. top recompensas, % actividad).
            *   [HECHO] **NO** debe inventar datos, solo analizar los proporcionados.
        *   [HECHO] Manejar la llamada a la API de IA (considerar asincronía si la generación tarda) y devolver el texto generado junto con los datos crudos para gráficos.
    *   **Implementación Frontend:** [COMPLETADO]
        *   [HECHO] Añadir botón "Generar Reporte" en el Dashboard de Administrador, permitiendo seleccionar el período.
        *   [HECHO] Mostrar estado de carga.
        *   [HECHO] Presentar el reporte: Mostrar el Resumen Ejecutivo generado por IA.
        *   [PENDIENTE] Utilizar los datos crudos devueltos por el backend para renderizar gráficos simples (ej. con Chart.js o Recharts) de las métricas clave.
        *   [PENDIENTE] Añadir opción "Exportar a PDF" (utilizando `html2pdf.js` en el cliente o una solución backend como Puppeteer si se requiere más control).
    *   **Valor Agregado:** Ahorro significativo de tiempo para Admins, reportes consistentes y fáciles de entender, visión clara del uso del programa.
    *   **Dependencias:** Acceso estructurado a datos históricos de `PointAssignments` y `Redemptions`.
    *   **Consideraciones:** Costo de API (bajo-medio), calidad del prompt es clave, empezar con reportes mensuales. [HECHO]

    **1.2 Recomendaciones Personalizadas de Recompensas (MVP) [COMPLETADO]**
    *   **Concepto:** Añadir una sección "Recomendado para Ti" en el dashboard del empleado y/o en la página del catálogo de recompensas.
    *   **Implementación (MVP - Lógica de Negocio Backend):** [COMPLETADO]
        *   **Motor Simple Inicial:** [HECHO] No requiere IA compleja al principio. Se basará en reglas y datos existentes:
            *   **Popularidad General/Empresa:** Mostrar las recompensas más canjeadas globalmente y/o dentro de la empresa del empleado.
            *   **Historial Básico:** Si el empleado ha canjeado recompensas, sugerir otras de la misma categoría o del mismo aliado.
            *   **Puntos Disponibles:** Priorizar o destacar recompensas que el empleado puede canjear con su saldo actual o que están ligeramente por encima (ej. dentro del 10-20% adicional).
            *   [HECHO] **Novedad:** Destacar recompensas nuevas añadidas recientemente.
        *   [HECHO] El backend aplicará esta lógica al recuperar el catálogo de recompensas para un empleado específico y ordenará la lista.
    *   **Implementación Frontend:** [COMPLETADO]
        *   [HECHO] Mostrar las recompensas en el orden recibido del backend.
        *   [HECHO] Mostrar un badge "Recomendado" en las recompensas con `recommendation.score > 0`.
    *   **Valor Agregado:** Mejora la experiencia del empleado, facilita el descubrimiento de recompensas relevantes, aumenta la probabilidad de canje, hace que el programa se sienta más personalizado.
    *   **Dependencias:** Catálogo de recompensas (`Rewards`), historial de canjes (`Redemptions`), saldo de puntos del usuario (`Users`).
    *   **Consideraciones:** Empezar simple es clave. La complejidad (embeddings, filtrado colaborativo) se abordará en Fase 3. Asegurar que las recomendaciones no sean repetitivas. [HECHO]

---

**Fase 2: Inteligencia en Flujos Clave y Seguridad (Dificultad: Media-Alta)**

*   **Objetivo:** Integrar IA en procesos centrales como la asignación de puntos y añadir capas de inteligencia para optimización y detección de problemas.

    **2.1 Asistente de Asignación de Puntos (Sugerencias de Cantidad) [COMPLETADO]**
    *   **Concepto:** Al asignar puntos, ofrecer al Administrador una sugerencia basada en el historial de la empresa para la justificación seleccionada.
    *   **Implementación Backend:** [COMPLETADO]
        *   [HECHO] Crear endpoint `GET /api/v1/points/suggestions/justification/:justificationId`.
        *   [HECHO] El backend consulta `PointAssignments` pasados para esa `Justification.id` y `Company.id`.
        *   [HECHO] Calcula estadísticas simples (promedio, mediana, min, max) de `cantidad` para esa justificación en esa empresa.
        *   [HECHO] Devuelve un texto sugerente: "Para '[Nombre Justificación]', usualmente se asignan entre X e Y puntos (promedio: A, mediana: M)." o mensaje si no hay datos suficientes.
    *   **Implementación Frontend:** [COMPLETADO]
        *   [HECHO] Al cambiar la justificación en el modal de asignación, llamar al endpoint.
        *   [HECHO] Mostrar discretamente la sugerencia (con estado de carga) debajo del dropdown de justificación.
    *   **Valor Agregado:** Fomenta la consistencia en el reconocimiento, guía a nuevos administradores, puede ayudar a mantener la equidad percibida.
    *   **Dependencias:** Historial suficiente de `PointAssignments` con `justificationId`.
    *   **Consideraciones:** Manejar casos con poco historial o justificaciones nuevas. La sugerencia no debe ser impositiva. [HECHO]

    **2.2 Detección de Anomalías Básica (Preventiva) [COMPLETADO]**
    *   **Concepto:** Implementar un sistema (probablemente en el backend, quizás como un job periódico o gatillado por eventos) que monitoree patrones y detecte actividades potencialmente anómalas.
    *   **Implementación Backend:** [COMPLETADO]
        *   [HECHO] **Definir Reglas y Umbrales:** (Iniciales definidos en servicio: asignación grande, canje grande, frecuencia/valor alto diario)
            *   **Estadísticas:** Asignaciones/canjes significativamente por encima del promedio histórico del empleado/admin/empresa (ej. > 2-3 desviaciones estándar).
            *   **Frecuencia:** Múltiples canjes idénticos por el mismo empleado en un corto período.
            *   **Magnitud:** Asignaciones individuales que superen un umbral absoluto alto (configurable por empresa o globalmente).
            *   [PENDIENTE] **(Opcional) Horario:** Asignaciones realizadas fuera del horario laboral típico configurado (si aplica).
        *   [HECHO] **Mecanismo:** Job nocturno (`node-cron`) que analiza las transacciones del día anterior.
        *   [HECHO] **Alertas:** Anomalías guardadas en tabla `Anomalies`.
        *   [HECHO] API Endpoint (`GET /api/v1/anomalies`, `PATCH /api/v1/anomalies/:id/status`) para Managers.
        *   [PENDIENTE] Implementar mecanismo de notificación proactiva (email, etc.).
    *   **Implementación Frontend:** [COMPLETADO - MVP]
        *   [HECHO] Creada página `/manager/anomalies` para listar y gestionar (cambiar estado) anomalías.
        *   [PENDIENTE] Añadir filtros más avanzados (fecha, compañía específica si aplica).
        *   [PENDIENTE] (Opcional) Crear un pequeño panel de notificaciones para Admins donde se muestren estas alertas de forma no intrusiva.
    *   **Valor Agregado:** Aumenta la confianza y seguridad, ayuda a prevenir errores costosos o uso indebido, protege la integridad del programa.
    *   **Dependencias:** Historial detallado y timestamps precisos en `PointAssignments` y `Redemptions`.
    *   **Consideraciones:** Calibrar umbrales para evitar falsos positivos. La comunicación de alertas debe ser cuidadosa. [HECHO - Inicial]

    **2.3 Reportes Inteligentes Avanzados (Tendencias e Insights) [COMPLETADO - MVP]**
    *   **Concepto:** Evolucionar los reportes de Fase 1.1 para incluir análisis de tendencias y primeros insights accionables, utilizando modelos de IA más capaces.
    *   **Implementación Backend:** [COMPLETADO - MVP]
        *   [PENDIENTE] Utilizar un modelo de IA más potente (ej. GPT-4, Claude-3 Sonnet/Opus, Gemini 1.5 Pro) capaz de análisis más profundos. (Actualmente usando GPT-3.5-Turbo).
        *   [PENDIENTE] Enviar un conjunto de datos más rico (ej. datos históricos de varios meses, no solo el último período).
        *   [HECHO] Diseñar prompts más sofisticados para solicitar:
            *   [HECHO] **Identificación de Tendencias:** (Instrucción añadida al prompt).
            *   [HECHO] **Generación de Insights Preliminares:** (Instrucción añadida al prompt).
            *   [PENDIENTE] **(Opcional) Inclusión de Anomalías:** Resumen de las anomalías detectadas por el sistema 2.2.
    *   **Implementación Frontend:** [PENDIENTE]
        *   [PENDIENTE] Mejorar la presentación del reporte para incluir estas nuevas secciones de tendencias e insights (actualmente muestra todo como párrafos).
    *   **Valor Agregado:** Proporciona visión más estratégica, ayuda a los Admins a optimizar activamente su programa de fidelización.
    *   **Dependencias:** Fase 1.1 (base del reporte), Fase 2.2 (datos de anomalías si se incluyen).
    *   **Consideraciones:** Mayor costo de API, requiere prompts más elaborados y validación cuidadosa de los insights generados por la IA. [HECHO - Prompt inicial]

---

**Fase 3: Hacia la Predicción y la Interacción Enriquecida (Visión a Medio Plazo)**

*   **Objetivo:** Introducir capacidades predictivas y mejorar la interacción directa con la IA. (Estos puntos se detallarán más adelante, aquí un resumen).
    *   **3.1 Score de Engagement / Predicción de Desenganche (MVP) [COMPLETADO]**
        *   **Concepto:** Calcular un índice de participación por empleado/empresa basado en métricas clave (MVP: basado en actividad reciente).
        *   **Implementación Backend:** [COMPLETADO]
            *   [HECHO] Creado `engagementService.js` para calcular score (basado en asignaciones/canjes recientes).
            *   [HECHO] Creado `engagementController.js`.
            *   [HECHO] Creado endpoint `GET /api/v1/engagement/scores` (Admin/Manager).
        *   **Implementación Frontend:** [COMPLETADO]
            *   [HECHO] Modificado `ManageEmployees.jsx` para fetchear y mostrar scores en nueva columna.
        *   **Valor Agregado:** Métrica tangible inicial para medir participación.
        *   **Dependencias:** Historial de actividad (`PointAssignments`, `Redemptions`).
        *   **Consideraciones:** Modelo de score muy simple (MVP), evitar "señalar" empleados negativamente. [HECHO - MVP]
    *   **3.2 Generador de Mensajes de Reconocimiento [COMPLETADO]**
        *   **Concepto:** Asistir al Admin en la redacción de mensajes personalizados al asignar puntos.
        *   **Implementación Backend:** [COMPLETADO]
            *   [HECHO] Crear endpoint `POST /api/v1/points/generate-message`.
            *   [HECHO] El backend recibe nombre empleado, texto justificación y puntos.
            *   [HECHO] Llama a API de IA (GPT-3.5-Turbo) con prompt para generar 2-3 opciones de mensaje.
        *   **Implementación Frontend:** [COMPLETADO]
            *   [HECHO] Añadir botón "Generar Mensaje (AI)" en modal de asignación de puntos.
            *   [HECHO] Al hacer clic, llamar al endpoint con los datos del formulario.
            *   [HECHO] Mostrar las sugerencias generadas debajo del botón (con estado de carga/error).
        *   **Valor Agregado:** Mejora calidad y consistencia del reconocimiento, ahorra tiempo, fomenta cultura positiva.
        *   **Dependencias:** Integración con API de IA generativa.
        *   **Consideraciones:** Calidad del prompt para obtener mensajes adecuados, evitar que suenen genéricos. [HECHO - Prompt inicial]
    *   **3.3 Recomendaciones Personalizadas Avanzadas (IA Predictiva) [PENDIENTE]:** Mejorar el motor de Fase 1.2 con técnicas de ML más sofisticadas (filtrado colaborativo, embeddings, etc.).

---

**Fase 4: IA Conversacional y Estratégica (Visión a Largo Plazo)**

*   **Objetivo:** Crear interfaces conversacionales y utilizar la IA para análisis estratégicos a nivel de plataforma. (Resumen).
    *   **4.1 Asistente Admin (Copilot/Chatbot MVP):** Permitir a los Admins consultar sus datos y realizar acciones básicas mediante lenguaje natural (requiere RAG, Vector DBs).
    *   **4.2 Análisis de Tendencias Marketplace Global:** Usar datos agregados y anonimizados para que FidelizDiego optimice la oferta global de recompensas.
    *   **4.3 Reportes Predictivos:** Integrar predicciones (demanda futura, engagement) en los reportes para Admins.

---

**Consideraciones Transversales (A aplicar en todas las fases):**

*   **Ética y Privacidad:** Prioridad absoluta. Anonimizar datos siempre que sea posible. Ser transparentes con los usuarios sobre cómo se usa la IA. Cumplir con regulaciones (GDPR, etc.).
*   **Stack Tecnológico y Arquitectura:** Evaluar continuamente si la lógica de IA debe residir en el backend Node.js o si se justifica un microservicio (Python es común para ML). Considerar Vector Databases (pgvector, Pinecone, Weaviate) para fases avanzadas (RAG, embeddings).
*   **Gestión de Costos:** Monitorizar y optimizar el uso de APIs de IA y la infraestructura necesaria. Empezar con modelos más económicos donde sea posible.
*   **Monitorización y Evaluación:** Implementar logging y monitorización para las funcionalidades de IA. Evaluar periódicamente la calidad y utilidad de las predicciones/generaciones.
*   **Iteración y Feedback:** Recoger feedback de los usuarios (Admins, Empleados) después de cada fase para guiar las siguientes iteraciones y mejoras.

---
