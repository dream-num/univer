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

import type { IPackageJson } from '../types.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readPackageJson } from './package.ts';

const ROOT_MANIFEST_FIELDS = [
    'author',
    'bugs',
    'dependencies',
    'description',
    'engines',
    'funding',
    'homepage',
    'keywords',
    'license',
    'name',
    'optionalDependencies',
    'peerDependencies',
    'peerDependenciesMeta',
    'repository',
    'sideEffects',
    'type',
    'version',
] as const;

function pickRootManifest(pkg: IPackageJson) {
    const manifest: Record<string, unknown> = {};

    for (const field of ROOT_MANIFEST_FIELDS) {
        if (pkg[field] !== undefined) {
            manifest[field] = pkg[field];
        }
    }

    return manifest;
}

/**
 * Creates the publish-time package manifest inside the dist directory.
 */
export function emitPublishPackageJson(packageDir: string) {
    const pkg = readPackageJson(packageDir);
    const publishConfig = pkg.publishConfig as Record<string, unknown> | undefined;
    const publishDirectory = typeof publishConfig?.directory === 'string' ? publishConfig.directory : null;

    if (!publishConfig || !publishDirectory) {
        return;
    }

    const distDir = path.join(packageDir, publishDirectory);
    const manifest = {
        ...pickRootManifest(pkg),
    } as Record<string, unknown>;

    for (const [key, value] of Object.entries(publishConfig)) {
        if (key === 'access' || key === 'directory') {
            continue;
        }

        manifest[key] = value;
    }

    mkdirSync(distDir, { recursive: true });
    writeFileSync(path.join(distDir, 'package.json'), `${JSON.stringify(manifest, null, 4)}\n`);
}
