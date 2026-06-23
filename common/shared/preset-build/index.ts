import type { TModuleFormat } from '../tsdown/configs/module.ts';
import type { IPackageJson } from '../tsdown/types.ts';
import type { IPresetBuildOptions, IPresetPackageJson } from './types.ts';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { mergeConfig, build as tsdownBuild } from 'tsdown';
import { createModuleConfig } from '../tsdown/configs/module.ts';
import { BUILD_OUTPUT_DIRECTORIES, CLEANUP_DIRECTORIES } from '../tsdown/constants.ts';
import { createBaseConfig, createInputPlugins } from '../tsdown/utils/base-config.ts';
import { getPresetModuleEntries } from './entries.ts';
import { generatePresetLocales } from './locale.ts';
import { buildPresetStyles } from './style.ts';

export { generatePresetLocales } from './locale.ts';
export type { IPresetBuildOptions } from './types.ts';

function readPackageJson(packageDir: string): IPresetPackageJson {
    return JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')) as IPresetPackageJson;
}

function getExternalPackages(packageJson: IPresetPackageJson) {
    return [...new Set([
        ...Object.keys(packageJson.dependencies ?? {}),
        ...Object.keys(packageJson.peerDependencies ?? {}),
        'react',
        'react-dom',
        'rxjs',
    ])]
        .sort((left, right) => left.localeCompare(right))
        .flatMap((packageName) => [packageName, `${packageName}/*`]);
}

async function loadUserConfig(options: IPresetBuildOptions, packageDir: string) {
    if (!options.tsdownConfigPath) {
        return null;
    }

    const configPath = path.resolve(packageDir, options.tsdownConfigPath);
    let userConfig = (await import(configPath)).default;

    if (typeof userConfig === 'function') {
        userConfig = await userConfig();
    }

    return userConfig;
}

function mergeUserConfig(configs: any[], userConfig: any) {
    if (!userConfig) {
        return configs;
    }

    return configs.map((config) => mergeConfig(config, userConfig));
}

export function createPresetModuleEntryGroups(entries: ReturnType<typeof getPresetModuleEntries>) {
    const primaryEntries = entries.filter((entry) => entry.type === 'index' || entry.type === 'locale');
    const isolatedEntries = entries.filter((entry) => entry.type !== 'index' && entry.type !== 'locale');

    return [
        ...(primaryEntries.length > 0 ? [primaryEntries] : []),
        ...isolatedEntries.map((entry) => [entry]),
    ];
}

export function removePresetOutputs(packageDir = process.cwd()) {
    for (const dir of CLEANUP_DIRECTORIES) {
        const targetDir = path.resolve(packageDir, dir);

        if (existsSync(targetDir)) {
            rmSync(targetDir, { force: true, recursive: true });
        }
    }
}

export function preparePresetPackage(packageDir = process.cwd()) {
    const packageJson = readPackageJson(packageDir);

    if (packageJson.name === '@univerjs/presets') {
        return [];
    }

    return generatePresetLocales({ packageDir });
}

export async function buildPresetPackage(options: IPresetBuildOptions = {}) {
    const packageDir = process.cwd();
    const packageJson = readPackageJson(packageDir);

    if (options.cleanup) {
        removePresetOutputs(packageDir);
    }

    const externalPackages = getExternalPackages(packageJson);
    const baseConfig = createBaseConfig({
        entries: [],
        externalPackages,
        facadeExternalPackages: externalPackages,
        packageDir,
        packageJson: packageJson as IPackageJson,
        plugins: [],
    });
    const plugins = createInputPlugins(packageDir);
    const userConfig = await loadUserConfig(options, packageDir);
    const moduleFormats: TModuleFormat[] = ['esm', 'cjs'];
    const moduleConfigs = createPresetModuleEntryGroups(getPresetModuleEntries(packageDir)).flatMap((entries) => {
        return moduleFormats.map((format) => createModuleConfig({
            baseConfig,
            enableObfuscation: false,
            entries,
            externalPackages,
            facadeExternalPackages: externalPackages,
            format,
            outDir: BUILD_OUTPUT_DIRECTORIES[format],
            packageDir,
            plugins,
        }));
    });

    for (const config of mergeUserConfig(moduleConfigs, userConfig)) {
        await tsdownBuild(config);
    }

    await buildPresetStyles({
        packageDir,
        packageJson,
    });
}
