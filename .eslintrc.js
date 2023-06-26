module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
    },
    plugins: ["@typescript-eslint"],

    rules: {
        // "indent": [
        //     "error",
        //     "tab"
        // ],
        //
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-non-null-assertion": "off",

        "@typescript-eslint/no-namespace": "off",
        "linebreak-style": ["error", "unix"],
        // quotes: ["error", "double"],
        semi: ["error", "always"],
    },
};
