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
import type { IEntryConfig } from '../types';
import { defineConfig } from 'tsdown';
import { createOutputAliasPlugin } from '../plugins/output-alias';
import { createOutputObfuscatorPlugin } from '../plugins/output-obfuscator';

export type TModuleFormat = 'cjs' | 'esm';

export interface ICreateModuleConfigOptions {
    baseConfig: Partial<UserConfig>;
    enableObfuscation: boolean;
    entries: IEntryConfig[];
    externalPackages: string[];
    facadeExternalPackages: string[];
    format: TModuleFormat;
    obfuscatorIgnorePatterns?: RegExp[];
    outDir: string;
    packageDir: string;
    plugins: any[];
}

/**
 * Creates the common ESM/CJS bundle config for a single package entry.
 */
export function createModuleConfig(options: ICreateModuleConfigOptions): UserConfig {
    const { baseConfig, enableObfuscation, entries, externalPackages, facadeExternalPackages, format, obfuscatorIgnorePatterns, outDir, packageDir, plugins } = options;
    const hasFacadeEntry = entries.some((entry) => entry.type === 'facade');
    const hasIndexEntry = entries.some((entry) => entry.type === 'index');
    const neverBundle = hasFacadeEntry ? facadeExternalPackages : externalPackages;
    const copyToRoot = format === 'esm';
    const keepRootIndexCss = hasIndexEntry && format === 'esm';

    return defineConfig({
        ...baseConfig,
        deps: {
            neverBundle,
        },
        dts: false,
        entry: Object.fromEntries(entries.map((entry) => [entry.key, entry.path])),
        format,
        outputOptions: {
            codeSplitting: true,
            minify: enableObfuscation,
        },
        outDir,
        plugins: [
            ...plugins,
            ...(enableObfuscation ? [createOutputObfuscatorPlugin(obfuscatorIgnorePatterns)] : []),
            createOutputAliasPlugin({
                copyToRoot,
                keepRootIndexCss,
                packageDir,
            }),
        ],
    });
}
