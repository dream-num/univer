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

import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { Liquid, setDocsTableRenderViewportProvider } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDocsTableCellAnchorContext } from '../../doc-drawing-transformer-update.controller';
import {
    DocDrawingTransformUpdateController,
    getDocsDrawingBehindText,
    getDocsDrawingClipPage,
    getDocsDrawingPageClipBounds,
    getDocsPageRelativeDrawingAnchorPage,
    getDocsPageRelativeDrawingLeft,
    getDocsPageRelativeDrawingTop,
    getDocsTableCellDrawingOffset,
} from '../doc-drawing-transform-update.controller';

describe('DocDrawingTransformUpdateController', () => {
    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
    });

    it('projects drawings in table cells through table, row, cell and scroll offsets', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const table = {
            left: 40,
            tableId: 'table-1#-#0',
            top: 80,
        };
        const row = {
            top: 12,
        };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };

        expect(getDocsTableCellDrawingOffset('unit-1', table as never, row as never, cell as never)).toEqual({
            left: 138,
            top: 98,
        });
    });

    it('resolves a table cell drawing anchor to the host page and scrolled cell offset', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 480,
                scrollLeft: 30,
                viewportWidth: 160,
            };
        });

        const hostPage = { type: 'body' };
        const cell = {
            left: 120,
            marginLeft: 8,
            marginTop: 6,
        };
        const row = {
            cells: [cell],
            top: 12,
        };
        const table = {
            left: 40,
            parent: hostPage,
            rows: [row],
            tableId: 'table-1#-#0',
            top: 80,
        };
        Object.assign(row, { parent: table });
        Object.assign(cell, { parent: row });

        expect(getDocsTableCellAnchorContext('unit-1', cell as never)).toMatchObject({
            hostPage,
            offset: {
                left: 138,
                top: 98,
            },
        });
    });

    it('refreshes normal, table-cell, header, and multi-transform drawings into drawing notifications', () => {
        const selectedShape = {};
        const transformer = {
            getSelectedObjectMap: vi.fn(() => new Map([['multi-drawing', selectedShape]])),
            setSelectedControl: vi.fn(),
        };
        const context = {
            unitId: 'unit-1',
            mainComponent: {
                left: 5,
                top: 7,
                pageLayoutType: 0,
                pageMarginLeft: 0,
                pageMarginTop: 20,
            },
            scene: {
                getTransformerByCreate: vi.fn(() => transformer),
                getObject: vi.fn((key) => key === 'multi-drawing' ? selectedShape : null),
            },
        };
        const drawingManagerService = {
            refreshTransform: vi.fn(),
            getDrawingByParam: vi.fn((drawing) => ({ ...drawing })),
            getDrawingData: vi.fn(() => ({
                'multi-drawing': { drawingId: 'multi-drawing', isMultiTransform: BooleanNumber.TRUE },
                'stale-multi': { drawingId: 'stale-multi', isMultiTransform: BooleanNumber.TRUE },
                'stale-normal': {
                    drawingId: 'stale-normal',
                    transform: { left: 0, top: 0, width: 100, height: 100, angle: 0 },
                },
            })),
            removeNotification: vi.fn(),
            addNotification: vi.fn(),
        };
        const controller = Object.create(DocDrawingTransformUpdateController.prototype) as any;
        controller._context = context;
        controller._drawingManagerService = drawingManagerService;
        controller._liquid = new Liquid();
        const defaultDocTransform = {
            positionH: {},
            positionV: {},
        };

        const normalDrawing = {
            aLeft: 10,
            aTop: 20,
            width: 30,
            height: 40,
            angle: 5,
            drawingId: 'normal-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.TRUE,
                docTransform: defaultDocTransform,
            },
        };
        const headerDrawing = {
            aLeft: 3,
            aTop: 4,
            width: 9,
            height: 10,
            angle: 0,
            drawingId: 'header-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: defaultDocTransform,
            },
        };
        const tableCellDrawing = {
            aLeft: 1,
            aTop: 2,
            width: 11,
            height: 12,
            angle: 0,
            drawingId: 'cell-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: defaultDocTransform,
            },
        };
        const inlineDrawing = {
            aLeft: 15,
            aTop: 25,
            width: 35,
            height: 45,
            angle: 0,
            drawingId: 'inline-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.INLINE,
                behindDoc: BooleanNumber.FALSE,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 99 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 88 },
                },
            },
        };
        const multiDrawingOnPage = {
            aLeft: 6,
            aTop: 8,
            width: 13,
            height: 14,
            angle: 2,
            drawingId: 'multi-drawing',
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                behindDoc: BooleanNumber.FALSE,
                isMultiTransform: BooleanNumber.TRUE,
                docTransform: defaultDocTransform,
            },
        };
        const multiDrawingInHeader = {
            ...multiDrawingOnPage,
            aLeft: 16,
            aTop: 18,
        };
        const cell = {
            left: 7,
            marginLeft: 2,
            marginTop: 3,
            skeDrawings: new Map([['cell-drawing', tableCellDrawing]]),
            skeTables: [],
        };
        const table = {
            left: 30,
            top: 40,
            tableId: 'table-1#-#0',
            rows: [{
                top: 4,
                cells: [cell],
            }],
        };
        const page = {
            headerId: 'header-1',
            pageWidth: 200,
            pageHeight: 300,
            marginLeft: 11,
            marginTop: 13,
            marginBottom: 17,
            skeDrawings: new Map([
                ['normal-drawing', normalDrawing],
                ['inline-drawing', inlineDrawing],
                ['multi-drawing', multiDrawingOnPage],
            ]),
            skeTables: [table],
        };
        const headerPage = {
            marginTop: 19,
            skeDrawings: new Map([
                ['header-drawing', headerDrawing],
                ['multi-drawing', multiDrawingInHeader],
            ]),
            skeTables: [],
        };
        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeHeaders: new Map([['header-1', new Map([[200, headerPage]])]]),
                skeFooters: new Map(),
            }),
        };

        controller._refreshDrawing(skeleton);

        expect(drawingManagerService.refreshTransform).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'header-drawing',
                transform: expect.objectContaining({ left: 19, top: 30, width: 9, height: 10, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'normal-drawing',
                behindText: true,
                transform: expect.objectContaining({ left: 26, top: 40, width: 30, height: 40, angle: 5 }),
            }),
            expect.objectContaining({
                drawingId: 'inline-drawing',
                transform: expect.objectContaining({ left: 31, top: 45, width: 35, height: 45, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'cell-drawing',
                transform: expect.objectContaining({ left: 56, top: 69, width: 11, height: 12, angle: 0 }),
            }),
            expect.objectContaining({
                drawingId: 'stale-normal',
                hidden: true,
                transform: expect.objectContaining({ left: 0, top: 0, width: 100, height: 100, angle: 0 }),
            }),
        ]);
        expect(drawingManagerService.removeNotification).toHaveBeenCalledWith([
            { drawingId: 'multi-drawing', isMultiTransform: BooleanNumber.TRUE },
            { drawingId: 'stale-multi', isMultiTransform: BooleanNumber.TRUE },
        ]);
        expect(drawingManagerService.addNotification).toHaveBeenCalledWith([
            expect.objectContaining({
                drawingId: 'multi-drawing',
                isMultiTransform: BooleanNumber.TRUE,
                transforms: [
                    expect.objectContaining({ left: 32, top: 44, width: 13, height: 14, angle: 2 }),
                    expect.objectContaining({ left: 22, top: 28, width: 13, height: 14, angle: 2 }),
                ],
            }),
        ]);
        expect(transformer.setSelectedControl).toHaveBeenCalledWith(selectedShape);
    });

    it('projects a document page clip bound in scene coordinates before page padding is applied', () => {
        expect(getDocsDrawingPageClipBounds({
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 100,
            pageOffsetTop: 200,
            page: {
                pageWidth: 793,
                pageHeight: 1122,
                marginLeft: 48,
                marginTop: 48,
            },
        } as never)).toEqual({
            left: 120,
            top: 230,
            width: 793,
            height: 1122,
        });
    });

    it('projects a table cell drawing clip bound through the cell offset', () => {
        expect(getDocsDrawingPageClipBounds({
            docsLeft: 20,
            docsTop: 30,
            pageOffsetLeft: 100,
            pageOffsetTop: 200,
            clipOffsetLeft: 138,
            clipOffsetTop: 98,
            page: {
                pageWidth: 321,
                pageHeight: 300,
            },
        })).toEqual({
            left: 258,
            top: 328,
            width: 321,
            height: 300,
        });
    });

    it('clips page-sized header background drawings to the host document page', () => {
        const headerPage = {
            pageWidth: 589,
            pageHeight: 476,
        };
        const hostPage = {
            pageWidth: 816,
            pageHeight: 1056,
        };

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 815,
                    height: 1055,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(hostPage);

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 120,
                    height: 40,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(headerPage);
    });

    it('clips overflowing header cover drawings to the host document page', () => {
        const headerPage = {
            pageWidth: 601,
            pageHeight: 510,
        };
        const hostPage = {
            pageWidth: 794,
            pageHeight: 1123,
        };

        expect(getDocsDrawingClipPage({
            drawing: {
                behindText: true,
                transform: {
                    width: 803,
                    height: 682,
                },
            },
            hostPage,
            page: headerPage,
        })).toBe(hostPage);
    });

    it('positions page-sized header backgrounds against the host page width', () => {
        expect(getDocsPageRelativeDrawingLeft({
            hostPage: {
                pageWidth: 816,
            },
            positionH: {
                align: AlignTypeH.RIGHT,
                relativeFrom: ObjectRelativeFromH.PAGE,
            },
            width: 815,
        })).toBe(1);
    });

    it('positions page-sized header backgrounds against the host page height', () => {
        expect(getDocsPageRelativeDrawingTop({
            hostPage: {
                pageHeight: 1056,
            },
            positionV: {
                align: AlignTypeV.TOP,
                relativeFrom: ObjectRelativeFromV.PAGE,
            },
            height: 1055,
        })).toBe(0);

        expect(getDocsPageRelativeDrawingTop({
            hostPage: {
                pageHeight: 1056,
            },
            positionV: {
                align: AlignTypeV.BOTTOM,
                relativeFrom: ObjectRelativeFromV.PAGE,
            },
            height: 1055,
        })).toBe(1);
    });

    it('uses body pages as page-relative drawing anchors when no host page exists', () => {
        const bodyPage = {
            pageWidth: 816,
            pageHeight: 1056,
        };

        expect(getDocsPageRelativeDrawingAnchorPage({
            page: bodyPage,
            clipPage: bodyPage,
        })).toBe(bodyPage);
    });

    it('renders header and footer drawings in the host page behind-text layer', () => {
        expect(getDocsDrawingBehindText({
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.FALSE,
            },
            hostPage: {
                pageWidth: 816,
                pageHeight: 1056,
            },
        } as never)).toBe(true);

        expect(getDocsDrawingBehindText({
            drawingOrigin: {
                layoutType: PositionedObjectLayoutType.WRAP_NONE,
                behindDoc: BooleanNumber.FALSE,
            },
        } as never)).toBe(false);
    });
});
