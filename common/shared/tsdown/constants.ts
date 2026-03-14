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

export const BUILD_OUTPUT_ROOT = 'dist';

export const BUILD_OUTPUT_DIRECTORIES = {
    cjs: 'dist/cjs',
    esm: 'dist/es',
    umd: 'dist/umd',
} as const;

export const CLEANUP_DIRECTORIES = ['dist', 'lib', 'coverage'] as const;
export const DEFAULT_BROWSER_TARGET = 'chrome70';
export const DEFAULT_ENTRY_FILE = 'src/index.ts';
export const FACADE_ENTRY_FILE = 'src/facade/index.ts';
export const LOCALE_DIRECTORY = 'src/locale';
export const SOURCE_DIRECTORY = 'src';
export const TYPE_BUILD_CONFIG_FILE = 'tsconfig.tsdown.build.json';
export const TYPE_BUILD_EXCLUDES = ['src/**/__tests__/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'];
