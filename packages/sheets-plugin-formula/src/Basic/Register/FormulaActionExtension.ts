import {
    ActionOperation,
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    Command,
    ISetRangeDataActionData,
    isFormulaString,
    ISheetActionData,
    IUnitRange,
    ObjectMatrix,
    Tools,
} from '@univer/core';
import { FormulaPlugin } from '../../FormulaPlugin';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from '../Enum';

export class FormulaActionExtension extends BaseActionExtension<ISetRangeDataActionData, FormulaPlugin> {
    execute() {
        const engine = this._plugin.getFormulaEngine();
        const formulaController = this._plugin.getFormulaController();
        const formulaDataModel = formulaController.getDataModel();
        const formulaData = Tools.deepClone(formulaDataModel.getFormulaData());
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const sheetId = this.actionData.sheetId;
        const commandManager = this._plugin.getContext().getCommandManager();

        const workBook = this._plugin.getContext().getWorkBook();
        let cellValue = this.actionData.cellValue;

        if (Tools.isEmptyObject(formulaData)) return;

        const cellData = new ObjectMatrix(formulaData[unitId][sheetId]);

        // cellValue 在公式更新后，还是会触发，并且为空，这里要看看
        if (cellValue == null) {
            return;
        }

        const rangeMatrix = new ObjectMatrix(cellValue);

        // update formula string
        rangeMatrix.forValue((r, c, cell) => {
            const formulaString = cell.m;
            if (isFormulaString(formulaString)) {
                cellData.setValue(r, c, {
                    formula: formulaString,
                    row: r,
                    column: c,
                    sheetId,
                });
            }
        });

        const unitRange: IUnitRange[] = [
            {
                unitId,
                sheetId,
                rangeData: rangeMatrix.getDataRange(),
            },
        ];

        engine.execute(unitId, formulaData, formulaController.toInterpreterCalculateProps(), false, unitRange).then((data) => {
            const { sheetData, arrayFormulaData } = data;

            if (!sheetData) {
                console.error('No sheetData from Formula Engine!');
                return;
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
                sheetId: this.actionData.sheetId,
                formulaData,
            };

            const command = new Command({ WorkBookUnit: workBook }, ...actionDatas, setFormulaDataAction);
            commandManager.invoke(command);
        });
    }
}

export class FormulaActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData, FormulaPlugin> {
    get zIndex(): number {
        return 1;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    create(actionData: ISetRangeDataActionData, actionDataList: ISheetActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new FormulaActionExtension(actionData, actionDataList, this._plugin);
    }
}
