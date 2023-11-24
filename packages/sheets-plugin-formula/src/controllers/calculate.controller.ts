import { FormulaEngineService, IFormulaData, ISheetData } from '@univerjs/base-formula-engine';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IConfigService,
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
        @IConfigService private readonly _configService: IConfigService,
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

        const dirtyRanges: IUnitRange[] = [];
        let isCalculate = false;

        if (!formulaData[unitId]) {
            formulaData[unitId] = {};
        }
        if (!formulaData[unitId][sheetId]) {
            formulaData[unitId][sheetId] = {};
        }

        const formulaCellData = new ObjectMatrix(formulaData[unitId][sheetId]);
        const rangeMatrix = new ObjectMatrix(cellValue);
        const formulaIdMap = new Map<string, { f: string; r: number; c: number }>(); // Connect the formula and ID

        let isArrayFormula = false;
        // update formula string，Any modification to cellData will be linked to formulaData
        rangeMatrix.forValue((r, c, cell) => {
            const arrayFormCellRangeData = this._checkArrayFormulaValue(r, c);

            const formulaString = cell?.f || '';
            const formulaId = cell?.si || '';
            const formulaValue = cell?.v;
            if (!formulaString && formulaId) {
                isCalculate = true;
                formulaCellData.setValue(r, c, { f: formulaId }); // IFormulaDataItem only has f field
            } else if (arrayFormCellRangeData && Tools.isBlank(formulaValue)) {
                isArrayFormula = true;
                isCalculate = true;

                dirtyRanges.push({ unitId, sheetId, range: arrayFormCellRangeData });
            } else if (Tools.isStringNumber(formulaString)) {
                isCalculate = true;

                // if change formula to number, remove formula
                const formulaCell = formulaCellData.getRow(r)?.get(c);
                if (formulaCell) {
                    formulaCellData.deleteValue(r, c);
                }
            } else if (isFormulaString(formulaString)) {
                isCalculate = true;
                formulaCellData.setValue(r, c, { f: formulaString });

                if (isFormulaId(formulaId)) {
                    formulaIdMap.set(formulaId, { f: formulaString, r, c });
                }
            }
        });

        // Convert the formula ID to formula string
        formulaCellData.forValue((r, c, cell) => {
            const formulaId = cell?.f || '';
            // TODO@Dushusir: remove formulaIdMap
            if (formulaIdMap.has(formulaId)) {
                const formulaInfo = formulaIdMap.get(formulaId);
                if (!formulaInfo) return false;

                const f = formulaInfo.f;
                const x = r - formulaInfo.r;
                const y = c - formulaInfo.c;

                formulaCellData.setValue(r, c, { f, x, y });
            }
        });

        if (!isArrayFormula) {
            dirtyRanges.push({ unitId, sheetId, range: rangeMatrix.getDataRange() });
        }

        if (dirtyRanges.length === 0 || !isCalculate) return;

        this._executeFormula(unitId, formulaData, false, dirtyRanges);
    }

    private _executeFormula(
        unitId: string,
        formulaData: IFormulaData,
        forceCalculate: boolean = false,
        dirtyRanges: IUnitRange[]
    ) {
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
                forceCalculate,
                dirtyRanges,
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
