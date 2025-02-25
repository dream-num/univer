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

import type { Config } from 'tailwindcss';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import preset from '@univerjs-infra/shared/tailwind';
import fs from 'fs-extra';
import animate from 'tailwindcss-animate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagesDir = fs.readdirSync(path.resolve(__dirname, '../packages')).map((dir) => path.resolve(__dirname, `../packages/${dir}`));
const packagesExperimentalDir = fs.readdirSync(path.resolve(__dirname, '../packages-experimental')).map((dir) => path.resolve(__dirname, `../packages-experimental/${dir}`));

const tailwindProjects = packagesDir.concat(packagesExperimentalDir).reduce((acc, dir) => {
    const tailwindConfig = path.resolve(dir, 'tailwind.config.ts');
    if (fs.existsSync(tailwindConfig)) {
        acc.push(`${dir}/src/**/*.{js,ts,jsx,tsx}`);
    }
    return acc;
}, [] as string[]);

const config: Config = {
    presets: [preset],
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        ...tailwindProjects,
    ],
    plugins: [
        animate,
    ],
};

export default config;
