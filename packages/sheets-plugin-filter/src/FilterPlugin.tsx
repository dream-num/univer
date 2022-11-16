import { ISlotElement } from '@univer/base-component';
import { Command, SheetContext, IRangeData, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { IConfig } from './IData';
import { FilterButton } from './UI/FilterButton';
import { ACTION_NAMES, FILTER_PLUGIN_NAME } from './Const';
import { Filter, FilterList, IFilterPluginConfig } from './Domain';

export class FilterPlugin extends Plugin {
    private _filterList: FilterList;

    constructor(config?: IFilterPluginConfig) {
        super(FILTER_PLUGIN_NAME);
        this._filterList = FilterList.fromSequence(config || {});
    }

    static create(config?: IFilterPluginConfig) {
        return new FilterPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    onMounted(context: SheetContext): void {
        const config: IConfig = {
            context,
        };
        context.getLocale().load({
            en,
            zh,
        });
        context
            .getPluginManager()
            .getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)
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
