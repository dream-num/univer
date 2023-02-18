import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { IToolbarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetPlugin } from '@univerjs/base-sheets';
import { SplitColumnButton } from './UI/SplitColumnButton';
import { zh, en } from './Locale';

import { IConfig } from './IData/ISplitColumn';
import { SPLIT_COLUMN_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface ISplitColumnPluginConfig {}

export class SplitColumnPlugin extends Plugin {
    constructor(config?: ISplitColumnPluginConfig) {
        super(SPLIT_COLUMN_PLUGIN_NAME);
    }

    static create(config?: ISplitColumnPluginConfig) {
        return new SplitColumnPlugin(config);
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
            locale: SPLIT_COLUMN_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <SplitColumnButton config={config} />,
        };
        context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}

    onMapping(): void {}
}
