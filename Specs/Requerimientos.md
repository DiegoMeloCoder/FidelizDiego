Plan de Desarrollo Extenso y Detallado por Fases (Para IA y Desarrollador Humano)
Este plan sirve como la fuente de verdad para el desarrollo completo, asegurando contexto, estructura y atención al detalle, especialmente en la base de datos.
Proyecto: Fideliz - Plataforma SaaS de Fidelización (Versión Completa)
Principios: Calidad, Escalabilidad, Seguridad, Pruebas, UX/UI Moderna, Documentación.
Stack: React/Tailwind, Node/Express, PostgreSQL/Sequelize, Auth0/JWT, Redis, OpenAI, AWS, Docker, GitHub Actions, Jest, Joi/Express-validator.

Fase 0: Configuración Inicial y Fundamentos
1.	[HECHO (Parcial) - MVP Firebase] Repositorio y Estructura del Proyecto:
o	[HECHO] Crear repositorio monorepo o multi-repo (backend/frontend) en GitHub. (Repositorio Creado y Conectado)
o	Definir estructura de carpetas clara y escalable:
	Backend: [N/A - MVP Firebase] config, controllers, middleware, models, routes, services, utils, tests.
	Frontend: [HECHO - MVP Firebase] src/components, src/pages, src/contexts (o store), src/hooks, src/services, src/assets, src/utils. (Estructura básica creada)
o	Inicializar orden_de_desarrollo.txt (este documento).
2.	[PENDIENTE] Configuración Docker:
o	Dockerfile para backend (Node.js multi-stage build).
o	Dockerfile para frontend (servir build estático con Nginx o similar).
o	docker-compose.yml para desarrollo (backend, frontend, postgres, redis).
3.	[HECHO (Parcial) - MVP Firebase] Inicialización de Proyectos:
o	Backend: [N/A - MVP Firebase] npm init, instalar dependencias core (Express, Sequelize, pg, dotenv, cors, bcrypt, jsonwebtoken, etc.). Configurar base con Express.
o	Frontend: [HECHO - MVP Firebase] Crear proyecto React (Vite/CRA), instalar dependencias (React Router, Axios/Fetch, TailwindCSS). Configurar Tailwind. (Usando Vite, React Router, Firebase, Tailwind v3)
4.	[PENDIENTE] Configuración CI/CD Básica (GitHub Actions):
o	Workflow para linting y formateo (ESLint, Prettier) en cada push/PR.
o	Workflow para construir (sin desplegar aún) en cada push/PR a main/develop.
5.	[PENDIENTE] Configuración Linters y Formateadores:
o	Configurar ESLint y Prettier para backend (Node/JS o TS) y frontend (React/JS o TS) con reglas estándar (ej. Airbnb) pero ajustables.
Fase 1: Diseño Detallado de la Base de Datos y Modelos Core
•	Objetivo: Definir una estructura de BD robusta, normalizada y optimizada para multi-tenancy y consultas futuras, minimizando bugs de datos.
•	Tecnología: [CAMBIADO A FIRESTORE - MVP Firebase] PostgreSQL + Sequelize ORM.
1.	[HECHO (Adaptado) - MVP Firebase] Definición de Modelos y Relaciones (Firestore):
o	[HECHO - Firestore] Roles: (Implementado como campo 'role' en colección 'users')
	id: INTEGER, PRIMARY KEY, AUTO_INCREMENT
	nombre: VARCHAR(50), UNIQUE, NOT NULL (Valores: 'Manager', 'Administrador', 'Empleado')
o	[HECHO - Firestore] Usuarios: (Colección 'users', ID = UID de Auth)
	id: UID de Auth
	email: (string)
	nombre: (string, opcional)
	role: (string: 'Manager', 'Admin', 'Employee')
	companyId: (string, ref a `companies`, solo para Admin/Employee)
	points: (number, solo para Employee)
	isActive: (boolean, solo para Employee/Admin)
