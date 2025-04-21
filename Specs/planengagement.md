# Plan Detallado de Implementación: Engagement y Personalización Avanzada - Fideliz

**Objetivo:** Mejorar significativamente el engagement de los empleados y la personalización de la plataforma Fideliz, permitiendo a los usuarios expresar sus intereses, solicitar recompensas y valorar las existentes, y proporcionando insights valiosos a los administradores y managers.

**Principios:** Centrado en el usuario, implementación incremental, feedback accionable, consistencia.

---

**Fase 1: Backend - Actualización de Modelos y Base de Datos [HECHO]**

*   **Objetivo:** Establecer la estructura de datos necesaria para almacenar preferencias, solicitudes y votos.

    1.  **[HECHO] Modelo `User`:**
        *   Añadido campo `phoneNumber` (STRING, Opcional).
        *   Añadido campo `interests` (ARRAY(STRING), Opcional).
    2.  **[HECHO] Modelo `Reward`:**
        *   Añadido campo `tags` (ARRAY(STRING), Opcional).
        *   Añadidos campos `likes` (INTEGER, Default: 0).
        *   Añadidos campos `dislikes` (INTEGER, Default: 0).
    3.  **[HECHO] Nuevo Modelo `RewardVote`:**
        *   Creado con campos: `id`, `userId`, `rewardId`, `voteType` (ENUM).
        *   Añadido índice único en (`userId`, `rewardId`).
    4.  **[HECHO] Nuevo Modelo `RewardRequest`:**
        *   Creado con campos: `id`, `userId`, `companyId`, `requestedItem` (STRING, Requerido), `additionalNotes` (TEXT, Opcional), `status` (ENUM), `createdAt`, `updatedAt`. (Se reemplazó `requestText` por `requestedItem` y `additionalNotes`).
    5.  **[HECHO] Migraciones Sequelize:**
        *   Generadas y ejecutadas migraciones para:
            *   Añadir `phoneNumber` e `interests` a `Users`.
            *   Añadir `tags`, `likes`, `dislikes` a `Rewards`.
            *   Crear la tabla `RewardVotes`.
            *   Crear la tabla `RewardRequests`.
            *   Modificar `RewardRequests` para usar `requestedItem` y `additionalNotes`.
    6.  **[HECHO] Lista Predefinida de Intereses y Sugerencias:**
        *   Definidas listas iniciales como constantes en los componentes frontend correspondientes (`ProfilePage`, `ManageRewards`). (Pendiente mover a config centralizado si se requiere).

---

**Fase 2: Backend - Desarrollo de API Endpoints [HECHO]**

*   **Objetivo:** Exponer la funcionalidad necesaria a través de la API RESTful.

    1.  **[HECHO] API Perfil de Usuario (`authRoutes.js`, `authController.js`):**
        *   Modificado `PUT /api/v1/auth/profile`: Permite la actualización de `phoneNumber` e `interests` (con validación básica de intereses).
        *   Modificado `GET /api/v1/auth/me`: Devuelve los campos `phoneNumber` e `interests`.
    2.  **[HECHO] API Gestión de Recompensas (`rewardRoutes.js`, `rewardController.js`):**
        *   Modificados `POST /api/v1/rewards` y `PUT /api/v1/rewards/:id`: Permiten añadir/editar el campo `tags` (como array).
    3.  **[HECHO] API Votación de Recompensas (`rewardRoutes.js`, `rewardController.js`):**
        *   Creado `POST /api/v1/rewards/:rewardId/vote`:
            *   Recibe `{ voteType: 'like' | 'dislike' }`.
            *   Autenticado para Empleados.
            *   Implementada lógica transaccional para crear/actualizar/eliminar voto en `RewardVotes` y actualizar contadores `likes`/`dislikes` en `Rewards`.
    4.  **[HECHO] API Solicitud de Recompensas (`rewardRequestRoutes.js`, `rewardRequestController.js`):**
        *   Creado `POST /api/v1/rewards/requests`:
            *   Recibe `{ requestedItem: string, additionalNotes?: string }`.
            *   Autenticado para Empleados.
            *   Obtiene `userId` y `companyId`.
            *   Valida `requestedItem` contra lista predefinida.
            *   Crea registro en `RewardRequests`.
        *   Creado `GET /api/v1/rewards/requests`:
            *   Lista solicitudes con info de usuario y compañía.
            *   Permite filtrar por `companyId` (query param) y `status` (query param).
            *   Protegido para Admin/Manager.
        *   Creado `PATCH /api/v1/rewards/requests/:id`:
            *   Permite actualizar el `status` de una solicitud.
            *   Protegido para Admin/Manager (Admin solo de su compañía).
    5.  **[HECHO] API Estadísticas Dashboard (`statsController.js`, `statsRoutes.js`):**
        *   Creado `GET /api/v1/stats/company/common-interest`:
            *   Calcula interés más frecuente (global o por `companyId` vía query param).
            *   Protegido para Admin/Manager.
        *   Creado `GET /api/v1/stats/company/top-reward-requests`:
            *   Calcula top N (`limit` query param) de `requestedItem` más frecuentes (global o por `companyId` vía query param) con `status = 'new'`.
            *   Protegido para Manager (y Admin si se ajusta).

---

**Fase 3: Frontend - Interfaz de Usuario (Empleado) [HECHO - Parcial]**

