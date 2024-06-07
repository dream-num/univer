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

import { DependentOn, LocaleService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';
import { UniverSheetsDrawingPlugin } from '@univerjs/sheets-drawing';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { DrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { SheetDrawingUpdateController } from './controllers/sheet-drawing-update.controller';
import type { IUniverSheetsDrawingConfig } from './controllers/sheet-drawing.controller';
import { DefaultSheetsDrawingConfig, SheetDrawingUIController } from './controllers/sheet-drawing.controller';
import { SheetDrawingTransformAffectedController } from './controllers/sheet-drawing-transform-affected.controller';
import { SheetCanvasFloatDomManagerService } from './services/canvas-float-dom-manager.service';
import { SheetDrawingPrintingController } from './controllers/sheet-drawing-printing.controller';

const PLUGIN_NAME = 'SHEET_IMAGE_UI_PLUGIN';

@DependentOn(UniverDrawingPlugin, UniverDrawingUIPlugin, UniverSheetsDrawingPlugin)
export class UniverSheetsDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = PLUGIN_NAME;

    private _pluginConfig: IUniverSheetsDrawingConfig;

    constructor(
        config: Partial<IUniverSheetsDrawingConfig> = {},
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._pluginConfig = Tools.deepMerge({}, DefaultSheetsDrawingConfig, config);
    }

    override onStarting(_injector: Injector): void {
        super.onStarting(_injector);
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services
            [SheetCanvasFloatDomManagerService],
            // controllers
            [
                SheetDrawingUIController,
                {
                    useFactory: () => this._injector.createInstance(SheetDrawingUIController, this._pluginConfig),
                },
            ],
            [SheetDrawingUpdateController],
            [DrawingPopupMenuController],
            [SheetDrawingTransformAffectedController],
            [SheetDrawingPrintingController],

        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
