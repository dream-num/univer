import { Observer, Nullable } from '@univer/core';
import { IKeyboardEvent, IMouseEvent, IPointerEvent, IEvent, DeviceType, PointerInput, IWheelEvent } from './Basics/IEvents';

import { Vector2 } from './Basics/Vector2';

import { BaseObject } from './BaseObject';

import { Scene } from './Scene';

export class InputManager {
    /** The distance in pixel that you have to move to prevent some events */
    static DragMovementThreshold = 10; // in pixels

    /** Time in milliseconds to wait to raise long press events if button is still pressed */
    static LongPressDelay = 500; // in milliseconds

    /** Time in milliseconds with two consecutive clicks will be considered as a double click */
    static DoubleClickDelay = 300; // in milliseconds

    /** If you need to check double click without raising a single click at first click, enable this flag */
    static ExclusiveDoubleClickMode = false;

    /** This is a defensive check to not allow control attachment prior to an already active one. If already attached, previous control is unattached before attaching the new one. */
    private _alreadyAttached = false;

    private _alreadyAttachedTo: HTMLElement;

    // WorkBookObserver
    private _onInputObserver: Nullable<Observer<IEvent>>;

    // Pointers
    private _onPointerMove: (evt: IMouseEvent) => void;

    private _onPointerDown: (evt: IPointerEvent) => void;

    private _onPointerUp: (evt: IPointerEvent) => void;

    private _onMouseWheel: (evt: IWheelEvent) => void;

    // Keyboard
    private _onKeyDown: (evt: IKeyboardEvent) => void;

    private _onKeyUp: (evt: IKeyboardEvent) => void;

    private _scene: Scene;

    private _currentMouseEnterPicked: Nullable<BaseObject | Scene>;

    private _startingPosition = new Vector2(Infinity, Infinity);

    private _delayedTimeout: number;

    private _doubleClickOccurred = 0;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    private _getCurrentObject(offsetX: number, offsetY: number) {
        return this._scene?.pick(Vector2.FromArray([offsetX, offsetY]));
    }

    private _checkDirectSceneEventTrigger(isTrigger: boolean, notObject: boolean) {
        return (!this._scene.evented && isTrigger) || notObject;
    }

