import type { IGeneratePresetLocalesOptions, IPresetPackageJson } from './types.ts';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverUniverUiLocales } from '../locale/index.ts';
import { PRESET_LOCALE_SOURCE_DIR } from './constants.ts';

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

    for (const locale of discoverUniverUiLocales({ rootDir: packageDir })) {
        const dependenciesWithLocale = dependencyNames
            .map((dependencyName) => ({
                dependencyName,
                localeSubpath: getDependencyLocaleSubpath(packageDir, dependencyName, locale),
            }))
            .filter((dependency): dependency is { dependencyName: string; localeSubpath: 'locale' | 'locales' } => dependency.localeSubpath !== null);

        if (dependenciesWithLocale.length === 0) {
            continue;
        }

        let content = '';

        for (const { dependencyName, localeSubpath } of dependenciesWithLocale) {
            content += `import ${convertImportNameFromPackageName(dependencyName)} from '${dependencyName}/${localeSubpath}/${locale}';\n`;
        }

        content += '\nexport default Object.assign(\n';
        content += '    {},\n';

        for (const { dependencyName } of dependenciesWithLocale) {
            content += `    ${convertImportNameFromPackageName(dependencyName)},\n`;
        }

        content += ');\n';

        writeFileSync(path.join(localeDir, `${locale}.ts`), content);
        generated.push(locale);
    }

    return generated;
}
