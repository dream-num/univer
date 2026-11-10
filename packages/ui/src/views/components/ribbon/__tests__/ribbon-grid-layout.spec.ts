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
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { groupRibbonOverflowItems, placeRibbonGridItems } from '../ribbon-grid-layout';

function item(key: string, row: number, column: number, icon?: string): IMenuSchema {
    return { key, order: 0, item: { id: key, type: MenuItemType.BUTTON, icon }, gridLayout: { row, column } };
}

describe('ribbon grid layout', () => {
    it('keeps visual reading order and related icon controls together in More', () => {
        const items = [
            item('font', 1, 1),
            item('size', 1, 2),
            item('increase', 1, 3, 'Increase'),
            item('decrease', 1, 4, 'Decrease'),
            item('text-color', 2, 3, 'TextColor'),
            item('fill', 2, 2, 'Fill'),
            item('border', 2, 1, 'Border'),
        ];
        expect(groupRibbonOverflowItems(items).map((group) => group.map((child) => child.key))).toEqual([
            ['font', 'size'],
            ['increase', 'decrease'],
            ['border', 'fill', 'text-color'],
        ]);
    });

    it('preserves every item when an extension has no placement or overlaps another control', () => {
        const items = [item('first', 1, 1), item('overlap', 1, 1), { key: 'extension', order: 2 }];
        const placements = placeRibbonGridItems(items);
        expect(placements.map(({ item, row, column }) => [item.key, row, column])).toEqual([
            ['first', 1, 1],
            ['extension', 1, 2],
            ['overlap', 2, 1],
        ]);
        expect(groupRibbonOverflowItems([])).toEqual([]);
    });
});
