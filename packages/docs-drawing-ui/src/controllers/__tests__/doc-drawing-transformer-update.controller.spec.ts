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

import { ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    IMoveInlineDrawingCommand,
    ITransformNonInlineDrawingCommand,
    UpdateDrawingDocTransformCommand,
} from '../../commands/commands/update-doc-drawing.command';
import { DocDrawingTransformerController, getDocsTableCellAnchorContext } from '../doc-drawing-transformer-update.controller';

function createController() {
    const controller = Object.create(DocDrawingTransformerController.prototype) as any;
    controller._commandService = { executeCommand: vi.fn() };
    controller._drawingManagerService = {
        getDrawingOKey: vi.fn((oKey: string) => ({
            unitId: 'unit-1',
            subUnitId: 'doc-1',
            drawingId: oKey.replace('object-', 'drawing-'),
        })),
    };
    controller._transformerCache = new Map();
    controller._liquid = {
        x: 0,
        y: 0,
        reset: vi.fn(),
        translatePage: vi.fn((_page: any) => {
            controller._liquid.y += 140;
        }),
    };
    controller._renderManagerService = {
        getRenderById: vi.fn(() => null),
    };
    return controller;
}

function drawing(drawingId = 'drawing-1') {
    return {
        drawingId,
        unitId: 'unit-1',
        subUnitId: 'doc-1',
        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
        docTransform: {
            size: { width: 80, height: 60 },
            angle: 0,
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: 10,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 20,
            },
        },
    };
}

describe('DocDrawingTransformerController business methods', () => {
    it('builds drawing transform updates for multi-select resize, rotation, and move changes', () => {
        const controller = createController();
        const drawingData = drawing();
        controller._getPageContentSize = vi.fn(() => ({ width: 100, height: 90 }));
        controller._transformerCache.set('drawing-1', {
            drawing: drawingData,
            top: 20,
            left: 10,
            width: 80,
            height: 60,
            angle: 0,
        });

        controller._updateMultipleDrawingDocTransform(new Map([
            ['object-1', {
                oKey: 'object-1',
                left: 25,
                top: 45,
                width: 160,
                height: 120,
                angle: 30,
            }],
        ]));

        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'doc-1',
            drawings: [
                { drawingId: 'drawing-1', key: 'size', value: { width: 100, height: 90 } },
                { drawingId: 'drawing-1', key: 'angle', value: 30 },
                { drawingId: 'drawing-1', key: 'positionV', value: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 45 } },
                { drawingId: 'drawing-1', key: 'positionH', value: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 25 } },
            ],
        });
    });

    it('updates inline drawing size and angle while clamping to page content size', () => {
        const controller = createController();
        controller._getPageContentSize = vi.fn(() => ({ width: 120, height: 90 }));

        controller._updateDrawingSize({
            drawing: drawing(),
            top: 0,
            left: 0,
            width: 80,
            height: 60,
            angle: 0,
        }, {
            width: 300,
            height: 100,
            angle: 15,
        });

        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'doc-1',
            drawings: [
                { drawingId: 'drawing-1', key: 'size', value: { width: 120, height: 90 } },
                { drawingId: 'drawing-1', key: 'angle', value: 15 },
            ],
        });
    });

    it('moves inline drawings to the resolved anchor and refreshes when no anchor is available', () => {
        const controller = createController();
        controller._getInlineDrawingAnchor = vi.fn(() => ({
            offset: 12,
            segmentId: 'segment-1',
            segmentPage: 2,
        }));

        controller._moveInlineDrawing(drawing(), 40, 50);
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(IMoveInlineDrawingCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'unit-1',
            drawing: drawing(),
            offset: 12,
            segmentId: 'segment-1',
            segmentPage: 2,
            needRefreshDrawings: false,
        });

        controller._commandService.executeCommand.mockClear();
        controller._getInlineDrawingAnchor.mockReturnValue(null);
        controller._moveInlineDrawing(drawing(), 400, 500);
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(IMoveInlineDrawingCommand.id, expect.objectContaining({
            offset: undefined,
            needRefreshDrawings: true,
        }));
    });

    it('transforms non-inline drawings through a new anchor and falls back to direct transform when no anchor is found', () => {
        const controller = createController();
        const docTransform = {
            size: { width: 90, height: 70 },
            positionH: { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 11 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 22 },
        };
        controller._limitDrawingInPage = vi.fn((_drawing: any, object: any) => object);
        controller._getDrawingAnchor = vi.fn(() => ({
            offset: 23,
            docTransform,
            segmentId: 'body',
            segmentPage: 0,
        }));

        controller._nonInlineDrawingTransform(drawing(), { left: 8, top: 9, width: 90, height: 70 });
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(ITransformNonInlineDrawingCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'unit-1',
            drawing: drawing(),
            offset: 23,
            docTransform,
            segmentId: 'body',
            segmentPage: 0,
        });

        controller._commandService.executeCommand.mockClear();
        controller._getDrawingAnchor.mockReturnValue(null);
        controller._updateMultipleDrawingDocTransform = vi.fn();
        controller._nonInlineDrawingTransform(drawing(), { left: 18, top: 19, width: 90, height: 70 });
        expect(controller._updateMultipleDrawingDocTransform).toHaveBeenCalledWith(new Map([['drawing-1', {
            left: 18,
            top: 19,
            width: 90,
            height: 70,
        }]]));
    });

    it('limits a drawing away from the gap between document pages while preserving drawings already on one page', () => {
        const controller = createController();
        controller._renderManagerService.getRenderById.mockReturnValue({
            mainComponent: {
                top: 5,
                pageLayoutType: 0,
                pageMarginLeft: 0,
                pageMarginTop: 20,
                getOffsetConfig: () => ({
                    pageLayoutType: 0,
                    pageMarginLeft: 0,
                    pageMarginTop: 20,
                }),
            },
            with: vi.fn(() => ({
                getSkeleton: () => ({
                    getSkeletonData: () => ({
                        pages: [
                            { pageHeight: 100, marginBottom: 10, marginTop: 10 },
                            { pageHeight: 100, marginBottom: 10, marginTop: 10 },
                        ],
                    }),
                }),
            })),
        });

        expect(controller._limitDrawingInPage(drawing(), {
            left: 1,
            top: 85,
            width: 30,
            height: 20,
            angle: 0,
        })).toMatchObject({ top: 75 });
        expect(controller._limitDrawingInPage(drawing(), {
            left: 1,
            top: 30,
            width: 30,
            height: 20,
            angle: 0,
        })).toMatchObject({ top: 30 });
    });

    it('resolves only real table-cell anchors to their table, row, and host page context', () => {
        expect(getDocsTableCellAnchorContext('unit-1', { parent: null } as any)).toBeNull();

        const hostPage = { type: 'body' };
        const cell = { left: 1, marginLeft: 2, marginTop: 3 };
        const row = { cells: [], top: 4 };
        const table = { left: 5, top: 6, tableId: 'table-1#-#0', parent: hostPage };
        Object.assign(row, { cells: [cell], parent: table });
        Object.assign(cell, { parent: row });

        expect(getDocsTableCellAnchorContext('unit-1', cell as any)).toMatchObject({
            cell,
            row,
            table,
            hostPage,
        });
    });
});
