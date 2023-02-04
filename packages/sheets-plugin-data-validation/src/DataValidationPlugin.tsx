import { IToolBarItemProps, ISlotElement } from '@univerjs/base-ui';
import { SheetContext, UniverSheet, Plugin, PLUGIN_NAMES } from '@univerjs/core';
import { SheetPlugin } from '@univerjs/base-sheets';
import { en, zh } from './Locale';
import { DataValidationButton } from './UI/DataValidationButton';

import { IConfig } from './IData/IDataValidation';
import { DATA_VALIDATION_PLUGIN_NAME } from './Const/PLUGIN_NAME';

export interface IDataValidationPluginConfig {}

export class DataValidationPlugin extends Plugin {
    SheetPlugin: any;

    constructor(config?: IDataValidationPluginConfig) {
        super(DATA_VALIDATION_PLUGIN_NAME);
    }

    static create(config?: IDataValidationPluginConfig) {
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
        this.sheetPlugin = context.getPluginManager().getPluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET);

        // extend comment
        this.sheetPlugin?.addButton(item);
    }

    onMounted(ctx: SheetContext): void {
        this.initialize();
    }

    onDestroy(): void {}

    onMapping(): void {}
}
