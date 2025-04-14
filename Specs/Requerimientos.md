Plan de Desarrollo Extenso y Detallado por Fases (Para IA y Desarrollador Humano)
Este plan sirve como la fuente de verdad para el desarrollo completo, asegurando contexto, estructura y atención al detalle, especialmente en la base de datos.
Proyecto: Fideliz - Plataforma SaaS de Fidelización (Versión Completa)
Principios: Calidad, Escalabilidad, Seguridad, Pruebas, UX/UI Moderna, Documentación.
Stack: React/Tailwind, Node/Express, PostgreSQL/Sequelize, **Firebase Auth**, Redis, OpenAI, AWS, Docker, GitHub Actions, Jest

**Fase 0: Configuración Inicial y Fundamentos [HECHO]**
1.  [HECHO] Repositorio y Estructura del Proyecto:
    *   [HECHO] Repositorio GitHub.
    *   [HECHO] Estructura de carpetas Backend (config, controllers, middleware, models, routes, etc.).
    *   [HECHO] Estructura de carpetas Frontend (src/components, src/pages, src/contexts, src/services, etc.).
    *   [HECHO] Este documento (`Requerimientos.md`) y `planbackend.md` inicializados.
2.  [HECHO - Parcial] Configuración Docker:
    *   [HECHO] Dockerfile para backend.
    *   [PENDIENTE] Dockerfile para frontend.
    *   [HECHO] `docker-compose.yml` para desarrollo (backend, postgres, redis).
3.  [HECHO] Inicialización de Proyectos:
    *   [HECHO] Backend: `npm init`, dependencias core instaladas, base Express configurada (`server.js`).
    *   [HECHO] Frontend: Proyecto Vite/React existente con dependencias (React Router, Axios, TailwindCSS).
4.  [HECHO - Parcial] Configuración CI/CD Básica (GitHub Actions):
    *   [HECHO] Workflow `backend-ci.yml` para linting de backend.
    *   [PENDIENTE] Añadir build/test al workflow.
    *   [PENDIENTE] Workflow para frontend.
5.  [HECHO] Configuración Linters y Formateadores:
    *   [HECHO] ESLint y Prettier configurados para backend.
    *   [HECHO - Existente] ESLint configurado para frontend.

**Fase 1: Diseño Detallado de la Base de Datos y Modelos Core [HECHO]**
*   Objetivo: Definir una estructura de BD robusta en PostgreSQL.
*   Tecnología: **PostgreSQL + Sequelize ORM**.
1.  [HECHO] Definición de Modelos Sequelize:
    *   [HECHO] Modelo `User` (ID = UID Firebase, email, nombre, role, companyId, points, isActive).
    *   [HECHO] Modelo `Company` (id, nombre, status).
    *   [HECHO] Modelo `Reward` (id, companyId, nombre, pointsRequired, isActive, stock, imageUrl).
    *   [HECHO] Modelo `Justification` (id, textoJustificacion, companyId, estaActiva, esPredeterminada).
    *   [HECHO] Modelo `PointAssignment` (id, adminId, empleadoId, companyId, cantidad, fechaAsignacion, justificacionId, justificacionTexto).
    *   [HECHO] Modelo `Redemption` (id, empleadoId, companyId, recompensaId, puntosCosto, fechaCanje).
    *   [HECHO] Asociaciones definidas en modelos.
2.  [HECHO] Implementar Migraciones Sequelize:
    *   [HECHO] Migraciones generadas y ejecutadas para todas las tablas (incluyendo `stock` e `imageUrl` en Rewards).
3.  [HECHO] Implementar Seeds Iniciales:
    *   [HECHO] Seeder para Justificaciones globales/predeterminadas.
    *   [HECHO] Seeder para Compañía "Empresa Demo".
    *   [HECHO] Seeder para Usuario Manager inicial.

**Fase 2: Backend - Autenticación, Autorización y Core API [HECHO]**
1.  [HECHO] Integración Firebase Auth:
    *   [HECHO] Configurado Firebase Admin SDK en backend.
    *   [HECHO] Middleware `authenticate` para verificar Token ID.
