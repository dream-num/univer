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

/* eslint-disable node/prefer-global/process */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(EXAMPLES_ROOT, 'src');
const PUBLIC_DIR = path.resolve(EXAMPLES_ROOT, 'public');
const GENERATED_DEMOS_FILE = path.resolve(SRC_DIR, 'demos.ts');

const DEMO_MAIN_ENTRY_NAMES = ['main.ts', 'main.tsx'] as const;
const DEMO_EXTRA_ENTRY_NAMES = ['worker.ts', 'worker.tsx'] as const;
const IGNORED_PUBLIC_ENTRIES = new Set(['favicon.svg', 'index.html']);

export const IS_CI = !!process.env.CI;

const ESBUILD_SCRIPT = IS_CI
    ? ''
    : `
        <script>
            new EventSource('/esbuild').addEventListener('change', () => {
                console.info('reload--');
                location.reload();
            });
        </script>`;

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
                font-family: Arial;
            }
        </style>${ESBUILD_SCRIPT}
    </head>

    <body style="overflow: hidden">
        <div id="app" style="height: 100%"></div>

        <script type="module" src="./main.js"></script>
    </body>
</html>
`;

export interface DemoDefinition {
    dir: string;
    entryPoints: string[];
    href: `./${string}/`;
    title: string;
}

function formatDemoTitle(dir: string) {
    const wordOverrides: Record<string, string> = {
        docs: 'Docs',
        s: 'S',
        ui: 'UI',
        webcomponent: 'Web Component',
    };

    return dir
        .split('-')
        .filter(Boolean)
        .map((segment) => wordOverrides[segment] ?? `${segment[0].toUpperCase()}${segment.slice(1)}`)
        .join(' ');
}

function getDemoEntryFiles(exampleDir: string) {
    const entries: string[] = [];

    for (const entryName of DEMO_MAIN_ENTRY_NAMES) {
        if (fs.existsSync(path.resolve(exampleDir, entryName))) {
            entries.push(entryName);
            break;
        }
    }

    if (!entries.length) {
        return entries;
    }

    for (const entryName of DEMO_EXTRA_ENTRY_NAMES) {
        if (fs.existsSync(path.resolve(exampleDir, entryName))) {
            entries.push(entryName);
        }
    }

    return entries;
}

export function discoverDemos() {
    return fs.readdirSync(SRC_DIR)
        .sort((left, right) => left.localeCompare(right))
        .map((dir): DemoDefinition | null => {
            const exampleDir = path.resolve(SRC_DIR, dir);

            if (!fs.statSync(exampleDir).isDirectory()) {
                return null;
            }

            const entryFiles = getDemoEntryFiles(exampleDir);

            if (!entryFiles.length) {
                return null;
            }

            return {
                dir,
                title: formatDemoTitle(dir),
                href: `./${dir}/`,
                entryPoints: entryFiles.map((entryFile) => `./src/${dir}/${entryFile}`),
            };
        })
        .filter((demo): demo is DemoDefinition => demo !== null);
}

function syncDemoHtml(demos: DemoDefinition[]) {
    fs.ensureDirSync(PUBLIC_DIR);

    const activeDemoDirs = new Set(demos.map((demo) => demo.dir));

    fs.readdirSync(PUBLIC_DIR).forEach((entry) => {
        if (IGNORED_PUBLIC_ENTRIES.has(entry)) {
            return;
        }

        const entryPath = path.resolve(PUBLIC_DIR, entry);

        if (!fs.statSync(entryPath).isDirectory()) {
            return;
        }

        if (activeDemoDirs.has(entry)) {
            return;
        }

        if (fs.existsSync(path.resolve(entryPath, 'index.html'))) {
            fs.removeSync(entryPath);
        }
    });

    demos.forEach((demo) => {
        const targetDir = path.resolve(PUBLIC_DIR, demo.dir);
        fs.ensureDirSync(targetDir);
        fs.writeFileSync(path.resolve(targetDir, 'index.html'), indexTemplate);
    });
}

function syncDemosModule(demos: DemoDefinition[]) {
    const demoImports = demos.map(({ dir, href, title }) => ({ dir, href, title }));

    const content = `${[
        '/**',
        ' * This file is auto-generated by `./scripts/sync-demos.ts`.',
        ' */',
        `export const demos = ${JSON.stringify(demoImports, null, 4)} as const;`,
        '',
        'export type Demo = (typeof demos)[number];',
        '',
    ].join('\n')}`;

    fs.writeFileSync(GENERATED_DEMOS_FILE, content);
}

export function getDemoEntryPoints() {
    return ['./src/main.tsx', ...discoverDemos().flatMap((demo) => demo.entryPoints)];
}

export function syncDemoArtifacts() {
    const demos = discoverDemos();
    syncDemoHtml(demos);
    syncDemosModule(demos);

    return {
        demos,
        entryPoints: ['./src/main.tsx', ...demos.flatMap((demo) => demo.entryPoints)],
    };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    syncDemoArtifacts();
}
