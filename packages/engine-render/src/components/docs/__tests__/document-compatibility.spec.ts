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

import type { IDocumentSkeletonBoundingBox, IDocumentSkeletonFontStyle } from '../../../basics/i-document-skeleton-cached';
import { DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { applyFontMetricCompatibility, getDocumentCompatibilityPolicy } from '../document-compatibility';

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
    it('applies traditional Word font metric width rules without changing modern documents', () => {
        const traditional = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const modern = getDocumentCompatibilityPolicy(DocumentFlavor.MODERN);

        expect(applyFontMetricCompatibility('5', fontStyle, bBox, traditional).width).toBeCloseTo(14.72);
        expect(applyFontMetricCompatibility('5', fontStyle, bBox, modern).width).toBe(16);
    });

    it('scales only non-bold primary Arial Latin glyphs in traditional documents', () => {
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

        expect(applyFontMetricCompatibility('A', normalArial, browserMeasuredGlyph, traditional).width).toBeCloseTo(9.8);
        expect(applyFontMetricCompatibility('A', boldArial, browserMeasuredGlyph, traditional).width).toBe(10);
        expect(applyFontMetricCompatibility('A', normalArial, browserMeasuredGlyph, modern).width).toBe(10);
        expect(applyFontMetricCompatibility('中', normalArial, browserMeasuredGlyph, traditional).width).toBe(10);
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
});
