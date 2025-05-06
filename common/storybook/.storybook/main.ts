/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { StorybookConfig } from '@storybook/react-webpack5';
import type { StoriesEntry } from '@storybook/types';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const tsconfigPathsPlugin = new TsconfigPathsPlugin({
    configFile: resolve(__dirname, '../tsconfig.storybook.json'),
    extensions: ['.ts', '.tsx', '.js'],
});

const config: StorybookConfig = {
    stories: async (): Promise<StoriesEntry[]> => {
        const rootPaths = ['../../../packages'];
        const isSubmodules = __dirname.includes('submodules');
        if (isSubmodules) {
            rootPaths.push('../../../../../packages');
        }

        const stories: StoriesEntry[] = [];
        rootPaths.forEach((rootPath) => {
            const rootDir = resolve(__dirname, rootPath);
            if (existsSync(rootDir)) {
                readdirSync(rootDir).forEach((pkg) => {
                    const pkgPath = resolve(rootDir, pkg, 'package.json');
                    const srcDir = resolve(rootDir, pkg, 'src');
                    if (existsSync(pkgPath) && existsSync(srcDir)) {
                        stories.push({
                            directory: `${rootPath}/${pkg}/src`,
                            files: '**/*.stories.@(js|jsx|mjs|ts|tsx)',
                            titlePrefix: pkg,
                        });
                    }
                });
            }
        });

        return stories;
    },
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@chromatic-com/storybook',
        '@storybook/addon-interactions',
        '@storybook/addon-webpack5-compiler-swc',
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.css$/,
                        sideEffects: true,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    implementation: 'postcss',
                                },
                            },
                        ],
                    },
                ],
            },
        },
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    swc: () => {
        return {
            isModule: true,
            module: {
                type: 'es6',
                noInterop: true,
            },
            env: {
                target: 'es2022',
            },
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: true,
                    decorators: true,
                    decoratorsBeforeExport: true,
                    dynamicImport: true,
                },
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                    legacyDecorator: true,
                    decoratorMetadata: true,
                },
                loose: true,
            },
        };
    },
    docs: {
        autodocs: 'tag',
        defaultName: 'documentatie',
    },
    async webpackFinal(config) {
        if (config.resolve) {
            config.resolve.plugins = [tsconfigPathsPlugin];
        }

        return config;
    },
};

export default config;
