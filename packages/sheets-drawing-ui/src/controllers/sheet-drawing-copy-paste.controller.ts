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

import type { IMutationInfo, IRange, Nullable } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { ISheetDrawing, ISheetImage } from '@univerjs/sheets-drawing';
import type { IDiscreteRange, IPasteHookValueType, ISheetDiscreteRangeLocation } from '@univerjs/sheets-ui';
import type { IDeleteDrawingCommandParams } from '../commands/commands/interfaces';
import { Disposable, DrawingTypeEnum, ICommandService, Tools } from '@univerjs/core';
import { IDrawingManagerService, ImageSourceType } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DrawingApplyType, SetDrawingApplyMutation, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';

import { COPY_TYPE, discreteRangeToRange, ISheetClipboardService, ISheetSelectionRenderService, PREDEFINED_HOOK_NAME, SheetSkeletonManagerService, virtualizeDiscreteRanges } from '@univerjs/sheets-ui';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { transformToDrawingPosition } from '../basics/transform-position';
import { InsertFloatImageCommand } from '../commands/commands/insert-image.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';

const IMAGE_PNG_MIME_TYPE = 'image/png';

function base64ToBlob(base64: string) {
    const arr = base64.split(',');
    const binStr = atob(arr[1]);
    const len = binStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binStr.charCodeAt(i);
    }

    return new Blob([bytes], { type: IMAGE_PNG_MIME_TYPE });
}

function copyBase64ToClipboard(base64: string) {
    const item = new ClipboardItem({ [IMAGE_PNG_MIME_TYPE]: base64ToBlob(base64) });
    navigator.clipboard.write([item]).catch((err) => {
        console.error('Could not copy image using clipboard API: ', err);
    });
}

function focusDocument() {
    function createInputElement() {
        const input = document.createElement('input');
        input.style.position = 'absolute';
        input.style.height = '1px';
        input.style.width = '1px';
        input.style.opacity = '0';

        return input;
    }

    const activeElement = document.activeElement;
    const input = createInputElement();
    document.body.appendChild(input);
    input.focus();

    return () => {
        input.blur();
        document.body.removeChild(input);
        if (activeElement instanceof HTMLElement) {
            activeElement.focus();
        }
    };
}

const specialPastes: IPasteHookValueType[] = [
    PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
    PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE,
    PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
    PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMULA,
];

export class SheetsDrawingCopyPasteController extends Disposable {
    private _copyInfo: Nullable<{
        drawings: ISheetDrawing[];
        copyRange?: IRange;
        unitId: string;
        subUnitId: string;
    }>;

    constructor(
        @ISheetClipboardService private _sheetClipboardService: ISheetClipboardService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IDrawingManagerService private readonly _drawingService: IDrawingManagerService,
        @IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
        this._initCopyPaste();
    }

    private get _focusedDrawings() {
        return this._drawingService.getFocusDrawings() as ISheetDrawing[];
    }