o	[HECHO - Firestore] Empresas: (Colección 'companies')
	id: ID de Documento Firestore
	nombre: (string)
	status: (string: 'active', 'inactive', 'pending_payment')
	createdAt: (timestamp)
o	[N/A - MVP Firebase] Empleados: (Info integrada en 'users')
o	[HECHO - Firestore] Recompensas: (Colección 'rewards')
	id: ID de Documento Firestore
	companyId: (string, ref a `companies`)
	nombre: (string)
	pointsRequired: (number)
	isActive: (boolean)
	createdAt: (timestamp)
o	[PENDIENTE] JustificacionesPuntos:
o	[HECHO - Firestore] PuntosAsignados: (Colección 'puntosAsignados')
	id: ID de Documento Firestore
	adminId: (string, UID)
	adminEmail: (string)
	empleadoId: (string, UID)
	empleadoEmail: (string)
	empleadoName: (string)
	companyId: (string, ref a `companies`)
	cantidad: (number)
	fechaAsignacion: (timestamp)
o	[HECHO - Firestore] Canjes: (Colección 'canjes')
	id: ID de Documento Firestore
	empleadoId: (string, UID)
	empleadoEmail: (string)
	companyId: (string, ref a `companies`)
	recompensaId: (string, ref a `rewards`)
	recompensaNombre: (string)
	puntosCosto: (number)
	fechaCanje: (timestamp)
o	[PENDIENTE] PuntosAcumuladosAnual: (Se maneja con campo 'points' en 'users' por ahora)
2.	[N/A - MVP Firebase] Implementar Migraciones Sequelize:
3.	[HECHO (Manual) - MVP Firebase] Implementar Seeds Iniciales:
o	Roles: (Implícito en 'users')
o	Usuarios: Manager, Admin, Empleado creados manualmente.
o	Empresas: 'Empresa Demo' creada manualmente.
o	Empleados: (Info en 'users')
o	JustificacionesPuntos: [PENDIENTE]
Fase 2: Backend - Autenticación, Autorización y Core API
1.	[HECHO (Adaptado) - MVP Firebase] Integración Auth0: (Usando Firebase Auth Email/Password)
2.	[HECHO (Adaptado) - MVP Firebase] Middleware Core Backend: (Lógica implementada en Frontend: `ProtectedRoute`, `AuthContext`)
o	checkRole: [HECHO (Adaptado)]
o	checkTenant: [HECHO (Adaptado) - Implícito al usar `userData.companyId` en queries]
o	checkSubscription: [PENDIENTE]
3.	[PENDIENTE] Endpoints API - Perfil de Usuario: (Se podría implementar en Frontend leyendo/escribiendo doc 'users')
Fase 3: Backend - Funcionalidades Manager
1.	[HECHO (Parcial) - MVP Firebase] Endpoints API - Gestión de Empresas (CRUD): (Implementado en Frontend + Firestore)
o	POST /: [HECHO (Adaptado)] Crear nueva empresa (nombre, estado).
o	GET /: [HECHO (Adaptado)] Listar todas las empresas.
o	GET /:empresaId: [PENDIENTE]
o	PUT /:empresaId: [HECHO (Adaptado)] Actualizar empresa (nombre, estado).
o	DELETE /:empresaId: [HECHO (Adaptado)] Desactivar empresa (lógico).
2.	[PENDIENTE] Endpoints API - Gestión de Administradores:
3.	[PENDIENTE] Endpoints API - Dashboard Manager:
Fase 4: Backend - Funcionalidades Administrador
1.	[HECHO (Parcial) - MVP Firebase] Endpoints API - Gestión de Empleados (CRUD): (Implementado en Frontend + Firestore)
o	POST /: [HECHO (Adaptado)] Crear nuevo empleado (email, nombre, password). (Con limitación de logout)
o	POST /bulk-upload: [PENDIENTE]
o	GET /: [HECHO (Adaptado)] Listar empleados de su empresa.
o	GET /:empleadoId: [PENDIENTE]
o	PUT /:empleadoId: [HECHO (Adaptado)] Actualizar empleado (nombre, isActive).
o	DELETE /:empleadoId: [HECHO (Adaptado)] Desactivar empleado (lógico).
2.	[HECHO (Parcial) - MVP Firebase] Endpoints API - Gestión de Recompensas (CRUD): (Implementado en Frontend + Firestore)
o	POST /: [HECHO (Adaptado)] Crear recompensa (nombre, puntos).
o	GET /: [HECHO (Adaptado)] Listar recompensas de su empresa.
o	GET /:recompensaId: [PENDIENTE]
o	PUT /:recompensaId: [HECHO (Adaptado)] Actualizar recompensa (nombre, puntos, isActive).
o	DELETE /:recompensaId: [HECHO (Adaptado)] Desactivar/Activar recompensa (lógico).
3.	[PENDIENTE] Endpoints API - Gestión de Justificaciones (CRUD):
4.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Asignación/Deducción de Puntos: (Implementado en Frontend + Firestore)
o	POST /api/v1/admin/puntos/asignar: [HECHO (Adaptado)]
o	Body: { empleadoReceptorId, cantidad }: [HECHO (Adaptado)]
o	Lógica:
	Verificar empleadoReceptorId: [HECHO (Adaptado)]
	Verificar límites: [PENDIENTE]
	Crear registro en PuntosAsignados: [HECHO (Adaptado)]
	Actualizar PuntosAcumuladosAnual: [HECHO (Adaptado) - Actualiza campo 'points' en 'users']
