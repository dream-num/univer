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
import { IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsCrosshairHighlightController } from './controllers/crosshair.controller';
import { SheetsCrosshairHighlightService } from './services/crosshair.service';
import { SheetCrosshairHighlightRenderController } from './views/widgets/crosshair-highlight.render-controller';
import type { IUniverSheetsCrosshairHighlightConfig } from './controllers/config.schema';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';

export class UniverSheetsCrosshairHighlightPlugin extends Plugin {
    constructor(
        private readonly _config: Partial<IUniverSheetsCrosshairHighlightConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsCrosshairHighlightService],
            [SheetsCrosshairHighlightController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        ([
            [SheetCrosshairHighlightRenderController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
        this._injector.get(SheetsCrosshairHighlightController);
        this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetCrosshairHighlightRenderController] as Dependency);
    }
}
