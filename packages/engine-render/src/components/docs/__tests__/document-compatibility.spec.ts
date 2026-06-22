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
});
