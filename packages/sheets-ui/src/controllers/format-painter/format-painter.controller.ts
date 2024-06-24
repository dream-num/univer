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

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, IStyleData, Workbook } from '@univerjs/core';
import {
    Disposable,
    getCellInfoInMergeData,
    ICommandService,
    isICellData,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
    toDisposable,
    Tools,
    UniverInstanceType,
} from '@univerjs/core';

import { Inject, Injector } from '@wendellhu/redi';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation, getAddMergeMutationRangeByType, RemoveMergeUndoMutationFactory, RemoveWorksheetMergeMutation, SelectionManagerService, SetRangeValuesCommand, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory, SheetInterceptorService } from '@univerjs/sheets';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    ApplyFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import type { IFormatPainterHook, ISelectionFormatInfo } from '../../services/format-painter/format-painter.service';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { checkCellContentInRanges, getClearContentMutationParamsForRanges } from '../../common/utils';

@OnLifecycle(LifecycleStages.Steady, FormatPainterController)
export class FormatPainterController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
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
        const selectionRenderService = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET)!.with(ISelectionRenderService);

        this.disposeWithMe(
            toDisposable(
                selectionRenderService.selectionMoveEnd$.subscribe((selections) => {
                    if (this._formatPainterService.getStatus() !== FormatPainterStatus.OFF) {
                        const { rangeWithCoord } = selections[selections.length - 1];
                        this._commandService.executeCommand(ApplyFormatPainterCommand.id, {
                            unitId: this._univerInstanceService.getFocusedUnit()?.getUnitId() || '',
                            subUnitId: (this._univerInstanceService.getFocusedUnit() as Workbook).getActiveSheet()?.getSheetId() || '',
                            range: {
                                startRow: rangeWithCoord.startRow,
                                startColumn: rangeWithCoord.startColumn,
                                endRow: rangeWithCoord.endRow,
                                endColumn: rangeWithCoord.endColumn,
                            },
                        });
                        // if once, turn off the format painter
                        if (this._formatPainterService.getStatus() === FormatPainterStatus.ONCE) {
                            this._commandService.executeCommand(SetOnceFormatPainterCommand.id);
                        }
                    }
                })
            )
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
        const mergeData = worksheet.getMergeData();

        const styles = workbook.getStyles();
        const stylesMatrix = new ObjectMatrix<IStyleData>();
        const merges = [];
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellData.getValue(r, c) as ICellData;
                stylesMatrix.setValue(r, c, styles.getStyleByCell(cell) || {});
                const { isMergedMainCell, ...mergeInfo } = getCellInfoInMergeData(r, c, mergeData);
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
        };
    }

    private _getUndoRedoMutationInfo(unitId: string, subUnitId: string, range: IRange, format: ISelectionFormatInfo) {
        const sheetInterceptorService = this._sheetInterceptorService;
        const univerInstanceService = this._univerInstanceService;
        const accessor = {
            get: this._injector.get.bind(this._injector),
        };
        const { merges, styles: stylesMatrix } = format;
        if (!stylesMatrix) return { undos: [], redos: [] };

        const { startRow, startColumn, endRow, endColumn } = stylesMatrix.getDataRange();
        const styleRowsNum = endRow - startRow + 1;
        const styleColsNum = endColumn - startColumn + 1;
        const styleValues: ICellData[][] = Array.from({ length: range.endRow - range.startRow + 1 }, () =>
            Array.from({ length: range.endColumn - range.startColumn + 1 }, () => ({}))
        );
        const mergeRanges: IRange[] = [];

        styleValues.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                const mappedRowIndex = (rowIndex % styleRowsNum) + startRow;
                const mappedColIndex = (colIndex % styleColsNum) + startColumn;
                const style = stylesMatrix.getValue(mappedRowIndex, mappedColIndex);

                if (style) {
                    styleValues[rowIndex][colIndex].s = style;
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
            const rowRepeats = Math.max(1, Math.floor((range.endRow - range.startRow + 1) / styleRowsNum));
            const colRepeats = Math.max(1, Math.floor((range.endColumn - range.startColumn + 1) / styleColsNum));
            for (let i = 0; i < rowRepeats; i++) {
                for (let j = 0; j < colRepeats; j++) {
                    mergeRanges.push({
                        startRow: relatedRange.startRow + i * styleRowsNum + range.startRow,
                        startColumn: relatedRange.startColumn + j * styleColsNum + range.startColumn,
                        endRow: relatedRange.endRow + i * styleRowsNum + range.startRow,
                        endColumn: relatedRange.endColumn + j * styleColsNum + range.startColumn,
                    });
                }
            }
        });
        const currentSelections = [range];
        const cellValue = new ObjectMatrix<ICellData>();
        let realCellValue: IObjectMatrixPrimitiveType<ICellData> | undefined;

        if (Tools.isArray(styleValues)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn, endRow, endColumn } = currentSelections[i];

                for (let r = 0; r <= endRow - startRow; r++) {
                    for (let c = 0; c <= endColumn - startColumn; c++) {
                        cellValue.setValue(r + startRow, c + startColumn, styleValues[r][c]);
                    }
                }
            }
        } else if (isICellData(styleValues)) {
            for (let i = 0; i < currentSelections.length; i++) {
                const { startRow, startColumn } = currentSelections[i];

                cellValue.setValue(startRow, startColumn, styleValues);
            }
        } else {
            realCellValue = styleValues as IObjectMatrixPrimitiveType<ICellData>;
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: realCellValue ?? cellValue.getMatrix(),
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            setRangeValuesMutationParams
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
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const undoMutationParams = AddMergeUndoMutationFactory(accessor, addMergeMutationParams);
        mergeUndos.push({ id: RemoveWorksheetMergeMutation.id, params: undoMutationParams });
        mergeUndos.push({ id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams });

        // add set range values mutations to undo redo mutations
        if (willRemoveSomeCell) {
            const data = getClearContentMutationParamsForRanges(accessor, unitId, worksheet, ranges);
            mergeRedos.unshift(...data.redos);
            mergeUndos.push(...data.undos);
        }

        return {
            undos: [
                { id: SetRangeValuesMutation.id, params: undoSetRangeValuesMutationParams },
                ...interceptorUndos,
                ...mergeUndos,
            ],
            redos: [
                { id: SetRangeValuesMutation.id, params: setRangeValuesMutationParams },
                ...interceptorRedos,
                ...mergeRedos,
            ],
        };
    }
}
