import type { IAllRuntimeData, UnitArrayFormulaDataType } from '@univerjs/base-formula-engine';
import { FormulaEngineService, FormulaExecutedStateType, isInDirtyRange } from '@univerjs/base-formula-engine';
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
import type { ICommandInfo, IUnitRange } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import type { FormulaService } from '../services/formula.service';
import { IFormulaService } from '../services/formula.service';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    private _previousDirtyRanges: IUnitRange[] = [];

    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
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

        const arrayFormulaData = this._formulaDataModel.getArrayFormulaData();

        const cellRangeData = arrayFormulaData?.[unitId]?.[sheetId];

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

        this._previousDirtyRanges = dirtyRanges;

        const formulaData = this._formulaDataModel.getFormulaData();

        // Synchronous to the main thread
        this._commandService.executeCommand(SetFormulaDataMutation.id, formulaData);

        return this._formulaEngineService.execute({
            formulaData,
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
        const { unitData, unitArrayFormulaData } = data;

        if (!unitData) {
            console.error('No sheetData from Formula Engine!');
            return;
        }

        const deleteMutationInfo = this._deletePreviousArrayFormulaValue(unitArrayFormulaData);

        if (unitArrayFormulaData) {
            // TODO@Dushusir: refresh array formula view
            this._formulaDataModel.setArrayFormulaData(unitArrayFormulaData);
        }

        const unitIds = Object.keys(unitData);

        // Update each calculated value, possibly involving all cells
        const redoMutationsInfo: ICommandInfo[] = [...deleteMutationInfo];

        unitIds.forEach((unitId) => {
            const sheetData = unitData[unitId];

            const sheetIds = Object.keys(sheetData);

            sheetIds.forEach((sheetId) => {
                const cellData = sheetData[sheetId];

                // const arrayFormula = unitArrayFormulaData[unitId][sheetId];

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

    private _deletePreviousArrayFormulaValue(unitArrayFormulaData: UnitArrayFormulaDataType) {
        const oldArrayFormulaData = this._formulaDataModel.getArrayFormulaData();

        const redoMutationsInfo: ICommandInfo[] = [];

        Object.keys(oldArrayFormulaData).forEach((oldUnitId) => {
            const oldSheetData = oldArrayFormulaData[oldUnitId];

            const oldSheetIds = Object.keys(oldSheetData);

            oldSheetIds.forEach((oldSheetId) => {
                const oldCellData = oldSheetData[oldSheetId];
                const oldCellValue = new ObjectMatrix<null>();
                oldCellData.forValue((oldRow, oldColumn, oldRange) => {
                    const newCellData = unitArrayFormulaData?.[oldUnitId]?.[oldSheetId].getValue(oldRow, oldColumn);

                    if (newCellData == null) {
                        return false;
                    }

                    const { startRow, startColumn, endRow, endColumn } = oldRange;

                    for (let r = startRow; r <= endRow; r++) {
                        for (let c = startColumn; c <= endColumn; c++) {
                            if (r === oldRow && c === oldColumn) {
                                continue;
                            }

                            if (isInDirtyRange(this._previousDirtyRanges, oldUnitId, oldSheetId, r, c)) {
                                continue;
                            }

                            oldCellValue.setValue(r, c, null);
                        }
                    }
                });
                const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                    worksheetId: oldSheetId,
                    workbookId: oldUnitId,
                    cellValue: oldCellValue.getData(),
                    isFormulaUpdate: true,
                };

                redoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: setRangeValuesMutation,
                });
            });
        });

        return redoMutationsInfo;
    }

    private _registerFunctions() {
        this._formulaService.registerFunctions();
    }
}
