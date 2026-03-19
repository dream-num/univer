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

import { describe, expect, it } from 'vitest';
import { createBundledPackages, createExternalPackages } from './package';

const packageJson = {
    name: '@univerjs/core',
    dependencies: {
        '@univerjs/design': 'workspace:*',
        '@univerjs-pro/example': 'workspace:*',
        '@wendellhu/redi': '1.1.1',
        dayjs: '^1.11.20',
    },
    peerDependencies: {
        react: '^19.0.0',
        rxjs: '>=7.0.0',
    },
};

describe('package dependency helpers', () => {
    it('should only keep @univerjs and @univerjs-pro packages as external', () => {
        expect(createExternalPackages(packageJson)).toEqual([
            '@univerjs-pro/example',
            '@univerjs/design',
        ]);
    });

    it('should bundle third-party production dependencies and peer dependencies', () => {
        expect(createBundledPackages(packageJson)).toEqual([
            '@wendellhu/redi',
            'dayjs',
            'react',
            'rxjs',
        ]);
    });
});
