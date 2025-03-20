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

import type { IKeyValue, ITransformState, Nullable } from '@univerjs/core';
import type { IDragEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';

import type { IObjectFullState, ITransformChangeState } from './basics/interfaces';
import type { ITransformerConfig } from './basics/transformer-config';
import type { IViewportInfo, Vector2 } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import type { Engine } from './engine';
import type { Layer } from './layer';
import type { Scene } from './scene';
import { Disposable, EventSubject } from '@univerjs/core';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from './basics/const';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './basics/interfaces';
import { generateRandomKey, toPx } from './basics/tools';
import { Transform } from './basics/transform';

export const BASE_OBJECT_ARRAY = [
    'top',
    'left',
    'width',
    'height',
    'angle',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'flipX',
    'flipY',
    'strokeWidth',
];

export enum ObjectType {
    UNKNOWN,
    RICH_TEXT,
    SHAPE,
    IMAGE,
    RECT,
    CIRCLE,
    CHART,
}

export abstract class BaseObject extends Disposable {
    groupKey?: string;
    isInGroup: boolean = false;

    objectType: ObjectType = ObjectType.UNKNOWN;

    onTransformChange$ = new EventSubject<ITransformChangeState>();

    onPointerDown$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerMove$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerUp$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerOut$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerOver$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerLeave$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onPointerEnter$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onSingleClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onDblclick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onTripleClick$ = new EventSubject<IPointerEvent | IMouseEvent>();
    onMouseWheel$ = new EventSubject<IWheelEvent>();

    onDragLeave$ = new EventSubject<IDragEvent | IMouseEvent>();
    onDragOver$ = new EventSubject<IDragEvent | IMouseEvent>();
    onDragEnter$ = new EventSubject<IDragEvent | IMouseEvent>();
    onDrop$ = new EventSubject<IDragEvent | IMouseEvent>();

    onIsAddedToParent$ = new EventSubject<any>();
    onDispose$ = new EventSubject<BaseObject>();

    protected _oKey: string;

    protected _dirty: boolean = true;
    protected _forceDirty: boolean = true;

    private _printable: boolean = false;

    private _top: number = 0;
    private _topOrigin: number | string = 0;

    private _left: number = 0;
    private _leftOrigin: number | string = 0;

    private _width: number = 0;
    private _widthOrigin: number | string = 0;

    private _height: number = 0;
    private _heightOrigin: number | string = 0;

    private _angle: number = 0;

    private _scaleX: number = 1;
    private _scaleY: number = 1;

    private _skewX: number = 0;
    private _skewY: number = 0;

    private _flipX: boolean = false;
    private _flipY: boolean = false;

    private _strokeWidth: number = 0;

    private _parent: any; // TODO: @DR-Univer. The object must be mounted to a scene or group. 'Any' is used here to avoid circular dependencies. This will be resolved later through dependency injection.

    private _zIndex: number = 0;

    private _evented: boolean = true;

    private _visible: boolean = true;

    private _debounceParentDirty: boolean = true;

    private _transform = new Transform();

    private _cursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    private _transformerConfig: ITransformerConfig;

    private _forceRender = false;

    private _layer: Nullable<Layer>; // TODO: @DR-Univer. Belong to layer

    constructor(key?: string) {
        super();

        if (key) {
            this._oKey = key;
        } else {
            this._oKey = generateRandomKey();
        }
    }

    get transform() {
        const transform = this._transform.clone();
        return this.transformForAngle(transform);
    }

    transformForAngle(transform: Transform) {
        /**
         * If the object is center rotated, the coordinate needs to be rotated back to the original position.
         */
        if (this._angle !== 0) {
            const cx = (this.width + this.strokeWidth) / 2;
            const cy = (this.height + this.strokeWidth) / 2;
            transform.rotate(-this._angle);
            transform.translate(cx, cy);
            transform.rotate(this.angle);
            transform.translate(-cx, -cy);
        }

        return transform;
    }

    get printable() {
        return this._printable;
    }

    get topOrigin() {
        return this._topOrigin;
    }

    get leftOrigin() {
        return this._leftOrigin;
    }

    get widthOrigin() {
        return this._widthOrigin;
    }

    get heightOrigin() {
        return this._heightOrigin;
    }

    get classType() {
        return RENDER_CLASS_TYPE.BASE_OBJECT;
    }

    get top(): number {
        return this._top;
    }

    get left(): number {
        return this._left;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get strokeWidth() {
        return this._strokeWidth;
    }

    get angle() {
        return this._angle;
    }

    get scaleX() {
        return this._scaleX;
    }

    get scaleY() {
        return this._scaleY;
    }

    get ancestorScaleX() {
        const pScale: number = this.getParent()?.ancestorScaleX || 1;
        return this.scaleX * pScale;
    }

    get ancestorScaleY() {
        const pScale: number = this.getParent()?.ancestorScaleY || 1;
        return this.scaleY * pScale;
    }

    get ancestorLeft() {
        return this.left + (this.getParent()?.ancestorLeft || 0);
    }

    get ancestorTop() {
        return this.top + (this.getParent()?.ancestorTop || 0);
    }

    get ancestorTransform() {
        const parent = this.getParent();
        if (this.isInGroup && parent?.classType === RENDER_CLASS_TYPE.GROUP) {
            return parent?.ancestorTransform.multiply(this.transform);
        }
        return this.transform;
    }

    get ancestorGroup() {
        let group: Nullable<BaseObject> = null;
        let parent = this.getParent();
        while (parent != null) {
            if (parent.classType === RENDER_CLASS_TYPE.GROUP) {
                group = parent;
            }
            parent = parent.getParent();
        }
        return group;
    }

    get skewX() {
        return this._skewX;
    }

    get skewY() {
        return this._skewY;
    }

    get flipX() {
        return this._flipX;
    }

    get flipY() {
        return this._flipY;
    }

    get parent() {
        return this._parent;
    }

    get oKey() {
        return this._oKey;
    }

    get zIndex() {
        return this._zIndex;
    }

    get evented() {
        return this._evented;
    }

    get visible() {
        return this._visible;
    }

    get debounceParentDirty() {
        return this._debounceParentDirty;
    }

    get cursor() {
        return this._cursor;
    }

    get layer(): Nullable<Layer> {
        return this._layer;
    }

    set transform(trans: Transform) {
        this._transform = trans;
    }

    set zIndex(index: number) {
        this._zIndex = index;
    }

    set parent(o: any) {
        this._parent = o;
    }

    set evented(state: boolean) {
        this._evented = state;
    }

    set debounceParentDirty(state: boolean) {
        this._debounceParentDirty = state;
    }

    set cursor(val: CURSOR_TYPE) {
        this.setCursor(val);
    }

    set layer(layer: Layer) {
        this._layer = layer;
    }

    protected set top(num: number | string) {
        this._topOrigin = num;
        this._top = toPx(num, this._parent?.height);
    }

    protected set left(num: number | string) {
        this._leftOrigin = num;
        this._left = toPx(num, this._parent?.width);
    }

    protected set width(num: number | string) {
        this._widthOrigin = num;
        this._width = toPx(num, this._parent?.width);
    }

    protected set height(num: number | string) {
        this._heightOrigin = num;
        this._height = toPx(num, this._parent?.height);
    }

    protected set strokeWidth(width: number) {
        this._strokeWidth = width;
    }

    protected set angle(angle: number) {
        this._angle = angle;
    }

    protected set scaleX(scaleX: number) {
        this._scaleX = scaleX;
    }

    protected set scaleY(scaleY: number) {
        this._scaleY = scaleY;
    }

    protected set skewX(skewX: number) {
        this._skewX = skewX;
    }

    protected set flipY(flipY: boolean) {
        this._flipY = flipY;
    }

    protected set flipX(flipX: boolean) {
        this._flipX = flipX;
    }

    protected set skewY(skewY: number) {
        this._skewY = skewY;
    }

    get transformerConfig() {
        return this._transformerConfig;
    }

    set transformerConfig(config: ITransformerConfig) {
        this._transformerConfig = config;
    }

    get maxZIndex() {
        return this._zIndex;
    }

    makeDirty(state: boolean = true) {
        this._dirty = state;

        if (state) {
            if (this._layer == null) {
                this._dirty = false;
                return;
            }

            this._layer.makeDirtyWithDebounce(state);
        }

        return this;
    }

    makeForceDirty(state: boolean = true) {
        this._forceDirty = state;
    }

    makeDirtyNoDebounce(state: boolean = true) {
        this._dirty = state;
        if (state) {
            this._layer?.makeDirty(state);
        }

        return this;
    }

    isDirty(): boolean {
        return this._dirty;
    }

    translate(x?: number | string, y?: number | string) {
        const preTop = this.top;
        if (y !== undefined) {
            this.top = y;
        }

        const preLeft = this.left;
        if (x !== undefined) {
            this.left = x;
        }

        this._setTransForm();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.translate,
            value: { top: this._top, left: this._left },
            preValue: { top: preTop, left: preLeft },
        });

        return this;
    }

    resize(width?: number | string, height?: number | string) {
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
            value: { width: this._width, height: this._height },
            preValue: { width: preWidth, height: preHeight },
        });

        return this;
    }

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
            value: { scaleX: this._scaleX, scaleY: this._scaleY },
            preValue: { scaleX: preScaleX, scaleY: preScaleY },
        });

        return this;
    }

    skew(skewX?: number, skewY?: number) {
        const preSkewX = skewX;
        if (skewX !== undefined) {
            this.skewX = skewX;
        }

        const preSkewY = skewY;
        if (skewY !== undefined) {
            this.skewY = skewY;
        }

        this._setTransForm();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.skew,
            value: { skewX: this._skewX, skewY: this._skewY },
            preValue: { skewX: preSkewX, skewY: preSkewY },
        });

        return this;
    }

    flip(flipX?: boolean, flipY?: boolean) {
        const preFlipX = flipX;
        if (flipX !== undefined) {
            this.flipX = flipX;
        }
        const preFlipY = flipY;
        if (flipY !== undefined) {
            this.flipY = flipY;
        }

        this._setTransForm();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.flip,
            value: { flipX: this._flipX, flipY: this._flipY },
            preValue: { flipX: preFlipX, flipY: preFlipY },
        });

        return this;
    }

    /**
     * this[pKey] = option[pKey]
     * @param option
     */
    transformByState(option: IObjectFullState) {
        const optionKeys = Object.keys(option);
        const preKeys: IObjectFullState = {};

        if (optionKeys.length === 0) {
            return;
        }

        optionKeys.forEach((pKey) => {
            if (option[pKey as keyof IObjectFullState] !== undefined) {
                preKeys[pKey as keyof IObjectFullState] = this[pKey as keyof BaseObject];
                (this as IKeyValue)[pKey] = option[pKey as keyof IObjectFullState];
            }
        });

        this._setTransForm();

        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.all,
            value: option,
            preValue: preKeys,
        });

        return this;
    }

    isRender(bounds?: IViewportInfo) {
        if (this._forceRender) {
            return false;
        }
        return bounds && !this.isInGroup;
    }

    getParent() {
        return this._parent;
    }

    getState(): ITransformState {
        return {
            left: this.left,
            top: this.top,
            width: this.width,
            height: this.height,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            angle: this.angle,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
        };
    }

    hide() {
        this._visible = false;
        this._makeDirtyMix();
    }

    show() {
        this._visible = true;
        this._makeDirtyMix();
    }

    render(ctx: UniverRenderingContext, bounds: IViewportInfo) {
        /* abstract */
    }

    isHit(coord: Vector2) {
        const oCoord = this.getInverseCoord(coord);
        if (
            oCoord.x >= -this.strokeWidth / 2 &&
            oCoord.x <= this.width + this.strokeWidth / 2 &&
            oCoord.y >= -this.strokeWidth / 2 &&
            oCoord.y <= this.height + this.strokeWidth / 2
        ) {
            return true;
        }
        return false;
    }

    triggerPointerMove(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerMove$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerMove(evt);
            return false;
        }
        return true;
    }

    triggerPointerDown(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerDown$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerDown(evt);
            return false;
        }
        return true;
    }

    triggerPointerUp(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerUp$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerUp(evt);
            return false;
        }
        return true;
    }

    triggerSingleClick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onSingleClick$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerSingleClick(evt);
            return false;
        }
        return true;
    }

    triggerClick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onClick$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerClick(evt);
            return false;
        }
        return true;
    }

    triggerDblclick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onDblclick$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerDblclick(evt);

            return false;
        }
        return true;
    }

    triggerTripleClick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onTripleClick$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerTripleClick(evt);

            return false;
        }

        return true;
    }

    triggerMouseWheel(evt: IWheelEvent) {
        if (!this.onMouseWheel$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerMouseWheel(evt);
            return false;
        }
        return true;
    }

    triggerPointerOut(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerOut$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerOut(evt);
            return false;
        }
        return true;
    }

    triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerLeave$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerLeave(evt);
            return false;
        }
        return true;
    }

    triggerPointerOver(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerOver$.emitEvent(evt)) {
            this._parent?.triggerPointerOver(evt);
            return false;
        }
        return true;
    }

    triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerEnter$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerEnter(evt);
            return false;
        }
        return true;
    }

    triggerPointerCancel(evt: IPointerEvent) {
        if (!this.onPointerEnter$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerPointerCancel(evt);
            return false;
        }
        return true;
    }

    triggerDragLeave(evt: IDragEvent | IMouseEvent) {
        if (!this.onDragLeave$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerDragLeave(evt);
            return false;
        }
        return true;
    }

    triggerDragOver(evt: IDragEvent | IMouseEvent) {
        if (!this.onDragOver$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerDragOver(evt);
            return false;
        }
        return true;
    }

    triggerDragEnter(evt: IDragEvent | IMouseEvent) {
        if (!this.onDragEnter$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerDragEnter(evt);
            return false;
        }
        return true;
    }

    triggerDrop(evt: IDragEvent | IMouseEvent) {
        if (!this.onDrop$.emitEvent(evt)?.stopPropagation) {
            this._parent?.triggerDrop(evt);
            return false;
        }
        return true;
    }

    override dispose() {
        super.dispose();
        this.onTransformChange$.complete();
        this.onPointerDown$.complete();
        this.onPointerMove$.complete();
        this.onPointerUp$.complete();
        this.onMouseWheel$.complete();
        this.onPointerOut$.complete();
        this.onPointerLeave$.complete();
        this.onPointerOver$.complete();
        this.onPointerEnter$.complete();
        this.onDragLeave$.complete();
        this.onDragOver$.complete();
        this.onDragEnter$.complete();
        this.onDrop$.complete();
        this.onSingleClick$.complete();
        this.onClick$.complete();
        this.onDblclick$.complete();
        this.onTripleClick$.complete();
        this.onIsAddedToParent$.complete();

        this.parent?.removeObject(this);

        this.onDispose$.emitEvent(this);

        this._makeDirtyMix();

        this.onDispose$.complete();

        this._parent = null;
        this._layer = null;
        this.transform = null as unknown as Transform;
    }

    toJson() {
        const props: IKeyValue = {};
        BASE_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof BaseObject]) {
                props[key] = this[key as keyof BaseObject];
            }
        });

        return props;
    }

    getScene(): Nullable<Scene> {
        let parent: any = this.parent;
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                return parent;
            }
            parent = parent.getParent();
        }

        return null;
    }

    resetCursor() {
        this.getScene()?.resetCursor();
    }

    setCursor(val: CURSOR_TYPE) {
        this._cursor = val;
        this.getScene()?.setCursor(val);
    }

    getEngine(): Nullable<Engine> {
        let parent: any = this.getParent();
        while (parent != null) {
            if (parent.classType === RENDER_CLASS_TYPE.ENGINE) {
                return parent;
            }
            parent = parent.getParent();
        }
        return null;
    }

    getObjects(): BaseObject[] {
        return [];
    }

    getLayerIndex() {
        if (this._layer == null) {
            return 1;
        }
        return this._layer.zIndex;
    }

    applyTransform() {
        this.getScene()?.attachTransformerTo(this);
    }

    removeTransform() {
        this.getScene()?.detachTransformerFrom(this);
    }

    getInverseCoord(coord: Vector2): Vector2 {
        return this.ancestorTransform.invert().applyPoint(coord);
    }

    protected _setTransForm() {
        const composeResult = Transform.create().composeMatrix({
            left: this.left + this.strokeWidth / 2,
            top: this.top + this.strokeWidth / 2,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            angle: this.angle,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
        });
        this.transform = composeResult;
        this._makeDirtyMix();
    }

    private _makeDirtyMix() {
        if (this.debounceParentDirty) {
            this.makeDirty(true);
        } else {
            this.makeDirtyNoDebounce(true);
        }
    }
}
