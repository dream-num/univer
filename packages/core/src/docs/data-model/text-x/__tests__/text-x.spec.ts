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

import type { IDocumentBody } from '../../../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { UpdateDocsAttributeType } from '../../../../shared/command-enum';
import { BooleanNumber } from '../../../../types/enum/text-style';
import {
    CustomDecorationType,
    CustomRangeType,
    DocumentBlockRangeType,
} from '../../../../types/interfaces/i-document-data';
import { DataStreamTreeTokenType } from '../../types';
import { TextXActionType } from '../action-types';
import { BuildTextUtils } from '../build-utils';
import { TextX } from '../text-x';
import { composeBody } from '../utils';

describe('test TextX methods and branches', () => {
    it('joins inserted SDT content with its surviving paragraph anchor', () => {
        const anchor = {
            startIndex: 1,
            endIndex: 1,
            rangeId: 'control',
            rangeType: CustomRangeType.SDT,
            properties: { kind: 'dropDownList', placement: 'block' },
        };
        const body: IDocumentBody = { dataStream: 'X\r\n', customRanges: [anchor] };
        TextX.apply(body, new TextX().retain(1).insert(3, {
            dataStream: 'New',
            customRanges: [{ ...anchor, startIndex: 0, endIndex: 2 }],
        }).serialize());
        expect(body.dataStream).toBe('XNew\r\n');
        expect(body.customRanges).toEqual([{ ...anchor, startIndex: 1, endIndex: 4 }]);
    });

    it('keeps soft page-break tokens anchored through UTF-16 insertion, undo, deletion and redo', () => {
        const body: IDocumentBody = { dataStream: 'A\fB\fC\fD', renderedPageBreaks: [1, 5] };
        const inserted = new TextX().retain(1).insert(2, { dataStream: '😀' }).serialize();
        TextX.makeInvertible(inserted, body);
        TextX.apply(body, inserted);
        expect(body.renderedPageBreaks).toEqual([3, 7]);
        expect(body.renderedPageBreaks?.map((offset) => body.dataStream[offset])).toEqual(['\f', '\f']);
        TextX.apply(body, TextX.invert(inserted));
        expect(body.dataStream).toBe('A\fB\fC\fD');
        expect(body.renderedPageBreaks).toEqual([1, 5]);

        const deleted = new TextX().retain(1).delete(4).serialize();
        TextX.makeInvertible(deleted, body);
        TextX.apply(body, deleted);
        expect(body.dataStream).toBe('A\fD');
        expect(body.renderedPageBreaks).toEqual([1]);
        TextX.apply(body, TextX.invert(deleted));
        expect(body.dataStream).toBe('A\fB\fC\fD');
        expect(body.renderedPageBreaks).toEqual([1, 5]);
        TextX.apply(body, deleted);
        expect(body.renderedPageBreaks).toEqual([1]);
    });

    it('preserves soft page breaks when an imported insert is split and composed with text formatting', () => {
        const source: IDocumentBody = { dataStream: 'A\fB\fC\fD', renderedPageBreaks: [1, 5] };
        const inserted = new TextX().insert(source.dataStream.length, source).serialize();
        const formatted = new TextX().retain(4, { dataStream: '', textRuns: [{ st: 0, ed: 4, ts: { bl: BooleanNumber.TRUE } }] }).serialize();
        const body: IDocumentBody = { dataStream: '' };
        TextX.apply(body, TextX.compose(inserted, formatted));
        expect(body.dataStream).toBe(source.dataStream);
        expect(body.renderedPageBreaks).toEqual([1, 5]);
        expect(source.renderedPageBreaks).toEqual([1, 5]);
    });

    it('keeps every enclosing field intact when editing a nested field result', () => {
        const start = DataStreamTreeTokenType.CUSTOM_RANGE_START;
        const end = DataStreamTreeTokenType.CUSTOM_RANGE_END;
        const body: IDocumentBody = {
            dataStream: `${start}A${start}1${end}\rB${end}\0`,
            customRanges: [
                {
                    startIndex: 0,
                    endIndex: 7,
                    rangeId: 'toc',
                    rangeType: CustomRangeType.FIELD,
                    wholeEntity: false,
                    properties: { fieldType: 'TOC', instruction: 'TOC \\o "1-3"' },
                },
                {
                    startIndex: 2,
                    endIndex: 4,
                    rangeId: 'page-ref',
                    rangeType: CustomRangeType.FIELD,
                    wholeEntity: false,
                    properties: { fieldType: 'PAGEREF', instruction: 'PAGEREF _Toc1 \\h' },
                },
            ],
        };

        TextX.apply(body, new TextX().retain(4).insert(1, { dataStream: '0' }).serialize());

        expect(body.dataStream).toBe(`${start}A${start}10${end}\rB${end}\0`);
        expect(body.customRanges).toMatchObject([
            { rangeId: 'toc', startIndex: 0, endIndex: 8 },
            { rangeId: 'page-ref', startIndex: 2, endIndex: 5 },
        ]);
    });

    it('keeps a nested SDT as one entity and expands it when typing inside', () => {
        const body: IDocumentBody = {
            dataStream: 'Accept: Value\r',
            customRanges: [{
                startIndex: 8,
                endIndex: 12,
                rangeId: 'sdt-text-1',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'text', placement: 'inline' },
            }],
        };

        TextX.apply(body, new TextX().retain(10).insert(1, { dataStream: 'X' }).serialize());

        expect(body.dataStream).toBe('Accept: VaXlue\r');
        expect(body.customRanges).toMatchObject([{
            rangeId: 'sdt-text-1',
            startIndex: 8,
            endIndex: 13,
        }]);
    });

    it('converges concurrent edits inside one SDT without duplicating the wrapper', () => {
        const original: IDocumentBody = {
            dataStream: 'Accept: Value\r',
            customRanges: [{
                startIndex: 8,
                endIndex: 12,
                rangeId: 'sdt-text-1',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'text', placement: 'inline' },
            }],
        };
        const left = new TextX().retain(10).insert(1, { dataStream: 'X' }).serialize();
        const right = new TextX().retain(11).insert(1, { dataStream: 'Y' }).serialize();
        const leftFirst = JSON.parse(JSON.stringify(original)) as IDocumentBody;
        const rightFirst = JSON.parse(JSON.stringify(original)) as IDocumentBody;

        TextX.apply(leftFirst, TextX.compose(left, TextX.transform(right, left, 'right')));
        TextX.apply(rightFirst, TextX.compose(right, TextX.transform(left, right, 'left')));

        expect(leftFirst).toEqual(rightFirst);
        expect(leftFirst.customRanges).toEqual([expect.objectContaining({
            rangeId: 'sdt-text-1',
            startIndex: 8,
            endIndex: 14,
        })]);
    });

    it('composes updates for multiple nested custom ranges by range id', () => {
        const ranges = [
            { startIndex: 0, endIndex: 7, rangeId: 'toc', rangeType: CustomRangeType.FIELD },
            { startIndex: 2, endIndex: 4, rangeId: 'page-ref', rangeType: CustomRangeType.FIELD },
        ];
        const result = composeBody(
            { dataStream: '', customRanges: ranges },
            {
                dataStream: '',
                customRanges: ranges.map((range) => ({ ...range, properties: { dirty: BooleanNumber.TRUE } })),
            },
            UpdateDocsAttributeType.COVER
        );

        expect(result.customRanges).toEqual(ranges.map((range) => ({
            ...range,
            properties: { dirty: BooleanNumber.TRUE },
        })));
    });

    it('updates metadata without splitting an SDT around structural tokens', () => {
        const body: IDocumentBody = {
            dataStream: 'X\x1Cdd mmm yyyy\r\n\x1D',
            customRanges: [{
                startIndex: 1,
                endIndex: 15,
                rangeId: 'date-cell',
                rangeType: CustomRangeType.SDT,
                wholeEntity: false,
                properties: { kind: 'date', placement: 'cell', showingPlaceholder: true },
            }],
        };
        const replacement = BuildTextUtils.selection.delete([{
            startOffset: 2,
            endOffset: 13,
            collapsed: false,
        }], body, 0, { dataStream: '06 Sep 2026' });
        const metadata = new TextX().retain(1).retain(15, {
            dataStream: '',
            customRanges: [{
                ...body.customRanges![0],
                startIndex: 0,
                endIndex: 14,
                properties: { kind: 'date', placement: 'cell', showingPlaceholder: false },
            }],
        }).serialize();

        TextX.apply(body, TextX.compose(replacement, metadata));

        expect(body.dataStream).toBe('X\x1C06 Sep 2026\r\n\x1D');
        expect(body.customRanges).toEqual([{
            startIndex: 1,
            endIndex: 15,
            rangeId: 'date-cell',
            rangeType: CustomRangeType.SDT,
            wholeEntity: false,
            properties: { kind: 'date', placement: 'cell', showingPlaceholder: false },
        }]);
    });

    describe('test TextX methods', () => {
        it('test TextX insert method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
            ]);
        });

        it('test TextX delete method', () => {
            const textX = new TextX();

            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX retain method', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: '',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.retain(5, body, UpdateDocsAttributeType.COVER);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    body,
                    len: 5,
                    coverType: UpdateDocsAttributeType.COVER,
                },
            ]);
        });

        it('test TextX push method and merge two delete actions', () => {
            const textX = new TextX();

            textX.delete(5);
            textX.delete(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.DELETE,
                    len: 10, // 5 + 5
                },
            ]);
        });

        it('test TextX push method and put insert action before delete action', () => {
            const textX = new TextX();

            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.delete(5);
            textX.insert(5, body);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.INSERT,
                    body,
                    len: 5,
                },
                {
                    t: TextXActionType.DELETE,
                    len: 5,
                },
            ]);
        });

        it('test TextX push method and merge two simple retain action', () => {
            const textX = new TextX();

            textX.retain(4);
            textX.retain(5);

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params', () => {
            const textX = new TextX();

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.RETAIN,
                len: 5,
            });

            const actions = textX.serialize();

            expect(actions).toEqual([
                {
                    t: TextXActionType.RETAIN,
                    len: 9,
                },
            ]);
        });

        it('test TextX push method and with more than one params and merge the last two actions', () => {
            const textX = new TextX();
            const body: IDocumentBody = {
                dataStream: 'hello',
                textRuns: [
                    {
                        st: 0,
                        ed: 5,
                        ts: {
                            bl: BooleanNumber.TRUE,
                        },
                    },
                ],
            };

            textX.push({
                t: TextXActionType.RETAIN,
                len: 4,
            }, {
                t: TextXActionType.DELETE,
                len: 5,
            });

            textX.push({
                t: TextXActionType.INSERT,
                len: 5,
                body,
            });

            const actions = textX.serialize();

            expect(actions.length).toBe(3);
            expect(actions[0].t).toBe(TextXActionType.RETAIN);
            expect(actions[1].t).toBe(TextXActionType.INSERT);
            expect(actions[2].t).toBe(TextXActionType.DELETE);
        });
    });

    describe('test TextX static methods', () => {
        it.each([
            {
                name: 'column group',
                offset: 2,
                body: {
                    dataStream: '\x12\x13Field\r\n\x14\x15\r\n',
                    columnGroups: [{ columnGroupId: 'columns-1', startIndex: 0, endIndex: 10 }],
                },
            },
            {
                name: 'quote block',
                offset: 1,
                body: {
                    dataStream: '\x10Field\r\x11\r\n',
                    blockRanges: [{ blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: 7 }],
                },
            },
        ])('does not clip an enclosing $name when undoing formatting', ({ body, offset }) => {
            const original = JSON.parse(JSON.stringify(body)) as IDocumentBody;
            const actions = new TextX().retain(offset).retain(3, {
                dataStream: '',
                textRuns: [{ st: 0, ed: 3, ts: { bl: BooleanNumber.TRUE } }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            TextX.apply(body, TextX.invert(actions));

            expect(body.columnGroups).toEqual(original.columnGroups);
            expect(body.blockRanges).toEqual(original.blockRanges);
            expect(body.dataStream).toBe(original.dataStream);
        });

        it('still restores table metadata when the retain explicitly changes it', () => {
            const dataStream = '\x1A\x1B\x1CField\r\n\x1D\x0E\x0F\r\n';
            const table = { tableId: 'table-1', startIndex: 0, endIndex: dataStream.length - 2 };
            const body: IDocumentBody = { dataStream, tables: [table] };
            const actions = new TextX().retain(table.endIndex, {
                dataStream: '',
                tables: [{ ...table, tableId: 'table-2' }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            TextX.apply(body, TextX.invert(actions));

            expect(body.tables).toEqual([table]);
        });

        it('keeps enclosing table metadata intact when undoing and redoing a comment inside a cell', () => {
            const dataStream = '\x1A\x1B\x1CField\r\n\x1D\x0E\x0F\r\n';
            const tables = [{ tableId: 'table-1', startIndex: 0, endIndex: dataStream.length - 2 }];
            const body: IDocumentBody = { dataStream, tables: [...tables], customDecorations: [] };
            const actions = new TextX().retain(3).retain(3, {
                dataStream: '',
                customDecorations: [{ id: 'comment-1', type: CustomDecorationType.COMMENT, startIndex: 0, endIndex: 2 }],
            }).serialize();
            TextX.makeInvertible(actions, body);
            TextX.apply(body, actions);
            const undoActions = TextX.invert(actions);
            TextX.makeInvertible(undoActions, body);
            TextX.apply(body, undoActions);

            expect(body.tables).toEqual(tables);
            expect(body.customDecorations).toEqual([]);
            const redoActions = TextX.invert(undoActions);
            TextX.apply(body, redoActions);
            expect(body.tables).toEqual(tables);
            expect(body.dataStream).toBe(dataStream);
            expect(body.customDecorations).toEqual([
                expect.objectContaining({ id: 'comment-1', startIndex: 3, endIndex: 5 }),
            ]);
        });

        it('test TextX isNoop method', () => {
            const textX = new TextX();

            expect(TextX.isNoop(textX.serialize())).toBe(true);

            textX.retain(4);
            textX.delete(5);

            expect(TextX.isNoop(textX.serialize())).toBe(false);
        });

        it('textX name should to be text-x', () => {
            expect(TextX.name).toBe('text-x');
        });
    });
});
