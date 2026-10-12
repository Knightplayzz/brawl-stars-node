import js from "@eslint/js";
import promise from "eslint-plugin-promise";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**", "build/**"]
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setImmediate: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly"
      }
    },
    plugins: {
      promise
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^(_|err|error)$",
          ignoreRestSiblings: true
        }
      ],
      "no-console": "off",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      curly: ["error", "all"],
      "default-case": "error",
      "default-case-last": "error",
      "no-alert": "error",
      "no-debugger": "error",
      "no-else-return": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-implicit-coercion": "error",
      "no-lonely-if": "error",
      "no-new-wrappers": "error",
      "no-self-assign": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-useless-catch": "error",
      "object-shorthand": ["error", "always"],
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "promise/always-return": "off",
      "promise/no-nesting": "warn",
      "promise/no-return-wrap": "error",
      "promise/no-multiple-resolved": "error"
    }
  },
  prettier
];
