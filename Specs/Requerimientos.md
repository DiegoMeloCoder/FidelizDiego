Plan de Desarrollo Extenso y Detallado por Fases (Para IA y Desarrollador Humano)
Este plan sirve como la fuente de verdad para el desarrollo completo, asegurando contexto, estructura y atención al detalle, especialmente en la base de datos.
Proyecto: Fideliz - Plataforma SaaS de Fidelización (Versión Completa)
Principios: Calidad, Escalabilidad, Seguridad, Pruebas, UX/UI Moderna, Documentación.
Stack: React/Tailwind, Node/Express, PostgreSQL/Sequelize, Auth0/JWT, Redis, OpenAI, AWS, Docker, GitHub Actions, Jest, Joi/Express-validator.

Fase 0: Configuración Inicial y Fundamentos
1.	[HECHO/PENDIENTE] Repositorio y Estructura del Proyecto:
o	Crear repositorio monorepo o multi-repo (backend/frontend) en GitHub.
o	Definir estructura de carpetas clara y escalable:
	Backend: config, controllers, middleware, models, routes, services, utils, tests.
	Frontend: src/components, src/pages, src/contexts (o store), src/hooks, src/services, src/assets, src/utils.
o	Inicializar orden_de_desarrollo.txt (este documento).
2.	[PENDIENTE] Configuración Docker:
o	Dockerfile para backend (Node.js multi-stage build).
o	Dockerfile para frontend (servir build estático con Nginx o similar).
o	docker-compose.yml para desarrollo (backend, frontend, postgres, redis).
3.	[PENDIENTE] Inicialización de Proyectos:
o	Backend: npm init, instalar dependencias core (Express, Sequelize, pg, dotenv, cors, bcrypt, jsonwebtoken, etc.). Configurar base con Express.
o	Frontend: Crear proyecto React (Vite/CRA), instalar dependencias (React Router, Axios/Fetch, TailwindCSS). Configurar Tailwind.
4.	[PENDIENTE] Configuración CI/CD Básica (GitHub Actions):
o	Workflow para linting y formateo (ESLint, Prettier) en cada push/PR.
o	Workflow para construir (sin desplegar aún) en cada push/PR a main/develop.
5.	[PENDIENTE] Configuración Linters y Formateadores:
o	Configurar ESLint y Prettier para backend (Node/JS o TS) y frontend (React/JS o TS) con reglas estándar (ej. Airbnb) pero ajustables.
Fase 1: Diseño Detallado de la Base de Datos y Modelos Core
•	Objetivo: Definir una estructura de BD robusta, normalizada y optimizada para multi-tenancy y consultas futuras, minimizando bugs de datos.
•	Tecnología: PostgreSQL + Sequelize ORM.
1.	[PENDIENTE] Definición de Modelos y Relaciones (Sequelize):
o	Roles:
	id: INTEGER, PRIMARY KEY, AUTO_INCREMENT
	nombre: VARCHAR(50), UNIQUE, NOT NULL (Valores: 'Manager', 'Administrador', 'Empleado')
o	Usuarios: (Representa la cuenta de login, vinculada a Auth0)
	id: VARCHAR(255), PRIMARY KEY (Usar sub de Auth0)
	email: VARCHAR(255), UNIQUE, NOT NULL
	nombre: VARCHAR(255)
	rol_id: INTEGER, FOREIGN KEY (Roles.id), NOT NULL
	fecha_registro: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
	Índices: email, rol_id
o	Empresas: (Cada registro es un tenant)
	id: SERIAL, PRIMARY KEY
	nombre: VARCHAR(255), NOT NULL
	logo_url: VARCHAR(512)
	color_primario: VARCHAR(7) (Hex ej. '#FFFFFF')
	color_secundario: VARCHAR(7)
	limite_puntos_admin_mes: INTEGER, NOT NULL, DEFAULT 1000 (Límite por Admin)
	limite_puntos_empleado_mes: INTEGER, NOT NULL, DEFAULT 500 (Límite por Empleado)
	estado_suscripcion: VARCHAR(20), NOT NULL, DEFAULT 'activa' (Valores: 'activa', 'pendiente_pago', 'inactiva')
	fecha_vencimiento_pago: DATE
	fecha_registro: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
	Índices: estado_suscripcion
