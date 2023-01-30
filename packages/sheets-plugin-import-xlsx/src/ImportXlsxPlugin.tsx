import { Plugin, PLUGIN_NAMES, SheetContext, UniverSheet } from '@univerjs/core';
import { zh, en } from './Locale';
import { IMPORT_XLSX_PLUGIN_NAME } from './Basic/Const/PLUGIN_NAME';
import { ImportXlsxController } from './Controller/ImportXlsxController';
import { BaseComponentPlugin } from '@univerjs/base-component';
import { DragAndDropExtensionFactory } from './Basic/Register/DragAndDropExtension';

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
        const context = this.getContext();

        /**
         * load more Locale object
         */
        context.getLocale().load({
            en: en,
            zh: zh,
        });

        this._importXlsxController = new ImportXlsxController(this);
        this.registerExtension();
    }

    registerExtension() {
        const dragAndDropRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<BaseComponentPlugin>(PLUGIN_NAMES.BASE_COMPONENT)
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
        const dragAndDropRegister = this.getContext()
            .getPluginManager()
            .getRequirePluginByName<BaseComponentPlugin>(PLUGIN_NAMES.BASE_COMPONENT)
            .getRegisterManager()
            .getDragAndDropExtensionManager()
            .getRegister();
        dragAndDropRegister.delete(this._dragAndDropExtensionFactory);
    }

    getImportXlsxController() {
        return this._importXlsxController;
    }
}
