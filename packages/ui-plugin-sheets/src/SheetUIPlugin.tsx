import { Plugin, UniverSheet, Tools } from '@univerjs/core';
import { zh, en } from './Locale';
import { SheetUIController } from './Controller/SheetUIController';
import { DefaultSheetUiConfig, installObserver, ISheetsPluginConfig, SheetUIPluginObserve, SHEET_UI_PLUGIN_NAME } from './Basics';
import { Context } from '@univerjs/core/src/Basics/Context';

export class SheetUIPlugin extends Plugin<SheetUIPluginObserve, Context> {
    private _sheetsController: SheetUIController;

    private _config: ISheetsPluginConfig;

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

    initialize(ctx: Context): void {
        installObserver(this);
        this._config.context = ctx;
        const context = this.getContext();
        /**
         * load more Locale object
         */
        context.getLocale().load({
            zh,
            en,
        });

        this._sheetsController = new SheetUIController(this);
    }

    getConfig() {
        return this._config;
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
