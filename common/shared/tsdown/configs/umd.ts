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
import type { IEntryConfig } from '../types.ts';
import { defineConfig } from 'tsdown';
import { createOutputAliasPlugin } from '../plugins/output-alias.ts';

export interface ICreateUmdConfigOptions {
    baseConfig: Partial<UserConfig>;
    entry: IEntryConfig;
    outDir: string;
    packageDir: string;
    packageName: string;
    plugins: any[];
}

const UMD_GLOBALS: Record<string, string> = {
    '@wendellhu/redi': '@wendellhu/redi',
    '@wendellhu/redi/react-bindings': '@wendellhu/redi/react-bindings',
    'monaco-editor': 'monaco',
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOM',
    'react/jsx-runtime': 'React',
    rxjs: 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    vue: 'Vue',
};

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
    if (source in UMD_GLOBALS) {
        return UMD_GLOBALS[source];
    }

    if (source.startsWith('@univerjs')) {
        if (source === '@univerjs/protocol' || source === '@univerjs/icons') {
            return null;
        }

        return convertLibNameFromPackageName(source);
    }

    return null;
}

/**
 * Produces a stable UMD global name for primary, facade and locale entries.
 */
function getGlobalName(packageName: string, entryKey: string) {
    const name = convertLibNameFromPackageName(packageName);

    if (entryKey === 'facade') {
        return `${name}Facade`;
    }

    if (entryKey.startsWith('locale/')) {
        const localeKey = entryKey.split('/')[1];
        return `${name}${convertLibNameFromPackageName(localeKey)}`;
    }

    return name;
}

/**
 * Creates the browser-oriented UMD bundle config for a single package entry.
 */
export function createUmdConfig(options: ICreateUmdConfigOptions): UserConfig {
    const { baseConfig, entry, outDir, packageDir, packageName, plugins } = options;

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
        outDir,
        outputOptions: {
            entryFileNames: '[name].js',
            globals: (source: string) => resolveUmdGlobal(source) ?? convertLibNameFromPackageName(source),
        },
        platform: 'browser',
        plugins: [
            ...plugins,
            createOutputAliasPlugin({
                copyToRoot: false,
                keepRootIndexCss: false,
                packageDir,
            }),
        ],
    });
}
