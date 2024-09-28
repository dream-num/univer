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

import type { ICellData, IMutationInfo, IObjectArrayPrimitiveType, IRange, IStyleData, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams, ISetRangeValuesMutationParams, ISetWorksheetColWidthMutationParams } from '@univerjs/sheets';

import type {
    IApplyFormatPainterCommandParams } from '../../commands/commands/set-format-painter.command';
import type { IFormatPainterHook, ISelectionFormatInfo } from '../../services/format-painter/format-painter.service';
import {
    BooleanNumber,
    Disposable,
    ICommandService,
    Inject,
    Injector,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    RANGE_TYPE,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation, getAddMergeMutationRangeByType, RemoveMergeUndoMutationFactory, RemoveWorksheetMergeMutation, SetColHiddenMutation, SetColVisibleMutation, SetRangeValuesCommand, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory, SetRowHiddenMutation, SetRowVisibleMutation, SetWorksheetColWidthMutation, SetWorksheetColWidthMutationFactory, SetWorksheetRowHeightMutation, SetWorksheetRowHeightMutationFactory, SetWorksheetRowIsAutoHeightMutation, SetWorksheetRowIsAutoHeightMutationFactory, SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import {
    ApplyFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import { checkCellContentInRanges, getClearContentMutationParamsForRanges } from '../../common/utils';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';

@OnLifecycle(LifecycleStages.Steady, FormatPainterController)
export class FormatPainterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
        this._addDefaultHook();
    }

    private _commandExecutedListener() {
        const selectionRenderService = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET)!.with(ISheetSelectionRenderService);

        this.disposeWithMe(
            selectionRenderService.selectionMoveEnd$.subscribe((selections) => {
                if (this._formatPainterService.getStatus() !== FormatPainterStatus.OFF) {
                    const { rangeWithCoord } = selections[selections.length - 1];
                    this._commandService.executeCommand(ApplyFormatPainterCommand.id, {
                        unitId: this._univerInstanceService.getFocusedUnit()?.getUnitId() || '',
                        subUnitId: (this._univerInstanceService.getFocusedUnit() as Workbook).getActiveSheet()?.getSheetId() || '',
                        range: rangeWithCoord,
                    } as IApplyFormatPainterCommandParams);

                    // if once, turn off the format painter
                    if (this._formatPainterService.getStatus() === FormatPainterStatus.ONCE) {
                        this._commandService.executeCommand(SetOnceFormatPainterCommand.id);
                    }
                }
            })
        );
    }

    private _addDefaultHook() {
        const defaultHook: IFormatPainterHook = {
            id: 'default-format-painter',
            priority: 0,
            isDefaultHook: true,
            onStatusChange: (status: FormatPainterStatus) => {
                if (status !== FormatPainterStatus.OFF) {
                    const format = this._collectSelectionRangeFormat();
                    if (format) {
                        this._formatPainterService.setSelectionFormat(format);
                    }
                }
            },
            onApply: (unitId, subUnitId, range, format) => {
                return this._getUndoRedoMutationInfo(unitId, subUnitId, range, format);
            },
        };
        this._formatPainterService.addHook(defaultHook);
    }

    private _collectSelectionRangeFormat() {
        const selection = this._selectionManagerService.getCurrentLastSelection();
        const range = selection?.range;
        if (!range) return null;
        const { startRow, endRow, startColumn, endColumn } = range;
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook?.getActiveSheet();
        if (!worksheet) return null;
        const cellData = worksheet.getCellMatrix();

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        const merges = [];
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellData.getValue(r, c) as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
                const { isMergedMainCell, ...mergeInfo } = worksheet.getCellInfoInMergeData(r, c);
                if (isMergedMainCell) {
                    merges.push({
                        startRow: mergeInfo.startRow,
                        startColumn: mergeInfo.startColumn,
                        endRow: mergeInfo.endRow,
                        endColumn: mergeInfo.endColumn,
                    });
                }
            }
        }

        return {
            styles: stylesMatrix,
            merges,
            range,
        };
    }

    // eslint-disable-next-line max-lines-per-function
    private _getUndoRedoMutationInfo(unitId: string, subUnitId: string, originRange: IRange, format: ISelectionFormatInfo) {
        const sheetInterceptorService = this._sheetInterceptorService;
        const univerInstanceService = this._univerInstanceService;

        const { merges, styles: stylesMatrix, range: sourceRange } = format;
        if (!stylesMatrix || !sourceRange) return { undos: [], redos: [] };

        const { startRow, startColumn, endRow, endColumn } = sourceRange;
        const styleRowsNum = endRow - startRow + 1;
        const styleColsNum = endColumn - startColumn + 1;
        const targetRange = (originRange.startRow === originRange.endRow && originRange.startColumn === originRange.endColumn)
            ? {
                startRow: originRange.startRow,
                startColumn: originRange.startColumn,
                endRow: originRange.startRow + styleRowsNum - 1,
                endColumn: originRange.startColumn + styleColsNum - 1,
                rangeType: RANGE_TYPE.NORMAL,
            }
            : originRange;
        const styleValues: ICellData[][] = Array.from({ length: targetRange.endRow - targetRange.startRow + 1 }, () =>
            Array.from({ length: targetRange.endColumn - targetRange.startColumn + 1 }, () => ({}))
        );
        const mergeRanges: IRange[] = [];

        styleValues.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                const mappedRowIndex = (rowIndex % styleRowsNum) + startRow;
                const mappedColIndex = (colIndex % styleColsNum) + startColumn;
                const style = stylesMatrix.getValue(mappedRowIndex, mappedColIndex);

                if (style) {
                    styleValues[rowIndex][colIndex].s = Object.keys(style).length > 0 ? style : null;
                }
            });
        });

        merges.forEach((merge) => {
            const relatedRange: IRange = {
                startRow: merge.startRow - startRow,
                startColumn: merge.startColumn - startColumn,
                endRow: merge.endRow - startRow,
                endColumn: merge.endColumn - startColumn,
            };
            // merge will apply at least once
            const rowRepeats = Math.max(1, Math.floor((targetRange.endRow - targetRange.startRow + 1) / styleRowsNum));
            const colRepeats = Math.max(1, Math.floor((targetRange.endColumn - targetRange.startColumn + 1) / styleColsNum));
            for (let i = 0; i < rowRepeats; i++) {
                for (let j = 0; j < colRepeats; j++) {
                    mergeRanges.push({
                        startRow: relatedRange.startRow + i * styleRowsNum + targetRange.startRow,
                        startColumn: relatedRange.startColumn + j * styleColsNum + targetRange.startColumn,
                        endRow: relatedRange.endRow + i * styleRowsNum + targetRange.startRow,
                        endColumn: relatedRange.endColumn + j * styleColsNum + targetRange.startColumn,
                    });
                }
            }
        });
        const currentSelections = [targetRange];
        const clearCellValue = new ObjectMatrix<ICellData>();
        const cellValue = new ObjectMatrix<ICellData>();

        if (Tools.isArray(styleValues)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = currentSelections[i];
                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        clearCellValue.setValue(r + startRow, c + startColumn, { s: null });
                        cellValue.setValue(r + startRow, c + startColumn, styleValues[r][c]);
                    }
                }
            }
        }

        const clearStyleMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: clearCellValue.getMatrix(),
        };
        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: cellValue.getMatrix(),
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = this._injector.invoke(
            SetRangeValuesUndoMutationFactory,
            clearStyleMutationParams
        );

        const { undos: interceptorUndos, redos: interceptorRedos } = sheetInterceptorService.onCommandExecute({
            id: SetRangeValuesCommand.id,
            params: { ...setRangeValuesMutationParams, range: currentSelections },
        });

        // handle merge
        const ranges = getAddMergeMutationRangeByType(mergeRanges);

        const mergeRedos: IMutationInfo[] = [];
        const mergeUndos: IMutationInfo[] = [];

        // First we should check if there are values in the going-to-be-merged cells.
        const worksheet = (univerInstanceService.getUnit(unitId) as Workbook).getSheetBySheetId(subUnitId)!;
        const willRemoveSomeCell = checkCellContentInRanges(worksheet, ranges);

        // prepare redo mutations
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        mergeRedos.push({ id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams });
        mergeRedos.push({ id: AddWorksheetMergeMutation.id, params: addMergeMutationParams });

        // prepare undo mutations
        const undoRemoveMergeMutationParams = this._injector.invoke(
            RemoveMergeUndoMutationFactory,
            removeMergeMutationParams
        );
        const undoMutationParams = this._injector.invoke(
            AddMergeUndoMutationFactory,
            addMergeMutationParams
        );
        mergeUndos.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        mergeUndos.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willRemoveSomeCell) {
            const data = this._injector.invoke((accessor) => getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges));
            mergeRedos.unshift(...data.redos);
            mergeUndos.push(...data.undos);
        }

        const { undos: rowUndos, redos: rowRedos } = this._getRowDataMutations(unitId, subUnitId, sourceRange, targetRange, worksheet);
        const { undos: colUndos, redos: colRedos } = this._getColDataMutations(unitId, subUnitId, sourceRange, targetRange, worksheet);

        return {
            undos: [
                { id: SetRangeValuesMutation.id, params: clearStyleMutationParams },
                { id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams },
                ...interceptorUndos,
                ...mergeUndos,
                ...rowUndos,
                ...colUndos,
            ],
            redos: [
                { id: SetRangeValuesMutation.id, params: clearStyleMutationParams },
                { id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams },
                ...interceptorRedos,
                ...mergeRedos,
                ...rowRedos,
                ...colRedos,
            ],
        };
    }

    private _getRowDataMutations(unitId: string, subUnitId: string, sourceRange: IRange, targetRange: IRange, worksheet: Worksheet) {
        const rowUndos: IMutationInfo[] = [];
        const rowRedos: IMutationInfo[] = [];

        const styleRowsNum = sourceRange.endRow - sourceRange.startRow + 1;

        if (targetRange.rangeType === RANGE_TYPE.ROW && sourceRange?.rangeType === RANGE_TYPE.ROW) {
            const hidden = [];
            const visible = [];
            const heights: IObjectArrayPrimitiveType<Nullable<number>> = {};
            const rowManager = worksheet.getRowManager();
            for (let r = targetRange.startRow; r <= targetRange.endRow; r++) {
                const sourceRow = sourceRange.startRow + (r - targetRange.startRow) % styleRowsNum;
                const { h, hd } = rowManager.getRowOrCreate(sourceRow);
                heights[r] = h;
                if (hd !== rowManager.getRowOrCreate(r).hd) {
                    if (hd) {
                        hidden.push(r);
                    } else {
                        visible.push(r);
                    }
                }
            }
            if (hidden.length) {
                const setRowHiddenParams = {
                    unitId,
                    subUnitId,
                    ranges: hidden.map((r) => ({ startRow: r, endRow: r, startColumn: targetRange.startColumn, endColumn: targetRange.endColumn })),
                };
                rowRedos.push({
                    id: SetRowHiddenMutation.id,
                    params: setRowHiddenParams,
                });
                rowUndos.push({
                    id: SetRowVisibleMutation.id,
                    params: setRowHiddenParams,
                });
            }
            if (visible.length) {
                const setRowVisibleParams = {
                    unitId,
                    subUnitId,
                    ranges: visible.map((r) => ({ startRow: r, endRow: r, startColumn: targetRange.startColumn, endColumn: targetRange.endColumn })),
                };
                rowRedos.push({ id: SetRowVisibleMutation.id, params: setRowVisibleParams });
                rowUndos.push({ id: SetRowHiddenMutation.id, params: setRowVisibleParams });
            }

            const setWorksheetRowHeightParams = { unitId, subUnitId, ranges: [targetRange], rowHeight: heights };
            const undoSetWorksheetRowHeightParams = SetWorksheetRowHeightMutationFactory(setWorksheetRowHeightParams, worksheet);

            const setWorksheetAutoHeightParams = { unitId, subUnitId, ranges: [targetRange], autoHeightInfo: BooleanNumber.FALSE };
            const undoSetWorksheetAutoHeightParams = SetWorksheetRowIsAutoHeightMutationFactory(setWorksheetAutoHeightParams, worksheet);
            rowRedos.push({
                id: SetWorksheetRowHeightMutation.id,
                params: setWorksheetRowHeightParams,
            });
            rowRedos.push({
                id: SetWorksheetRowIsAutoHeightMutation.id,
                params: setWorksheetAutoHeightParams,
            });

            rowUndos.push({
                id: SetWorksheetRowHeightMutation.id,
                params: undoSetWorksheetRowHeightParams,
            });
            rowUndos.push({
                id: SetWorksheetRowIsAutoHeightMutation.id,
                params: undoSetWorksheetAutoHeightParams,
            });
        }

        return {
            undos: rowUndos,
            redos: rowRedos,
        };
    }

    private _getColDataMutations(unitId: string, subUnitId: string, sourceRange: IRange, targetRange: IRange, worksheet: Worksheet) {
        const colUndos: IMutationInfo[] = [];
        const colRedos: IMutationInfo[] = [];

        const styleColsNum = sourceRange.endColumn - sourceRange.startColumn + 1;

        if (targetRange.rangeType === RANGE_TYPE.COLUMN && sourceRange?.rangeType === RANGE_TYPE.COLUMN) {
            const hidden = [];
            const visible = [];
            const widths: IObjectArrayPrimitiveType<Nullable<number>> = {};
            const colManager = worksheet.getColumnManager();
            for (let c = targetRange.startColumn; c <= targetRange.endColumn; c++) {
                const sourceCol = sourceRange.startColumn + (c - targetRange.startColumn) % styleColsNum;
                const { w, hd } = colManager.getColumnOrCreate(sourceCol);
                widths[c] = w;
                if (hd !== colManager.getColumnOrCreate(c).hd) {
                    if (hd) {
                        hidden.push(c);
                    } else {
                        visible.push(c);
                    }
                }
            }
            if (hidden.length) {
                const setColHiddenParams = {
                    unitId,
                    subUnitId,
                    ranges: hidden.map((c) => ({ startRow: targetRange.startRow, endRow: targetRange.endRow, startColumn: c, endColumn: c })),
                };
                colRedos.push({
                    id: SetColHiddenMutation.id,
                    params: setColHiddenParams,
                });
                colUndos.push({
                    id: SetColVisibleMutation.id,
                    params: setColHiddenParams,
                });
            }
            if (visible.length) {
                const setColVisibleParams = {
                    unitId,
                    subUnitId,
                    ranges: visible.map((c) => ({ startRow: targetRange.startRow, endRow: targetRange.endRow, startColumn: c, endColumn: c })),
                };
                colRedos.push({
                    id: SetColVisibleMutation.id,
                    params: setColVisibleParams,
                });
                colUndos.push({
                    id: SetColHiddenMutation.id,
                    params: setColVisibleParams,
                });
            }

            const setColWidthParams = {
                unitId,
                subUnitId,
                ranges: [targetRange],
                colWidth: widths,
            } as ISetWorksheetColWidthMutationParams;
            const undoSetColWidthParams = SetWorksheetColWidthMutationFactory(setColWidthParams, worksheet);

            colRedos.push({
                id: SetWorksheetColWidthMutation.id,
                params: setColWidthParams,
            });
            colUndos.push({
                id: SetWorksheetColWidthMutation.id,
                params: undoSetColWidthParams,
            });
        }

        return {
            undos: colUndos,
            redos: colRedos,
        };
    }
}
