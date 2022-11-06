import { ACTION_NAMES } from '../../Const';
import { ISetRangeDataActionData } from '../../Sheets/Action';
import { ISheetActionData } from '../SheetAction';
import {
    BaseActionExtension,
    BaseActionExtensionFactory,
} from '../ActionExtensionFactory';

export class FormatActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    setValue() {
        const rangeData = this.actionData.rangeData;
        const cellValue = this.actionData.cellValue;
        const { startRow, endRow, startColumn, endColumn } = rangeData;
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = cellValue[r][c];
                // TODO format from format-plugin
                cell.m = '100%';
                cell.v = 1;
            }
        }
    }

    execute() {
        this.setValue();
    }
}

export class FormatActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData> {
    get zIndex(): number {
        return 2;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    create(
        actionData: ISetRangeDataActionData,
        actionDataList: ISheetActionData[]
    ): BaseActionExtension<ISetRangeDataActionData> {
        return new FormatActionExtension(actionData, actionDataList);
    }

    // check(actionData: ISetRangeDataActionData, actionDataList: ISheetActionData[]) {
    //     // Determine whether it is a setFormattedValueAction
    //     if (actionData.actionName !== this.actionName) {
    //         return false;
    //     }

    //     return this.create(actionData, actionDataList);
    // }
}
