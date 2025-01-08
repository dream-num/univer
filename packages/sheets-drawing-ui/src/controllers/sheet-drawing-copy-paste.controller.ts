/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IMutationInfo, IRange, Nullable } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import type { IDiscreteRange, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { Disposable, Tools } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { COPY_TYPE, ISheetClipboardService, PREDEFINED_HOOK_NAME, SheetSkeletonManagerService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';

export class SheetsDrawingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        drawings: ISheetDrawing[];
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        // @Inject(ISheetSelectionRenderService) private readonly _selectionRenderService: ISheetSelectionRenderService,

        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,

        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService
        // @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._initCopyPaste();
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_IMAGE_UI_PLUGIN',
            onBeforeCopy: (unitId, subUnitId, range) => this._collect(unitId, subUnitId, range),
            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pastedRange, unitId, subUnitId } = pasteTo;
                return this._generateMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });
            },
            onPastePlainText: (pasteTo: ISheetDiscreteRangeLocation, clipText: string) => {
                return { undos: [], redos: [] };
            },
        });
    }

    private _collect(unitId: string, subUnitId: string, range: IRange) {
        const skeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
        if (!skeletonManagerService) return;

        const selectionRect = skeletonManagerService.attachRangeWithCoord(range);
        if (!selectionRect) {
            return;
        }

        const { startX, endX, startY, endY } = selectionRect;
        const drawings = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const containedDrawings: ISheetDrawing[] = [];
        Object.keys(drawings).forEach((drawingId) => {
            const drawing = drawings[drawingId];
            const { transform } = drawing;
            if (drawing.anchorType !== SheetDrawingAnchorType.Both) {
                return;
            }
            if (!transform) {
                return;
            }
            const { left = 0, top = 0, width = 0, height = 0 } = transform;
            const { drawingStartX, drawingEndX, drawingStartY, drawingEndY } = {
                drawingStartX: left,
                drawingEndX: left + width,
                drawingStartY: top,
                drawingEndY: top + height,
            };

            if (startX <= drawingStartX && drawingEndX <= endX && startY <= drawingStartY && drawingEndY <= endY) {
                containedDrawings.push(drawing);
            }
        });
        if (containedDrawings.length) {
            this._copyInfo = {
                drawings: containedDrawings,
                unitId,
                subUnitId,
            };
        }
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: IPasteHookValueType;
            unitId: string;
            subUnitId: string;
        }
    ) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }

        const specialPastes: IPasteHookValueType[] = [
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
            PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
        ];
        if (specialPastes.includes(copyInfo.pasteType)) {
            return { redos: [], undos: [] };
        }

        const { copyRange } = copyInfo;
        if (!copyRange) {
            return { redos: [], undos: [] };
        }
        const { drawings, unitId, subUnitId } = this._copyInfo;
        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pastedRange]);
        const { row: copyRow, col: copyCol } = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
        const { row: pasteRow, col: pasteCol } = mapFunc(vPastedRange.startRow, vPastedRange.startColumn);

        const skeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);

        if (!skeletonManagerService) {
            return { redos: [], undos: [] };
        }

        const copyRect = skeletonManagerService.attachRangeWithCoord({
            startRow: copyRow,
            endRow: copyRow,
            startColumn: copyCol,
            endColumn: copyCol,
        });
        const pasteRect = skeletonManagerService.attachRangeWithCoord({
            startRow: pasteRow,
            endRow: pasteRow,
            startColumn: pasteCol,
            endColumn: pasteCol,
        });
        if (!copyRect || !pasteRect) {
            return { redos: [], undos: [] };
        }
        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];
        const leftOffset = pasteRect.startX - copyRect.startX;
        const topOffset = pasteRect.startY - copyRect.startY;
        const rowOffset = pasteRow - copyRow;
        const columnOffset = pasteCol - copyCol;
        const isCut = copyInfo.copyType === COPY_TYPE.CUT;
        const { _sheetDrawingService } = this;
        drawings.forEach((drawing) => {
            const { transform, sheetTransform } = drawing;
            if (!transform) {
                return;
            }

            const drawingObject: Partial<ISheetDrawing> = {
                ...drawing,
                unitId,
                subUnitId,
                drawingId: isCut ? drawing.drawingId : Tools.generateRandomId(),
                transform: {
                    ...transform,
                    left: transform.left! + leftOffset,
                    top: transform.top! + topOffset,
                },
                sheetTransform: {
                    to: { ...sheetTransform.to, row: sheetTransform.to.row + rowOffset, column: sheetTransform.to.column + columnOffset },
                    from: { ...sheetTransform.from, row: sheetTransform.from.row + rowOffset, column: sheetTransform.from.column + columnOffset },
                },
            };

            if (isCut) {
                const { undo, redo, objects } = _sheetDrawingService.getBatchUpdateOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: redo,
                        objects,
                    },
                });
                undos.push({
                    id: SetDrawingApplyMutation.id,
                    params: {
                        unitId,
                        subUnitId,
                        type: DrawingApplyType.UPDATE,
                        op: undo,
                        objects,
                    },
                });
            } else {
                const { undo, redo, objects } = _sheetDrawingService.getBatchAddOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({ id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.INSERT } });
                undos.push({ id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE } });
            }
        });

        return {
            redos,
            undos,
        };
    }
}
