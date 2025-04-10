import React from 'react';

// Basic Input component with Tailwind classes
// Props:
// - type: Input type (text, email, password, number, etc.), defaults to 'text'
// - value: Current value of the input
// - onChange: Function to call on change
// - placeholder: Placeholder text
// - disabled: Boolean to disable the input
// - required: Boolean for HTML5 required attribute
// - className: Additional classes to merge
// - otherProps: Any other standard input attributes (e.g., name, id, minLength, min, max)

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  ...otherProps
}) {
  // Base styles
  const baseStyles = 'block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  // Merge classes
  const mergedClassName = `${baseStyles} ${className}`;

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={mergedClassName}
      {...otherProps}
    />
  );
}

export default Input;
