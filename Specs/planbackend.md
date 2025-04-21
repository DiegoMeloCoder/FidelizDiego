# Plan Detallado de Integración de Backend y Despliegue - Fideliz

**Objetivo:** Evolucionar la aplicación MVP actual (Frontend + Firebase) a una arquitectura Full Stack robusta (Frontend + Backend API + Base de Datos Relacional), lista para despliegue en producción, siguiendo las mejores prácticas de desarrollo, seguridad y escalabilidad.

**Stack Tecnológico Propuesto:**
*   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios (para llamadas API).
*   **Backend:** Node.js, Express.js, Sequelize (ORM), PostgreSQL (Base de Datos).
*   **Autenticación:** Inicialmente, verificar Tokens ID de Firebase Auth en el backend. Evaluar migración futura si es necesario.
*   **Almacenamiento de Archivos:** AWS S3 (para imágenes de recompensas).
*   **Cache:** Redis (para optimizar consultas frecuentes).
*   **Tareas Asíncronas/Programadas:** Node-cron (o similar), potencialmente colas de mensajes si la complejidad aumenta.
*   **IA:** SDK de OpenAI.
*   **Contenerización:** Docker, Docker Compose.
*   **Despliegue:** AWS (EC2/ECS/Fargate, RDS, S3, ElastiCache, CloudFront), GitHub Actions (CI/CD).


---

## Fase 0: Fundación del Backend y Configuración Inicial [HECHO]

*   **Objetivo:** Establecer la estructura base del proyecto backend, configurar herramientas esenciales y preparar el entorno de desarrollo.
*   **Pasos:**
    1.  **[HECHO] Crear Directorio Backend:** Crear una carpeta `backend/` en la raíz del proyecto.
    2.  **[HECHO] Inicializar Proyecto Node.js:** Dentro de `backend/`, ejecutar `npm init -y`.
    3.  **[HECHO] Instalar Dependencias Core:**
        ```bash
        cd backend
        npm install express sequelize pg pg-hstore dotenv cors bcrypt jsonwebtoken axios redis ioredis node-cron openai @aws-sdk/client-s3 multer multer-s3
        npm install -D nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier @types/jest jest supertest sequelize-cli
        cd ..
        # Nota: aws-sdk (v2) fue desinstalado y reemplazado por @aws-sdk/client-s3 (v3)
        ```
    4.  **[HECHO] Configurar Estructura de Carpetas Backend:** Crear subdirectorios: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `services/`, `utils/`, `tests/`, `migrations/`, `seeders/`.
    5.  **[HECHO] Configurar Sequelize:**
        *   [HECHO] Crear archivo `config/database.js` (reemplazó config.json) para credenciales de BD. Usar variables de entorno (`dotenv`).
        *   [HECHO] Crear archivo `.sequelizerc` para definir paths.
        *   [HECHO] Inicializar Sequelize: `npx sequelize-cli init` (ajustará paths según `.sequelizerc`).
    6.  **[HECHO] Configurar Servidor Express Básico:** Crear `backend/server.js` con configuración inicial y middlewares.
    7.  **[HECHO] Configurar Linters y Formatters (ESLint + Prettier):** Crear archivos `.eslintrc.json`, `.prettierrc.json`. Añadir scripts `lint`, `format`.
    8.  **[HECHO] Configurar `nodemon`:** Añadir script `dev` y `start`.
    9.  **[HECHO] Crear Dockerfile para Backend:** `backend/Dockerfile`.
    10. **[HECHO] Crear `docker-compose.yml`:** Añadir servicios `postgres`, `redis`, `backend`. Crear `.env.example`.
    11. **[HECHO] Configurar CI/CD Básico (GitHub Actions):** Workflow inicial `backend-ci.yml` creado.


---

## Fase 1: Migración de Base de Datos y Modelos Core [HECHO]

*   **Objetivo:** Definir y crear la estructura de la base de datos en PostgreSQL usando Sequelize, basándose en el diseño original y adaptando la estructura de Firestore.
*   **Pasos:**
    1.  **[HECHO] Definir Modelos Sequelize:** Creados modelos `User`, `Company` (incluye branding), `Reward` (incluye `imageUrl`, `companyId` nullable), `Justification`, `PointAssignment`, `Redemption` con asociaciones básicas.
    2.  **[HECHO] Generar y Ejecutar Migraciones:** Generadas y ejecutadas migraciones para todas las tablas principales (incluye `imageUrl` y `companyId` nullable en `Rewards`, branding en `Companies`).
    3.  **[HECHO] Crear Seeders:** Creados y ejecutados seeders para justificaciones globales, compañía demo y manager inicial.
    4.  **Planificar Migración de Datos (Opcional):** Si hay datos críticos en Firestore que deban migrarse, diseñar y (si es necesario) implementar un script de migración. Para un MVP, podría ser aceptable la re-entrada manual de datos clave.

