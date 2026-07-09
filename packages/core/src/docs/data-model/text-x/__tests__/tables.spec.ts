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
import { BuildTextUtils } from '../build-utils';
import { TextX } from '../text-x';
import { getBodySliceForTextXAction } from '../utils';

describe('TextX tables', () => {
    it('does not include table metadata when slicing text inside an existing table', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 12, paragraphId: 'after-table' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 13 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        const slice = getBodySliceForTextXAction(body, 4, 8, false);

        expect(slice.dataStream).toBe(`ell${T.PARAGRAPH}`);
        expect(slice.tables).toBeUndefined();
    });

    it('includes table metadata in action bodies only when the full table range is sliced', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 12, paragraphId: 'after-table' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 13 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        const slice = getBodySliceForTextXAction(body, 0, 12, false);

        expect(slice.tables).toEqual([{ startIndex: 0, endIndex: 12, tableId: 'table-1' }]);
    });

    it('adds inserted table metadata to documents without existing tables', () => {
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
                body: {
                    dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}B${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}`,
                    paragraphs: [
                        { startIndex: 4, paragraphId: 'cell' },
                        { startIndex: 9, paragraphId: 'after-table' },
                    ],
                    sectionBreaks: [{ startIndex: 5 }],
                    tables: [{ startIndex: 0, endIndex: 9, tableId: 'table-1' }],
                },
                len: 10,
            },
        ]);

        expect(body.tables).toEqual([{ startIndex: 2, endIndex: 11, tableId: 'table-1' }]);
    });

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

    it('shifts table metadata when text is inserted inside a table cell', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 18, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 19 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 6 },
            {
                t: TextXActionType.INSERT,
                body: { dataStream: '++' },
                len: 2,
            },
        ]);

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cel++l${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 14, tableId: 'table-1' }]);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([9, 20]);
    });

    it('shifts table end metadata when text is inserted before the paragraph after a table', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 12, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 13 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 12 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊手' }, len: 2 },
        ]);

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}啊手${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 14, tableId: 'table-1' }]);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([7, 14]);
    });

    it('keeps table metadata aligned after composing IME updates inside a table cell', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 18, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 19 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        const firstUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 6 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊' }, len: 1 },
        ];
        const secondUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 6 },
            { t: TextXActionType.DELETE, len: 1 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊手' }, len: 2 },
        ];

        TextX.apply(body, TextX.compose(firstUpdate, secondUpdate));

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cel啊手l${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 14, tableId: 'table-1' }]);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([9, 20]);
    });

    it('keeps table metadata aligned after composing insert-then-delete IME updates inside a table cell', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 18, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { startIndex: 8 },
                { startIndex: 19 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        const firstUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 6 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊' }, len: 1 },
        ];
        const secondUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 6 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊手' }, len: 2 },
            { t: TextXActionType.DELETE, len: 1 },
        ];

        TextX.apply(body, TextX.compose(firstUpdate, secondUpdate));

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cel啊手l${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}After${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 14, tableId: 'table-1' }]);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([9, 20]);
    });

    it('keeps a minimum paragraph and section break when replacing all text in a table cell', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}A${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 4, paragraphId: 'cell' }],
            sectionBreaks: [
                { startIndex: 5 },
                { startIndex: 9 },
            ],
            tables: [{ startIndex: 0, endIndex: 8, tableId: 'table-1' }],
        };

        const actions = BuildTextUtils.selection.delete(
            [{ startOffset: 3, endOffset: 6, collapsed: false }],
            body,
            0,
            { dataStream: 'X' }
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}X${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([4]);
        expect(body.sectionBreaks?.map((sectionBreak) => sectionBreak.startIndex)).toEqual([5, 9]);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 8, tableId: 'table-1' }]);
    });
});
