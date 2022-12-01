import { ACTION_NAMES, BaseActionExtension, BaseActionExtensionFactory, Command, IInsertRowActionData, ISetNamedRangeActionData, ISheetActionData, Tools } from '@univer/core';
import { SheetPlugin } from '../../SheetPlugin';

/**
 * TODO insertColumn/insertRange/insertRange/deleteRange
 */
export class NamedRangeInsertRowActionExtension extends BaseActionExtension<IInsertRowActionData, SheetPlugin> {
    execute() {
        const unitId = this._plugin.getContext().getWorkBook().getUnitId();
        const sheetId = this.actionData.sheetId;
        const commandManager = this._plugin.getContext().getCommandManager();

        const workbook = this._plugin.getContext().getWorkBook();

        const namedRanges = Tools.deepClone(this._plugin.getWorkbook().getConfig().namedRanges);

        const { rowCount, rowIndex } = this.actionData;

        const actionDatas = [];
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
            actionDatas.push(actionData);
        }

        // Execute action
        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            ...actionDatas
        );
        commandManager.invoke(command);
    }
}

export class NamedRangeInsertRowActionExtensionFactory extends BaseActionExtensionFactory<IInsertRowActionData, SheetPlugin> {
    get zIndex(): number {
        return 1;
    }

    get actionName(): ACTION_NAMES {
        return ACTION_NAMES.INSERT_ROW_ACTION;
    }

    create(actionData: IInsertRowActionData, actionDataList: ISheetActionData[]): BaseActionExtension<IInsertRowActionData> {
        return new NamedRangeInsertRowActionExtension(actionData, actionDataList, this._plugin);
    }
}