o	Empleados: (Vincula un Usuario a una Empresa con un rol específico dentro de ella)
	id: SERIAL, PRIMARY KEY
	usuario_id: VARCHAR(255), FOREIGN KEY (Usuarios.id), NOT NULL
	empresa_id: INTEGER, FOREIGN KEY (Empresas.id), NOT NULL
	cargo: VARCHAR(255), NOT NULL
	celular: VARCHAR(50), NOT NULL
	fecha_contratacion: DATE
	esta_activo: BOOLEAN, DEFAULT TRUE, NOT NULL (Para desactivaciones lógicas)
	Restricción: UNIQUE (usuario_id) - Un usuario solo puede ser empleado/admin de una empresa.
	Índices: usuario_id, empresa_id, esta_activo
o	Recompensas:
	id: SERIAL, PRIMARY KEY
	empresa_id: INTEGER, FOREIGN KEY (Empresas.id), NOT NULL
	nombre: VARCHAR(255), NOT NULL
	descripcion: TEXT
	puntos_requeridos: INTEGER, NOT NULL, CHECK (puntos_requeridos > 0)
	stock: INTEGER, DEFAULT NULL (NULL = ilimitado, >= 0)
	imagen_url: VARCHAR(512)
	esta_activa: BOOLEAN, DEFAULT TRUE, NOT NULL (Para borrado lógico)
	Índices: empresa_id, esta_activa
o	JustificacionesPuntos:
	id: SERIAL, PRIMARY KEY
	empresa_id: INTEGER, FOREIGN KEY (Empresas.id), NULL (NULL para justificaciones globales/predeterminadas)
	texto_justificacion: VARCHAR(255), NOT NULL
	es_predeterminada: BOOLEAN, DEFAULT FALSE, NOT NULL
	esta_activa: BOOLEAN, DEFAULT TRUE, NOT NULL
	Restricción: UNIQUE (empresa_id, texto_justificacion)
	Índices: empresa_id, esta_activa
o	PuntosAsignados: (Historial de asignaciones)
	id: SERIAL, PRIMARY KEY
	empleado_receptor_id: INTEGER, FOREIGN KEY (Empleados.id), NOT NULL
	admin_asignador_id: INTEGER, FOREIGN KEY (Empleados.id), NOT NULL (El empleado que asigna debe tener rol Admin)
	cantidad: INTEGER, NOT NULL, CHECK (cantidad != 0) (Positivo para dar, negativo para quitar)
	justificacion_id: INTEGER, FOREIGN KEY (JustificacionesPuntos.id), NULL
	fecha_asignacion: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
	mes_asignacion: INTEGER NOT NULL (Extraído de fecha_asignacion, para facilitar consultas de límites)
	anio_asignacion: INTEGER NOT NULL (Extraído de fecha_asignacion)
	Índices: empleado_receptor_id, admin_asignador_id, fecha_asignacion, (mes_asignacion, anio_asignacion)
o	Canjes: (Historial de canjes)
	id: SERIAL, PRIMARY KEY
	empleado_id: INTEGER, FOREIGN KEY (Empleados.id), NOT NULL
	recompensa_id: INTEGER, FOREIGN KEY (Recompensas.id), NOT NULL
	puntos_costo: INTEGER, NOT NULL (Costo en el momento del canje)
	fecha_canje: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()
	Índices: empleado_id, recompensa_id, fecha_canje
o	PuntosAcumuladosAnual: (Tabla para manejar saldos y ranking anual fácilmente)
	id: SERIAL, PRIMARY KEY
	empleado_id: INTEGER, FOREIGN KEY (Empleados.id), NOT NULL
	anio: INTEGER, NOT NULL
	puntos_totales: INTEGER, DEFAULT 0, NOT NULL
	Restricción: UNIQUE (empleado_id, anio)
	Índices: (anio, puntos_totales DESC) - Para ranking