---

## Fase 2: Implementación de Autenticación y Autorización Backend [HECHO]

*   **Objetivo:** Asegurar que el backend pueda verificar usuarios autenticados y controlar el acceso a los endpoints según roles y pertenencia a empresas (multi-tenancy).
*   **Pasos:**
    1.  **[HECHO] Estrategia de Autenticación (Firebase Token Verification):**
        *   [HECHO] Configurar Firebase Admin SDK (`config/firebaseAdmin.js`) usando credenciales de archivo JSON.
        *   [HECHO] Crear middleware `authenticate` (`middleware/auth.js`) para verificar token ID.
    2.  **[HECHO] Middleware de Autorización:**
        *   [HECHO] Crear middleware `authorize(roles)` (`middleware/auth.js`) para verificar rol desde la BD.
        *   [HECHO] Crear middleware `checkTenant` (`middleware/auth.js`) para verificar pertenencia a compañía.
        *   **[HECHO]** Crear/Refinar middleware `checkSubscription` (`middleware/auth.js`):
            *   Verifica el estado (`status`) de la compañía asociada al usuario (Admin/Employee).
            *   **Comportamiento Actual:**
                *   Si `status` es `'inactive'`: Bloquea completamente el acceso (devuelve 403).
                *   Si `status` es `'pending_payment'`: Permite el acceso solo si se usa la opción `{ allowPending: true }` en la ruta (ideal para lectura/asistencia). Sin la opción, bloquea el acceso (devuelve 402).
                *   Si `status` es `'active'`: Permite el acceso.
            *   *Nota Futura:* Se podría evaluar permitir un modo "solo lectura" para el estado `'inactive'` en lugar del bloqueo total, aunque esto añadiría complejidad en backend y frontend.
    3.  **[HECHO] Endpoint de Perfil de Usuario:** Creada ruta `GET /api/v1/auth/me` con controlador y middlewares (`authenticate`, `authorize`, `checkSubscription({ allowPending: true })`).

---

## Fase 3: Migración de Funcionalidades Core a la API Backend [HECHO]

*   **Objetivo:** Reemplazar las llamadas directas a Firestore en el frontend por llamadas a la nueva API RESTful del backend. Esto implica crear los endpoints en el backend y refactorizar el frontend.
*   **Pasos (Iterativos: Backend Endpoint -> Frontend Refactor):**
    1.  **[HECHO] Refactorizar Servicios Frontend:** Creado `src/services/api.js` con Axios e interceptor de token.
    2.  **[HECHO] Endpoints Manager:**
        *   [HECHO] Implementados endpoints CRUD para Compañías (`/api/v1/companies`) (maneja branding).
        *   [HECHO] Implementados endpoints CRUD para Admins (`/api/v1/admins`).
        *   [HECHO] Implementado endpoint Dashboard Manager (`GET /api/v1/stats/manager`).
        *   [HECHO] Implementado endpoint Historial Canjes Globales (`GET /api/v1/history/manager/redemptions/global`).
        *   **[HECHO] Refactor Frontend:** Actualizados `ManageCompanies.jsx`, `ManageAdmins.jsx`, `ManagerDashboard.jsx`.
    3.  **[HECHO] Endpoints Administrador:**
        *   [HECHO] Implementados endpoints CRUD para Empleados (`/api/v1/employees`).
        *   [HECHO] Implementado endpoint para carga masiva (`POST /api/v1/employees/bulk-upload`).
        *   [HECHO] Implementados endpoints CRUD para Recompensas (`/api/v1/rewards`) (maneja `imageUrl`, roles Admin/Manager, recompensas globales/empresa).
        *   [HECHO] Implementados endpoints CRUD para Justificaciones (`/api/v1/justifications`).
        *   [HECHO] Implementado endpoint para Asignar Puntos (`POST /api/v1/points/assign`) con validación de límites.
        *   [HECHO] Implementados endpoints de Historial Admin (`GET /api/v1/history/admin/points`, `GET /api/v1/history/admin/redemptions`).
        *   [HECHO] Implementado endpoint de Ranking (`GET /api/v1/history/ranking`).
        *   [HECHO] Implementado endpoint de Estadísticas Admin (`GET /api/v1/stats/admin`).
        *   **[HECHO] Refactor Frontend:** Actualizados `ManageEmployees.jsx` (incluye bulk upload), `ManageRewards.jsx` (adaptado para Admin/Manager), `ManageJustifications.jsx`, `AdminDashboard.jsx` (asignar puntos y stats), `PointsHistoryAdmin.jsx`, `RedemptionHistoryAdmin.jsx`, `RankingPage.jsx`, `GlobalRedemptionHistory.jsx`.
    4.  **[HECHO] Endpoints Empleado:**
        *   [PENDIENTE] Implementar endpoint Dashboard Empleado (`GET /api/v1/employee/dashboard`) si se necesita más info.
        *   [HECHO] Endpoint para listar Recompensas Disponibles (`GET /api/v1/rewards`) (devuelve globales + empresa).
        *   [HECHO] Implementado endpoint para Canjear Recompensa (`POST /api/v1/redemptions/rewards/:rewardId/redeem`) con validación de stock y permiso para globales.
        *   [HECHO] Implementados endpoints de Historial Empleado (`GET /api/v1/history/employee/points`, `GET /api/v1/history/employee/redemptions`).
        *   [HECHO] Implementado endpoint de Ranking (`GET /api/v1/history/ranking`).
        *   **[HECHO] Refactor Frontend:** Actualizados `EmployeeDashboard.jsx` (usa AuthContext), `AvailableRewards.jsx` (maneja stock, muestra imágenes, indica globales), `HistoryEmployee.jsx`, `RankingPage.jsx`.
    5.  **Limpieza Firebase:** Una vez migrada toda la funcionalidad, eliminar gradualmente las llamadas directas a Firestore y las reglas de seguridad asociadas que ya no sean necesarias. Mantener Firebase Auth.

