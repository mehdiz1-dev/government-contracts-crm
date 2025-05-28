// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
// You might have imports for React, Next.js, etc. plugins here, e.g.:
// import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
// import pluginNext from "@next/eslint-plugin-next"; // Example, might be different
// import { fixupConfigAsPlugin } from "@eslint/compat"; // If you see this in your file

export default tseslint.config(
  // --- Find the main config object, usually the first one in the array ---
  {
    // This `files` property defines what files this config object applies to.
    // It's crucial to identify the object that contains this.
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], // <--- Identify this object in your file
    // Add your ignore patterns here, at the same level as 'files' and 'languageOptions'
    ignores: ["src/generated/**"], // <--- ADD THIS LINE to ignore generated Prisma files
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // You might have other properties here like 'plugins', 'settings', etc.
  },
  // --- END OF MAIN CONFIG OBJECT ---

  // You'll likely have other configs from `extends` properties here, e.g.:
  // pluginJs.configs.recommended,
  // ...tseslint.configs.recommended,
  // fixupConfigAsPlugin(pluginReactConfig), // If you're using React ESLint plugin
  // pluginNext.configs.recommended, // If you're using Next.js ESLint plugin

  // --- ADD A NEW CONFIG OBJECT FOR RULE OVERRIDES ---
  // This new object will contain your custom rules and override defaults.
  {
    rules: {
      // Allows apostrophes like 's directly in JSX (fix react/no-unescaped-entities error)
      "react/no-unescaped-entities": "off",

      // Changes unused vars from error to warning (fix @typescript-eslint/no-unused-vars)
      // You can set this to "off" if you don't want unused vars to be warnings either
      "@typescript-eslint/no-unused-vars": "warn",

      // Allows require() style imports (needed for Prisma generated code)
      "@typescript-eslint/no-require-imports": "off",

      // Allows 'any' type (common in generated code and early dev)
      "@typescript-eslint/no-explicit-any": "off",

      // Allows {} for empty object type (common in generated code)
      "@typescript-eslint/no-empty-object-type": "off",

      // Relax overly strict type constraints
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-wrapper-object-types": "off", // Allows BigInt instead of bigint
      "@typescript-eslint/no-unsafe-function-type": "off", // Allows Function type

      // You might also need to turn off specific Next.js rules if they conflict, e.g.:
      // "@next/next/no-img-element": "off", // Example, if you use <img> directly
    },
  },
  // --- END NEW CONFIG OBJECT ---
);