2.	[PENDIENTE] Implementar Migraciones Sequelize:
o	Crear archivos de migración para cada tabla definida.
o	Asegurar orden correcto de creación y aplicación de FKs.
3.	[PENDIENTE] Implementar Seeds Iniciales:
o	Roles: 'Manager', 'Administrador', 'Empleado'.
o	Usuarios: Manager (diego29melo@gmail.com), Admin Udenar (ienadiego29melo@gmail.com), Empleado Udenar (dlxstudios29@gmail.com).
o	Empresas: Alkosto, Coacremat, Udenar (con datos iniciales, estado 'activa').
o	Empleados: Asociar usuarios a empresas/roles correspondientes, añadir cargo/celular.
o	JustificacionesPuntos: Crear 3-5 justificaciones globales (empresa_id = NULL, es_predeterminada = TRUE).
Fase 2: Backend - Autenticación, Autorización y Core API
1.	[PENDIENTE] Integración Auth0:
o	Configurar aplicación Regular Web App en Auth0.
o	Implementar endpoints backend (/login, /callback, /logout).
o	Middleware para verificar JWT (extraído de Authorization: Bearer header) en rutas protegidas. Usar librería express-oauth2-jwt-bearer o similar.
o	Sincronización de usuarios: Al primer login vía Auth0, verificar si el usuario (sub, email) existe en Usuarios. Si no, crearlo (rol por defecto 'Empleado' o pendiente de asignación).
2.	[PENDIENTE] Middleware Core Backend:
o	errorHandler: Middleware global para capturar y formatear errores.
o	extractUserInfo: Middleware para adjuntar info del usuario (id, rol_id, email) y su empleado_id y empresa_id (si aplica) al objeto req después de validar JWT.
o	checkRole(rolesPermitidos): Middleware para verificar si el rol_id del usuario está en la lista permitida para el endpoint.
o	checkTenant: Middleware para rutas de Admin/Empleado que verifica que las operaciones solo afecten a la empresa_id asociada al usuario. Crucial para multi-tenancy.
o	checkSubscription: Middleware (o chequeo dentro de checkTenant) que verifica estado_suscripcion de la empresa para permitir/bloquear acciones según las reglas definidas (aviso, bloqueo login empleados, etc.).
3.	[PENDIENTE] Endpoints API - Perfil de Usuario:
o	GET /api/v1/profile/me: Devuelve info del usuario logueado (rol, empresa asociada si aplica, cargo, celular).
o	PUT /api/v1/profile/me: Permite al usuario actualizar campos permitidos (ej. celular, ¿cargo si es empleado?). Incluir validación (Joi/Express-validator).
Fase 3: Backend - Funcionalidades Manager
1.	[PENDIENTE] Endpoints API - Gestión de Empresas (CRUD):
o	Rutas bajo /api/v1/manager/empresas. Protegidas por checkRole(['Manager']).
o	POST /: Crear nueva empresa (nombre, límites, etc.).
o	GET /: Listar todas las empresas (con paginación/filtros básicos).
o	GET /:empresaId: Obtener detalles de una empresa.
o	PUT /:empresaId: Actualizar empresa (nombre, logo, colores, límites, estado suscripción, fecha vencimiento). Validación.
o	DELETE /:empresaId: Desactivar/Eliminar empresa (considerar borrado lógico).
2.	[PENDIENTE] Endpoints API - Gestión de Administradores:
o	Rutas bajo /api/v1/manager/empresas/:empresaId/admins. Protegidas por checkRole(['Manager']).
o	POST /: Asignar un usuario existente como Admin de esa empresa (requiere usuario_id). Crear registro en Empleados si no existe, asociar a la empresa, y asegurar que Usuarios.rol_id sea 'Administrador'.
o	DELETE /:usuarioId: Revocar rol de Admin a un usuario en esa empresa.
o	GET /: Listar los Admins de una empresa.
3.	[PENDIENTE] Endpoints API - Dashboard Manager:
o	Ruta /api/v1/manager/dashboard. Protegida por checkRole(['Manager']).
o	Devolver JSON con: totalEmpresasActivas, totalUsuariosGlobales, y un array statsPorEmpresa [{ empresaId, nombre, totalEmpleados, totalPuntosAsignadosMes, totalCanjesMes, estadoSuscripcion }]. Optimizar consultas SQL/Sequelize (aggregations).
Fase 4: Backend - Funcionalidades Administrador
•	Nota: Todas las rutas de Admin deben usar checkRole(['Administrador']) y checkTenant.
1.	[PENDIENTE] Endpoints API - Gestión de Empleados (CRUD):
o	Rutas bajo /api/v1/admin/empleados.
o	POST /: Crear nuevo empleado (requiere email, nombre, cargo, celular). Backend debe:
	Verificar si existe un Usuario con ese email. Si no, ¿invitar/crear cuenta básica? (Definir flujo).
	Crear registro en Empleados asociando usuario_id, empresa_id (del admin), cargo, celular.
	Asegurar que Usuarios.rol_id sea 'Empleado'.
