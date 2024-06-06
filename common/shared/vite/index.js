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

const process = require('node:process');
const { resolve } = require('node:path');

const { defineConfig, mergeConfig } = require('vitest/config');
const { default: dts } = require('vite-plugin-dts');
const react = require('@vitejs/plugin-react');
const { autoExternalizeDependency } = require('./auto-externalize-dependency-plugin');
const { obfuscator } = require('./obfuscator');
const { buildPkg } = require('./build-pkg');
const { convertLibNameFromPackageName } = require('./utils');

/**
 * IFeatures
 * @typedef {object} IFeatures - features
 * @property {boolean} react - whether to use react
 * @property {boolean} css - whether to use css
 * @property {boolean} dom - whether to use dom
 */

/**
 * IOptions
 * @typedef {object} IOptions - options of shared vite config
 * @property {string} mode - mode of vite
 * @property {object} pkg - package.json
 * @property {IFeatures} features - package.json
 */

function createViteConfig(overrideConfig, /** @type {IOptions} */ options) {
    const { mode, pkg, features } = options;

    const dirname = process.cwd();

    const originalConfig = {
        build: {
            target: 'chrome70',
            outDir: 'lib',
            lib: {
                entry: resolve(dirname, 'src/index.ts'),
                name: convertLibNameFromPackageName(pkg.name),
                fileName: (format) => `${format}/index.js`,
                formats: ['es', 'umd', 'cjs'],
            },
        },
        plugins: [
            autoExternalizeDependency(),
            dts({
                entryRoot: 'src',
                outDir: 'lib/types',
            }),
            obfuscator(),
            buildPkg(),
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env.BUNDLE_TYPE': JSON.stringify(process.env.BUNDLE_TYPE ?? ''),
        },
        test: {
            coverage: {
                reporter: ['html', 'json'],
                provider: 'custom',
                customProviderModule: require.resolve('@vitest/coverage-istanbul'),
            },
        },
    };

    if (features) {
        if (features.react) {
            originalConfig.plugins.push(react());
        }

        if (features.css) {
            originalConfig.css = {
                modules: {
                    localsConvention: 'camelCaseOnly',
                    generateScopedName: 'univer-[local]',
                },
            };
        }

        if (features.dom) {
            originalConfig.test.environment = 'happy-dom';
        }
    }

    return mergeConfig(
        defineConfig(originalConfig),
        overrideConfig
    );
};

module.exports = createViteConfig;
