import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { SheetContext, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { PrintButton } from './UI/PrintButton';

import { IConfig } from './IData/IPrint';
import { PRINT_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface IPrintPluginConfig {}

export class PrintPlugin extends Plugin {
    constructor(config?: IPrintPluginConfig) {
        super(PRINT_PLUGIN_NAME);
    }

    static create(config?: IPrintPluginConfig) {
        return new PrintPlugin(config);
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
        const config: IConfig = {
            context,
        };

        const item: IToolBarItemProps = {
            locale: PRINT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <PrintButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
