import js from '@eslint/js';
import react from 'eslint-plugin-react';

export default [
    js.configs.recommended,
    {
        env: {
            jest: true,
        },
        files: ['**/*.{js,jsx}'],
        plugins: {
            react,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'warn',
        },
    },
];
