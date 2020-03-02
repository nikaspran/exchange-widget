module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "react-app",
    "airbnb",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "import/extensions": "off",
    "react/jsx-filename-extension": ["error", { "extensions": [".tsx", ".jsx"] }]
  },
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "func-call-spacing": "off",
        "no-spaced-func": "off",
        "import/no-unresolved": "off",
        "import/first": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
      }
    }
  ],

}
