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

import type { IDocumentBody } from '../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('TextX tables', () => {
    it('shifts table metadata when content is inserted at the table start boundary', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}B${T.PARAGRAPH}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 1, paragraphId: 'before' },
                { startIndex: 6, paragraphId: 'cell' },
            ],
            sectionBreaks: [{ startIndex: 10 }],
            tables: [{ startIndex: 2, endIndex: 9, tableId: 'table-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 2 },
            {
                t: TextXActionType.INSERT,
                body: {
                    dataStream: T.PARAGRAPH,
                    paragraphs: [{ startIndex: 0, paragraphId: 'inserted' }],
                },
                len: 1,
            },
        ]);

        expect(body.dataStream).toBe(`A${T.PARAGRAPH}${T.PARAGRAPH}${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}B${T.PARAGRAPH}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 3, endIndex: 10, tableId: 'table-1' }]);
    });
});
