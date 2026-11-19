import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { mergeConfig, build as tsdownBuild } from 'tsdown';
import type { TModuleFormat } from './configs/module.ts';
import type { IBuildContext, IBuildOptions } from './types.ts';
import { createModuleConfig } from './configs/module.ts';
import { createUmdConfig } from './configs/umd.ts';
import { BUILD_OUTPUT_DIRECTORIES, BUILD_OUTPUT_ROOT, CLEANUP_DIRECTORIES } from './constants.ts';
import { createBaseConfig, createInputOptions, createInputPlugins } from './utils/base-config.ts';
import { cleanupPackageJson } from './utils/cleanup-pkg.ts';
import { getEntries } from './utils/entries.ts';
import { removeCssArtifacts } from './utils/files.ts';
import { createExternalPackages, readPackageJson } from './utils/package.ts';
import { emitPublishPackageJson } from './utils/publish-manifest.ts';

export { DEFAULT_BROWSER_TARGET } from './constants.ts';

/**
 * Builds the shared context consumed by all output format factories.
 */
function createBuildContext(packageDir: string, options: IBuildOptions): IBuildContext {
    const packageJson = readPackageJson(packageDir);
    const externalPackages = createExternalPackages(packageJson, options.ignorePackages);

    return {
        entries: getEntries(packageDir),
        externalPackages,
        facadeExternalPackages: [...externalPackages, packageJson.name, `${packageJson.name}/*`],
        inputOptions: createInputOptions(options),
        packageDir,
        packageJson,
        plugins: createInputPlugins(packageDir),
    };
}

/**
 * Expands the package context into all required tsdown configs.
 */
function createModuleEntryGroups(entries: IBuildContext['entries']) {
    // Share class definitions across public entries to preserve DI token identity.
    const primaryEntries = entries.filter((entry) => entry.type !== 'facade');
    const isolatedEntries = entries.filter((entry) => entry.type === 'facade');

    return [
        ...(primaryEntries.length > 0 ? [primaryEntries] : []),
        ...isolatedEntries.map((entry) => [entry]),
    ];
}

export function createConfigs(context: IBuildContext, options: IBuildOptions) {
    const baseConfig = createBaseConfig(context);
    const moduleFormats: TModuleFormat[] = ['esm', 'cjs'];
    const minify = context.packageJson.name.startsWith('@univerjs-pro/');

    const moduleConfigs = createModuleEntryGroups(context.entries).flatMap((entries) => {
        return moduleFormats.map((format) => createModuleConfig({
            baseConfig,
            entries,
            externalPackages: context.externalPackages,
            facadeExternalPackages: context.facadeExternalPackages,
            format,
            minify,
            outDir: BUILD_OUTPUT_DIRECTORIES[format],
            packageDir: context.packageDir,
            plugins: context.plugins,
        }));
    });

    if (options.skipUMD) {
        return moduleConfigs;
    }

    // Worker entry points are published as ESM/CJS; UMD cannot share their internal modules.
    const umdConfigs = context.entries.filter((entry) => entry.type !== 'worker').map((entry) => createUmdConfig({
        baseConfig,
        entry,
        outDir: BUILD_OUTPUT_DIRECTORIES.umd,
        packageDir: context.packageDir,
        packageName: context.packageJson.name,
        plugins: context.plugins,
    }));

    return [...moduleConfigs, ...umdConfigs];
}

export function remove() {
    const cwd = process.cwd();

    for (const dir of CLEANUP_DIRECTORIES) {
        const targetDir = path.resolve(cwd, dir);

        if (existsSync(targetDir)) {
            rmSync(targetDir, { force: true, recursive: true });
        }
    }
}

export async function build(options: IBuildOptions = {}) {
    const packageDir = process.cwd();

    if (options.cleanup) {
        remove();
    }

    removeCssArtifacts(path.join(packageDir, BUILD_OUTPUT_ROOT));

    const context = createBuildContext(packageDir, options);
    let configs = createConfigs(context, options);

    if (options.tsdownConfigPath) {
        const configPath = path.resolve(packageDir, options.tsdownConfigPath);
        let userConfig = (await import(pathToFileURL(configPath).href)).default;
        if (typeof userConfig === 'function') {
            userConfig = await userConfig();
        }
        configs = configs.map((config) => mergeConfig(config, userConfig));
    }

    await Promise.all(configs.map((config) => tsdownBuild(config)));
    cleanupPackageJson(packageDir, context.packageJson);
    emitPublishPackageJson(packageDir);
}