    // eslint-disable-next-line max-lines-per-function
    private _initCopyPaste() {
        this._sheetClipboardService.addClipboardHook({
            id: 'SHEET_IMAGE_UI_PLUGIN',

            onBeforeCopy: (unitId, subUnitId, range, copyType) => {
                const focusDrawings = this._focusedDrawings;
                if (focusDrawings.length > 0) {
                    // handle single drawing copy
                    const [drawing] = focusDrawings;

                    if (copyType === COPY_TYPE.CUT) {
                        const params: IDeleteDrawingCommandParams = {
                            unitId,
                            drawings: [drawing],
                        };
                        // Delete the drawing when it is cut
                        this._commandService.executeCommand(RemoveSheetDrawingCommand.id, params);
                    }

                    setTimeout(() => {
                        // Rewrite the clipboard content to prevent the default copy behavior, prevent to call the 'onPasteCells'
                        const dispose = focusDocument();
                        if (drawing.drawingType === DrawingTypeEnum.DRAWING_IMAGE
                            && (drawing as ISheetImage).imageSourceType === ImageSourceType.BASE64) {
                            copyBase64ToClipboard((drawing as ISheetImage).source);
                        } else {
                            this._clipboardInterfaceService.writeText('');
                        }
                        dispose();
                    }, 200);

                    const newCopyInfo = {
                        unitId: drawing.unitId,
                        subUnitId: drawing.subUnitId,
                        drawings: [drawing],
                    };

                    this._copyInfo = newCopyInfo;
                } else {
                    // handle copy range that contained drawings
                    const newCopyInfo = this._createDrawingsCopyInfoByRange(unitId, subUnitId, range);
                    this._copyInfo = newCopyInfo;
                }
            },

            onPasteCells: (pasteFrom, pasteTo, data, payload) => {
                if (!this._copyInfo) {
                    return { redos: [], undos: [] };
                }

                const { copyType = COPY_TYPE.COPY, pasteType } = payload;
                const { range: copyRange } = pasteFrom || {};
                const { range: pasteRange, unitId, subUnitId } = pasteTo;

                const mutations = this._copyInfo.copyRange
                    ? this._generateRangeDrawingsPasteMutations({ pasteType, unitId, subUnitId, pasteRange }, { copyRange, copyType })
                    : this._generateSingleDrawingPasteMutations({ pasteTo, pasteType }, COPY_TYPE.COPY);

                return mutations;
            },

            onPastePlainText: (pasteTo: ISheetDiscreteRangeLocation, clipText: string) => {
                return { undos: [], redos: [] };
            },

            onPasteUnrecognized: (pasteTo: ISheetDiscreteRangeLocation) => {
                if (this._copyInfo) {
                    return this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME.DEFAULT_PASTE }, COPY_TYPE.COPY);
                } else {
                    return { undos: [], redos: [] };
                }
            },

            onPasteFiles: (pasteTo: ISheetDiscreteRangeLocation, files) => {
                if (this._copyInfo) {
                    return this._generateSingleDrawingPasteMutations({ pasteTo, pasteType: PREDEFINED_HOOK_NAME.DEFAULT_PASTE }, COPY_TYPE.COPY);
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

    private _createDrawingsCopyInfoByRange(unitId: string, subUnitId: string, range: IRange) {
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

    private _generateSingleDrawingPasteMutations(pasteContext: {
        pasteTo: ISheetDiscreteRangeLocation;
        pasteType: IPasteHookValueType;
    }, copyType: COPY_TYPE) {
        const { pasteType, pasteTo } = pasteContext;

        if (specialPastes.includes(pasteType)) {
            return { redos: [], undos: [] };
        }

        const { unitId, subUnitId, range } = pasteTo;
        const render = this._renderManagerService.getRenderById(unitId);
        const skeletonManagerService = render?.with(SheetSkeletonManagerService);
        const selectionRenderService = render?.with(ISheetSelectionRenderService);

        const copyInfo = this._copyInfo!;

        if (!skeletonManagerService || !selectionRenderService) {
            return { redos: [], undos: [] };
        }

        const { drawings } = copyInfo;

        const pasteRange = discreteRangeToRange(range);

        return this._generateMutations(drawings, {
            unitId,
            subUnitId,
            isCut: copyType === COPY_TYPE.CUT,
            getTransform: (transform, sheetTransform) => {
                const pasteRect = skeletonManagerService.attachRangeWithCoord({
                    startRow: pasteRange.startRow,
                    endRow: pasteRange.endRow,
                    startColumn: pasteRange.startColumn,
                    endColumn: pasteRange.endColumn,
                });

                const newTransform = {
                    ...transform,
                    left: pasteRect?.startX,
                    top: pasteRect?.startY,
                };

                return {
                    transform: newTransform,
                    sheetTransform: transformToDrawingPosition(newTransform, selectionRenderService) ?? sheetTransform,
                };
            },
        });
    }

    private _generateMutations(drawings: ISheetDrawing[], payload: {
        unitId: string;
        subUnitId: string;
        getTransform: (transform: ISheetDrawing['transform'], sheetTransform: ISheetDrawing['sheetTransform']) => {
            transform: ISheetDrawing['transform'];
            sheetTransform: ISheetDrawing['sheetTransform'];
        };
        isCut: boolean;
    }) {
        const {
            unitId,
            subUnitId,
            getTransform,
            isCut,
        } = payload;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const { _drawingService } = this;

        drawings.forEach((drawing) => {
            const { transform, sheetTransform } = drawing;
            if (!transform) {
                return;
            }
            const transformContext = getTransform(transform, sheetTransform);
            const drawingObject: Partial<ISheetDrawing> = {
                ...drawing,
                unitId,
                subUnitId,
                drawingId: isCut ? drawing.drawingId : Tools.generateRandomId(),
                transform: transformContext.transform,
                sheetTransform: transformContext.sheetTransform,
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

        return { redos, undos };
    }

    // eslint-disable-next-line max-lines-per-function
    private _generateRangeDrawingsPasteMutations(
        pasteContext: {
            unitId: string;
            subUnitId: string;
            pasteRange: IDiscreteRange;
            pasteType: IPasteHookValueType;
        },
        copyContext: {
            copyType: COPY_TYPE;
            copyRange?: IDiscreteRange;
        }
    ) {
        const {
            unitId,
            subUnitId,
            pasteType,
            pasteRange,
        } = pasteContext;

        const {
            copyRange,
            copyType,
        } = copyContext;

        if (specialPastes.includes(pasteType)) {
            return { redos: [], undos: [] };
        }

        const skeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService);

        if (!skeletonManagerService || !this._copyInfo) {
            return { redos: [], undos: [] };
        }

        const { drawings } = this._copyInfo;

        if (!copyRange) {
            return this._generateSingleDrawingPasteMutations({
                pasteTo: { unitId, subUnitId, range: discreteRangeToRange(pasteRange) as unknown as IDiscreteRange },
                pasteType,
            }, copyType);
        }

        const { ranges: [vCopyRange, vPastedRange], mapFunc } = virtualizeDiscreteRanges([copyRange, pasteRange]);
        const { row: copyRow, col: copyCol } = mapFunc(vCopyRange.startRow, vCopyRange.startColumn);
        const { row: pasteRow, col: pasteCol } = mapFunc(vPastedRange.startRow, vPastedRange.startColumn);

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

        if (!copyRect || !pasteRect || !this._copyInfo) {
            return { redos: [], undos: [] };
        }

        const leftOffset = pasteRect.startX - copyRect.startX;
        const topOffset = pasteRect.startY - copyRect.startY;
        const rowOffset = pasteRow - copyRow;
        const columnOffset = pasteCol - copyCol;

        return this._generateMutations(drawings, {
            unitId,
            subUnitId,
            getTransform: (transform, sheetTransform) => ({
                transform: {
                    ...transform,
                    left: (transform?.left ?? 0) + leftOffset,
                    top: (transform?.top ?? 0) + topOffset,
                },
                sheetTransform: {
                    ...sheetTransform,
                    to: {
                        ...sheetTransform.to,
                        row: sheetTransform.to.row + rowOffset,
                        column: sheetTransform.to.column + columnOffset,
                    },
                    from: {
                        ...sheetTransform.from,
                        row: sheetTransform.from.row + rowOffset,
                        column: sheetTransform.from.column + columnOffset,
                    },
                },
            }),
            isCut: copyType === COPY_TYPE.CUT,
        });
    }
}
