import {
    ActionOperation,
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    Command,
    IRangeData,
    ISetRangeDataActionData,
    isFormulaString,
    ISheetActionData,
    IUnitRange,
    Nullable,
    ObjectMatrix,
    Tools,
} from '@univer/core';
import { FormulaPlugin } from '../../FormulaPlugin';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from '../Enum';

export class FormulaActionExtension extends BaseActionExtension<FormulaPlugin> {
    execute() {
        const engine = this._plugin.getFormulaEngine();
        const formulaController = this._plugin.getFormulaController();
        const formulaDataModel = formulaController.getDataModel();
        // The purpose of deep copy is to trigger the modification of formulaData through Command instead of reference relationship
        const formulaData = Tools.deepClone(formulaDataModel.getFormulaData());
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const actionDataList = this.actionDataList as ISetRangeDataActionData[];

        const unitRange: IUnitRange[] = [];
        let isCalculate = false;

        // handle each action
        actionDataList.forEach((actionData) => {
            if (actionData.operation != null && !ActionOperation.hasExtension(actionData)) {
                return false;
            }

            if (actionData.actionName !== ACTION_NAMES.SET_RANGE_DATA_ACTION) {
                return false;
            }

            // Filter out Actions that contain formulas, inject setRangeDataAction
            const { sheetId, cellValue } = actionData;

            if (Tools.isEmptyObject(formulaData)) return;

            if (!formulaData[unitId][sheetId]) {
                formulaData[unitId][sheetId] = {};
            }
            const cellData = new ObjectMatrix(formulaData[unitId][sheetId]);

            if (cellValue == null) {
                return;
            }

            const rangeMatrix = new ObjectMatrix(cellValue);

            let isArrayForm = false;

            // update formula string，Any modification to cellData will be linked to formulaData
            rangeMatrix.forValue((r, c, cell) => {
                const arrayFormCellRangeData = this.checkArrayFormValue(r, c);
                const formulaString = cell.m;
                if (arrayFormCellRangeData && formulaString === '') {
                    isArrayForm = true;
                    isCalculate = true;

                    unitRange.push({
                        unitId,
                        sheetId,
                        rangeData: arrayFormCellRangeData,
                    });
                } else if (Tools.isStringNumber(formulaString)) {
                    isCalculate = true;

                    // if change formula to number, remove formula
                    const formulaCell = cellData.getRow(r)?.get(c);
                    if (formulaCell) {
                        cellData.deleteValue(r, c);
                    }
                } else if (isFormulaString(formulaString)) {
                    isCalculate = true;
                    cellData.setValue(r, c, {
                        formula: formulaString,
                        row: r,
                        column: c,
                        sheetId,
                    });
                }
            });

            if (!isArrayForm) {
                unitRange.push({
                    unitId,
                    sheetId,
                    rangeData: rangeMatrix.getDataRange(),
                });
            }
        });

        if (unitRange.length === 0 || !isCalculate) return;

        // Add command after calculating the formula
        engine.execute(unitId, formulaData, formulaController.toInterpreterCalculateProps(), false, unitRange).then((data) => {
            const { sheetData, arrayFormulaData } = data;

            if (!sheetData) {
                console.error('No sheetData from Formula Engine!');
                return;
            }

            if (arrayFormulaData) {
                this._plugin.getFormulaController().addArrayFormulaData(arrayFormulaData);
            }

            const sheetIds = Object.keys(sheetData);

            // Update each calculated value, possibly involving all cells
            const actionDatas: ISetRangeDataActionData[] = [];
            sheetIds.forEach((sheetId) => {
                const cellData = sheetData[sheetId];
                cellData.forValue((r, c, value) => {
                    const cellCalculate = cellData.getValue(r, c);

                    // cell.v = cellCalculate?.v;
                    // cell.t = cellCalculate?.t;
                    if (cellCalculate && cellCalculate.p) {
                        delete cellCalculate.p;
                    }

                    if (cellCalculate && Number.isNaN(cellCalculate.v)) {
                        cellCalculate.v = 0;
                    }

                    const action = {
                        actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                        sheetId,
                        cellValue: {
                            [r]: {
                                [c]: cellCalculate || {},
                            },
                        },
                    };

                    const actionData = ActionOperation.make<ISetRangeDataActionData>(action).removeCollaboration().removeUndo().removeExtension().getAction();
                    actionDatas.push(actionData);
                });
            });

            const setFormulaDataAction = {
                actionName: PLUGIN_ACTION_NAMES.SET_FORMULA_RANGE_DATA_ACTION,
                sheetId: actionDataList[0].sheetId, // Any sheetId can be passed in, it has no practical effect
                formulaData,
            };
            const workBook = this._plugin.getContext().getWorkBook();
            const commandManager = this._plugin.getContext().getCommandManager();
            const command = new Command({ WorkBookUnit: workBook }, ...actionDatas, setFormulaDataAction);
            commandManager.invoke(command);
        });
    }

    checkArrayFormValue(row: number, column: number): Nullable<IRangeData> {
        let formula;
        const arrayFormulaData = this._plugin.getFormulaController().getDataModel().getArrayFormulaData();

        if (!arrayFormulaData) return null;

        Object.keys(arrayFormulaData).forEach((sheetId) => {
            const sheetData = arrayFormulaData[sheetId];

            sheetData.forValue((rowIndex: number, columnIndex: number, value: IRangeData) => {
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

export class FormulaActionExtensionFactory extends BaseActionExtensionFactory<FormulaPlugin> {
    get zIndex(): number {
        return 1;
    }

    create(actionDataList: ISheetActionData[]): BaseActionExtension<FormulaPlugin> {
        return new FormulaActionExtension(actionDataList, this._plugin);
    }
}
