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

const { defineConfig, mergeConfig } = require('vitest/config');

function createConfig(options) {
    return defineConfig(mergeConfig({
        test: {
            css: {
                modules: {
                    classNameStrategy: 'non-scoped',
                },
            },
            environment: 'happy-dom',
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
    }, options));
}

module.exports = createConfig;
