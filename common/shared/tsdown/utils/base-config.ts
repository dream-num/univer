import type { UserConfig } from 'tsdown';
import type { IBuildContext, IBuildOptions } from '../types.ts';
import path from 'node:path';
import vue from 'unplugin-vue/rolldown';
import { DEFAULT_BROWSER_TARGET } from '../constants.ts';
import { createClassNameWhitespaceCleanupPlugin } from '../plugins/class-name-whitespace-cleanup.ts';
import { hasSourceFiles } from './files.ts';

/**
 * Resolves extra bundler plugins based on the package source layout.
 */
export function createInputPlugins(packageDir: string): any[] {
    return [
        createClassNameWhitespaceCleanupPlugin(),
        ...(hasSourceFiles(packageDir, '.vue') ? [vue()] : []),
    ];
}

/**
 * Builds resolver conditions for packages that prefer Node-first exports.
 */
export function createInputOptions(options: IBuildOptions): IBuildContext['inputOptions'] {
    if (!options.nodeFirst) {
        return undefined;
    }

    return {
        resolve: {
            conditionNames: ['node', 'default'],
        },
    };
}

/**
 * Creates the shared tsdown base config used by all output formats.
 */
export function createBaseConfig(context: IBuildContext): Partial<UserConfig> {
    return {
        clean: false,
        css: {
            transformer: 'postcss' as const,
        },
        cwd: context.packageDir,
        define: {
            'process.env.BUILD_TIMESTAMP': JSON.stringify(Math.floor(Date.now() / 1000)),
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.WS_NO_BUFFER_UTIL': JSON.stringify(true),
        },
        inputOptions: context.inputOptions,
        outExtensions: () => ({ js: '.js' }),
        report: true,
        target: DEFAULT_BROWSER_TARGET,
        tsconfig: path.join(context.packageDir, 'tsconfig.json'),
    } satisfies Partial<UserConfig>;
}
