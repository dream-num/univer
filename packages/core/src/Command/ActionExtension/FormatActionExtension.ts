import { ACTION_NAMES } from '../../Const';
import { ISetRangeDataActionData } from '../../Sheets/Action';
import { IActionData } from '../ActionBase';
import {
    BaseActionExtension,
    BaseActionExtensionFactory,
} from '../ActionExtensionFactory';

export class FormatActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    constructor(protected actionData: ISetRangeDataActionData) {
        super(actionData);
    }

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
        actionData: ISetRangeDataActionData
    ): BaseActionExtension<ISetRangeDataActionData> {
        return new FormatActionExtension(actionData);
    }

    check(actionData: IActionData) {
        // Determine whether it is a setFormattedValueAction
        if (actionData.actionName !== this.actionName) {
            return false;
        }

        return this.create(actionData as ISetRangeDataActionData);
    }
}