o	POST /bulk-upload: (Funcionalidad avanzada, ver Fase 7).
o	GET /: Listar empleados de su empresa (paginado, filtros por nombre/cargo, estado activo).
o	GET /:empleadoId: Obtener detalles de un empleado.
o	PUT /:empleadoId: Actualizar empleado (cargo, celular, ¿cambiar rol dentro de la empresa si se implementa?, estado activo). Validación.
o	DELETE /:empleadoId: Desactivar empleado (esta_activo = false).
2.	[PENDIENTE] Endpoints API - Gestión de Recompensas (CRUD):
o	Rutas bajo /api/v1/admin/recompensas.
o	POST /: Crear recompensa para su empresa. Validación.
o	GET /: Listar recompensas de su empresa (activas e inactivas).
o	GET /:recompensaId: Obtener detalles.
o	PUT /:recompensaId: Actualizar recompensa. Validación.
o	DELETE /:recompensaId: Desactivar recompensa (esta_activa = false).
3.	[PENDIENTE] Endpoints API - Gestión de Justificaciones (CRUD):
o	Rutas bajo /api/v1/admin/justificaciones.
o	POST /: Crear justificación personalizada para su empresa (es_predeterminada = false). Validación.
o	GET /: Listar justificaciones (predeterminadas globales + personalizadas de su empresa).
o	PUT /:justificacionId: Actualizar justificación personalizada. Validación.
o	DELETE /:justificacionId: Desactivar justificación personalizada (esta_activa = false).
4.	[PENDIENTE] Endpoint API - Asignación/Deducción de Puntos:
o	POST /api/v1/admin/puntos/asignar.
o	Body: { empleadoReceptorId, cantidad, justificacionId? }.
o	Lógica:
	Verificar que empleadoReceptorId pertenece a la misma empresa que el admin.
	Verificar que admin_asignador_id (el propio admin) no exceda limite_puntos_admin_mes en el mes actual. Consulta agregada a PuntosAsignados.
	Verificar que empleadoReceptorId no exceda limite_puntos_empleado_mes en el mes actual. Consulta agregada.
	Crear registro en PuntosAsignados (con mes/año extraídos).
	Actualizar PuntosAcumuladosAnual para el empleado en el año actual (upsert: puntos_totales += cantidad). Usar transacción de BD.
o	Validación de entrada.
5.	[PENDIENTE] Endpoints API - Historiales (Admin):
o	GET /api/v1/admin/historial/puntos: Historial de puntos asignados dentro de su empresa (paginado, filtros por empleado, admin asignador, fecha).
o	GET /api/v1/admin/historial/canjes: Historial de canjes realizados por empleados de su empresa (paginado, filtros por empleado, recompensa, fecha).
6.	[PENDIENTE] Endpoint API - Ranking (Admin):
o	GET /api/v1/admin/ranking: Devuelve ranking anual de empleados de su empresa.
o	Lógica: Consultar PuntosAcumuladosAnual para el año actual y empresa_id, ordenado por puntos_totales DESC. Unir con Empleados y Usuarios para obtener nombre, cargo. Marcar el top 5.
o	Optimización: Usar Redis para cachear este resultado.
Fase 5: Backend - Funcionalidades Empleado
•	Nota: Todas las rutas de Empleado deben usar checkRole(['Empleado']) y checkTenant.
1.	[PENDIENTE] Endpoint API - Dashboard Empleado:
o	GET /api/v1/empleado/dashboard: Devuelve saldo de puntos actual (de PuntosAcumuladosAnual para el año actual) y quizás últimas 5 transacciones (de PuntosAsignados).
2.	[PENDIENTE] Endpoint API - Historial de Puntos (Empleado):
o	GET /api/v1/empleado/historial/puntos: Devuelve historial de puntos recibidos por el empleado (de PuntosAsignados, filtrado por empleado_receptor_id). Paginado.
3.	[PENDiente] Endpoint API - Catálogo de Recompensas:
o	GET /api/v1/empleado/recompensas: Lista recompensas activas (esta_activa = true) de su empresa.
o	Optimización: Cachear con Redis (invalidar si admin modifica recompensas).
4.	[PENDIENTE] Endpoint API - Canje de Recompensas:
o	POST /api/v1/empleado/canjear/:recompensaId.
o	Lógica:
	Verificar que la recompensa existe, está activa y pertenece a la empresa del empleado.
	Verificar saldo de puntos del empleado (de PuntosAcumuladosAnual) >= puntos_requeridos.
	Verificar stock (stock > 0 o stock IS NULL).
	Dentro de una transacción de BD:
	Decrementar PuntosAcumuladosAnual.puntos_totales.
	Decrementar Recompensas.stock si no es NULL.
	Crear registro en Canjes.
