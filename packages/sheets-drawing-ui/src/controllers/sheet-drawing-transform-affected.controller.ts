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

import type { ICommandInfo, IGridRange, IMutationInfo, IRange, IUnitRange, Nullable } from '@univerjs/core';
import { Disposable, ICommandService, IDrawingManagerService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import type { IInsertColCommandParams, IInsertColMutationParams, IInsertRowCommandParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowColCommandParams, IRemoveRowsMutationParams, ISetColHiddenMutationParams, ISetColVisibleMutationParams, ISetRowHiddenMutationParams, ISetRowVisibleMutationParams, ISetWorksheetColWidthMutationParams, ISetWorksheetRowHeightMutationParams, ISetWorksheetRowIsAutoHeightMutationParams, ISheetDrawing, ISheetDrawingPosition } from '@univerjs/sheets';
import { DrawingApplyType, InsertColCommand, InsertColMutation, InsertRowCommand, InsertRowMutation, ISheetDrawingService, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, SetColHiddenMutation, SetColVisibleMutation, SetDrawingApplyMutation, SetRowHiddenMutation, SetRowVisibleMutation, SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightMutation, SheetInterceptorService } from '@univerjs/sheets';
import { ISelectionRenderService } from '@univerjs/sheets-ui';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import { ClearSheetDrawingTransformerOperation } from '../commands/operations/clear-drawing-transformer.operation';
import { transformImagePositionToTransform } from './utils';

@OnLifecycle(LifecycleStages.Rendered, SheetDrawingTransformAffectedController)
export class SheetDrawingTransformAffectedController extends Disposable {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._sheetInterceptorListener();

        this._sheetRefreshListener();
    }

    private _sheetInterceptorListener() {
        this.disposeWithMe(
            this._sheetInterceptorService.interceptCommand({
                getMutations: (commandInfo) => {
                    if (commandInfo.id === InsertRowMutation.id) {
                        if (commandInfo.params == null) {
                            return { redos: [], undos: [] };
                        }
                        return this._moveRowInterceptor(commandInfo.params as IInsertRowMutationParams, 'insert');
                    } else if (commandInfo.id === InsertColMutation.id) {
                        const params = commandInfo.params as IInsertColMutationParams;
                        if (params == null) {
                            return { redos: [], undos: [] };
                        }
                        return this._moveColInterceptor(params, 'insert');
                    } else if (commandInfo.id === RemoveRowMutation.id) {
                        const params = commandInfo.params as IRemoveRowsMutationParams;
                        if (params == null) {
                            return { redos: [], undos: [] };
                        }
                        return this._moveRowInterceptor(params, 'remove');
                    } else if (commandInfo.id === RemoveColMutation.id) {
                        const params = commandInfo.params as IRemoveColMutationParams;
                        if (params == null) {
                            return { redos: [], undos: [] };
                        }
                        return this._moveColInterceptor(params, 'remove');
                    }
                    return { redos: [], undos: [] };
                },
            })
        );
    }

    private _moveRowInterceptor(params: IInsertRowMutationParams | IRemoveRowsMutationParams, type: 'insert' | 'remove') {
        const { unitId, subUnitId, range } = params;

        const rowStartIndex = range.startRow;
        const rowEndIndex = range.endRow;

        let redos: IMutationInfo[] = [];
        let undos: IMutationInfo[] = [];

        const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(data).forEach((drawingId) => {
            const drawing = data[drawingId];
            const { sheetTransform } = drawing;

            if (sheetTransform == null) {
                return;
            }
            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            if (type === 'insert') {
                newSheetTransform = this._expandRow(sheetTransform, rowStartIndex, rowEndIndex);
            } else {
                const { from, to } = sheetTransform;
                const { row: fromRow } = from;
                const { row: toRow } = to;
                if (fromRow <= rowStartIndex && toRow <= rowEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    newSheetTransform = this._shrinkRow(sheetTransform, rowStartIndex, rowEndIndex);
                }
            }

            if (!newSheetTransform) {
                return;
            }

            const newTransform = transformImagePositionToTransform(newSheetTransform, this._selectionRenderService);
            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform };
            updateDrawings.push(params);
        });

        const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const { undo, redo, objects } = updateJsonOp;

        const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const deleteUndo = deleteJsonOp.undo;
        const deleteRedo = deleteJsonOp.redo;
        const deleteObjects = deleteJsonOp.objects;

        redos = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } },
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: DrawingApplyType.REMOVE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];

        undos = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } },
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: DrawingApplyType.INSERT } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];

        return {
            redos,
            undos,
        };
    }

    private _moveColInterceptor(params: IInsertColMutationParams | IRemoveColMutationParams, type: 'insert' | 'remove') {
        const { unitId, subUnitId, range } = params;

        const colStartIndex = range.startColumn;
        const colEndIndex = range.endColumn;

        let redos: IMutationInfo[] = [];
        let undos: IMutationInfo[] = [];

        const data = this._sheetDrawingService.getDrawingData(unitId, subUnitId);
        const updateDrawings: Partial<ISheetDrawing>[] = [];
        const deleteDrawings: Partial<ISheetDrawing>[] = [];

        Object.keys(data).forEach((drawingId) => {
            const drawing = data[drawingId];
            const { sheetTransform } = drawing;

            if (sheetTransform == null) {
                return;
            }
            let newSheetTransform: Nullable<ISheetDrawingPosition>;
            if (type === 'insert') {
                newSheetTransform = this._expandCol(sheetTransform, colStartIndex, colEndIndex);
            } else {
                const { from, to } = sheetTransform;
                const { column: fromColumn } = from;
                const { column: toColumn } = to;
                if (fromColumn <= colStartIndex && toColumn <= colEndIndex) {
                    // delete drawing
                    deleteDrawings.push({ unitId, subUnitId, drawingId });
                } else {
                    newSheetTransform = this._shrinkCol(sheetTransform, colStartIndex, colEndIndex);
                }
            }

            if (!newSheetTransform) {
                return;
            }

            const newTransform = transformImagePositionToTransform(newSheetTransform, this._selectionRenderService);
            const params = { unitId, subUnitId, drawingId, transform: newTransform, sheetTransform: newSheetTransform };
            updateDrawings.push(params);
        });

        const updateJsonOp = this._sheetDrawingService.getBatchUpdateOp(updateDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const { undo, redo, objects } = updateJsonOp;

        const deleteJsonOp = this._sheetDrawingService.getBatchRemoveOp(deleteDrawings as ISheetDrawing[]) as IDrawingJsonUndo1;
        const deleteUndo = deleteJsonOp.undo;
        const deleteRedo = deleteJsonOp.redo;
        const deleteObjects = deleteJsonOp.objects;

        redos = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } },
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteRedo, objects: deleteObjects, type: DrawingApplyType.REMOVE } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];

        undos = [
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } },
            { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: deleteUndo, objects: deleteObjects, type: DrawingApplyType.INSERT } },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];

        return {
            redos,
            undos,
        };
    }

    private _expandCol(sheetTransform: ISheetDrawingPosition, colStartIndex: number, colEndIndex: number): Nullable<ISheetDrawingPosition> {
        const colCount = colEndIndex - colStartIndex + 1;

        const { from, to } = sheetTransform;

        const { column: fromColumn } = from;
        const { column: toColumn } = to;

        if (fromColumn >= colStartIndex) {
            // move start and end col right
            return {
                from: {
                    ...from,
                    column: fromColumn + colCount,
                },
                to: {
                    ...to,
                    column: toColumn + colCount,
                },
            };
        } else if (toColumn >= colEndIndex) {
            // move end right only
            return {
                from: { ...from },
                to: {
                    ...to,
                    column: toColumn + colCount,
                },
            };
        }

        return null;
    }

    private _shrinkCol(sheetTransform: ISheetDrawingPosition, colStartIndex: number, colEndIndex: number): Nullable<ISheetDrawingPosition> {
        const colCount = colEndIndex - colStartIndex + 1;

        const { from, to } = sheetTransform;

        const { column: fromColumn } = from;
        const { column: toColumn } = to;

        if (fromColumn > colEndIndex) {
            // shrink start and end col left only
            return {
                from: {
                    ...from,
                    column: fromColumn - colCount,
                },
                to: {
                    ...to,
                    column: toColumn - colCount,
                },
            };
        } else if (fromColumn <= colStartIndex && toColumn <= colEndIndex) {
            // delete drawing
            return null;
        } else if (fromColumn < colStartIndex && toColumn > colEndIndex) {
            // shrink end left only
            return {
                from: { ...from },
                to: {
                    ...to,
                    column: toColumn - colCount,
                },
            };
        } else if (fromColumn >= colStartIndex && fromColumn <= colEndIndex) {
            // shrink start and end col left, then set fromColOffset to 0
            return {
                from: {
                    ...from,
                    column: colStartIndex,
                    columnOffset: 0,
                },
                to: {
                    ...to,
                    column: toColumn - colEndIndex,
                },
            };
        } else if (toColumn >= colStartIndex && toColumn <= colEndIndex) {
            // shrink end col left, then set toColOffset to full cell width
            const selectionCell = this._selectionRenderService.attachRangeWithCoord({
                startColumn: colStartIndex - 1,
                endColumn: colStartIndex - 1,
                startRow: from.row,
                endRow: to.row,
            });

            if (selectionCell == null) {
                return;
            }
            return {
                from: {
                    ...from,
                },
                to: {
                    ...to,
                    column: colStartIndex - 1,
                    columnOffset: selectionCell.endX - selectionCell.startX,
                },
            };
        }

        return null;
    }

    private _expandRow(sheetTransform: ISheetDrawingPosition, rowStartIndex: number, rowEndIndex: number): Nullable<ISheetDrawingPosition> {
        const rowCount = rowEndIndex - rowStartIndex + 1;

        const { from, to } = sheetTransform;

        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (fromRow >= rowStartIndex) {
            // move start and end row down
            return {
                from: {
                    ...from,
                    row: fromRow + rowCount,
                },
                to: {
                    ...to,
                    row: toRow + rowCount,
                },
            };
        } else if (toRow >= rowEndIndex) {
            // move end down only
            return {
                from: { ...from },
                to: {
                    ...to,
                    row: toRow + rowCount,
                },
            };
        }

        return null;
    }

    private _shrinkRow(sheetTransform: ISheetDrawingPosition, rowStartIndex: number, rowEndIndex: number): Nullable<ISheetDrawingPosition> {
        const rowCount = rowEndIndex - rowStartIndex + 1;

        const { from, to } = sheetTransform;

        const { row: fromRow } = from;
        const { row: toRow } = to;

        if (fromRow > rowEndIndex) {
            // shrink start and end up only
            return {
                from: {
                    ...from,
                    row: fromRow - rowCount,
                },
                to: {
                    ...to,
                    row: toRow - rowCount,
                },
            };
        } else if (fromRow <= rowStartIndex && toRow <= rowEndIndex) {
            // delete drawing
            return null;
        } else if (fromRow < rowStartIndex && toRow > rowEndIndex) {
            // shrink end up only
            return {
                from: { ...from },
                to: {
                    ...to,
                    row: toRow - rowCount,
                },
            };
        } else if (fromRow >= rowStartIndex && fromRow <= rowEndIndex) {
           // shrink start and end row up, then set fromRowOffset to 0
            return {
                from: {
                    ...from,
                    row: rowStartIndex,
                    rowOffset: 0,
                },
                to: {
                    ...to,
                    row: toRow - rowEndIndex,
                },
            };
        } else if (toRow >= rowStartIndex && toRow <= rowEndIndex) {
            // shrink end row up, then set toRowOffset to full cell height
            const selectionCell = this._selectionRenderService.attachRangeWithCoord({
                startColumn: from.column,
                endColumn: from.column,
                startRow: rowStartIndex - 1,
                endRow: rowStartIndex - 1,
            });

            if (selectionCell == null) {
                return;
            }
            return {
                from: {
                    ...from,
                },
                to: {
                    ...to,
                    row: rowStartIndex - 1,
                    rowOffset: selectionCell.endY - selectionCell.startY,
                },
            };
        }

        return null;
    }

    private _sheetRefreshListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                // SetRowVisibleMutation.id,
                // SetRowHiddenMutation.id,
                // SetColVisibleMutation.id,
                // SetColHiddenMutation.id,
                // SetWorksheetRowHeightMutation.id,
                // SetWorksheetColWidthMutation.id,
                // SetWorksheetRowIsAutoHeightMutation.id,

                const ranges: IUnitRange[] = [];
                if (command.id === SetRowVisibleMutation.id) {
                    const params = command.params as ISetRowVisibleMutationParams;
                } else if (command.id === SetRowHiddenMutation.id) {
                    const params = command.params as ISetRowHiddenMutationParams;
                } else if (command.id === SetColVisibleMutation.id) {
                    const params = command.params as ISetColVisibleMutationParams;
                } else if (command.id === SetColHiddenMutation.id) {
                    const params = command.params as ISetColHiddenMutationParams;
                } else if (command.id === SetWorksheetRowHeightMutation.id) {
                    const params = command.params as ISetWorksheetRowHeightMutationParams;
                } else if (command.id === SetWorksheetColWidthMutation.id) {
                    const params = command.params as ISetWorksheetColWidthMutationParams;
                } else if (command.id === SetWorksheetRowIsAutoHeightMutation.id) {
                    const params = command.params as ISetWorksheetRowIsAutoHeightMutationParams;
                }

                this._refreshDrawingTransform(ranges);
            })
        );
    }

    private _refreshDrawingTransform(ranges: IUnitRange[]) {
        // const sheet = this._univerInstanceService.getUniverSheetInstance();
        // const drawingManager = sheet.getDrawingManager();
        // drawingManager.refresh();
        // const
    }
}
