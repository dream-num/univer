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
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import { BooleanNumber, CustomRangeType, DataStreamTreeTokenType } from '@univerjs/core';

export function resolveHeaderFooterFieldGlyph(
    glyph: IDocumentSkeletonGlyph,
    startIndex: number,
    endIndex: number,
    customRanges: ICustomRange[],
    pageNumber: number,
    pageCount: number | undefined
): IDocumentSkeletonGlyph {
    if (!glyph.content || glyph.raw === DataStreamTreeTokenType.CUSTOM_RANGE_START ||
        glyph.raw === DataStreamTreeTokenType.CUSTOM_RANGE_END) {
        return glyph;
    }
    const fieldRange = customRanges.find((customRange) =>
        customRange.rangeType === CustomRangeType.FIELD &&
        customRange.startIndex <= startIndex &&
        customRange.endIndex >= endIndex &&
        typeof customRange.properties?.fieldType === 'string'
    );
    const fieldType = fieldRange?.properties?.fieldType?.toUpperCase();
    if (!fieldRange || fieldRange.properties?.locked === BooleanNumber.TRUE || (fieldType !== 'PAGE' && fieldType !== 'NUMPAGES')) {
        return glyph;
    }
    if (fieldType === 'NUMPAGES' && pageCount == null) {
        return glyph;
    }
    // FIELD endpoints are invisible sentinels. Paint the value once even when
    // the cached digits were split into several differently formatted runs.
    let content = '';
    if (startIndex === fieldRange.startIndex + 1) {
        content = String(fieldType === 'PAGE' ? pageNumber : pageCount);
    }

    return content === glyph.content ? glyph : { ...glyph, content };
}
