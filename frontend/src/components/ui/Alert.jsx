// Alert component for feedback messages
// Props:
// - children: The message content
// - type: 'success', 'error', 'warning', 'info' (defaults to 'info')
// - className: Additional classes to merge
// - onClose: Optional function to call when closed (if closable)

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"; // Usamos los iconos sólidos para más impacto

// 1. Creamos un "mapa" para los estilos de cada variante.
// Es más declarativo y fácil de leer que un switch.
const variantStyles = {
  success: "bg-green-50 border-green-300 text-green-800",
  error: "bg-red-50 border-red-300 text-red-800",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
  info: "bg-blue-50 border-blue-300 text-brand-secondary",
};

// 2. Creamos un "mapa" para los iconos correspondientes.
const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

function Alert({ children, type = "info", className = "", onClose }) {
  // 3. Seleccionamos los estilos y el icono del mapa.
  // Si se pasa un 'type' inválido, se usará 'info' como valor por defecto.
  const typeStyles = variantStyles[type] || variantStyles.info;
  const IconComponent = icons[type] || icons.info;

  // Clases base que se aplican a todas las alertas
  const baseStyles = "p-4 rounded-md border flex items-start";

  // Unimos todas las clases
  const mergedClassName = `${baseStyles} ${typeStyles} ${className}`;

  return (
    <div role="alert" className={mergedClassName}>
      {/* Renderizamos el icono desde Heroicons */}
      <IconComponent
        className="w-5 h-5 mr-3 shrink-0"
        aria-hidden="true"
      />

      <div className="grow">{children}</div>

      {/* El botón de cierre permanece igual */}
      {onClose && (
        <button
          onClick={onClose}
          className="-mt-1 -mr-1.5 ml-3 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current"
          aria-label="Cerrar"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Alert;
