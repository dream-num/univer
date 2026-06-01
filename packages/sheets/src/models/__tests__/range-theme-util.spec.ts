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

import { BooleanNumber, BorderStyleTypes } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { composeStyles, RangeThemeStyle } from '../range-theme-util';

describe('range-theme-util', () => {
    it('composeStyles should return single style directly', () => {
        const style = { bg: { rgb: '#fff' } };
        expect(composeStyles([style])).toBe(style);
    });

    it('composeStyles should merge style list in order', () => {
        const merged = composeStyles([
            { bg: { rgb: '#111' }, bd: { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#000' } } }, bl: 0 },
            { cl: { rgb: '#222' }, bd: { t: { s: BorderStyleTypes.DOUBLE, cl: { rgb: '#fff' } } }, ht: 1 },
            { vt: 2, bl: 1 },
        ]);

        expect(merged).toEqual({
            bg: { rgb: '#111' },
            cl: { rgb: '#222' },
            bd: {
                b: { s: BorderStyleTypes.THIN, cl: { rgb: '#000' } },
                t: { s: BorderStyleTypes.DOUBLE, cl: { rgb: '#fff' } },
            },
            ht: 1,
            vt: 2,
            bl: 1,
        });
    });

    it('RangeThemeStyle should compose style by row/column state', () => {
        const style = new RangeThemeStyle('demo');
        style.setWholeStyle({ bg: { rgb: '#111' } });
        style.setHeaderRowStyle({ cl: { rgb: '#222' } });
        style.setHeaderColumnStyle({ ol: { s: BooleanNumber.TRUE } });
        style.setFirstRowStyle({ bd: { b: { s: BorderStyleTypes.DASHED, cl: { rgb: '#ccc' } } } });
        style.setSecondRowStyle({ bd: { t: { s: BorderStyleTypes.DOTTED, cl: { rgb: '#ddd' } } } });
        style.setFirstColumnStyle({ ht: 1 });
        style.setSecondColumnStyle({ vt: 2 });
        style.setLastRowStyle({ bl: 0 });
        style.setLastColumnStyle({ bg: { rgb: '#999' } });

        expect(style.getName()).toBe('demo');
        expect(style.getStyle(-1, -1, false, false, false)).toBeNull();

        const headerStyle = style.getStyle(0, 0, false, false, false);
        expect(headerStyle).toEqual({
            bg: { rgb: '#111' },
            cl: { rgb: '#222' },
            ol: { s: BooleanNumber.TRUE },
            bd: { t: { s: BorderStyleTypes.DOTTED, cl: { rgb: '#ddd' } } },
            vt: 2,
        });

        const toggledStyle = style.getStyle(1, 1, true, true, true);
        expect(toggledStyle).toEqual({
            bg: { rgb: '#999' },
            bd: { t: { s: BorderStyleTypes.DOTTED, cl: { rgb: '#ddd' } } },
            ht: 1,
            bl: 0,
        });
    });

    it('RangeThemeStyle should cache merged styles and reset cache', () => {
        const style = new RangeThemeStyle('cache', {
            wholeStyle: { bg: { rgb: '#123' } },
            firstRowStyle: { cl: { rgb: '#456' } },
        });

        const first = style.getStyle(1, 1, false, false, false);
        const second = style.getStyle(1, 1, false, false, false);
        expect(first).toBe(second);
        expect((style as unknown as { _mergeCacheMap: Map<number, unknown> })._mergeCacheMap.size).toBeGreaterThan(0);

        style.setLastRowStyle({ bl: 1 });
        expect((style as unknown as { _mergeCacheMap: Map<number, unknown> })._mergeCacheMap.size).toBe(0);
    });

    it('RangeThemeStyle should serialize and deserialize', () => {
        const source = new RangeThemeStyle('json');
        source.setWholeStyle({ bg: { rgb: '#aaa' }, bl: 0 });
        source.setHeaderRowStyle({ cl: { rgb: '#bbb' } });
        source.setSecondColumnStyle({ vt: 1 });
        source.setLastColumnStyle({ ht: 2 });

        const json = source.toJson();
        expect(json).toEqual({
            name: 'json',
            wholeStyle: { bg: { rgb: '#aaa' }, bl: 0 },
            headerRowStyle: { cl: { rgb: '#bbb' } },
            secondColumnStyle: { vt: 1 },
            lastColumnStyle: { ht: 2 },
        });

        const target = new RangeThemeStyle('empty');
        target.fromJson(json);
        expect(target.getName()).toBe('json');
        expect(target.getWholeStyle()).toEqual({ bg: { rgb: '#aaa' }, bl: 0 });
        expect(target.getHeaderRowStyle()).toEqual({ cl: { rgb: '#bbb' } });
        expect(target.getSecondColumnStyle()).toEqual({ vt: 1 });
        expect(target.getLastColumnStyle()).toEqual({ ht: 2 });
    });

    it('dispose should clear internal cache', () => {
        const style = new RangeThemeStyle('dispose', {
            wholeStyle: { bg: { rgb: '#123' } },
        });
        style.getStyle(0, 0, false, false, false);
        expect((style as unknown as { _mergeCacheMap: Map<number, unknown> })._mergeCacheMap.size).toBeGreaterThan(0);
        style.dispose();
        expect((style as unknown as { _mergeCacheMap: Map<number, unknown> })._mergeCacheMap.size).toBe(0);
    });
});
