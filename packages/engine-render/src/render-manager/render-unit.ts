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

import type { Nullable, UnitModel } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import type { Injector } from '@wendellhu/redi';
import type { Engine } from '../engine';
import type { Scene } from '../scene';
import type { RenderComponentType } from './render-manager.service';

export interface IRender {
    unitId: string;
    engine: Engine;
    scene: Scene;
    mainComponent: Nullable<RenderComponentType>;
    components: Map<string, RenderComponentType>;
    isMainScene: boolean;
}

// eslint-disable-next-line ts/no-explicit-any
export interface IRenderControllerCtor { new (unit: UnitModel, ...args: []): any }

/**
 * This class is responsible
 */
export class RenderUnit<M extends UnitModel> extends Disposable implements IRender {
    // These declared fields would be assigned right after it is instantiated in `RenderManagerService.createRender`.
    declare engine: Engine;
    declare scene: Scene;
    declare mainComponent: Nullable<RenderComponentType>;
    declare components: Map<string, RenderComponentType>;
    declare isMainScene: boolean;

    readonly unitId: string;

    private readonly _renderControllers: Disposable[] = [];
    private readonly _injector: Injector;

    constructor(
        private readonly _unit: M,
        parentInjector: Injector,
        renderControllerCtors: IRenderControllerCtor[]
    ) {
        super();

        this._injector = parentInjector.createChild();
        this.unitId = _unit.getUnitId();
        this._initControllers(renderControllerCtors);
    }

    override dispose() {
        this._renderControllers.forEach((controller) => controller.dispose());
        this._renderControllers.length = 0;
    }

    addRenderController(ctor: IRenderControllerCtor) {
        this._initControllers([ctor]);
    }

    private _initControllers(ctors: IRenderControllerCtor[]): void {
        ctors
            .map((ctor) => this._injector.createInstance(ctor, this._unit))
            .forEach((controller) => this._renderControllers.push(controller));
    }
}
