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

import type { TModuleFormat } from '../tsdown/configs/module';
import type { IPackageJson } from '../tsdown/types';
import type { IPresetBuildOptions, IPresetPackageJson } from './types';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { mergeConfig, build as tsdownBuild } from 'tsdown';
import { createModuleConfig } from '../tsdown/configs/module';
import { createUmdConfig } from '../tsdown/configs/umd';
import { BUILD_OUTPUT_DIRECTORIES, CLEANUP_DIRECTORIES } from '../tsdown/constants';
import { createBaseConfig, createInputPlugins } from '../tsdown/utils/base-config';
import { getPresetModuleEntries, getPresetUmdEntries } from './entries';
import { generatePresetLocales } from './locale';
import { buildPresetStyles } from './style';
import { prependPresetUmd } from './umd';

export { generatePresetLocales } from './locale';
export type { IPresetBuildOptions } from './types';
export { prependPresetUmd } from './umd';

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

    if (options.cleanup) {
        removePresetOutputs(packageDir);
    }

    preparePresetPackage(packageDir);

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
    const userConfig = await loadUserConfig(options, packageDir);
    const moduleFormats: TModuleFormat[] = ['esm', 'cjs'];
    const moduleConfigs = moduleFormats.flatMap((format) => {
        return getPresetModuleEntries(packageDir).map((entry) => createModuleConfig({
            baseConfig,
            enableObfuscation: false,
            entry,
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

    if (options.skipUMD) {
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
        umdAdditionalFiles: options.umdAdditionalFiles,
        umdDeps: options.umdDeps,
    });
}
