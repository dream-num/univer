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

import type { ITextStyle } from '@univerjs/core';
import { BaselineOffset, DocumentFlavor } from '@univerjs/core';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { IDocumentSkeletonBoundingBox, IDocumentSkeletonFontStyle } from '../../../basics/i-document-skeleton-cached';
import { getFontStyleString } from '../../../basics/tools';
import { applyFontMetricCompatibility, getDocumentCompatibilityPolicy, getDocumentFontStyle } from '../document-compatibility';
import { createParagraphLayoutTestBed } from '../layout/block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { shaping } from '../layout/block/paragraph/shaping';
import { clearFontCreateConfigCache } from '../layout/tools';

const fontStyle = {
    fontString: 'normal bold 24pt "Calibri", Arial',
    fontSize: 24,
    originFontSize: 24,
    fontFamily: '"Calibri", Arial',
    fontCache: 'normal bold 24pt "Calibri"',
} as IDocumentSkeletonFontStyle;

const bBox = {
    width: 16,
    ba: 30,
    bd: 9,
    aba: 30,
    abd: 9,
    sp: 0,
    sbr: 0.6,
    sbo: 1,
    spr: 0.6,
    spo: 1,
} as IDocumentSkeletonBoundingBox;

describe('document compatibility policy', () => {
    it.each([
        { fontSize: 7.5, wordAdvance: 13.55 },
        { fontSize: 11, wordAdvance: 19.84 },
        { fontSize: 12, wordAdvance: 21.72 },
        { fontSize: 16, wordAdvance: 28.91 },
    ])('retains measured Word DengXian CJK single spacing at $fontSize pt', ({ fontSize, wordAdvance }) => {
        const em = fontSize / 0.75;
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        for (const fontFamily of ['等线', '"Missing East Asian Face", DengXian, Arial']) {
            const style = { ...fontStyle, fontSize, originFontSize: fontSize, fontFamily };
            for (const quantized of [false, true]) {
                const measured = { ...bBox, ba: em * (quantized ? 1660 : 1659) / 2048, bd: em * (quantized ? 476 : 475) / 2048, normalLineHeight: em * 2134 / 2048 };
                const actual = applyFontMetricCompatibility('中', style, measured, traditional);
                // Independent no-grid Word PDF baselines across four sizes and both weights.
                expect(Math.abs(actual.normalLineHeight! - wordAdvance)).toBeLessThan(0.1);
                const { lineLeading, ...fontBox } = actual;
                expect(lineLeading).toBeCloseTo(actual.normalLineHeight! - measured.ba - measured.bd);
                expect({ ...fontBox, normalLineHeight: measured.normalLineHeight }).toEqual(measured);
                expect(applyFontMetricCompatibility('中', style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.MODERN))).toBe(measured);
                expect(applyFontMetricCompatibility('A', style, measured, traditional)).toEqual(actual);
                expect(applyFontMetricCompatibility('\r', style, measured, traditional)).toEqual(actual);
                expect(applyFontMetricCompatibility('中', { ...style, fontFamily: 'Arial' }, measured, traditional)).toBe(measured);
                const larger = { ...measured, normalLineHeight: 60 };
                expect(applyFontMetricCompatibility('中', style, larger, traditional)).toBe(larger);
                const substituted = { ...measured, ba: em, bd: 0 };
                expect(applyFontMetricCompatibility('中', style, substituted, traditional)).toBe(substituted);
            }
        }
    });

    it.each([7.5, 12])('matches native Word YaHei single spacing at %s pt without changing ink metrics', (fontSize) => {
        const em = fontSize / 0.75;
        const measured = { ...bBox, ba: em * 2167 / 2048, bd: em * 536 / 2048, normalLineHeight: em * 2703 / 2048 };
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        for (const fontFamily of ['Microsoft YaHei', '"微软雅黑", Arial, 微软雅黑']) {
            const style = { ...fontStyle, fontSize, originFontSize: fontSize, fontFamily };
            for (const content of ['中', 'H']) {
                const actual = applyFontMetricCompatibility(content, style, measured, traditional);
                // Native PDF coordinates at 96 DPI; tolerate Word's sub-point rounding.
                expect(Math.abs(actual.normalLineHeight! - (fontSize === 7.5 ? 17.12 : 27.52))).toBeLessThan(0.1);
                expect({ ...actual, normalLineHeight: measured.normalLineHeight }).toEqual(measured);
                expect(applyFontMetricCompatibility(content, style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.MODERN))).toBe(measured);
            }
            const larger = { ...measured, normalLineHeight: 60 };
            expect(applyFontMetricCompatibility('H', style, larger, traditional)).toBe(larger);
            const substituted = { ...measured, ba: em, bd: 0 };
            expect(applyFontMetricCompatibility('H', style, substituted, traditional)).toBe(substituted);
            expect(applyFontMetricCompatibility('H', { ...style, fontFamily: 'Arial, Microsoft YaHei' }, measured, traditional)).toBe(measured);
            expect(applyFontMetricCompatibility('H', { ...style, fontFamily: 'Microsoft YaHei UI' }, measured, traditional)).toBe(measured);
        }
    });

    it.each([11, 16])('retains Word MS Gothic auto-leading at %s pt without enlarging the ink box', (fontSize) => {
        const em = fontSize / 0.75;
        const style = { ...fontStyle, fontSize, originFontSize: fontSize, fontFamily: '"MS Gothic", Arial' };
        const measured = { ...bBox, ba: em * 220 / 256, bd: em * 36 / 256, normalLineHeight: em };
        for (const content of ['☐', 'M']) {
            const actual = applyFontMetricCompatibility(content, style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL));
            // Native Word PDF row heights, excluding the 0.5pt table border, at 96 DPI.
            expect(actual.normalLineHeight).toBeCloseTo(fontSize === 11 ? 19.01334 : 27.65334, 1);
            expect({ ...actual, normalLineHeight: em }).toEqual(measured);
            expect(applyFontMetricCompatibility(content, style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.MODERN))).toBe(measured);
        }
        expect(applyFontMetricCompatibility(
            'M',
            { ...style, fontFamily: 'Arial, "MS Gothic"' },
            measured,
            getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL)
        )).toBe(measured);
    });

    it.each([
        { content: '中', measured: 13.329986572265623, expected: 40 / 3 },
        { content: '（', measured: 13.329986572265623, expected: 40 / 3 },
        { content: '𠀀', measured: 13.329986572265623, expected: 40 / 3 },
        { content: 'ｶ', measured: 20 / 3, expected: 20 / 3 },
        { content: '中', measured: 12.5, expected: 12.5 },
        { content: 'A', measured: 13.33, expected: 13.33 },
        { content: '中文', measured: 13.33, expected: 13.33 },
    ])('recovers fractional-em CJK advances without changing proportional glyphs: $content/$measured', ({ content, measured, expected }) => {
        const measuredBox = { ...bBox, width: measured };
        const style = { ...fontStyle, fontSize: 10, originFontSize: 10, fontFamily: 'Microsoft YaHei' };
        const traditional = applyFontMetricCompatibility(content, style, measuredBox, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL));
        expect(traditional.width).toBeCloseTo(expected, 10);
        expect({ ...traditional, width: measured }).toEqual(measuredBox);
        expect(measuredBox.width).toBe(measured);
        expect(applyFontMetricCompatibility(content, style, measuredBox, getDocumentCompatibilityPolicy(DocumentFlavor.MODERN)))
            .toBe(measuredBox);
    });

    it('selects DrawingML font metrics without changing existing document flavors', () => {
        const policy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
        expect(policy.mode).toBe('drawingml');
        expect(applyFontMetricCompatibility('5', fontStyle, bBox, policy)).toEqual(bBox);
        for (const flavor of [undefined, DocumentFlavor.UNSPECIFIED, DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL]) {
            expect(getDocumentCompatibilityPolicy(flavor).mode).not.toBe('drawingml');
        }
    });
    it('applies traditional Word font metric width rules without changing modern documents', () => {
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const modern = getDocumentCompatibilityPolicy(DocumentFlavor.MODERN);

        expect(applyFontMetricCompatibility('5', fontStyle, bBox, traditional).width).toBeCloseTo(14.72);
        expect(applyFontMetricCompatibility('5', fontStyle, bBox, modern).width).toBe(16);
    });

    it('preserves measured Arial advances instead of narrowing Latin text in traditional documents', () => {
        const normalArial = {
            ...fontStyle,
            fontString: 'normal normal 11.5pt Arial',
            fontSize: 11.5,
            originFontSize: 11.5,
            fontFamily: 'Arial',
            fontCache: 'normal normal 11.5pt Arial',
        } as IDocumentSkeletonFontStyle;
        const boldArial = {
            ...normalArial,
            fontString: 'normal bold 11.5pt Arial',
            fontCache: 'normal bold 11.5pt Arial',
        } as IDocumentSkeletonFontStyle;
        const browserMeasuredGlyph = { ...bBox, width: 10 };
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const modern = getDocumentCompatibilityPolicy(DocumentFlavor.MODERN);

        for (const content of ['A', '0', '1', '8', ' ', '“']) {
            expect(applyFontMetricCompatibility(content, normalArial, browserMeasuredGlyph, traditional)).toBe(browserMeasuredGlyph);
        }
        expect(applyFontMetricCompatibility('A', boldArial, browserMeasuredGlyph, traditional).width).toBe(10);
        expect(applyFontMetricCompatibility('A', normalArial, browserMeasuredGlyph, modern).width).toBe(10);
        expect(applyFontMetricCompatibility('中', normalArial, browserMeasuredGlyph, traditional).width).toBe(10);
    });

    it.each([7.5, 11, 12, 16])('retains Word single-spacing leading for actual SimSun metrics at %spt', (size) => {
        const em = size / 0.75;
        const style = {
            ...fontStyle,
            fontFamily: 'SimSun',
            fontString: `normal normal ${size}pt SimSun`,
            fontSize: size,
            originFontSize: size,
        };
        const measured = { ...bBox, ba: em * 0.875, bd: em * 0.125, normalLineHeight: em * 1.14 };
        for (const text of ['A', '中']) {
            const actual = applyFontMetricCompatibility(text, style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL));
            expect(actual.normalLineHeight).toBeCloseTo(em * 1.3);
            expect(actual.ba).toBe(measured.ba);
            expect(actual.bd).toBe(measured.bd);
            expect(applyFontMetricCompatibility(text, style, measured, getDocumentCompatibilityPolicy(DocumentFlavor.MODERN)).normalLineHeight)
                .toBe(measured.normalLineHeight);
        }
        expect(applyFontMetricCompatibility('A', style, { ...measured, ba: em }, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL)).normalLineHeight)
            .toBe(measured.normalLineHeight);
        expect(applyFontMetricCompatibility('A', { ...style, fontFamily: 'Arial, SimSun' }, measured, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL)).normalLineHeight)
            .toBe(measured.normalLineHeight);
    });

    it('applies the traditional SimSun width policy when it is the East Asia fallback family', () => {
        const simSunFallback = {
            ...fontStyle,
            fontString: 'normal normal 12pt "Times New Roman", 宋体',
            fontSize: 12,
            originFontSize: 12,
            fontFamily: '"Times New Roman", 宋体',
            fontCache: 'normal normal 12pt "Times New Roman", 宋体',
        } as IDocumentSkeletonFontStyle;
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);

        expect(applyFontMetricCompatibility('中', simSunFallback, { ...bBox, width: 10 }, traditional).width)
            .toBeCloseTo(9.7);
    });

    it('keeps traditional layout behavior while allowing font metric scaling to be disabled', () => {
        const policy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL, false);
        const simSunFallback = {
            ...fontStyle,
            fontString: 'normal normal 12pt "Times New Roman", 宋体',
            fontSize: 12,
            originFontSize: 12,
            fontFamily: '"Times New Roman", 宋体',
            fontCache: 'normal normal 12pt "Times New Roman", 宋体',
        } as IDocumentSkeletonFontStyle;

        expect(policy.mode).toBe('traditional');
        expect(policy.useWordStyleLineHeight).toBe(true);
        expect(applyFontMetricCompatibility('中', simSunFallback, { ...bBox, width: 10 }, policy).width).toBe(10);
    });
});

