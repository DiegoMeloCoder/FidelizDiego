/** @type {import('tailwindcss').Config} */
module.exports = { // Changed to module.exports
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Keep this content glob
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