o	Validación.
5.	[PENDIENTE] Endpoint API - Historial de Canjes (Empleado):
o	GET /api/v1/empleado/historial/canjes: Devuelve historial de canjes propios del empleado (de Canjes). Paginado.
6.	[PENDIENTE] Endpoint API - Ranking (Empleado):
o	GET /api/v1/empleado/ranking: Similar al del Admin (GET /api/v1/admin/ranking), devuelve el ranking anual de su empresa (nombre, cargo, puntos). Marcar top 5. El empleado podrá ver su propia posición y la de sus compañeros.
o	Optimización: Usar el mismo caché Redis que el Admin.
Fase 6: Frontend - Desarrollo de Interfaces (React + Tailwind)
•	Nota: Desarrollar componentes reutilizables (botones, inputs, tablas, modales, etc.). Usar Context API o Redux/Zustand para estado global (usuario, rol, tenantId, theme/colores empresa). Usar Axios/Fetch wrapper para API calls (manejo de JWT, errores).
1.	[PENDIENTE] Configuración Base Frontend:
o	React Router: Definir rutas públicas y protegidas (wrapper ProtectedRoute que verifique auth y rol).
o	Gestor de Estado: Configurar provider/store.
o	API Service: Módulo para llamadas al backend.
o	Layouts: MainLayout (con Navbar/Sidebar), AuthLayout.
2.	[PENDIENTE] Flujo de Autenticación UI:
o	Página Login (botón que redirige a /api/v1/login del backend).
o	Página/Componente Callback (maneja token recibido del backend, guarda en localStorage/sessionStorage, actualiza estado global).
o	Manejo de Logout (limpia token, redirige a login).
3.	[PENDIENTE] Dashboard Manager UI:
o	Vista Empresas: Tabla (TanStack Table/React Table) con CRUD (modales para crear/editar). Búsqueda/Filtros.
o	Vista Admins por Empresa: Modal/Vista para listar y asignar/revocar admins.
o	Dashboard Principal: Tarjetas/Gráficos simples (Chart.js/Recharts) para estadísticas.
4.	[PENDIENTE] Dashboard Administrador UI:
o	Vistas CRUD para Empleados, Recompensas, Justificaciones (usando componentes de tabla y modales reutilizables).
o	Formulario Asignar Puntos: Selector de empleado, selector de justificación, input puntos.
o	Vistas de Historial (Puntos Asignados, Canjes Empresa): Tablas paginadas.
o	Vista Ranking: Lista/Tabla resaltando top 5.
o	Banner/Notificación para Estado de Suscripción (pendiente_pago).
o	Botón "Generar Reporte IA". Display del resultado JSON.
o	Estilización: Aplicar color_primario, color_secundario, logo_url de la empresa dinámicamente al layout/componentes.
5.	[PENDIENTE] Dashboard Empleado UI:
o	Vista Principal: Mostrar saldo de puntos, últimas transacciones.
o	Vista Catálogo Recompensas: Cards/Lista con imagen, nombre, puntos. Botón "Canjear" (abre modal de confirmación).
o	Vistas Historial (Mis Puntos, Mis Canjes): Tablas paginadas.
o	Vista Ranking: Lista/Tabla mostrando nombre, cargo, puntos de compañeros. Resaltar top 5.
o	Estilización: Aplicar colores/logo de la empresa.
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
o	Limpiar y finalizar orden_de_desarrollo.txt.
2.	[PENDIENTE] Revisión Final y Handover:
o	Demo completa.
o	Revisión de código final.
o	Entrega de accesos y documentación.
Este plan detallado proporciona una guía exhaustiva. Debería actualizarse (orden_de_desarrollo.txt) a medida que se completan las tareas o surgen cambios. La comunicación constante será clave para asegurar el éxito del proyecto.

