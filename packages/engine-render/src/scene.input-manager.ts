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

import type { PointerEvent } from 'react';

import type { Subscription } from 'rxjs';
import type { BaseObject } from './base-object';
import type { IDragEvent, IEvent, IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent } from './basics/i-events';
import type { ISceneInputControlOptions, Scene } from './scene';
import { Disposable, type Nullable, toDisposable } from '@univerjs/core';
import { RENDER_CLASS_TYPE } from './basics/const';
import { DeviceType, PointerInput } from './basics/i-events';
import { Vector2 } from './basics/vector2';

export class InputManager extends Disposable {
    /** The distance in pixel that you have to move to prevent some events */
    static DragMovementThreshold = 2; // in pixels

    /** Time in milliseconds to wait to raise long press events if button is still pressed */
    static LongPressDelay = 500; // in milliseconds

    /** Time in milliseconds with two consecutive clicks will be considered as a double or triple click */
    static DoubleClickDelay = 500; // in milliseconds

    static TripleClickDelay = 300; // in milliseconds

    /** If you need to check double click without raising a single click at first click, enable this flag */
    static ExclusiveDoubleClickMode = false;

    private _scene!: Scene;

    /** This is a defensive check to not allow control attachment prior to an already active one. If already attached, previous control is unattached before attaching the new one. */
    private _alreadyAttached = false;

    // WorkBookObserver
    private _onInput$: Nullable<Subscription>;

    private _currentMouseEnterPicked: Nullable<BaseObject | Scene>;
    private _startingPosition = new Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    private _delayedTimeout: NodeJS.Timeout | number = -1;
    private _delayedTripeTimeout: NodeJS.Timeout | number = -1;
    private _doubleClickOccurred = 0;
    private _tripleClickState = false;
    private _currentObject: Nullable<BaseObject | Scene>;

    constructor(scene: Scene) {
        super();
        this._scene = scene;
    }

    /**
     * TODO: DR-Univer, fix as unknown as
     */
    override dispose(): void {
        super.dispose();
        this.detachControl();
        this._scene = null as unknown as Scene;
        this._currentMouseEnterPicked = null;
        this._currentObject = null;
        this._startingPosition = null as unknown as Vector2;
        clearTimeout(this._delayedTimeout);
        clearTimeout(this._delayedTripeTimeout);

        this._onPointerMove = null as unknown as (evt: IMouseEvent) => void;
        this._onPointerDown = null as unknown as (evt: IPointerEvent) => void;
        this._onPointerUp = null as unknown as (evt: IPointerEvent) => void;
        this._onPointerEnter = null as unknown as (evt: IPointerEvent) => void;
        this._onPointerLeave = null as unknown as (evt: IPointerEvent) => void;
        this._onMouseWheel = null as unknown as (evt: IWheelEvent) => void;
        this._onKeyDown = null as unknown as (evt: IKeyboardEvent) => void;
        this._onKeyUp = null as unknown as (evt: IKeyboardEvent) => void;
        this._onDragEnter = null as unknown as (evt: IDragEvent) => void;
        this._onDragLeave = null as unknown as (evt: IDragEvent) => void;
        this._onDragOver = null as unknown as (evt: IDragEvent) => void;
        this._onDrop = null as unknown as (evt: IDragEvent) => void;
    }

    // Handle events such as triggering mouseleave and mouseenter.
    mouseLeaveEnterHandler(evt: IMouseEvent) {
        const o = this._currentObject;
        if (o === null || o === undefined) {
            this._currentMouseEnterPicked?.triggerPointerLeave(evt);
            this._currentMouseEnterPicked = null;
        } else if (o !== this._currentMouseEnterPicked) {
            const previousPicked = this._currentMouseEnterPicked;
            this._currentMouseEnterPicked = o;
            previousPicked?.triggerPointerLeave(evt);
            o?.triggerPointerEnter(evt);
        }
    }

