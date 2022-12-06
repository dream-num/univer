import { ACTION_NAMES, BaseActionExtension, BaseActionExtensionFactory, ISetRangeDataActionData, ObjectMatrix, ISheetActionData, ObjectMatrixPrimitiveType } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';
import { ICellData } from '@univer/core/src/Interfaces/ICellData';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from '../Enum';
import { NumfmtPlugin } from '../../NumfmtPlugin';

export class NumfmtActionExtension extends BaseActionExtension<ISetRangeDataActionData, NumfmtPlugin> {
    // constructor(protected actionData: ISetRangeDataActionData) {
    //     super(actionData);
    // }

    execute() {
        // TODO
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
            cellValue: numfmtMatrix.toJSON(),
        };
        this.push(setNumfmtRangeDataAction);
    }
}

export class NumfmtActionExtensionFactory extends BaseActionExtensionFactory<ISetRangeDataActionData, NumfmtPlugin> {
    get zIndex(): number {
        return 2;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.SET_RANGE_DATA_ACTION;
    }

    create(actionData: ISetRangeDataActionData, actionDataList: ISheetActionData[]): BaseActionExtension<ISetRangeDataActionData> {
        return new NumfmtActionExtension(actionData, actionDataList, this._plugin);
    }
}
