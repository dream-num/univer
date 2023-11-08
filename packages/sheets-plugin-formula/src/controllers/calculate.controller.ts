import { TextSelectionManagerService } from '@univerjs/base-docs';
import {
    FormulaDataType,
    FormulaEngineService,
    IInterpreterDatasetConfig,
    SheetDataType,
    SheetNameMapType,
    UnitDataType,
} from '@univerjs/base-formula-engine';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '@univerjs/base-sheets';
import { IDesktopUIController, IMenuService, IUIController } from '@univerjs/base-ui';
import {
    Disposable,
    ICommandInfo,
    ICommandService,
    IRange,
    isFormulaString,
    IUnitRange,
    IUniverInstanceService,
    LifecycleStages,
    Nullable,
    ObjectMatrix,
    OnLifecycle,
    Tools,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { ISetFormulaDataMutationParams, SetFormulaDataMutation } from '../commands/mutations/set-formula-data.mutation';
import { FormulaDataModel } from '../models/formula-data.model';
import { IFormulaPromptService } from '../services/prompt.service';

@OnLifecycle(LifecycleStages.Starting, CalculateController)
export class CalculateController extends Disposable {
    private _interpreterCalculatePropsCache: IInterpreterDatasetConfig;

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IMenuService private readonly _menuService: IMenuService,
        @ICommandService private readonly _commandService: ICommandService,
        @IUIController private readonly _uiController: IDesktopUIController,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @Inject(IFormulaPromptService) private readonly _formulaPromptService: IFormulaPromptService,
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

        const { range, worksheetId: sheetId, workbookId: unitId, cellValue } = params;
        if (cellValue == null) return;

        const formulaData = Tools.deepClone(this._formulaDataModel.getFormulaData());

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

        let isArrayForm = false;
        // update formula string，Any modification to cellData will be linked to formulaData
        rangeMatrix.forValue((r, c, cell) => {
            const arrayFormCellRangeData = this._checkArrayFormValue(r, c);
            const formulaString = cell?.m;
            if (arrayFormCellRangeData && formulaString === '') {
                isArrayForm = true;
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
                cellData.setValue(r, c, { formula: formulaString, row: r, column: c, sheetId });
            }
        });

        if (!isArrayForm) {
            unitRange.push({ unitId, sheetId, range: rangeMatrix.getDataRange() });
        }

        if (unitRange.length === 0 || !isCalculate) return;

        this._executeFormula(unitId, formulaData, unitRange);
    }

    private _executeFormula(unitId: string, formulaData: FormulaDataType, unitRange: IUnitRange[]) {
        const engine = this._formulaEngineService;
        const calculateProps = this._getInterpreterCalculateProps();
        // Add mutation after calculating the formula
        // TODO@Dushusir: use new service after engine refactor
        engine.execute(unitId, formulaData, calculateProps, false, unitRange).then((data) => {
            const { sheetData, arrayFormulaData } = data;

            if (!sheetData) {
                console.error('No sheetData from Formula Engine!');
            }

            if (arrayFormulaData) {
                // TODO@Dushusir: refresh array formula view
                this._formulaDataModel.setArrayFormulaData(arrayFormulaData);
            }

            const sheetIds = Object.keys(sheetData);

            // 1. Update each calculated value, possibly involving all cells
            const redoMutationsInfo: ICommandInfo[] = [];
            sheetIds.forEach((sheetId) => {
                const cellData = sheetData[sheetId];
                const setRangeValuesMutation: ISetRangeValuesMutationParams = {
                    range: [],
                    worksheetId: sheetId,
                    workbookId: unitId,
                    cellValue: cellData.getData(),
                };

                redoMutationsInfo.push({
                    id: SetRangeValuesMutation.id,
                    params: setRangeValuesMutation,
                });
            });

            // 2. Update formula data
            const setFormulaDataMutation: ISetFormulaDataMutationParams = {
                formulaData,
            };

            redoMutationsInfo.push({
                id: SetFormulaDataMutation.id,
                params: setFormulaDataMutation,
            });

            const result = redoMutationsInfo.every((m) => this._commandService.executeCommand(m.id, m.params));
            return result;
        });
    }

    private _getInterpreterCalculateProps(isRefresh = true) {
        if (isRefresh || !this._interpreterCalculatePropsCache) {
            this._interpreterCalculatePropsCache = this._toInterpreterCalculateProps();
        }

        return this._interpreterCalculatePropsCache;
    }

    private _toInterpreterCalculateProps(): IInterpreterDatasetConfig {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance();
        const sheets = workbook.getSheets();
        const sheetData: SheetDataType = {};
        const unitData: UnitDataType = {};
        const sheetNameMap: SheetNameMapType = {};

        const currentUnitId = workbook.getUnitId();

        for (const sheet of sheets) {
            sheetData[sheet.getSheetId()] = sheet.getCellMatrix();
            sheetNameMap[sheet.getName()] = sheet.getSheetId();
        }

        unitData[currentUnitId] = sheetData;

        const formulaData = this._formulaDataModel.getFormulaData();

        const activeSheet = workbook.getActiveSheet();

        const rowCount = activeSheet.getRowCount();
        const columnCount = activeSheet.getColumnCount();

        return {
            unitData,
            formulaData,
            sheetNameMap,
            currentRow: -1,
            currentColumn: -1,
            currentSheetId: '',
            currentUnitId,
            rowCount,
            columnCount,
        };
    }

    private _checkArrayFormValue(row: number, column: number): Nullable<IRange> {
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
}
