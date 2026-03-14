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

import type { UserConfig } from 'tsdown';
import type { IBuildContext, IBuildOptions } from '../types.ts';
import path from 'node:path';
import vue from 'unplugin-vue/rolldown';
import { DEFAULT_BROWSER_TARGET } from '../constants.ts';
import { hasSourceFiles } from './files.ts';

/**
 * Resolves extra bundler plugins based on the package source layout.
 */
export function createInputPlugins(packageDir: string): any[] {
    return hasSourceFiles(packageDir, '.vue') ? [vue()] : [];
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
