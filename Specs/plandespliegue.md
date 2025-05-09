# Plan de Despliegue Provisional para Pruebas - FidelizDiego

**Objetivo:** Desplegar Frontend, Backend y Base de Datos en servicios cloud gratuitos/freemium para pruebas funcionales internas por parte del equipo.

**Servicios Seleccionados:**

*   **Base de Datos (PostgreSQL):** Neon (Plan Gratuito)
*   **Backend (Node.js PaaS):** Render (Plan Gratuito)
*   **Frontend (Hosting Estático):** Vercel (Plan Gratuito)
*   **Almacenamiento de Archivos (Imágenes):** AWS S3 (Bucket existente)
*   **Cache (Redis):** Omitido inicialmente para simplificar.

---

## Fase 1: Creación de Cuentas y Servicios

1.  **Neon (Base de Datos):**
    *   Crear cuenta en [Neon](https://neon.tech/).
    *   Crear un nuevo proyecto.
    *   Crear una base de datos PostgreSQL dentro del proyecto.
    *   Obtener la **URL de conexión** de la base de datos (formato `postgresql://user:password@host:port/dbname`). Guardarla de forma segura.
    

2.  **Render (Backend):**
    *   Crear cuenta en [Render](https://render.com/) (se recomienda usar la opción "Sign up with GitHub").

3.  **Vercel (Frontend):**
    *   Crear cuenta en [Vercel](https://vercel.com/) (se recomienda usar la opción "Continue with GitHub").

4.  **AWS S3 (Almacenamiento):**
    *   Confirmar que el bucket S3 existente está accesible.
    *   Asegurarse de tener las credenciales de acceso (Access Key ID, Secret Access Key) y el nombre del bucket y la región. Guardarlas de forma segura.

---

## Fase 2: Preparación del Código y Configuración

1.  **Backend (`backend/`):**
    *   **Variables de Entorno:** Identificar y listar todas las variables necesarias (ver sección "Variables de Entorno Requeridas" abajo). Usar `backend/.env.example` como referencia.
    *   **Conexión a BD:** Asegurar que `backend/config/database.js` use la variable `DATABASE_URL` (proveniente de Neon) para la configuración de producción/staging.
    *   **Puerto:** Confirmar que `backend/server.js` escuche en `process.env.PORT`.
    *   **Storage (S3):** Verificar que `backend/config/s3Config.js` use variables de entorno para `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_REGION`.
    *   **CORS:** Configurar `cors` en `backend/server.js` para aceptar peticiones desde la URL que Vercel asignará al frontend (se ajustará después del despliegue inicial del frontend). Inicialmente, se puede permitir un origen comodín (`*`) *solo para la configuración inicial*, pero **debe** restringirse después.
    *   **Firebase:** Preparar el contenido del archivo JSON de la cuenta de servicio de Firebase para pegarlo como valor de una variable de entorno en Render (ej. `FIREBASE_SERVICE_ACCOUNT_JSON`). Ajustar `backend/config/firebaseAdmin.js` para leer desde esta variable si existe.
    *   **(Opcional) Redis:** Comentar o añadir lógica condicional en `backend/server.js` (o donde se use `ioredis`) para evitar errores si no se configura Redis.

2.  **Frontend (`frontend/`):**
    *   **URL de API:** Asegurar que `frontend/src/services/api.js` use `import.meta.env.VITE_API_BASE_URL` para la URL base del backend.

---

## Fase 3: Despliegue

1.  **Base de Datos (Neon):**
    *   **Migraciones y Seeds:** Ejecutar las migraciones y seeds en la base de datos de Neon.
        *   **Método Recomendado:** Configurar el servicio de backend en Render para ejecutar `npx sequelize-cli db:migrate --env production && npx sequelize-cli db:seed:all --env production` como parte de su script de build. (Asegurarse de que `config/database.js` tenga una sección `production` que use `DATABASE_URL`).
        *   **Método Alternativo (Manual):** Conectar temporalmente tu Sequelize CLI local a la BD remota y ejecutar los comandos manualmente.

2.  **Backend (Render):**
    *   Crear un nuevo "Web Service" en Render.
    *   Conectar al repositorio GitHub (`FidelizDiego`).
    *   Rama: `main` (o la rama de pruebas).
    *   Directorio Raíz: `backend`.
    *   Entorno: Node.
    *   Comando de Build: `npm install && npx sequelize-cli db:migrate --env production && npx sequelize-cli db:seed:all --env production` (Ajustar si se usó el método manual para migraciones/seeds).
    *   Comando de Inicio: `npm start`.
    *   **Configurar Variables de Entorno:** Añadir *todas* las variables requeridas (ver sección abajo), incluyendo `DATABASE_URL` (de Neon), `FIREBASE_SERVICE_ACCOUNT_JSON` (contenido del JSON), credenciales S3, `JWT_SECRET`, `OPENAI_API_KEY`, `NODE_ENV=production`, etc.
    *   Desplegar y monitorear logs.
    *   Obtener la URL pública del backend (ej. `https://fideliz-backend.onrender.com`).

3.  **Frontend (Vercel):**
    *   Crear un nuevo proyecto en Vercel.
    *   Importar el repositorio GitHub (`FidelizDiego`).
    *   Framework Preset: Vite.
    *   Directorio Raíz: `frontend`.
    *   Build Command: (Vercel suele detectarlo) `npm run build` o `vite build`.
    *   Output Directory: `dist`.
    *   **Configurar Variables de Entorno:** Añadir `VITE_API_BASE_URL` con la URL del backend desplegado en Render.
    *   Desplegar.
    *   Obtener la URL pública del frontend (ej. `https://fideliz-test.vercel.app`).

4.  **Ajuste Final CORS:**
    *   Volver a la configuración del backend en Render.
    *   Actualizar la variable de entorno `CORS_ORIGIN` para que coincida *exactamente* con la URL del frontend desplegado en Vercel.
    *   Guardar los cambios en Render (provocará un redespliegue).

---

## Fase 4: Pruebas y Verificación

1.  Acceder a la URL del frontend desplegado.
2.  Probar el flujo de login (Firebase Auth).
3.  Verificar que las llamadas a la API funcionen (obtener datos, realizar acciones).
4.  Probar la subida y visualización de imágenes (S3).
5.  Realizar pruebas funcionales exhaustivas según los roles (Admin, Employee, Manager).
6.  Compartir la URL del frontend con el equipo para pruebas.

---

## Variables de Entorno Requeridas (Backend en Render)

*   `DATABASE_URL`: URL de conexión de Neon.
*   `FIREBASE_SERVICE_ACCOUNT_JSON`: Contenido completo del archivo JSON de credenciales de Firebase.
*   `AWS_ACCESS_KEY_ID`: Credencial de AWS S3.
*   `AWS_SECRET_ACCESS_KEY`: Credencial de AWS S3.
*   `S3_BUCKET_NAME`: Nombre del bucket S3.
*   `S3_REGION`: Región del bucket S3.
*   `JWT_SECRET`: Clave secreta para firmar tokens JWT (si se usa internamente, aunque la auth principal es Firebase).
*   `OPENAI_API_KEY`: Clave de API de OpenAI.
*   `CORS_ORIGIN`: URL del frontend desplegado en Vercel (ej. `https://fideliz-test.vercel.app`).
*   `NODE_ENV`: `production`.
*   `PORT`: Render lo gestiona automáticamente, pero Node.js debe escucharlo (`process.env.PORT`).
*   (Otras variables específicas que puedan existir en `.env.example`).

## Variables de Entorno Requeridas (Frontend en Vercel)

*   `VITE_API_BASE_URL`: URL del backend desplegado en Render (ej. `https://fideliz-backend.onrender.com`).

---

## Diagrama Simplificado

```mermaid
graph LR
    subgraph Internet
        U[Usuario/Tester]
    end

    subgraph Vercel (Free Tier)
        F[Frontend React Build]
    end

    subgraph Render (Free Tier)
        B[Backend Node.js]
        J[Jobs Node-cron]
    end

    subgraph Neon (Free Tier)
        DB[(PostgreSQL DB)]
    end

    subgraph AWS S3 (Bucket Existente)
        S3[(Object Storage)]
    end

    subgraph Firebase
        Auth[/Firebase Auth\]
    end

    subgraph OpenAI
        AI[/OpenAI API\]
    end

    U -- HTTPS --> F
    F -- API Calls --> B
    B -- DB Queries --> DB
    B -- File Ops --> S3
    B -- Auth Verify --> Auth
    B -- AI Calls --> AI
    B -- Cron --> J
