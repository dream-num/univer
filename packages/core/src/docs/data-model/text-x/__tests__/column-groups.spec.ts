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
import type { TextXAction } from '../action-types';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { TextX } from '../text-x';

describe('TextX column groups', () => {
    it('adds inserted column group metadata to documents without existing column groups', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'before' }],
            sectionBreaks: [{ startIndex: 2 }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 2 },
            {
                t: TextXActionType.INSERT,
                len: 5,
                body: {
                    dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}`,
                    paragraphs: [{ startIndex: 2, paragraphId: 'column' }],
                    columnGroups: [{ startIndex: 0, endIndex: 4, columnGroupId: 'cg-1' }],
                },
            },
        ]);

        expect(body.columnGroups).toEqual([{ startIndex: 2, endIndex: 6, columnGroupId: 'cg-1' }]);
    });

    it('expands a containing column group when text is inserted into a column', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'left' },
                { startIndex: 5, paragraphId: 'right' },
            ],
            sectionBreaks: [{ startIndex: 8 }],
            columnGroups: [{ startIndex: 0, endIndex: 7, columnGroupId: 'cg-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 2 },
            { t: TextXActionType.INSERT, body: { dataStream: 'Alpha' }, len: 5 },
        ]);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}Alpha${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([7, 10]);
        expect(body.sectionBreaks?.[0].startIndex).toBe(13);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 12, columnGroupId: 'cg-1' }]);
    });

    it('keeps a column group wrapped when text is inserted before the closing boundary token', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 3, paragraphId: 'left' },
                { startIndex: 7, paragraphId: 'right' },
                { startIndex: 9, paragraphId: 'after' },
            ],
            sectionBreaks: [{ startIndex: 10 }],
            columnGroups: [{ startIndex: 0, endIndex: 9, columnGroupId: 'cg-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 9 },
            { t: TextXActionType.INSERT, body: { dataStream: T.PARAGRAPH, paragraphs: [{ startIndex: 0, paragraphId: 'inserted' }] }, len: 1 },
        ]);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.PARAGRAPH}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 10, columnGroupId: 'cg-1' }]);
    });

    it('returns deleted column groups in delete undo bodies', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'left' }],
            sectionBreaks: [{ startIndex: 5 }],
            columnGroups: [{ startIndex: 0, endIndex: 4, columnGroupId: 'cg-1' }],
        };
        const actions: TextXAction[] = [
            { t: TextXActionType.DELETE, len: 5 },
        ];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.columnGroups).toEqual([]);
        expect(actions[0].body?.columnGroups).toEqual([{ startIndex: 0, endIndex: 4, columnGroupId: 'cg-1' }]);
    });
});
