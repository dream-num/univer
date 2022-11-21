import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { SheetContext, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { PivotTableButton } from './UI/PivotTableButton';

import { IConfig } from './IData/IPivotTable';
import { PIVOT_TABLE_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface IPivotTablePluginConfig {}

export class PivotTablePlugin extends Plugin {
    SheetPlugin: any;

    constructor(config?: IPivotTablePluginConfig) {
        super(PIVOT_TABLE_PLUGIN_NAME);
    }

    static create(config?: IPivotTablePluginConfig) {
        return new PivotTablePlugin(config);
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
        const config: IConfig = {};

        const item: IToolBarItemProps = {
            locale: PIVOT_TABLE_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <PivotTableButton config={config} />,
        };
        // get spreadsheet plugin
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.sheetPlugin?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
