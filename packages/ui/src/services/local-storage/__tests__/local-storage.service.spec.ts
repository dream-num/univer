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

import type { ILocalStorageService } from '@univerjs/core';
import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopLocalStorageService } from '../local-storage.service';

function createMemoryLocalStorage() {
    const values = new Map<string, string>();
    return {
        get length() {
            return values.size;
        },
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        key: (index: number) => Array.from(values.keys())[index] ?? null,
    };
}

function createService(): ILocalStorageService {
    const injector = new Injector();
    injector.add([DesktopLocalStorageService]);
    return injector.get(DesktopLocalStorageService);
}

describe('DesktopLocalStorageService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('stores, lists, iterates, and removes persisted UI values', async () => {
        vi.stubGlobal('localStorage', createMemoryLocalStorage());
        const service = createService();

        await service.setItem('sidebar', { width: 320 });
        await service.setItem('theme', 'dark');

        await expect(service.getItem('sidebar')).resolves.toEqual({ width: 320 });
        await expect(service.keys()).resolves.toEqual(['sidebar', 'theme']);
        await expect(service.iterate((value, key) => key === 'theme' ? value : undefined)).resolves.toBe('dark');

        await service.removeItem('sidebar');
        await expect(service.getItem('sidebar')).resolves.toBeNull();
    });

    it('reads key positions and clears stored values', async () => {
        vi.stubGlobal('localStorage', createMemoryLocalStorage());
        const service = createService();

        await service.setItem('first', 1);
        await expect(service.key(0)).resolves.toBe('first');

        await service.clear();
        await expect(service.keys()).resolves.toEqual([]);
        await expect(service.key(0)).resolves.toBeNull();
    });
});
