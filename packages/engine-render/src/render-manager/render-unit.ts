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

import type { Nullable, UnitModel, UnitType } from '@univerjs/core';
import { Disposable, ILogService, IUniverInstanceService } from '@univerjs/core';
import type { DependencyIdentifier, IDisposable } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
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

    with<T>(dependency: DependencyIdentifier<T>): T;
}

// eslint-disable-next-line ts/no-explicit-any
export interface IRenderModuleCtor<T extends UnitModel = UnitModel> { new(unit: IRenderContext<T>, ...args: any[]): IRenderModule }
export interface IRenderModule extends IDisposable {}

/**
 * This object encapsulates methods or properties to render each element.
 */
export interface IRenderContext<T extends UnitModel = UnitModel> extends Omit<IRender, 'with'> {
    unit: T;
    type: UnitType;
}

/**
 * This class is responsible
 */
export class RenderUnit extends Disposable implements IRender {
    readonly isRenderUnit: true;

    get unitId(): string { return this._renderContext.unitId; }
    get type(): UnitType { return this._renderContext.type; }

    private readonly _injector: Injector;

    private _renderContext: IRenderContext<UnitModel>;

    set isMainScene(is: boolean) { this._renderContext.isMainScene = is; }
    get isMainScene(): boolean { return this._renderContext.isMainScene; }
    set engine(engine: Engine) { this._renderContext.engine = engine; }
    get engine(): Engine { return this._renderContext.engine; }
    set mainComponent(component: Nullable<RenderComponentType>) { this._renderContext.mainComponent = component; }
    get mainComponent(): Nullable<RenderComponentType> { return this._renderContext.mainComponent; }
    set scene(scene: Scene) { this._renderContext.scene = scene; }
    get scene(): Scene { return this._renderContext.scene; }
    get components() { return this._renderContext.components; }

    constructor(
        init: Pick<IRenderContext, 'engine' | 'scene' | 'isMainScene' | 'unit' >,
        @Inject(Injector) parentInjector: Injector,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @ILogService private readonly _logSrv: ILogService
    ) {
        super();

        this._injector = parentInjector.createChild();
        this._renderContext = {
            unit: init.unit,
            unitId: init.unit.getUnitId(),
            type: init.unit.type,
            components: new Map(),
            mainComponent: null,
            isMainScene: init.isMainScene,
            engine: init.engine,
            scene: init.scene,
        };
    }

    override dispose() {
        this._injector.dispose();
        super.dispose();
    }

    /**
     * Get render controller hold by this render unit.
     */
    with<T>(dependency: DependencyIdentifier<T>): T {
        return this._injector.get(dependency);
    }

    addRenderControllers(ctors: IRenderModuleCtor[]) {
        this._initControllers(ctors);
    }

    private _initControllers(ctors: IRenderModuleCtor[]): void {
        const j = this._injector;

        ctors.forEach((ctor) => j.add([ctor, { useFactory: () => j.createInstance(ctor, this._renderContext) }]));
        ctors.forEach((ctor) => j.get(ctor));
    }
}
