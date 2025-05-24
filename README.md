# Fideliz - Plataforma SaaS de Fidelización

Este proyecto es una plataforma SaaS diseñada para ayudar a las empresas a implementar programas de fidelización basados en puntos para sus empleados.

## Stack Tecnológico

*   **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
*   **Backend:** Node.js, Express.js, Sequelize (ORM)
*   **Base de Datos:** PostgreSQL
*   **Autenticación:** Firebase Authentication
*   **Almacenamiento de Archivos:** AWS S3 (para logos de empresa e imágenes de recompensas)
*   **Otros:** Docker (opcional para desarrollo), ESLint, Prettier

## Configuración del Entorno de Desarrollo Local

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

1.  **Node.js:** Asegúrate de tener Node.js instalado (se recomienda una versión LTS reciente, ej. v18 o superior). Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
2.  **npm:** Viene incluido con Node.js.
3.  **Git:** Necesario para clonar el repositorio.
4.  **PostgreSQL:** Instala PostgreSQL en tu sistema. Necesitarás crear una base de datos para el proyecto.
    *   Descarga: [postgresql.org](https://www.postgresql.org/download/)
    *   Herramienta GUI (opcional pero útil): [pgAdmin](https://www.pgadmin.org/) o DBeaver.
5.  **Firebase Project:** Necesitas acceso al proyecto Firebase utilizado para la autenticación. Debes poder descargar el archivo de credenciales de la cuenta de servicio (Service Account Key).
6.  **AWS Account & S3:** Necesitas una cuenta de AWS. Deberás crear un bucket S3 para almacenar imágenes y generar credenciales IAM con los permisos adecuados.

### Pasos de Instalación

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/DiegoMeloCoder/FidelizDiego.git
    cd FidelizDiego
    ```

2.  **Crear Base de Datos PostgreSQL:**
    *   Usando `psql` o una herramienta GUI (pgAdmin/DBeaver), crea una nueva base de datos. Por defecto, la configuración de desarrollo espera una base de datos llamada `fideliz_dev`.
    *   Asegúrate de tener un usuario y contraseña para acceder a esta base de datos.

3.  **Configurar Variables de Entorno:**
    *   Crea un archivo llamado `.env` en la **raíz del proyecto** (`FidelizDiego/.env`).
    *   Copia el contenido de `.env.example` en tu nuevo archivo `.env`.
    *   **Modifica los valores** en `.env` con tus propias credenciales y configuraciones:
        *   `DB_HOST`: Usualmente `localhost` o `127.0.0.1` si corres PostgreSQL localmente.
        *   `DB_PORT`: El puerto donde corre PostgreSQL (por defecto `5432`).
        *   `DB_USER`: Tu usuario de PostgreSQL.
        *   `DB_PASSWORD`: Tu contraseña de PostgreSQL.
        *   `DB_NAME`: El nombre de la base de datos que creaste (ej. `fideliz_dev`).
        *   `JWT_SECRET`: Genera una cadena secreta larga y aleatoria para los tokens JWT.
        *   `GOOGLE_APPLICATION_CREDENTIALS`: La **ruta absoluta o relativa** a tu archivo `serviceAccountKey.json` descargado de Firebase. (Ver siguiente paso).
        *   `AWS_ACCESS_KEY_ID`: Tu Access Key ID de AWS IAM.
        *   `AWS_SECRET_ACCESS_KEY`: Tu Secret Access Key de AWS IAM.
        *   `AWS_REGION`: La región de AWS donde creaste tu bucket S3 (ej. `us-east-1`).
        *   `S3_BUCKET_NAME`: El nombre exacto de tu bucket S3.
        *   *(Opcional)* Configura `REDIS_HOST`, `REDIS_PORT` si usas Redis localmente fuera de Docker.

4.  **Configurar Firebase Admin SDK:**
    *   Ve a tu proyecto Firebase en la consola de Firebase.
    *   Navega a "Configuración del proyecto" > "Cuentas de servicio".
    *   Haz clic en "Generar nueva clave privada" y descarga el archivo JSON (`serviceAccountKey.json`).
    *   **Importante:** Guarda este archivo en un lugar seguro **fuera** del repositorio Git (por ejemplo, en una carpeta `secrets/` que esté listada en `.gitignore`).
    *   Actualiza la variable `GOOGLE_APPLICATION_CREDENTIALS` en tu archivo `.env` con la ruta correcta a este archivo JSON.

5.  **Configurar AWS S3 y Credenciales IAM:**
    *   Si aún no lo has hecho, sigue el tutorial proporcionado anteriormente (o la documentación de AWS) para:
        *   Crear un bucket S3 (ej. `fideliz-dev-imagenes-[tusiniciales]`).
        *   Configurar los permisos del bucket (ej. política para lectura pública si usas `acl: 'public-read'` o mantenerlo privado si usarás URLs firmadas).
        *   Crear un usuario IAM con acceso programático.
        *   Adjuntar una política a ese usuario que le dé permisos `s3:PutObject` (y `s3:PutObjectAcl` si usaste ACLs públicas) sobre el bucket creado.
        *   Obtener el `Access Key ID` y `Secret Access Key` para este usuario IAM.
    *   Asegúrate de que estas credenciales, la región y el nombre del bucket estén correctamente configurados en tu archivo `.env`.

6.  **Instalar Dependencias:**
    *   Instala las dependencias del backend:
        ```bash
        cd backend
        npm install
        cd ..
        ```
    *   Instala las dependencias del frontend:
        ```bash
        cd frontend
        npm install
        cd ..
        ```

7.  **Ejecutar Migraciones y Seeders de la Base de Datos:**
    *   Desde la carpeta `backend`, ejecuta las migraciones para crear las tablas:
        ```bash
        cd backend
        npx sequelize-cli db:migrate
        ```
    *   (Opcional pero recomendado) Ejecuta los seeders para poblar datos iniciales (justificaciones por defecto, compañía demo, manager inicial):
        ```bash
        npx sequelize-cli db:seed:all
        cd ..
        ```

### Ejecutando la Aplicación

1.  **Iniciar el Backend:**
    *   Abre una terminal en la raíz del proyecto.
    *   Navega a la carpeta del backend y ejecuta el servidor de desarrollo (usa `nodemon` para recarga automática):
        ```bash
        cd backend
        npm run dev
        ```
    *   El servidor backend debería iniciarse y escuchar en el puerto especificado (por defecto `5000`). Verifica que no haya errores de conexión a la base de datos o configuración de S3.

2.  **Iniciar el Frontend:**
    *   Abre **otra terminal** en la raíz del proyecto.
    *   Navega a la carpeta del frontend y ejecuta el servidor de desarrollo de Vite:
        ```bash
        cd frontend
        npm run dev
        ```
    *   Vite te indicará la URL donde la aplicación frontend está disponible (usualmente `http://localhost:5173` o similar).

3.  **Acceder a la Aplicación:**
    *   Abre tu navegador web y ve a la URL proporcionada por Vite para el frontend.
    *   Deberías poder registrarte (si la configuración de Firebase lo permite) o iniciar sesión con usuarios existentes (como el manager creado por el seeder si lo ejecutaste).

## Scripts Útiles

*   `npm run dev` (en `backend`): Inicia el servidor backend con `nodemon`.
*   `npm run start` (en `backend`): Inicia el servidor backend con `node`.
*   `npm run lint` (en `backend`): Ejecuta ESLint para verificar el código del backend.
*   `npm run dev` (en `frontend`): Inicia el servidor de desarrollo de Vite para el frontend.
*   `npm run build` (en `frontend`): Compila el frontend para producción.
*   `npm run lint` (en `frontend`): Ejecuta ESLint para verificar el código del frontend.
*   `npx sequelize-cli db:migrate` (en `backend`): Aplica migraciones pendientes.
*   `npx sequelize-cli db:seed:all` (en `backend`): Ejecuta todos los seeders.

## Estructura del Proyecto (Resumen)

*   `/backend`: Contiene todo el código del servidor Node.js/Express.
    *   `/config`: Archivos de configuración (base de datos, Firebase Admin, S3).
    *   `/controllers`: Lógica para manejar las peticiones API.
    *   `/middleware`: Funciones middleware (autenticación, autorización).
    *   `/migrations`: Archivos de migración de Sequelize.
    *   `/models`: Definiciones de modelos Sequelize.
    *   `/routes`: Definiciones de rutas API.
    *   `/seeders`: Archivos para poblar la base de datos con datos iniciales.
    *   `server.js`: Punto de entrada principal del backend.
*   `/frontend`: Contiene todo el código de la aplicación React (Vite).
    *   `/src`: Código fuente principal.
        *   `/components`: Componentes UI reutilizables.
        *   `/contexts`: Contextos React (ej. AuthContext).
        *   `/pages`: Componentes de página principales para cada ruta/rol.
        *   `/services`: Lógica para interactuar con la API backend.
        *   `App.jsx`: Componente raíz de la aplicación React.
        *   `main.jsx`: Punto de entrada principal del frontend.
*   `/Specs`: Documentación de requerimientos y planificación.
*   `.env`: (No versionado) Variables de entorno locales.
*   `.env.example`: Ejemplo de las variables de entorno requeridas.
*   `README.md`: Este archivo.

## .env a tener en cuenta:
- .env (backend): PORT=5002, NODE_ENV=production, CORS_ORIGIN=http://localhost:5173
- .env (frontend): VITE_API_BASE_URL=http://localhost:5002/api/v1

---

¡Contribuciones son bienvenidas! Por favor, sigue las guías de estilo y crea Pull Requests para nuevas funcionalidades o correcciones.
