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

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const locales = [
    'en-US',
    'fr-FR',
    'ru-RU',
    'zh-CN',
    'zh-TW',
    'vi-VN',
    'fa-IR',
    'ko-KR',
    'es-ES',
    'ca-ES',
];

/**
 * Generate locales files
 */
async function generateLocales() {
    const packageNames: string[] = [];

    const pkgJsonFile = fs.readJsonSync(path.resolve(__dirname, '../package.json'));

    const packages = fs.readdirSync(path.resolve(__dirname, '../../packages'))
        .filter((dir) => fs.statSync(path.join(__dirname, '../../packages', dir)).isDirectory())
        .map((dir) => path.join(__dirname, '../../packages', dir));

    const experimentalPackages = fs.readdirSync(path.resolve(__dirname, '../../packages-experimental'))
        .filter((dir) => fs.statSync(path.join(__dirname, '../../packages-experimental', dir)).isDirectory())
        .map((dir) => path.join(__dirname, '../../packages-experimental', dir));

    const allPackages = [...packages, ...experimentalPackages];
    for (const pkg of allPackages) {
        const localePath = path.join(pkg, 'src/locale');
        if (fs.existsSync(localePath)) {
            const pkgJson = fs.readJSONSync(path.join(pkg, 'package.json'));
            packageNames.push(pkgJson.name);
            pkgJsonFile.dependencies[pkgJson.name] = 'workspace:*';
        }
    }

    fs.writeJsonSync(path.resolve(__dirname, '../package.json'), pkgJsonFile, { spaces: 4, EOL: '\n' });

    locales.forEach((locale) => {
        let statements = '/* eslint-disable */\n' + 'import { mergeLocales } from \'@univerjs/core\';\n\n';

        packageNames.forEach((pkg) => {
            const pkgName = pkg.replace(/@|univerjs|\/|-/g, '');
            statements += `import ${pkgName}Locale from '${pkg}/locale/${locale}';\n`;
        });

        statements += '\nexport default mergeLocales(\n';

        packageNames.forEach((pkg) => {
            const pkgName = pkg.replace(/@|univerjs|\/|-/g, '');
            statements += `    ${pkgName}Locale,\n`;
        });
        statements += ');\n';

        const outputPath = path.resolve(__dirname, `../src/locales/${locale}.ts`);
        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, statements);
    });
}

generateLocales();
