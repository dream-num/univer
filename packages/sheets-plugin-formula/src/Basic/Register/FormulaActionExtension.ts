import {
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
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

export class FormulaActionExtension extends BaseActionExtension<ISetRangeDataActionData, FormulaPlugin> {
    execute() {
        const engine = this._plugin.getFormulaEngine();
        const formulaData = Tools.deepClone(this._plugin.getFormulaController().getDataModel().getFormulaData());
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const sheetId = this.actionData.sheetId;
        const rangeData = this.actionData.rangeData;
        let cellValue = this.actionData.cellValue;

        const cellData = new ObjectMatrix(formulaData[unitId][sheetId]);

        // a range
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
            }

            const unitRange: IUnitRange[] = [
                {
                    unitId,
                    sheetId,
                    rangeData,
                },
            ];

            // cell.v = 55;
            // cell.t = 1;
            engine.execute(unitId, formulaData, undefined, undefined, unitRange).then((sheetData) => {
                const cellCalculate = sheetData[sheetId].getValue(r, c);
                cell.v = cellCalculate?.v;
                cell.t = cellCalculate?.t;
            });
        }

        // const setNumfmtRangeDataAction = {
        //     actionName: ACTION_NAMES,
        //     sheetId: this.actionData.sheetId,
        //     rangeData: this.actionData.rangeData,
        //     cellValue: formulaMatrix.toJSON(),
        // };
        // this.push(setNumfmtRangeDataAction);
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
