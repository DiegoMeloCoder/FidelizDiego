import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Removed unused imports for tailwindcss and autoprefixer

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed css.postcss configuration block
})
