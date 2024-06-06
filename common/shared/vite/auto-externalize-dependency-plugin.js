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
const { writeFileSync } = require('node:fs');
const { convertLibNameFromPackageName } = require('./utils');

exports.autoExternalizeDependency = function autoExternalizeDependency() {
    const externals = new Set();
    const globals = {};
    let hasCss = false;

    const externalMap = {
        '@wendellhu/redi': {
            global: '@wendellhu/redi',
            name: '@wendellhu/redi',
            version: '0.15.2',
        },
        '@wendellhu/redi/react-bindings': {
            global: '@wendellhu/redi/react-bindings',
            name: '@wendellhu/redi',
            version: '@wendellhu/redi',
        },
        clsx: {
            global: 'clsx',
            name: 'clsx',
            version: '>=2.0.0',
        },
        dayjs: {
            global: 'dayjs',
            name: 'dayjs',
            version: '>=1.11.0',
        },
        lodash: {
            global: 'lodash',
            name: 'lodash',
            version: '>=4.0.0',
        },
        'lodash/debounce': {
            global: 'lodash.debounce',
            name: 'lodash',
            version: 'lodash',
        },
        'monaco-editor': {
            global: 'monaco',
            name: 'monaco-editor',
            version: '>=0.44.0',
        },
        react: {
            global: 'React',
            name: 'react',
            version: '^16.9.0 || ^17.0.0 || ^18.0.0',
        },
        'react-dom': {
            global: 'ReactDOM',
            name: 'react-dom',
            version: '^16.9.0 || ^17.0.0 || ^18.0.0',
        },
        rxjs: {
            global: 'rxjs',
            name: 'rxjs',
            version: '>=7.0.0',
        },
        'rxjs/operators': {
            global: 'rxjs.operators',
            name: 'rxjs',
            version: 'rxjs',
        },
        vue: {
            global: 'Vue',
            name: 'vue',
            version: '>=3.0.0',
            optional: true,
        },
    };

    return {
        name: 'auto-detected-external',
        enforce: 'pre',
        apply: 'build',

        resolveId(source) {
            if (source.endsWith('.less') || source.endsWith('.css')) {
                hasCss = true;
            }

            if (source in externalMap) {
                externals.add(source);
                globals[source] = externalMap[source].global;

                return { id: source, external: true };
            } else if (source.startsWith('@univerjs')) {
                if (source === '@univerjs/icons') {
                    return null;
                }
                if (source === '@univerjs/protocol') {
                    return null;
                }

                externals.add(source);

                globals[source] = convertLibNameFromPackageName(source);

                return { id: source, external: true };
            }

            return null;
        },

        outputOptions(opts) {
            opts.globals = globals;

            if (hasCss) {
                opts.assetFileNames = 'index.css';
            }

            return opts;
        },

        generateBundle() {
            // generate peerDependencies
            const pkg = require(`${process.cwd()}/package.json`);
            const peerDependencies = {};
            let optionalDependencies;

            Array.from(externals)
                .sort()
                .filter((ext) => {
                    return !ext.endsWith('.less');
                })
                .forEach((ext) => {
                    const { version, name, optional } = externalMap[ext] ?? {};

                    if (version) {
                        if (version !== name) {
                            if (optional) {
                                if (!optionalDependencies) {
                                    optionalDependencies = {};
                                }
                                optionalDependencies[ext] = version;
                            } else {
                                peerDependencies[ext] = version;
                            }
                        } else {
                            if (!peerDependencies[version]) {
                                peerDependencies[name] = externalMap[version].version;
                            }
                        }
                    } else {
                        peerDependencies[ext] = 'workspace:*';
                    }
                });

            pkg.peerDependencies = peerDependencies;
            if (optionalDependencies) {
                pkg.optionalDependencies = optionalDependencies;
            }

            writeFileSync(
                `${process.cwd()}/package.json`,
                `${JSON.stringify(pkg, null, 4)}\n`
            );
        },
    };
};
