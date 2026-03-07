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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DocSimpleSkeleton } from '../doc-simple-skeleton';
import { FontCache } from '../shaping-engine/font-cache';

function measure(text: string) {
    return {
        width: text.length * 10,
        fontBoundingBoxAscent: 8,
        fontBoundingBoxDescent: 2,
    } as any;
}

describe('doc simple skeleton', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => measure(text));
    });

    it('handles empty text and no-wrap text', () => {
        const empty = new DocSimpleSkeleton('', '12px Arial', true, 100, 100);
        const emptyLines = empty.calculate();
        expect(emptyLines).toEqual([
            {
                text: '',
                width: 0,
                height: 10,
                baseline: 8,
            },
        ]);
        expect(empty.getTotalHeight()).toBe(10);
        expect(empty.getTotalWidth()).toBe(0);

        const noWrap = new DocSimpleSkeleton('hello world', '12px Arial', false, 30, 200);
        const lines = noWrap.calculate();
        expect(lines).toHaveLength(1);
        expect(lines[0].text).toBe('hello world');
        expect(lines[0].width).toBe(110);
        expect(noWrap.getTotalHeight()).toBe(10);
        expect(noWrap.getTotalWidth()).toBe(110);
    });

    it('wraps long text and uses cache behavior', () => {
        const skeleton = new DocSimpleSkeleton('supercalifragilistic', '12px Arial', true, 25, 100);
        const lines = skeleton.calculate();
        expect(lines.length).toBeGreaterThan(1);
        expect(lines.every((line) => line.width > 0)).toBe(true);
        expect(lines.every((line) => line.width <= 25 || line.text.length === 1)).toBe(true);

        const callCountAfterFirst = (FontCache.getMeasureText as any).mock.calls.length;
        const second = skeleton.calculate();
        expect(second).toBe(lines);
        expect((FontCache.getMeasureText as any).mock.calls.length).toBe(callCountAfterFirst);
    });

    it('recalculates after makeDirty in no-wrap mode', () => {
        const skeleton = new DocSimpleSkeleton('hello world', '12px Arial', false, 30, 200);
        const first = skeleton.calculate();
        const callCountAfterFirst = (FontCache.getMeasureText as any).mock.calls.length;
        const second = skeleton.calculate();
        expect(second).toBe(first);
        expect((FontCache.getMeasureText as any).mock.calls.length).toBe(callCountAfterFirst);

        skeleton.makeDirty();
        const third = skeleton.calculate();
        expect(third).not.toBe(first);
        expect(third).toHaveLength(1);
        expect(third[0].text).toBe('hello world');
        expect((FontCache.getMeasureText as any).mock.calls.length).toBeGreaterThan(callCountAfterFirst);
    });

    it('respects height limits when wrapping', () => {
        const skeleton = new DocSimpleSkeleton('a b c d e f g h i j k', '12px Arial', true, 20, 15);
        const lines = skeleton.calculate();
        expect(lines.length).toBeGreaterThan(0);
        expect(skeleton.getTotalHeight()).toBeGreaterThanOrEqual(10);
    });
});
