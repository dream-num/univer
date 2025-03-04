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

import type { ICellData, ICommandInfo, IObjectMatrixPrimitiveType, IRange, IUnitRange, Nullable } from '@univerjs/core';
import type { IDirtyUnitSheetDefinedNameMap, IDirtyUnitSheetNameMap, ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IInsertSheetMutationParams,
    IMoveColumnsMutationParams,
    IMoveRangeMutationParams,
    IMoveRowsMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveSheetMutationParams,
    IReorderRangeMutationParams,
    ISetRangeValuesMutationParams,
    ISetRowHiddenMutationParams,
    ISetRowVisibleMutationParams,
} from '@univerjs/sheets';
import {
    Disposable,
    Inject,
    IUniverInstanceService,
    ObjectMatrix,
} from '@univerjs/core';
import { FormulaDataModel, IActiveDirtyManagerService, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import {
    InsertColMutation,
    InsertRowMutation,
    InsertSheetMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    ReorderRangeMutation,
    SetRangeValuesMutation,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetStyleCommand,
} from '@univerjs/sheets';

export class ActiveDirtyController extends Disposable {
    constructor(
        @IActiveDirtyManagerService private readonly _activeDirtyManagerService: IActiveDirtyManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initialConversion();
    }

    private _initialConversion() {
        this._activeDirtyManagerService.register(SetRangeValuesMutation.id, {
            commandId: SetRangeValuesMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetRangeValuesMutationParams;
                /**
                 * Changes in the cell value caused by the formula or style
                 * will not trigger the formula to be marked as dirty for calculation.
                 */
                if (params.trigger === SetStyleCommand.id) {
                    return {};
                }

                return {
                    dirtyRanges: this._getSetRangeValuesMutationDirtyRange(params),
                };
            },
        });

        this._initialMove();

        this._initialRowAndColumn();

        this._initialHideRow();

        this._initialSheet();

        this._initialDefinedName();
    }

    private _initialMove() {
        this._activeDirtyManagerService.register(MoveRangeMutation.id, {
            commandId: MoveRangeMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IMoveRangeMutationParams;
                return {
                    dirtyRanges: this._getMoveRangeMutationDirtyRange(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.to.subUnitId]: '1',
                            [params.from.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(MoveRowsMutation.id, {
            commandId: MoveRowsMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IMoveRowsMutationParams;
                return {
                    dirtyRanges: this._getMoveRowsMutationDirtyRange(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(MoveColsMutation.id, {
            commandId: MoveColsMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IMoveColumnsMutationParams;
                return {
                    dirtyRanges: this._getMoveRowsMutationDirtyRange(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(ReorderRangeMutation.id, {
            commandId: ReorderRangeMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IReorderRangeMutationParams;
                return {
                    dirtyRanges: this._getReorderRangeMutationDirtyRange(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });
    }

    private _initialRowAndColumn() {
        this._activeDirtyManagerService.register(RemoveRowMutation.id, {
            commandId: RemoveRowMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IRemoveRowsMutationParams;
                return {
                    dirtyRanges: this._getRemoveRowOrColumnMutation(params, true),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(RemoveColMutation.id, {
            commandId: RemoveColMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IRemoveColMutationParams;
                return {
                    dirtyRanges: this._getRemoveRowOrColumnMutation(params, false),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(InsertColMutation.id, {
            commandId: InsertColMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IInsertColMutationParams;
                return {
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(InsertRowMutation.id, {
            commandId: InsertRowMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IInsertRowMutationParams;
                return {
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });
    }

    private _initialHideRow() {
        this._activeDirtyManagerService.register(SetRowHiddenMutation.id, {
            commandId: SetRowHiddenMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetRowHiddenMutationParams;
                return {
                    dirtyRanges: this._getHideRowMutation(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });
        this._activeDirtyManagerService.register(SetRowVisibleMutation.id, {
            commandId: SetRowVisibleMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetRowVisibleMutationParams;
                return {
                    dirtyRanges: this._getHideRowMutation(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });
    }

    private _initialSheet() {
        this._activeDirtyManagerService.register(RemoveSheetMutation.id, {
            commandId: RemoveSheetMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IRemoveSheetMutationParams;
                return {
                    dirtyNameMap: this._getRemoveSheetMutation(params),
                    clearDependencyTreeCache: {
                        [params.unitId]: {
                            [params.subUnitId]: '1',
                        },
                    },
                };
            },
        });

        this._activeDirtyManagerService.register(InsertSheetMutation.id, {
            commandId: InsertSheetMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as IInsertSheetMutationParams;
                return {
                    dirtyNameMap: this._getInsertSheetMutation(params),
                };
            },
        });
    }

    private _initialDefinedName() {
        this._activeDirtyManagerService.register(SetDefinedNameMutation.id, {
            commandId: SetDefinedNameMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetDefinedNameMutationParam;
                return { dirtyDefinedNameMap: this._getDefinedNameMutation(params) };
            },
        });

        this._activeDirtyManagerService.register(RemoveDefinedNameMutation.id, {
            commandId: RemoveDefinedNameMutation.id,
            getDirtyData: (command: ICommandInfo) => {
                const params = command.params as ISetDefinedNameMutationParam;
                return { dirtyDefinedNameMap: this._getDefinedNameMutation(params) };
            },
        });
    }

    private _getDefinedNameMutation(definedName: ISetDefinedNameMutationParam) {
        const { unitId, name, formulaOrRefString } = definedName;
        const result: IDirtyUnitSheetDefinedNameMap = {};
        if (definedName == null) {
            return {};
        }

        result[unitId] = {};

        result[unitId]![name] = formulaOrRefString;

        return result;
    }

    private _getSetRangeValuesMutationDirtyRange(params: ISetRangeValuesMutationParams) {
        const { subUnitId: sheetId, unitId, cellValue } = params;

        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, cellValue));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, cellValue));

        return dirtyRanges;
    }

    private _getMoveRangeMutationDirtyRange(params: IMoveRangeMutationParams) {
        const { unitId, from, to } = params;

        const dirtyRanges: IUnitRange[] = [];

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, from.subUnitId, from.value));

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, to.subUnitId, to.value));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, to.subUnitId, to.value));

        return dirtyRanges;
    }

    private _getMoveRowsMutationDirtyRange(params: IMoveRowsMutationParams) {
        const { subUnitId: sheetId, unitId, sourceRange, targetRange } = params;

        const dirtyRanges: IUnitRange[] = [];

        const sourceMatrix = this._rangeToMatrix(sourceRange).getData();

        const targetMatrix = this._rangeToMatrix(targetRange).getData();

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, sourceMatrix));

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, targetMatrix));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, targetMatrix));

        return dirtyRanges;
    }

    private _getReorderRangeMutationDirtyRange(params: IReorderRangeMutationParams) {
        const { unitId, subUnitId: sheetId, range } = params;
        const matrix = this._rangeToMatrix(range).getData();
        const dirtyRanges: IUnitRange[] = [];
        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, matrix));
        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, matrix));
        return dirtyRanges;
    }

    private _getRemoveRowOrColumnMutation(params: IRemoveRowsMutationParams, isRow: boolean = true) {
        const { subUnitId: sheetId, unitId, range } = params;

        const dirtyRanges: IUnitRange[] = [];

        const workbook = this._univerInstanceService.getUniverSheetInstance(unitId);

        const worksheet = workbook?.getSheetBySheetId(sheetId);

        const rowCount = worksheet?.getRowCount() || 0;

        const columnCount = worksheet?.getColumnCount() || 0;

        let matrix: Nullable<ObjectMatrix<Nullable<ICellData>>> = null;
        const { startRow, endRow, startColumn, endColumn } = range;

        if (isRow === true) {
            matrix = this._rangeToMatrix({
                startRow,
                startColumn: 0,
                endRow,
                endColumn: columnCount - 1,
            });
        } else {
            matrix = this._rangeToMatrix({
                startRow: 0,
                startColumn,
                endRow: rowCount,
                endColumn,
            });
        }

        const matrixData = matrix.getData();

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, matrixData));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, matrixData));

        return dirtyRanges;
    }

    private _getHideRowMutation(params: ISetRowHiddenMutationParams) {
        const { subUnitId, unitId, ranges } = params;

        const dirtyRanges: IUnitRange[] = [];

        // covert ranges to dirtyRanges
        ranges.forEach((range) => {
            const matrix = this._rangeToMatrix(range).getMatrix();
            dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, subUnitId, matrix));
        });

        return dirtyRanges;
    }

    private _getRemoveSheetMutation(params: IRemoveSheetMutationParams) {
        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const { subUnitId: sheetId, unitId, subUnitName } = params;

        // const dirtyNameMap: IDirtyUnitSheetNameMap = {};

        if (dirtyNameMap[unitId] == null) {
            dirtyNameMap[unitId] = {};
        }

        dirtyNameMap[unitId]![sheetId] = subUnitName;

        return dirtyNameMap;
    }

    private _getInsertSheetMutation(params: IInsertSheetMutationParams) {
        const dirtyNameMap: IDirtyUnitSheetNameMap = {};
        const { sheet, unitId } = params;

        if (dirtyNameMap[unitId] == null) {
            dirtyNameMap[unitId] = {};
        }

        dirtyNameMap[unitId]![sheet.id] = sheet.name;

        return dirtyNameMap;
    }

    private _rangeToMatrix(range: IRange) {
        const matrix = new ObjectMatrix<Nullable<ICellData>>();

        const { startRow, startColumn, endRow, endColumn } = range;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                matrix.setValue(r, c, {});
            }
        }

        return matrix;
    }

    private _getDirtyRangesByCellValue(
        unitId: string,
        sheetId: string,
        cellValue?: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        const cellMatrix = new ObjectMatrix(cellValue);

        const discreteRanges = cellMatrix.getDiscreteRanges();

        discreteRanges.forEach((range) => {
            dirtyRanges.push({ unitId, sheetId, range });
        });

        return dirtyRanges;
    }

    /**
     * The array formula is a range where only the top-left corner contains the formula value.
     * All other positions, apart from the top-left corner, need to be marked as dirty.
     */
    private _getDirtyRangesForArrayFormula(
        unitId: string,
        sheetId: string,
        cellValue: IObjectMatrixPrimitiveType<Nullable<ICellData>>
    ) {
        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        const cellMatrix = new ObjectMatrix(cellValue);

        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        /**
         * The array formula is a range where only the top-left corner contains the formula value.
         * All other positions, apart from the top-left corner, need to be marked as dirty.
         */
        if (arrayFormulaRange?.[unitId]?.[sheetId]) {
            const cellRangeData = new ObjectMatrix<IRange>(arrayFormulaRange?.[unitId]?.[sheetId]);
            cellMatrix.forValue((row, column) => {
                cellRangeData.forValue((arrayFormulaRow, arrayFormulaColumn, arrayFormulaRange) => {
                    if (arrayFormulaRange == null) {
                        return true;
                    }
                    const { startRow, startColumn, endRow, endColumn } = arrayFormulaRange;
                    if (row >= startRow && row <= endRow && column >= startColumn && column <= endColumn) {
                        dirtyRanges.push({
                            unitId,
                            sheetId,
                            range: {
                                startRow,
                                startColumn,
                                endRow: startRow,
                                endColumn: startColumn,
                            },
                        });
                    }
                });
            });
        }

        return dirtyRanges;
    }
}
