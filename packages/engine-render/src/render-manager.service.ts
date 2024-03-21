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

import type { Nullable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import type { BaseObject } from './base-object';
import type { DocComponent } from './components/docs/doc-component';
import type { SheetComponent } from './components/sheets/sheet-component';
import type { Slide } from './components/slides/slide';
import { Engine } from './engine';
import { Scene } from './scene';
import { SceneViewer } from './scene-viewer';

export interface IRenderManagerService {
    currentRender$: Observable<Nullable<string>>;
    createRender$: Observable<Nullable<string>>;
    dispose(): void;
    // createRenderWithNewEngine(unitId: string): IRenderManagerService;
    createRenderWithParent(unitId: string, parentUnitId: string): IRender;
    createRender(unitId: string): IRender;
    addItem(unitId: string, item: IRender): void;
    removeItem(unitId: string): void;
    setCurrent(unitId: string): void;
    getRenderById(unitId: string): Nullable<IRender>;
    getRenderAll(): Map<string, IRender>;
    defaultEngine: Engine;
    create(unitId: Nullable<string>): void;
    getCurrent(): Nullable<IRender>;
    getFirst(): Nullable<IRender>;
    has(unitId: string): boolean;
}

export type RenderComponentType = SheetComponent | DocComponent | Slide | BaseObject;

export interface IRender {
    unitId: string;
    engine: Engine;
    scene: Scene;
    mainComponent: Nullable<RenderComponentType>;
    components: Map<string, RenderComponentType>;
    isMainScene: boolean;
}

const DEFAULT_SCENE_SIZE = { width: 1500, height: 1000 };

const SCENE_NAMESPACE = '_UNIVER_SCENE_';

export class RenderManagerService implements IRenderManagerService {
    private _defaultEngine!: Engine;

    private _currentUnitId: string = '';

    private _renderMap: Map<string, IRender> = new Map();

    private readonly _currentRender$ = new BehaviorSubject<Nullable<string>>(this._currentUnitId);
    readonly currentRender$ = this._currentRender$.asObservable();

    private readonly _createRender$ = new BehaviorSubject<Nullable<string>>(this._currentUnitId);
    readonly createRender$ = this._createRender$.asObservable();

    get defaultEngine() {
        if (!this._defaultEngine) {
            this._defaultEngine = new Engine();
        }
        return this._defaultEngine;
    }

    dispose() {
        this._renderMap.forEach((item) => {
            this._disposeItem(item);
        });

        this._renderMap.clear();

        this._currentRender$.complete();
    }

    createRenderWithParent(unitId: string, parentUnitId: string): IRender {
        const parent = this.getRenderById(parentUnitId);
        if (parent == null) {
            throw new Error('parent render is null');
        }
        const { scene, engine } = parent;

        const current = this._createRender(unitId, engine, false);

        const currentScene = current.scene;

        const sv = new SceneViewer(unitId);

        sv.addSubScene(currentScene);

        scene.addObject(sv);

        return current;
    }

    createRenderWithEngine(unitId: string, engine: Engine): IRender {
        return this._createRender(unitId, engine, false);
    }

    create(unitId: Nullable<string>) {
        this._createRender$.next(unitId);
    }

    createRender(unitId: string): IRender {
        const engine = new Engine();

        return this._createRender(unitId, engine);
    }

    private _createRender(unitId: string, engine: Engine, isMainScene: boolean = true): IRender {
        const existItem = this.getRenderById(unitId);
        let shouldDestroyEngine = true;

        if (existItem != null) {
            const existEngine = existItem.engine;
            if (existEngine === engine) {
                shouldDestroyEngine = false;
            }
        }

        this._disposeItem(existItem, shouldDestroyEngine);

        const { width, height } = DEFAULT_SCENE_SIZE;

        const scene = new Scene(SCENE_NAMESPACE + unitId, engine, {
            width,
            height,
        });

        const item: IRender = {
            unitId,
            engine,
            scene,
            mainComponent: null,
            components: new Map(),
            isMainScene,
        };

        this.addItem(unitId, item);

        return item;
    }

    addItem(unitId: string, item: IRender) {
        this._renderMap.set(unitId, item);
    }

    removeItem(unitId: string) {
        const item = this._renderMap.get(unitId);
        if (item != null) {
            this._disposeItem(item);
        }
        this._renderMap.delete(unitId);
    }

    has(unitId: string) {
        return this._renderMap.has(unitId);
    }

    setCurrent(unitId: string) {
        this._currentUnitId = unitId;

        this._currentRender$.next(unitId);
    }

    getCurrent() {
        return this._renderMap.get(this._currentUnitId);
    }

    getFirst() {
        return [...this.getRenderAll().values()][0];
    }

    getRenderById(unitId: string): Nullable<IRender> {
        return this._renderMap.get(unitId);
    }

    getRenderAll() {
        return this._renderMap;
    }

    private _disposeItem(item: Nullable<IRender>, shouldDestroyEngine: boolean = true) {
        if (item == null) {
            return;
        }
        const { engine, scene, components, mainComponent } = item;
        components?.forEach((component) => {
            component.dispose();
        });
        mainComponent?.dispose();
        scene.dispose();

        if (shouldDestroyEngine) {
            engine.dispose();
        }
    }
}

export const IRenderManagerService = createIdentifier<RenderManagerService>('univer.render-manager-service');
