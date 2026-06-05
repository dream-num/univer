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

import type { IGeneratePresetLocalesOptions, IPresetPackageJson } from './types';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { PRESET_LOCALE_SOURCE_DIR, PRESET_LOCALES } from './constants';

function readPackageJson(packageDir: string): IPresetPackageJson {
    return JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as IPresetPackageJson;
}

function convertImportNameFromPackageName(name: string) {
    return name
        .replace(/^@univerjs(?:-[^/]+)?\//, 'univerjs')
        .replace(/[^a-zA-Z0-9_$]/g, '');
}

function compareStrings(left: string, right: string) {
    if (left < right) {
        return -1;
    }

    if (left > right) {
        return 1;
    }

    return 0;
}

function getDependencyNames(pkg: IPresetPackageJson) {
    return Object.keys(pkg.dependencies ?? {})
        .filter((name) => name.startsWith('@univerjs'))
        .sort(compareStrings);
}

function getDependencyLocaleSubpath(packageDir: string, dependencyName: string, locale: string) {
    const dependencyDir = path.join(packageDir, 'node_modules', dependencyName);

    if (
        existsSync(path.join(dependencyDir, 'lib/es/locale', `${locale}.js`))
        || existsSync(path.join(dependencyDir, 'src/locale', `${locale}.ts`))
    ) {
        return 'locale';
    }

    if (
        existsSync(path.join(dependencyDir, 'lib/es/locales', `${locale}.js`))
        || existsSync(path.join(dependencyDir, 'src/locales', `${locale}.ts`))
    ) {
        return 'locales';
    }

    return null;
}

export function generatePresetLocales(options: IGeneratePresetLocalesOptions): string[] {
    const { packageDir } = options;
    const pkg = readPackageJson(packageDir);
    const dependencyNames = getDependencyNames(pkg);
    const localeDir = path.join(packageDir, PRESET_LOCALE_SOURCE_DIR);

    rmSync(localeDir, { force: true, recursive: true });
    mkdirSync(localeDir, { recursive: true });

    const generated: string[] = [];

    for (const locale of PRESET_LOCALES) {
        const dependenciesWithLocale = dependencyNames
            .map((dependencyName) => ({
                dependencyName,
                localeSubpath: getDependencyLocaleSubpath(packageDir, dependencyName, locale),
            }))
            .filter((dependency): dependency is { dependencyName: string; localeSubpath: 'locale' | 'locales' } => dependency.localeSubpath !== null);

        if (dependenciesWithLocale.length === 0) {
            continue;
        }

        let content = 'import { mergeLocales } from \'@univerjs/core\';\n\n';

        for (const { dependencyName, localeSubpath } of dependenciesWithLocale) {
            content += `import ${convertImportNameFromPackageName(dependencyName)} from '${dependencyName}/${localeSubpath}/${locale}';\n`;
        }

        content += '\nexport default mergeLocales(\n';

        for (const { dependencyName } of dependenciesWithLocale) {
            content += `    ${convertImportNameFromPackageName(dependencyName)},\n`;
        }

        content += ');\n';

        writeFileSync(path.join(localeDir, `${locale}.ts`), content);
        generated.push(locale);
    }

    return generated;
}
