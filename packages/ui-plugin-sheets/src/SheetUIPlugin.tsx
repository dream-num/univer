import { Plugin, UniverSheet, UniverDoc, UniverSlide } from '@univerjs/core';
import { zh, en } from './Locale';
import { SHEET_UI_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { SheetUIController } from './Controller/SheetUIController';

export interface ISheetsPluginConfig {}

export class SheetUIPlugin extends Plugin {
    private _sheetsController: SheetUIController;

    constructor(config?: ISheetsPluginConfig) {
        super(SHEET_UI_PLUGIN_NAME);
    }

    static create(config?: ISheetsPluginConfig) {
        return new SheetUIPlugin(config);
    }

    installTo(univerInstance: UniverSheet | UniverDoc | UniverSlide) {
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