interface IWordScriptFontControl {
    family: string;
    nominalBodySizePoints: number;
    baselineOffset: BaselineOffset;
    actualWordPdfSizePoints: number;
}

const controls: { glyphs: IWordScriptFontControl[] } = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures/word-script-font-sizes.json'), 'utf8'));

describe('Word document script font sizes', () => {
    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL].flatMap((flavor) => controls.glyphs.map((control) => ({ ...control, flavor }))))('matches actual Word PDF sizes ($flavor/$family/$nominalBodySizePoints/$baselineOffset)', ({ family, nominalBodySizePoints, baselineOffset, actualWordPdfSizePoints, flavor }) => {
        const style: ITextStyle = { ff: family, fs: nominalBodySizePoints, va: baselineOffset };
        const original = { ...style };
        const actual = getDocumentFontStyle(style, undefined, undefined, getDocumentCompatibilityPolicy(flavor));
        expect(Math.abs(actual.fontSize - actualWordPdfSizePoints)).toBeLessThan(0.061);
        expect(actual.originFontSize).toBe(nominalBodySizePoints);
        expect(actual.fontCache).toContain(`${actual.fontSize}pt`);
        expect(style).toEqual(original);
    });

    it.each([undefined, DocumentFlavor.DRAWINGML])('preserves existing script metrics without a Word document policy (%s)', (flavor) => {
        const style = { ff: 'Arial', fs: 10, va: BaselineOffset.SUPERSCRIPT };
        expect(getDocumentFontStyle(style, undefined, undefined, getDocumentCompatibilityPolicy(flavor))).toEqual(getFontStyleString(style));
        expect(getFontStyleString(style).fontSize).toBe(6);
    });

    it('retains the existing fallback for an unverified font face', () => {
        const style = { ff: 'Unverified Script Face', fs: 10, va: BaselineOffset.SUPERSCRIPT };
        expect(getDocumentFontStyle(style, undefined, undefined, getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL))).toEqual(getFontStyleString(style));
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('uses inherited script sizing through Latin and East Asian glyph shaping (%s)', (flavor) => {
        const bed = createParagraphLayoutTestBed('3中', {
            documentStyle: { documentFlavor: flavor, textStyle: { ff: 'Arial', fs: 10 } },
            body: { textRuns: [{ st: 0, ed: 2, ts: { va: BaselineOffset.SUPERSCRIPT, eastAsiaFontFamily: 'SimSun' } }] },
        });
        try {
            clearFontCreateConfigCache();
            bed.sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(flavor);
            const before = JSON.stringify(bed.dataModel.getSnapshot());
            const glyphs = shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig).flatMap((item) => item.glyphs);
            for (const [content, family] of [['3', 'Arial'], ['中', 'SimSun']]) {
                const expected = controls.glyphs.find((control) => control.family === family && control.nominalBodySizePoints === 10 && control.baselineOffset === BaselineOffset.SUPERSCRIPT)!;
                const actual = glyphs.find((glyph) => glyph.content === content)!;
                expect(Math.abs(actual.fontStyle!.fontSize - expected.actualWordPdfSizePoints)).toBeLessThan(0.061);
                expect(actual.fontStyle!.originFontSize).toBe(10);
                expect(actual.ts).toMatchObject({ fs: 10, va: BaselineOffset.SUPERSCRIPT });
            }
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(before);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
            clearFontCreateConfigCache();
        }
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL].flatMap((flavor) => ['Arial', 'SimSun'].map((family) => ({ flavor, family }))))('uses Word sizing for generated note-body labels ($flavor/$family)', ({ flavor, family }) => {
        const bed = createParagraphLayoutTestBed('Note body', {
            documentStyle: { documentFlavor: flavor, textStyle: { ff: family, fs: 10 } },
        });
        try {
            clearFontCreateConfigCache();
            bed.sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(flavor);
            const before = JSON.stringify(bed.dataModel.getSnapshot());
            bed.ctx.noteLabel = '3';
            const glyphs = shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig).flatMap((item) => item.glyphs);
            const label = glyphs.find((glyph) => glyph.content === '3' && glyph.count === 0)!;
            const expected = controls.glyphs.find((control) => control.family === family && control.nominalBodySizePoints === 10 && control.baselineOffset === BaselineOffset.SUPERSCRIPT)!;
            expect(Math.abs(label.fontStyle!.fontSize - expected.actualWordPdfSizePoints)).toBeLessThan(0.061);
            expect(label.fontStyle!.originFontSize).toBe(10);
            expect(label.ts).toMatchObject({ fs: 10, va: BaselineOffset.SUPERSCRIPT });
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(before);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
            clearFontCreateConfigCache();
        }
    });
});
