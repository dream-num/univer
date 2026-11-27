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
import { CustomRangeType, DataStreamTreeTokenType } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import { formatNoteNumber } from './note-numbering';

export function resolveHeaderFooterFieldGlyph(
    glyph: IDocumentSkeletonGlyph,
    startIndex: number,
    endIndex: number,
    customRanges: ICustomRange[],
    pageNumber: number,
    pageCount: number | undefined,
    pageNumberFormat?: string
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
    if (!fieldRange || (fieldType !== 'PAGE' && fieldType !== 'NUMPAGES')) {
        return glyph;
    }
    if (fieldType === 'NUMPAGES' && pageCount == null) {
        return glyph;
    }
    // FIELD endpoints are invisible sentinels. Paint the value once even when
    // the cached digits were split into several differently formatted runs.
    let content = '';
    if (startIndex === fieldRange.startIndex + 1) {
        const number = fieldType === 'PAGE' ? pageNumber : pageCount!;
        content = formatNoteNumber(number, fieldType === 'PAGE' ? pageNumberFormat : undefined);
        const instruction = String(fieldRange.properties?.instruction ?? '');
        for (const match of instruction.matchAll(/\\\*\s*(?:"([^"]*)"|([^\s\\]+))/g)) {
            const format = match[1] ?? match[2];
            if (/^ARABIC$/i.test(format)) {
                content = String(number);
            } else if (/^ROMAN$/i.test(format)) {
                content = formatNoteNumber(number, format === 'roman' ? 'lowerRoman' : 'upperRoman');
            } else if (/^ALPHABETIC$/i.test(format)) {
                content = formatNoteNumber(number, format === 'alphabetic' ? 'lowerLetter' : 'upperLetter');
            } else if (/^Upper$/i.test(format)) {
                content = content.toUpperCase();
            } else if (/^Lower$/i.test(format)) {
                content = content.toLowerCase();
            } else if (!/^(MERGEFORMAT|CHARFORMAT)$/i.test(format)) {
                return glyph;
            }
        }
    }

    return content === glyph.content ? glyph : { ...glyph, content };
}
