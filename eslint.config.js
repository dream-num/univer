import antfu from '@antfu/eslint-config';
import header from 'eslint-plugin-header';
import { baseRules, typescriptPreset } from '@univerjs/shared/eslint';

export default antfu({
    stylistic: {
        indent: 4,
        semi: true,
    },
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
}, {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.d.ts', '**/vite.config.ts', 'playwright.config.ts'],
    plugins: {
        header,
    },
    rules: {
        'header/header': [
            2,
            'block',
            [
                '*',
                ' * Copyright 2023-present DreamNum Inc.',
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
}, typescriptPreset());
