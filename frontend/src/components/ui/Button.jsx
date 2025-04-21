import React from 'react';

// Basic Button component with Tailwind classes
// Props:
// - children: Content of the button
// - onClick: Function to call on click
// - type: Button type (button, submit, reset), defaults to 'button'
// - variant: 'primary', 'secondary', 'danger', etc. (defaults to primary)
// - disabled: Boolean to disable the button
// - size: 'sm', 'md', 'lg' (defaults to 'md')
// - className: Additional classes to merge
// - otherProps: Any other standard button attributes (e.g., title)

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md', // Added size prop with default
  disabled = false,
  className = '',
  ...otherProps
}) {
  // Base styles - removed padding/text size, will be handled by size variant
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';

  // Variant styles
  let variantStyles = '';
  switch (variant) {
    case 'secondary':
      // Use brand-tertiary for bg, FORCE white text for better contrast in most cases, focus on primary
      variantStyles = 'bg-brand-tertiary text-white hover:opacity-90 focus:ring-brand-primary'; // Force white text
      break;
    case 'danger':
      variantStyles = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      break;
    case 'landing': // New variant for landing page theme
      variantStyles = 'bg-landing-primary text-white hover:bg-landing-primary-dark focus:ring-landing-primary';
      break;
    case 'landing-outline': // New outline variant for landing page
      variantStyles = 'bg-white text-landing-primary border border-landing-primary hover:bg-landing-primary hover:text-white focus:ring-landing-primary';
      break;
    case 'primary':
    default:
      // Use brand-primary for background and focus ring, FORCE white text
      variantStyles = 'bg-brand-primary text-white hover:opacity-90 focus:ring-brand-primary'; // Ensure text-white
      break;
  }

  // Size styles
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 text-xs'; // Adjusted padding and text size
      break;
    case 'lg':
      sizeStyles = 'px-5 py-2.5 text-base'; // Adjusted padding and text size
      break;
    case 'md':
    default:
      sizeStyles = 'px-4 py-2 text-sm'; // Default padding and text size
      break;
  }

  // Merge classes
  const mergedClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={mergedClassName}
      {...otherProps}
    >
      {children}
    </button>
  );
}

export default Button;
