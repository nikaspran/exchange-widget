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
    "max-len": ["error", { "code": 120 }],
    "newline-per-chained-call": ["off"],
    "import/extensions": "off",
    "import/no-extraneous-dependencies": ["error", {
      "devDependencies": [
        "**/setupTests.js",
        "**/*{.,_}{test,spec}.{ts,tsx,js,jsx}"
      ],
      "optionalDependencies": false
    }],
    "react/jsx-filename-extension": ["error", { "extensions": [".tsx", ".jsx"] }],
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-props-no-spreading": "off"
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
