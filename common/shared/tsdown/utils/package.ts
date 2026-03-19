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

function isUniverPackage(packageName: string) {
    return packageName.startsWith('@univerjs/') || packageName.startsWith('@univerjs-pro/');
}

function getProductionDependencyNames(packageJson: IPackageJson) {
    return [...new Set([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
    ])].sort((left, right) => left.localeCompare(right));
}

/**
 * Reads the package manifest used to derive dependency externalization rules.
 */
export function readPackageJson(packageDir: string): IPackageJson {
    return JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf-8')) as IPackageJson;
}

/**
 * Produces the external package allowlist.
 */
export function createExternalPackages(packageJson: IPackageJson) {
    return getProductionDependencyNames(packageJson)
        .filter((packageName) => isUniverPackage(packageName));
}

/**
 * Produces the package allowlist that should be bundled into ESM/CJS outputs.
 */
export function createBundledPackages(packageJson: IPackageJson) {
    return getProductionDependencyNames(packageJson)
        .filter((packageName) => !isUniverPackage(packageName));
}
