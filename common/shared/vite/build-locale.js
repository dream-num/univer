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

exports.buildLocale = function buildLocale({ entryRoot, outDir }) {
    return {
        name: 'build-locale',
        enforce: 'pre',
        generateBundle() {
            const srcDir = path.resolve(process.cwd(), entryRoot);

            if (!fs.existsSync(srcDir)) {
                return;
            }

            const outputDir = path.resolve(process.cwd(), outDir);

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
                    console.log(`[vite:build-locale] ${outputPath} generated`);
                });

            // generate peerDependencies
            const pkg = require(`${process.cwd()}/package.json`);
            pkg.exports = {
                ...pkg.exports,
                './locale/*': './src/locale/*.ts',
            };
            pkg.publishConfig = {
                ...pkg.publishConfig,
                exports: {
                    ...pkg.publishConfig.exports,
                    './locale/*': './lib/locale/*.json',
                },
            };
            fs.writeFileSync(
                `${process.cwd()}/package.json`,
                `${JSON.stringify(pkg, null, 4)}\n`
            );
        },
    };
};
