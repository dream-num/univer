import type { UserConfig } from 'tsdown';
import { defineConfig } from 'tsdown';
import type { IEntryConfig } from '../types.ts';
import { createCssNoopInputOptions } from '../plugins/css-noop.ts';
import { createOutputAliasPlugin } from '../plugins/output-alias.ts';

export type TModuleFormat = 'cjs' | 'esm';

export interface ICreateModuleConfigOptions {
    baseConfig: Partial<UserConfig>;
    entries: IEntryConfig[];
    externalPackages: string[];
    facadeExternalPackages: string[];
    format: TModuleFormat;
    minify: boolean;
    outDir: string;
    packageDir: string;
    plugins: any[];
}

/**
 * Creates the common ESM/CJS bundle config for a single package entry.
 */
export function createModuleConfig(options: ICreateModuleConfigOptions): UserConfig {
    const { baseConfig, entries, externalPackages, facadeExternalPackages, format, minify, outDir, packageDir, plugins } = options;
    const hasFacadeEntry = entries.some((entry) => entry.type === 'facade');
    const hasIndexEntry = entries.some((entry) => entry.type === 'index');
    const neverBundle = hasFacadeEntry ? facadeExternalPackages : externalPackages;
    const copyToRoot = format === 'esm';
    const keepRootIndexCss = hasIndexEntry && format === 'esm';

    return defineConfig({
        ...baseConfig,
        deps: {
            neverBundle,
            resolveDepSubpath: true,
        },
        dts: false,
        entry: Object.fromEntries(entries.map((entry) => [entry.key, entry.path])),
        format,
        inputOptions: keepRootIndexCss ? baseConfig.inputOptions : createCssNoopInputOptions(baseConfig.inputOptions),
        outputOptions: {
            codeSplitting: true,
            minify,
        },
        outDir,
        plugins: [
            ...plugins,
            createOutputAliasPlugin({
                copyToRoot,
                keepRootIndexCss,
                packageDir,
            }),
        ],
    });
}
