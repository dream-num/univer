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

import type { DocumentSkeleton } from '@univerjs/engine-render';
import {
    CustomRangeType,
    HorizontalAlign,
    IUniverInstanceService,
    PresetListType,
    VerticalAlign,
} from '@univerjs/core';
import { NodePositionConvertToCursor } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { IEditorBridgeService } from '../../editor-bridge.service';
import {
    calcPadding,
    calculateDocSkeletonRects,
    getCustomRangePosition,
    getEditingCustomRangePosition,
} from '../doc-skeleton-util';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token ${String(token)}`);
            }
            return map.get(token);
        },
    } as any;
}

function createDocSkeleton(customRangeId = 'range-1') {
    return {
        findNodePositionByCharIndex: () => ({ segmentPage: 0, left: 0, top: 0 }),
        getSkeletonData: () => ({
            pages: [{ height: 4, width: 6 }],
        }),
        getViewModel: () => ({
            getBody: () => ({
                customRanges: [{ rangeId: customRangeId, startIndex: 0, endIndex: 3 }],
                dataStream: 'abcdef',
            }),
        }),
    } as any;
}

function spyCursorRange() {
    return vi.spyOn(NodePositionConvertToCursor.prototype, 'getRangePointData').mockReturnValue({
        borderBoxPointGroup: [[
            { x: 2, y: 1 },
            { x: 4, y: 1 },
            { x: 4, y: 3 },
            { x: 2, y: 3 },
        ]],
        contentBoxPointGroup: [],
        cursorList: [],
    } as never);
}

describe('doc-skeleton-util', () => {
    it('calcPadding handles vertical and horizontal alignment branches', () => {
        const cell = {
            mergeInfo: {
                startX: 10,
                endX: 60,
                startY: 20,
                endY: 50,
            },
        } as any;
        const font = {
            documentSkeleton: {
                getSkeletonData: () => ({ pages: [{ height: 10, width: 20 }] }),
            },
            verticalAlign: VerticalAlign.BOTTOM,
            horizontalAlign: HorizontalAlign.RIGHT,
        } as any;

        expect(calcPadding(cell, font, false)).toEqual({ paddingTop: 20, paddingLeft: 30 });

        const middleCenter = {
            ...font,
            verticalAlign: VerticalAlign.MIDDLE,
            horizontalAlign: HorizontalAlign.CENTER,
        };
        expect(calcPadding(cell, middleCenter, false)).toEqual({ paddingTop: 10, paddingLeft: 15 });

        const unspecifiedNumeric = {
            ...font,
            verticalAlign: VerticalAlign.UNSPECIFIED,
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
        };
        expect(calcPadding(cell, unspecifiedNumeric, true)).toEqual({ paddingTop: 20, paddingLeft: 30 });
    });

    it('does not add cell alignment padding to skeleton drawing positions', () => {
        const docSkeleton = {
            getSkeletonData: () => ({
                pages: [{
                    skeDrawings: new Map([
                        ['image-1', {
                            aLeft: 45,
                            aTop: 1,
                            width: 38,
                            height: 38,
                        }],
                    ]),
                }],
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getBody: () => ({
                        customRanges: [],
                        paragraphs: [],
                    }),
                }),
            }),
        };

        const rects = calculateDocSkeletonRects(docSkeleton as unknown as DocumentSkeleton, 48, 1);

        expect(rects.drawings[0].rect).toEqual({
            top: 1,
            bottom: 39,
            left: 45,
            right: 83,
        });
    });

    it('collects hyperlink and checklist hit rects with cell padding applied', () => {
        const cursorSpy = spyCursorRange();
        const bulletGlyph = { glyphType: 'list-mark' };
        const docSkeleton = {
            findNodePositionByCharIndex: () => ({ segmentPage: 0, left: 0, top: 0 }),
            findPositionByGlyph: (glyph: unknown) => glyph === bulletGlyph ? { segmentPage: 0, left: 0, top: 0 } : null,
            findNodeByCharIndex: () => ({
                parent: {
                    parent: {
                        parent: {
                            lines: [{
                                paragraphStart: true,
                                paragraphIndex: 4,
                                divides: [{ glyphGroup: [bulletGlyph] }],
                            }],
                        },
                    },
                },
            }),
            getSkeletonData: () => ({
                pages: [{
                    height: 4,
                    width: 6,
                    skeDrawings: new Map(),
                }],
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getBody: () => ({
                        customRanges: [{
                            rangeId: 'link-1',
                            rangeType: CustomRangeType.HYPERLINK,
                            startIndex: 0,
                            endIndex: 2,
                        }],
                        paragraphs: [{
                            startIndex: 4,
                            bullet: { listType: PresetListType.CHECK_LIST_CHECKED },
                        }],
                    }),
                }),
            }),
        } as any;

        const rects = calculateDocSkeletonRects(docSkeleton, 10, 20);

        expect(rects.links[0]).toMatchObject({
            range: { rangeId: 'link-1' },
            rects: [{ top: 21, bottom: 23, left: 12, right: 14 }],
        });
        expect(rects.checkLists[0]).toMatchObject({
            paragraph: { startIndex: 4 },
            rect: { top: 21, bottom: 23, left: 12, right: 14 },
        });
        cursorSpy.mockRestore();
    });

    it('getCustomRangePosition returns transformed rects and label', () => {
        const cursorSpy = spyCursorRange();
        const docSkeleton = createDocSkeleton();
        const font = {
            documentSkeleton: docSkeleton,
            verticalAlign: VerticalAlign.BOTTOM,
            horizontalAlign: HorizontalAlign.RIGHT,
        };
        const cell = {
            actualRow: 1,
            actualColumn: 2,
            mergeInfo: {
                startX: 20,
                endX: 60,
                startY: 10,
                endY: 30,
            },
        };
        const skeleton = {
            getFont: () => font,
            getCellWithCoordByIndex: () => cell,
            overflowCache: {
                forValue: (cb: (r: number, c: number, range: { startRow: number; endRow: number; startColumn: number; endColumn: number }) => void) => {
                    cb(1, 2, { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 });
                },
            },
        };
        const worksheet = {
            getSheetBySheetId: undefined,
            getSheetId: () => 'sheet-1',
            getCell: () => ({ fontRenderExtension: { topOffset: 1, leftOffset: 2 } }),
        };
        const workbook = {
            getUnitId: () => 'unit-1',
            getSheetBySheetId: () => worksheet,
        };
        const renderManagerService = {
            getRenderById: () => ({
                with: () => ({
                    getSkeletonParam: () => ({ skeleton }),
                }),
            }),
        };
        const injector = createAccessor([
            [IUniverInstanceService, { getUnit: () => workbook }],
            [IRenderManagerService, renderManagerService],
        ]);

        const result = getCustomRangePosition(injector, 'unit-1', 'sheet-1', 1, 2, 'range-1');
        expect(result?.label).toBe('abcd');
        expect(result?.rects).toEqual([{ top: 32, bottom: 34, left: 58, right: 60 }]);
        cursorSpy.mockRestore();
    });

    it('getCustomRangePosition returns null for missing workbook/worksheet/customRange', () => {
        const noWorkbookInjector = createAccessor([
            [IUniverInstanceService, { getUnit: () => null }],
            [IRenderManagerService, { getRenderById: () => null }],
        ]);
        expect(getCustomRangePosition(noWorkbookInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const workbook = { getSheetBySheetId: () => null };
        const noWorksheetInjector = createAccessor([
            [IUniverInstanceService, { getUnit: () => workbook }],
            [IRenderManagerService, { getRenderById: () => null }],
        ]);
        expect(getCustomRangePosition(noWorksheetInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const worksheet = { getSheetId: () => 'sheet-1' };
        const emptyDocSkeleton = createDocSkeleton('other-id');
        const skeleton = {
            getFont: () => ({
                documentSkeleton: emptyDocSkeleton,
                verticalAlign: VerticalAlign.BOTTOM,
                horizontalAlign: HorizontalAlign.RIGHT,
            }),
            getCellWithCoordByIndex: () => ({
                actualRow: 1,
                actualColumn: 2,
                mergeInfo: { startX: 0, endX: 10, startY: 0, endY: 10 },
            }),
            overflowCache: { forValue: () => {} },
        };
        const noRangeInjector = createAccessor([
            [IUniverInstanceService, { getUnit: () => ({ getUnitId: () => 'unit-1', getSheetBySheetId: () => worksheet }) }],
            [IRenderManagerService, { getRenderById: () => ({ with: () => ({ getSkeletonParam: () => ({ skeleton }) }) }) }],
        ]);
        expect(getCustomRangePosition(noRangeInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const noSkeletonInjector = createAccessor([
            [IUniverInstanceService, { getUnit: () => ({ getUnitId: () => 'unit-1', getSheetBySheetId: () => worksheet }) }],
            [IRenderManagerService, { getRenderById: () => ({ with: () => ({ getSkeletonParam: () => null }) }) }],
        ]);
        expect(getCustomRangePosition(noSkeletonInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeUndefined();

        const noDocSkeletonInjector = createAccessor([
            [IUniverInstanceService, { getUnit: () => ({ getUnitId: () => 'unit-1', getSheetBySheetId: () => worksheet }) }],
            [IRenderManagerService, {
                getRenderById: () => ({
                    with: () => ({
                        getSkeletonParam: () => ({
                            skeleton: {
                                getFont: () => null,
                            },
                        }),
                    }),
                }),
            }],
        ]);
        expect(getCustomRangePosition(noDocSkeletonInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();
    });

    it('getEditingCustomRangePosition handles guards and success path', () => {
        const cursorSpy = spyCursorRange();
        const docSkeleton = createDocSkeleton();
        const editorBridgeService = {
            getEditCellState: () => ({ editorUnitId: 'doc-1', unitId: 'unit-1', sheetId: 'sheet-1', row: 1, column: 2 }),
            isVisible: () => ({ visible: true }),
        };
        const renderManagerService = {
            getRenderById: (id: string) => {
                if (id === 'doc-1') {
                    return {
                        with: () => ({ getSkeleton: () => docSkeleton }),
                        engine: {
                            getCanvasElement: () => ({
                                getBoundingClientRect: () => ({ top: 100, left: 200 }),
                            }),
                        },
                    };
                }
                if (id === 'unit-1') {
                    return {
                        with: () => ({ getSkeletonParam: () => ({ skeleton: {} }) }),
                    };
                }
                return null;
            },
        };
        const injector = createAccessor([
            [IEditorBridgeService, editorBridgeService],
            [IRenderManagerService, renderManagerService],
        ]);

        const result = getEditingCustomRangePosition(injector, 'unit-1', 'sheet-1', 1, 2, 'range-1');
        expect(result?.label).toBe('abcd');
        expect(result?.rects).toEqual([{ top: 97, bottom: 107, left: 202, right: 204 }]);

        const noStateInjector = createAccessor([
            [IEditorBridgeService, { getEditCellState: () => null, isVisible: () => ({ visible: true }) }],
            [IRenderManagerService, renderManagerService],
        ]);
        expect(getEditingCustomRangePosition(noStateInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const hiddenInjector = createAccessor([
            [IEditorBridgeService, { getEditCellState: () => ({ editorUnitId: 'doc-1', unitId: 'unit-1', sheetId: 'sheet-1', row: 1, column: 2 }), isVisible: () => ({ visible: false }) }],
            [IRenderManagerService, renderManagerService],
        ]);
        expect(getEditingCustomRangePosition(hiddenInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const mismatchedCellInjector = createAccessor([
            [IEditorBridgeService, { getEditCellState: () => ({ editorUnitId: 'doc-1', unitId: 'unit-1', sheetId: 'sheet-1', row: 9, column: 2 }), isVisible: () => ({ visible: true }) }],
            [IRenderManagerService, renderManagerService],
        ]);
        expect(getEditingCustomRangePosition(mismatchedCellInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const missingRendererInjector = createAccessor([
            [IEditorBridgeService, editorBridgeService],
            [IRenderManagerService, { getRenderById: () => null }],
        ]);
        expect(getEditingCustomRangePosition(missingRendererInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();

        const noEditingRangeInjector = createAccessor([
            [IEditorBridgeService, editorBridgeService],
            [IRenderManagerService, {
                getRenderById: (id: string) => {
                    if (id === 'doc-1') {
                        return {
                            with: () => ({ getSkeleton: () => createDocSkeleton('other-id') }),
                            engine: {
                                getCanvasElement: () => ({
                                    getBoundingClientRect: () => ({ top: 100, left: 200 }),
                                }),
                            },
                        };
                    }
                    return {
                        with: () => ({ getSkeletonParam: () => ({ skeleton: {} }) }),
                    };
                },
            }],
        ]);
        expect(getEditingCustomRangePosition(noEditingRangeInjector, 'unit-1', 'sheet-1', 1, 2, 'range-1')).toBeNull();
        cursorSpy.mockRestore();
    });
});
