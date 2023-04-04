import { Plugin, SheetContext, UniverSheet } from '@univerjs/core';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { zh, en } from './Locale';
import { IMPORT_XLSX_PLUGIN_NAME } from './Basics';
import { ImportXlsxController } from './Controller/ImportXlsxController';
import { DragAndDropExtensionFactory } from './Basics/Register/DragAndDropExtension';

export interface IImportXlsxPluginConfig {}

export class ImportXlsxPlugin extends Plugin<any, SheetContext> {
    private _importXlsxController: ImportXlsxController;

    private _dragAndDropExtensionFactory: DragAndDropExtensionFactory;

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
        const context = this.getGlobalContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en,
            zh,
        });

        this._importXlsxController = new ImportXlsxController(this);
        this.registerExtension();
    }

    registerExtension() {
        const dragAndDropRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getDragAndDropExtensionManager()
            .getRegister();

        this._dragAndDropExtensionFactory = new DragAndDropExtensionFactory(this);
        dragAndDropRegister.add(this._dragAndDropExtensionFactory);
    }

    onMounted(): void {
        this.initialize();
    }

    onDestroy(): void {
        const dragAndDropRegister = this.getGlobalContext()
            .getPluginManager()
            .getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME)
            .getRegisterManager()
            .getDragAndDropExtensionManager()
            .getRegister();
        dragAndDropRegister.delete(this._dragAndDropExtensionFactory);
    }

    getImportXlsxController() {
        return this._importXlsxController;
    }
}
