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
import { DocumentDataModel } from '../../../document-data-model';
import { addDrawing, getCustomBlockIdsInSelections, getRichTextEditPath } from '../drawings';

describe('drawing build utils', () => {
    it('should resolve custom blocks and replace selected drawings in the document body', () => {
        const doc = new DocumentDataModel({
            id: 'doc-drawing',
            body: {
                dataStream: 'A\bB\r\n',
                paragraphs: [{ startIndex: 4 }],
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
            'Document data model must have headers or footers when update by segment id'
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
        const result = addDrawing({
            selection: { startOffset: 0, endOffset: 0, collapsed: true },
            documentDataModel: new DocumentDataModel({ id: 'doc-without-body' }),
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
    });
});
