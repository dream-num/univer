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

import type { IKeyValue, Nullable } from '@univerjs/core';
import { sortRules, sortRulesByDesc, toDisposable } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import type { BaseObject } from './base-object';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from './basics/const';
import type { IDragEvent, IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';
import type { IObjectFullState, ISceneTransformState, ITransformChangeState } from './basics/interfaces';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './basics/interfaces';
import { precisionTo, requestNewFrame } from './basics/tools';
import { Transform } from './basics/transform';
import type { ITransformerConfig } from './basics/transformer-config';
import type { Vector2 } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import { Layer } from './layer';
import type { SceneViewer } from './scene-viewer';
import { InputManager } from './scene.input-manager';
import { Transformer } from './scene.transformer';
import type { ThinEngine } from './thin-engine';
import { ThinScene } from './thin-scene';
import type { Viewport } from './viewport';

export class Scene extends ThinScene {
    private _layers: Layer[] = [];

    private _viewports: Viewport[] = [];

    private _cursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    private _defaultCursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    private _addObject$ = new BehaviorSubject<Scene>(this);

    readonly addObject$ = this._addObject$.asObservable();
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
        private _parent: ThinEngine<Scene> | SceneViewer,
        state?: ISceneTransformState
    ) {
        super(sceneKey);
        if (state) {
            this.transformByState(state);
        }

        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            const parent = this._parent as ThinEngine<Scene>;
            parent.addScene(this);
            if (!parent.hasActiveScene()) {
                parent.setActiveScene(sceneKey);
            }
            this._inputManager = new InputManager(this);
        } else if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            // 挂载到 sceneViewer 的 scene 需要响应前者的 transform
            const parent = this._parent as SceneViewer;
            parent.addSubScene(this);
        }

        this.disposeWithMe(
            toDisposable(
                this._parent?.onTransformChange$.subscribeEvent((_change: ITransformChangeState) => {
                    this._setTransForm();
                })
            )
        );
    }

    get ancestorScaleX() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleX;
        }
        return this.scaleX * pScale;
    }

    get ancestorScaleY() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleY;
        }
        return this.scaleY * pScale;
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

    attachControl(hasDown: boolean = true, hasUp: boolean = true, hasMove: boolean = true, hasWheel: boolean = true) {
        if (!(this._parent.classType === RENDER_CLASS_TYPE.ENGINE)) {
            // 只绑定直接与 engine 挂载的 scene 来统一管理事件
            return;
        }

        this._inputManager?.attachControl(hasDown, hasUp, hasMove, hasWheel);
        return this;
    }

    detachControl() {
        this._inputManager?.detachControl();
        return this;
    }

    override makeDirty(state: boolean = true) {
        this._layers.forEach((layer) => {
            layer.makeDirty(state);
        });
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.makeDirty(state);
        }
        return this;
    }

    override makeDirtyNoParent(state: boolean = true) {
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

    override resetCursor() {
        this.setCursor(this._defaultCursor);
    }

    override setCursor(val: CURSOR_TYPE) {
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

    resize(width?: number, height?: number) {
        const preWidth = this.width;
        if (width !== undefined) {
            this.width = width;
        }

        const preHeight = this.height;
        if (height !== undefined) {
            this.height = height;
        }

        this._setTransForm();
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

    setScaleValue(scaleX: number, scaleY: number) {
        if (scaleX !== undefined) {
            this.scaleX = scaleX;
        }

        if (scaleY !== undefined) {
            this.scaleY = scaleY;
        }
    }

    /**
     * scale to value, absolute
     * setTransform ---> viewport._updateScrollBarPosByViewportScroll --->  scrollTo
     */
    scale(scaleX?: number, scaleY?: number) {
        const preScaleX = this.scaleX;
        if (scaleX !== undefined) {
            this.scaleX = scaleX;
        }

        const preScaleY = this.scaleY;
        if (scaleY !== undefined) {
            this.scaleY = scaleY;
        }

        this._setTransForm();
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
     * current scale plus offset, relative
     */
    scaleBy(scaleX?: number, scaleY?: number) {
        const preScaleX = this.scaleX;
        if (scaleX !== undefined) {
            this.scaleX += scaleX;
        }
        const preScaleY = this.scaleY;
        if (scaleY !== undefined) {
            this.scaleY += scaleY;
        }

        this.scaleX = precisionTo(this.scaleX, 1);
        this.scaleY = precisionTo(this.scaleY, 1);

        this._setTransForm();
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
     * This sequence will initiate a series of updates:
     * scene._setTransForm --> viewport@resetCanvasSizeAndUpdateScrollBar ---> scrollTo ---> limitedScroll ---> onScrollBeforeObserver ---> setScrollInfo
     * scrollInfo needs accurate scene width & height, limitedScroll depends on scene & engine's width & height
     * @param state
     */
    transformByState(state: ISceneTransformState) {
        const optionKeys = Object.keys(state);
        const preKeys: IObjectFullState = {};
        if (optionKeys.length === 0) {
            return;
        }

        optionKeys.forEach((pKey) => {
            if (state[pKey as keyof ISceneTransformState] !== undefined) {
                (preKeys as IKeyValue)[pKey] = this[pKey as keyof Scene];
                (this as IKeyValue)[pKey] = state[pKey as keyof ISceneTransformState];
            }
        });

        this._setTransForm();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.all,
            value: state,
            preValue: preKeys,
        });
    }

    override getParent(): ThinEngine<Scene> | SceneViewer {
        return this._parent;
    }

    override getEngine(): Nullable<ThinEngine<Scene>> {
        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            return this._parent as ThinEngine<Scene>;
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

    getLayers() {
        return this._layers;
    }

    getLayer(zIndex: number = 1) {
        const find = this.findLayerByZIndex(zIndex);
        if (find) return find;
        return this._createDefaultLayer(zIndex);
    }

    findLayerByZIndex(zIndex: number = 1) {
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

    addLayer(...argument: Layer[]) {
        this._layers.push(...argument);
    }

    /**
     * add objects to Layer
     * @param objects BaseObject[]
     * @param zIndex  Layer zIndex
     * @returns Scene
     */
    override addObjects(objects: BaseObject[], zIndex: number = 1) {
        this.getLayer(zIndex)?.addObjects(objects);
        this._addObject$.next(this);
        return this;
    }

    override addObject(o: BaseObject, zIndex: number = 1) {
        this.getLayer(zIndex)?.addObject(o);
        this._addObject$.next(this);
        return this;
    }

    /**
     * make object parent to scene
     * @param o
     */
    override setObjectBehavior(o: BaseObject) {
        if (!o.parent) {
            o.parent = this;
        }
        // this.onTransformChangeObservable.add((state: ITransformChangeState) => {
        //     o.scaleCacheCanvas();
        // });
        o.onIsAddedToParent$.emitEvent(this);
    }

    removeObject(object?: BaseObject | string) {
        if (object == null) {
            return;
        }
        const layers = this.getLayers();
        for (const layer of layers) {
            layer.removeObject(object);
        }
        return this;
    }

    removeObjects(objects?: BaseObject[] | string[]) {
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

    getObjectsByLayer(zIndex: number) {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (const layer of this._layers) {
            if (layer.zIndex === zIndex) {
                objects.push(...layer.getObjects());
            }
        }
        return objects;
    }

    getAllObjects() {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrder());
        }
        return objects;
    }

    getAllObjectsByOrder(isDesc: boolean = false) {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrder().sort(useSortRules));
        }
        return objects;
    }

    getAllObjectsByOrderForPick(isDesc: boolean = false) {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (const layer of this._layers) {
            objects.push(...layer.getObjectsByOrderForPick().sort(useSortRules));
        }
        return objects;
    }

    override getObject(oKey: string) {
        for (const layer of this._layers) {
            const objects = layer.getObjectsByOrder();
            for (const object of objects) {
                if (object.oKey === oKey) {
                    return object;
                }
            }
        }
    }

    getObjectIncludeInGroup(oKey: string) {
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

    override addViewport(...viewport: Viewport[]) {
        this._viewports.push(...viewport);
        return this;
    }

    override removeViewport(key: string) {
        for (let i = 0, len = this._viewports.length; i < len; i++) {
            const viewport = this._viewports[i];
            if (viewport.viewportKey === key) {
                this._viewports.splice(i, 1);
                return viewport;
            }
        }
    }

    override getViewports() {
        return this._viewports;
    }

    getViewport(key: string): Viewport | undefined {
        for (const viewport of this._viewports) {
            if (viewport.viewportKey === key) {
                return viewport;
            }
        }
    }

    override render(parentCtx?: UniverRenderingContext) {
        if (!this.isDirty()) {
            return;
        }

        !parentCtx && this.getEngine()?.clearCanvas();

        const layers = this._layers.sort(sortRules);
        for (let i = 0, len = layers.length; i < len; i++) {
            layers[i].render(parentCtx, i === len - 1);
        }
    }

    async requestRender(parentCtx?: UniverRenderingContext) {
        return new Promise((resolve, _reject) => {
            this.render(parentCtx);
            requestNewFrame(resolve);
        });
    }

    override attachTransformerTo(o: BaseObject) {
        if (!this._transformer) {
            this.initTransformer();
        }
        this._transformer?.attachTo(o);
    }

    override detachTransformerFrom(o: BaseObject) {
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

    /**
     * prev getActiveViewportByRelativeCoord
     * @param coord
     * @returns
     */
    findViewportByPosToViewport(coord: Vector2) {
        return this._viewports.find((vp) => vp.isHit(coord));
    }

    getActiveViewportByCoord(coord: Vector2) {
        // let parent: any = this.getParent();
        // while (parent) {
        //     if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
        //         const sv = parent as SceneViewer;
        //         const transform = sv.transform.clone().invert();
        //         coord = transform.applyPoint(coord);
        //     }
        //     parent = parent?.getParent && parent?.getParent();
        // }
        coord = this.getRelativeToViewportCoord(coord);
        return this.findViewportByPosToViewport(coord);
    }

    /**
     * getViewportScrollXYInfo by viewport under cursor position
     * prev getScrollXYByRelativeCoords
     * @param pos
     * @param viewPort
     */
    getVpScrollXYInfoByPosToVp(pos: Vector2, viewPort?: Viewport) {
        if (!viewPort) {
            viewPort = this.findViewportByPosToViewport(pos);
        }
        if (!viewPort) {
            return {
                x: 0,
                y: 0,
            };
        }
        return this.getViewportScrollXY(viewPort);
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
     * In a nested scene scenario, it is necessary to obtain the relative offsets layer by layer.
     * @param coord Coordinates to be converted.
     * @returns
     */
    getRelativeToViewportCoord(coord: Vector2) {
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

    override getAncestorScale() {
        let { scaleX = 1, scaleY = 1 } = this;

        if (this.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            scaleX = this.ancestorScaleX || 1;
            scaleY = this.ancestorScaleY || 1;
        }

        return {
            scaleX,
            scaleY,
        };
    }

    override getPrecisionScale() {
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
        this.onPointerDown$.complete();
        this.onPointerMove$.complete();
        this.onPointerUp$.complete();
        this.onPointerEnter$.complete();
        this.onPointerLeave$.complete();
        this.onDblclick$.complete();
        this.onTripleClick$.complete();
        this.onMouseWheel$.complete();
        this.onKeyDown$.complete();
        this.onKeyUp$.complete();
        this._addObject$.complete();
        super.dispose();
    }

    // Determine the only object selected
    override pick(vec: Vector2): Nullable<BaseObject | Scene | ThinScene> {
        let pickedViewport = this.getActiveViewportByCoord(vec);

        if (!pickedViewport) {
            pickedViewport = this._viewports[0];
        }

        if (!this.evented || !pickedViewport) {
            return;
        }

        const scrollBarRect = pickedViewport.pickScrollBar(vec);
        if (scrollBarRect) {
            return scrollBarRect;
        }

        const vecFromSheetContent = pickedViewport.transformVector2SceneCoord(vec);

        let isPickedObject: Nullable<BaseObject | Scene | ThinScene> = null;

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

    override triggerKeyDown(evt: IKeyboardEvent) {
        this.onKeyDown$.emitEvent(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyDown(evt);
        // }
    }

    override triggerKeyUp(evt: IKeyboardEvent) {
        this.onKeyUp$.emitEvent(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyUp(evt);
        // }
    }

    override triggerPointerUp(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerUp$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerUp(evt);
            return false;
        }
        return true;
    }

    override triggerMouseWheel(evt: IWheelEvent) {
        if (
            !this.onMouseWheel$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerMouseWheel(evt);
            return false;
        }
        return true;
    }

    override triggerPointerMove(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerMove$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerMove(evt);
            return false;
        }
        return true;
    }

    override triggerDblclick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onDblclick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDblclick(evt);
            return false;
        }
        return true;
    }

    override triggerTripleClick(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onTripleClick$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerTripleClick(evt);
            return false;
        }
        return true;
    }

    override triggerPointerDown(evt: IPointerEvent | IMouseEvent) {
        if (
            !this.onPointerDown$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerPointerDown(evt);
            return false;
        }

        return true;
    }

    override triggerPointerOut(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOutObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOut(evt);
            return false;
        }
        return true;
    }

    override triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {
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

    override triggerPointerOver(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOverObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOver(evt);
            return false;
        }
        return true;
    }

    override triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {
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

    override triggerDragLeave(evt: IDragEvent) {
        if (
            !this.onDragLeave$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragLeave(evt);
            return false;
        }
        return true;
    }

    override triggerDragOver(evt: IDragEvent) {
        if (
            !this.onDragOver$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragOver(evt);
            return false;
        }
        return true;
    }

    override triggerDragEnter(evt: IDragEvent) {
        if (
            !this.onDragEnter$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDragEnter(evt);
            return false;
        }
        return true;
    }

    override triggerDrop(evt: IDragEvent) {
        if (
            !this.onDrop$.emitEvent(evt)?.stopPropagation &&
            this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER
        ) {
            (this._parent as SceneViewer)?.triggerDrop(evt);
            return false;
        }
        return true;
    }

    private _createDefaultLayer(zIndex: number = 1) {
        const defaultLayer = new Layer(this, [], zIndex);
        this.addLayer(defaultLayer);
        return defaultLayer;
    }

    private _setTransForm() {
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

    private _getGroupCumLeftRight(object: BaseObject) {
        let parent: any = object.parent;
        let cumLeft = 0;
        let cumTop = 0;
        while (parent.classType === RENDER_CLASS_TYPE.GROUP) {
            const { left, top } = parent;
            cumLeft += left;
            cumTop += top;

            parent = parent.parent;
        }
        return { cumLeft, cumTop };
    }
}
