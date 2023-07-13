import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
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

        const item: IToolbarItemProps = {
            locale: PRINT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <PrintButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
