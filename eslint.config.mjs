import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: [
			"**/apps/",
			"**/bin/",
			"**/build/",
			"**/external/**",
			"x86_image_wizard/epoxy/",
			"**/static/",
			"**/anuraos-types/",
			"public/anura-sw.js",
			"public/sw/**",
			"**/server/",
			"documentation/templates",
		],
	},
	...compat.extends(
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
	),
	{
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			globals: {
				...globals.browser,
			},

			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "script",
		},

		rules: {
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/ban-ts-comment": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"no-async-promise-executor": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"linebreak-style": ["error", "unix"],
			semi: ["error", "always"],
		},
	},
];
