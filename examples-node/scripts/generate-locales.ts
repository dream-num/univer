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

/**
 * Generate locales files
 */
async function generateLocales() {
    const pkg = fs.readJSONSync(path.resolve(__dirname, '../package.json'));
    const output = path.resolve(__dirname, '../src/locales.ts');
    const locales = ['en-US', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW', 'vi-VN', 'fa-IR'];

    const header = `/**
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

import { Tools } from '@univerjs/core';
`;

    const deps = Object.keys(pkg.dependencies)
        .filter((dep) => dep.startsWith('@univerjs') && fs.existsSync(path.resolve(__dirname, `../node_modules/${dep}/src/locale`)));

    const importStatements = deps.reduce((acc, dep) => {
        const formattedDep = dep.replace(/(@univerjs\/|\-)/g, '');
        locales.forEach((locale) => {
            acc += `import ${formattedDep}${locale.replace(/-/g, '')} from '${dep}/locale/${locale}';\n`;
        });
        return acc;
    }, '');

    const exportStatements = locales.reduce((acc, locale) => {
        const formattedLocale = locale.replace(/-/g, '');
        const depStatements = deps.map((dep) => {
            return `    ${dep.replace(/(@univerjs\/|\-)/g, '')}${formattedLocale}`;
        }).join(',\n');

        acc += `export const ${formattedLocale} = Tools.deepMerge(\n    {},\n${depStatements}\n);\n`;
        return acc;
    }, '');

    const content = `${header}\n${importStatements}\n${exportStatements}`;

    fs.writeFileSync(output, content);
}

generateLocales();