*   **Objetivo:** Permitir a los empleados gestionar sus intereses, solicitar recompensas y votar.

    1.  **[HECHO] Página "Mi Perfil" (`/employee/profile`):**
        *   Creado componente `ProfilePage.jsx` y ruta.
        *   Añadido enlace en `AppLayout.jsx`.
        *   Muestra campos `nombre`, `email`, `phoneNumber` (editable).
        *   Muestra checkboxes para "Mis Intereses" predefinidos, permite selección múltiple.
        *   Botón "Guardar Cambios" llama a `PUT /api/v1/auth/profile` y refresca `userData`.
        *   Añadida sección "Sugerir Recompensa":
            *   Dropdown (`<select>`) con sugerencias predefinidas (`requestedItem`).
            *   Textarea opcional para `additionalNotes` (requerido si se selecciona "Otro").
            *   Botón "Enviar Sugerencia" llama a `POST /api/v1/rewards/requests`.
            *   Muestra feedback (éxito/error).
    2.  **[HECHO - Parcial] Catálogo de Recompensas (`AvailableRewards.jsx`):**
        *   Modificado `RewardCard` (o componente similar):
            *   Añadidos botones "Like" y "Dislike" con iconos.
            *   Añadida visualización de contadores `likes`/`dislikes`.
            *   Al hacer clic, llama a `POST /api/v1/rewards/:rewardId/vote`.
            *   Actualiza contadores en UI tras voto exitoso.
            *   **[PENDIENTE]** Persistencia visual del *estado* del botón del usuario (requiere cambios en API `GET /rewards`).

---

**Fase 4: Frontend - Interfaz de Usuario (Admin / Manager) [HECHO - Parcial]**

*   **Objetivo:** Mostrar los nuevos insights y permitir la gestión relacionada.

    1.  **[HECHO] Gestión de Recompensas (`ManageRewards.jsx`):**
        *   Reemplazado input de texto de `tags` por checkboxes predefinidos en formularios de creación y edición.
        *   Añadida columna "Votes (L/D)" a la tabla de recompensas.
    2.  **[HECHO] Dashboard Admin (`AdminDashboard.jsx`):**
        *   Añadido widget "Top Team Interest".
        *   Llama a `GET /api/v1/stats/company/common-interest` y muestra el resultado.
    3.  **[HECHO] Dashboard Manager (`ManagerDashboard.jsx`):**
        *   Añadido widget "Most Common Interest".
        *   Añadido widget "Top Reward Requests".
        *   Añadido dropdown para filtrar estadísticas por Compañía o Global.
        *   Llama a los endpoints de estadísticas correspondientes (`/common-interest`, `/top-reward-requests`) con/sin query param `companyId`.
    4.  **[HECHO - Básico] Gestión de Solicitudes (`ManageRewardRequests.jsx`):**
        *   Creada página y ruta `/manager/reward-requests`.
        *   Añadido enlace en `AppLayout.jsx`.
        *   Muestra tabla con solicitudes (Item, Notas, Empleado, Compañía, Fecha, Estado) llamando a `GET /api/v1/rewards/requests`.
        *   **[PENDIENTE]** Implementar filtros (compañía, estado).
        *   **[PENDIENTE]** Implementar funcionalidad para cambiar estado (`PATCH /api/v1/rewards/requests/:id`).

---

**Fase 5: Backend - Lógica de Negocio y Servicios [HECHO - Parcial]**

*   **Objetivo:** Implementar los cálculos y la lógica de recomendación mejorada.

    1.  **[HECHO] Lógica de Estadísticas (`statsController.js`):**
        *   Implementada lógica para calcular `getCompanyCommonInterest` (global/por compañía).
        *   Implementada lógica para calcular `getTopRewardRequests` (global/por compañía, usando `requestedItem`).
        *   **[PENDIENTE]** Refactorizar a `statsService.js` si la complejidad aumenta.
    2.  **[HECHO] Lógica de Recomendación Mejorada (`rewardController.js`):**
        *   Modificar la función que obtiene el catálogo para empleados:
            *   Recibir `userId` como parámetro.
            *   Obtener los `interests` del usuario.
            *   Obtener todas las recompensas activas (globales + de la empresa).
            *   Calcular un `score` de recomendación para cada recompensa:
                *   Puntos base (ej. por popularidad, novedad).
                *   **Bonus por Interés:** Añadir puntos significativos si alguna `tag` de la recompensa coincide con algún `interest` del usuario.
                *   **(Opcional) Ponderación por Votos:** Considerar la relación likes/dislikes (ej. `likes - dislikes` o `likes / (likes + dislikes)`).
            *   Ordenar las recompensas por este `score` descendente.
            *   Devolver la lista ordenada.

---

**Consideraciones Adicionales:**

*   **UI/UX:** Diseñar cuidadosamente las nuevas interfaces (perfil, votos, solicitudes) para que sean intuitivas.
*   **Performance:** Las consultas para estadísticas deben ser eficientes, especialmente con muchos usuarios/solicitudes. Considerar índices en la base de datos.
*   **Escalabilidad:** La lista de intereses predefinidos podría necesitar ser gestionada (añadir/quitar intereses) en el futuro.
*   **Feedback Loop:** Asegurarse de que los empleados vean (quizás indirectamente) que sus sugerencias y votos tienen impacto (ej. nuevas recompensas añadidas, categorías populares).