    // Handle events such as triggering dragleave and dragenter.
    dragLeaveEnterHandler(evt: IDragEvent) {
        const o = this._currentObject;
        if (o === null || o === undefined) {
            this._currentMouseEnterPicked?.triggerDragLeave(evt);
            this._currentMouseEnterPicked = null;
        } else if (o !== this._currentMouseEnterPicked) {
            const previousPicked = this._currentMouseEnterPicked;
            this._currentMouseEnterPicked = o;
            previousPicked?.triggerDragLeave(evt);
            o?.triggerDragEnter(evt);
        }
    }

    _onPointerEnter(evt: IPointerEvent) {
        // preserve compatibility with Safari when pointerId is not present
        if (evt.pointerId === undefined) {
            evt.pointerId = 0;
        }

        this._currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        this.mouseLeaveEnterHandler(evt);
    }

    _onPointerLeave(evt: IPointerEvent) {
        // preserve compatibility with Safari when pointerId is not present
        if (evt.pointerId === undefined) {
            evt.pointerId = 0;
        }

        this._currentObject = null;
        this.mouseLeaveEnterHandler(evt);
    }

    _onPointerMove(evt: IMouseEvent) {
        // preserve compatibility with Safari when pointerId is not present
        if ((evt as IPointerEvent).pointerId === undefined) {
            (evt as unknown as PointerEvent).pointerId = 0;
        }
        const currentObject = this._currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);

        const isStop = currentObject?.triggerPointerMove(evt);

        this.mouseLeaveEnterHandler(evt);

