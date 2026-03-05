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

import type { MenuItemConfig } from '../../services/menu/menu';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { mergeMenuConfigs } from '../menu-merge-configs';

describe('mergeMenuConfigs', () => {
    it('should return base config when additional config is null', () => {
        const base = { title: 'Base title' };

        expect(mergeMenuConfigs(base, null)).toBe(base);
    });

    it('should return base config when base config is falsy', () => {
        expect(mergeMenuConfigs(null as unknown as MenuItemConfig, { title: 'New title' })).toBeNull();
    });

    it('should merge plain properties and ignore undefined values', () => {
        const base = {
            type: 1,
            icon: 'old-icon',
            title: 'old-title',
            tooltip: 'old-tooltip',
        } as unknown as MenuItemConfig;

        const additional = {
            title: 'new-title',
            tooltip: 'new-tooltip',
            icon: undefined,
        } as unknown as MenuItemConfig;

        const merged = mergeMenuConfigs(base, additional);

        expect(merged.title).toBe('new-title');
        expect(merged.tooltip).toBe('new-tooltip');
        expect(merged.icon).toBe('old-icon');
    });

    it('should create reactive observables when base config has no reactive properties', async () => {
        const base = {} as MenuItemConfig;

        const merged = mergeMenuConfigs(base, {
            hidden: true,
            disabled: false,
            activated: true,
        });

        await expect(firstValueFrom(merged.hidden$!)).resolves.toBe(true);
        await expect(firstValueFrom(merged.disabled$!)).resolves.toBe(false);
        await expect(firstValueFrom(merged.activated$!)).resolves.toBe(true);
    });

    it('should replace values from existing reactive observables', async () => {
        const base = {
            hidden$: of(false),
            disabled$: of(true),
            activated$: of(false),
        } as MenuItemConfig;

        const merged = mergeMenuConfigs(base, {
            hidden: true,
            disabled: false,
            activated: true,
        });

        await expect(firstValueFrom(merged.hidden$!)).resolves.toBe(true);
        await expect(firstValueFrom(merged.disabled$!)).resolves.toBe(false);
        await expect(firstValueFrom(merged.activated$!)).resolves.toBe(true);
    });
});
