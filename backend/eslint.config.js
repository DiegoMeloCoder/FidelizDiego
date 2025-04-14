// @ts-check <-- Optional: Enables type checking for this file in VS Code

import globals from "globals";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // 1. Global ignores
  {
    ignores: ["node_modules/", "coverage/", "dist/"],
  },

  // 2. Base configuration for JS files (recommended rules)
  js.configs.recommended,

  // 3. Configuration for the backend project specifically
  {
    files: ["**/*.js"], // Apply to all JS files in the backend directory
    languageOptions: {
      ecmaVersion: 2021, // Matches your old config
      sourceType: "commonjs", // Matches your old config
      globals: {
        ...globals.node, // Use Node.js global variables
        ...globals.jest, // Use Jest global variables
      },
    },
    rules: {
      // Your custom rules:
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off", // Allows console.log
      // Add other rules here if needed
    },
  },

  // 4. Prettier configuration (must be last to override other style rules)
  eslintConfigPrettier,
];
