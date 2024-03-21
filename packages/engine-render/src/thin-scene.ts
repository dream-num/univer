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

import type { EventState, IKeyValue, Nullable, Observer } from '@univerjs/core';
import { Disposable, Observable } from '@univerjs/core';

import type { BaseObject } from './base-object';
import type { CURSOR_TYPE, EVENT_TYPE } from './basics/const';
import { RENDER_CLASS_TYPE } from './basics/const';
import type { IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';
import type { ITransformChangeState } from './basics/interfaces';
import { Transform } from './basics/transform';
import type { IViewportBound, Vector2 } from './basics/vector2';
import type { UniverRenderingContext } from './context';

export abstract class ThinScene extends Disposable {
    onTransformChangeObservable = new Observable<ITransformChangeState>();

    onFileLoadedObservable = new Observable<string>();

    onPointerDownObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerMoveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerUpObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerEnterObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerLeaveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onDblclickObserver = new Observable<IPointerEvent | IMouseEvent>();

    onTripleClickObserver = new Observable<IPointerEvent | IMouseEvent>();

    onMouseWheelObserver = new Observable<IWheelEvent>();

    onKeyDownObservable = new Observable<IKeyboardEvent>();

    onKeyUpObservable = new Observable<IKeyboardEvent>();

    debounceParentTimeout: number = -1;

    private _sceneKey: string = '';

    private _width: number = 100;

    private _height: number = 100;

    private _scaleX: number = 1;

    private _scaleY: number = 1;

    private _transform = new Transform();

    private _evented = true;

    constructor(sceneKey: string) {
        super();
        this._sceneKey = sceneKey;
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

    get evented() {
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

    enableEvent() {
        this._evented = true;
    }

    disableEvent() {
        this._evented = false;
    }

    on(eventType: EVENT_TYPE, func: (evt: unknown, state: EventState) => void) {
        const observable = (this as IKeyValue)[`on${eventType}Observer`] as Observable<unknown>;
        const observer = observable.add(func.bind(this));
        return observer;
    }

    off(eventType: EVENT_TYPE, observer: Nullable<Observer<unknown>>) {
        const observable = (this as IKeyValue)[`on${eventType}Observer`] as Observable<unknown>;
        observable.remove(observer);
    }

    remove(eventType: EVENT_TYPE) {
        const observable = (this as IKeyValue)[`on${eventType}Observer`] as Observable<unknown>;
        observable.clear();
    }

    triggerKeyDown(evt: IKeyboardEvent) {
        this.onKeyDownObservable.notifyObservers(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyDown(evt);
        // }
    }

    triggerKeyUp(evt: IKeyboardEvent) {
        this.onKeyUpObservable.notifyObservers(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyUp(evt);
        // }
    }

    triggerPointerUp(evt: IPointerEvent | IMouseEvent) {}

    triggerMouseWheel(evt: IWheelEvent) {}

    triggerPointerMove(evt: IPointerEvent | IMouseEvent) {}

    triggerDblclick(evt: IPointerEvent | IMouseEvent) {}

    triggerTripleClick(evt: IPointerEvent | IMouseEvent) {}

    triggerPointerDown(evt: IPointerEvent | IMouseEvent) {}

    triggerPointerOut(evt: IPointerEvent | IMouseEvent) {}

    triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {}

    triggerPointerOver(evt: IPointerEvent | IMouseEvent) {}

    triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {}

    renderObjects(ctx: UniverRenderingContext, bounds?: IViewportBound) {}

    render(parentCtx?: UniverRenderingContext) {}

    getParent(): any {}

    override dispose() {
        super.dispose();
    }

    getObject(oKey: string): Nullable<BaseObject> {}

    addObject(o: BaseObject, zIndex: number = 1) {}

    addObjects(objects: BaseObject[], zIndex: number = 1) {}

    getEngine(): any {}

    setObjectBehavior(o: BaseObject) {}

    applyTransformer(o: BaseObject) {}

    makeDirtyNoParent(state: boolean = true) {
        return this;
    }

    makeDirty(state: boolean = true) {
        return this;
    }

    pick(coord: Vector2): Nullable<BaseObject | ThinScene> {}

    getViewports(): any[] {
        return [];
    }

    addViewport(...viewport: any[]) {}

    removeViewport(key: string) {}

    getAncestorScale() {
        return {
            scaleX: 1,
            scaleY: 1,
        };
    }

    getPrecisionScale() {
        return {
            scaleX: 1,
            scaleY: 1,
        };
    }

    setCursor(val: CURSOR_TYPE) {

    }

    resetCursor() {

    }
}
