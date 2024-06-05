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
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

exports.buildPkg = function buildPkg() {
    return {
        name: 'build-pkg',
        enforce: 'pre',
        generateBundle() {
            const srcDir = path.resolve(process.cwd(), 'src/locale');
            const outputDir = path.resolve(process.cwd(), 'lib/locale');
            const pkgPath = path.resolve(process.cwd(), 'package.json');

            if (!fs.existsSync(pkgPath)) {
                return;
            }

            const pkg = require(pkgPath);

            pkg.author = 'DreamNum <developer@univer.ai>';
            // pkg.license = 'Apache-2.0';
            pkg.funding = {
                type: 'opencollective',
                url: 'https://opencollective.com/univer',
            };
            pkg.homepage = 'https://univer.ai';
            pkg.repository = {
                type: 'git',
                url: 'https://github.com/dream-num/univer',
            };
            pkg.bugs = {
                url: 'https://github.com/dream-num/univer/issues',
            };
            pkg.keywords = pkg.keywords || [
                'univer',
            ];

            pkg.exports = {
                '.': './src/index.ts',
                './*': './src/*',
            };
            pkg.main = './lib/cjs/index.js';
            pkg.module = './lib/es/index.js';
            pkg.types = './lib/types/index.d.ts';
            pkg.publishConfig = {
                access: 'public',
                main: './lib/cjs/index.js',
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
                    './lib/*': './lib/*',
                },
            };

            pkg.directories = {
                lib: 'lib',
            };
            pkg.files = [
                'lib',
            ];

            if (fs.existsSync(srcDir)) {
                fs.readdirSync(srcDir)
                    .filter((file) => file.includes('-') && fs.statSync(path.resolve(srcDir, file)).isFile())
                    .forEach((file) => {
                        const fullPath = path.join(srcDir, file);

                        const syncResult = esbuild.buildSync({
                            entryPoints: [fullPath],
                            bundle: true,
                            platform: 'node',
                            format: 'cjs',
                            write: false,
                        });

                        // eslint-disable-next-line no-new-func
                        const module = new Function('module', `${syncResult.outputFiles[0].text};return module;`)({});
                        const result = module.exports.default;
                        const data = JSON.stringify(result, null, 2);

                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true });
                        }

                        const outputPath = path.resolve(outputDir, file.replace('.ts', '.json'));

                        fs.writeFileSync(outputPath, data);

                        // eslint-disable-next-line no-console
                        console.log(`[vite:build-pkg] ${outputPath} generated`);

                        // exports
                        pkg.exports['./locale/*'] = './src/locale/*.ts';
                        pkg.publishConfig.exports['./locale/*'] = './lib/locale/*.json';
                    });
            }

            pkg.univerSpace = pkg.publishConfig.exports;

            fs.writeFileSync(
                `${process.cwd()}/package.json`,
                `${JSON.stringify(pkg, null, 4)}\n`
            );
        },
    };
};
