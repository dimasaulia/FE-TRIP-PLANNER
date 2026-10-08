import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Colours come only from src/styles/tokens.ts; components use semantic names.
const rawColour = String.raw`/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\b(bg|text|border|ring|fill|stroke|from|via|to|shadow|outline)-\[#/`;
const rawColourMessage = "Use a theme token (bg-surface, text-ink-muted, bg-accent…) instead of a raw colour; colours live in src/styles/tokens.ts.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/styles/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=${rawColour}]`, message: rawColourMessage },
        { selector: `TemplateElement[value.raw=${rawColour}]`, message: rawColourMessage },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
