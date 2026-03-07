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

import { BaselineOffset, BooleanNumber, GridType, NumberUnitType, Rectangle, Tools } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FontCache } from '../../components/docs/layout/shaping-engine/font-cache';
import {
    cancelRequestFrame,
    checkStyle,
    clampRange,
    createCanvasElement,
    createImageElement,
    degToRad,
    expandRangeIfIntersects,
    fixLineWidthByScale,
    generateRandomKey,
    getCellPositionByIndex,
    getColor,
    getDPI,
    getFontStyleString,
    getPointerPrefix,
    getScale,
    getSizeForDom,
    getSystemHighlightColor,
    getValueType,
    hasAllLatin,
    hasArabic,
    hasBasicLatin,
    hasCJK,
    hasCJKPunctuation,
    hasCJKText,
    hasLatinExtendedA,
    hasLatinExtendedB,
    hasLatinOneSupplement,
    hasSpace,
    hasTibetan,
    hasUnMergedCellInRow,
    injectStyle,
    inViewRanges,
    isArray,
    isCjkCenterAlignedPunctuation,
    isCjkLeftAlignedPunctuation,
    isCjkRightAlignedPunctuation,
    isDate,
    isFunction,
    isNumber,
    isObject,
    isRectIntersect,
    isRegExp,
    IsSafari,
    isString,
    mergeInfoOffset,
    pixelToPt,
    precisionTo,
    ptToMM,
    ptToPixel,
    ptToPx,
    pxToInch,
    pxToNum,
    pxToPt,
    radToDeg,
    requestNewFrame,
    startWithEmoji,
    toPx,
} from '../tools';

