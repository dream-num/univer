import { Nullable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { BaseObject } from './base-object';
import { DocComponent } from './components/docs/doc-component';
import { SheetComponent } from './components/sheets/sheet-component';
import { Slide } from './components/slides/slide';
import { Engine } from './engine';
import { Scene } from './scene';
import { SceneViewer } from './scene-viewer';

export interface IRenderManagerService {
    currentRender$: Observable<Nullable<string>>;
    dispose(): void;
    // createRenderWithNewEngine(unitId: string): IRenderManagerService;
    createRenderWithParent(unitId: string, parentUnitId: string): IRender;
    createRender(unitId: string): IRender;
    addItem(unitId: string, item: IRender): void;
    removeItem(unitId: string): void;
    setCurrent(unitId: string): void;
    getCurrent(): Nullable<IRender>;
    getRenderById(unitId: string): Nullable<IRender>;
    getRenderAll(): Map<string, IRender>;
    defaultEngine: Engine;
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
    private _defaultEngine = new Engine();

    private _currentUnitId: string = '';

    private _renderMap: Map<string, IRender> = new Map();

    private readonly _currentRender$ = new BehaviorSubject<Nullable<string>>(this._currentUnitId);

    readonly currentRender$ = this._currentRender$.asObservable();

    get defaultEngine() {
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

    setCurrent(unitId: string) {
        this._currentUnitId = unitId;

        this._currentRender$.next(unitId);
    }

    getCurrent(): Nullable<IRender> {
        return this.getRenderById(this._currentUnitId);
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
