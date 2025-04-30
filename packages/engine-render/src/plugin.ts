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

import type { IUniverEngineRenderConfig } from './controllers/config.schema';

import { createIdentifier, IConfigService, Inject, Injector, merge, Plugin, registerDependencies } from '@univerjs/core';
import { defaultPluginConfig, ENGINE_RENDER_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { Engine } from './engine';
import { IRenderManagerService, RenderManagerService } from './render-manager/render-manager.service';
import { CanvasColorService, ICanvasColorService } from './services/canvas-color.service';
import { UniverRenderConfigService } from './services/render-config.service';

/**
 * The global rendering engine.
 *
 * @deprecated There will be no more default global render engine in the future.
 */
export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

const PLUGIN_NAME = 'UNIVER_RENDER_ENGINE_PLUGIN';

export class UniverRenderEnginePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverEngineRenderConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(ENGINE_RENDER_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [UniverRenderConfigService],
            [ICanvasColorService, { useClass: CanvasColorService }],
            [IRenderingEngine, { useClass: Engine }],
            [IRenderManagerService, { useClass: RenderManagerService }],
        ]);
    }
}
