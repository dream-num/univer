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

const path = require('node:path');
const process = require('node:process');
const react = require('@vitejs/plugin-react');
const fs = require('fs-extra');
const { default: dts } = require('vite-plugin-dts');

const vitePluginExternal = require('vite-plugin-external');
const { defineConfig, mergeConfig } = require('vitest/config');

const { autoExternalizeDependency } = require('./auto-externalize-dependency-plugin');
const { buildPkg } = require('./build-pkg');
const { buildUMD } = require('./build-umd');
const { obfuscator } = require('./obfuscator');
const { convertLibNameFromPackageName } = require('./utils');

/**
 * IFeatures
 * @typedef {object} IFeatures - features
 * @property {boolean} react - whether to use react
 * @property {boolean} css - whether to use css
 * @property {boolean} dom - whether to use dom
 * @property {'ignore' | undefined} umd - whether to use vue
 */

/**
 * IOptions
 * @typedef {object} IOptions - options of shared vite config
 * @property {string} mode - mode of vite
 * @property {object} pkg - package.json
 * @property {IFeatures} features - package.json
 */

function createViteConfig(overrideConfig, /** @type {IOptions} */ options) {
    const { mode, pkg, features = {} } = options;

    const dirname = process.cwd();

    /** @type {import('vite').UserConfig} */
    const originalConfig = {
        esbuild: {},
        build: {
            emptyOutDir: false,
            target: 'chrome70',
            outDir: 'lib',
            lib: {
                entry: {
                    index: path.resolve(dirname, 'src/index.ts'),
                },
                name: convertLibNameFromPackageName(pkg.name),
                fileName: (format, entryName) => {
                    if (entryName.startsWith('locale/')) {
                        return `${entryName}.js`;
                    } else {
                        return `${format}/${entryName}.js`;
                    }
                },
                formats: ['es'],
            },
        },
        plugins: [
            autoExternalizeDependency(),
            vitePluginExternal({
                nodeBuiltins: true, // exclude Node.js builtins from bundling
            }),
            dts({
                entryRoot: 'src',
                outDir: 'lib/types',
            }),
            buildPkg(),
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode),
            'process.env.BUILD_TIMESTAMP': JSON.stringify(Number.parseInt(Date.now() / 1000)),
        },
        test: {
            css: {
                modules: {
                    classNameStrategy: 'non-scoped',
                },
            },
            coverage: {
                reporter: ['html', 'json'],
                provider: 'custom',
                customProviderModule: require.resolve('@vitest/coverage-istanbul'),
                exclude: [
                    'coverage/**',
                    'dist/**',
                    '**/[.]**',
                    'packages/*/test?(s)/**',
                    '**/*.d.ts',
                    '**/virtual:*',
                    '**/__x00__*',
                    '**/\x00*',
                    'cypress/**',
                    'test?(s)/**',
                    'test?(-*).?(c|m)[jt]s?(x)',
                    '**/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)',
                    '**/__test?(s)__/**',
                    '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
                    '**/vitest.{workspace,projects}.[jt]s?(on)',
                    '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
                    'lib/**',
                    'src/locale/**',
                    '**/*.stories.tsx',
                    '**/__testing__/**',
                ],
            },
        },
    };

    const facadeEntry = path.resolve(dirname, 'src/facade/index.ts');
    if (fs.existsSync(facadeEntry)) {
        originalConfig.build.lib.entry.facade = facadeEntry;
    }

    const localeDir = path.resolve(process.cwd(), 'src/locale');
    if (fs.existsSync(localeDir)) {
        const locales = fs.readdirSync(localeDir);

        for (const file of locales) {
            if (fs.statSync(path.resolve(localeDir, file)).isDirectory()) {
                continue;
            }
            const localeValue = file.replace('.ts', '');
            originalConfig.build.lib.entry[`locale/${localeValue}`] = path.resolve(localeDir, file);
        }
    }

    if (process.env.APP_TYPE === 'staging') {
        originalConfig.build.sourcemap = true;

        originalConfig.esbuild.minifyIdentifiers = false;
        originalConfig.esbuild.keepNames = true;
    } else {
        if (pkg.name.startsWith('@univerjs/')) {
            originalConfig.esbuild.minifyIdentifiers = false;
            originalConfig.esbuild.keepNames = true;
        } else {
            originalConfig.plugins.push(obfuscator());
        }
    }

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

    if (features.umd !== 'ignore') {
        originalConfig.plugins.push(buildUMD());
    }

    return mergeConfig(
        defineConfig(originalConfig),
        overrideConfig
    );
};

module.exports = createViteConfig;
