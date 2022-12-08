import {
    ActionOperation,
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    ISetNamedRangeActionData,
    ISheetActionData,
    Tools,
    IInsertRowActionData,
} from '@univer/core';
import { SheetPlugin } from '../../SheetPlugin';

/**
 * TODO insertColumn/insertRange/insertRange/deleteRange
 */
export class NamedRangeActionExtension extends BaseActionExtension<SheetPlugin> {
    execute() {
        const actionDataList = this.actionDataList;

        actionDataList.forEach((actionData) => {
            if (actionData.operation != null && !ActionOperation.hasExtension(actionData)) {
                return false;
            }

            if (actionData.actionName === ACTION_NAMES.INSERT_ROW_ACTION) {
                const { sheetId, rowCount, rowIndex } = actionData as IInsertRowActionData;
                const namedRanges = Tools.deepClone(this._plugin.getWorkbook().getConfig().namedRanges);

                for (let i = 0; i < namedRanges.length; i++) {
                    const namedRangeData = namedRanges[i].range.rangeData;
                    if (rowIndex > namedRangeData.endRow) {
                        continue;
                    } else if (rowIndex >= namedRangeData.startRow && rowIndex <= namedRangeData.endRow) {
                        namedRangeData.endRow += rowCount;
                    } else {
                        namedRangeData.startRow += rowCount;
                        namedRangeData.endRow += rowCount;
                    }

                    const actionData: ISetNamedRangeActionData = {
                        actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
                        namedRange: namedRanges[i],
                        sheetId,
                    };
                    this.push(actionData);
                }
            }
        });
    }
}

export class NamedRangeActionExtensionFactory extends BaseActionExtensionFactory<SheetPlugin> {
    get zIndex(): number {
        return 3;
    }

    create(actionDataList: ISheetActionData[]): BaseActionExtension<SheetPlugin> {
        return new NamedRangeActionExtension(actionDataList, this._plugin);
    }
}
