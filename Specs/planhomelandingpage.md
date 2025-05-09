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
6.  [HECHO - Parcial] Implementar CTAs:
    *   Botones/Enlaces existen en los componentes.
    *   URLs/lógica final pendiente (ej. URL Calendly, página/modal Demo).
7.  [HECHO - Básico] Asegurar Responsividad:
    *   Aplicados prefijos `sm:`, `md:`, `lg:` a componentes principales.
    *   Ajustes básicos de layout y texto realizados. Pendiente revisión exhaustiva.
8.  [HECHO - Básico] Añadir Interactividad Básica:
    *   Efectos `hover:` aplicados a botones y enlaces.
    *   Transición añadida a tarjetas de testimonio.
9.  [HECHO - Parcial] Optimización Inicial:
    *   Imágenes optimizadas (WebP) - *Pendiente (usando placeholders)*.
    *   Meta tags (`title`, `description`) añadidos directamente en `HomePage.jsx` (usando React 19+).
    *   Semántica HTML y `alt` en imágenes - *Pendiente (revisión general y placeholders)*.

**Fase 2.5: Mejoras Estéticas Avanzadas y Dinamismo Visual (En Progreso)**

*   **Objetivo:** Elevar el atractivo visual de la landing page, haciéndola más moderna, interactiva y alineada con la imagen de referencia proporcionada. Mantener la paleta de colores existente pero introducir más "movimiento y vida".

1.  **[PENDIENTE] Revisión y Mejora Avanzada de Botones:**
    *   **Objetivo:** Hacer los botones más atractivos, con mejor feedback visual y táctil.
    *   **Acciones:**
        *   Implementar micro-interacciones más pronunciadas en estados `hover` y `active` (ej. sutil cambio de tamaño, sombra más definida, transición de color más suave).
        *   Considerar la adición de iconos discretos a ciertos botones CTA para mejorar la claridad y el atractivo.
        *   Evaluar la posibilidad de añadir un efecto de gradiente sutil o un borde interior/exterior en hover para dar más profundidad, manteniendo la coherencia con la paleta `landing`.
        *   Asegurar consistencia visual y de comportamiento en todos los botones de la landing page.
2.  **[PENDIENTE] Incorporación Estratégica de Imágenes y Layouts Dinámicos:**
    *   **Objetivo:** Romper la monotonía de los layouts centrados, guiar la vista del usuario y crear un diseño más atractivo y profesional, similar a la referencia (texto a un lado, imagen al otro).
    *   **Acciones:**
        *   **HeroSection:** Reemplazar el placeholder visual con una imagen de alta calidad (ej. ilustración o fotografía relevante como la del hombre en la referencia). Implementar layout con texto a la izquierda e imagen a la derecha (o viceversa), asegurando un balance visual.
        *   **ProblemSolutionSection / HowItWorksSection:** Evaluar la introducción de imágenes o ilustraciones más pequeñas que acompañen los bloques de texto, alternando la disposición (imagen-texto, texto-imagen) para crear un flujo visual dinámico.
        *   Utilizar imágenes de alta calidad, relevantes al contenido y optimizadas para la web (se pueden usar placeholders de `https://via.placeholder.com/600x400` o `https://picsum.photos/600/400` durante el desarrollo si las imágenes finales no están disponibles).
        *   Asegurar que estos layouts asimétricos sean completamente responsivos, adaptándose elegantemente a diferentes tamaños de pantalla (ej. apilando elementos en móviles).
3.  **[PENDIENTE] Introducción de Animaciones Sutiles y Transiciones:**
    *   **Objetivo:** Añadir "vida" y sofisticación a la página sin sobrecargarla ni distraer del contenido principal.
    *   **Acciones:**
        *   Implementar transiciones suaves (ej. `fade-in`, `slide-in` sutil desde abajo o lateral) para la aparición de secciones o elementos clave al hacer scroll (efecto "scroll reveal").
        *   Añadir transiciones suaves a elementos interactivos como tarjetas de testimonios o logos de aliados al pasar el cursor sobre ellos.
        *   Considerar efectos parallax muy sutiles en imágenes de fondo de secciones grandes, si esto complementa el diseño sin afectar el rendimiento.
        *   Evitar animaciones excesivas o demasiado rápidas. La sutileza es clave.
4.  **[PENDIENTE] Refinamiento Tipográfico y Espaciado:**
    *   **Objetivo:** Mejorar la legibilidad y el impacto visual del texto.
    *   **Acciones:**
        *   Revisar jerarquías de texto (tamaños, pesos) para asegurar claridad y énfasis adecuado.
        *   Ajustar espaciado (márgenes, paddings, interlineado) para mejorar el flujo visual y la "respiración" del diseño.

**Fase 3: Pruebas y Refinamiento (Posterior a Fase 2 y 2.5)**

