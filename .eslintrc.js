module.exports = {
  extends: [
    "eslint:recommended",
    "@nomicfoundation/hardhat-eslint"
  ],
  plugins: ["hardhat"],
  rules: {
    "hardhat/internal-test-imports": "error",
    "hardhat/no-internal-imports": "error",
    "hardhat/no-nested-imports": "error",
    "hardhat/no-testing solidity": "error",
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "no-console": "warn"
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  ignorePatterns: [
    "node_modules/",
    "artifacts/",
    "cache/"
  ]
};
