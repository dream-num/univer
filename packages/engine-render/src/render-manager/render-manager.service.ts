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
} from '@univerjs/core';
import type { Observable } from 'rxjs';
import {
    createIdentifier,
    Disposable,
    Inject,
    Injector,
    IUniverInstanceService,
    remove,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { merge, Subject } from 'rxjs';
import type { BaseObject } from '../base-object';
import type { DocComponent } from '../components/docs/doc-component';
import type { SheetComponent } from '../components/sheets/sheet-component';
import type { IRender } from './render-unit';
import { Engine } from '../engine';
import { Scene } from '../scene';
import { RenderUnit } from './render-unit';

export type RenderComponentType = SheetComponent | DocComponent | BaseObject;

export interface IRenderManagerService extends IDisposable {
    addRender(unitId: string, renderer: IRender): void;

    /**
     * create renderUnit & init deps from renderDependencies by renderUnit's type.
     * @param unitId
     * @returns renderUnit:IRender
     */
    createRender(unitId: string, createUnitOptions?: ICreateUnitOptions, renderId?: string): IRender;
    removeRender(renderId: string): void;
    /**
     * Gets a renderer by its render ID. The primary renderer uses the unit ID.
     */
    getRenderUnitById(renderId: string): Nullable<IRender>;
    getFocusedRenderByUnitId?(unitId: string): Nullable<IRender>;
    focusRender?(renderId: string): void;
    getAllRenderersOfType(type: UniverInstanceType): RenderUnit[];
    getRenderAll(): Map<string, IRender>;
    defaultEngine: Engine;

    created$: Observable<IRender>;
    disposed$: Observable<string>;
    focusedRenderChanged$?: Observable<string>;

    has(unitId: string): boolean;

    /**
     * add dep to _renderDependencies(type, dep)
     * @param type
     * @param dep
     */
    registerRenderModule<T extends UnitModel>(type: UniverInstanceType, dep: Dependency<T>): IDisposable;
    registerRenderModule(type: UniverInstanceType, dep: Dependency): IDisposable;
}

const DEFAULT_SCENE_SIZE = { width: 1500, height: 1000 };

const SCENE_NAMESPACE = '_UNIVER_SCENE_';

export class RenderManagerService extends Disposable implements IRenderManagerService {
    private _defaultEngine!: Engine;

    private _renderMap: Map<string, IRender> = new Map();
    private readonly _focusListeners = new Map<string, IDisposable>();
    private readonly _focusedByUnit = new Map<string, string>();
    private readonly _focusedRenderChanged$ = new Subject<string>();
    readonly focusedRenderChanged$ = this._focusedRenderChanged$.asObservable();

    private readonly _renderCreated$ = new Subject<IRender>();
    readonly created$ = this._renderCreated$.asObservable();

    private readonly _renderDisposed$ = new Subject<string>();
    readonly disposed$ = this._renderDisposed$.asObservable();

    get defaultEngine(): Engine {
        if (!this._defaultEngine) {
            this._defaultEngine = new Engine();
        }
        return this._defaultEngine;
    }

    private readonly _renderDependencies = new Map<UniverInstanceType, Dependency[]>();

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._initThemeListener();
    }

    override dispose(): void {
        super.dispose();

        this._renderMap.forEach((item, id) => this._disposeItem(item, true, id));
        this._renderDependencies.clear();
        this._renderMap.clear();
        this._renderCreated$.complete();
        this._renderDisposed$.complete();
        this._focusedByUnit.clear();
        this._focusedRenderChanged$.complete();
    }

    registerRenderModules(type: UniverInstanceType, deps: Dependency[]): IDisposable {
        if (!this._renderDependencies.has(type)) {
            this._renderDependencies.set(type, []);
        }

        const dependencies = this._renderDependencies.get(type)!;
        const registeredDeps = deps.filter((dep) => !hasRenderDependency(dependencies, dep));
        dependencies.push(...registeredDeps);

        for (const [_, render] of this._renderMap) {
            const renderType = render.type;
            if (renderType === type) {
                this._tryAddRenderDependencies(render, registeredDeps);
            }
        }

        return toDisposable(() => {
            registeredDeps.forEach((dep) => remove(dependencies, dep));
        });
    }

    /**
     * add dep to _renderDependencies(type, dep)
     * @param type
     * @param depCtor
     */
    registerRenderModule<T extends UnitModel>(type: UniverInstanceType, depCtor: Dependency<T>): IDisposable;
    registerRenderModule(type: UniverInstanceType, depCtor: Dependency): IDisposable;
    registerRenderModule(type: UniverInstanceType, depCtor: Dependency): IDisposable {
        if (!this._renderDependencies.has(type)) {
            this._renderDependencies.set(type, []);
        }

        const dependencies = this._renderDependencies.get(type)!;
        if (hasRenderDependency(dependencies, depCtor)) {
            return toDisposable(() => {});
        }

        dependencies.push(depCtor);

        for (const [_, render] of this._renderMap) {
            const renderType = render.type;
            if (renderType === type) {
                this._tryAddRenderDependencies(render, [depCtor]);
            }
        }

        return toDisposable(() => remove(dependencies, depCtor));
    }

    /**
     * get render dependencies from _renderDependencies
     * @param type
     * @returns Dependency[]
     */
    private _getRenderDepsByType(type: UniverInstanceType): Array<Dependency> {
        return Array.from(this._renderDependencies.get(type) ?? []);
    }

    private _initThemeListener(): void {
        this.disposeWithMe(merge(this._themeService.currentTheme$, this._themeService.darkMode$).subscribe(() => {
            this.getRenderAll().forEach((renderer) => {
                renderer.components.forEach((component) => {
                    component.makeForceDirty(true);
                    component.makeDirty(true);
                });
            });
        }));
    }

    /**
     * create renderUnit & init deps from renderDependencies
     * @param unitId
     * @returns renderUnit:IRender
     */
    createRender(unitId: string, createUnitOptions?: ICreateUnitOptions, renderId = unitId): IRender {
        if (renderId !== unitId && (
            !this.getRenderUnitById(unitId) || this._univerInstanceService.getUnit(renderId) || this._renderMap.has(renderId)
        )) {
            throw new Error('A secondary renderer requires an existing primary renderer and a unique render ID.');
        }
        const parentInjector = createUnitOptions?.renderParentInjector ?? this._injector;
        const engine = parentInjector.createInstance(Engine, renderId, undefined);
        const isMainScene = renderId === unitId && createUnitOptions?.embeddedRender !== true;
        const renderer = this._createRender(unitId, engine, isMainScene, createUnitOptions, parentInjector, renderId);
        if (renderer.type === UniverInstanceType.UNIVER_SHEET) {
            const canvas = engine.getCanvasElement();
            const focus = () => this.focusRender(renderId);
            canvas.addEventListener('pointerdown', focus, true);
            this._focusListeners.set(renderId, toDisposable(() => canvas.removeEventListener('pointerdown', focus, true)));
        }
        this._renderCreated$.next(renderer);
        return renderer;
    }

    getAllRenderersOfType(type: UniverInstanceType): RenderUnit[] {
        const renderUnits: RenderUnit[] = [];
        for (const [_, render] of this._renderMap) {
            const renderType = render.type;
            if (renderType === type) {
                renderUnits.push(render as RenderUnit);
            }
        }

        return renderUnits;
    }

    /**
     * init deps by injector.get(dep), and injector derives from renderer.
     * @param renderer
     * @param deps
     */
    private _tryAddRenderDependencies(renderer: IRender, deps: Dependency[]): void {
        if (renderer instanceof RenderUnit) {
            renderer.addRenderDependencies(deps);
        }
    }

    /**
     * create renderUnit & init deps from renderDependencies by renderUnit's type
     * @param unitId
     * @param engine
     * @param isMainScene
     * @returns renderUnit:IRender
     */
    protected _createRender(
        unitId: string,
        engine: Engine,
        isMainScene = true,
        createUnitOptions?: ICreateUnitOptions,
        parentInjector: Injector = this._injector,
        renderId = unitId
    ): IRender {
        const existItem = this.getRenderUnitById(renderId);
        let shouldDestroyEngine = true;

        if (existItem != null) {
            const existEngine = existItem.engine;
            if (existEngine === engine) {
                shouldDestroyEngine = false;
            }
        }

        this._disposeItem(existItem, shouldDestroyEngine, renderId);

        const { width, height } = DEFAULT_SCENE_SIZE;

        const scene = new Scene(SCENE_NAMESPACE + renderId, engine, {
            width,
            height,
        });

        const unit = this._univerInstanceService.getUnit(unitId);
        let renderUnit: IRender;

        if (unit) {
            const type = this._univerInstanceService.getUnitType(unitId);
            const ctorOfDeps = this._getRenderDepsByType(type);

            renderUnit = parentInjector.createInstance(RenderUnit, {
                unit,
                renderId,
                engine,
                scene,
                isMainScene,
                createUnitOptions,
            });
            this._addRenderUnit(renderId, renderUnit);

            try {
                // init deps
                this._tryAddRenderDependencies(renderUnit, ctorOfDeps);
            } catch (error) {
                try {
                    this._disposeItem(renderUnit, true, renderId);
                } finally {
                    this._renderMap.delete(renderId);
                }
                throw error;
            }
        } else {
            // For slide pages
            renderUnit = {
                isThumbNail: true,
                type: UniverInstanceType.UNIVER_SLIDE,
                unitId,
                renderId,
                engine,
                scene,
                mainComponent: null,
                components: new Map(),
                isMainScene,
                // @ts-ignore
                with(_dependency) {
                    return null;
                },
            } as IRender;
            this._addRenderUnit(renderId, renderUnit);
        }

        return renderUnit;
    }

    addRender(unitId: string, renderUnit: IRender): void {
        this._addRenderUnit(unitId, renderUnit);
    }

    private _addRenderUnit(unitId: string, renderUnit: IRender): void {
        this._renderMap.set(unitId, renderUnit);
    }

    removeRender(renderId: string): void {
        const item = this._renderMap.get(renderId);
        if (!item) {
            return;
        }
        if (item.unitId === renderId) {
            for (const [id, renderer] of this._renderMap) {
                if (id !== renderId && renderer.unitId === renderId) {
                    this.removeRender(id);
                }
            }
        }
        this._renderMap.delete(renderId);
        this._disposeItem(item, true, renderId);
    }

    has(unitId: string): boolean {
        return this._renderMap.has(unitId);
    }

    getRenderUnitById(unitId: string): Nullable<IRender> {
        return this._renderMap.get(unitId);
    }

    getFocusedRenderByUnitId(unitId: string): Nullable<IRender> {
        return this._renderMap.get(this._focusedByUnit.get(unitId) ?? unitId);
    }

    focusRender(renderId: string): void {
        const render = this._renderMap.get(renderId);
        if (render && (this._focusedByUnit.get(render.unitId) ?? render.unitId) !== renderId) {
            this._focusedByUnit.set(render.unitId, renderId);
            this._focusedRenderChanged$.next(render.unitId);
        }
    }

    getRenderAll(): Map<string, IRender> {
        return this._renderMap;
    }

    private _disposeItem(item: Nullable<IRender>, shouldDestroyEngine: boolean, renderId: string): void {
        if (item == null) {
            return;
        }

        const { engine, scene, components } = item;
        this._focusListeners.get(renderId)?.dispose();
        this._focusListeners.delete(renderId);
        if (this._focusedByUnit.get(item.unitId) === renderId) {
            this._focusedByUnit.delete(item.unitId);
            if (renderId !== item.unitId) {
                this._focusedRenderChanged$.next(item.unitId);
            }
        }

        // `mainComponent` is one of the `components` so it does not to be disposed again
        components?.forEach((component) => component.dispose());
        scene.dispose();

        if (isDisposable(item)) {
            item.dispose();
        }

        if (shouldDestroyEngine) {
            engine.dispose();
        }

        this._renderDisposed$.next(renderId);
    }
}

