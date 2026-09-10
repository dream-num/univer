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
import { getTopmostDocsTableHit } from '../table-hit-test';

describe('getTopmostDocsTableHit', () => {
    const bottom = { id: 'bottom', top: 100, bottom: 200 };
    const top = { id: 'top', top: 150, bottom: 250 };
    const hit = (y: number) => getTopmostDocsTableHit(
        [bottom, top],
        (table) => y >= table.top && y <= table.bottom,
        (table) => y >= table.top - 30 && y <= table.bottom
    );

    it('chooses the last-painted table in an overlap', () => {
        expect(hit(175)).toBe(top);
    });

    it('does not let the top table header gutter intercept the lower table body', () => {
        expect(hit(130)).toBe(bottom);
    });

    it('keeps controls reachable outside content and clears the hit outside both', () => {
        expect(hit(80)).toBe(bottom);
        expect(hit(60)).toBeUndefined();
    });

    it('prefers a nested table header over its parent table body', () => {
        const outer = { id: 'outer', top: 0, bottom: 300 };
        const inner = { id: 'inner', top: 100, bottom: 200 };
        const result = getTopmostDocsTableHit(
            [outer, inner],
            (table) => table.top <= 90 && table.bottom >= 90,
            (table) => table.top - 30 <= 90 && table.bottom >= 90,
            (parent, child) => parent.top < child.top && parent.bottom > child.bottom
        );

        expect(result).toBe(inner);
    });

    it('keeps a nested table header reachable when its gutter overlaps a sibling table body', () => {
        const outer = { id: 'outer', start: 0, end: 400 };
        const sibling = { id: 'sibling', start: 1, end: 100 };
        const middle = { id: 'middle', start: 101, end: 399 };
        const inner = { id: 'inner', start: 150, end: 300 };
        const result = getTopmostDocsTableHit(
            [outer, sibling, middle, inner],
            (table) => table === outer || table === sibling,
            (table) => table === inner,
            (parent, child) => parent.start < child.start && parent.end > child.end
        );

        expect(result).toBe(inner);
    });

    it('keeps the deepest table body active over ancestor controls', () => {
        const outer = { id: 'outer', start: 0, end: 300 };
        const middle = { id: 'middle', start: 50, end: 250 };
        const inner = { id: 'inner', start: 100, end: 200 };
        const result = getTopmostDocsTableHit(
            [outer, middle, inner],
            () => true,
            () => true,
            (parent, child) => parent.start < child.start && parent.end > child.end
        );

        expect(result).toBe(inner);
    });
});
