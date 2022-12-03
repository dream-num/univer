import {
    ActionOperation,
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    Command,
    ICellData,
    ISetRangeDataActionData,
    isFormulaString,
    ISheetActionData,
    IUnitRange,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
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
        const rangeData = this.actionData.rangeData;
        const commandManager = this._plugin.getContext().getCommandManager();

        const workBook = this._plugin.getContext().getWorkBook();
        let cellValue = this.actionData.cellValue;

        if(Tools.isEmptyObject(formulaData)) return

        const cellData = new ObjectMatrix(formulaData[unitId][sheetId]);

        // a range TODO api will trigger here
        if (!isNaN(parseInt(Object.keys(cellValue)[0]))) {
            const rangeMatrix = new ObjectMatrix(cellValue as ObjectMatrixPrimitiveType<ICellData>);

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
        }
        // a cell
        else {
            const { startRow: r, startColumn: c } = rangeData;
            let cell: ICellData = cellValue;
            const formulaString = cell.m;
            if (isFormulaString(formulaString)) {
                cellData.setValue(r, c, {
                    formula: formulaString,
                    row: r,
                    column: c,
                    sheetId,
                });

                const unitRange: IUnitRange[] = [
                    {
                        unitId,
                        sheetId,
                        rangeData,
                    },
                ];

                // cell.v = 55;
                // cell.t = 1;

                engine.execute(unitId, formulaData, formulaController.toInterpreterCalculateProps(), true, unitRange).then((sheetData) => {
                    const cellCalculate = sheetData[sheetId].getValue(r, c) as ICellData;
                    // cell.v = cellCalculate?.v;
                    // cell.t = cellCalculate?.t;
                    if (cellCalculate && cellCalculate.p) {
                        delete cellCalculate.p;
                    }

                    if (cellCalculate && Number.isNaN(cellCalculate.v)) {
                        cellCalculate.v = 0;
                    }

                    const action: ISetRangeDataActionData = {
                        actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
                        sheetId,
                        rangeData: {
                            startColumn: c,
                            endColumn: c,
                            startRow: r,
                            endRow: r,
                        },
                        cellValue: cellCalculate,
                    };

                    const setFormulaDataAction = {
                        actionName: PLUGIN_ACTION_NAMES.SET_FORMULA_RANGE_DATA_ACTION,
                        sheetId: this.actionData.sheetId,
                        rangeData: this.actionData.rangeData,
                        formulaData,
                    };
                    const actionData = ActionOperation.make<ISetRangeDataActionData>(action).removeCollaboration().removeUndo().getAction();
                    const command = new Command({ WorkBookUnit: workBook }, actionData, setFormulaDataAction);
                    commandManager.invoke(command);
                });
            }
        }
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
