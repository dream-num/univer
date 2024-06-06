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

import { LocaleService, Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { DrawingUpdateController } from './controllers/drawing-update.controller';
import { DrawingUIController } from './controllers/drawing-ui.controller';
import { ImageCropperController } from './controllers/image-cropper.controller';
import { ImageUpdateController } from './controllers/image-update.controller';
import { DrawingRenderService } from './services/drawing-render.service';

const PLUGIN_NAME = 'DRAWING_UI_PLUGIN';

export class UniverDrawingUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        config: undefined,
        @Inject(Injector) protected _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [

            // services
            [DrawingRenderService],
            // controllers
            [DrawingUpdateController],
            [DrawingUIController],
            [ImageCropperController],
            [ImageUpdateController],
        ];

        dependencies.forEach((dependency) => injector.add(dependency));
    }
}
