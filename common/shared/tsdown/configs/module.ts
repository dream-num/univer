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

function matchesPackage(source: string, packageNames: string[]) {
    return packageNames.some((packageName) => source === packageName || source.startsWith(`${packageName}/`));
}

export interface ICreateModuleConfigOptions {
    baseConfig: Partial<UserConfig>;
    bundledPackages: string[];
    enableObfuscation: boolean;
    entry: IEntryConfig;
    externalPackages: string[];
    facadeExternalPackages: string[];
    format: TModuleFormat;
    outDir: string;
    packageDir: string;
    plugins: any[];
}

/**
 * Creates the common ESM/CJS bundle config for a single package entry.
 */
export function createModuleConfig(options: ICreateModuleConfigOptions): UserConfig {
    const { baseConfig, bundledPackages, enableObfuscation, entry, externalPackages, facadeExternalPackages, format, outDir, packageDir, plugins } = options;
    const neverBundlePackages = entry.type === 'facade' ? facadeExternalPackages : externalPackages;
    const copyToRoot = format === 'esm';
    const keepRootIndexCss = entry.type === 'index' && format === 'esm';

    return defineConfig({
        ...baseConfig,
        deps: {
            alwaysBundle: (source) => matchesPackage(source, bundledPackages),
            neverBundle: (source) => matchesPackage(source, neverBundlePackages),
            onlyBundle: false,
        },
        dts: false,
        entry: { [entry.key]: entry.path },
        format,
        outputOptions: {
            codeSplitting: true,
            minify: true,
        },
        outDir,
        plugins: [
            ...plugins,
            ...(enableObfuscation ? [createOutputObfuscatorPlugin()] : []),
            createOutputAliasPlugin({
                copyToRoot,
                keepRootIndexCss,
                packageDir,
            }),
        ],
    });
}
