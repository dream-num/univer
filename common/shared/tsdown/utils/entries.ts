import type { IEntryConfig } from '../types.ts';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_ENTRY_FILE, FACADE_ENTRY_FILE, LOCALE_DIRECTORY } from '../constants.ts';

/**
 * Collects all canonical build entries for a package.
 */
export function getEntries(packageDir: string): IEntryConfig[] {
    const entries: IEntryConfig[] = [{
        key: 'index',
        path: path.join(packageDir, DEFAULT_ENTRY_FILE),
        type: 'index',
    }];

    const facadeEntry = path.join(packageDir, FACADE_ENTRY_FILE);
    if (existsSync(facadeEntry)) {
        entries.push({
            key: 'facade',
            path: facadeEntry,
            type: 'facade',
        });
    }

    const localeDir = path.join(packageDir, LOCALE_DIRECTORY);
    if (!existsSync(localeDir)) {
        return entries;
    }

    for (const fileName of readdirSync(localeDir).sort((left, right) => left.localeCompare(right))) {
        const fullPath = path.join(localeDir, fileName);

        if (statSync(fullPath).isDirectory() || !fileName.endsWith('.ts') || !fileName.includes('-')) {
            continue;
        }

        entries.push({
            key: `locale/${fileName.replace(/\.ts$/, '')}`,
            path: fullPath,
            type: 'locale',
        });
    }

    return entries;
}
