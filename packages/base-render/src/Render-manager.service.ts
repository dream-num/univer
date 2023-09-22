import { Nullable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

import { BaseObject } from './BaseObject';
import { DocComponent } from './Component/Docs/DocComponent';
import { SheetComponent } from './Component/Sheets/SheetComponent';
import { Slide } from './Component/Slides/Slide';
import { Engine } from './Engine';
import { Scene } from './Scene';

export interface IRenderManagerService {
    dispose(): void;
    createRenderWithNewEngine(unitId: string): IRenderManagerService;
    createRenderWithDefaultEngine(unitId: string): IRenderManagerService;
    createRender(unitId: string, engine: Engine): IRenderManagerService;
    addItem(unitId: string, item: IRender): void;
    removeItem(unitId: string): void;
    setCurrent(unitId: string): void;
    getCurrent(): Nullable<IRender>;
    getRenderById(unitId: string): Nullable<IRender>;
    defaultEngine: Engine;
}

export type RenderComponentType = SheetComponent | DocComponent | Slide | BaseObject;

export interface IRender {
    unitId: string;
    engine: Engine;
    scene: Scene;
    mainComponent: Nullable<RenderComponentType>;
    components: Map<string, RenderComponentType>;
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

    createRenderWithNewEngine(unitId: string): RenderManagerService {
        const engine = new Engine();
        return this.createRender(unitId, engine);
    }

    createRenderWithDefaultEngine(unitId: string): RenderManagerService {
        return this.createRender(unitId, this._defaultEngine);
    }

    createRender(unitId: string, engine: Engine): RenderManagerService {
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
        };

        this.addItem(unitId, item);

        return this;
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
