import { Inject, Injector } from '@wendellhu/redi';
import { LocaleService, Plugin, PluginType } from '@univerjs/core';
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
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(RegisterManager) private readonly _registerManager: RegisterManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(IMPORT_XLSX_PLUGIN_NAME);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this._localeService.getLocale().load({
            en,
            zh,
        });

        // this._importXlsxController = new ImportXlsxController(this);
        this._importXlsxController = this._injector.createInstance(ImportXlsxController);
        this._injector.add([ImportXlsxController, { useValue: this._importXlsxController }]);

        this.registerExtension();
    }

    registerExtension() {
        const dragAndDropRegister = this._registerManager.getDragAndDropExtensionManager().getRegister();

        this._dragAndDropExtensionFactory = new DragAndDropExtensionFactory(this._injector);
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
