import type { TModuleFormat } from '../tsdown/configs/module.ts';
import type { IPackageJson } from '../tsdown/types.ts';
import type { IPresetBuildConfig, IPresetBuildOptions, IPresetPackageJson } from './types.ts';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { mergeConfig, build as tsdownBuild } from 'tsdown';
import { createModuleConfig } from '../tsdown/configs/module.ts';
import { createUmdConfig } from '../tsdown/configs/umd.ts';
import { BUILD_OUTPUT_DIRECTORIES, CLEANUP_DIRECTORIES } from '../tsdown/constants.ts';
import { createBaseConfig, createInputPlugins } from '../tsdown/utils/base-config.ts';
import { getPresetModuleEntries, getPresetUmdEntries } from './entries.ts';
import { generatePresetLocales } from './locale.ts';
import { buildPresetStyles } from './style.ts';
import { prependPresetUmd } from './umd.ts';

export { generatePresetLocales } from './locale.ts';
export type { IPresetBuildConfig, IPresetBuildOptions } from './types.ts';
export { prependPresetUmd } from './umd.ts';

const PRESET_BUILD_CONFIG_FILENAMES = [
    'univer-preset.config.mjs',
    'univer-preset.config.ts',
    'univer-preset.config.js',
] as const;

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

async function loadPresetBuildConfig(packageDir: string): Promise<IPresetBuildConfig> {
    for (const filename of PRESET_BUILD_CONFIG_FILENAMES) {
        const configPath = path.resolve(packageDir, filename);
        if (!existsSync(configPath)) {
            continue;
        }

        let presetBuildConfig = (await import(configPath)).default;
        if (typeof presetBuildConfig === 'function') {
            presetBuildConfig = await presetBuildConfig();
        }

        return presetBuildConfig ?? {};
    }

    return {};
}

function mergeArrayOption(configValues?: string[], optionValues?: string[]) {
    return [...new Set([
        ...(configValues ?? []),
        ...(optionValues ?? []),
    ])];
}

export function resolvePresetBuildOptions(presetBuildConfig: IPresetBuildConfig = {}, options: IPresetBuildOptions = {}): IPresetBuildOptions {
    const resolvedOptions: IPresetBuildOptions = {
        ...options,
    };
    const umdDeps = mergeArrayOption(presetBuildConfig?.umdDeps, options.umdDeps);
    const umdAdditionalFiles = mergeArrayOption(presetBuildConfig?.umdAdditionalFiles, options.umdAdditionalFiles);

    if (umdDeps.length > 0) {
        resolvedOptions.umdDeps = umdDeps;
    }
    if (umdAdditionalFiles.length > 0) {
        resolvedOptions.umdAdditionalFiles = umdAdditionalFiles;
    }

    return resolvedOptions;
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
    const presetBuildConfig = await loadPresetBuildConfig(packageDir);
    const resolvedOptions = resolvePresetBuildOptions(presetBuildConfig, options);

    if (resolvedOptions.cleanup) {
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
    const userConfig = await loadUserConfig(resolvedOptions, packageDir);
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
        baseConfig,
        packageDir,
        packageJson,
        plugins,
    });

    if (resolvedOptions.skipUMD) {
        return;
    }

    const umdConfigs = getPresetUmdEntries(packageDir).map((entry) => createUmdConfig({
        baseConfig,
        enableObfuscation: false,
        entry,
        outDir: BUILD_OUTPUT_DIRECTORIES.umd,
        packageDir,
        packageName: packageJson.name,
        plugins,
    }));

    for (const config of mergeUserConfig(umdConfigs, userConfig)) {
        await tsdownBuild(config);
    }

    prependPresetUmd({
        packageDir,
        umdAdditionalFiles: resolvedOptions.umdAdditionalFiles,
        umdDeps: resolvedOptions.umdDeps,
    });
}