o	Validación de entrada: [PENDIENTE]
5.	[HECHO (Parcial) - MVP Firebase] Endpoints API - Historiales (Admin):
o	GET /api/v1/admin/historial/puntos: [HECHO (Adaptado) - Vista Frontend implementada]
o	GET /api/v1/admin/historial/canjes: [PENDIENTE]
6.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Ranking (Admin):
o	GET /api/v1/admin/ranking: [HECHO (Adaptado) - Vista Frontend implementada]
o	Lógica: [HECHO (Adaptado) - Consulta Firestore 'users']
o	Optimización: [PENDIENTE]
Fase 5: Backend - Funcionalidades Empleado
1.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Dashboard Empleado:
o	GET /api/v1/empleado/dashboard: [HECHO (Adaptado) - Muestra saldo de puntos desde 'users']
2.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Historial de Puntos (Empleado):
o	GET /api/v1/empleado/historial/puntos: [HECHO (Adaptado) - Vista Frontend implementada]
3.	[HECHO - MVP Firebase] Endpoint API - Catálogo de Recompensas:
o	GET /api/v1/empleado/recompensas: [HECHO (Adaptado) - Vista Frontend implementada]
o	Optimización: [PENDIENTE]
4.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Canje de Recompensas:
o	POST /api/v1/empleado/canjear/:recompensaId: [HECHO (Adaptado) - Lógica Frontend + Firestore]
o	Lógica:
	Verificar recompensa: [HECHO (Adaptado)]
	Verificar saldo: [HECHO (Adaptado)]
	Verificar stock: [PENDIENTE]
	Transacción:
	Decrementar Puntos: [HECHO (Adaptado) - Actualiza campo 'points' en 'users']
	Decrementar Stock: [PENDIENTE]
	Crear registro en Canjes: [HECHO (Adaptado)]
