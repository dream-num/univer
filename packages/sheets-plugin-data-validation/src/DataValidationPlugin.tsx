import { IToolBarItemProps, ISlotElement } from '@univer/base-component';
import { Context, UniverSheet, Plugin, PLUGIN_NAMES } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import { en, zh } from './Locale';
import { DataValidationButton } from './UI/DataValidationButton';

import { IConfig } from './IData/IDataValidation';
import { DATA_VALIDATION_PLUGIN_NAME } from './Const/PLUGIN_NAME';

type IPluginConfig = {};

export class DataValidationPlugin extends Plugin {
    spreadsheetPlugin: any;

    constructor(config?: IPluginConfig) {
        super(DATA_VALIDATION_PLUGIN_NAME);
    }

    static create(config?: IPluginConfig) {
        return new DataValidationPlugin(config);
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
            locale: DATA_VALIDATION_PLUGIN_NAME,
            type: ISlotElement.JSX,
            show: true,
            label: <DataValidationButton config={config} />,
        };
        // get spreadsheet plugin
        this.spreadsheetPlugin = context.getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.spreadsheetPlugin?.addButton(item);
    }

    onMounted(ctx: Context): void {
        this.initialize();
    }

    onDestroy(): void {}

    onMapping(): void {}
}
