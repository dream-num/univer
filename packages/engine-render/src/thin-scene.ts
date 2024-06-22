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
import { Disposable, EventSubject, Observable } from '@univerjs/core';

import type { BaseObject } from './base-object';
import type { CURSOR_TYPE, EVENT_TYPE } from './basics/const';
import { RENDER_CLASS_TYPE } from './basics/const';
import type { IDragEvent, IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';
import type { ITransformChangeState } from './basics/interfaces';
import { Transform } from './basics/transform';
import type { Vector2 } from './basics/vector2';
import type { UniverRenderingContext } from './context';

export abstract class ThinScene extends Disposable {
    onTransformChangeObservable = new Observable<ITransformChangeState>();

    onFileLoadedObservable = new Observable<string>();

    pointerDown$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onPointerMove$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onPointerUp$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onPointerEnterObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerLeaveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onDragEnterObserver = new Observable<IDragEvent>();

    onDragOverObserver = new Observable<IDragEvent>();

    onDragLeaveObserver = new Observable<IDragEvent>();

    onDropObserver = new Observable<IDragEvent>();

    onDblclick$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onTripleClick$ = new EventSubject<IPointerEvent | IMouseEvent>();

    onMouseWheel$ = new EventSubject<IWheelEvent>();

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

    abstract triggerPointerUp(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerMouseWheel(evt: IWheelEvent): void;

    abstract triggerPointerMove(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerDblclick(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerTripleClick(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerPointerDown(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerPointerOut(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerPointerLeave(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerPointerOver(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerPointerEnter(evt: IPointerEvent | IMouseEvent): void;

    abstract triggerDragEnter(evt: IDragEvent | IMouseEvent): void;

    abstract triggerDragOver(evt: IDragEvent | IMouseEvent): void;

    abstract triggerDragLeave(evt: IDragEvent | IMouseEvent): void;

    abstract triggerDrop(evt: IDragEvent | IMouseEvent): void;

    abstract render(parentCtx?: UniverRenderingContext): void;

    abstract getParent(): any;

    override dispose(): void {
        this.onTransformChangeObservable.clear();
        this.onFileLoadedObservable.clear();
        this.pointerDown$.complete();
        this.onPointerMove$.complete();
        this.onPointerUp$.complete();
        this.onPointerEnterObserver.clear();
        this.onPointerLeaveObserver.clear();
        this.onDragEnterObserver.clear();
        this.onDragOverObserver.clear();
        this.onDragLeaveObserver.clear();
        this.onDropObserver.clear();
        this.onDblclick$.complete();
        this.onTripleClick$.complete();
        this.onMouseWheel$.complete();
        this.onKeyDownObservable.clear();
        this.onKeyUpObservable.clear();

        super.dispose();
    }

    abstract getObject(oKey: string): Nullable<BaseObject>;

    abstract addObject(o: BaseObject, zIndex?: number): void;

    abstract addObjects(objects: BaseObject[], zIndex?: number): void;

    abstract getEngine(): any;

    abstract setObjectBehavior(o: BaseObject): void;

    attachTransformerTo(o: BaseObject) { }

    detachTransformerFrom(o: BaseObject) { }

    makeDirtyNoParent(state: boolean = true): ThinScene {
        return this;
    }

    makeDirty(state: boolean = true) {
        return this;
    }

    abstract pick(coord: Vector2): Nullable<BaseObject | ThinScene>;

    getViewports(): any[] {
        return [];
    }

    abstract addViewport(...viewport: any[]): void;

    abstract removeViewport(key: string): void;

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

    abstract setCursor(val: CURSOR_TYPE): void;

    abstract resetCursor(): void;
}
