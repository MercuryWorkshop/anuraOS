import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

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
			"**/dist.js",
			"**/build/",
			"**/anuraos-types/",
			"**/bin/",
			"**/aboutproxy/",
			"**/v86/",
			"**/apps/",
			"**/.eslintrc.js",
			"public/anura-sw.js",
			"public/lib/",
			"documentation/templates",
			"public/lib/html-to-image.min.js",
			"public/uv/",
			"**/static/",
			"**/chimerix/",
			"**/dreamlandjs/",
			"x86_image_wizard/twisp/",
			"x86_image_wizard/epoxy/",
			"**/native-file-system-adapter/",
			"**/server/",
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
