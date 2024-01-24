/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { dirname, join } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
    stories: [
        {
            directory: '../packages/design/src/**',
            files: '*.stories.@(js|jsx|mjs|ts|tsx)',
            titlePrefix: 'Design',
        },
        {
            directory: '../packages/ui/src/**',
            files: '*.stories.@(js|jsx|mjs|ts|tsx)',
            titlePrefix: 'Base UI',
        },
        {
            directory: '../packages/sheets-numfmt/src/**',
            files: '*.stories.@(js|jsx|mjs|ts|tsx)',
            titlePrefix: 'Numfmt',
        },
        {
            directory: '../packages/find-replace/src/**',
            files: '*.stories.@(js|jsx|mjs|ts|tsx)',
            titlePrefix: 'Find & Replace',
        },
    ],
    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
        getAbsolutePath('@storybook/addon-interactions'),
        getAbsolutePath('@storybook/addon-docs'),
    ],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    docs: {
        autodocs: true,
    },
    async viteFinal(config) {
        config.css = {
            modules: {
                localsConvention: 'camelCaseOnly',
                generateScopedName: 'univer-[local]',
            },
        };

        return config;
    },
};

export default config;