function hasRenderDependency(dependencies: Dependency[], dep: Dependency): boolean {
    const identifier = getRenderDependencyIdentifier(dep);
    const key = getRenderDependencyIdentifierKey(identifier);
    return dependencies.some((registered) => getRenderDependencyIdentifierKey(getRenderDependencyIdentifier(registered)) === key);
}

function getRenderDependencyIdentifier(dep: Dependency): DependencyIdentifier<unknown> {
    return (Array.isArray(dep) ? dep[0] : dep) as DependencyIdentifier<unknown>;
}

function getRenderDependencyIdentifierKey(identifier: DependencyIdentifier<unknown>): DependencyIdentifier<unknown> | string {
    const decoratorName = (identifier as unknown as { decoratorName?: unknown }).decoratorName;
    if (typeof decoratorName === 'string' && decoratorName) {
        return `identifier:${decoratorName}`;
    }

    return identifier;
}

export const IRenderManagerService = createIdentifier<IRenderManagerService>('engine-render.render-manager.service');

export function isDisposable(thing: unknown): thing is IDisposable {
    return !!thing && typeof (thing as Partial<IDisposable>).dispose === 'function';
}

export function getCurrentTypeOfRenderer(
    type: UniverInstanceType,
    instanceService: IUniverInstanceService,
    renderManageService: IRenderManagerService
): Nullable<IRender> {
    const currentUnit = instanceService.getCurrentUnitOfType(type);
    if (currentUnit == null) {
        return null;
    }

    return renderManageService.getRenderUnitById(currentUnit.getUnitId());
}

/** Resolves the renderer that last received input, or the primary renderer. */
export function getFocusedRenderForUnit(renderManager: IRenderManagerService, unitId: string): Nullable<IRender> {
    return renderManager.getFocusedRenderByUnitId?.(unitId) ?? renderManager.getRenderUnitById(unitId);
}

export function withCurrentTypeOfRenderer<T>(
    type: UniverInstanceType,
    id: DependencyIdentifier<T>,
    instanceService: IUniverInstanceService,
    renderManagerService: IRenderManagerService
): Nullable<T> {
    const renderer = getCurrentTypeOfRenderer(type, instanceService, renderManagerService);
    if (renderer) return renderer.with(id);
    return null;
}
