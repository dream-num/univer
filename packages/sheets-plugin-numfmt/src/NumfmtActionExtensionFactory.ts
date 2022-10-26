import { ACTION_NAMES, Plugin, BaseActionExtension, BaseActionExtensionFactory, ISetRangeDataActionData, ObjectMatrix, IActionData } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from './Const';

export class NumfmtActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    // constructor(protected actionData: ISetRangeDataActionData) {
    //     super(actionData);
    // }

    execute() {
        const rangeMatrix = new ObjectMatrix(this.actionData.cellValue);
        const numfmtMatrix = new ObjectMatrix<string>();
        rangeMatrix.forValue((r, c, cell) => {
            const result = numfmt.parseValue(cell.v) as { z: string };
            const patten = result.z || 'General';
            cell.m = numfmt(patten)(String(cell.v));
            numfmtMatrix.setValue(r, c, patten);
        });
        const setNumfmtRangeDataAction = {
            actionName: PLUGIN_ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION,
            sheetId: this.actionData.sheetId,
            rangeData: this.actionData.rangeData,
            cellValue: numfmtMatrix.toJSON(),
        };
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

    create(actionData: ISetRangeDataActionData, actionDataList: IActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new NumfmtActionExtension(actionData, actionDataList);
    }

    // check(actionData: IActionData) {
    //     // Determine whether it is a setFormattedValueAction
    //     if (actionData.actionName !== this.actionName) {
    //         return false;
    //     }

    //     return this.create(actionData as ISetRangeDataActionData);
    // }
}