        if (this._checkDirectSceneEventTrigger(!isStop, this._currentObject)) {
            this._scene.onPointerMove$.emitEvent(evt);
            this._scene.getEngine()?.setCapture();
        }
    }

    _onPointerDown(evt: IPointerEvent) {
        // preserve compatibility with Safari when pointerId is not present
        if (evt.pointerId === undefined) {
            (evt as unknown as PointerEvent).pointerId = 0;
        }

        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        const isStop = currentObject?.triggerPointerDown(evt);

        if (this._checkDirectSceneEventTrigger(!isStop, currentObject)) {
            this._scene.onPointerDown$.emitEvent(evt);
        }
    }

    _onPointerUp(evt: IPointerEvent) {
        // preserve compatibility with Safari when pointerId is not present
        if (evt.pointerId === undefined) {
            evt.pointerId = 0;
        }

        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        const isStop = currentObject?.triggerPointerUp(evt);

        if (this._checkDirectSceneEventTrigger(!isStop, currentObject)) {
            this._scene.onPointerUp$.emitEvent(evt);
        }

        this._prePointerDoubleOrTripleClick(evt);
    }

    _onPointerCancel(evt: IPointerEvent) {
        this._scene.onPointerCancel$.emitEvent(evt);
        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        currentObject?.triggerPointerCancel(evt);
    }

    _onPointerOut(evt: IPointerEvent) {
        this._scene.onPointerOut$.emitEvent(evt);
        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        currentObject?.triggerPointerOut(evt);
    }

    _onMouseWheel(evt: IWheelEvent) {
        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        const isStop = currentObject?.triggerMouseWheel(evt);

        // for doc
        const viewportMain = this._scene.getMainViewport();
        viewportMain.onMouseWheel$.emitEvent(evt);

        // what is checkDirectSceneEventTrigger??  for what ???
        if (this._checkDirectSceneEventTrigger(!isStop, currentObject)) {
            this._scene.onMouseWheel$.emitEvent(evt);
        }
    }

    _onKeyDown(evt: IKeyboardEvent) {
        // currently nobody using this. use `fromGlobalEvent('keydown')` from rx.js instead.
        this._scene.onKeyDown$.emitEvent(evt);
    }

    _onKeyUp(evt: IKeyboardEvent) {
        // currently nobody using this. use `fromGlobalEvent('keyup')` from rx.js instead.
        this._scene.onKeyUp$.emitEvent(evt);
    }

    _onDragEnter(evt: IDragEvent) {
        this._currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        this._currentObject?.triggerDragOver(evt);

        this.dragLeaveEnterHandler(evt);
    }

    _onDragLeave(evt: IDragEvent) {
        this._currentObject = null;

        this.dragLeaveEnterHandler(evt);
    }

    _onDragOver(evt: IDragEvent) {
        this._currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        const isStop = this._currentObject?.triggerDragOver(evt);

        this.dragLeaveEnterHandler(evt);

        if (this._checkDirectSceneEventTrigger(!isStop, this._currentObject)) {
            this._scene.onDragOver$.emitEvent(evt);
            this._scene.getEngine()?.setCapture();
        }
    }

    _onDrop(evt: IDragEvent) {
        const currentObject = this._getObjectAtPos(evt.offsetX, evt.offsetY);
        const isStop = currentObject?.triggerDrop(evt);

        if (this._checkDirectSceneEventTrigger(!isStop, currentObject)) {
            this._scene.onDrop$.emitEvent(evt);
        }
    }

    // eslint-disable-next-line max-lines-per-function
    attachControl(options?: ISceneInputControlOptions) {
        const enableDown: boolean = options?.enableDown ?? true;
        const enableUp: boolean = options?.enableUp ?? true;
        const enableMove: boolean = options?.enableMove ?? true;
        const enableWheel: boolean = options?.enableWheel ?? true;
        const enableEnter: boolean = options?.enableEnter ?? true;
        const enableLeave: boolean = options?.enableLeave ?? true;
        const engine = this._scene.getEngine();
        if (!engine) return;

        // eslint-disable-next-line complexity, max-lines-per-function
        this._onInput$ = engine.onInputChanged$.subscribeEvent((eventData: IEvent) => {
            const evt: IEvent = eventData;
            if (eventData.deviceType === DeviceType.Keyboard) {
                switch (eventData.type) {
                    case 'keydown':
                        this._onKeyDown(evt as IKeyboardEvent);
                        break;
                    case 'keyup':
                        this._onKeyUp(evt as IKeyboardEvent);
                        break;
                }
            }

            // Pointer Events
            if (eventData.deviceType === DeviceType.Mouse || eventData.deviceType === DeviceType.Touch) {
                switch (eventData.type) {
                    case 'wheel':
                    case 'DOMMouseScroll':
                    case 'mousewheel':
                        if (enableWheel) {
                            this._onMouseWheel(evt as IWheelEvent);
                        }
                        break;
                    case 'pointerout':
                        this._onPointerOut(evt as IPointerEvent);
                        break;
                    case 'pointercancel':
                        this._onPointerCancel(evt as IPointerEvent);
                        break;
                    case 'pointerleave':
                        this._onPointerLeave(evt as IPointerEvent);
                        break;
                    case 'pointermove':
                        if (enableMove) {
                            this._onPointerMove(evt as IPointerEvent);
                        }
                        break;
                    case 'pointerup':
                        if (enableUp &&
                            eventData.inputIndex >= PointerInput.LeftClick &&
                            eventData.inputIndex <= PointerInput.RightClick) {
                            this._onPointerUp(evt as IPointerEvent);
                        }
                        break;
                    case 'pointerdown':
                        if (enableDown &&
                            eventData.inputIndex >= PointerInput.LeftClick &&
                            eventData.inputIndex <= PointerInput.RightClick) {
                            this._onPointerDown(evt as IPointerEvent);
                        }
                        break;
                }
            }

            // Drag Events, For 3rd users. Univer itself doesn't use drag events.
            if ((eventData as IDragEvent).dataTransfer) {
                switch (eventData.type) {
                    case 'dragenter':
                        if (enableEnter) {
                            this._onDragEnter(evt as IDragEvent);
                        }
                        break;
                    case 'dragover': {
                        const validIndex = eventData.inputIndex === PointerInput.Horizontal ||
                        eventData.inputIndex === PointerInput.Vertical ||
                        eventData.inputIndex === PointerInput.DeltaHorizontal ||
                        eventData.inputIndex === PointerInput.DeltaVertical;
                        if (enableMove && validIndex) {
                            this._onDragOver(evt as IDragEvent);
                        }
                        break;
                    }
                    case 'dragleave':
                        if (enableLeave) {
                            this._onDragLeave(evt as IDragEvent);
                        }
                        break;
                    case 'drop':
                        this._onDrop(evt as IDragEvent);
                        break;
                }
            }
        });

        this.disposeWithMe(toDisposable(this._onInput$));
        this._alreadyAttached = true;
    }

    /**
     * Detaches all event handlers
     */
    detachControl() {
        if (!this._alreadyAttached) {
            return;
        }

        const engine = this._scene.getEngine();

        if (!engine) {
            return;
        }
        // engine.onInputChanged$.remove(this._onInput$);
        this._onInput$?.unsubscribe();
        this._alreadyAttached = false;
    }

    /**
     * Just call this._scene.pick, nothing special.
     * @param offsetX
     * @param offsetY
     */
    private _getObjectAtPos(offsetX: number, offsetY: number) {
        return this._scene?.pick(Vector2.FromArray([offsetX, offsetY]));
    }

    private _checkDirectSceneEventTrigger(isTrigger: boolean, currentObject: Nullable<Scene | BaseObject>) {
        let notObject = false;
        if (currentObject == null) {
            notObject = true;
        }

        let isNotInSceneViewer = true;
        if (currentObject && currentObject.classType === RENDER_CLASS_TYPE.BASE_OBJECT) {
            const scene = (currentObject as BaseObject).getScene() as Scene;
            if (scene) {
                const parent = scene.getParent();
                isNotInSceneViewer = parent.classType !== RENDER_CLASS_TYPE.SCENE_VIEWER;
            }
        }
        return (!this._scene.objectsEvented && isTrigger && isNotInSceneViewer) || notObject;
    }

    /**
     * @hidden
     * @returns Boolean if delta for pointer exceeds drag movement threshold
     */
    private _isPointerSwiping(pointerX: number, pointerY: number): boolean {
        return (
            Math.abs(this._startingPosition.x - pointerX) > InputManager.DragMovementThreshold ||
            Math.abs(this._startingPosition.y - pointerY) > InputManager.DragMovementThreshold
        );
    }

    private _prePointerDoubleOrTripleClick(evt: IPointerEvent) {
        const { clientX, clientY } = evt;

        const isMoveThreshold = this._isPointerSwiping(clientX, clientY);

        if (isMoveThreshold) {
            this._resetDoubleClickParam();
        }

        this._delayedTimeout = setTimeout(() => {
            this._resetDoubleClickParam();
        }, InputManager.DoubleClickDelay);

        this._doubleClickOccurred += 1;

        if (this._tripleClickState) {
            this._scene?.pick(Vector2.FromArray([evt.offsetX, evt.offsetY]))?.triggerTripleClick(evt);

            this._scene.onTripleClick$.emitEvent(evt);
        }

        if (this._doubleClickOccurred === 2) {
            this._scene?.pick(Vector2.FromArray([evt.offsetX, evt.offsetY]))?.triggerDblclick(evt);

            this._scene.onDblclick$.emitEvent(evt);
            this._resetDoubleClickParam();
            this._tripleClickState = true;

            clearTimeout(this._delayedTripeTimeout);

            this._delayedTripeTimeout = setTimeout(() => {
                this._tripleClickState = false;
            }, InputManager.TripleClickDelay);
        }

        this._startingPosition.x = clientX;
        this._startingPosition.y = clientY;
    }

    private _resetDoubleClickParam() {
        this._doubleClickOccurred = 0;
        clearTimeout(this._delayedTimeout);
    }
}
