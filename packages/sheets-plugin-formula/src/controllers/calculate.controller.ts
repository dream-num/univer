import {
    FormulaEngineService,
    IFormulaData,
    ISheetData,
    IUnitData,
    IUnitSheetNameMap,
} from '@univerjs/base-formula-engine';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/base-sheets';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IConfigService,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    ObjectMatrix,
    OnLifecycle,
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
        if (!params || params.isFormulaUpdate === true) return;

        const { worksheetId: sheetId, workbookId: unitId, cellValue } = params;
        if (cellValue == null) return;

        // const formulaData = this._formulaDataModel.getFormulaData();

        const dirtyRanges: IUnitRange[] = [];

        const discreteRanges = new ObjectMatrix(cellValue).getDiscreteRanges();

        discreteRanges.forEach((range) => {
            dirtyRanges.push({ unitId, sheetId, range });
        });

        if (dirtyRanges.length === 0) return;

        const { allUnitData, formulaData, unitSheetNameMap } = this._getCalculateData();

        this._executeFormula(unitId, allUnitData, formulaData, unitSheetNameMap, false, dirtyRanges);
    }

    private _executeFormula(
        unitId: string,
        allUnitData: IUnitData,
        formulaData: IFormulaData,
        unitSheetNameMap: IUnitSheetNameMap,
        forceCalculate: boolean = false,
        dirtyRanges: IUnitRange[]
    ) {
        // Add mutation after calculating the formula
        this._formulaEngineService
            .execute(unitId, {
                unitData: allUnitData,
                formulaData,
                sheetNameMap: unitSheetNameMap,
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
                        isFormulaUpdate: true,
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

    private _getCalculateData() {
        const unitAllSheet = this._currentUniverService.getAllUniverSheetsInstance();

        const formulaData: IFormulaData = {};

        const allUnitData: IUnitData = {};

        const unitSheetNameMap: IUnitSheetNameMap = {};

        for (const workbook of unitAllSheet) {
            const unitId = workbook.getUnitId();
            if (formulaData[unitId] == null) {
                formulaData[unitId] = {};
            }
            const sheets = workbook.getSheets();

            const workbookFormulaData = formulaData[unitId];

            const sheetData: ISheetData = {};

            const sheetNameMap: { [sheetName: string]: string } = {};

            for (const sheet of sheets) {
                const sheetId = sheet.getSheetId();
                if (workbookFormulaData[sheetId] == null) {
                    workbookFormulaData[sheetId] = {};
                }

                const sheetFormulaData = workbookFormulaData[sheetId];

                const cellDatas = sheet.getCellMatrix();

                cellDatas.forValue((row, column, cellData) => {
                    if (cellData.f != null) {
                        if (sheetFormulaData[row] == null) {
                            sheetFormulaData[row] = {};
                        }
                        sheetFormulaData[row][column] = {
                            f: cellData.f,
                            x: 0,
                            y: 0,
                        };
                    }
                });

                const sheetConfig = sheet.getConfig();
                sheetData[sheetId] = {
                    cellData: new ObjectMatrix(sheetConfig.cellData),
                    rowCount: sheetConfig.rowCount,
                    columnCount: sheetConfig.columnCount,
                };
                sheetNameMap[sheet.getName()] = sheet.getSheetId();
            }

            allUnitData[unitId] = sheetData;

            unitSheetNameMap[unitId] = sheetNameMap;
        }

        return {
            formulaData,
            allUnitData,
            unitSheetNameMap,
        };
    }
}
