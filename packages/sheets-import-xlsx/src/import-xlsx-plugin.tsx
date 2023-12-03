import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IMPORT_XLSX_PLUGIN_NAME } from './basics';
import { ImportXlsxController } from './controllers/import-xlsx-controller';
import { enUS } from './locale';
import { UploadService } from './services/upload.service';

export interface IImportXlsxPluginConfig {}

export class ImportXlsxPlugin extends Plugin {
    static override type = PluginType.Sheet;

    private _importXlsxController!: ImportXlsxController;

    constructor(
        config: IImportXlsxPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(IMPORT_XLSX_PLUGIN_NAME);
    }

    initialize(): void {
        /**
         * load more Locale object
         */
        this._localeService.load({
            enUS,
        });

        // this._importXlsxController = new ImportXlsxController(this);
        this._importXlsxController = this._injector.createInstance(ImportXlsxController);
        this._injector.add([ImportXlsxController, { useValue: this._importXlsxController }]);
        this._injector.add([UploadService]);

        this.registerExtension();
    }

    registerExtension() {
        // const dragAndDropRegister = this._registerManager.getDragAndDropExtensionManager().getRegister();
        // this._dragAndDropExtensionFactory = new DragAndDropExtensionFactory(this._injector);
        // dragAndDropRegister.add(this._dragAndDropExtensionFactory);
    }

    override onRendered(): void {
        this.initialize();
    }

    override onDestroy(): void {
        // const dragAndDropRegister = this._registerManager.getDragAndDropExtensionManager().getRegister();
        // dragAndDropRegister.delete(this._dragAndDropExtensionFactory);
    }

    getImportXlsxController() {
        return this._importXlsxController;
    }
}
