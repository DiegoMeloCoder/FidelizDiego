/** @type {import('tailwindcss').Config} */
module.exports = { // Changed to module.exports
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Keep this content glob
  ],
  theme: {
    extend: {
      colors: {
        // Define brand colors using CSS variables with fallbacks
        // Fallbacks match the default indigo/gray theme
        brand: {
          primary: 'var(--color-primary, #4f46e5)',    // Default: Indigo 600
          secondary: 'var(--color-secondary, #374151)', // Default: Gray 700
          tertiary: 'var(--color-tertiary, #d1d5db)',  // Default: Gray 300
        },
        // Landing Page Specific Colors (Static Theme - Based on provided palette)
        landing: {
          primary: {
            light: '#6CBA42',    // Light-Medium Green
            DEFAULT: '#339A2D', // Medium Green
            dark: '#2C5C2E',     // Dark Green
          },
          lime: '#92C71A',
          teal: '#118361',
          olive: '#4A7722',
          muted: '#90B77F',
          accent: '#64B055',     // Another Light-Medium Green
          // background: '#ffffff', // Example: Explicit white background
          // text: '#1f2937', // Example: Default text color (gray-800)
        },
        // Keep existing grays, indigo, etc. for potential direct use or reference
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#11182c',
        },
        indigo: {
          300: '#a5b4fc',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out forwards', // forwards keeps the state of the last keyframe
        scroll: 'scroll 40s linear infinite', // For the logo marquee
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: { // For the logo marquee
          'to': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
