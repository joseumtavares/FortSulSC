// Fast lint tier. Type-aware rules live in eslint.typed.config.mjs.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";
import quality from "./eslint-rules/index.cjs";

export default defineConfig([
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        window: "readonly",
        document: "readonly",
        HTMLDialogElement: "readonly",
        IntersectionObserver: "readonly",
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
    },
    rules: {
      "import-x/no-unresolved": "error",
      "import-x/no-duplicates": "error",
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: ["./src/app/**/*", "./src/components/**/*"],
              from: "./src/lib/db/client.ts",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { quality },
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      complexity: ["warn", 12],
      "max-depth": ["warn", 4],
      "max-statements": ["warn", 20],
      "max-params": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
      "max-nested-callbacks": ["warn", 3],
      "quality/max-lines": ["error", { max: 350 }],
      "quality/no-direct-console": [
        "error",
        { logger: "the project logging helper" },
      ],
      "quality/no-direct-data-access": [
        "error",
        {
          modules: ["@/lib/db/client"],
          bindings: ["prisma"],
          layers: ["/src/app/", "/src/components/"],
          extensions: [".tsx"],
        },
      ],
    },
  },
  {
    // This must follow the block that enables the console rule.
    files: ["src/lib/logger.ts"],
    rules: {
      "quality/no-direct-console": "off",
    },
  },
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/{__tests__,__mocks__,fixtures,mocks}/**/*.{ts,tsx}",
    ],
    plugins: { quality },
    rules: {
      "quality/max-lines": ["warn", { max: 350, includeTests: true }],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-statements": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "import-x/no-restricted-paths": "off",
    },
  },
  {
    files: ["eslint-rules/**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "readonly", require: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([
    ".agents/**",
    ".github/agents/**",
    ".github/hooks/**",
    ".github/skills/**",
    ".next/**",
    ".worktrees/**",
    "coverage/**",
    "dist/**",
    "build/**",
    "node_modules/**",
    "prisma/migrations/**",
    "public/**",
    "**/*.tsbuildinfo",
    "package-lock.json",
    "src/generated/**",
  ]),
]);


