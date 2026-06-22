import type { TModuleFormat } from './configs/module.ts';
import type { IBuildContext, IBuildOptions } from './types.ts';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { mergeConfig, build as tsdownBuild } from 'tsdown';
import { createModuleConfig } from './configs/module.ts';
import { createUmdConfig } from './configs/umd.ts';
import { BUILD_OUTPUT_DIRECTORIES, BUILD_OUTPUT_ROOT, CLEANUP_DIRECTORIES } from './constants.ts';
import { createBaseConfig, createInputOptions, createInputPlugins } from './utils/base-config.ts';
import { cleanupPackageJson } from './utils/cleanup-pkg.ts';
import { getEntries } from './utils/entries.ts';
import { removeCssArtifacts } from './utils/files.ts';
import { createExternalPackages, readPackageJson } from './utils/package.ts';
import { emitPublishPackageJson } from './utils/publish-manifest.ts';

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
    const primaryEntries = entries.filter((entry) => entry.type === 'index' || entry.type === 'locale');
    const isolatedEntries = entries.filter((entry) => entry.type !== 'index' && entry.type !== 'locale');

    return [
        ...(primaryEntries.length > 0 ? [primaryEntries] : []),
        ...isolatedEntries.map((entry) => [entry]),
    ];
}

export function createConfigs(context: IBuildContext, options: IBuildOptions) {
    const baseConfig = createBaseConfig(context);
    const moduleFormats: TModuleFormat[] = ['esm', 'cjs'];
    const enableObfuscation = context.packageJson.name.startsWith('@univerjs-pro/');

    const moduleConfigs = createModuleEntryGroups(context.entries).flatMap((entries) => {
        return moduleFormats.map((format) => createModuleConfig({
            baseConfig,
            enableObfuscation,
            entries,
            externalPackages: context.externalPackages,
            facadeExternalPackages: context.facadeExternalPackages,
            format,
            obfuscatorIgnorePatterns: options.obfuscatorIgnorePatterns,
            outDir: BUILD_OUTPUT_DIRECTORIES[format],
            packageDir: context.packageDir,
            plugins: context.plugins,
        }));
    });

    if (options.skipUMD) {
        return moduleConfigs;
    }

    const umdConfigs = context.entries.map((entry) => createUmdConfig({
        baseConfig,
        enableObfuscation,
        entry,
        obfuscatorIgnorePatterns: options.obfuscatorIgnorePatterns,
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

    /**
     * If we specifically have a tsdown config path provided, we will use that and ignore any default configs. However, if no specific config is provided, we will look for default configs in the package root (tsdown.config.mjs, tsdown.config.ts, tsdown.config.js) and merge any found obfuscatorIgnorePatterns into the build context. This allows users to specify obfuscation ignore patterns without needing to provide a full custom config.
     */
    if (!options.tsdownConfigPath) {
        const configExtensions = ['.mjs', '.ts', '.js'];
        for (const ext of configExtensions) {
            const defaultConfigPath = path.resolve(packageDir, `tsdown.config${ext}`);
            if (existsSync(defaultConfigPath)) {
                const { default: userConfigModule } = await import(defaultConfigPath);
                if (userConfigModule.obfuscatorIgnorePatterns) {
                    options.obfuscatorIgnorePatterns = userConfigModule.obfuscatorIgnorePatterns;
                }
                break;
            }
        }
    }

    const context = createBuildContext(packageDir, options);
    let configs = createConfigs(context, options);

    if (options.tsdownConfigPath) {
        const configPath = path.resolve(packageDir, options.tsdownConfigPath);
        let userConfig = (await import(configPath)).default;
        if (typeof userConfig === 'function') {
            userConfig = await userConfig();
        }
        configs = configs.map((config) => mergeConfig(config, userConfig));
    }

    await Promise.all(configs.map((config) => tsdownBuild(config)));
    cleanupPackageJson(packageDir, context.packageJson);
    emitPublishPackageJson(packageDir);
}
