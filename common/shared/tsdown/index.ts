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

import type { TModuleFormat } from './configs/module';
import type { IBuildContext, IBuildOptions } from './types';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { build as tsdownBuild } from 'tsdown';
import { createModuleConfig } from './configs/module';
import { createUmdConfig } from './configs/umd';
import { BUILD_OUTPUT_DIRECTORIES, BUILD_OUTPUT_ROOT, CLEANUP_DIRECTORIES } from './constants';
import { createBaseConfig, createInputOptions, createInputPlugins } from './utils/base-config';
import { cleanupPackageJson } from './utils/cleanup-pkg';
import { getEntries } from './utils/entries';
import { removeCssArtifacts } from './utils/files';
import { createExternalPackages, readPackageJson } from './utils/package';
import { emitPublishPackageJson } from './utils/publish-manifest';

/**
 * Builds the shared context consumed by all output format factories.
 */
function createBuildContext(packageDir: string, options: IBuildOptions): IBuildContext {
    const packageJson = readPackageJson(packageDir);
    const externalPackages = createExternalPackages(packageJson);

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
function createConfigs(context: IBuildContext, options: IBuildOptions) {
    const baseConfig = createBaseConfig(context);
    const moduleFormats: TModuleFormat[] = ['esm', 'cjs'];
    const enableObfuscation = context.packageJson.name.startsWith('@univerjs-pro/');

    const moduleConfigs = context.entries.flatMap((entry) => {
        return moduleFormats.map((format) => createModuleConfig({
            baseConfig,
            enableObfuscation,
            entry,
            externalPackages: context.externalPackages,
            facadeExternalPackages: context.facadeExternalPackages,
            format,
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
    const configs = createConfigs(context, options);
    await Promise.all(configs.map((config) => tsdownBuild(config)));
    cleanupPackageJson(packageDir, context.packageJson);
    emitPublishPackageJson(packageDir);
}
