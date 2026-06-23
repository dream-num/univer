import type { IEntryConfig } from '../tsdown/types.ts';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { PRESET_LOCALE_SOURCE_DIR } from './constants.ts';

function getPresetLocaleEntries(packageDir: string): IEntryConfig[] {
    const localeDir = path.join(packageDir, PRESET_LOCALE_SOURCE_DIR);

    if (!existsSync(localeDir)) {
        return [];
    }

    const entries: IEntryConfig[] = [];

    for (const fileName of readdirSync(localeDir).sort((left, right) => left.localeCompare(right))) {
        const fullPath = path.join(localeDir, fileName);

        if (statSync(fullPath).isDirectory() || !fileName.endsWith('.ts') || !fileName.includes('-')) {
            continue;
        }

        entries.push({
            key: `locales/${fileName.replace(/\.ts$/, '')}`,
            path: fullPath,
            type: 'locale',
        });
    }

    return entries;
}

export function getPresetModuleEntries(packageDir: string): IEntryConfig[] {
    const entries: IEntryConfig[] = [{
        key: 'index',
        path: path.join(packageDir, 'src/index.ts'),
        type: 'index',
    }];

    const workerEntry = path.join(packageDir, 'src/worker.ts');
    if (existsSync(workerEntry)) {
        entries.push({
            key: 'worker',
            path: workerEntry,
            type: 'worker',
        });
    }

    return [...entries, ...getPresetLocaleEntries(packageDir)];
}
