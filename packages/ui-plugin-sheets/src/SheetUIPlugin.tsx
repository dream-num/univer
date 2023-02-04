import { Plugin, UniverSheet, Tools } from '@univerjs/core';
import { zh, en } from './Locale';
import { SheetUIController } from './Controller/SheetUIController';
import { DefaultSheetUiConfig, ISheetsPluginConfig, Locale, SHEET_UI_PLUGIN_NAME } from './Basic';

export class SheetUIPlugin extends Plugin {
    private _sheetsController: SheetUIController;

    private _config: ISheetsPluginConfig;

    private _locale: Locale;

    constructor(config?: ISheetsPluginConfig) {
        super(SHEET_UI_PLUGIN_NAME);
        this._config = Tools.deepMerge({}, DefaultSheetUiConfig, config);
    }

    static create(config?: ISheetsPluginConfig) {
        return new SheetUIPlugin(config);
    }

    installTo(univerInstance: UniverSheet) {
        univerInstance.installPlugin(this);
    }

    initialize(): void {
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._sheetsController = new SheetUIController(this);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
