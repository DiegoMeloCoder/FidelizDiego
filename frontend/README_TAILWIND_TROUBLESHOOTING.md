# Tailwind CSS Troubleshooting Notes (Vite + React)

This document summarizes steps taken to resolve issues getting Tailwind CSS v3 working correctly with Vite.

## Initial Problem

After initial setup, Tailwind styles were not being applied, and errors related to PostCSS plugin loading appeared in the Vite development server console, such as:
*   `[postcss] It looks like you're trying to use 'tailwindcss' directly as a PostCSS plugin... install @tailwindcss/postcss...`
*   `[postcss] tailwindcss is not a PostCSS plugin`
*   `Cannot find module '@tailwindcss/postcss'`

These errors persisted despite trying various configurations in `vite.config.js` and `postcss.config.js/.cjs`, including installing/uninstalling `@tailwindcss/postcss`.

## Solution Applied (Using Tailwind v3)

The stable solution involved ensuring a standard Tailwind v3 setup:

1.  **Dependencies (`package.json`):**
    *   Ensure `tailwindcss` (v3, e.g., `^3.4.0`), `postcss`, and `autoprefixer` are listed in `devDependencies`.
    *   Ensure `@tailwindcss/postcss` is **NOT** installed (it was causing conflicts or being incorrectly requested).
    *   Command used:
        ```bash
        npm uninstall tailwindcss @tailwindcss/postcss
        npm install -D tailwindcss@^3.4.0 postcss autoprefixer
        ```
2.  **Tailwind Configuration (`tailwind.config.js`):**
    *   Use `module.exports` syntax.
    *   Ensure the `content` array correctly points to files containing Tailwind classes:
        ```javascript
        module.exports = {
          content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
          ],
          theme: { extend: {} },
          plugins: [],
        }
        ```
3.  **PostCSS Configuration (`postcss.config.cjs`):**
    *   Use the `.cjs` extension and `module.exports`.
    *   Define plugins using the standard object key syntax:
        ```javascript
        module.exports = {
          plugins: {
            tailwindcss: {},
            autoprefixer: {},
          },
        };
        ```
4.  **Vite Configuration (`vite.config.js`):**
    *   Ensure **NO** specific `css.postcss` configuration block is present. Vite should automatically pick up `postcss.config.cjs`.
        ```javascript
        import { defineConfig } from 'vite'
        import react from '@vitejs/plugin-react'

        export default defineConfig({
          plugins: [react()],
        })
        ```
5.  **Main CSS File (`src/index.css`):**
    *   Ensure it contains only the Tailwind directives:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
6.  **Import CSS:** Ensure `src/index.css` is imported in `src/main.jsx`.
7.  **Clean Install:** After configuration changes, it was necessary to delete `node_modules` and `package-lock.json` and run `npm install` again.
8.  **Restart Dev Server:** `npm run dev`.

This standard configuration for Tailwind v3 + Vite resolved the persistent errors.
