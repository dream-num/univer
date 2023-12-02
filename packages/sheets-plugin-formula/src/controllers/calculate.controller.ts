import type { IAllRuntimeData } from '@univerjs/base-formula-engine';
import { FormulaEngineService, FormulaExecutedStateType } from '@univerjs/base-formula-engine';
import type { ISetRangeValuesMutationParams } from '@univerjs/base-sheets';
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
    SetWorksheetNameMutation,
} from '@univerjs/base-sheets';
import type { ICommandInfo, IRange, IUnitRange } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, ObjectMatrix, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetArrayFormulaDataMutation } from '../commands/mutations/set-array-formula-data.mutation';
import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import type { FormulaService } from '../services/formula.service';
import { IFormulaService } from '../services/formula.service';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,

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
        const updateCommandList = [
            // ClearSelectionAllCommand.id,
            // ClearSelectionContentCommand.id,
            // SetRangeValuesCommand.id,
            SetRangeValuesMutation.id,
            MoveRangeMutation.id,
            MoveRowsMutation.id,
            MoveColsMutation.id,
            DeleteRangeMutation.id,
            InsertRangeMutation.id,
            RemoveRowMutation.id,
            RemoveColMutation.id,
            RemoveSheetMutation.id,
            SetWorksheetNameMutation.id,
            AddWorksheetMergeMutation.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                let dirtyRanges: IUnitRange[] = [];
                if (command.id === SetRangeValuesMutation.id) {
                    const params = command.params as ISetRangeValuesMutationParams;
                    if (params.isFormulaUpdate === true) {
                        return;
                    }
                    dirtyRanges = this._getSetRangeValuesMutationDirtyRange(params);
                }

                this._calculate(dirtyRanges);
            })
        );
    }

    private _getSetRangeValuesMutationDirtyRange(params: ISetRangeValuesMutationParams) {
        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;

        const dirtyRanges: IUnitRange[] = [];

        if (cellValue == null) {
            return dirtyRanges;
        }

        const cellMatrix = new ObjectMatrix(cellValue);

        const discreteRanges = cellMatrix.getDiscreteRanges();

        discreteRanges.forEach((range) => {
            dirtyRanges.push({ unitId, sheetId, range });
        });

        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        const cellRangeData = new ObjectMatrix<IRange>(arrayFormulaRange?.[unitId]?.[sheetId]);

        /**
         * The array formula is a range where only the top-left corner contains the formula value.
         * All other positions, apart from the top-left corner, need to be marked as dirty.
         */
        if (cellRangeData) {
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

        this._formulaDataModel.updateFormulaData(unitId, sheetId, cellValue);

        return dirtyRanges;
    }

    private async _calculate(dirtyRanges: IUnitRange[]) {
        if (dirtyRanges.length === 0) return;

        const formulaData = this._formulaDataModel.getFormulaData();

        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();

        // Synchronous to the main thread
        this._commandService.executeCommand(SetFormulaDataMutation.id, formulaData);

        return this._formulaEngineService.execute({
            formulaData,
            arrayFormulaCellData,
            forceCalculate: false,
            dirtyRanges,
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
