import React from "react";

/**
 * Un componente de selección (select) reutilizable y estilizado con TailwindCSS.
 * @param {object} props
 * @param {string} props.id - ID para el select, se usa con el label.
 * @param {string} props.label - El texto del label para el input.
 * @param {any} props.value - El valor actualmente seleccionado.
 * @param {function} props.onChange - Función que se llama cuando el valor cambia.
 * @param {React.ReactNode} props.children - Las etiquetas <option> que irán dentro del select.
 * @param {boolean} [props.required=false] - Si el campo es requerido.
 * @param {boolean} [props.disabled=false] - Si el campo está deshabilitado.
 * @param {string} [props.className] - Clases adicionales para el contenedor del div.
 */
function Select({
  id,
  label,
  value,
  onChange,
  children,
  required = false,
  disabled = false,
  className = "",
}) {
  // Clases base para el select, incluyendo padding (py-2, px-3) y estilos de foco.
  const selectClasses =
    "block w-full mt-1 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
      >
        {children}
      </select>
    </div>
  );
}

export default Select;
