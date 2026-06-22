import type { UserConfig } from 'tsdown';
import type { IEntryConfig } from '../types.ts';
import { defineConfig } from 'tsdown';
import { peerDepsMap } from '../data/peer-deps.ts';
import { createCssNoopInputOptions } from '../plugins/css-noop.ts';
import { createOutputAliasPlugin } from '../plugins/output-alias.ts';
import { createOutputObfuscatorPlugin } from '../plugins/output-obfuscator.ts';

export interface ICreateUmdConfigOptions {
    baseConfig: Partial<UserConfig>;
    enableObfuscation: boolean;
    entry: IEntryConfig;
    obfuscatorIgnorePatterns?: RegExp[];
    outDir: string;
    packageDir: string;
    packageName: string;
    plugins: any[];
}

const UMD_GLOBALS: Record<string, string> = Object.fromEntries(
    Object.entries(peerDepsMap).map(([source, value]) => [source, value.global])
);
const CSS_UMD_GLOBAL = 'UniverCssNoop';

function convertLibNameFromPackageName(name: string) {
    return name
        .replace(/^@(univerjs(?:-pro)?)\//, (_, matchedPrefix) => {
            return matchedPrefix === 'univerjs-pro' ? 'univer-pro-' : 'univer-';
        })
        .replace('/facade', '-facade')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

/**
 * Maps externals to their browser globals in UMD builds.
 */
function resolveUmdGlobal(source: string) {
    if (source.endsWith('.css')) {
        return null;
    }

    if (source in UMD_GLOBALS) {
        return UMD_GLOBALS[source];
    }

    if (source.startsWith('@univerjs')) {
        if (source === '@univerjs/icons') {
            return null;
        }

        const localeMatch = source.match(/^(@univerjs(?:-pro)?\/[^/]+)\/(?:locale|locales)\/([^/]+)$/);

        if (localeMatch) {
            return `${convertLibNameFromPackageName(localeMatch[1])}${convertLibNameFromPackageName(localeMatch[2])}`;
        }

        return convertLibNameFromPackageName(source);
    }

    return null;
}

function resolveOutputGlobal(source: string) {
    const global = resolveUmdGlobal(source);

    if (global !== null) {
        return global;
    }

    if (source.endsWith('.css')) {
        return CSS_UMD_GLOBAL;
    }

    return convertLibNameFromPackageName(source);
}

/**
 * Produces a stable UMD global name for primary, facade and locale entries.
 */
function getGlobalName(packageName: string, entryKey: string) {
    const name = convertLibNameFromPackageName(packageName);

    if (entryKey === 'facade') {
        return `${name}Facade`;
    }

    if (entryKey.startsWith('locale/') || entryKey.startsWith('locales/')) {
        const localeKey = entryKey.split('/')[1];
        return `${name}${convertLibNameFromPackageName(localeKey)}`;
    }

    return name;
}

/**
 * Creates the browser-oriented UMD bundle config for a single package entry.
 */
export function createUmdConfig(options: ICreateUmdConfigOptions): UserConfig {
    const { baseConfig, enableObfuscation, entry, obfuscatorIgnorePatterns, outDir, packageDir, packageName, plugins } = options;

    return defineConfig({
        ...baseConfig,
        deps: {
            alwaysBundle: [/.*/],
            neverBundle: (source: string) => Boolean(resolveUmdGlobal(source)),
            onlyBundle: false,
        },
        dts: false,
        entry: { [entry.key]: entry.path },
        format: 'umd',
        globalName: getGlobalName(packageName, entry.key),
        inputOptions: createCssNoopInputOptions(baseConfig.inputOptions),
        outDir,
        outputOptions: {
            entryFileNames: '[name].js',
            globals: (source: string) => resolveOutputGlobal(source),
            minify: true,
        },
        platform: 'browser',
        plugins: [
            ...plugins,
            ...(enableObfuscation ? [createOutputObfuscatorPlugin(obfuscatorIgnorePatterns)] : []),
            createOutputAliasPlugin({
                copyToRoot: false,
                keepRootIndexCss: false,
                packageDir,
            }),
        ],
    });
}