---

## Fase 4: Implementación de Funcionalidades Avanzadas Backend

*   **Objetivo:** Añadir las características pendientes que dependen intrínsecamente de un backend.
*   **Pasos:**
    1.  **[HECHO] Carga de Imágenes (S3):**
        *   [HECHO] Configurar AWS SDK v3 (`@aws-sdk/client-s3`), Multer (`multer`, `multer-s3`) en `backend/config/s3Config.js` (para logos y recompensas).
        *   [HECHO] Crear endpoints de carga: `/uploads/images/rewards` (Admin), `/uploads/images/rewards/global` (Manager), `/uploads/images/logos` (Manager).
        *   [HECHO] Modificar controladores CRUD (`Reward`, `Company`) para manejar `imageUrl`/`logoUrl`.
        *   **[HECHO - Frontend]** Refactorizar `ManageRewards.jsx`, `AvailableRewards.jsx`, `ManageCompanies.jsx` para cargar/mostrar imágenes.
    2.  **[HECHO] Recompensas Globales:**
        *   [HECHO] Modificar modelo `Reward` (`companyId` nullable) y migración.
        *   [HECHO] Adaptar `rewardController` y `redemptionController` para lógica de roles y `companyId=null`.
        *   [HECHO] Adaptar `rewardRoutes` para permisos Admin/Manager.
        *   [HECHO] Crear endpoint y controlador para historial de canjes globales (`historyController`, `historyRoutes`).
        *   **[HECHO - Frontend]** Adaptar `ManageRewards.jsx`, `AvailableRewards.jsx`, `AppLayout.jsx` y crear `GlobalRedemptionHistory.jsx`.
    3.  **[HECHO - Parcial: Frontend] Personalización de Marca (UI Theme):**
        *   [HECHO] Modificar modelo `Company` y migración para campos de branding.
        *   [HECHO] Actualizar `companyController` y `authController` (`getMe`) para manejar/devolver datos de branding.
        *   **[HECHO - Frontend]** Actualizar `ManageCompanies.jsx` para editar branding.
        *   **[HECHO - Frontend]** Implementar lógica en `AuthContext` y `AppLayout` para leer datos y aplicar tema (logo, lema, variables CSS).
        *   **[HECHO - Frontend]** Configurar Tailwind (`tailwind.config.js`) para usar variables CSS.
        *   **[HECHO - Parcial: Frontend]** Aplicar clases `brand-*` a componentes clave (`Button`, `Input`, `Alert`, `AppLayout`, títulos, tablas, tarjetas de dashboard) como ejemplo. *Refinamiento completo pendiente.*
    4.  **[HECHO - MVP] Integración OpenAI (Reportes y Mensajes):**
        *   [HECHO] Implementado endpoint `POST /api/v1/reports/generate`.
        *   [HECHO] Lógica en `services/reportService.js` para consultar datos agregados y llamar a OpenAI API con prompt mejorado (tendencias/insights).
        *   [HECHO] Implementado endpoint `POST /api/v1/points/generate-message`.
        *   [HECHO] Lógica en `controllers/pointController.js` para llamar a OpenAI API y generar mensajes de reconocimiento.
        *   **[HECHO - MVP Frontend]** Añadido botón "Generar Reporte IA" y display básico en `AdminDashboard.jsx`.
        *   **[HECHO Frontend]** Añadido botón "Generar Mensaje (AI)" y display en modal de `AdminDashboard.jsx`.
    5.  **[PENDIENTE] Implementación Redis Cache:**
        *   [PENDIENTE] Configurar cliente Redis (`config/redis.js`).
        *   Identificar endpoints de lectura frecuente candidatos para caché (Rankings, Catálogo Recompensas, Stats Dashboards).
        *   [PENDIENTE] Implementar lógica de caché (ej. en un middleware o servicio): Intentar leer de Redis, si no existe, leer de BD, guardar en Redis con TTL, devolver resultado.
        *   [PENDIENTE] Implementar invalidación de caché: Al modificar datos relevantes (asignar puntos -> invalidar ranking cache; editar recompensa -> invalidar catálogo cache).
    6.  **[HECHO - MVP] Jobs Programados (node-cron):**
        *   [HECHO] Instalado `node-cron`.
        *   [HECHO] Creado `services/anomalyDetectionService.js` con lógica de detección básica.
        *   [HECHO] Configurado `node-cron` en `server.js` para ejecutar `checkAnomalies` diariamente (revisando día anterior).
        *   [PENDIENTE] Implementar Job para verificar estado de suscripción.
        *   [PENDIENTE] Implementar Job para resetear/archivar puntos anuales.
    7.  **[PENDIENTE] Validación de Entrada Robusta:** Implementar validación detallada para todos los inputs de la API usando librerías como `express-validator` o `joi`.
    8.  **[HECHO - MVP] Funcionalidades Adicionales IA Backend:**
        *   [HECHO] Endpoint y lógica para sugerencias de puntos (`GET /api/v1/points/suggestions/justification/:id`).
        *   [HECHO] Endpoint y lógica para guardar y consultar anomalías (`Anomalies` model/migration, `anomalyController`, `anomalyRoutes`).
        *   [HECHO] Endpoint y lógica para calcular score de engagement (`engagementService`, `engagementController`, `engagementRoutes`).
    9.  **[HECHO] Funcionalidades de Engagement Adicionales (Backend):**
        *   [HECHO] Modelos `User` y `Reward` actualizados (phoneNumber, interests, tags, likes, dislikes).
        *   [HECHO] Nuevos modelos `RewardVote` y `RewardRequest` creados con migraciones.
        *   [HECHO] API Perfil Usuario (`GET /auth/me`, `PUT /auth/profile`) actualizada.
        *   [HECHO] API Gestión Recompensas (`POST /rewards`, `PUT /rewards/:id`) actualizada para tags.
        *   [HECHO] API Votación (`POST /rewards/:rewardId/vote`) implementada.
        *   [HECHO] API Solicitudes (`POST /rewards/requests`, `GET /rewards/requests`, `PATCH /rewards/requests/:id`) implementada.
        *   [HECHO] API Estadísticas (`GET /stats/.../common-interest`, `GET /stats/.../top-reward-requests`) implementada.
    10. **[HECHO - Parcial] Lógica de Negocio Engagement:**
        *   [HECHO] Lógica de cálculo de estadísticas implementada en `statsController`.
        *   [HECHO] Lógica de recomendación mejorada (intereses, votos) implementada en `rewardController`.
        *   **[PENDIENTE]** Refactorizar a servicios dedicados si es necesario.

