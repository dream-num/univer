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

import { PositionedObjectLayoutType, TableTextWrapType, WrapTextType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { LineType } from '../../../../../basics/i-document-skeleton-cached';
import {
    calculateLineTopByDrawings,
    collisionDetection,
    createAndUpdateBlockAnchor,
    createSkeletonLine,
    getBoundingBox,
    setLineMarginBottom,
    updateDivideInfo,
} from '../line';

function createTopBottomDrawing(top: number, height: number, angle = 0) {
    return {
        aTop: top,
        aLeft: 10,
        width: 20,
        height,
        angle,
        drawingOrigin: {
            layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
            distT: 1,
            distB: 2,
        },
    };
}

describe('line model', () => {
    it('creates line skeleton and divides with drawing/table layout data', () => {
        const page = {
            marginTop: 8,
            marginBottom: 8,
            pageHeight: 200,
            skeDrawings: new Map([
                ['inline', {
                    aTop: 2,
                    aLeft: 2,
                    width: 5,
                    height: 5,
                    drawingOrigin: { layoutType: PositionedObjectLayoutType.INLINE },
                }],
                ['square', {
                    aTop: 4,
                    aLeft: 18,
                    width: 10,
                    height: 8,
                    angle: 0,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                        distL: 1,
                        distR: 1,
                        distT: 1,
                        distB: 1,
                        wrapText: WrapTextType.BOTH_SIDES,
                    },
                }],
                ['polygon', {
                    aTop: 4,
                    aLeft: 32,
                    width: 10,
                    height: 8,
                    angle: 20,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_POLYGON,
                        start: [32, 4],
                        lineTo: [[42, 4], [42, 12], [32, 12]],
                    },
                }],
                ['tight', {
                    aTop: 4,
                    aLeft: 48,
                    width: 10,
                    height: 8,
                    angle: 25,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_TIGHT,
                        distL: 0,
                        distR: 0,
                        distT: 0,
                        distB: 0,
                        wrapText: WrapTextType.LARGEST,
                    },
                }],
            ]),
            skeTables: new Map([
                ['table-wrap', {
                    left: 6,
                    top: 2,
                    width: 8,
                    height: 12,
                    tableSource: {
                        textWrap: TableTextWrapType.WRAP,
                        dist: { distL: 1, distR: 1, distT: 1, distB: 1 },
                    },
                }],
            ]),
        } as any;

        const headerPage = {
            marginTop: 5,
            pageHeight: 200,
            skeDrawings: new Map([
                ['header-square', {
                    aTop: 1,
                    aLeft: 2,
                    width: 6,
                    height: 6,
                    angle: 0,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                        distL: 0,
                        distR: 0,
                        distT: 0,
                        distB: 0,
                        wrapText: WrapTextType.BOTH_SIDES,
                    },
                }],
            ]),
        } as any;

        const footerPage = {
            marginTop: 3,
            pageHeight: 200,
            skeDrawings: new Map([
                ['footer-through', {
                    aTop: 1,
                    aLeft: 20,
                    width: 6,
                    height: 6,
                    angle: 0,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_THROUGH,
                        distL: 0,
                        distR: 0,
                        distT: 0,
                        distB: 0,
                        wrapText: WrapTextType.RIGHT,
                    },
                }],
            ]),
        } as any;

        const line = createSkeletonLine(
            3,
            LineType.PARAGRAPH,
            {
                lineHeight: 14,
                lineTop: 6,
                contentHeight: 10,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 1,
                paddingBottom: 1,
                marginTop: 3,
                spaceBelowApply: 2,
            },
            100,
            4,
            true,
            {
                skeTablesInParagraph: [{ tableId: 'table-wrap' }],
            } as any,
            page,
            headerPage,
            footerPage
        );

        expect(line.paragraphIndex).toBe(3);
        expect(line.lineIndex).toBe(4);
        expect(line.paragraphStart).toBe(true);
        expect(line.isBehindTable).toBe(true);
        expect(line.tableId).toBe('table-wrap');
        expect(line.divides.length).toBeGreaterThan(0);
        expect(line.divides.every((divide) => divide.parent === line)).toBe(true);
    });

    it('calculates max line top with top-bottom drawings and no-wrap tables', () => {
        const page = {
            marginTop: 10,
            marginBottom: 8,
            pageHeight: 300,
            skeDrawings: new Map([
                ['d1', createTopBottomDrawing(12, 10, 0)],
                ['d2', createTopBottomDrawing(20, 8, 30)],
            ]),
            skeTables: new Map([
                ['t1', {
                    top: 14,
                    height: 12,
                    tableSource: { textWrap: TableTextWrapType.NONE },
                }],
            ]),
        } as any;

        const headerPage = {
            marginTop: 5,
            pageHeight: 300,
            skeDrawings: new Map([['h1', createTopBottomDrawing(3, 7, 0)]]),
        } as any;

        const footerPage = {
            marginTop: 4,
            pageHeight: 300,
            skeDrawings: new Map([['f1', createTopBottomDrawing(2, 6, 0)]]),
        } as any;

        const top = calculateLineTopByDrawings(15, 10, page, headerPage, footerPage);
        expect(top).toBeGreaterThan(10);

        const noOverlapTop = calculateLineTopByDrawings(
            5,
            0,
            { ...page, skeDrawings: new Map(), skeTables: new Map() },
            null,
            null
        );
        expect(noOverlapTop).toBe(0);
    });

    it('updates divide/line state and detects float object collision', () => {
        const divide = {
            glyphGroup: [],
            width: 50,
            left: 0,
            isFull: false,
        } as any;
        updateDivideInfo(divide, { isFull: true, breakType: 2 as any });
        expect(divide.isFull).toBe(true);
        expect(divide.breakType).toBe(2);

        const line = { marginBottom: 0 } as any;
        setLineMarginBottom(line, 11);
        expect(line.marginBottom).toBe(11);

        const collide = collisionDetection(
            { top: 4, left: 6, width: 8, height: 8, angle: 20 } as any,
            20,
            0,
            0,
            40
        );
        expect(collide).toBe(true);

        const notCollide = collisionDetection(
            { top: 100, left: 200, width: 20, height: 20, angle: 0 } as any,
            10,
            0,
            0,
            40
        );
        expect(notCollide).toBe(false);
    });

    it('computes bounding box and updates drawing anchor map', () => {
        const boundingBox = getBoundingBox(45, 10, 20, 5, 8);
        expect(boundingBox.left).toBeTypeOf('number');
        expect(boundingBox.top).toBeTypeOf('number');
        expect(boundingBox.points.length).toBe(4);

        const line = { lineIndex: 1 } as any;
        const anchors = new Map<number, any>();

        createAndUpdateBlockAnchor(9, line, 30, anchors);
        expect(anchors.get(9)?.elements).toHaveLength(1);

        createAndUpdateBlockAnchor(9, { lineIndex: 2 } as any, 40, anchors);
        expect(anchors.get(9)?.elements).toHaveLength(2);

        expect(() => createAndUpdateBlockAnchor(1, line, 10, undefined)).not.toThrow();
    });
});
