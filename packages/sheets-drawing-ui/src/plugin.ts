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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsDrawingUIConfig } from './controllers/config.schema';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { SheetsDrawingRenderController } from './controllers/render-controllers/sheet-drawing.render-controller';
import { SheetDrawingUIController } from './controllers/sheet-drawing.controller';
import { SheetsDrawingCopyPasteController } from './controllers/sheet-drawing-copy-paste.controller';
import { SheetDrawingPermissionController } from './controllers/sheet-drawing-permission.controller';
import { SheetDrawingPrintingController } from './controllers/sheet-drawing-printing.controller';
import { SheetDrawingTransformAffectedController } from './controllers/sheet-drawing-transform-affected.controller';
import { SheetDrawingUpdateController } from './controllers/sheet-drawing-update.controller';
import { SheetCanvasFloatDomManagerService } from './services/canvas-float-dom-manager.service';

const PLUGIN_NAME = 'SHEET_IMAGE_UI_PLUGIN';

@DependentOn(UniverDrawingPlugin, UniverDrawingUIPlugin, UniverSheetsDrawingPlugin)
export class UniverSheetsDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsDrawingUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._initDependencies();

        this._injector.get(SheetCanvasFloatDomManagerService);
    }

    override onReady(): void {
        this._injector.get(SheetsDrawingCopyPasteController);
    }

    override onRendered(): void {
        this._registerRenderModules();

        this._injector.get(SheetDrawingPermissionController);
        this._injector.get(SheetDrawingPrintingController);
        this._injector.get(SheetDrawingUIController);
    }

    override onSteady(): void {
        this._injector.get(DrawingPopupMenuController);
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            [SheetCanvasFloatDomManagerService],
            [SheetDrawingUIController],
            [DrawingPopupMenuController],
            [SheetDrawingPrintingController],
            [SheetDrawingPermissionController],
            [SheetsDrawingCopyPasteController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    private _registerRenderModules(): void {
        ([
            [SheetDrawingUpdateController],
            [SheetDrawingTransformAffectedController],
            [SheetsDrawingRenderController],
        ] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }
}