2.  [HECHO] Middleware Core Backend:
    *   [HECHO] Middleware `authorize` para verificar roles desde BD.
    *   [HECHO] Middleware `checkTenant` para verificar pertenencia a compañía.
    *   [PENDIENTE] Middleware `checkSubscription`.
3.  [HECHO] Endpoints API - Perfil de Usuario:
    *   [HECHO] Endpoint `GET /api/v1/auth/me` implementado.

**Fase 3: Backend - Funcionalidades Manager [HECHO]**
1.  [HECHO] Endpoints API - Gestión de Empresas (CRUD):
    *   [HECHO] Endpoints `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `PATCH /:id/toggle-status` implementados en `/api/v1/companies`.
2.  [HECHO] Endpoints API - Gestión de Administradores:
    *   [HECHO] Endpoints `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/toggle-status` implementados en `/api/v1/admins`.
3.  [HECHO] Endpoints API - Dashboard Manager:
    *   [HECHO] Endpoint `GET /api/v1/stats/manager` implementado.

**Fase 4: Backend - Funcionalidades Administrador [HECHO]**
1.  [HECHO] Endpoints API - Gestión de Empleados (CRUD):
    *   [HECHO] Endpoints `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/toggle-status` implementados en `/api/v1/employees`.
    *   [HECHO] Endpoint `POST /api/v1/employees/bulk-upload` implementado.
    *   [HECHO] Endpoint `GET /api/v1/employees/:employeeId` implementado.
2.  [HECHO] Endpoints API - Gestión de Recompensas (CRUD):
    *   [HECHO] Endpoints `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `PATCH /:id/toggle-status` implementados en `/api/v1/rewards` (incluye manejo de stock e `imageUrl`).
    *   [HECHO] Endpoint `POST /api/v1/uploads/images/rewards` para subida de imágenes (Admin, S3).
3.  [HECHO] Endpoints API - Gestión de Justificaciones (CRUD):
    *   [HECHO] Endpoints `GET /`, `POST /`, `PUT /:id`, `PATCH /:id/toggle-status` implementados en `/api/v1/justifications`.
4.  [HECHO] Endpoint API - Asignación/Deducción de Puntos:
    *   [HECHO] Endpoint `POST /api/v1/points/assign` implementado con lógica transaccional y validación de límites.
5.  [HECHO] Endpoints API - Historiales (Admin):
    *   [HECHO] Endpoint `GET /api/v1/history/admin/points` implementado.
    *   [HECHO] Endpoint `GET /api/v1/history/admin/redemptions` implementado.
6.  [HECHO] Endpoint API - Ranking (Admin):
    *   [HECHO] Endpoint `GET /api/v1/history/ranking` implementado (cubre Admin y Employee).
7.  [HECHO] Endpoint API - Estadísticas Dashboard (Admin):
    *   [HECHO] Endpoint `GET /api/v1/stats/admin` implementado.

**Fase 5: Backend - Funcionalidades Empleado [HECHO]**
1.  [PENDIENTE] Endpoint API - Dashboard Empleado:
    *   [PENDIENTE] `GET /api/v1/employee/dashboard` (si se necesita más info que el perfil).
2.  [HECHO] Endpoint API - Historial de Puntos (Empleado):
    *   [HECHO] Endpoint `GET /api/v1/history/employee/points` implementado.
3.  [HECHO] Endpoint API - Catálogo de Recompensas:
    *   [HECHO] Cubierto por `GET /api/v1/rewards` (filtrado por rol/estado en controlador).
    *   [PENDIENTE] Optimización con caché.
4.  [HECHO] Endpoint API - Canje de Recompensas:
    *   [HECHO] Endpoint `POST /api/v1/redemptions/rewards/:rewardId/redeem` implementado con lógica transaccional y validación de stock.
5.  [HECHO] Endpoint API - Historial de Canjes (Empleado):
    *   [HECHO] Endpoint `GET /api/v1/history/employee/redemptions` implementado.
6.  [HECHO] Endpoint API - Ranking (Empleado):
    *   [HECHO] Endpoint `GET /api/v1/history/ranking` implementado (cubre Admin y Employee).