1.  **[PENDIENTE] Pruebas Visuales:** Cross-browser, cross-device.
2.  **[PENDIENTE] Pruebas Funcionales:** Clics en CTAs y enlaces.
3.  **[PENDIENTE] Pruebas de Contenido:** Proofreading placeholders.
4.  **[PENDIENTE] Revisión de Usabilidad:** Recorrido como cliente potencial.

**Fase 4: Despliegue (Posterior a Fase 3)**

1.  **[PENDIENTE] Merge:** Integrar a rama principal.
2.  **[PENDIENTE] Despliegue:** Vía pipeline CI/CD existente.

**Fase 5: Desarrollo de Páginas Adicionales y Contenido Legal**

*   **Objetivo:** Crear las páginas dedicadas para "Agendar Reunión", "Ver Demo", "Términos y Condiciones" y "Política de Privacidad", y actualizar los enlaces correspondientes.

1.  **[PENDIENTE] Página Dedicada "Agendar Reunión":**
    *   **Ruta:** `/agendar-reunion`.
    *   **Componente:** Crear `frontend/src/pages/landing/ScheduleMeetingPage.jsx`.
    *   **Diseño General:**
        *   Layout de dos columnas:
            *   **Columna Izquierda (Sidebar):**
                *   Título: "Agenda con nuestro equipo".
                *   Mostrar fotos de los 3 creadores (manager1.png, manager2.png, manager3.png desde `frontend/src/assets/logos/`) en círculos con nombres/roles (placeholders por ahora: "Creador 1", "Creador 2", "Creador 3").
            *   **Columna Derecha (Contenido Principal):**
                *   Título: "Selecciona Fecha y Hora para tu Reunión".
                *   Incrustar Calendly usando iframe: `https://calendly.com/dlxstudios29`. Asegurar que sea responsivo.
    *   **Estilo:** Coherente con la landing page. Incluir `LandingNavbar` y `LandingFooter` simplificados o adaptados si es necesario.
    *   **Actualizar CTAs:** Modificar botones "Agendar Reunión" en `LandingNavbar.jsx`, `HeroSection.jsx`, `FinalCTASection.jsx` para enlazar a `/agendar-reunion`.

2.  **[PENDIENTE] Página Dedicada "Ver Demo":**
    *   **Ruta:** `/demo`.
    *   **Componente:** Crear `frontend/src/pages/landing/ViewDemoPage.jsx`.
    *   **Diseño General:**
        *   Título principal: "¡Mira cómo funciona Fideliz!".
        *   Subtítulo opcional: "Descubre el poder de nuestra plataforma en este breve video."
        *   Contenedor para video de YouTube:
            *   Incrustar video `https://www.youtube.com/watch?v=Zcb8yPEItwA` usando `react-player` o iframe. Asegurar responsividad.
    *   **Estilo:** Diseño limpio, centrado en el video. Coherente con la landing page. Incluir `LandingNavbar` y `LandingFooter` simplificados o adaptados.
    *   **Actualizar CTAs:** Modificar botones "Ver Demo" en `LandingNavbar.jsx`, `HeroSection.jsx`, `FinalCTASection.jsx` para enlazar a `/demo`.

3.  **[PENDIENTE] Página Dedicada "Términos y Condiciones":**
    *   **Ruta:** `/terminos-y-condiciones`.
    *   **Componente:** Crear `frontend/src/pages/legal/TermsAndConditionsPage.jsx`.
    *   **Diseño General:**
        *   Layout simple de una columna.
        *   Título: "Términos y Condiciones".
        *   Contenido: Generar borrador de texto con IA (se proporcionará en el siguiente paso).
    *   **Estilo:** Limpio, tipografía legible. Incluir `LandingNavbar` y `LandingFooter`.
    *   **Actualizar Enlace:** Modificar enlace en `LandingFooter.jsx`.

4.  **[PENDIENTE] Página Dedicada "Política de Privacidad":**
    *   **Ruta:** `/politica-de-privacidad`.
    *   **Componente:** Crear `frontend/src/pages/legal/PrivacyPolicyPage.jsx`.
    *   **Diseño General:**
        *   Layout simple de una columna.
        *   Título: "Política de Privacidad".
        *   Contenido: Generar borrador de texto con IA (se proporcionará en el siguiente paso).
    *   **Estilo:** Similar a Términos y Condiciones. Incluir `LandingNavbar` y `LandingFooter`.
    *   **Actualizar Enlace:** Modificar enlace en `LandingFooter.jsx`.

5.  **[PENDIENTE] Creación de Directorios para Nuevas Páginas:**
    *   Crear `frontend/src/pages/landing/` para `ScheduleMeetingPage.jsx` y `ViewDemoPage.jsx`.
    *   Crear `frontend/src/pages/legal/` para `TermsAndConditionsPage.jsx` y `PrivacyPolicyPage.jsx`.

6.  **[PENDIENTE] Configuración de Rutas en `frontend/src/App.jsx`:**
    *   Añadir nuevas rutas para `/agendar-reunion`, `/demo`, `/terminos-y-condiciones`, `/politica-de-privacidad`.
