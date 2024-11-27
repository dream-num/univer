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

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const indexTemplate = `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Univer</title>

        <link rel="icon" type="image/x-icon" href="../favicon.svg" />
        <link rel="stylesheet" href="./main.css" />
        <style>
            html,
            body {
                height: 100%;
                margin: 0;
            }
        </style>

        <script>
            new EventSource('/esbuild').addEventListener('change', () => {
                console.info('reload--');
                location.reload();
            });
        </script>
    </head>

    <body style="overflow: hidden">
        <div id="app" style="height: 100%"></div>

        <script type="module" src="./main.js"></script>
    </body>
</html>
`;

/**
 * Generate html files
 */
async function generateHtml() {
    const __src = path.resolve(__dirname, '../src');
    fs.readdirSync(__src).forEach((dir) => {
        const __example = path.resolve(__src, dir);
        if (fs.statSync(__example).isDirectory()) {
            const __target = path.resolve(__dirname, `../public/${dir}`);
            fs.ensureDirSync(__target);
            fs.writeFileSync(path.resolve(__target, 'index.html'), indexTemplate);
        }
    });
}

generateHtml();
