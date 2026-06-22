import type { IPackageJson } from '../types.ts';
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
