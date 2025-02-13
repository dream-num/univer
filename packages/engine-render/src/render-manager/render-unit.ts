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

import type { Dependency, DependencyIdentifier, IDisposable, Nullable, UnitModel, UnitType, UniverInstanceType } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { Engine } from '../engine';
import type { Scene } from '../scene';
import type { RenderComponentType } from './render-manager.service';
import { Disposable, Inject, Injector, isClassDependencyItem } from '@univerjs/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

/**
 * Public interface of a {@link RenderUnit}.
 *
 * @property {string} unitId - The id of the RenderUnit.
 */
export interface IRender {
    unitId: string;
    type: UniverInstanceType;
    engine: Engine;
    scene: Scene;
    mainComponent: Nullable<RenderComponentType>;
    components: Map<string, RenderComponentType>;
    isMainScene: boolean;
    isThumbNail?: boolean;

    /**
     * Whether the render unit is activated. It should emit value when subscribed immediately.
     * When created, the render unit is activated by default.
     */
    activated$: Observable<boolean>;

    with<T>(dependency: DependencyIdentifier<T>): T;
    getRenderContext?(): IRenderContext;
    /**
     * Deactivate the render unit, means the render unit would be freezed and not updated,
     * even removed from the webpage. However, the render unit is still in the memory and
     * could be activated again.
     */
    deactivate(): void;
    /**
     * Activate the render unit, means the render unit would be updated and rendered.
     */
    activate(): void;
}

/**
 * Every render module should implement this interface.
 */
export interface IRenderModule extends IDisposable { }

/**
 * Necessary context for a render module.This interface would be the first argument of render modules' constructor
 * functions.
 */
export interface IRenderContext<T extends UnitModel = UnitModel> extends Omit<IRender, 'with'> {
    unit: T;
    type: UnitType;
}

/**
 * This class is necessary for Univer to render several units in the same webpage. It encapsulates the rendering
 * context and rendering modules for a specific unit.
 */
export class RenderUnit extends Disposable implements IRender {
    readonly isRenderUnit: boolean = true;

    private readonly _activated$ = new BehaviorSubject<boolean>(true);
    readonly activated$ = this._activated$.pipe(distinctUntilChanged());

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
    get components(): Map<string, RenderComponentType> { return this._renderContext.components; }

    constructor(
        init: Pick<IRenderContext, 'engine' | 'scene' | 'isMainScene' | 'unit'>,
        @Inject(Injector) parentInjector: Injector
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
            activated$: this.activated$,
            activate: () => this._activated$.next(true),
            deactivate: () => this._activated$.next(false),
        };
    }

    override dispose(): void {
        this._injector.dispose();

        super.dispose();

        this._activated$.next(false);
        this._activated$.complete();
    }

    /**
     * Get a dependency from the RenderUnit's injector.
     */
    with<T>(dependency: DependencyIdentifier<T>): T {
        return this._injector.get(dependency);
    }

    /**
     * Add render dependencies to the RenderUnit's injector. Note that the dependencies would be initialized immediately
     * after being added.
     */
    addRenderDependencies(dependencies: Dependency[]): void {
        this._initDependencies(dependencies);
    }

    private _initDependencies(dependencies: Dependency[]): void {
        const j = this._injector;

        dependencies.forEach((dep) => {
            const [identifier, implOrNull] = Array.isArray(dep) ? dep : [dep, null];

            if (!implOrNull) {
                j.add([identifier, {
                    useFactory: (): IRenderModule => j.createInstance(identifier, this._renderContext),
                }]);
            } else if (isClassDependencyItem(implOrNull)) {
                j.add([identifier, {
                    useFactory: (): IRenderModule => j.createInstance(implOrNull.useClass, this._renderContext),
                }]);
            } else {
                throw new Error('[RenderUnit]: render dependency could only be an class!');
            }
        });

        dependencies.forEach((dep) => {
            const [identifier] = Array.isArray(dep) ? dep : [dep, null];
            j.get(identifier);
        });
    }

    getRenderContext(): IRenderContext {
        return this._renderContext;
    }

    activate(): void {
        this._renderContext.activate();
    }

    deactivate(): void {
        this._renderContext.deactivate();
    }
}