o	Validación: [PENDIENTE]
5.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Historial de Canjes (Empleado):
o	GET /api/v1/empleado/historial/canjes: [HECHO (Adaptado) - Vista Frontend implementada]
6.	[HECHO (Parcial) - MVP Firebase] Endpoint API - Ranking (Empleado):
o	GET /api/v1/empleado/ranking: [HECHO (Adaptado) - Vista Frontend implementada]
o	Optimización: [PENDIENTE]
Fase 6: Frontend - Desarrollo de Interfaces (React + Tailwind)
•	Nota: Desarrollar componentes reutilizables (botones, inputs, tablas, modales, etc.). Usar Context API o Redux/Zustand para estado global (usuario, rol, tenantId, theme/colores empresa). Usar Axios/Fetch wrapper para API calls (manejo de JWT, errores).
1.	[HECHO - MVP Firebase] Configuración Base Frontend:
o	React Router: [HECHO]
o	Gestor de Estado: [HECHO] (AuthContext)
o	API Service: [N/A - MVP Firebase] (Interacción directa con Firebase)
o	Layouts: [HECHO] (AppLayout)
2.	[HECHO - MVP Firebase] Flujo de Autenticación UI:
o	Página Login: [HECHO]
o	Página/Componente Callback: [N/A - MVP Firebase]
o	Manejo de Logout: [HECHO]
3.	[HECHO (Parcial) - MVP Firebase] Dashboard Manager UI:
o	Vista Empresas: [HECHO (Parcial)] (CRUD Básico)
o	Vista Admins por Empresa: [PENDIENTE]
o	Dashboard Principal: [PENDIENTE]
4.	[HECHO (Parcial) - MVP Firebase] Dashboard Administrador UI:
o	Vistas CRUD para Empleados, Recompensas: [HECHO (Parcial)] (CRUD Básico)
o	Vistas CRUD para Justificaciones: [PENDIENTE]
o	Formulario Asignar Puntos: [HECHO (Parcial)] (Sin justificaciones)
o	Vistas de Historial (Puntos Asignados): [HECHO (Parcial)] (Básico)
o	Vistas de Historial (Canjes Empresa): [PENDIENTE]
o	Vista Ranking: [HECHO (Parcial)] (Básico)
o	Banner/Notificación para Estado de Suscripción: [PENDIENTE]
o	Botón "Generar Reporte IA": [PENDIENTE]
o	Estilización: [PENDIENTE]
5.	[HECHO (Parcial) - MVP Firebase] Dashboard Empleado UI:
o	Vista Principal: [HECHO (Parcial)] (Mostrar saldo)
o	Vista Catálogo Recompensas: [HECHO (Parcial)] (Listar/Canjear Básico)
o	Vistas Historial (Mis Puntos, Mis Canjes): [HECHO (Parcial)] (Básico)
o	Vista Ranking: [HECHO (Parcial)] (Básico)
o	Estilización: [PENDIENTE]
6.	[PENDIENTE] Diseño Responsivo:
o	Asegurar que todas las vistas sean usables y estéticas en móviles, tablets y escritorio usando utilidades de Tailwind.
Fase 7: Funcionalidades Avanzadas y Optimizaciones
1.	[PENDIENTE] Backend - Carga Masiva de Empleados (Admin):
o	Endpoint POST /api/v1/admin/empleados/bulk-upload que acepte archivo CSV/Excel.
o	Usar librería para parsear (ej. papaparse, xlsx).
o	Validar cada fila (email, nombre, cargo, celular requeridos).
o	Lógica para crear/invitar Usuarios y crear Empleados en batch. Devolver resumen (éxitos, errores).
o	Frontend: Componente <FileUpload> y vista para mostrar progreso/resultados.
2.	[PENDIENTE] Backend - Integración OpenAI para Reportes (Admin):
o	Endpoint POST /api/v1/admin/reportes/generar.
o	Lógica:
	Obtener datos del último semestre para la empresa (agregados de PuntosAsignados, Canjes, ranking).
	Construir prompt detallado para OpenAI (GPT-3.5/4) pidiendo análisis y insights en formato JSON estructurado (ej. { "resumenGeneral": "...", "tendenciasPuntos": [...], "tendenciasCanjes": [...], "topEmpleados": [...], "sugerencias": [...] }).
	Llamar a OpenAI API (usar SDK oficial). Manejar errores.
	Guardar/Devolver el JSON. Considerar operaciones asíncronas si la generación tarda.
