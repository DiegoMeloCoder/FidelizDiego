import React from 'react';

// Simple SVG Spinner component
// Props:
// - size: 'sm', 'md', 'lg' (defaults to 'md') for width/height
// - color: Tailwind text color class (e.g., 'text-indigo-600'), defaults to primary color
// - className: Additional classes

function Spinner({ size = 'md', color = 'text-indigo-600', className = '' }) {
  let sizeClass = 'w-6 h-6'; // Default md
  if (size === 'sm') sizeClass = 'w-4 h-4';
  if (size === 'lg') sizeClass = 'w-8 h-8';

  const mergedClassName = `animate-spin ${sizeClass} ${color} ${className}`;

  return (
    <svg
      className={mergedClassName}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true" // Hide from screen readers as it's decorative
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export default Spinner;
