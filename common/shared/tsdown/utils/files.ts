import { existsSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { SOURCE_DIRECTORY } from '../constants.ts';

/**
 * Walks the package source tree and returns whether a given file suffix exists.
 */
export function hasSourceFiles(packageDir: string, extension: string) {
    const sourceDir = path.join(packageDir, SOURCE_DIRECTORY);

    if (!existsSync(sourceDir)) {
        return false;
    }

    const stack = [sourceDir];

    while (stack.length > 0) {
        const currentDir = stack.pop()!;
        const entries = readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }

            if (entry.name.endsWith(extension)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Removes emitted css artifacts before a new build so alias copies stay deterministic.
 */
export function removeCssArtifacts(dir: string) {
    if (!existsSync(dir)) {
        return;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            removeCssArtifacts(fullPath);
            continue;
        }

        if (entry.name.endsWith('.css')) {
            unlinkSync(fullPath);
        }
    }
}
