# Plan Detallado para el Desarrollo de la Homepage (Integrada en React) - FidelizDiego

**Filosofía:** Crear una landing page visualmente atractiva, profesional, moderna y persuasiva, integrada dentro del proyecto `frontend/` existente para aprovechar la configuración actual y agilizar el desarrollo inicial (MVP). Inspiración principal: Estilo claro de Bonda, adaptado a la identidad de FidelizDiego.

**Fase 0: Estrategia, Contenido y Dirección Visual (Definida)**

1.  **Enfoque:** Integrada en `frontend/`, ruta pública `/`, sin autenticación ni `AppLayout` principal.
2.  **Público Objetivo:** Decisores empresariales (Dueños, Gerentes, Directores RRHH), potenciales Empresas Aliadas.
3.  **PUV Central:** "Retén talento y motiva a tu equipo sin esfuerzo con beneficios reales y gestión inteligente." (Sujeto a refinamiento).
4.  **Dirección Visual:**
    *   **Estilo:** Modo Claro. Limpio, moderno, profesional, amplio espacio en blanco.
    *   **Paleta:** Fondo blanco/gris claro. Verdes vibrantes (primario/acento). Grises neutros (texto/secundarios). Gradientes sutiles opcionales.
    *   **Tipografía:** Limpia y legible (usar existente o definir nueva).
    *   **UI:** Botones claros, tarjetas testimonios, grids logos, esquinas redondeadas sutiles, sombras suaves.
5.  **Estructura y Secciones Clave:**
    *   **`LandingNavbar`:** Logo, Enlaces opcionales (#funciona, #aliados, #testimonios), Botón "Ingresar" (`/login`), Botón "Agendar Reunión" (externo), Botón "Ver Demo" (`/demo` o modal).
    *   **`HeroSection`:** Visual (imagen/ilustración abstracta verde), Titular `[AI Generará]`, Subtítulo `[AI Generará]`, CTAs ("Agendar Reunión", "Ver Demo").
    *   **`ProblemSolutionSection`:** Título `[AI Generará]`, Texto breve `[AI Generará]` (coste rotación vs. beneficio retención).
    *   **`HowItWorksSection` (Beneficios):** Título `[AI Generará]`, 3-4 puntos (layout alternado imagen/texto), Iconos/mockups simplificados (Alianzas, Gestión Admin, Experiencia Empleado, IA).
    *   **`AllianceLogosGrid`:** Título, Grid de logos `[Placeholders]`.
    *   **`TestimonialsSection`:** Título, 3 `TestimonialCard` (contenido genérico `[AI Generará]`).
    *   **`FinalCTASection`:** Título `[AI Generará]`, Texto `[AI Generará]`, CTAs ("Agendar Reunión", "Ver Demo").
    *   **`LandingFooter`:** Logo pequeño, Copyright, Enlaces Políticas (`#`), Iconos Sociales (`#`).
6.  **Contenido Inicial:** Placeholders generados por IA/desarrollador. Optimización SEO posterior.

**Fase 1: Diseño y Prototipado (Omitida - Se usará inspiración directa)**

*   Se procederá directamente a la implementación basándose en la Fase 0 y las imágenes de inspiración (Bonda).

**Fase 2: Implementación Técnica Detallada (En Progreso)**

1.  **[HECHO] Configuración de Rutas (`frontend/src/App.jsx`):**
    *   Añadida ruta pública `/` para `HomePage`.
    *   Añadida ruta `/post-login-redirect` para manejar redirección post-login.
    *   Ajustada lógica en `LoginPage.jsx` para usar `/post-login-redirect`.
2.  **[HECHO] Crear Componente Principal (`src/pages/HomePage.jsx`):**
    *   Creado y renderiza la secuencia de componentes de sección (placeholders).
3.  **[HECHO] Configurar Tailwind (`tailwind.config.js`):**
    *   Extendida `theme.colors` con paleta `landing` (verdes, neutrales).
4.  **[HECHO] Crear Directorio (`src/components/landing/`):**
    *   Creado directorio para componentes de la landing.
5.  **[HECHO] Desarrollar Componentes (Placeholders):**
    *   Crear archivos `.jsx`.
    *   Implementar HTML semántico.
    *   Estilo con Tailwind (basado en inspiración Bonda y Fase 0).
    *   Usar contenido placeholder.
    *   **Componentes Creados (con placeholders):** `LandingNavbar`, `LandingFooter`, `HeroSection`, `ProblemSolutionSection`, `HowItWorksSection`, `AllianceLogosGrid`, `TestimonialsSection`, `FinalCTASection`.
    *   **Componente UI Actualizado:** `Button` (añadidas variantes `landing` y `landing-outline`).
    *   **Página Actualizada:** `LoginPage` rediseñada con estilo landing y botón "Volver".
6.  **[HECHO - Parcial] Implementar CTAs:**
    *   Botones/Enlaces existen en los componentes.
    *   URLs/lógica final pendiente (ej. URL Calendly, página/modal Demo).
7.  **[HECHO - Básico] Asegurar Responsividad:**
    *   Aplicados prefijos `sm:`, `md:`, `lg:` a componentes principales.
    *   Ajustes básicos de layout y texto realizados. Pendiente revisión exhaustiva.
8.  **[HECHO - Básico] Añadir Interactividad Básica:**
    *   Efectos `hover:` aplicados a botones y enlaces.
    *   Transición añadida a tarjetas de testimonio.
9.  **[HECHO - Parcial] Optimización Inicial:**
    *   Imágenes optimizadas (WebP) - *Pendiente (usando placeholders)*.
    *   Meta tags (`title`, `description`) añadidos directamente en `HomePage.jsx` (usando React 19+).
    *   Semántica HTML y `alt` en imágenes - *Pendiente (revisión general y placeholders)*.

**Fase 3: Pruebas y Refinamiento (Posterior a Fase 2)**

1.  **[PENDIENTE] Pruebas Visuales:** Cross-browser, cross-device.
2.  **[PENDIENTE] Pruebas Funcionales:** Clics en CTAs y enlaces.
3.  **[PENDIENTE] Pruebas de Contenido:** Proofreading placeholders.
4.  **[PENDIENTE] Revisión de Usabilidad:** Recorrido como cliente potencial.

**Fase 4: Despliegue (Posterior a Fase 3)**

1.  **[PENDIENTE] Merge:** Integrar a rama principal.
2.  **[PENDIENTE] Despliegue:** Vía pipeline CI/CD existente.
