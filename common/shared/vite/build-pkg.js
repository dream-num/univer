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
const fs = require('fs-extra');

exports.buildPkg = function buildPkg() {
    return {
        name: 'build-pkg',
        apply: 'build',
        enforce: 'post',
        buildEnd() {
            const pkgPath = path.resolve(process.cwd(), 'package.json');

            if (!fs.existsSync(pkgPath)) {
                return;
            }

            const pkg = fs.readJSONSync(pkgPath);

            // author
            pkg.author = 'DreamNum <developer@univer.ai>';

            // license
            if (pkg.name.startsWith('@univer/')) {
                pkg.license = 'Apache-2.0';
            }

            // funding
            pkg.funding = {
                type: 'opencollective',
                url: 'https://opencollective.com/univer',
            };

            // homepage
            pkg.homepage = 'https://univer.ai';

            // repository
            pkg.repository = {
                type: 'git',
                url: 'https://github.com/dream-num/univer',
            };

            // bugs
            pkg.bugs = {
                url: 'https://github.com/dream-num/univer/issues',
            };

            // keywords
            pkg.keywords = pkg.keywords || [
                'univer',
            ];

            // exports
            pkg.exports = Object.assign({
                '.': './src/index.ts',
                './*': './src/*',
            }, pkg.exports);

            const facadeEntry = path.resolve(process.cwd(), 'src/facade/index.ts');
            if (fs.existsSync(facadeEntry)) {
                pkg.publishConfig.exports['./facade'] = {
                    import: './lib/es/facade.js',
                    types: './lib/types/facade/index.d.ts',
                };
            }

            // main
            pkg.main = './src/index.ts';

            // publishConfig
            pkg.publishConfig = {
                access: 'public',
                main: './lib/es/index.js',
                module: './lib/es/index.js',
                exports: {
                    '.': {
                        import: './lib/es/index.js',
                        types: './lib/types/index.d.ts',
                    },
                    './*': {
                        import: './lib/es/*',
                        types: './lib/types/index.d.ts',
                    },
                    './lib/*': './lib/*',
                },
            };

            // locale
            const localeDir = path.resolve(process.cwd(), 'src/locale');
            if (fs.existsSync(localeDir)) {
                pkg.exports['./locale/*'] = './src/locale/*.ts';
                pkg.publishConfig.exports['./locale/*'] = {
                    import: './lib/locale/*.js',
                    types: './lib/types/locale/*.d.ts',
                };
            }

            // directories
            pkg.directories = {
                lib: 'lib',
            };
            // files
            pkg.files = [
                'lib',
            ];

            pkg.univerSpace = pkg.publishConfig.exports;

            fs.writeJSONSync(
                `${process.cwd()}/package.json`,
                pkg,
                { spaces: 4, EOL: '\n' }
            );
        },
    };
};
