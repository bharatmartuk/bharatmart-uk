/** @type {import("prettier").Config} */
const prettierConfig = {
  semi: true,
  singleQuote: true,
  trailingComma: "all",
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"],
}

module.exports = prettierConfig
