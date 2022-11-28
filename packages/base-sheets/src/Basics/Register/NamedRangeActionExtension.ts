import {
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    ICellData,
    ISetRangeDataActionData,
    ISheetActionData,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
} from '@univer/core';
import { SheetPlugin } from '../../SheetPlugin';

export class NamedRangeActionExtension extends BaseActionExtension<ISetRangeDataActionData, SheetPlugin> {
    execute() {
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const sheetId = this.actionData.sheetId;
        const rangeData = this.actionData.rangeData;
        const commandManager = this._plugin.getContext().getCommandManager();

        const workBook = this._plugin.getContext().getWorkBook();
        let cellValue = this.actionData.cellValue;

        // a range TODO api will trigger here
        if (!isNaN(parseInt(Object.keys(cellValue)[0]))) {
            const rangeMatrix = new ObjectMatrix(cellValue as ObjectMatrixPrimitiveType<ICellData>);

            // update formula string
            rangeMatrix.forValue((r, c, cell) => {});
        }
        // a cell
        else {
            const { startRow: r, startColumn: c } = rangeData;
        }
    }
}

export class NamedRangeActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData, SheetPlugin> {
    get zIndex(): number {
        return 1;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    create(actionData: ISetRangeDataActionData, actionDataList: ISheetActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new NamedRangeActionExtension(actionData, actionDataList, this._plugin);
    }
}
