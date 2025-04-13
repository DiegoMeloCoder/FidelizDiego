# Plan Detallado de Integración de Backend y Despliegue - Fideliz

**Objetivo:** Evolucionar la aplicación MVP actual (Frontend + Firebase) a una arquitectura Full Stack robusta (Frontend + Backend API + Base de Datos Relacional), lista para despliegue en producción, siguiendo las mejores prácticas de desarrollo, seguridad y escalabilidad.

**Stack Tecnológico Propuesto:**
*   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios (para llamadas API).
*   **Backend:** Node.js, Express.js, Sequelize (ORM), PostgreSQL (Base de Datos).
*   **Autenticación:** Inicialmente, verificar Tokens ID de Firebase Auth en el backend. Evaluar migración futura si es necesario.
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
        npm install express sequelize pg pg-hstore dotenv cors bcrypt jsonwebtoken axios redis ioredis node-cron openai
        npm install -D nodemon eslint prettier eslint-config-prettier eslint-plugin-prettier @types/jest jest supertest sequelize-cli
        cd ..
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
    1.  **[HECHO] Definir Modelos Sequelize:** Creados modelos `User`, `Company`, `Reward`, `Justification`, `PointAssignment`, `Redemption` con asociaciones básicas.
    2.  **[HECHO] Generar y Ejecutar Migraciones:** Generadas y ejecutadas migraciones para todas las tablas principales.
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
    3.  **[HECHO] Endpoint de Perfil de Usuario:** Creada ruta `GET /api/v1/auth/me` con controlador y middlewares.

---

## Fase 3: Migración de Funcionalidades Core a la API Backend [EN PROGRESO]

*   **Objetivo:** Reemplazar las llamadas directas a Firestore en el frontend por llamadas a la nueva API RESTful del backend. Esto implica crear los endpoints en el backend y refactorizar el frontend.
*   **Pasos (Iterativos: Backend Endpoint -> Frontend Refactor):**
    1.  **[HECHO] Refactorizar Servicios Frontend:** Creado `src/services/api.js` con Axios e interceptor de token.
    2.  **[HECHO] Endpoints Manager:**
        *   [HECHO] Implementados endpoints CRUD para Compañías (`/api/v1/companies`).
        *   [HECHO] Implementados endpoints CRUD para Admins (`/api/v1/admins`).
        *   [PENDIENTE] Implementar endpoint Dashboard Manager (`GET /api/v1/manager/dashboard`).
        *   **[HECHO] Refactor Frontend:** Actualizados `ManageCompanies.jsx` y `ManageAdmins.jsx`.
    3.  **[HECHO - Parcial] Endpoints Administrador:**
        *   [HECHO] Implementados endpoints CRUD para Empleados (`/api/v1/employees`).
        *   [PENDIENTE] Implementar endpoint optimizado para carga masiva (`POST /api/v1/employees/bulk-upload`).
        *   [HECHO] Implementados endpoints CRUD para Recompensas (`/api/v1/rewards`).
        *   [HECHO] Implementados endpoints CRUD para Justificaciones (`/api/v1/justifications`).
        *   [HECHO] Implementado endpoint para Asignar Puntos (`POST /api/v1/points/assign`).
        *   [PENDIENTE] Implementar endpoints de Historial Admin (`GET /api/v1/admin/history/points`, `GET /api/v1/admin/history/redemptions`).
        *   [PENDIENTE] Implementar endpoint de Ranking Admin (`GET /api/v1/admin/ranking`).
        *   **[HECHO - Parcial] Refactor Frontend:** Actualizados `ManageEmployees.jsx`, `ManageRewards.jsx`, `ManageJustifications.jsx`, `AdminDashboard.jsx` (para asignar puntos). Pendiente carga masiva, historiales, ranking.
    4.  **[HECHO - Parcial] Endpoints Empleado:**
        *   [PENDIENTE] Implementar endpoint Dashboard Empleado (`GET /api/v1/employee/dashboard`).
        *   [HECHO] Endpoint para listar Recompensas Disponibles (`GET /api/v1/rewards` ya lo cubre, filtrado por rol en controlador).
        *   [HECHO] Implementado endpoint para Canjear Recompensa (`POST /api/v1/redemptions/rewards/:rewardId/redeem`).
        *   [PENDIENTE] Implementar endpoints de Historial Empleado (`GET /api/v1/employee/history/points`, `GET /api/v1/employee/history/redemptions`).
        *   [PENDIENTE] Implementar endpoint de Ranking Empleado (`GET /api/v1/employee/ranking`).
        *   **[PENDIENTE] Refactor Frontend:** Actualizar `src/pages/employee/*`.
    5.  **Limpieza Firebase:** Una vez migrada toda la funcionalidad, eliminar gradualmente las llamadas directas a Firestore y las reglas de seguridad asociadas que ya no sean necesarias. Mantener Firebase Auth.

---

## Fase 4: Implementación de Funcionalidades Avanzadas Backend

*   **Objetivo:** Añadir las características pendientes que dependen intrínsecamente de un backend.
*   **Pasos:**
    1.  **Integración OpenAI:**
        *   Implementar endpoint `POST /api/admin/reports/generate`.
        *   Añadir lógica en `services/reportService.js`: Consultar datos agregados de la BD (puntos, canjes, ranking del último periodo para la empresa).
        *   Construir prompt detallado para OpenAI API.
        *   Llamar a la API de OpenAI, manejar respuesta y errores. Considerar operación asíncrona si tarda mucho (devolver un ID de trabajo y otro endpoint para consultar resultado).
        *   **Frontend:** Añadir botón en dashboard Admin, mostrar estado de generación y resultado.
    2.  **Implementación Redis Cache:**
        *   Configurar cliente Redis (`config/redis.js`).
        *   Identificar endpoints de lectura frecuente candidatos para caché (Rankings, Catálogo Recompensas, Stats Dashboards).
        *   Implementar lógica de caché (ej. en un middleware o servicio): Intentar leer de Redis, si no existe, leer de BD, guardar en Redis con TTL, devolver resultado.
        *   Implementar invalidación de caché: Al modificar datos relevantes (asignar puntos -> invalidar ranking cache; editar recompensa -> invalidar catálogo cache).
    3.  **Jobs Programados (node-cron):**
        *   Crear `jobs/scheduledJobs.js`.
        *   Implementar Job 1 (Diario): Lógica para verificar estado de suscripción (si se implementa modelo/lógica de pagos/suscripciones).
        *   Implementar Job 2 (Anual - 1 Enero): Lógica para resetear/archivar puntos anuales según se defina la regla de negocio.
        *   Configurar `node-cron` en `server.js` para ejecutar estos jobs.
    4.  **Validación de Entrada Robusta:** Implementar validación detallada para todos los inputs de la API usando librerías como `express-validator` o `joi`.

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
