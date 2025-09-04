import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js"],
    plugins: {
      js,
    },
    extends: ["js/recommended"],

    languageOptions: {
      "ecmaVersion": 2023,
      "sourceType": "module",
      globals: {
        ...globals.node, // Node.js globals
        ...globals.es2023, // ES2023 globals
      }
    }
  },
]);
