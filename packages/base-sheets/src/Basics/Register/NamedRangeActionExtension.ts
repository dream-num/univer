import {
    ActionOperation,
    ACTION_NAMES,
    BaseActionExtension,
    BaseActionExtensionFactory,
    ISetNamedRangeActionData,
    ISheetActionData,
    Tools,
    IInsertRowActionData,
    ICurrentUniverService,
    IActionData,
} from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import type { SheetPlugin } from '../../SheetPlugin';

/**
 * TODO insertColumn/insertRange/insertRange/deleteRange
 */
export class NamedRangeActionExtension extends BaseActionExtension<SheetPlugin> {
    constructor(actionDataList: IActionData[], _plugin: SheetPlugin, @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        super(actionDataList, _plugin);
    }

    override execute() {
        const actionDataList = this.actionDataList;

        actionDataList.forEach((actionData) => {
            if (actionData.operation != null && !ActionOperation.hasExtension(actionData)) {
                return false;
            }

            if (actionData.actionName === ACTION_NAMES.INSERT_ROW_ACTION) {
                const { sheetId, rowCount, rowIndex } = actionData as IInsertRowActionData;
                const namedRanges = Tools.deepClone(this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getConfig().namedRanges);

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
    constructor(_plugin: SheetPlugin, @Inject(Injector) private readonly _sheetInjector: Injector) {
        super(_plugin);
    }

    override get zIndex(): number {
        return 3;
    }

    override create(actionDataList: ISheetActionData[]): BaseActionExtension<SheetPlugin> {
        return this._sheetInjector.createInstance(NamedRangeActionExtension, actionDataList, this._plugin);
    }
}
