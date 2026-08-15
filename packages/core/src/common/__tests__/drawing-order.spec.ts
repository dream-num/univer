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
import { ArrangeTypeEnum } from '../../types/interfaces/i-drawing';
import { getDrawingOrderIndex, normalizeDrawingOrderIndex } from '../drawing-order';

describe('drawing order', () => {
    it('resolves relative arrangement to a zero-based order index', () => {
        expect(getDrawingOrderIndex(1, 4, ArrangeTypeEnum.front)).toBe(3);
        expect(getDrawingOrderIndex(1, 4, ArrangeTypeEnum.forward)).toBe(2);
        expect(getDrawingOrderIndex(1, 4, ArrangeTypeEnum.backward)).toBe(0);
        expect(getDrawingOrderIndex(1, 4, ArrangeTypeEnum.back)).toBe(0);
    });

    it('keeps relative arrangement inside the available order', () => {
        expect(getDrawingOrderIndex(3, 4, ArrangeTypeEnum.forward)).toBe(3);
        expect(getDrawingOrderIndex(0, 4, ArrangeTypeEnum.backward)).toBe(0);
        expect(getDrawingOrderIndex(0, 0, ArrangeTypeEnum.front)).toBe(0);
    });

    it('normalizes absolute indexes to the available order', () => {
        expect(normalizeDrawingOrderIndex(-1, 3)).toBe(0);
        expect(normalizeDrawingOrderIndex(1.9, 3)).toBe(1);
        expect(normalizeDrawingOrderIndex(99, 3)).toBe(2);
        expect(normalizeDrawingOrderIndex(Number.POSITIVE_INFINITY, 3)).toBe(2);
        expect(normalizeDrawingOrderIndex(Number.NaN, 3)).toBe(0);
        expect(normalizeDrawingOrderIndex(1, 0)).toBe(0);
    });
});
