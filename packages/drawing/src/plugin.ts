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

import type { DependencyOverride } from '@univerjs/core';
import { mergeOverrideWithDependencies, Plugin } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { ImageIoService } from './services/image-io-impl.service';
import { DrawingManagerService } from './services/drawing-manager-impl.service';
import { IImageIoService } from './services/image-io.service';
import { IDrawingManagerService } from './services/drawing-manager.service';

const PLUGIN_NAME = 'DRAWING_PLUGIN';

export class UniverDrawingPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private _config: { override?: DependencyOverride },
        @Inject(Injector) protected _injector: Injector
    ) {
        super();
    }

    override onStarting(_injector: Injector): void {
        this._initDependencies(_injector);
    }

    private _initDependencies(injector: Injector): void {
        const dependencies: Dependency[] = [
            [IImageIoService, { useClass: ImageIoService }],
            [IDrawingManagerService, { useClass: DrawingManagerService }],
        ];

        const dependency = mergeOverrideWithDependencies(dependencies, this._config?.override);
        dependency.forEach((d) => injector.add(d));
    }
}
