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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { UIRuntimeScopeService } from '../ui-runtime-scope.service';

describe('UIRuntimeScopeService', () => {
    it('resolves concurrent runtimes for the same unit from their DOM roots', () => {
        const service = new UIRuntimeScopeService();
        const floatingRoot = document.createElement('div');
        const fullscreenRoot = document.createElement('div');
        const floatingTarget = document.createElement('textarea');
        const fullscreenTarget = document.createElement('textarea');
        floatingRoot.appendChild(floatingTarget);
        fullscreenRoot.appendChild(fullscreenTarget);

        const floatingScope = {
            unitId: 'base-1',
            root: floatingRoot,
            has: () => false,
            get<T>(): T {
                throw new Error('not implemented');
            },
        };
        const fullscreenScope = {
            unitId: 'base-1',
            root: fullscreenRoot,
            has: () => false,
            get<T>(): T {
                throw new Error('not implemented');
            },
        };
        const floatingDisposable = service.register(floatingScope);
        const fullscreenDisposable = service.register(fullscreenScope);

        expect(service.get('base-1')).toBe(fullscreenScope);
        expect(service.getForElement(floatingTarget)).toBe(floatingScope);
        expect(service.getForElement(fullscreenTarget)).toBe(fullscreenScope);

        fullscreenDisposable.dispose();
        expect(service.get('base-1')).toBe(floatingScope);
        floatingDisposable.dispose();
        expect(service.get('base-1')).toBeUndefined();
    });
});
