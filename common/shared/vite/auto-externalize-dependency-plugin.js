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

const { writeFileSync } = require('node:fs');
const process = require('node:process');
const { convertLibNameFromPackageName } = require('./utils');

exports.autoExternalizeDependency = function autoExternalizeDependency() {
    const externals = new Set();
    const peers = new Set();
    const globals = {};
    let hasCss = false;

    const peerDepsMap = {
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

            if (source in peerDepsMap) {
                peers.add(source);
                globals[source] = peerDepsMap[source].global;

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

            Array.from(peers).sort().forEach((key) => {
                const { version, name, optional } = peerDepsMap[key] ?? {};

                if (version) {
                    if (version !== name) {
                        if (optional) {
                            if (!optionalDependencies) {
                                optionalDependencies = {};
                            }
                            optionalDependencies[key] = version;
                        } else {
                            peerDependencies[key] = version;
                        }
                    } else {
                        if (!peerDependencies[version]) {
                            peerDependencies[name] = peerDepsMap[version].version;
                        }
                    }
                } else {
                    peerDependencies[key] = 'workspace:*';
                }
            });
            // Array.from(peers)
            //     .sort()
            //     .forEach((ext) => {
            //     console.log(peers.);
            //     const { version, name, optional } = peers[ext] ?? {};

            //         if (version) {
            //             if (version !== name) {
            //                 if (optional) {
            //                     if (!optionalDependencies) {
            //                         optionalDependencies = {};
            //                     }
            //                     optionalDependencies[ext] = version;
            //                 } else {
            //                     peerDependencies[ext] = version;
            //                 }
            //             } else {
            //                 if (!peerDependencies[version]) {
            //                     peerDependencies[name] = peers[version].version;
            //                 }
            //             }
            //         } else {
            //             peerDependencies[ext] = 'workspace:*';
            //         }
            //     });

            if (Object.keys(peerDependencies).length) {
                pkg.peerDependencies = peerDependencies;
            }
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
