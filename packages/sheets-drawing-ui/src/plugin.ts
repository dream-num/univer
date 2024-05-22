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

import { LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { enUS, zhCN } from './locale';
import { DrawingPopupMenuController } from './controllers/drawing-popup-menu.controller';
import { SheetDrawingDataController } from './controllers/sheet-drawing-data.controller';
import { SheetDrawingUpdateController } from './controllers/sheet-drawing-update.controller';
import { SheetDrawingUIController } from './controllers/sheet-drawing.controller';
import { SheetCanvasFloatDomManagerService } from './services/canvas-float-dom-manager.service';
import { SheetDrawingTransformAffectedController } from './controllers/sheet-drawing-transform-affected.controller';

const PLUGIN_NAME = 'SHEETS_IMAGE_UI_PLUGIN';

export class UniverSheetsDrawingUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = PLUGIN_NAME;
    constructor(
        config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._localeService.load({
            zhCN,
            enUS,
        });
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services
            [SheetCanvasFloatDomManagerService],
            // controllers
            [SheetDrawingUIController],
            [SheetDrawingUpdateController],
            [SheetDrawingDataController],
            [DrawingPopupMenuController],
            [SheetDrawingTransformAffectedController],

        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
