import { ACTION_NAMES, Plugin, BaseActionExtension, BaseActionExtensionFactory, ISetRangeDataActionData, ObjectMatrix, ISheetActionData, ObjectMatrixPrimitiveType } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';
import { ICellData } from '@univer/core/src/Interfaces/ICellData';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from './Const';

export class NumfmtActionExtension extends BaseActionExtension<ISetRangeDataActionData> {
    // constructor(protected actionData: ISetRangeDataActionData) {
    //     super(actionData);
    // }

    execute() {
        const numfmtMatrix = new ObjectMatrix<string>();
        let cellValue = this.actionData.cellValue;
        // a range
        if (!isNaN(parseInt(Object.keys(cellValue)[0]))) {
            const rangeMatrix = new ObjectMatrix(cellValue as ObjectMatrixPrimitiveType<ICellData>);

            rangeMatrix.forValue((r, c, cell) => {
                const typed = numfmt.parseValue(cell.v) as unknown as { z: string; v: string };
                if (typed) {
                    const format = numfmt(typed.z);
                    cell.m = format(typed.v);
                    cell.v = typed.v || String();
                    numfmtMatrix.setValue(r, c, typed.z);
                }
            });
        }
        // a cell
        else {
            let cell: ICellData = cellValue;
            const typed = numfmt.parseValue(cell.v) as unknown as { z: string; v: string };
            if (typed) {
                const format = numfmt(typed.z);
                cell.m = format(typed.v);
                cell.v = typed.v || String();
                numfmtMatrix.setValue(0, 0, typed.z);
            }
        }

        const setNumfmtRangeDataAction = {
            actionName: PLUGIN_ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION,
            sheetId: this.actionData.sheetId,
            rangeData: this.actionData.rangeData,
            cellValue: numfmtMatrix.toJSON(),
        };
        this.push(setNumfmtRangeDataAction);
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

    create(actionData: ISetRangeDataActionData, actionDataList: ISheetActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new NumfmtActionExtension(actionData, actionDataList);
    }

    // check(actionData: ISheetActionData) {
    //     // Determine whether it is a setFormattedValueAction
    //     if (actionData.actionName !== this.actionName) {
    //         return false;
    //     }

    //     return this.create(actionData as ISetRangeDataActionData);
    // }
}
