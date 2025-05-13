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
import type { IUniverSheetsGraphicsConfig } from './controllers/config.schema';

import { IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetGraphicsRenderController } from './controllers/graphics-render.controller';

const PLUGIN_NAME = 'UNIVER_SHEET_DRAWING_PLUGIN';

export class UniverSheetsGraphicsPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsGraphicsConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onRendered(): void {
        ([
            [SheetGraphicsRenderController],
        ] as Dependency[]).forEach((dep) => {
            this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dep);
        });
    }
}
