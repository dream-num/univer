import { ACTION_NAMES, Plugin, BaseActionExtension, BaseActionExtensionFactory, IActionData, ISetRangeDataActionData, ObjectMatrix } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';

export class NumfmtActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    constructor(protected actionData: ISetRangeDataActionData) {
        super(actionData);
    }

    execute() {
        const matrix = new ObjectMatrix(this.actionData.cellValue);
        matrix.forEach((rowNumber, row) => {
            row.forEach((colNumber, cell) => {
                if (cell.v) {
                    const result = numfmt.parseValue(cell.v) as { z: string };
                    if (result) {
                        const format = numfmt(result.z);
                        cell.m = format(String(cell.v));
                    }
                }
            });
        });
    }
}

export class NumfmtActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData> {
    private _plugin: Plugin;

    get zIndex(): number {
        return 2;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    constructor(plugin: Plugin) {
        super();
        this._plugin = plugin;
    }

    create(actionData: ISetRangeDataActionData): BaseActionExtension<ISetRangeDataActionData> {
        return new NumfmtActionExtension(actionData);
    }

    check(actionData: IActionData) {
        // Determine whether it is a setFormattedValueAction
        if (actionData.actionName !== this.actionName) {
            return false;
        }

        return this.create(actionData as ISetRangeDataActionData);
    }
}