o	Frontend: Mostrar estado de generación, permitir ver/descargar JSON resultante.
3.	[PENDIENTE] Implementación Redis Cache:
o	Configurar cliente Redis en backend.
o	Aplicar caché a endpoints de lectura frecuente: Rankings (Admin/Empleado), Catálogo Recompensas (Empleado), quizás Dashboard Manager stats.
o	Implementar lógica de invalidación de caché (ej. al asignar puntos -> invalidar ranking; al editar recompensa -> invalidar catálogo).
4.	[PENDIENTE] Backend - Job Programado (Reseteo Anual / Estado Suscripción):
o	Usar node-cron o similar.
o	Job 1 (Diario): Verificar empresas con fecha_vencimiento_pago pasada. Actualizar estado_suscripcion ('pendiente_pago', 'inactiva') según reglas de gracia (5 días hábiles).
o	Job 2 (Anual - 1 Enero): ¿Archivar PuntosAcumuladosAnual del año anterior? ¿Resetear a 0 para el nuevo año? Definir e implementar lógica de reseteo/archivado.
Fase 8: Pruebas, Refinamiento y Despliegue
1.	[PENDIENTE] Pruebas Backend (Jest):
o	Pruebas unitarias para servicios/lógica compleja (cálculo límites, canje, ranking).
o	Pruebas de integración para endpoints API críticos (CRUDs, asignación/canje, auth/authz, multi-tenant).
o	Apuntar a una cobertura razonable (>70-80% para lógica core).
2.	[PENDIENTE] Pruebas Frontend (Opcional pero recomendado):
o	Pruebas unitarias para componentes complejos o utils (Jest + React Testing Library).
o	Pruebas E2E (Cypress/Playwright) para flujos críticos (login, asignación, canje).
3.	[PENDIENTE] Refinamiento UI/UX:
o	Revisiones de usabilidad.
o	Ajustes de estilos Tailwind. Performance (lazy loading componentes/rutas).
4.	[PENDIENTE] Configuración AWS para Producción:
o	RDS (PostgreSQL): Configurar instancia, backups, security group.
o	EC2 (Backend): Crear instancia/ASG, configurar Nginx/PM2, security group.
o	S3 (Frontend): Crear bucket, configurar para hosting estático.
o	CloudFront (Opcional): CDN para S3, manejo de HTTPS.
o	ElastiCache (Redis): Configurar instancia Redis.
o	IAM: Roles y políticas de seguridad.
o	Variables de Entorno: Gestionar secretos (AWS Secrets Manager o .env seguro).
5.	[PENDIENTE] Pipeline CI/CD Completo (GitHub Actions):
o	Workflow para main branch:
	Run tests (backend/frontend).
	Build backend Docker image, push a ECR/Docker Hub.
	Build frontend static files.
	Deploy backend a EC2 (ej. vía SSH, CodeDeploy).
	Deploy frontend a S3 (sync).
	(Opcional) Ejecutar migraciones de BD.
Fase 9: Documentación y Entrega Final
1.	[PENDIENTE] Documentación:
o	README.md: Instrucciones detalladas de instalación, configuración local, variables de entorno, scripts npm, flujo de despliegue.
o	Documentación API: Generar/mantener documentación OpenAPI/Swagger para el backend.
o	Documentación de Arquitectura: Diagramas básicos (componentes, flujo de datos).
o	Limpiar y finalizar Requerimientos.md.
2.	[PENDIENTE] Revisión Final y Handover:
o	Demo completa.
o	Revisión de código final.
o	Entrega de accesos y documentación.
Este plan detallado proporciona una guía exhaustiva. Debería actualizarse (Requerimientos.md) a medida que se completan las tareas o surgen cambios. La comunicación constante será clave para asegurar el éxito del proyecto.
