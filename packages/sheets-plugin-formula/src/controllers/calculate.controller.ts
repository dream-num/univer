import { FormulaEngineService, IFormulaData, ISheetData } from '@univerjs/base-formula-engine';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IRange,
    isFormulaId,
    isFormulaString,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import { FormulaDataModel } from '../models/formula-data.model';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(FormulaEngineService) private readonly _formulaEngineService: FormulaEngineService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        // TODO@Dushusir: sheet rename
        const updateCommandList = [SetRangeValuesMutation.id];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._calculate(command as ICommandInfo<ISetRangeValuesMutationParams>);
            })
        );
    }

    private _calculate(command: ICommandInfo<ISetRangeValuesMutationParams>) {
        const { params } = command;
        if (!params) return;

        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;
        if (cellValue == null) return;

        const formulaData = this._formulaDataModel.getFormulaData();

        const unitRange: IUnitRange[] = [];
        let isCalculate = false;

        if (!formulaData[unitId]) {
            formulaData[unitId] = {};
        }
        if (!formulaData[unitId][sheetId]) {
            formulaData[unitId][sheetId] = {};
        }

        const cellData = new ObjectMatrix(formulaData[unitId][sheetId]);
        const rangeMatrix = new ObjectMatrix(cellValue);
        const formulaIdMap = new Map<string, string>(); // Connect the formula and ID

        let isArrayFormula = false;
        // update formula string，Any modification to cellData will be linked to formulaData
        rangeMatrix.forValue((r, c, cell) => {
            const arrayFormCellRangeData = this._checkArrayFormulaValue(r, c);

            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';
            if (!formulaString && formulaId) {
                isCalculate = true;
                cellData.setValue(r, c, { f: formulaId });
            } else if (arrayFormCellRangeData && formulaString === '') {
                isArrayFormula = true;
                isCalculate = true;

                unitRange.push({ unitId, sheetId, range: arrayFormCellRangeData });
            } else if (Tools.isStringNumber(formulaString)) {
                isCalculate = true;

                // if change formula to number, remove formula
                const formulaCell = cellData.getRow(r)?.get(c);
                if (formulaCell) {
                    cellData.deleteValue(r, c);
                }
            } else if (isFormulaString(formulaString)) {
                isCalculate = true;
                cellData.setValue(r, c, { f: formulaString });

                if (isFormulaId(formulaId)) {
                    formulaIdMap.set(formulaId, formulaString);
                }
            }
        });

        // Convert the formula ID to formula string
        cellData.forValue((r, c, cell) => {
            const formulaId = cell?.f || '';
            if (formulaIdMap.has(formulaId)) {
                cellData.setValue(r, c, { f: formulaIdMap.get(formulaId) as string });
            }
        });

        if (!isArrayFormula) {
            unitRange.push({ unitId, sheetId, range: rangeMatrix.getDataRange() });
        }

        if (unitRange.length === 0 || !isCalculate) return;

        this._executeFormula(unitId, formulaData, unitRange);
    }

    private _executeFormula(unitId: string, formulaData: IFormulaData, unitRange: IUnitRange[]) {
        const engine = this._formulaEngineService;
        const { sheetData, sheetNameMap } = this._getSheetData();
        // Add mutation after calculating the formula
        engine
            .execute(unitId, {
                unitData: {
                    [unitId]: sheetData,
                },
                formulaData,
                sheetNameMap: {
                    [unitId]: sheetNameMap,
                },
                forceCalculate: true,
                updateRangeList: unitRange,
            })
            .then((data) => {
                const { sheetData, arrayFormulaData } = data;

                if (!sheetData) {
                    console.error('No sheetData from Formula Engine!');
                }

                if (arrayFormulaData) {
                    // TODO@Dushusir: refresh array formula view
                    this._formulaDataModel.setArrayFormulaData(arrayFormulaData);
                }

                const sheetIds = Object.keys(sheetData);

                // Update each calculated value, possibly involving all cells
                const redoMutationsInfo: ICommandInfo[] = [];
                sheetIds.forEach((sheetId) => {
                    const cellData = sheetData[sheetId];
                    const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                        worksheetId: sheetId,
                        workbookId: unitId,
                        cellValue: cellData.getData(),
                    };

                    redoMutationsInfo.push({
                        id: SetRangeValuesMutation.id,
                        params: setRangeValuesMutation,
                    });
                });

                const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
                return result;
            });
    }

    private _checkArrayFormulaValue(row: number, column: number): Nullable<IRange> {
        let formula: Nullable<IRange>;
        const arrayFormulaData = this._formulaDataModel.getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRange) => {
                const { startRow, startColumn, endRow, endColumn } = value;
                if (row >= startRow && row < endRow && column >= startColumn && column < endColumn) {
                    formula = {
                        startRow,
                        endRow: startRow,
                        startColumn,
                        endColumn: startColumn,
                    };
                    return false;
                }
            });
        });

        return formula;
    }

    private _getSheetData() {
        const sheetData: ISheetData = {};
        const sheetNameMap: { [sheetName: string]: string } = {};
        this._currentUniverService
            .getCurrentUniverSheetInstance()
            .getSheets()
            .forEach((sheet) => {
                const sheetConfig = sheet.getConfig();
                sheetData[sheet.getSheetId()] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            });

        return { sheetData, sheetNameMap };
    }
}
