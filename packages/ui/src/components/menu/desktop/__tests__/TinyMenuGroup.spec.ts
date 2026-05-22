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
import { getVisibleTinyMenuChildren, resolveMenuItemActiveState } from '../TinyMenuGroup';

describe('TinyMenuGroup', () => {
    it('uses explicit active items as an override instead of merging with observable active state', () => {
        expect(resolveMenuItemActiveState('h1', true, ['normal-text'])).toBe(false);
        expect(resolveMenuItemActiveState('normal-text', false, ['normal-text'])).toBe(true);
        expect(resolveMenuItemActiveState('h1', true)).toBe(true);
    });

    it('filters hidden tiny menu children before rendering', () => {
        const children = [
            { key: 'h1', order: 0, item: { id: 'h1' } },
            { key: 'title', order: 1, item: { id: 'title' } },
            { key: 'subtitle', order: 2, item: { id: 'subtitle' } },
        ] as never;

        expect(getVisibleTinyMenuChildren(children, ['title', 'subtitle']).map((item) => item.key)).toEqual(['h1']);
    });
});
