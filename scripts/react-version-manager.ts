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

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function main() {
    const version = process.argv[2].replace('--react=', '');
    const __pkg = path.resolve(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(__pkg, 'utf8'));

    pkg.resolutions = {
        '@types/react': version,
        '@types/react-dom': version,
        react: version,
        'react-dom': version,
    };

    fs.writeFileSync(__pkg, `${JSON.stringify(pkg, null, 4)}\n`);

    execSync('pnpm i --no-lockfile');
}

main();
