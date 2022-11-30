import { Plugin, SheetContext, UniverSheet } from '@univer/core';
import { zh, en } from './Locale';
import { IMPORT_XLSX_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { ImportXlsxController } from './Controller/ImportXlsxController';

export interface IImportXlsxPluginConfig {}

export class ImportXlsxPlugin extends Plugin<any, SheetContext> {
    private _importXlsxController: ImportXlsxController;

    constructor(config?: IImportXlsxPluginConfig) {
        super(IMPORT_XLSX_PLUGIN_NAME);
    }

    static create(config?: IImportXlsxPluginConfig) {
        return new ImportXlsxPlugin(config);
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
            en: en,
            zh: zh,
        });

        this._importXlsxController = new ImportXlsxController(this);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {}
}
