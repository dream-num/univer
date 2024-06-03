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

import { Plugin } from '@univerjs/core';
import { createIdentifier, Inject, Injector } from '@wendellhu/redi';

import { Engine } from './engine';
import { IRenderManagerService, RenderManagerService } from './render-manager/render-manager.service';

/**
 * The global rendering engine.
 */
export const IRenderingEngine = createIdentifier<Engine>('univer.render-engine');

const PLUGIN_NAME = 'RENDER_ENGINE_PLUGIN';

export class UniverRenderEnginePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        _config: undefined,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();

        this._injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);

        this._injector.add([
            IRenderManagerService,
            {
                useClass: RenderManagerService,
            },
        ]);
    }
}
