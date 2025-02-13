/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import type { IUniverDrawingUIConfig } from './controllers/config.schema';
import { IConfigService, Inject, Injector, merge, Plugin } from '@univerjs/core';
import { defaultPluginConfig, DRAWING_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DrawingUIController } from './controllers/drawing-ui.controller';
import { DrawingUpdateController } from './controllers/drawing-update.controller';
import { ImageCropperController } from './controllers/image-cropper.controller';
import { ImageUpdateController } from './controllers/image-update.controller';
import { DrawingRenderService } from './services/drawing-render.service';

const PLUGIN_NAME = 'UNIVER_DRAWING_UI_PLUGIN';

export class UniverDrawingUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverDrawingUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(DRAWING_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._initDependencies();
    }

    override onRendered(): void {
        this._injector.get(DrawingUpdateController);
        this._injector.get(DrawingUIController);
        this._injector.get(ImageCropperController);
        this._injector.get(ImageUpdateController);
    }

    private _initDependencies(): void {
        const dependencies: Dependency[] = [
            [DrawingRenderService],
            [DrawingUpdateController],
            [DrawingUIController],
            [ImageCropperController],
            [ImageUpdateController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }
}
