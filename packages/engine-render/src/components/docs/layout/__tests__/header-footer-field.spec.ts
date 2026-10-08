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

import type { ICustomRange } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../basics/i-document-skeleton-cached';
import { BooleanNumber, CustomRangeType } from '@univerjs/core';
import { expect, it } from 'vitest';
import { resolveHeaderFooterFieldGlyph } from '../header-footer-field';

it('resolves numeric fields without changing cached glyphs and preserves locked or pending values', () => {
    const glyph = { content: '1' } as IDocumentSkeletonGlyph;
    const pageRange: ICustomRange = { rangeId: 'page', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 2, properties: { fieldType: 'PAGE' } };
    const pageCountRange = { ...pageRange, properties: { fieldType: 'NUMPAGES' } };
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageRange], 15, 16).content).toBe('15');
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageCountRange], 15, 16).content).toBe('16');
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageCountRange], 15, undefined)).toBe(glyph);
    expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [{ ...pageRange, properties: { fieldType: 'PAGE', locked: BooleanNumber.TRUE } }], 15, 16)).toBe(glyph);
    expect(glyph.content).toBe('1');
});
