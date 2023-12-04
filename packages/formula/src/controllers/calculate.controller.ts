import type { ICellData, ICommandInfo, IRange, IUnitRange, ObjectMatrixPrimitiveType } from '@univerjs/core';
import {
    Dimension,
    Disposable,
    ICommandService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import type { IAllRuntimeData, IDirtyUnitSheetNameMap, IFormulaData } from '@univerjs/engine-formula';
import { FormulaEngineService, FormulaExecutedStateType } from '@univerjs/engine-formula';
import type {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IMoveColumnsMutationParams,
    IMoveRangeMutationParams,
    IMoveRowsMutationParams,
    IRemoveRowsMutationParams,
    IRemoveSheetMutationParams,
    ISetRangeValuesMutationParams,
    ISetWorksheetNameMutationParams,
} from '@univerjs/sheets';
import {
    AddWorksheetMergeMutation,
    DeleteRangeMutation,
    InsertRangeMutation,
    MoveColsMutation,
    MoveRangeMutation,
    MoveRowsMutation,
    RemoveColMutation,
    RemoveRowMutation,
    RemoveSheetMutation,
    SetRangeValuesMutation,
    SetStyleCommand,
    SetWorksheetNameMutation,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import type { Nullable } from 'vitest';

import type { ISetArrayFormulaDataMutationParams } from '../commands/mutations/set-array-formula-data.mutation';
import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import type { ISetFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';
import { setFormulaCalculationStartMutation } from '../commands/mutations/set-formula-calculation.mutation';
import type { ISetFormulaDataMutationParams } from '../commands/mutations/set-formula-data.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import type { FormulaService } from '../services/formula.service';
import { IFormulaService } from '../services/formula.service';

@OnLifecycle(LifecycleStages.Ready, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @Inject(IFormulaService) private readonly _formulaService: FormulaService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
        this._initialExecuteFormulaListener();
        this._registerFunctions();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetFormulaDataMutation.id) {
                    const formulaData = (command.params as ISetFormulaDataMutationParams).formulaData as IFormulaData;
                    this._formulaDataModel.setFormulaData(formulaData);
                } else if (command.id === setFormulaCalculationStartMutation.id) {
                    const params = command.params as ISetFormulaCalculationStartMutation;
                    const { dirtyRanges, dirtyNameMap } = this._generateDirty(params.commands);

                    this._calculate(dirtyRanges, dirtyNameMap);
                } else if (command.id === SetArrayFormulaDataMutation.id) {
                    const params = command.params as ISetArrayFormulaDataMutationParams;

                    if (params == null) {
                        return;
                    }

                    const { arrayFormulaRange, arrayFormulaCellData } = params;
                    this._formulaDataModel.setArrayFormulaRange(arrayFormulaRange);
                    this._formulaDataModel.setArrayFormulaCellData(arrayFormulaCellData);
                }
            })
        );
    }

    private _generateDirty(commands: ICommandInfo[]) {
        const dirtyRanges: IUnitRange[] = [];
        const dirtyNameMap: IDirtyUnitSheetNameMap = {};

        for (const command of commands) {
            if (command.id === SetRangeValuesMutation.id) {
                const params = command.params as ISetRangeValuesMutationParams;
                /**
                 * Changes in the cell value caused by the formula or style
                 * will not trigger the formula to be marked as dirty for calculation.
                 */
                if (params.isFormulaUpdate === true || params.trigger === SetStyleCommand.id) {
                    continue;
                }
                dirtyRanges.push(...this._getSetRangeValuesMutationDirtyRange(params));
            } else if (command.id === MoveRangeMutation.id) {
                const params = command.params as IMoveRangeMutationParams;
                dirtyRanges.push(...this._getMoveRangeMutationDirtyRange(params));
            } else if (command.id === MoveRowsMutation.id || command.id === MoveColsMutation.id) {
                const params = command.params as IMoveRowsMutationParams | IMoveColumnsMutationParams;
                dirtyRanges.push(...this._getMoveRowsMutationDirtyRange(params));
            } else if (command.id === DeleteRangeMutation.id || command.id === InsertRangeMutation.id) {
                const params = command.params as IDeleteRangeMutationParams;
                dirtyRanges.push(...this._getDeleteRangeMutationDirtyRange(params));
            } else if (command.id === RemoveRowMutation.id || command.id === RemoveColMutation.id) {
                const params = command.params as IRemoveRowsMutationParams;
                const isRow = command.id === RemoveRowMutation.id;
                dirtyRanges.push(...this._getRemoveRowOrColumnMutation(params, isRow));
            } else if (command.id === RemoveSheetMutation.id) {
                const params = command.params as IRemoveSheetMutationParams;
                this._getSheetMutationDirtyName(dirtyNameMap, params);
            } else if (command.id === SetWorksheetNameMutation.id) {
                const params = command.params as ISetWorksheetNameMutationParams;
                this._getSheetMutationDirtyName(dirtyNameMap, params, params.name);
            } else if (command.id === AddWorksheetMergeMutation.id) {
                const params = command.params as IAddWorksheetMergeMutationParams;
                this._getSheetMutationDirtyName(dirtyNameMap, params);
            }
        }

        return {
            dirtyRanges,
            dirtyNameMap,
        };
    }

    private _getSetRangeValuesMutationDirtyRange(params: ISetRangeValuesMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;

        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, cellValue));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, cellValue));

        return dirtyRanges;
    }

    private _getMoveRangeMutationDirtyRange(params: IMoveRangeMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, from, to } = params;

        const dirtyRanges: IUnitRange[] = [];

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, from));

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, to));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, to));

        return dirtyRanges;
    }

    private _getMoveRowsMutationDirtyRange(params: IMoveRowsMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, sourceRange, targetRange } = params;

        const dirtyRanges: IUnitRange[] = [];

        const sourceMatrix = this._rangeToMatrix(sourceRange).getData();

        const targetMatrix = this._rangeToMatrix(targetRange).getData();

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, sourceMatrix));

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, targetMatrix));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, targetMatrix));

        return dirtyRanges;
    }

    private _getDeleteRangeMutationDirtyRange(params: IDeleteRangeMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, ranges, shiftDimension } = params;

        const dirtyRanges: IUnitRange[] = [];

        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        const worksheet = workbook?.getSheetBySheetId(sheetId);

        const lastEndRow = worksheet?.getLastRowWithContent() || 0;

        const lastEndColumn = worksheet?.getLastColumnWithContent() || 0;

        const matrix = new ObjectMatrix<ICellData | null>();

        for (const range of ranges) {
            let newMatrix: Nullable<ObjectMatrix<ICellData | null>> = null;
            const { startRow, startColumn, endRow, endColumn } = range;
            if (shiftDimension === Dimension.ROWS) {
                newMatrix = this._rangeToMatrix({
                    startRow,
                    startColumn,
                    endRow: lastEndRow,
                    endColumn,
                });
            } else if (shiftDimension === Dimension.COLUMNS) {
                newMatrix = this._rangeToMatrix({
                    startRow,
                    startColumn,
                    endRow,
                    endColumn: lastEndColumn,
                });
            }

            if (newMatrix != null) {
                matrix.merge(newMatrix);
            }
        }

        const matrixData = matrix.getData();

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, matrixData));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, matrixData));

        return dirtyRanges;
    }

    private _getRemoveRowOrColumnMutation(params: IRemoveRowsMutationParams, isRow: boolean = true) {
        const { worksheetId: sheetId, workbookId: unitId, ranges } = params;

        const dirtyRanges: IUnitRange[] = [];

        const workbook = this._currentUniverService.getUniverSheetInstance(unitId);

        const worksheet = workbook?.getSheetBySheetId(sheetId);

        const rowCount = worksheet?.getRowCount() || 0;

        const columnCount = worksheet?.getColumnCount() || 0;

        const matrix = new ObjectMatrix<ICellData | null>();

        for (const range of ranges) {
            let newMatrix: Nullable<ObjectMatrix<ICellData | null>> = null;
            const { startRow, endRow, startColumn, endColumn } = range;

            if (isRow === true) {
                newMatrix = this._rangeToMatrix({
                    startRow,
                    startColumn: 0,
                    endRow,
                    endColumn: columnCount - 1,
                });
            } else {
                newMatrix = this._rangeToMatrix({
                    startRow: 0,
                    startColumn,
                    endRow: rowCount,
                    endColumn,
                });
            }

            if (newMatrix != null) {
                matrix.merge(newMatrix);
            }
        }

        const matrixData = matrix.getData();

        dirtyRanges.push(...this._getDirtyRangesByCellValue(unitId, sheetId, matrixData));

        dirtyRanges.push(...this._getDirtyRangesForArrayFormula(unitId, sheetId, matrixData));

        return dirtyRanges;
    }

    private _getSheetMutationDirtyName(
        dirtyNameMap: IDirtyUnitSheetNameMap,
        params: IRemoveSheetMutationParams,
        name?: Nullable<string>
    ) {
        const { worksheetId: sheetId, workbookId: unitId } = params;

        // const dirtyNameMap: IDirtyUnitSheetNameMap = {};

        if (dirtyNameMap[unitId] == null) {
            dirtyNameMap[unitId] = {};
        }

        dirtyNameMap[unitId][sheetId] = name;

        return dirtyNameMap;
    }

    private _rangeToMatrix(range: IRange) {
        const matrix = new ObjectMatrix<ICellData | null>();

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
        cellValue?: ObjectMatrixPrimitiveType<ICellData | null>
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
        cellValue: ObjectMatrixPrimitiveType<ICellData | null>
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

    private async _calculate(dirtyRanges: IUnitRange[], dirtyNameMap: IDirtyUnitSheetNameMap) {
        if (dirtyRanges.length === 0) return;

        const formulaData = this._formulaDataModel.getFormulaData();

        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();

        // Synchronous to the main thread
        // this._commandService.executeCommand(SetFormulaDataMutation.id, { formulaData });
        this._formulaEngineService.execute({
            formulaData,
            arrayFormulaCellData,
            forceCalculate: false,
            dirtyRanges,
            dirtyNameMap,
        });
    }

    private _initialExecuteFormulaListener() {
        /**
         * Assignment operation after formula calculation.
         */
        this._formulaEngineService.executionCompleteListener$.subscribe((data) => {
            const functionsExecutedState = data.functionsExecutedState;
            switch (functionsExecutedState) {
                case FormulaExecutedStateType.NOT_EXECUTED:
                    break;
                case FormulaExecutedStateType.STOP_EXECUTION:
                    break;
                case FormulaExecutedStateType.SUCCESS:
                    this._applyFormula(data);
                    break;
                case FormulaExecutedStateType.INITIAL:
                    break;
            }
        });
    }

    private async _applyFormula(data: IAllRuntimeData) {
        const { unitData, arrayFormulaRange, arrayFormulaCellData, clearArrayFormulaCellData } = data;

        if (!unitData) {
            console.error('No sheetData from Formula Engine!');
            return;
        }

        // const deleteMutationInfo = this._deletePreviousArrayFormulaValue(arrayFormulaRange);

        if (arrayFormulaRange) {
            this._formulaDataModel.clearPreviousArrayFormulaCellData(clearArrayFormulaCellData);

            this._formulaDataModel.mergeArrayFormulaCellData(arrayFormulaCellData);

            this._formulaDataModel.mergeArrayFormulaRange(arrayFormulaRange);

            // Synchronous to the main thread
            this._commandService.executeCommand(SetArrayFormulaDataMutation.id, {
                arrayFormulaRange: this._formulaDataModel.getArrayFormulaRange(),
                arrayFormulaCellData: this._formulaDataModel.getArrayFormulaCellData(),
            });
        }

        const unitIds = Object.keys(unitData);

        // Update each calculated value, possibly involving all cells
        const redoMutationsInfo: ICommandInfo[] = [];

        unitIds.forEach((unitId) => {
            const sheetData = unitData[unitId];

            const sheetIds = Object.keys(sheetData);

            sheetIds.forEach((sheetId) => {
                const cellData = sheetData[sheetId];

                // const arrayFormula = arrayFormulaRange[unitId][sheetId];

                const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                    worksheetId: sheetId,
                    workbookId: unitId,
                    cellValue: cellData.getData(),
                    isFormulaUpdate: true,
                };

                redoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: setRangeValuesMutation,
                });
            });
        });

        const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
        return result;
    }

    private _registerFunctions() {
        this._formulaService.registerFunctions();
    }
}
