/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { IMPORT_XLSX_PLUGIN_NAME } from './common/plugin-name';
import { ImportXlsxController } from './controllers/import-xlsx-controller';
import { zhCN } from './locale';
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
            zhCN,
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