**Fase 6: Frontend - Desarrollo de Interfaces (React + Tailwind) [HECHO - Parcial]**
*   Nota: Usar Context API (`AuthContext`) y Axios (`apiClient`).
1.  [HECHO] Configuración Base Frontend:
    *   [HECHO] React Router.
    *   [HECHO] Gestor de Estado (`AuthContext` refactorizado para API y persistencia).
    *   [HECHO] API Service (`src/services/api.js` creado).
    *   [HECHO] Layouts (`AppLayout` existente).
2.  [HECHO] Flujo de Autenticación UI:
    *   [HECHO] Página Login.
    *   [HECHO] Manejo de Logout.
    *   [HECHO] `AuthContext` obtiene perfil desde API y persiste sesión.
3.  [HECHO] Dashboard Manager UI:
    *   [HECHO] Vista Empresas (`ManageCompanies.jsx` refactorizada para API).
    *   [HECHO] Vista Admins (`ManageAdmins.jsx` refactorizada para API).
    *   [HECHO] Dashboard Principal (`ManagerDashboard.jsx` refactorizado para API).
4.  [HECHO] Dashboard Administrador UI:
    *   [HECHO] Vistas CRUD Empleados (`ManageEmployees.jsx` refactorizada para API, incluyendo bulk upload).
    *   [HECHO] Vistas CRUD Recompensas (`ManageRewards.jsx` refactorizada para API con stock y carga/visualización de imágenes).
    *   [HECHO] Vistas CRUD Justificaciones (`ManageJustifications.jsx` refactorizada para API).
    *   [HECHO] Formulario Asignar Puntos (`AdminDashboard.jsx` modal refactorizado para API).
    *   [HECHO] Vistas de Historial (Puntos Asignados) (`PointsHistoryAdmin.jsx` refactorizada para API).
    *   [HECHO] Vistas de Historial (Canjes Empresa) (`RedemptionHistoryAdmin.jsx` creada y usa API).
    *   [HECHO] Vista Ranking (`RankingPage.jsx` refactorizada para API).
    *   [HECHO] Estadísticas Dashboard (`AdminDashboard.jsx` refactorizado para API).
    *   [PENDIENTE] Banner/Notificación para Estado de Suscripción.
    *   [PENDIENTE] Botón "Generar Reporte IA".
5.  [HECHO] Dashboard Empleado UI:
    *   [HECHO] Vista Principal (`EmployeeDashboard.jsx` - Usa datos de AuthContext).
    *   [HECHO] Vista Catálogo Recompensas (`AvailableRewards.jsx` refactorizada para API, canje, stock y visualización de imágenes).
    *   [HECHO] Vistas Historial (`HistoryEmployee.jsx` refactorizada para API).
    *   [HECHO] Vista Ranking (`RankingPage.jsx` refactorizada para API).
6.  [PENDIENTE] Diseño Responsivo: Revisión dedicada pendiente.

**Fase 7: Funcionalidades Avanzadas y Optimizaciones [PENDIENTE]**
1.  [PENDIENTE] Backend - Carga Masiva de Empleados Optimizada (Admin): (Endpoint actual funciona, pero se puede optimizar).
2.  [PENDIENTE] Backend - Integración OpenAI para Reportes (Admin).
3.  [PENDIENTE] Implementación Redis Cache.
4.  [PENDIENTE] Backend - Job Programado (Reseteo Anual / Estado Suscripción).

**Fase 8: Pruebas, Refinamiento y Despliegue [PENDIENTE]**
1.  [PENDIENTE] Pruebas Backend (Jest).
2.  [PENDIENTE] Pruebas Frontend (Jest + RTL / E2E).
3.  [PENDIENTE] Refinamiento UI/UX (Performance, revisión dedicada responsiva).
4.  [PENDIENTE] Configuración AWS para Producción.
5.  [PENDIENTE] Pipeline CI/CD Completo (GitHub Actions).

**Fase 9: Documentación y Entrega Final [PENDIENTE]**
1.  [PENDIENTE] Documentación (README, API, Arquitectura).
2.  [PENDIENTE] Revisión Final y Handover.
