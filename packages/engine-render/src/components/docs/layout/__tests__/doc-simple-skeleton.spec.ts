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

import { Injector } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocSimpleSkeleton } from '../doc-simple-skeleton';
import { FontCache } from '../shaping-engine/font-cache';

function measure(text: string) {
    return {
        width: text.length * 10,
        fontBoundingBoxAscent: 8,
        fontBoundingBoxDescent: 2,
        actualBoundingBoxAscent: 8,
        actualBoundingBoxDescent: 2,
    };
}

describe('doc simple skeleton', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector();
        Reflect.set(FontCache, '_context', null);
        FontCache.invalidateMetrics(() => true);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            font: '',
            measureText: vi.fn(measure),
        } as unknown as CanvasRenderingContext2D);
    });

    afterEach(() => {
        injector.dispose();
        vi.restoreAllMocks();
        Reflect.set(FontCache, '_context', null);
        FontCache.invalidateMetrics(() => true);
    });

    it('handles empty text and no-wrap text', () => {
        const empty = injector.createInstance(DocSimpleSkeleton, '', '12px Arial', true, 100, 100);
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

        const noWrap = injector.createInstance(DocSimpleSkeleton, 'hello world', '12px Arial', false, 30, 200);
        const lines = noWrap.calculate();
        expect(lines).toHaveLength(1);
        expect(lines[0].text).toBe('hello world');
        expect(lines[0].width).toBe(110);
        expect(noWrap.getTotalHeight()).toBe(10);
        expect(noWrap.getTotalWidth()).toBe(110);
    });

    it('wraps long text and uses cache behavior', () => {
        const skeleton = injector.createInstance(DocSimpleSkeleton, 'supercalifragilistic', '12px Arial', true, 25, 100);
        const lines = skeleton.calculate();
        expect(lines.length).toBeGreaterThan(1);
        expect(lines.every((line) => line.width > 0)).toBe(true);
        expect(lines.every((line) => line.width <= 25 || line.text.length === 1)).toBe(true);

        const second = skeleton.calculate();
        expect(second).toBe(lines);
    });

    it('recalculates after makeDirty in no-wrap mode', () => {
        const skeleton = injector.createInstance(DocSimpleSkeleton, 'hello world', '12px Arial', false, 30, 200);
        const first = skeleton.calculate();
        const second = skeleton.calculate();
        expect(second).toBe(first);

        skeleton.makeDirty();
        const third = skeleton.calculate();
        expect(third).not.toBe(first);
        expect(third).toHaveLength(1);
        expect(third[0].text).toBe('hello world');
    });

    it('respects height limits when wrapping', () => {
        const skeleton = injector.createInstance(DocSimpleSkeleton, 'a b c d e f g h i j k', '12px Arial', true, 20, 15);
        const lines = skeleton.calculate();
        expect(lines.slice(0, 2).map((line) => line.text)).toEqual(['a ', 'b ']);
        expect(lines.some((line) => line.text.includes('c'))).toBe(false);
    });

    it('content with \n', () => {
        const skeleton = injector.createInstance(DocSimpleSkeleton, '客户经理UM1\n客户经理UM2', '11pt Arial', true, 60, Infinity);
        const lines = skeleton.calculate();
        expect(lines.length).toBe(4);
        expect(lines[0].text).toBe('客户经理');
        expect(lines[1].text).toBe('UM1');
        expect(lines[2].text).toBe('客户经理');
        expect(lines[3].text).toBe('UM2');
    });

    it('adds the configured gap only between wrapped lines without changing glyph metrics or breaks', () => {
        const baseline = injector.createInstance(DocSimpleSkeleton, 'first\nsecond\nthird', '12px Arial', true, 100, Infinity);
        const spaced = injector.createInstance(DocSimpleSkeleton, 'first\nsecond\nthird', '12px Arial', true, 100, Infinity, 2);
        expect(spaced.calculate()).toEqual(baseline.calculate());
        expect(spaced.getTotalHeight()).toBe(baseline.getTotalHeight() + 4);
        expect(spaced.getTotalWidth()).toBe(baseline.getTotalWidth());

        const single = injector.createInstance(DocSimpleSkeleton, 'first', '12px Arial', true, 100, Infinity, 2);
        single.calculate();
        expect(single.getTotalHeight()).toBe(baseline.getLines()[0].height);
    });
});
