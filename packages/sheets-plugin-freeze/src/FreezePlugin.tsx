import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, IOCContainer, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { FROZEN_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { IConfig } from './IData';
import { en, zh } from './Model/Locale';
import { FreezeButton } from './View/UI/FreezeButton';

export interface IFreezePluginConfig {}

export class FreezePlugin extends Plugin {
    spreadsheetPlugin: any;

    constructor(config?: IFreezePluginConfig) {
        super(FROZEN_PLUGIN_NAME);
    }

    static create(config?: IFreezePluginConfig) {
        return new FreezePlugin(config);
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
            locale: FROZEN_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <FreezeButton config={config} />,
        };
        // get spreadsheet plugin
        this.spreadsheetPlugin = context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.spreadsheetPlugin?.addButton(item);
    }

    onMapping(IOC: IOCContainer): void {}

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}
}
