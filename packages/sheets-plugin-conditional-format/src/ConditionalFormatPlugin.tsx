import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { en, zh } from './Locale';
import { ConditionalFormatButton } from './UI/ConditionalFormatButton';

import { IConfig } from './IData/IConditionalFormat';
import { CONDITIONAL_FORMAT_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface IConditionalFormatPluginConfig {}

export class ConditionalFormatPlugin extends Plugin {
    SheetPlugin: any;

    constructor(config?: IConditionalFormatPluginConfig) {
        super(CONDITIONAL_FORMAT_PLUGIN_NAME);
    }

    static create(config?: IConditionalFormatPluginConfig) {
        return new ConditionalFormatPlugin(config);
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

        const item: IToolbarItemProps = {
            locale: CONDITIONAL_FORMAT_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <ConditionalFormatButton config={config} />,
        };
        // get spreadsheet plugin
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.sheetPlugin?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}
}
