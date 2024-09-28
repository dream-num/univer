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
import type { ISheetDrawing, ISheetImage } from '@univerjs/sheets-drawing';
import type { IDiscreteRange, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import { Disposable, LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';
import { DrawingTypeEnum, type IDrawingJsonUndo1, IDrawingManagerService, ImageSourceType } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DrawingApplyType, SetDrawingApplyMutation, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { COPY_TYPE, discreteRangeToRange, ISheetClipboardService, PREDEFINED_HOOK_NAME, SheetSkeletonManagerService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { InsertFloatImageCommand } from '../commands/commands/insert-image.command';

function base64ToBlob(base64: string) {
    const arr = base64.split(',');
    const binStr = atob(arr[1]);
    const len = binStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
    }

    return new Blob([bytes], { type: 'image/png' });
}

function copyBase64ToClipboard(base64: string) {
    const item = new ClipboardItem({ 'image/png': base64ToBlob(base64) });
    navigator.clipboard.write([item]).catch((err) => {
        console.error('Could not copy image using clipboard API: ', err);
    });
}

@OnLifecycle(LifecycleStages.Ready, SheetsDrawingCopyPasteController)
export class SheetsDrawingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        drawings: ISheetDrawing[];
        copyRange: IRange;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingService: IDrawingManagerService
    ) {
        super();
        this._initCopyPaste();
    }

    private get _focusedDrawings() {
        return this._drawingService.getFocusDrawings() as ISheetDrawing[];
    }

    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_IMAGE_UI_PLUGIN',
            onBeforeCopy: (unitId, subUnitId, range) => {
                navigator.clipboard.writeText(''); // clear clipboard
                this._copyInfo = this._createCopyInfo(unitId, subUnitId, range);
            },
            onAfterCopy: () => {
                const focusDrawings = this._focusedDrawings;

                if (focusDrawings.length > 0) {
                    const [drawing] = focusDrawings;

                    if (drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
                        const imageDrawing = drawing as ISheetImage;
                        if (imageDrawing.imageSourceType === ImageSourceType.BASE64) {
                            setTimeout(() => {
                                copyBase64ToClipboard(imageDrawing.source);
                            });
                        }
                    }
                }
            },

            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                if (!this._copyInfo) {
                    return { redos: [], undos: [] };
                }
                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pastedRange, unitId, subUnitId } = pasteTo;
                const mutations = this._generatePasteCellMutations(pastedRange, { copyType, pasteType, copyRange, unitId, subUnitId });

                return mutations;
            },
            onPastePlainText: (pasteTo: ISheetDiscreteRangeLocation, clipText: string) => {
                return { undos: [], redos: [] };
            },

            onPasteFiles: (pasteTo: ISheetDiscreteRangeLocation, files) => {
                if (this._copyInfo) {
                    // Paste image from internal
                    const { unitId, subUnitId } = pasteTo;
                    const { copyRange } = this._copyInfo;
                    const pasteRange = discreteRangeToRange(pasteTo.range);
                    const mutations = this._generateMutations({ row: pasteRange.startRow, col: pasteRange.startColumn }, { row: copyRange.startRow, col: copyRange.startColumn }, {
                        unitId,
                        subUnitId,
                        copyType: COPY_TYPE.COPY,
                    });
                    return mutations;
                } else {
                    // Paste image from external
                    const images = files.filter((file) => file.type.includes('image'));
                    if (images.length) {
                        return {
                            undos: [],
                            redos: [
                                {
                                    id: InsertFloatImageCommand.id,
                                    params: { files: images },
                                },
                            ],
                        };
                    }
                }

                return { undos: [], redos: [] };
            },
        });
    }

    private _createCopyInfo(unitId: string, subUnitId: string, range: IRange) {
        const skeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);
        if (!skeletonManagerService) return;

        const selectionRect = skeletonManagerService.attachRangeWithCoord(range);
        if (!selectionRect) {
            return;
        }

        const { startX, endX, startY, endY } = selectionRect;
        const drawings = this._drawingService.getDrawingData(unitId, subUnitId);

        const containedDrawings: ISheetDrawing[] = this._focusedDrawings.slice();

        Object.keys(drawings).forEach((drawingId) => {
            const drawing = drawings[drawingId];
            const { transform } = drawing;
            if ((drawing as ISheetDrawing).anchorType !== SheetDrawingAnchorType.Both) {
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
                containedDrawings.push(drawing as ISheetDrawing);
            }
        });

        if (containedDrawings.length) {
            return {
                copyRange: range,
                drawings: containedDrawings,
                unitId,
                subUnitId,
            };
        }
    }

    private _generateMutations(toCell: { row: number; col: number }, fromCell: { row: number; col: number }, payload: {
        unitId: string;
        subUnitId: string;
        copyType: COPY_TYPE;
    }) {
        if (!this._copyInfo) {
            return { redos: [], undos: [] };
        }
        const { unitId, subUnitId, copyType } = payload;
        const { drawings } = this._copyInfo;

        const skeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);

        if (!skeletonManagerService) {
            return { redos: [], undos: [] };
        }

        const { row: copyRow, col: copyCol } = fromCell;
        const { row: pasteRow, col: pasteCol } = toCell;

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
        const isCut = copyType === COPY_TYPE.CUT;
        const { _drawingService } = this;

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
                const { undo, redo, objects } = _drawingService.getBatchUpdateOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
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
                const { undo, redo, objects } = _drawingService.getBatchAddOp([drawingObject] as ISheetDrawing[]) as IDrawingJsonUndo1;
                redos.push({ id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.INSERT } });
                undos.push({ id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE } });
            }
        });

        return {
            redos,
            undos,
        };
    }

    private _generatePasteCellMutations(
        pastedRange: IDiscreteRange,
        copyInfo: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
            pasteType: string;
            unitId: string;
            subUnitId: string;
        }
    ) {
        if (
            [
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
                PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
            ].includes(
                copyInfo.pasteType
            )
        ) {
            return { redos: [], undos: [] };
        }

        const { copyRange } = copyInfo;
        if (!copyRange) {
            return { redos: [], undos: [] };
        }

        const { unitId } = this._copyInfo!;
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

        return this._generateMutations({ row: pasteRow, col: pasteCol }, { row: copyRow, col: copyCol }, copyInfo);
    }
}
