import { Link, useLocation } from "react-router-dom";

// Componente reutilizable para un enlace en la barra de navegación lateral.
function NavItem({ to, icon: Icon, children, onClick }) {
  const location = useLocation();

  // La lógica para determinar si el enlace está activo está encapsulada aquí.
  const isActive = () => {
    // Para las rutas raíz de cada rol, requerimos una coincidencia exacta.
    if (to === "/manager" || to === "/admin" || to === "/employee") {
      return location.pathname === to;
    }
    // Para las sub-rutas, verificamos si la URL actual comienza con la ruta del enlace.
    return location.pathname.startsWith(to);
  };

  const active = isActive();

  // Clases de Tailwind para los estilos. Se aplican condicionalmente.
  const linkClasses = `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-100 hover:bg-primary hover:text-white transition-colors duration-150 ${
    active ? "bg-primary text-white shadow-inner" : ""
  }`;

  const iconClasses = `mr-3 shrink-0 h-5 w-5 text-gray-300 group-hover:text-gray-100 transition-colors duration-150 ${
    active ? "text-white" : ""
  }`;

  return (
    <Link to={to} className={linkClasses} onClick={onClick}>
      {Icon && <Icon className={iconClasses} aria-hidden="true" />}
      {children}
    </Link>
  );
}

export default NavItem;