---

## Fase 5: Pruebas Exhaustivas y Refinamiento

*   **Objetivo:** Asegurar la calidad, estabilidad, rendimiento y seguridad de la aplicación completa.
*   **Pasos:**
    1.  **Pruebas Backend (Jest + Supertest):**
        *   Unitarias: Para lógica de negocio compleja en `services/` y `utils/`.
        *   Integración: Para endpoints API (simulando requests HTTP y verificando respuestas y estado de la BD). Cubrir casos de éxito, error y autorización.
        *   Apuntar a cobertura > 80% para lógica crítica.
    2.  **Pruebas Frontend (Jest + React Testing Library):**
        *   Unitarias/Integración: Para componentes complejos, hooks y flujos que interactúan con el servicio API (usar mocks para el servicio API).
    3.  **Pruebas E2E (Cypress/Playwright):**
        *   Simular flujos de usuario completos (Login -> Ver Dashboard -> Asignar Puntos -> Empleado ve puntos -> Empleado canjea -> Admin ve canje).
    4.  **Refinamiento UI/UX:** Revisión final de usabilidad, consistencia visual y diseño responsivo.
    5.  **Optimización de Rendimiento:**
        *   Backend: Indexación de base de datos, optimización de queries Sequelize, análisis de cuellos de botella.
        *   Frontend: Code splitting (lazy loading de rutas/componentes), optimización de assets.
    6.  **Revisión de Seguridad:**
        *   Backend: Asegurar protección contra OWASP Top 10 (SQL Injection, XSS - aunque menos relevante para API, Broken Access Control, etc.). Validar todos los inputs. Rate limiting. Headers de seguridad (Helmet.js).
        *   Frontend: Asegurar manejo seguro de tokens.

