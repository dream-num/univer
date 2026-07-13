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
                { sectionId: 'section_fixture_36', startIndex: 8 },
                { sectionId: 'section_fixture_37', startIndex: 13 },
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
                { sectionId: 'section_fixture_38', startIndex: 8 },
                { sectionId: 'section_fixture_39', startIndex: 13 },
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
            sectionBreaks: [{ sectionId: 'section_fixture_40', startIndex: 2 }],
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
                    sectionBreaks: [{ sectionId: 'section_fixture_41', startIndex: 5 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_42', startIndex: 10 }],
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
                { sectionId: 'section_fixture_43', startIndex: 8 },
                { sectionId: 'section_fixture_44', startIndex: 19 },
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

    it('keeps the half-open table end fixed when text is inserted after a table', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 12, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_45', startIndex: 8 },
                { sectionId: 'section_fixture_46', startIndex: 13 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 12 },
            { t: TextXActionType.INSERT, body: { dataStream: '啊手' }, len: 2 },
        ]);

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}啊手${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 12, tableId: 'table-1' }]);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([7, 14]);
    });

    it('removes table metadata when exactly the half-open table token range is deleted', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const body: IDocumentBody = {
            dataStream: `${tableStream}After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: tableStream.length + 5, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_47', startIndex: 8 },
                { sectionId: 'section_fixture_48', startIndex: tableStream.length + 6 },
            ],
            tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'table-1' }],
        };
        const actions: TextXAction[] = [{ t: TextXActionType.DELETE, len: tableStream.length }];

        TextX.makeInvertible(actions, body);
        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`After${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([]);
        expect(actions[0].body?.tables).toEqual([{ startIndex: 0, endIndex: tableStream.length, tableId: 'table-1' }]);
    });

    it('keeps a following column group outside the table when typing at the table end', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const columnGroupStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}Lane${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`;
        const tableEnd = tableStream.length;
        const columnGroupStart = tableEnd + 1;
        const body: IDocumentBody = {
            dataStream: `${tableStream}${T.PARAGRAPH}${columnGroupStream}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: tableEnd, paragraphId: 'after-table' },
                { startIndex: columnGroupStart + 6, paragraphId: 'column' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_49', startIndex: 8 },
                { sectionId: 'section_fixture_50', startIndex: columnGroupStart + columnGroupStream.length - 1 },
            ],
            tables: [{ startIndex: 0, endIndex: tableEnd, tableId: 'table-1' }],
            columnGroups: [{
                startIndex: columnGroupStart,
                endIndex: columnGroupStart + columnGroupStream.length - 2,
                columnGroupId: 'column-group-1',
            }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: tableEnd },
            { t: TextXActionType.INSERT, body: { dataStream: 'After' }, len: 5 },
        ]);

        expect(body.tables).toEqual([{ startIndex: 0, endIndex: tableEnd, tableId: 'table-1' }]);
        expect(body.columnGroups).toEqual([{
            startIndex: columnGroupStart + 5,
            endIndex: columnGroupStart + columnGroupStream.length + 3,
            columnGroupId: 'column-group-1',
        }]);
        expect(body.dataStream.slice(tableEnd, tableEnd + 5)).toBe('After');
        expect(body.dataStream[tableEnd + 5]).toBe(T.PARAGRAPH);
    });

    it('keeps the table end fixed across composed IME updates after a table', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'cell' },
                { startIndex: 12, paragraphId: 'after' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_51', startIndex: 8 },
                { sectionId: 'section_fixture_52', startIndex: 13 },
            ],
            tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
        };
        const firstUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 12 },
            { t: TextXActionType.INSERT, body: { dataStream: 'A' }, len: 1 },
        ];
        const secondUpdate: TextXAction[] = [
            { t: TextXActionType.RETAIN, len: 12 },
            { t: TextXActionType.DELETE, len: 1 },
            { t: TextXActionType.INSERT, body: { dataStream: 'AB' }, len: 2 },
        ];

        TextX.apply(body, TextX.compose(firstUpdate, secondUpdate));

        expect(body.dataStream).toBe(`${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}AB${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.tables).toEqual([{ startIndex: 0, endIndex: 12, tableId: 'table-1' }]);
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
                { sectionId: 'section_fixture_53', startIndex: 8 },
                { sectionId: 'section_fixture_54', startIndex: 19 },
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
                { sectionId: 'section_fixture_55', startIndex: 8 },
                { sectionId: 'section_fixture_56', startIndex: 19 },
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
                { sectionId: 'section_fixture_57', startIndex: 5 },
                { sectionId: 'section_fixture_58', startIndex: 9 },
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
