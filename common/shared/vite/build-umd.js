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
const vue = require('@vitejs/plugin-vue');
const fs = require('fs-extra');
const { build, mergeConfig } = require('vite');
const vitePluginExternal = require('vite-plugin-external');

const { autoExternalizeDependency } = require('./auto-externalize-dependency-plugin');
const { obfuscator } = require('./obfuscator');
const { convertLibNameFromPackageName } = require('./utils');

exports.buildUMD = function buildUMD() {
    return {
        name: 'build-umd',
        apply: 'build',
        enforce: 'post',
        async buildEnd() {
            const pkgPath = path.resolve(process.cwd(), 'package.json');

            if (!fs.existsSync(pkgPath)) {
                return;
            }

            const pkg = fs.readJSONSync(pkgPath);

            const basicConfig = {
                configFile: false,
                build: {
                    emptyOutDir: false,
                    target: 'chrome70',
                    lib: {
                        formats: ['umd'],
                    },
                },
                plugins: [
                    autoExternalizeDependency(),
                    vitePluginExternal({
                        nodeBuiltins: true,
                    }),
                    react(),
                    vue(),
                ],
                define: {
                    'process.env.NODE_ENV': JSON.stringify('production'),
                    'process.env.BUILD_TIMESTAMP': JSON.stringify(Number.parseInt(Date.now() / 1000)),
                },
                css: {
                    modules: {
                        localsConvention: 'camelCaseOnly',
                        generateScopedName: 'univer-[local]',
                    },
                },
            };

            if (!pkg.name.startsWith('@univerjs/')) {
                basicConfig.plugins.push(obfuscator());
            }

            await build(mergeConfig({
                build: {
                    outDir: 'lib',
                    lib: {
                        entry: path.resolve(process.cwd(), 'src/index.ts'),
                        name: convertLibNameFromPackageName(pkg.name),
                        fileName: () => 'umd/index.js',
                    },
                },
            }, basicConfig));

            const facadeEntry = path.resolve(process.cwd(), 'src/facade/index.ts');
            if (fs.existsSync(facadeEntry)) {
                await build(mergeConfig({
                    build: {
                        outDir: 'lib',
                        lib: {
                            entry: path.resolve(process.cwd(), 'src/facade/index.ts'),
                            name: convertLibNameFromPackageName(`${pkg.name}Facade`),
                            fileName: () => 'umd/facade.js',
                        },
                    },
                }, basicConfig));
            }

            const localeDir = path.resolve(process.cwd(), 'src/locale');
            if (fs.existsSync(localeDir)) {
                const locales = fs.readdirSync(localeDir);

                for (const file of locales) {
                    if (fs.statSync(path.resolve(localeDir, file)).isDirectory()) {
                        continue;
                    }

                    const localeValue = file.replace('.ts', '');

                    await build(mergeConfig({
                        build: {
                            outDir: 'lib/umd',
                            lib: {
                                entry: path.resolve(process.cwd(), path.resolve(localeDir, file)),
                                name: convertLibNameFromPackageName(`${pkg.name}-${localeValue}`),
                                fileName: () => `locale/${localeValue}.js`,
                            },
                        },
                    }, basicConfig));
                }
            }
        },
    };
};
