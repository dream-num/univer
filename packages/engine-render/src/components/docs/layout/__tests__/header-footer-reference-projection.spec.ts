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

import type { IDocumentBody } from '@univerjs/core';
import { CustomRangeType, DataStreamTreeTokenType, TextX, Tools } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getHeaderFooterReferenceOffsetMap } from '../header-footer-reference-projection';

describe('header/footer reference projection', () => {
    it('keeps unchanged directory text and nested field boundaries at their editable offsets', () => {
        const start = DataStreamTreeTokenType.CUSTOM_RANGE_START;
        const end = DataStreamTreeTokenType.CUSTOM_RANGE_END;
        const prefix = 'OLD_ENTRY ';
        const dataStream = `${start}${prefix}${start}999${end} tail${end}\r\n`;
        const childStart = 1 + prefix.length;
        const original: IDocumentBody = {
            dataStream,
            customRanges: [
                { rangeId: 'directory', rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: dataStream.length - 3, properties: { instruction: 'TOC' } },
                { rangeId: 'page', rangeType: CustomRangeType.FIELD, startIndex: childStart, endIndex: childStart + 4, properties: { instruction: 'PAGEREF target' } },
            ],
        };
        const actions = new TextX().retain(childStart + 1).delete(3).insert(1, { dataStream: '2' }).serialize();
        const projected = TextX.apply(Tools.deepClone(original), actions);
        const offsets = getHeaderFooterReferenceOffsetMap(original, projected)!;
        expect(offsets).toBeDefined();
        for (let index = 0; index <= childStart; index++) {
            expect(offsets[index], `unchanged prefix offset ${index}`).toBe(index);
        }
        expect(offsets[childStart + 1]).toBe(childStart + 1);
        expect(offsets[childStart + 2]).toBe(childStart + 4);
        const afterChild = childStart + 3;
        for (let index = afterChild; index <= projected.dataStream.length; index++) {
            expect(offsets[index], `unchanged suffix offset ${index}`).toBe(index + 2);
        }
    });
});
