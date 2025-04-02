import antfu from '@antfu/eslint-config';
import { baseRules, facadePreset, specPreset, tailwindcssPreset, typescriptPreset, univerSourcePreset } from '@univerjs-infra/shared/eslint';
import header from 'eslint-plugin-header';
import barrel from 'eslint-plugin-no-barrel-import';
import penetrating from 'eslint-plugin-no-penetrating-import';

header.rules.header.meta.schema = false;

export default antfu(
    {
        stylistic: {
            indent: 4,
            semi: true,
        },
        regexp: false,
        react: true,
        yaml: {
            overrides: {
                'yaml/indent': ['error', 4, { indicatorValueIndent: 2 }],
            },
        },
        markdown: false,
        typescript: true,
        formatters: {
            css: true,
            html: true,
        },
        rules: baseRules,
        ignores: [
            'mockdata/**/*.json',
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: [
            'packages/engine-render/src/components/docs/**/*.ts',
            '**/*.tsx',
            '**/*.d.ts',
            '**/vite.config.ts',
            'playwright.config.ts',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
        ], // do not check test files
        rules: {
            complexity: ['warn', { max: 20 }],
            'max-lines-per-function': ['warn', 80],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/*.d.ts', '**/vite.config.ts', '**/vitest.config.ts', '**/vitest.workspace.ts', 'playwright.config.ts'],
        plugins: {
            header,
            barrel,
        },
        rules: {
            'barrel/no-barrel-import': 2,
            'header/header': [
                2,
                'block',
                [
                    '*',
                    ' * Copyright 2023-present DreamNum Co., Ltd.',
                    ' *',
                    ' * Licensed under the Apache License, Version 2.0 (the "License");',
                    ' * you may not use this file except in compliance with the License.',
                    ' * You may obtain a copy of the License at',
                    ' *',
                    ' *     http://www.apache.org/licenses/LICENSE-2.0',
                    ' *',
                    ' * Unless required by applicable law or agreed to in writing, software',
                    ' * distributed under the License is distributed on an "AS IS" BASIS,',
                    ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
                    ' * See the License for the specific language governing permissions and',
                    ' * limitations under the License.',
                    ' ',
                ],
                2,
            ],
        },
    },
    {
        // Not penetrating for source files
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            penetrating,
        },
        ignores: [
            '**/__tests__/**/*',
            '**/__testing__/**/*',
            'examples/**/*',
        ],
        rules: {
            'penetrating/no-penetrating-import': 2,
        },
    },
    {
        files: ['**/*/src/index.ts'],
        rules: {
            'perfectionist/sort-exports': 'off',
        },
    },
    typescriptPreset(),
    univerSourcePreset(),
    facadePreset(),
    tailwindcssPreset(),
    specPreset()
);
