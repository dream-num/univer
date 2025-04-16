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

import type { Plugin } from 'vite';
import path from 'node:path';
import process from 'node:process';
import fs from 'fs-extra';
import sortKeys from 'sort-keys';

import localPkg from '../package.json';
import { peerDepsMap } from './data';

function filterPackageName(packageName: string): string {
    if (packageName.startsWith('@univerjs/')) {
        return packageName.split('/').slice(0, 2).join('/');
    } else if (packageName.startsWith('@univerjs-pro/')) {
        return packageName.split('/').slice(0, 2).join('/');
    } else {
        return packageName;
    }
}

/* eslint-disable-next-line max-lines-per-function */
export function cleanupPkgPlugin(): Plugin {
    const __pkg = path.resolve(process.cwd(), 'package.json');
    const pkg = fs.readJSONSync(__pkg);
    const isPro = pkg.name.startsWith('@univerjs-pro');

    const peerDeps = {};
    const deps = {};
    const optionalDeps = {};

    return {
        name: 'cleanup-pkg',
        enforce: 'pre',
        apply: 'build',

        resolveId(source) {
            if (source in peerDepsMap) {
                const value = peerDepsMap[source];
                if (!(value.version in peerDepsMap)) {
                    if ('optional' in value) {
                        optionalDeps[value.name] = value.version;
                    } else {
                        peerDeps[value.name] = value.version;
                    }
                }
            } else if (source.startsWith('@univerjs')) {
                const name = filterPackageName(source);
                if (['@univerjs/icons', '@univerjs/protocol'].includes(name)) {
                    if (name === '@univerjs/protocol' && isPro) {
                        deps[name] = 'workspace:*';
                    } else {
                        deps[name] = localPkg.devDependencies[name];
                    }
                } else if (name !== pkg.name) {
                    const name = filterPackageName(source);
                    deps[name] = 'workspace:*';
                }
            }

            return null;
        },

        generateBundle() {
            const hasLocales = fs.existsSync(path.resolve(process.cwd(), 'src/locale'));
            const hasFacade = fs.existsSync(path.resolve(process.cwd(), 'src/facade/index.ts'));
            pkg.publishConfig = {
                access: 'public',
                main: './lib/es/index.js',
                module: './lib/es/index.js',
                exports: {
                    '.': {
                        import: './lib/es/index.js',
                        require: './lib/cjs/index.js',
                        types: './lib/types/index.d.ts',
                    },
                    './*': {
                        import: './lib/es/*',
                        require: './lib/cjs/*',
                        types: './lib/types/index.d.ts',
                    },
                },
            };
            if (hasLocales) {
                pkg.exports['./locale/*'] = './src/locale/*.ts';
                pkg.publishConfig.exports['./locale/*'] = {
                    import: './lib/es/locale/*.js',
                    require: './lib/cjs/locale/*.js',
                    types: './lib/types/locale/*.d.ts',
                };
            }
            if (hasFacade) {
                pkg.exports['./facade'] = './src/facade/index.ts';
                pkg.publishConfig.exports['./facade'] = {
                    import: './lib/es/facade.js',
                    require: './lib/cjs/facade.js',
                    types: './lib/types/facade/index.d.ts',
                };
                pkg.publishConfig.exports['./lib/facade'] = pkg.publishConfig.exports['./facade'];
            }
            pkg.publishConfig.exports['./lib/*'] = './lib/*';

            if (Object.keys(optionalDeps).length > 0) {
                pkg.optionalDependencies = sortKeys(optionalDeps);
            }

            if (Object.keys(peerDeps).length > 0) {
                pkg.peerDependencies = sortKeys(peerDeps);
            }

            // Remove the existing @univerjs dependencies
            if (pkg?.dependencies) {
                for (const key of Object.keys(pkg.dependencies)) {
                    if (key.startsWith('@univerjs')) {
                        delete pkg.dependencies[key];
                    }
                }
                if (Object.keys(deps).length > 0) {
                    pkg.dependencies = sortKeys({ ...pkg.dependencies, ...deps });
                }
            }

            if (pkg?.devDependencies) {
                for (const key of Object.keys(pkg.devDependencies)) {
                    if (['@univerjs/protocol', '@univerjs/icons-svg'].includes(key)) {
                        if (key === '@univerjs/protocol' && isPro) {
                            pkg.devDependencies[key] = 'workspace:*';
                        } else {
                            pkg.devDependencies[key] = localPkg.devDependencies[key];
                        }
                    }
                }
            }

            fs.writeJSONSync(__pkg, pkg, { spaces: 4, EOL: '\n' });
        },
    };
};
