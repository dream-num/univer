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
import { validateDocBodyStructure } from '../structure-validator';
import { TextX } from '../text-x';
import { getBodySliceForTextXAction } from '../utils';

describe('TextX column groups', () => {
    it('creates missing paragraph and section-break collections from inserted column metadata', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}${T.COLUMN_END}${T.COLUMN_GROUP_END}`,
            columnGroups: [{ startIndex: 0, endIndex: 3, columnGroupId: 'cg-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 2 },
            {
                t: TextXActionType.INSERT,
                len: 2,
                body: {
                    dataStream: `${T.PARAGRAPH}${T.SECTION_BREAK}`,
                    paragraphs: [{ startIndex: 0, paragraphId: 'inserted' }],
                    sectionBreaks: [{ sectionId: 'section_fixture_25', startIndex: 1 }],
                },
            },
        ]);

        expect(body.paragraphs).toEqual([{
            startIndex: 2,
            paragraphId: expect.any(String),
        }]);
        expect(body.sectionBreaks).toEqual([{ sectionId: expect.any(String), startIndex: 3 }]);
    });

    it('adds inserted column group metadata to documents without existing column groups', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `A${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: 'before' }],
            sectionBreaks: [{ sectionId: 'section_fixture_26', startIndex: 2 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_27', startIndex: 8 }],
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
            sectionBreaks: [{ sectionId: 'section_fixture_28', startIndex: 10 }],
            columnGroups: [{ startIndex: 0, endIndex: 9, columnGroupId: 'cg-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 9 },
            { t: TextXActionType.INSERT, body: { dataStream: T.PARAGRAPH, paragraphs: [{ startIndex: 0, paragraphId: 'inserted' }] }, len: 1 },
        ]);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.PARAGRAPH}${T.COLUMN_GROUP_END}${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 10, columnGroupId: 'cg-1' }]);
    });

    it('does not expand a column group when text is inserted after the closing boundary token', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}Z${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 3, paragraphId: 'left' },
                { startIndex: 6, paragraphId: 'after' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_29', startIndex: 7 }],
            columnGroups: [{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }],
        };

        TextX.apply(body, [
            { t: TextXActionType.RETAIN, len: 6 },
            { t: TextXActionType.INSERT, body: { dataStream: 'X' }, len: 1 },
        ]);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}XZ${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }]);
    });

    it('returns deleted column groups in delete undo bodies', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'left' }],
            sectionBreaks: [{ sectionId: 'section_fixture_30', startIndex: 5 }],
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

    it('does not include partial column groups in action bodies', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'left' }],
            sectionBreaks: [{ sectionId: 'section_fixture_31', startIndex: 5 }],
            columnGroups: [{ startIndex: 0, endIndex: 4, columnGroupId: 'cg-1' }],
        };

        const slice = getBodySliceForTextXAction(body, 2, 4, false);

        expect(slice.dataStream).toBe(`A${T.PARAGRAPH}`);
        expect(slice.columnGroups).toBeUndefined();
    });

    it('keeps a minimum paragraph when replacing all text in a column', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 3, paragraphId: 'left' }],
            sectionBreaks: [{ sectionId: 'section_fixture_32', startIndex: 6 }],
            columnGroups: [{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }],
        };

        const actions = BuildTextUtils.selection.delete(
            [{ startOffset: 2, endOffset: 4, collapsed: false }],
            body,
            0,
            { dataStream: 'X' }
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}X${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`);
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([3]);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }]);
    });

    it('allows deleting a paragraph sentinel when another column paragraph remains', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 3, paragraphId: 'first' },
                { startIndex: 5, paragraphId: 'second' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_33', startIndex: 8 }],
            columnGroups: [{ startIndex: 0, endIndex: 7, columnGroupId: 'cg-1' }],
        };

        const actions = BuildTextUtils.selection.delete(
            [{ startOffset: 4, endOffset: 6, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`);
        expect(body.columnGroups).toEqual([{ startIndex: 0, endIndex: 5, columnGroupId: 'cg-1' }]);
    });

    it('keeps column boundary tokens balanced when deleting across a column edge', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.COLUMN_GROUP_START}${T.COLUMN_START}Alpha${T.PARAGRAPH}${T.SECTION_BREAK}${T.COLUMN_END}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 7, paragraphId: 'left' },
                { startIndex: 11, paragraphId: 'right' },
            ],
            sectionBreaks: [
                { sectionId: 'section_fixture_34', startIndex: 8 },
                { sectionId: 'section_fixture_35', startIndex: 14 },
            ],
            columnGroups: [{ startIndex: 0, endIndex: 13, columnGroupId: 'cg-1' }],
        };

        const actions = BuildTextUtils.selection.delete(
            [{ startOffset: 4, endOffset: 10, collapsed: false }],
            body
        );

        TextX.apply(body, actions);

        expect(validateDocBodyStructure(body)).toEqual([]);
        expect(body.dataStream).toBe(`${T.COLUMN_GROUP_START}${T.COLUMN_START}Al${T.SECTION_BREAK}${T.COLUMN_END}${T.COLUMN_START}${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`);
    });
});
