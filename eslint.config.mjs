import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
	...nextConfig,
	...coreWebVitals,
	...typescript,
	{
		rules: {
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			// Hydration guard pattern (useState in useEffect) is legitimate
			"react-hooks/set-state-in-effect": "warn",
		},
	},
	{
		files: ["src/components/content/blocks/**/*"],
		rules: {
			"@next/next/no-img-element": "off",
		},
	},
];

export default eslintConfig;
