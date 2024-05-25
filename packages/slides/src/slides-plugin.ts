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

import { IUniverInstanceService, LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Engine } from '@univerjs/engine-render';
import { IRenderingEngine } from '@univerjs/engine-render';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CanvasView } from './views/render';

export interface IUniverSlidesConfig {}

const DEFAULT_SLIDE_PLUGIN_DATA = {};

const PLUGIN_NAME = 'slides';

export class UniverSlidesPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SLIDE;

    private _config: IUniverSlidesConfig;

    private _canvasEngine: Engine | null = null;

    private _canvasView: CanvasView | null = null;

    constructor(
        config: Partial<IUniverSlidesConfig> = {},
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();

        this._config = Object.assign(DEFAULT_SLIDE_PLUGIN_DATA, config);
        this._initializeDependencies(this._injector);
    }

    initialize(): void {
        this.initCanvasEngine();
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

    getCanvasView() {
        return this._canvasView;
    }

    private _initializeDependencies(slideInjector: Injector) {
        const dependencies: Dependency[] = [[CanvasView]];

        dependencies.forEach((d) => {
            slideInjector.add(d);
        });
    }
}
