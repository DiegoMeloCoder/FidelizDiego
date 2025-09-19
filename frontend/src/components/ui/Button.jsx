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
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...otherProps
}) {
  const baseStyles =
    "font-medium rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity/50 disabled:cursor-not-allowed inline-flex items-center justify-center active:scale-95";

  // Variant styles
  let variantStyles = "";
  switch (variant) {
    case "secondary":
      variantStyles =
        "bg-tertiary text-white hover:opacity/90 focus:ring-primary";
      break;
    case "danger":
      variantStyles =
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 hover:shadow-md";
      break;
    case "landing":
      variantStyles =
        "bg-landing-primary text-white hover:bg-landing-primary-dark focus:ring-landing-primary hover:shadow-lg hover:scale-105";
      break;
    case "landing-outline":
      variantStyles =
        "bg-white text-landing-primary border-2 border-landing-primary hover:bg-landing-primary hover:text-white focus:ring-landing-primary hover:scale-105 hover:shadow-md";
      break;
    case "primary":
    default:
      variantStyles =
        "bg-primary text-white hover:opacity/90 focus:ring-primary";
      break;
  }

  // Size styles
  let sizeStyles = "";
  switch (size) {
    case "sm":
      sizeStyles = "px-3 py-1.5 text-xs";
      break;
    case "lg":
      sizeStyles = "px-5 py-2.5 text-base";
      break;
    case "md":
    default:
      sizeStyles = "px-4 py-2 text-sm";
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
