import { ISelectionRange, Plugin } from '@univerjs/core';

import { FILTER_PLUGIN_NAME } from './Const';
import { Filter, FilterList, IFilterPluginConfig } from './Domain';

// TODO@jerry
// Filtering affects row hiding, registered to RowRulerManager
export class FilterPlugin extends Plugin {
    private _filterList: FilterList;

    constructor(config?: IFilterPluginConfig) {
        super(FILTER_PLUGIN_NAME);
        this._filterList = FilterList.fromSequence(config || {});
    }

    override onRendered(): void {
        // const config: IConfig = {
        //     context,
        // };
        // context.getLocale().load({
        //     en,
        //     zh,
        // });
        // context
        //     .getPluginManager()
        //     .getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)
        //     .addButton({
        //         locale: FILTER_PLUGIN_NAME,
        //         type: ISlotElement.JSX,
        //         show: true,
        //         label: <FilterButton config={config} super={this} />,
        //     });
    }

    addFilter(filter: Filter): void {
        // const context = this.getContext();
        // const commandManager = context.getCommandManager();
        // const workbook = context.getWorkBook();
        // const worksheet = workbook.getActiveSheet();
        // if (worksheet) {
        //     const configure = {
        //         actionName: ACTION_NAMES.ADD_FILTER_ACTION,
        //         filter: filter.toSequence(),
        //         sheetId: worksheet.getSheetId(),
        //     };
        //     const command = new Command(workbook, configure);
        //     commandManager.invoke(command);
        // }
    }

    newFilter(sheetId: string, range: ISelectionRange): Filter | null {
        //return new Filter(sheetId, range).withContext(this.getContext());
        return null;
    }

    getFilterList(): FilterList {
        return this._filterList;
    }
}