    // 处理事件，比如mouseleave,mouseenter的触发。
    mouseLeaveEnterHandler(o: Nullable<BaseObject | Scene>, evt: IMouseEvent) {
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

    attachControl(hasDown: boolean = true, hasUp: boolean = true, hasMove: boolean = true, hasWheel: boolean = true) {
        const engine = this._scene.getEngine();

        if (!engine) {
            return;
        }

        this._onPointerMove = (evt: IMouseEvent) => {
            // preserve compatibility with Safari when pointerId is not present
            if ((evt as IPointerEvent).pointerId === undefined) {
                (evt as IPointerEvent as any).pointerId = 0;
            }

            const currentObject = this._getCurrentObject(evt.offsetX, evt.offsetY);
            const isStop = currentObject?.triggerPointerMove(evt);

            this.mouseLeaveEnterHandler(currentObject, evt);

            if (this._checkDirectSceneEventTrigger(!isStop, !currentObject)) {
                if (this._scene.onPointerMove) {
                    this._scene.onPointerMove(evt);
                }

                if (this._scene.onPointerMoveObserver.hasObservers()) {
                    this._scene.onPointerMoveObserver.notifyObservers(evt);
                }
            }
        };

        this._onPointerDown = (evt: IPointerEvent) => {
            // preserve compatibility with Safari when pointerId is not present
            if (evt.pointerId === undefined) {
                (evt as any).pointerId = 0;
            }

            const currentObject = this._getCurrentObject(evt.offsetX, evt.offsetY);

            const isStop = currentObject?.triggerPointerDown(evt);

            if (this._checkDirectSceneEventTrigger(!isStop, !currentObject)) {
                if (this._scene.onPointerDown) {
                    this._scene.onPointerDown(evt);
                }

                if (this._scene.onPointerDownObserver.hasObservers()) {
                    this._scene.onPointerDownObserver.notifyObservers(evt);
                }
            }
        };

        this._onPointerUp = (evt: IPointerEvent) => {
            // preserve compatibility with Safari when pointerId is not present
            if (evt.pointerId === undefined) {
                (evt as any).pointerId = 0;
            }

            const currentObject = this._getCurrentObject(evt.offsetX, evt.offsetY);
            const isStop = currentObject?.triggerPointerUp(evt);

            if (this._checkDirectSceneEventTrigger(!isStop, !currentObject)) {
                if (this._scene.onPointerUp) {
                    this._scene.onPointerUp(evt);
                }

                if (this._scene.onPointerUpObserver.hasObservers()) {
                    this._scene.onPointerUpObserver.notifyObservers(evt);
                }
            }

            this._prePointerDoubleClick(evt);
        };

        this._onMouseWheel = (evt: IWheelEvent) => {
            const currentObject = this._getCurrentObject(evt.offsetX, evt.offsetY);
            const isStop = currentObject?.triggerMouseWheel(evt);

            this._scene.getViewports().forEach((vp) => {
                if (vp.onMouseWheelObserver.hasObservers()) {
                    vp.onMouseWheelObserver.notifyObservers(evt);
                }
            });

            if (this._checkDirectSceneEventTrigger(!isStop, !currentObject)) {
                if (this._scene.onMouseWheel) {
                    this._scene.onMouseWheel(evt);
                }

                if (this._scene.onMouseWheelObserver.hasObservers()) {
                    this._scene.onMouseWheelObserver.notifyObservers(evt);
                }
            }
        };

        this._onKeyDown = (evt: IKeyboardEvent) => {
            if (this._scene.onKeyDownObservable.hasObservers()) {
                this._scene.onKeyDownObservable.notifyObservers(evt);
            }
        };

        this._onKeyUp = (evt: IKeyboardEvent) => {
            if (this._scene.onKeyUpObservable.hasObservers()) {
                this._scene.onKeyUpObservable.notifyObservers(evt);
            }
        };

        this._onInputObserver = engine.onInputChangedObservable.add((eventData: IEvent) => {
            const evt: IEvent = eventData;
            // Keyboard Events
            if (eventData.deviceType === DeviceType.Keyboard) {
                if (eventData.currentState === 1) {
                    this._onKeyDown(evt as IKeyboardEvent);
                }

                if (eventData.currentState === 0) {
                    this._onKeyUp(evt as IKeyboardEvent);
                }
            }

            // Pointer Events
            if (eventData.deviceType === DeviceType.Mouse || eventData.deviceType === DeviceType.Touch) {
                if (hasDown && eventData.inputIndex >= PointerInput.LeftClick && eventData.inputIndex <= PointerInput.RightClick && eventData.currentState === 1) {
                    this._onPointerDown(evt as IPointerEvent);
                }

                if (hasUp && eventData.inputIndex >= PointerInput.LeftClick && eventData.inputIndex <= PointerInput.RightClick && eventData.currentState === 0) {
                    this._onPointerUp(evt as IPointerEvent);
                }

                if (
                    hasMove &&
                    (eventData.inputIndex === PointerInput.Horizontal ||
                        eventData.inputIndex === PointerInput.Vertical ||
                        eventData.inputIndex === PointerInput.DeltaHorizontal ||
                        eventData.inputIndex === PointerInput.DeltaVertical)
                ) {
                    this._onPointerMove(evt as IPointerEvent);
                } else if (
                    hasWheel &&
                    (eventData.inputIndex === PointerInput.MouseWheelX || eventData.inputIndex === PointerInput.MouseWheelY || eventData.inputIndex === PointerInput.MouseWheelZ)
                ) {
                    this._onMouseWheel(evt as IWheelEvent);
                }
            }
        });

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
        engine.onInputChangedObservable.remove(this._onInputObserver);

        this._alreadyAttached = false;
    }

    /**
     * @hidden
     * @returns Boolean if delta for pointer exceeds drag movement threshold
     */
    private _isPointerSwiping(pointerX: number, pointerY: number): boolean {
        return (
            Math.abs(this._startingPosition.x - pointerX) > InputManager.DragMovementThreshold || Math.abs(this._startingPosition.y - pointerY) > InputManager.DragMovementThreshold
        );
    }

    private _prePointerDoubleClick(evt: IPointerEvent) {
        const { clientX, clientY } = evt;

        if (this._doubleClickOccurred === 0) {
            this._startingPosition.x = clientX;
            this._startingPosition.y = clientY;
        }

        this._doubleClickOccurred += 1;

        this._delayedTimeout = window.setTimeout(() => {
            this._resetDoubleClickParam();
        }, InputManager.DoubleClickDelay);

        if (this._doubleClickOccurred < 2) {
            return;
        }

        const isMoveThreshold = this._isPointerSwiping(clientX, clientY);

        if (isMoveThreshold) {
            this._resetDoubleClickParam();
            return;
        }

        this._scene?.pick(Vector2.FromArray([evt.offsetX, evt.offsetY]))?.triggerDblclick(evt);

        if (this._scene.onDblclick) {
            this._scene.onDblclick(evt);
        }

        if (this._scene.onDblclickObserver.hasObservers()) {
            this._scene.onDblclickObserver.notifyObservers(evt);
        }

        this._resetDoubleClickParam();

        console.log('_prePointerDoubleClick', evt);
    }

    private _resetDoubleClickParam() {
        this._doubleClickOccurred = 0;
        this._startingPosition.x = Infinity;
        this._startingPosition.y = Infinity;
        window.clearTimeout(this._delayedTimeout);
    }
}
