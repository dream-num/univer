import { ISlotElement } from '@univer/base-component';
import { Command, Context, IRangeData, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { IConfig } from './IData';
import { FilterButton } from './UI/FilterButton';
import { ACTION_NAMES, FILTER_PLUGIN_NAME } from './Const';
import { Filter, FilterList, IFilterList } from './Domain';

export class FilterPlugin extends Plugin {
    private _filterList: FilterList;

    constructor(config?: IFilterList) {
        super(FILTER_PLUGIN_NAME);
        this._filterList = FilterList.fromSequence(config || {});
    }

    static create(config?: IFilterList) {
        return new FilterPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onMounted(context: Context): void {
        const config: IConfig = {
            context,
        };
        context.getLocale().load({
            en,
            zh,
        });
        context
            .getPluginManager()
            .getRequirePluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)
            .addButton({
                locale: FILTER_PLUGIN_NAME,
                type: ISlotElement.JSX,
                show: true,
                label: <FilterButton config={config} super={this} />,
            });
    }

    addFilter(filter: Filter): void {
        const context = this.getContext();
        const commandManager = context.getCommandManager();
        const workbook = context.getWorkBook();
        const worksheet = workbook.getActiveSheet();
        if (worksheet) {
            const configure = {
                actionName: ACTION_NAMES.ADD_FILTER_ACTION,
                filter: filter.toSequence(),
                sheetId: worksheet.getSheetId(),
            };
            const command = new Command(workbook, configure);
            commandManager.invoke(command);
        }
    }

    newFilter(sheetId: string, range: IRangeData): Filter {
        return new Filter(sheetId, range).withContext(this.getContext());
    }

    getFilterList(): FilterList {
        return this._filterList;
    }
}
