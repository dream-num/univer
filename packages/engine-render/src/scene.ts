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

import type { IKeyValue, Nullable } from '@univerjs/core';
import type { BaseObject } from './base-object';
import type { IDragEvent, IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';
import type { ISceneTransformState, ITransformChangeState } from './basics/interfaces';
import type { ITransformerConfig } from './basics/transformer-config';
import type { Vector2 } from './basics/vector2';
import type { Canvas } from './canvas';
import type { UniverRenderingContext } from './context';
import type { Engine } from './engine';
import type { SceneViewer } from './scene-viewer';
import type { Viewport } from './viewport';
import { Disposable, EventSubject, sortRules, sortRulesByDesc, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from './basics/const';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './basics/interfaces';
import { precisionTo, requestNewFrame } from './basics/tools';
import { Transform } from './basics/transform';
import { Layer } from './layer';
import { InputManager } from './scene.input-manager';
import { Transformer } from './scene.transformer';

export const MAIN_VIEW_PORT_KEY = 'viewMain';

export interface ISceneInputControlOptions {
    enableDown: boolean;
    enableUp: boolean;
    enableMove: boolean;
    enableWheel: boolean;
    enableEnter: boolean;
    enableLeave: boolean;
}

export class Scene extends Disposable {
    private _sceneKey: string = '';
    /**
     * Width of scene content, does not affected by zoom.
     */
    private _width: number = 100;
    /**
     * Height of scene content, does not affected by zoom.
     */
    private _height: number = 100;
    private _scaleX: number = 1;
    private _scaleY: number = 1;
    private _transform = new Transform();
    private _evented = true;

    private _layers: Layer[] = [];
    private _viewports: Viewport[] = [];

    private _cursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;
    private _defaultCursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    private _addObject$ = new BehaviorSubject<Scene>(this);
    readonly addObject$ = this._addObject$.asObservable();

    onTransformChange$ = new EventSubject<ITransformChangeState>();
    onFileLoaded$ = new EventSubject<string>();
    onPointerDown$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerMove$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerUp$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerEnter$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerOut$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerCancel$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerLeave$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onDragEnter$ = new EventSubject<IDragEvent>();
    onDragOver$ = new EventSubject<IDragEvent>();
    onDragLeave$ = new EventSubject<IDragEvent>();
    onDrop$ = new EventSubject<IDragEvent>();
    onClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onSingleClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onDblclick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onTripleClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onMouseWheel$ = new EventSubject<IWheelEvent>();

    /**
     * @deprecated  use `fromGlobalEvent('keydown')` from rx.js instead.
     */
    onKeyDown$ = new EventSubject<IKeyboardEvent>();

    /**
     * @deprecated  use `fromGlobalEvent('keyup')` from rx.js instead.
     */
    onKeyUp$ = new EventSubject<IKeyboardEvent>();

    private _beforeRender$ = new BehaviorSubject<Nullable<Canvas>>(null);
    readonly beforeRender$ = this._beforeRender$.asObservable();
    private _afterRender$ = new BehaviorSubject<Nullable<Canvas>>(null);
    readonly afterRender$ = this._afterRender$.asObservable();

    /**
     * Transformer constructor.  Transformer is a special type of group that allow you transform
     * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
     * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
     */
    private _transformer: Nullable<Transformer>;

    /** @hidden */
    private _inputManager: Nullable<InputManager>;

    constructor(
        sceneKey: string,
        private _parent: Engine | SceneViewer,
        state?: ISceneTransformState
    ) {
        super();
        this._sceneKey = sceneKey;
        if (state) {
            this.transformByState(state);
        }

        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            const parent = this._parent as Engine;
            parent.addScene(this);
            if (!parent.hasActiveScene()) {
                parent.setActiveScene(sceneKey);
            }
            this._inputManager = new InputManager(this);
        } else if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            const parent = this._parent as SceneViewer;
            parent.addSubScene(this);
        }

        this.disposeWithMe(
            toDisposable(
                this._parent?.onTransformChange$.subscribeEvent((_change: ITransformChangeState) => {
                    this._transformHandler();
                })
            )
        );
    }

    get classType() {
        return RENDER_CLASS_TYPE.SCENE;
    }

    get transform() {
        return this._transform;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get scaleX() {
        return this._scaleX;
    }

    get scaleY() {
        return this._scaleY;
    }

    get sceneKey() {
        return this._sceneKey;
    }

    get objectsEvented() {
        return this._evented;
    }

    set transform(trans: Transform) {
        this._transform = trans;
    }

    set width(num: number) {
        this._width = num;
    }

    set height(num: number) {
        this._height = num;
    }

    set scaleX(scaleX: number) {
        this._scaleX = scaleX;
    }

    set scaleY(scaleY: number) {
        this._scaleY = scaleY;
    }

    /**
     * ancestorScaleX means this.scaleX * ancestorScaleX
     */
    get ancestorScaleX() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleX;
        }
        return this.scaleX * pScale;
    }

    /**
     * ancestorScaleY means this.scaleY * ancestorScaleY
     */
    get ancestorScaleY() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleY;
        }
        return this.scaleY * pScale;
    }

    getAncestorScale() {
        // const { scaleX = 1, scaleY = 1 } = this;
        // this.classType is always 'Scene', this if is always false
        // if (this.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
        //     scaleX = this.ancestorScaleX || 1;
        //     scaleY = this.ancestorScaleY || 1;
        // }

        return {
            scaleX: this.ancestorScaleX || 1,
            scaleY: this.ancestorScaleY || 1,
        };
    }

    get ancestorLeft() {
        const p = this.getParent();
        let pOffsetX = 0;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pOffsetX = (p as SceneViewer).ancestorLeft;
        }
        return pOffsetX;
    }

    get ancestorTop() {
        const p = this.getParent();
        let pOffsetY = 0;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pOffsetY = (p as SceneViewer).ancestorTop;
        }
        return pOffsetY;
    }

    set cursor(val: CURSOR_TYPE) {
        this.setCursor(val);
    }

    attachControl(options?: ISceneInputControlOptions) {
        // const hasDown: boolean = true; const hasUp: boolean = true; const hasMove: boolean = true; const hasWheel: boolean = true;
        if (!(this._parent.classType === RENDER_CLASS_TYPE.ENGINE)) {
            // 只绑定直接与 engine 挂载的 scene 来统一管理事件
            return;
        }

        this._inputManager?.attachControl(options);
        return this;
    }

    detachControl() {
        this._inputManager?.detachControl();
        return this;
    }

    makeDirty(state: boolean = true) {
        this._layers.forEach((layer) => {
            layer.makeDirty(state);
        });
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.makeDirty(state);
        }
        return this;
    }

    makeDirtyNoParent(state: boolean = true) {
        this._layers.forEach((layer) => {
            layer.makeDirty(state);
        });
        return this;
    }

    enableLayerCache(...layerIndexes: number[]) {
        layerIndexes.forEach((zIndex) => {
            this.getLayer(zIndex).enableCache();
        });
    }

    disableLayerCache(...layerIndexes: number[]) {
        layerIndexes.forEach((zIndex) => {
            this.getLayer(zIndex).disableCache();
        });
    }

    isDirty(): boolean {
        for (let i = 0; i < this._layers.length; i++) {
            const layer = this._layers[i];
            if (layer.isDirty() === true) {
                return true;
            }
        }
        return false;
    }

    getCursor() {
        return this._cursor;
    }

    resetCursor() {
        this.setCursor(this._defaultCursor);
    }

    setCursor(val: CURSOR_TYPE) {
        this._cursor = val;
        const engine = this.getEngine();
        if (!engine) {
            return;
        }
        engine.setCanvasCursor(val);
    }

    setDefaultCursor(val: CURSOR_TYPE) {
        this._defaultCursor = val;
        this.resetCursor();
    }

    /**
     * @deprecated use transformByState instead.
     * @param width
     * @param height
     */
    resize(width?: number, height?: number) {
        const preWidth = this.width;
        if (width !== undefined) {
            this.width = width;
        }

        const preHeight = this.height;
        if (height !== undefined) {
            this.height = height;
        }

        this._transformHandler();
        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
            value: {
                width: this.width,
                height: this.height,
            },
            preValue: { width: preWidth, height: preHeight },
        });

        return this;
    }

    /**
     * Unlike @scale, this method doesn't emit event.
     * @param scaleX
     * @param scaleY
     */
    setScaleValueOnly(scaleX: number, scaleY: number) {
        if (scaleX !== undefined) {
            this.scaleX = scaleX;
        }

        if (scaleY !== undefined) {
            this.scaleY = scaleY;
        }
    }

    /**
     * Set scale, and then emit event to update Viewport scroll state.
     * @param scaleX
     * @param scaleY
     * @returns Scene
     */
    scale(scaleX?: number, scaleY?: number) {
        const preScaleX = this.scaleX;
        const preScaleY = this.scaleY;
        this.setScaleValueOnly(scaleX || 1, scaleY || 1);

        this._transformHandler();
        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
            value: {
                scaleX: this.scaleX,
                scaleY: this.scaleY,
            },
            preValue: { scaleX: preScaleX, scaleY: preScaleY },
        });
        return this;
    }

    /**
     * Apply scaleXY base on current scaleX and scaleY
     */
    scaleBy(deltaScaleX?: number, deltaScaleY?: number) {
        const preScaleX = this.scaleX;
        if (deltaScaleX !== undefined) {
            this.scaleX += deltaScaleX; // @TODO lumixraku why not this.scaleX *= deltaScaleX  ???
        }
        const preScaleY = this.scaleY;
        if (deltaScaleY !== undefined) {
            this.scaleY += deltaScaleY;
        }

        this.scaleX = precisionTo(this.scaleX, 1);
        this.scaleY = precisionTo(this.scaleY, 1);

        this._transformHandler();
        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
            value: {
                scaleX: this.scaleX,
                scaleY: this.scaleY,
            },
            preValue: { scaleX: preScaleX, scaleY: preScaleY },
        });
        return this;
    }

    /**
     * Reset canvas size and update scroll
     * @param state
     */
    transformByState(state: ISceneTransformState) {
        const transformStateKeys = Object.keys(state);
        const preKeys: ISceneTransformState = {};
        if (transformStateKeys.length === 0) {
            return;
        }

        transformStateKeys.forEach((pKey) => {
            if (state[pKey as keyof ISceneTransformState] !== undefined) {
                (preKeys as IKeyValue)[pKey] = this[pKey as keyof Scene];
                (this as IKeyValue)[pKey] = state[pKey as keyof ISceneTransformState];
            }
        });

        this._transformHandler();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.all,
            value: state,
            preValue: preKeys,
        });
    }

    getParent(): Engine | SceneViewer {
        return this._parent;
    }

    getEngine(): Nullable<Engine> {
        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            return this._parent as Engine;
        }

        let parent: any = this._parent; // type:  SceneViewer | Engine | BaseObject | Scene
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.ENGINE) {
                return parent;
            }
            parent = parent?.getParent();
        }
        return null;
    }

    getLayers(): Layer[] {
        return this._layers;
    }

    getLayer(zIndex: number = 1): Layer {
        for (const layer of this._layers) {
            if (layer.zIndex === zIndex) {
                return layer;
            }
        }

        const defaultLayer = new Layer(this, [], zIndex);
        this.addLayer(defaultLayer);
        return defaultLayer;
    }

    findLayerByZIndex(zIndex: number = 1): Nullable<Layer> {
        for (const layer of this.getLayers()) {
            if (layer.zIndex === zIndex) {
                return layer;
            }
        }
    }

    getLayerMaxZIndex(): number {
        let maxIndex = Number.MIN_VALUE;
        for (let i = 0; i < this._layers.length; i++) {
            const layer = this._layers[i];
            if (layer.zIndex >= maxIndex) {
                maxIndex = layer.zIndex;
            }
        }
        return maxIndex;
    }

    addLayer(...argument: Layer[]): void {
        this._layers.push(...argument);
    }

    /**
     * Add objects to Layer( Layer is specfied by zIndex)
     * If object is a group, insert all its children and group itself to _objects[].
     * @param objects
     * @param zIndex
     * @returns {Scene} this
     */
    addObjects(objects: BaseObject[], zIndex: number = 1): Scene {
        this.getLayer(zIndex)?.addObjects(objects);
        this._addObject$.next(this);
        return this;
    }

    /**
     * Add object to Layer (Layer is specified by zIndex).
     * If object is a group, insert all its children and group itself to _objects[].
     * @param o
     * @param zIndex layer index
     * @returns {Scene} scene
     */
    addObject(o: BaseObject, zIndex: number = 1): Scene {
        this.getLayer(zIndex)?.addObject(o);
        this._addObject$.next(this);
        return this;
    }

    /**
     * Set Scene as object parent, if object has no parent.
     * @param o
     * @returns {void}
     */
    setObjectBehavior(o: BaseObject): void {
        if (!o.parent) {
            o.parent = this;
        }
        // this.onTransformChangeObservable.add((state: ITransformChangeState) => {
        //     o.scaleCacheCanvas();
        // });
        o.onIsAddedToParent$.emitEvent(this);
    }

    // Why? return values is so strange! removeObject should return true/false, or didn't return anything.
    removeObject(object?: BaseObject | string): Nullable<Scene> {
        if (object == null) {
            return;
        }
        const layers = this.getLayers();
        for (const layer of layers) {
            layer.removeObject(object);
        }
        return this;
    }

    removeObjects(objects?: BaseObject[] | string[]): Nullable<Scene> {
        if (objects == null) {
            return;
        }
        const layers = this.getLayers();
        for (const layer of layers) {
            layer.removeObjects(objects);
        }
        return this;
    }

    // addBackObjects(...argument: BaseObject[]) {
    //     argument.forEach((o: BaseObject) => {
    //         this.addObjectBack(o);
    //     });
    //     return this;
    // }

    // addForwardObjects(...argument: BaseObject[]) {
    //     argument.forEach((o: BaseObject) => {
    //         this.addObjectForward(o);
    //     });
    //     return this;
    // }

    getObjectsByLayer(zIndex: number): BaseObject[] {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (const layer of this._layers) {
            if (layer.zIndex === zIndex) {
                objects.push(...layer.getObjects());
            }
        }
        return objects;
    }

    /**
     * Get all objects of each Layer.
     * @returns {BaseObject[]} objects
     */
    getAllObjects(): BaseObject[] {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjects());
        }
        return objects;
    }

    /**
     * Get objects which is visible and not in a group in each layer.
     * @returns BaseObject[]
     */
    getAllObjectsByOrder(): BaseObject[] {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrder());
        }
        return objects;
    }

    /**
     * get objects which is visible and not in a group.
     * @param isDesc
     * @returns BaseObject[]
     */
    getAllObjectsByDescOrder(isDesc: boolean = false): BaseObject[] {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrder().sort(useSortRules));
        }
        return objects;
    }

    /**
     * Get visible and evented objects.
     * @param isDesc
     * @returns {BaseObject[]} objects
     */
    getAllObjectsByOrderForPick(isDesc: boolean = false): BaseObject[] {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrderForPick().sort(useSortRules));
        }
        return objects;
    }

    /**
     * Get object in all layers by okey.
     * @param oKey
     * @returns
     */
    getObject(oKey: string): Nullable<BaseObject> {
        for (const layer of this._layers) {
            const objects = layer.getObjectsByOrder();
            for (const object of objects) {
                if (object.oKey === oKey) {
                    return object;
                }
            }
        }
    }

    getObjectIncludeInGroup(oKey: string): Nullable<BaseObject> {
        for (const layer of this._layers) {
            const objects = layer.getObjects();
            for (const object of objects) {
                if (object.oKey === oKey) {
                    return object;
                }
            }
        }
    }

    fuzzyMathObjects(oKey: string, matchStart = false) {
        const results: BaseObject[] = [];
        for (const layer of this._layers) {
            const objects = layer.getObjectsByOrder();
            for (const object of objects) {
                if (matchStart ? object.oKey.startsWith(oKey) : object.oKey.indexOf(oKey) > -1) {
                    results.push(object);
                }
            }
        }

        return results;
    }

    addViewport(...viewport: Viewport[]) {
        this._viewports.push(...viewport);
        return this;
    }

    removeViewport(key: string) {
        for (let i = 0, len = this._viewports.length; i < len; i++) {
            const viewport = this._viewports[i];
            if (viewport.viewportKey === key) {
                this._viewports.splice(i, 1);
                return viewport;
            }
        }
    }

    getViewports() {
        return this._viewports;
    }

    getMainViewport(): Viewport {
        return this.getViewport(MAIN_VIEW_PORT_KEY)!;
    }

    getViewport(key: string): Viewport | undefined {
        for (const viewport of this._viewports) {
            if (viewport.viewportKey === key) {
                return viewport;
            }
        }
    }

    render(parentCtx?: UniverRenderingContext) {
        if (!this.isDirty()) {
            return;
        }

        !parentCtx && this.getEngine()?.clearCanvas();

        const layers = this._layers.sort(sortRules);
        const canvasInstance = this.getEngine()?.getCanvas();
        this._beforeRender$.next(canvasInstance);
        for (let i = 0, len = layers.length; i < len; i++) {
            layers[i].render(parentCtx, i === len - 1);
        }
        this._afterRender$.next(canvasInstance);
    }

    async requestRender(parentCtx?: UniverRenderingContext) {
        return new Promise((resolve, _reject) => {
            this.render(parentCtx);
            requestNewFrame(resolve);
        });
    }

    /**
     * create transformer if not exist, and then transformer attach to object that passed in by parameter.
     * @param o
     */
    attachTransformerTo(o: BaseObject) {
        if (!this._transformer) {
            this.initTransformer();
        }
        this._transformer?.attachTo(o);
    }

    detachTransformerFrom(o: BaseObject) {
        this._transformer?.detachFrom(o);
    }

    initTransformer(config?: ITransformerConfig) {
        if (this._transformer) {
            this._transformer.resetProps(config);
            return;
        }
        this._transformer = new Transformer(this, config);
    }

    getTransformerByCreate() {
        if (!this._transformer) {
            this.initTransformer();
        }
        return this._transformer!;
    }

    getTransformer() {
        return this._transformer;
    }

    updateTransformerZero(left: number, top: number) {
        this._transformer?.updateZeroPoint(left, top);
    }

    /**
     * Get viewport by cursor position.
     * Position is relative to canvas(event offsetXY).
     * @param coord
     * @returns
     */
    findViewportByPosToScene(coord: Vector2) {
        return this._viewports.find((vp) => vp.isHit(coord));
    }

    getActiveViewportByCoord(coord: Vector2) {
        coord = this.getCoordRelativeToViewport(coord);
        return this.findViewportByPosToScene(coord);
    }

    /**
     * @deprecated use `getScrollXYInfoByViewport` instead.
     * @param pos
     * @param viewPort
     */
    getVpScrollXYInfoByPosToVp(pos: Vector2, viewPort?: Viewport) {
        return this.getScrollXYInfoByViewport(pos, viewPort);
    }

    /**
     * getViewportScrollXYInfo by viewport under cursor position
     * prev getScrollXYByRelativeCoords
     * @param pos
     * @param viewPort
     */
    getScrollXYInfoByViewport(pos: Vector2, viewPort?: Viewport) {
        if (!viewPort) {
            viewPort = this.findViewportByPosToScene(pos) || this.getDefaultViewport();
        }
        return this.getViewportScrollXY(viewPort);
    }

    getDefaultViewport() {
        return this.getViewport('viewMain')!;
    }

    getViewportScrollXY(viewPort: Viewport) {
        let x = 0;
        let y = 0;
        if (viewPort) {
            const actualX = viewPort.viewportScrollX || 0;
            const actualY = viewPort.viewportScrollY || 0;
            x += actualX;
            y += actualY;
        }
        return {
            x,
            y,
        };
    }

    /**
     * @deprecated use `getCoordRelativeToViewport` instead
     * @param coord
     * @returns
     */
    getRelativeToViewportCoord(coord: Vector2) {
        return this.getCoordRelativeToViewport(coord);
    }

    /**
     * Get coord to active viewport.
     * In a nested scene scenario, it is necessary to obtain the relative offsets layer by layer.
     *
     * origin name: getRelativeToViewportCoord
     * @param coord Coordinates to be converted.
     * @returns
     */
    getCoordRelativeToViewport(coord: Vector2): Vector2 {
        let parent: any = this.getParent();

        const parentList: any[] = [];

        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE || parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                parentList.push(parent);
            }
            parent = parent?.getParent && parent?.getParent();
        }

        parentList.reverse();

        for (const parent of parentList) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                const scene = parent as Scene;
                const viewPort = scene.getActiveViewportByCoord(coord);
                if (viewPort) {
                    const actualX = viewPort.viewportScrollX || 0;
                    const actualY = viewPort.viewportScrollY || 0;
                    coord = coord.addByPoint(actualX, actualY);
                }
            } else if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                const sv = parent as SceneViewer;
                const transform = sv.transform.clone().invert();
                coord = transform.applyPoint(coord);
            }
        }

        return coord;
    }

    // transformToSceneCoord(coord: Vector2) {
    //     const pickedViewport = this.getActiveViewportByCoord(coord);
    //     return pickedViewport?.getRelativeVector(coord);
    // }

    clearLayer() {
        this._layers = [];
    }

    clearViewports() {
        this._viewports = [];
    }

    getPrecisionScale() {
        const pixelRatio = this.getEngine()?.getPixelRatio() || 1;
        const { scaleX, scaleY } = this.getAncestorScale();

        return {
            scaleX: scaleX * pixelRatio,
            scaleY: scaleY * pixelRatio,
        };
    }

    override dispose() {
        let layers = [...this.getLayers()];
        layers.forEach((layer) => {
            layer.dispose();
        });
        layers = [];

        let viewports = [...this.getViewports()];
        viewports.forEach((viewport) => {
            viewport.dispose();
        });
        viewports = [];

        this.clearLayer();
        this.clearViewports();
        this.detachControl();
        this.onTransformChange$?.complete();
        this._inputManager?.dispose();
        this._inputManager = null;
        this._transformer?.dispose();
        this._transformer = null;

        this.onFileLoaded$.complete();
        this.onClick$.complete();
        this.onPointerDown$.complete();
        this.onPointerMove$.complete();
        this.onPointerUp$.complete();
        this.onPointerEnter$.complete();
        this.onPointerLeave$.complete();
        this.onPointerOut$.complete();
        this.onPointerCancel$.complete();

        this.onDragEnter$.complete();
        this.onDragOver$.complete();
        this.onDragLeave$.complete();
        this.onDrop$.complete();

        this.onSingleClick$.complete();
        this.onDblclick$.complete();
        this.onTripleClick$.complete();
        this.onMouseWheel$.complete();
        this.onKeyDown$.complete();
        this.onKeyUp$.complete();
        this._addObject$.complete();

        super.dispose();
    }

    /**
     * Get the object under the pointer, if scene.event is disabled, return null.
     * @param {Vector2} coord
     * @return {Nullable<BaseObject | Scene>} object under the pointer
     */
    pick(coord: Vector2): Nullable<BaseObject | Scene> {
        let pickedViewport = this.getActiveViewportByCoord(coord);

        if (!pickedViewport) {
            pickedViewport = this._viewports[0];
        }

        if (!this.objectsEvented || !pickedViewport) {
            return null;
        }

        const scrollBarRect = pickedViewport.pickScrollBar(coord);
        if (scrollBarRect) {
            return scrollBarRect;
        }

        const vecFromSheetContent = pickedViewport.transformVector2SceneCoord(coord);

        let isPickedObject: Nullable<BaseObject | Scene> = null;

        const objectOrder = this.getAllObjectsByOrderForPick().reverse();
        const objectLength = objectOrder.length;

        for (let i = 0; i < objectLength; i++) {
            const o = objectOrder[i];
            if (!o.visible || !o.evented || o.classType === RENDER_CLASS_TYPE.GROUP) {
                continue;
            }
            const svCoord = vecFromSheetContent;
            // if (o.isInGroup && o.parent?.classType === RENDER_CLASS_TYPE.GROUP) {
            //     const { cumLeft, cumTop } = this._getGroupCumLeftRight(o);
            //     svCoord = svCoord.clone().add(Vector2.FromArray([-cumLeft, -cumTop]));
            // }

            if (o.isHit(svCoord)) {
                if (o.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                    const pickedObject = (o as SceneViewer).pick(svCoord);
                    if (pickedObject) {
                        isPickedObject = pickedObject;
                    } else {
                        isPickedObject = (o as SceneViewer).getActiveSubScene();
                    }
                } else {
                    isPickedObject = o;
                }
                break;
            } else if (
                o.classType === RENDER_CLASS_TYPE.SCENE_VIEWER &&
                (o as SceneViewer).allowSelectedClipElement()
            ) {
                const pickedObject = (o as SceneViewer).pick(svCoord);
                if (pickedObject) {
                    isPickedObject = pickedObject;
                    break;
                }
            }
        }

        if (!isPickedObject && this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            return this;
        }

        return isPickedObject;
    }

    // triggerKeyDown(evt: IKeyboardEvent) {
    //     this.onKeyDown$.emitEvent(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyDown(evt);
        // }
    // }

    // triggerKeyUp(evt: IKeyboardEvent) {
    //     this.onKeyUp$.emitEvent(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyUp(evt);
        // }
    // }

    triggerPointerUp(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerUp$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerUp(evt);
            return false;
        }
        return true;
    }

    triggerMouseWheel(evt: IWheelEvent) {
        if (
            !this.onMouseWheel$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerMouseWheel(evt);
            return false;
        }
        return true;
    }

    triggerSingleClick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onSingleClick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerSingleClick(evt);
            return false;
        }
        return true;
    }

    triggerClick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onClick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerClick(evt);
            return false;
        }
        return true;
    }

    triggerDblclick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onDblclick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDblclick(evt);
            return false;
        }
        return true;
    }

    triggerTripleClick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onTripleClick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerTripleClick(evt);
            return false;
        }
        return true;
    }

    triggerPointerMove(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerMove$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerMove(evt);
            return false;
        }
        return true;
    }

    triggerPointerDown(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerDown$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerDown(evt);
            return false;
        }

        return true;
    }

    triggerPointerOut(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOutObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOut(evt);
            return false;
        }
        return true;
    }

    triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerLeave$.emitEvent(evt);
        if (
            !this.onPointerLeave$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerLeave(evt);
            return false;
        }
        return true;
    }

    triggerPointerOver(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOverObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOver(evt);
            return false;
        }
        return true;
    }

    triggerPointerCancel(evt: IPointerEvent) {
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerCancel(evt);
            return false;
        }
        return true;
    }

    triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerEnter$.emitEvent(evt);
        if (
            !this.onPointerEnter$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerEnter(evt);
            return false;
        }
        return true;
    }

    triggerDragLeave(evt: IDragEvent) {
        if (
            !this.onDragLeave$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragLeave(evt);
            return false;
        }
        return true;
    }

    triggerDragOver(evt: IDragEvent) {
        if (
            !this.onDragOver$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragOver(evt);
            return false;
        }
        return true;
    }

    triggerDragEnter(evt: IDragEvent) {
        if (
            !this.onDragEnter$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragEnter(evt);
            return false;
        }
        return true;
    }

    triggerDrop(evt: IDragEvent) {
        if (
            !this.onDrop$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDrop(evt);
            return false;
        }
        return true;
    }

    /**
     * Triggered when scale, resize of scene.
     * origin name: _setTransForm
     *
     */
    private _transformHandler() {
        // why not use this.ancestorScaleXY ?
        // if parent scale changed, this.ancestorScaleXY will remain same.
        const composeResult = Transform.create().composeMatrix({
            scaleX: this.scaleX,
            scaleY: this.scaleY,
        });

        this.transform = composeResult;
        this.getViewports().forEach((vp: Viewport) => {
            vp.resetCanvasSizeAndUpdateScroll();
        });
        this.makeDirty(true);
    }

    /**
     * If scene.event is disabled, scene.pick(cursor Pos) return null.
     * Then only scene itself can response to pointer event, all objects under the scene would not.
     * see sceneInputManager@_onPointerMove
     */
    // 禁用对象事件
    disableObjectsEvent() {
        // 将_evented属性设置为false
        this._evented = false;
    }

    enableObjectsEvent() {
        this._evented = true;
    }

    _capturedObject: BaseObject | null = null;

    get capturedObject() {
        return this._capturedObject;
    }

    setCaptureObject(o: BaseObject) {
        this._capturedObject = o;
    }

    releaseCapturedObject() {
        this._capturedObject = null;
    }
}
