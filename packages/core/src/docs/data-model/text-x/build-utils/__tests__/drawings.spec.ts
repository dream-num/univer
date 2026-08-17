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

import { describe, expect, it } from 'vitest';
import { PositionedObjectLayoutType } from '../../../../../types/interfaces/i-document-data';
import { DrawingTypeEnum } from '../../../../../types/interfaces/i-drawing';
import { DocumentDataModel } from '../../../document-data-model';
import { JSONX } from '../../../json-x/json-x';
import { DataStreamTreeTokenType } from '../../../types';
import { getRichTextEditPath } from '../../utils';
import { addDrawing, getCustomBlockIdsInSelections, removeDrawingReferences } from '../drawings';

describe('drawing build utils', () => {
    it('removes drawing references in reverse order for a structural text deletion', () => {
        const doc = new DocumentDataModel({
            id: 'doc-remove-drawings',
            body: {
                dataStream: '\bA\bB\b\r\n',
                customBlocks: [
                    { startIndex: 0, blockId: 'drawing-1' },
                    { startIndex: 2, blockId: 'drawing-2' },
                    { startIndex: 4, blockId: 'stale-drawing' },
                ],
            },
            drawings: {
                'drawing-1': {
                    drawingId: 'drawing-1',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    docTransform: {
                        angle: 0,
                        positionH: { posOffset: 0, relativeFrom: 0 },
                        positionV: { posOffset: 0, relativeFrom: 0 },
                        size: { height: 40, width: 80 },
                    },
                    layoutType: PositionedObjectLayoutType.INLINE,
                    subUnitId: 'doc-remove-drawings',
                    unitId: 'doc-remove-drawings',
                },
                'drawing-2': {
                    drawingId: 'drawing-2',
                    drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                    docTransform: {
                        angle: 0,
                        positionH: { posOffset: 0, relativeFrom: 0 },
                        positionV: { posOffset: 0, relativeFrom: 0 },
                        size: { height: 40, width: 80 },
                    },
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    subUnitId: 'doc-remove-drawings',
                    unitId: 'doc-remove-drawings',
                },
            },
            drawingsOrder: ['drawing-1', 'stale-drawing', 'drawing-2'],
        });

        const actions = removeDrawingReferences(doc.getSnapshot(), [
            { startOffset: 0, endOffset: 5, collapsed: false },
            { startOffset: 2, endOffset: 5, collapsed: false },
        ]);
        let composedActions = actions[0];
        for (const action of actions.slice(1)) {
            composedActions = JSONX.compose(composedActions, action);
        }
        if (!composedActions) throw new Error('Expected drawing removal actions');
        doc.apply(composedActions);

        expect(doc.getDrawings()).toEqual({});
        expect(doc.getDrawingsOrder()).toEqual([]);
    });

    it('anchors a drawing in the current table-cell paragraph at the cell structural tail', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const doc = new DocumentDataModel({
            id: 'doc-table-cell-drawing',
            body: {
                dataStream: `${tableStream}${T.PARAGRAPH}${T.SECTION_BREAK}`,
                paragraphs: [
                    { startIndex: 7, paragraphId: 'cell-paragraph' },
                    { startIndex: 12, paragraphId: 'body-paragraph' },
                ],
                sectionBreaks: [
                    { startIndex: 8, sectionId: 'cell-section' },
                    { startIndex: 13, sectionId: 'body-section' },
                ],
                customBlocks: [],
                tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
            },
            drawings: {},
            drawingsOrder: [],
        });

        const actions = addDrawing({
            selection: { startOffset: 8, endOffset: 8, collapsed: true },
            documentDataModel: doc,
            drawings: [{
                unitId: 'doc-table-cell-drawing',
                subUnitId: '',
                drawingId: 'drawing-new',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
        });

        expect(actions).toBeTruthy();
        if (!actions) {
            throw new Error('Expected addDrawing to return JSONX actions');
        }
        doc.apply(actions);

        expect(doc.getBody()?.dataStream).toBe(
            `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`
        );
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 7, blockId: 'drawing-new' }]);
        expect(doc.getBody()?.paragraphs).toEqual([
            { startIndex: 8, paragraphId: 'cell-paragraph' },
            { startIndex: 13, paragraphId: 'body-paragraph' },
        ]);
    });

    it('keeps the initial empty paragraph above a drawing inserted at offset zero', () => {
        const doc = new DocumentDataModel({
            id: 'doc-empty-drawing',
            body: {
                dataStream: '\r\n',
                paragraphs: [{ startIndex: 0, paragraphId: 'para_top' }],
                sectionBreaks: [{ sectionId: 'section_fixture_59', startIndex: 1 }],
                customBlocks: [],
            },
            drawings: {},
            drawingsOrder: [],
        });

        const actions = addDrawing({
            selection: { startOffset: 0, endOffset: 0, collapsed: true },
            documentDataModel: doc,
            drawings: [{
                unitId: 'doc-empty-drawing',
                subUnitId: '',
                drawingId: 'drawing-new',
                drawingType: 0,
                title: 'New drawing',
                description: 'New drawing',
                docTransform: {
                    size: { width: 20, height: 20 },
                    positionH: { relativeFrom: 0, posOffset: 0 },
                    positionV: { relativeFrom: 0, posOffset: 0 },
                },
                layoutType: 0,
            } as never],
        });

        expect(actions).toBeTruthy();
        if (!actions) {
            throw new Error('Expected addDrawing to return JSONX actions');
        }
        doc.apply(actions);

        expect(doc.getBody()?.dataStream).toBe(`\r${DataStreamTreeTokenType.CUSTOM_BLOCK}\r\n`);
        expect(doc.getBody()?.paragraphs).toEqual([
            { startIndex: 0, paragraphId: 'para_top' },
            { startIndex: 2, paragraphId: expect.stringMatching(/^para_/) },
        ]);
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 1, blockId: 'drawing-new' }]);
        expect(doc.getBody()?.sectionBreaks).toEqual([{ sectionId: expect.any(String), startIndex: 3 }]);
    });

    it('should resolve custom blocks and replace selected drawings in the document body', () => {
        const doc = new DocumentDataModel({
            id: 'doc-drawing',
            body: {
                dataStream: 'A\bB\r\n',
                paragraphs: [{ startIndex: 4, paragraphId: 'para_fixture_15' }],
                customBlocks: [{ startIndex: 1, blockId: 'drawing-old' }],
            },
            drawings: {
                'drawing-old': {
                    unitId: 'doc-drawing',
                    subUnitId: '',
                    drawingId: 'drawing-old',
                    drawingType: 0,
                    title: 'Old drawing',
                    description: 'Old drawing',
                    docTransform: {
                        size: { width: 10, height: 10 },
                        positionH: { relativeFrom: 0, posOffset: 0 },
                        positionV: { relativeFrom: 0, posOffset: 0 },
                    },
                    layoutType: 0,
                } as never,
            },
            drawingsOrder: ['drawing-old'],
            headers: {
                'header-1': {
                    headerId: 'header-1',
                    body: {
                        dataStream: 'Header\r\n',
                    },
                },
            },
        });

        expect(getCustomBlockIdsInSelections(doc.getBody()!, [{ startOffset: 1, endOffset: 2, collapsed: false }])).toEqual(['drawing-old']);
        expect(getRichTextEditPath(doc)).toEqual(['body']);
        expect(getRichTextEditPath(doc, 'header-1')).toEqual(['headers', 'header-1', 'body']);
        expect(() => getRichTextEditPath(doc, 'missing-segment')).toThrow('Segment id not found in headers or footers');
        expect(() => getRichTextEditPath(new DocumentDataModel({ id: 'doc-no-segment', body: { dataStream: 'Body\r\n' } }), 'missing')).toThrow(
            'Segment id not found in headers or footers'
        );

        const actions = addDrawing({
            selection: { startOffset: 1, endOffset: 2, collapsed: false },
            documentDataModel: doc,
            drawings: [{
                unitId: 'doc-drawing',
                subUnitId: '',
                drawingId: 'drawing-new',
                drawingType: 0,
                title: 'New drawing',
                description: 'New drawing',
                docTransform: {
                    size: { width: 20, height: 20 },
                    positionH: { relativeFrom: 0, posOffset: 0 },
                    positionV: { relativeFrom: 0, posOffset: 0 },
                },
                layoutType: 0,
            } as never],
        });

        expect(actions).toBeTruthy();
        if (!actions) {
            throw new Error('Expected addDrawing to return JSONX actions');
        }
        doc.apply(actions);

        expect(doc.getDrawingsOrder()).toEqual(['drawing-new']);
        expect(doc.getDrawings()).toMatchObject({
            'drawing-new': { drawingId: 'drawing-new', title: 'New drawing' },
        });
        expect(doc.getDrawings()).not.toHaveProperty('drawing-old');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 1, blockId: 'drawing-new' }]);
        expect(doc.getBody()?.dataStream).toBe('A\bB\r\n');
    });

    it('should return false when drawing insertion targets a missing body', () => {
        const documentDataModel = new DocumentDataModel({ id: 'doc-without-body' });
        delete documentDataModel.getSnapshot().body;

        const result = addDrawing({
            selection: { startOffset: 0, endOffset: 0, collapsed: true },
            documentDataModel,
            drawings: [{
                unitId: 'doc-without-body',
                subUnitId: '',
                drawingId: 'drawing-new',
                drawingType: 0,
                title: 'New drawing',
                description: 'New drawing',
                docTransform: {
                    size: { width: 20, height: 20 },
                    positionH: { relativeFrom: 0, posOffset: 0 },
                    positionV: { relativeFrom: 0, posOffset: 0 },
                },
                layoutType: 0,
            } as never],
        });

        expect(result).toBe(false);
        documentDataModel.dispose();
    });
});
