import { EventState, IKeyValue, Observable, Observer, Nullable } from '@univer/core';
import { IBoundRect, Vector2 } from './Basics/Vector2';

import { Transform } from './Basics/Transform';

import { IMouseEvent, IPointerEvent, IWheelEvent } from './Basics/IEvents';

import { generateRandomKey, toPx } from './Basics/Tools';

import { EVENT_TYPE, CURSOR_TYPE, RENDER_CLASS_TYPE } from './Basics/Const';

import { IObjectFullState, ITransformChangeState, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './Basics/Interfaces';

export const BASE_OBJECT_ARRAY = ['top', 'left', 'width', 'height', 'angle', 'scaleX', 'scaleY', 'skewX', 'skewY', 'flipX', 'flipY', 'strokeWidth'];

export abstract class BaseObject {
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

    private _parent: any;

    private _zIndex: number = 0;

    private _evented: boolean = true;

    private _visible: boolean = true;

    private _debounceParentDirty: boolean = true;

    private _transform = new Transform();

    protected _oKey: string;

    protected _dirty: boolean = true;

    private __debounceParentTimeout: number;

    private _cursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    private _isTransformer = false;

    groupKey?: string;

    isInGroup: boolean = false;

    constructor(key?: string) {
        if (key) {
            this._oKey = key;
        } else {
            this._oKey = generateRandomKey();
        }
    }

    makeDirty(state: boolean = true) {
        this._dirty = state;
        if (state) {
            window.clearTimeout(this.__debounceParentTimeout);
            this.__debounceParentTimeout = window.setTimeout(() => {
                this.parent?.makeDirty(state);
            }, 0);
        }
        return this;
    }

    makeDirtyNoDebounce(state: boolean = true) {
        this._dirty = state;
        if (state) {
            this.parent?.makeDirty(state);
        }
        return this;
    }

    isDirty(): boolean {
        return this._dirty;
    }

    onTransformChangeObservable = new Observable<ITransformChangeState>();

    get transform() {
        return this._transform;
    }

    set transform(trans: Transform) {
        this._transform = trans;
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

    translate(x?: number | string, y?: number | string) {
        if (y !== undefined) {
            this.top = y;
        }

        if (x !== undefined) {
            this.left = x;
        }

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.translate,
            value: { x: this._top, y: this._left },
        });

        return this;
    }

    resize(width?: number | string, height?: number | string) {
        if (width !== undefined) {
            this.width = width;
        }

        if (height !== undefined) {
            this.height = height;
        }

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
            value: { x: this._width, y: this._height },
        });

        return this;
    }

    scale(scaleX?: number, scaleY?: number) {
        if (scaleX !== undefined) {
            this.scaleX = scaleX;
        }

        if (scaleY !== undefined) {
            this.scaleY = scaleY;
        }

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
            value: { x: this._scaleX, y: this._scaleY },
        });

        return this;
    }

    skew(skewX?: number, skewY?: number) {
        if (skewX !== undefined) {
            this.skewX = skewX;
        }

        if (skewY !== undefined) {
            this.skewY = skewY;
        }

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.skew,
            value: { x: this._skewX, y: this._skewY },
        });

        return this;
    }

    flip(flipX?: boolean, flipY?: boolean) {
        if (flipX !== undefined) {
            this.flipX = flipX;
        }

        if (flipY !== undefined) {
            this.flipY = flipY;
        }

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.flip,
            value: { x: this._flipX, y: this._flipY },
        });

        return this;
    }

    transformByState(option: IObjectFullState) {
        const optionKeys = Object.keys(option);
        if (optionKeys.length === 0) {
            return;
        }
        optionKeys.forEach((pKey) => {
            if (option[pKey] !== undefined) {
                this[pKey] = option[pKey];
            }
        });

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.all,
            value: option,
        });

        return this;
    }

    private _setTransForm() {
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
        if (this.debounceParentDirty) {
            this.makeDirty(true);
        } else {
            this.makeDirtyNoDebounce(true);
        }
    }

    get top(): number {
        return this._top;
    }

    protected set top(num: number | string) {
        this._topOrigin = num;
        this._top = toPx(num, this._parent?.height);
    }

    get left(): number {
        return this._left;
    }

    protected set left(num: number | string) {
        this._leftOrigin = num;
        this._left = toPx(num, this._parent?.width);
    }

    get width(): number {
        return this._width;
    }

    protected set width(num: number | string) {
        this._widthOrigin = num;
        this._width = toPx(num, this._parent?.width);
    }

    get height(): number {
        return this._height;
    }

    protected set height(num: number | string) {
        this._heightOrigin = num;
        this._height = toPx(num, this._parent?.height);
    }

    get strokeWidth() {
        return this._strokeWidth;
    }

    protected set strokeWidth(width: number) {
        this._strokeWidth = width;
    }

    get angle() {
        return this._angle;
    }

    protected set angle(angle: number) {
        this._angle = angle;
    }

    get scaleX() {
        return this._scaleX;
    }

    protected set scaleX(scaleX: number) {
        this._scaleX = scaleX;
    }

    get scaleY() {
        return this._scaleY;
    }

    protected set scaleY(scaleY: number) {
        this._scaleY = scaleY;
    }

    get ancestorScaleX() {
        let pScale: number = this.getParent()?.ancestorScaleX || 1;
        return this.scaleX * pScale;
    }

    get ancestorScaleY() {
        let pScale: number = this.getParent()?.ancestorScaleY || 1;
        return this.scaleY * pScale;
    }

    get skewX() {
        return this._skewX;
    }

    protected set skewX(skewX: number) {
        this._skewX = skewX;
    }

    get skewY() {
        return this._skewY;
    }

    protected set skewY(skewY: number) {
        this._skewY = skewY;
    }

    get flipX() {
        return this._flipX;
    }

    protected set flipX(flipX: boolean) {
        this._flipX = flipX;
    }

    get flipY() {
        return this._flipY;
    }

    protected set flipY(flipY: boolean) {
        this._flipY = flipY;
    }

    get parent() {
        return this._parent;
    }

    set parent(o: any) {
        this._parent = o;
    }

    getParent() {
        return this._parent;
    }

    get oKey() {
        return this._oKey;
    }

    get zIndex() {
        return this._zIndex;
    }

    set zIndex(index: number) {
        this._zIndex = index;
    }

    get evented() {
        return this._evented;
    }

    set evented(state: boolean) {
        this._evented = state;
    }

    get visible() {
        return this._visible;
    }

    set visible(state: boolean) {
        this._visible = state;
    }

    get debounceParentDirty() {
        return this._debounceParentDirty;
    }

    set debounceParentDirty(state: boolean) {
        this._debounceParentDirty = state;
    }

    get isTransformer() {
        return this._isTransformer;
    }

    set isTransformer(state: boolean) {
        this._isTransformer = state;
    }

    render(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        /* abstract */
    }

    isHit(coord: Vector2) {
        const oCoord = this._getInverseCoord(coord);
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

    protected _getInverseCoord(coord: Vector2) {
        return this._transform.clone().invert().applyPoint(coord);
    }

    on(eventType: EVENT_TYPE, func: (evt: unknown, state: EventState) => void) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        const observer = observable.add(func.bind(this));
        return observer;
    }

    off(eventType: EVENT_TYPE, observer: Nullable<Observer<unknown>>) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        observable.remove(observer);
    }

    clear(eventType: EVENT_TYPE) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        observable.clear();
    }

    resizeCacheCanvas() {
        /* abstract */
    }

    scaleCacheCanvas() {
        /* abstract */
    }

    triggerPointerMove(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerMoveObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerMove(evt);
            return false;
        }
        return true;
    }

    triggerPointerDown(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerDownObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerDown(evt);
            return false;
        }
        return true;
    }

    triggerPointerUp(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerUpObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerUp(evt);
            return false;
        }
        return true;
    }

    triggerDblclick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onDblclickObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerDblclick(evt);
            return false;
        }
        return true;
    }

    triggerMouseWheel(evt: IWheelEvent) {
        if (!this.onMouseWheelObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerMouseWheel(evt);
            return false;
        }
        return true;
    }

    // triggerKeyDown(evt: IKeyboardEvent) {
    //     // this.onKeyDownObservable.notifyObservers(evt);
    //     this._parent?.triggerKeyDown(evt);
    // }

    // triggerKeyUp(evt: IKeyboardEvent) {
    //     // this.onKeyUpObservable.notifyObservers(evt);
    //     this._parent?.triggerKeyUp(evt);
    // }

    triggerPointerOut(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerOutObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerOut(evt);
            return false;
        }
        return true;
    }

    triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerLeaveObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerLeave(evt);
            return false;
        }
        return true;
    }

    triggerPointerOver(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerOverObserver.notifyObservers(evt)) {
            this._parent?.triggerPointerOver(evt);
            return false;
        }
        return true;
    }

    triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerEnterObserver.notifyObservers(evt)?.stopPropagation) {
            this._parent?.triggerPointerEnter(evt);
            return false;
        }
        return true;
    }

    dispose() {
        this.onPointerDownObserver.clear();
        this.onPointerMoveObserver.clear();
        this.onPointerUpObserver.clear();
        this.onMouseWheelObserver.clear();
        this.onPointerOutObserver.clear();
        this.onPointerLeaveObserver.clear();
        this.onPointerOverObserver.clear();
        this.onPointerEnterObserver.clear();
        this.onDblclickObserver.clear();
        this.onIsAddedToParentObserver.clear();

        this.parent?.removeObject(this);
    }

    onPointerDownObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerMoveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerUpObserver = new Observable<IPointerEvent | IMouseEvent>();

    onDblclickObserver = new Observable<IPointerEvent | IMouseEvent>();

    onMouseWheelObserver = new Observable<IWheelEvent>();
    // onKeyDownObservable = new Observable<IKeyboardEvent>();
    // onKeyUpObservable = new Observable<IKeyboardEvent>();

    onPointerOutObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerLeaveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerOverObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerEnterObserver = new Observable<IPointerEvent | IMouseEvent>();

    onIsAddedToParentObserver = new Observable<any>();

    toJson() {
        const props: IKeyValue = {};
        BASE_OBJECT_ARRAY.forEach((key) => {
            if (this[key]) {
                props[key] = this[key];
            }
        });
        return props;
    }

    getScene() {
        let parent: any = this.parent;
        if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
            return parent;
        }

        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                return parent;
            }
            parent = parent.getParent();
        }
    }

    get cursor() {
        return this._cursor;
    }

    set cursor(val: CURSOR_TYPE) {
        this.setCursor(val);
    }

    resetCursor() {
        this.setCursor(CURSOR_TYPE.DEFAULT);
    }

    setCursor(val: CURSOR_TYPE) {
        this._cursor = val;
        this.getScene()?.setCursor(val);
    }

    getEngine() {
        let parent: any = this.getParent();
        while (parent != null) {
            if (parent === RENDER_CLASS_TYPE.ENGINE) {
                return parent;
            }
            parent = parent.getParent();
        }
        return null;
    }
}
