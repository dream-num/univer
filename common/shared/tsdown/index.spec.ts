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

import type { IBuildContext } from './types';
import { describe, expect, it } from 'vitest';
import { createConfigs } from './index';

describe('createConfigs', () => {
    it('batches index and locale module entries while keeping facade and UMD entries isolated', () => {
        const context: IBuildContext = {
            entries: [
                { key: 'index', path: '/tmp/pkg/src/index.ts', type: 'index' },
                { key: 'locale/en-US', path: '/tmp/pkg/src/locale/en-US.ts', type: 'locale' },
                { key: 'locale/zh-CN', path: '/tmp/pkg/src/locale/zh-CN.ts', type: 'locale' },
                { key: 'facade', path: '/tmp/pkg/src/facade/index.ts', type: 'facade' },
            ],
            externalPackages: ['@univerjs/core'],
            facadeExternalPackages: ['@univerjs/core', '@univerjs/example', '@univerjs/example/*'],
            packageDir: '/tmp/pkg',
            packageJson: {
                name: '@univerjs/example',
            },
            plugins: [],
        };

        const configs = createConfigs(context, {});
        const moduleConfigs = configs.filter((config) => config.format !== 'umd');
        const umdConfigs = configs.filter((config) => config.format === 'umd');

        expect(configs).toHaveLength(8);
        expect(moduleConfigs).toHaveLength(4);
        expect(umdConfigs).toHaveLength(4);
        expect(moduleConfigs.map((config) => config.entry)).toEqual([
            {
                index: '/tmp/pkg/src/index.ts',
                'locale/en-US': '/tmp/pkg/src/locale/en-US.ts',
                'locale/zh-CN': '/tmp/pkg/src/locale/zh-CN.ts',
            },
            {
                index: '/tmp/pkg/src/index.ts',
                'locale/en-US': '/tmp/pkg/src/locale/en-US.ts',
                'locale/zh-CN': '/tmp/pkg/src/locale/zh-CN.ts',
            },
            {
                facade: '/tmp/pkg/src/facade/index.ts',
            },
            {
                facade: '/tmp/pkg/src/facade/index.ts',
            },
        ]);
        expect(umdConfigs.map((config) => config.entry)).toEqual([
            { index: '/tmp/pkg/src/index.ts' },
            { 'locale/en-US': '/tmp/pkg/src/locale/en-US.ts' },
            { 'locale/zh-CN': '/tmp/pkg/src/locale/zh-CN.ts' },
            { facade: '/tmp/pkg/src/facade/index.ts' },
        ]);
    });
});
