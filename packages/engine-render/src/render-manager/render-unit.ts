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

import type {
    Dependency,
    DependencyIdentifier,
    ICreateUnitOptions,
    IDisposable,
    Nullable,
    UnitModel,
    UniverInstanceType,
} from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { Engine } from '../engine';
import type { Scene } from '../scene';
import type { RenderComponentType } from './render-manager.service';
import { Disposable, Inject, Injector, isClassDependencyItem, LookUp } from '@univerjs/core';
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
    getInjector?(): Injector;
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

    isDisposed(): boolean;
}

/**
 * Every render module should implement this interface.
 */
export interface IRenderModule extends IDisposable { }

/**
 * Necessary context for a render module.This interface would be the first argument of render modules' constructor
 * functions.
 */
export interface IRenderContext<T extends UnitModel = UnitModel> extends Omit<IRender, 'with' | 'isDisposed'> {
    unit: T;
    type: UniverInstanceType;
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
    get type(): UniverInstanceType { return this._renderContext.type; }

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
        init: Pick<IRenderContext, 'engine' | 'scene' | 'isMainScene' | 'unit'> & { createUnitOptions?: ICreateUnitOptions },
        @Inject(Injector) parentInjector: Injector
    ) {
        super();

        const renderParentInjector = init.createUnitOptions?.renderParentInjector ?? parentInjector;
        this._injector = renderParentInjector.createChild();

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

        if (init.createUnitOptions?.makeCurrent === false) {
            this.deactivate();
        }
    }

    override dispose(): void {
        if (this._disposed) {
            return;
        }
        this._activated$.next(false);
        this._activated$.complete();

        super.dispose();
        this._injector.dispose();

        //@ts-ignore
        this._renderContext.unit = null;
        this._renderContext.components.clear();
    }

    isDisposed(): boolean {
        return this._disposed;
    }

    /**
     * Get a dependency from the RenderUnit's injector.
     */
    with<T>(dependency: DependencyIdentifier<T>): T {
        return this._injector.get(dependency, LookUp.SELF);
    }

    getInjector(): Injector {
        return this._injector;
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
        const uniqueDependencies = dedupeRenderDependencies(dependencies);

        uniqueDependencies.forEach((dep) => {
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

        uniqueDependencies.forEach((dep) => {
            const [identifier] = Array.isArray(dep) ? dep : [dep, null];
            j.get(identifier, LookUp.SELF);
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

function dedupeRenderDependencies(dependencies: Dependency[]): Dependency[] {
    const seen = new Set<unknown>();
    return dependencies.filter((dependency) => {
        const identifier = Array.isArray(dependency) ? dependency[0] : dependency;
        const key = getRenderDependencyIdentifierKey(identifier);
        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function getRenderDependencyIdentifierKey(identifier: unknown): unknown {
    const decoratorName = (identifier as { decoratorName?: unknown } | undefined)?.decoratorName;
    if (typeof decoratorName === 'string' && decoratorName) {
        return `identifier:${decoratorName}`;
    }

    return identifier;
}