describe('tools extra', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('handles colors, unit conversion and precision helpers', () => {
        expect(getColor([1, 2, 3])).toBe('rgb(1,2,3)');
        expect(getColor([1, 2, 3], 0.5)).toBe('rgba(1,2,3,0.5)');
        expect(getColor(undefined as any)).toBe('rgb(0,0,0)');

        expect(toPx(10, 100)).toBe(10);
        expect(toPx('50%', 200)).toBe(100);
        expect(toPx('invalid', 100)).toBe(0);

        expect(radToDeg(Math.PI)).toBeCloseTo(180);
        expect(degToRad(180)).toBeCloseTo(Math.PI);
        expect(precisionTo(1.2345, 2)).toBe(1.23);
        expect(fixLineWidthByScale(7, 2)).toBe(7);
    });

    it('uses request/cancel frame fallbacks and DOM factories', () => {
        const requester = {
            requestPostAnimationFrame: vi.fn(() => 11),
            cancelPostAnimationFrame: vi.fn(),
        };
        const frameId = requestNewFrame(() => null, requester);
        expect(frameId).toBe(11);
        cancelRequestFrame(frameId, requester);
        expect(requester.cancelPostAnimationFrame).toHaveBeenCalledWith(11);

        const requester2 = {
            requestAnimationFrame: vi.fn(() => 12),
            cancelAnimationFrame: vi.fn(),
        };
        expect(requestNewFrame(() => null, requester2)).toBe(12);
        cancelRequestFrame(12, requester2);
        expect(requester2.cancelAnimationFrame).toHaveBeenCalledWith(12);

        expect(createCanvasElement().tagName).toBe('CANVAS');
        expect(createImageElement().tagName).toBe('IMG');
    });

    it('detects pointer prefix and browser helpers', () => {
        const browserSpy = vi.spyOn(Tools, 'getBrowserType');
        browserSpy.mockReturnValue('safari' as any);
        expect(IsSafari()).toBe(true);
        browserSpy.mockReturnValue('chrome' as any);
        expect(IsSafari()).toBe(false);

        const tabletSpy = vi.spyOn(Tools, 'isTablet').mockReturnValue(false);
        const iphoneSpy = vi.spyOn(Tools, 'isIPhone').mockReturnValue(false);
        const originalPointer = (window as any).PointerEvent;
        (window as any).PointerEvent = undefined;

        expect(getPointerPrefix()).toBe('mouse');

        tabletSpy.mockReturnValue(true);
        expect(getPointerPrefix()).toBe('mouse');

        (window as any).PointerEvent = originalPointer;
        tabletSpy.mockRestore();
        iphoneSpy.mockRestore();
    });

    it('handles random key and type predicates', () => {
        const key = generateRandomKey('shape', 4);
        expect(key.startsWith('shape_')).toBe(true);

        expect(getValueType('a')).toBe('[object String]');
        expect(isFunction(() => null)).toBe(true);
        expect(isDate(new Date())).toBe(true);
        expect(isRegExp(/a/)).toBe(true);
        expect(isArray([1, 2])).toBe(true);
        expect(isString('abc')).toBe(true);
        expect(isNumber(123)).toBe(true);
        expect(isObject({ a: 1 })).toBe(true);
    });

    it('builds font styles and language detectors', () => {
        const baselineSpy = vi.spyOn(FontCache, 'getBaselineOffsetInfo').mockReturnValue({ sbr: 0.5, spr: 0.6 } as any);

        const defaultStyle = getFontStyleString();
        expect(defaultStyle.fontString).toContain('pt');

        const subscript = getFontStyleString({
            it: 1,
            bl: 1,
            fs: 12,
            ff: 'Open Sans',
            va: BaselineOffset.SUBSCRIPT,
        } as any);
        expect(subscript.fontFamily).toBe('"Open Sans"');
        expect(subscript.fontSize).toBeCloseTo(6);

        const superscript = getFontStyleString({
            fs: 12,
            ff: 'Arial',
            va: BaselineOffset.SUPERSCRIPT,
        } as any);
        expect(superscript.fontSize).toBeCloseTo(7.2);
        expect(baselineSpy).toHaveBeenCalled();

        expect(hasCJKText('中文')).toBe(true);
        expect(hasCJK('。')).toBe(true);
        expect(hasCJKPunctuation('，')).toBe(true);
        expect(hasAllLatin('abc')).toBe(true);
        expect(hasBasicLatin('A')).toBe(true);
        expect(hasLatinOneSupplement('é')).toBe(true);
        expect(hasLatinExtendedA('Ā')).toBe(true);
        expect(hasLatinExtendedB('Ȁ')).toBe(true);
        expect(startWithEmoji('😀abc')).toBe(true);
        expect(hasArabic('مرحبا')).toBe(true);
        expect(hasTibetan('Ȁ')).toBe(true);
        expect(hasSpace('a b')).toBe(true);
        expect(isCjkLeftAlignedPunctuation('。')).toBe(true);
        expect(isCjkRightAlignedPunctuation('（')).toBe(true);
        expect(isCjkCenterAlignedPunctuation('·')).toBe(true);
    });

    it('handles dpi and geometric conversion helpers', () => {
        const matchMediaMock = vi.fn((query: string) => ({
            matches: query.includes('96dpi'),
        }));
        vi.stubGlobal('matchMedia', matchMediaMock);

        const dpi = getDPI();
        expect(dpi).toBeGreaterThan(0);
        expect(ptToPx(72)).toBeGreaterThan(0);
        expect(pxToPt(96)).toBeGreaterThan(0);
        expect(ptToMM(10)).toBeGreaterThan(0);
        expect(pxToInch(10)).toBeGreaterThan(0);

        expect(ptToPixel(8)).toBeCloseTo(10.6666666667);
        expect(pixelToPt(8)).toBe(6);
        expect(getScale({ scaleX: 2, scaleY: 3 })).toBe(3);
    });

    it('handles range and cell geometry helpers', () => {
        expect(getCellPositionByIndex(1, 1, [10, 20], [5, 10])).toEqual({
            startY: 10,
            endY: 20,
            startX: 5,
            endX: 10,
        });

        const mergeData = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
        expect(hasUnMergedCellInRow(0, 0, 2, mergeData as any)).toBe(true);
        expect(hasUnMergedCellInRow(0, 0, 1, mergeData as any)).toBe(false);

        expect(mergeInfoOffset({
            startY: 1,
            endY: 2,
            startX: 3,
            endX: 4,
        } as any, 10, 20)).toEqual(expect.objectContaining({
            startY: 21,
            endY: 22,
            startX: 13,
            endX: 14,
        }));

        expect(isRectIntersect(
            { left: 0, top: 0, right: 10, bottom: 10 },
            { left: 5, top: 5, right: 20, bottom: 20 }
        )).toBe(true);
        expect(isRectIntersect(
            { left: 0, top: 0, right: 4, bottom: 4 },
            { left: 5, top: 5, right: 20, bottom: 20 }
        )).toBe(false);

        expect(inViewRanges([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }], 2, 2)).toBe(true);
        expect(inViewRanges([{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }], 3, 2)).toBe(false);

        const intersects = expandRangeIfIntersects(
            [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }, { startRow: 5, endRow: 6, startColumn: 5, endColumn: 6 }]
        );
        expect(intersects).toHaveLength(2);
        expect(Rectangle.simpleRangesIntersect(intersects[0], intersects[1])).toBe(true);

        expect(clampRange({ startRow: -1, endRow: 9, startColumn: -2, endColumn: 10 }, 5, 6)).toEqual({
            startRow: 0,
            endRow: 5,
            startColumn: 0,
            endColumn: 6,
        });
    });

    it('handles style insertion and DOM size helpers', () => {
        injectStyle(['.tool-extra-test{color:red;}']);
        expect(checkStyle('tool-extra-test')).toBe(false);
        const style = document.createElement('style');
        style.textContent = '.tool-extra-test-manual{color:blue;}';
        document.head.append(style);
        expect(checkStyle('tool-extra-test-manual')).toBe(true);

        expect(pxToNum('12px')).toBe(12);
        const el = document.createElement('div');
        document.body.append(el);
        const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
            borderTopWidth: '1px',
            borderLeftWidth: '2px',
            borderRightWidth: '3px',
            borderBottomWidth: '4px',
            width: '20px',
            height: '30px',
        } as any);
        expect(getSizeForDom(el)).toEqual({
            top: 1,
            left: 2,
            right: 3,
            bottom: 4,
            width: 20,
            height: 30,
        });
        styleSpy.mockRestore();

        const highlight = getSystemHighlightColor();
        expect(highlight).toEqual(expect.objectContaining({
            r: expect.any(Number),
            g: expect.any(Number),
            b: expect.any(Number),
        }));
    });

    it('keeps core enum imports consistent for helpers coverage', () => {
        expect(GridType.LINES).toBeGreaterThanOrEqual(0);
        expect(BooleanNumber.TRUE).toBe(1);
        expect(NumberUnitType.PIXEL).toBeGreaterThanOrEqual(0);
    });
});
