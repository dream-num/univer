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
import type { Engine } from '@univerjs/engine-render';
import { IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderingEngine, IRenderManagerService } from '@univerjs/engine-render';
import { defaultPluginConfig, SLIDES_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
// import { DocSelectionManagerService } from '@univerjs/docs';
// import { CanvasView } from './views/render';

export interface IUniverSlidesConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

const PLUGIN_NAME = 'slides';

export class UniverSlidesPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    private _canvasEngine: Engine | null = null;

    // private _canvasView: CanvasView | null = null;

    constructor(
        private readonly _config: Partial<IUniverSlidesConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SLIDES_PLUGIN_CONFIG_KEY, rest);

        this._initializeDependencies(this._injector);
    }

    initialize(): void {
        this.initCanvasEngine();
    }

    override onReady(): void {

    }

    getConfig() {
        return this._config;
    }

    initCanvasEngine() {
        this._canvasEngine = this._injector.get(IRenderingEngine);
    }

    override onRendered(): void {
        this.initialize();
    }

    getCanvasEngine() {
        return this._canvasEngine;
    }

    private _initializeDependencies(slideInjector: Injector) {
        const dependencies: Dependency[] = [
            // [CanvasView],
            // [DocSelectionManagerService],
        ];

        dependencies.forEach((d) => {
            slideInjector.add(d);
        });
    }
}
