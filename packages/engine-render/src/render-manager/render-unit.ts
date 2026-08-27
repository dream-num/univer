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
    private readonly _dependencyService: RenderUnitDependencyService;

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
        this._dependencyService = new RenderUnitDependencyService(
            this._injector,
            () => this._renderContext
        );

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
        return this._dependencyService.resolve(dependency);
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
        this._dependencyService.register(dependencies).forEach((record) => {
            this._dependencyService.resolveRecord(record);
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

interface IRenderDependencyRecord {
    key: unknown;
    identifier: DependencyIdentifier<unknown>;
    create: () => IRenderModule;
}

class RenderUnitDependencyService {
    private readonly _records = new Map<unknown, IRenderDependencyRecord>();
    private readonly _resolved = new Map<unknown, unknown>();
    private readonly _resolving = new Set<unknown>();

    constructor(
        private readonly _injector: Injector,
        private readonly _getRenderContext: () => IRenderContext<UnitModel>
    ) { }

    register(dependencies: Dependency[]): IRenderDependencyRecord[] {
        const records: IRenderDependencyRecord[] = [];
        const seen = new Set<unknown>();

        dependencies.forEach((dependency) => {
            const parsed = this._parseDependency(dependency);
            const key = getRenderDependencyIdentifierKey(parsed.identifier);
            const existing = this._records.get(key);
            const record = existing ?? this._addRecord(key, parsed.identifier, parsed.create);
            if (seen.has(record.key)) {
                return;
            }

            seen.add(record.key);
            records.push(record);
        });

        return records;
    }

    resolve<T>(dependency: DependencyIdentifier<T>): T {
        const key = getRenderDependencyIdentifierKey(dependency);
        if (this._resolved.has(key)) {
            return this._resolved.get(key) as T;
        }

        if (this._resolving.has(key)) {
            return undefined as T;
        }

        const record = this._records.get(key);
        if (record) {
            return this.resolveRecord(record) as T;
        }

        return this._injector.get(dependency, LookUp.SELF);
    }

    resolveRecord(record: IRenderDependencyRecord): unknown {
        if (this._resolved.has(record.key)) {
            return this._resolved.get(record.key);
        }

        if (this._resolving.has(record.key)) {
            return undefined;
        }

        this._resolving.add(record.key);
        try {
            return this._injector.get(record.identifier, LookUp.SELF);
        } finally {
            this._resolving.delete(record.key);
        }
    }

    private _addRecord(
        key: unknown,
        identifier: DependencyIdentifier<unknown>,
        create: () => IRenderModule
    ): IRenderDependencyRecord {
        const record: IRenderDependencyRecord = { key, identifier, create };
        this._records.set(key, record);
        this._injector.add([identifier, {
            useFactory: () => this._create(record),
        }]);

        return record;
    }

    private _create(record: IRenderDependencyRecord): IRenderModule {
        if (this._resolved.has(record.key)) {
            return this._resolved.get(record.key) as IRenderModule;
        }

        const alreadyResolving = this._resolving.has(record.key);
        if (!alreadyResolving) {
            this._resolving.add(record.key);
        }

        try {
            const instance = record.create();
            this._resolved.set(record.key, instance);
            return instance;
        } finally {
            if (!alreadyResolving) {
                this._resolving.delete(record.key);
            }
        }
    }

    private _parseDependency(dependency: Dependency): Pick<IRenderDependencyRecord, 'identifier' | 'create'> {
        const [identifier, implOrNull] = Array.isArray(dependency) ? dependency : [dependency, null];

        if (!implOrNull) {
            return {
                identifier,
                create: () => this._injector.createInstance(identifier, this._getRenderContext()),
            };
        }

        if (isClassDependencyItem(implOrNull)) {
            return {
                identifier,
                create: () => this._injector.createInstance(implOrNull.useClass, this._getRenderContext()),
            };
        }

        throw new Error('[RenderUnit]: render dependency could only be an class!');
    }
}

function getRenderDependencyIdentifierKey(identifier: unknown): unknown {
    const decoratorName = (identifier as { decoratorName?: unknown } | undefined)?.decoratorName;
    if (typeof decoratorName === 'string' && decoratorName) {
        return `identifier:${decoratorName}`;
    }

    return identifier;
}