---

## Fase 6: Preparación para Despliegue (DevOps)

*   **Objetivo:** Configurar la infraestructura en la nube y el pipeline de CI/CD para despliegues automatizados y confiables.
*   **Pasos:**
    1.  **Configurar AWS:**
        *   **RDS:** Crear instancia PostgreSQL, configurar backups, security groups (acceso solo desde backend).
        *   **EC2/ECS/Fargate:** Elegir estrategia para ejecutar el backend (EC2 con PM2, o contenedor con ECS/Fargate). Configurar instancias/servicios, auto-scaling, load balancer, security groups.
        *   **S3:** Crear bucket para alojar los archivos estáticos del build del frontend. Configurar para hosting estático.
        *   **CloudFront:** (Recomendado) Configurar distribución para servir el frontend desde S3 con HTTPS y caché CDN. Configurar para redirigir las llamadas `/api/*` al Load Balancer del backend.
        *   **ElastiCache:** Crear instancia Redis, configurar security group (acceso solo desde backend).
        *   **IAM:** Crear roles y políticas con permisos mínimos necesarios para cada servicio.
    2.  **Gestión de Secretos:** Usar AWS Secrets Manager o Parameter Store para gestionar credenciales de BD, claves API (Firebase, OpenAI), secretos JWT, etc. NO hardcodear en el código ni en variables de entorno del repositorio.
    3.  **Pipeline CI/CD Completo (GitHub Actions):**
        *   Workflow para `main` branch (o `production`).
        *   **Pasos:** Checkout -> Setup Node -> Install Deps (Frontend & Backend) -> Lint -> Test (Frontend & Backend) -> Build Frontend -> Build Backend Docker Image -> Push Docker Image (ECR) -> Deploy Frontend (Sync to S3) -> Deploy Backend (Actualizar servicio ECS/Fargate o desplegar en EC2).
        *   Considerar paso para ejecutar migraciones de BD (`npx sequelize-cli db:migrate`) de forma segura durante el despliegue.


---
## Fase 7: Documentación Final y Entrega

*   **Objetivo:** Consolidar toda la documentación necesaria para el mantenimiento y futuro desarrollo de la aplicación.
*   **Pasos:**
    1.  **Actualizar `README.md`:** Instrucciones detalladas para configuración local (backend y frontend), variables de entorno requeridas, scripts `npm`, flujo de despliegue manual (si aplica).
    2.  **Documentación API:** Generar/mantener documentación OpenAPI (Swagger) para el backend. Puede hacerse con `swagger-jsdoc` y `swagger-ui-express`.
    3.  **Documentación de Arquitectura:** Diagrama simple mostrando componentes (Frontend, Backend API, DB, Redis, AWS Services) y flujo de datos principal.
    4.  **Limpiar y Finalizar Documentos:** Revisar y marcar como completados los ítems en `Requerimientos.md` y `planbackend.md`.
    5.  **Demo Final y Handover:** Presentación completa de la aplicación desplegada. Entrega de accesos y documentación.

---

Este plan es una guía detallada. Es probable que surjan ajustes y refinamientos durante el desarrollo. La comunicación constante entre el equipo (IA y desarrollador humano) será clave. ¡Manos a la obra!
