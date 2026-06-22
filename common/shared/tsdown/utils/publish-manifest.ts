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
