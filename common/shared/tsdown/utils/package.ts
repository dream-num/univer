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

import type { IPackageJson } from '../types';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function getProductionDependencyNames(packageJson: IPackageJson) {
    const names = new Set([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
    ]);

    const devDeps = packageJson.devDependencies ?? {};
    if ('react' in devDeps) {
        names.add('react');
    }

    return [...names].sort((left, right) => left.localeCompare(right));
}

function normalizeIgnoredPackages(ignorePackages: string[] = []) {
    return [...new Set(ignorePackages)].sort((left, right) => left.localeCompare(right));
}

/**
 * Reads the package manifest used to derive dependency externalization rules.
 */
export function readPackageJson(packageDir: string): IPackageJson {
    return JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf-8')) as IPackageJson;
}

/**
 * Produces the external package allowlist including subpath imports.
 */
export function createExternalPackages(packageJson: IPackageJson, ignorePackages: string[] = []) {
    const ignoredPackages = normalizeIgnoredPackages(ignorePackages);

    return [...new Set([
        ...getProductionDependencyNames(packageJson),
        ...ignoredPackages,
    ])]
        .sort((left, right) => left.localeCompare(right))
        .flatMap((packageName) => [packageName, `${packageName}/*`]);
}
