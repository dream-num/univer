import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, IRangeType, Plugin, PLUGIN_NAMES, UniverSheet } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SORT_PLUGIN_NAME } from './Const/PLUGIN_NAME';
import { Sort } from './Domain';
import { IConfig } from './IData/ISort';
import { en, zh } from './Locale';
import { SortButton } from './UI/SortButton';

export interface ISortPluginConfig {}

export class SortPlugin extends Plugin {
    private _sort: Sort | null;

    constructor(config?: ISortPluginConfig) {
        super(SORT_PLUGIN_NAME);
    }

    static create(config?: ISortPluginConfig) {
        return new SortPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });
        const config: IConfig = { context };

        const item: IToolbarItemProps = {
            locale: SORT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <SortButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();

        // const sort = this.createSort('A1:B2').ASCSord();
    }

    createSort(range: IRangeType) {
        const _range = this.getContext().getWorkBook().getSheets()[0].getRange(range);
        this._sort = new Sort(_range, 'ASCENDING');
        return this._sort;
    }

    removeSort() {
        this._sort = null;
    }

    onDestroy(): void {}
}
