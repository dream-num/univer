import { Inject, Injector } from '@wendellhu/redi';
import { Plugin, PluginType, UniverSheet } from '@univerjs/core';
import { RegisterManager } from '@univerjs/base-ui';
import { zh, en } from './Locale';
import { IMPORT_XLSX_PLUGIN_NAME } from './Basics';
import { ImportXlsxController } from './Controller/ImportXlsxController';
import { DragAndDropExtensionFactory } from './Basics/Register/DragAndDropExtension';

export interface IImportXlsxPluginConfig {}

export class ImportXlsxPlugin extends Plugin<any> {
    static override type = PluginType.Sheet;

    private _importXlsxController: ImportXlsxController;

    private _dragAndDropExtensionFactory: DragAndDropExtensionFactory;

    constructor(
        config: IImportXlsxPluginConfig,
        @Inject(Injector) private readonly _sheetInjector: Injector,
        @Inject(RegisterManager) private readonly _registerManager: RegisterManager
    ) {
        super(IMPORT_XLSX_PLUGIN_NAME);
    }

    static create(config?: IImportXlsxPluginConfig) {
        return new ImportXlsxPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        // this._importXlsxController = new ImportXlsxController(this);
        this._importXlsxController = this._sheetInjector.createInstance(ImportXlsxController);
        this._sheetInjector.add([ImportXlsxController, { useValue: this._importXlsxController }]);

        this.registerExtension();
    }

    registerExtension() {
        const dragAndDropRegister = this._registerManager.getDragAndDropExtensionManager().getRegister();

        this._dragAndDropExtensionFactory = new DragAndDropExtensionFactory(this);
        dragAndDropRegister.add(this._dragAndDropExtensionFactory);
    }

    override onMounted(): void {
        this.initialize();
    }

    override onDestroy(): void {
        const dragAndDropRegister = this._registerManager.getDragAndDropExtensionManager().getRegister();
        dragAndDropRegister.delete(this._dragAndDropExtensionFactory);
    }

    getImportXlsxController() {
        return this._importXlsxController;
    }
}
