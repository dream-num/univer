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

import type { Server } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

const mimeTypes: Record<string, string> = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.svg': 'image/svg+xml',
};

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
    server = createServer(async (request, response) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        const decodedPathname = decodeURIComponent(pathname);
        const filePath = normalize(join(repoRoot, decodedPathname));

        if (relative(repoRoot, filePath).startsWith('..')) {
            response.writeHead(403);
            response.end();
            return;
        }

        try {
            const stats = await stat(filePath);
            if (!stats.isFile()) {
                response.writeHead(404);
                response.end();
                return;
            }

            response.writeHead(200, {
                'Content-Type': mimeTypes[extname(filePath)] ?? 'application/octet-stream',
            });
            createReadStream(filePath).pipe(response);
        } catch {
            response.writeHead(404);
            response.end();
        }
    });

    await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    if (typeof address !== 'object' || address === null) {
        throw new Error('Failed to start presets UMD smoke server');
    }
    baseURL = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
});

for (const pageName of ['presets-sheets', 'presets-docs']) {
    test(`ensure ${pageName} UMD preset boots up without errors`, async ({ page }) => {
        const errors: string[] = [];

        page.on('response', (response) => {
            const url = response.url();
            if (!response.ok() && /\.(?:css|js)(?:\?|$)/.test(url)) {
                errors.push(`${response.status()} ${url}`);
            }
        });
        page.on('pageerror', (error) => {
            errors.push(error.message);
        });
        page.on('console', (message) => {
            if (message.type() === 'error' && !message.text().startsWith('Failed to load resource:')) {
                errors.push(message.text());
            }
        });

        await page.goto(`${baseURL}/examples/umd/${pageName}.html`);
        await page.waitForLoadState('networkidle');

        expect(errors).toEqual([]);
        await expect
            .poll(() =>
                page.evaluate(() => ({
                    hasUniver: Boolean(window.univer),
                    hasUniverAPI: Boolean(window.univerAPI),
                }))
            )
            .toEqual({
                hasUniver: true,
                hasUniverAPI: true,
            });
    });
}
