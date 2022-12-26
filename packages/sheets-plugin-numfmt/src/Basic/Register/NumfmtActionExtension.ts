import { BaseActionExtension, BaseActionExtensionFactory, ISetRangeDataActionData, ObjectMatrix, ISheetActionData, ACTION_NAMES, ActionOperation } from '@univer/core';
import { numfmt } from '@univer/base-numfmt-engine';
import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from '../Enum';
import { NumfmtPlugin } from '../../NumfmtPlugin';

export class NumfmtActionExtension extends BaseActionExtension<NumfmtPlugin> {
    execute() {
        const numfmtMatrix = new ObjectMatrix<string>();
        const actionDataList = this.actionDataList as ISetRangeDataActionData[];

        actionDataList.forEach((actionData) => {
            if (actionData.operation != null && !ActionOperation.hasExtension(actionData)) {
                return false;
            }

            if (actionData.actionName !== ACTION_NAMES.SET_RANGE_DATA_ACTION) {
                return false;
            }

            let { cellValue, sheetId } = actionData;
            const numfmtConfig = this._plugin.getNumfmtBySheetIdConfig(sheetId);
            const currSheetNumfmtMatrix = new ObjectMatrix(numfmtConfig);
            const rangeMatrix = new ObjectMatrix(cellValue);

            rangeMatrix.forValue((r, c, cell) => {
                const typed = numfmt.parseValue(cell.v) as unknown as { z: string; v: string };

                if (typed) {
                    // format already set，get format, e.g. 100% => =sum(2), we will set 200%
                    const currNumfmtValue = currSheetNumfmtMatrix.getValue(r, c);
                    // if (currNumfmtValue) {
                    //     typed.z = ;
                    // }

                    const format = numfmt(typed.z);
                    cell.m = format(typed.v);
                    cell.v = typed.v || String();
                    numfmtMatrix.setValue(r, c, typed.z);
                }
            });

            const setNumfmtRangeDataAction = {
                actionName: PLUGIN_ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION,
                sheetId,
                cellValue: numfmtMatrix.toJSON(),
            };
            this.push(setNumfmtRangeDataAction);
        });
    }
}

export class NumfmtActionExtensionFactory extends BaseActionExtensionFactory<NumfmtPlugin> {
    get zIndex(): number {
        return 2;
    }

    create(actionDataList: ISheetActionData[]): BaseActionExtension<NumfmtPlugin> {
        return new NumfmtActionExtension(actionDataList, this._plugin);
    }
}
