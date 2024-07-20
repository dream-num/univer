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

import type { Nullable } from '@univerjs/core';
import { toDisposable, Tools } from '@univerjs/core';

import { Observable, shareReplay, Subject } from 'rxjs';
import type { CURSOR_TYPE } from './basics/const';
import type { IKeyboardEvent, IPointerEvent } from './basics/i-events';
import { DeviceType, PointerInput } from './basics/i-events';
import type { ITimeMetric } from './basics/interfaces';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './basics/interfaces';
import type { IBasicFrameInfo } from './basics/performance-monitor';
import { PerformanceMonitor } from './basics/performance-monitor';
import { getPointerPrefix, getSizeForDom, IsSafari, requestNewFrame } from './basics/tools';
import { Canvas, CanvasRenderMode } from './canvas';
import type { Scene } from './scene';
import { ThinEngine } from './thin-engine';
import { observeClientRect } from './floating/util';

export class Engine extends ThinEngine<Scene> {
    renderEvenInBackground = true;

    private readonly _beginFrame$ = new Subject<number>();
    readonly beginFrame$ = this._beginFrame$.asObservable();

    private readonly _endFrame$ = new Subject<IBasicFrameInfo>();
    readonly endFrame$ = this._endFrame$.asObservable();

    readonly renderFrameTimeMetric$ = new Subject<ITimeMetric>();

    readonly renderFrameTags$ = new Subject<[string, any]>();

    /**
     * time when render start, for elapsedTime
     */
    private _renderStartTime: number = 0;

    private _rect$: Nullable<Observable<void>> = null;

    public get clientRect$(): Observable<void> {
        return this._rect$ || (this._rect$ = new Observable((subscriber) => {
            if (!this._container) {
                throw new Error('[Engine]: cannot subscribe to rect changes when container is not set!');
            }

            const sub = observeClientRect(this._container).subscribe(() => subscriber.next());

            return () => {
                sub.unsubscribe();
                this._rect$ = null;
            };
        })).pipe(shareReplay(1));
    }

    private _container: Nullable<HTMLElement>;

    private _canvas: Nullable<Canvas>;

    private _renderingQueueLaunched = false;

    private _renderFrameTasks = new Array<() => void>();

    private _renderFunction = (_timestamp: number) => { /* empty */ };

    private _requestNewFrameHandler: number = -1;

    /**
     * frameCount
     */
    private _frameId: number = -1;

    private _usingSafari: boolean = IsSafari();

    private _resizeObserver: Nullable<ResizeObserver>;

    // FPS
    private _fps = 60;

    private _deltaTime = 0;

    private _performanceMonitor: PerformanceMonitor;

    private _pointerMoveEvent!: (evt: Event) => void;

    private _pointerDownEvent!: (evt: Event) => void;

    private _pointerUpEvent!: (evt: Event) => void;

    private _pointerOutEvent!: (evt: Event) => void;

    private _pointerCancelEvent!: (evt: Event) => void;

    private _pointerBlurEvent!: (evt: Event) => void;

    private _pointerWheelEvent!: (evt: Event) => void;

    private _pointerEnterEvent!: (evt: Event) => void;

    private _pointerLeaveEvent!: (evt: Event) => void;

    private _dragEnterEvent!: (evt: Event) => void;

    private _dragLeaveEvent!: (evt: Event) => void;

    private _dragOverEvent!: (evt: Event) => void;

    private _dropEvent!: (evt: Event) => void;

    private _remainCapture: number = -1;

    /** previous pointer position */
    private pointer: { [deviceSlot: number]: number } = {};

    private _mouseId = -1;

    private _isUsingFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

    private _previousWidth = -1000;

    private _previousHeight = -1000;

    constructor(elemWidth: number = 1, elemHeight: number = 1, pixelRatio?: number, mode?: CanvasRenderMode) {
        super();
        this._canvas = new Canvas({
            mode,
            width: elemWidth,
            height: elemHeight,
            pixelRatio,
        });
        this._init();
        this._handleKeyboardAction();
        this._handlePointerAction();
        this._handleDragAction();

        if (mode !== CanvasRenderMode.Printing) {
            this._matchMediaHandler();
        }
    }

    _init() {
        this._performanceMonitor = new PerformanceMonitor();
    }

    get elapsedTime(): number {
        return Tools.now() - this._renderStartTime;
    }

    override get width() {
        return this.getCanvas().getWidth();
    }

    override get height() {
        return this.getCanvas().getHeight();
    }

    get requestNewFrameHandler() {
        return this._requestNewFrameHandler;
    }

    /**
     * Gets the current frame id
     */
    get frameId(): number {
        return this._frameId;
    }

    override setCanvasCursor(val: CURSOR_TYPE) {
        const canvasEl = this.getCanvas().getCanvasEle();
        canvasEl.style.cursor = val;
    }

    override clearCanvas() {
        this.getCanvas().clear();
    }

    override getCanvas() {
        return this._canvas!;
    }

    override getCanvasElement() {
        return this.getCanvas().getCanvasEle()!;
    }

    /**
     * To ensure mouse events remain bound to the host element,
     * preventing the events from becoming ineffective once the mouse leaves the host.
     */
    override setRemainCapture() {
        try {
            this.getCanvasElement().setPointerCapture(this._remainCapture);
        } catch {
            console.warn('no capture');
        }
    }

    getPixelRatio() {
        return this.getCanvas().getPixelRatio();
    }

    setContainer(elem: HTMLElement, resize = true) {
        if (this._container === elem) {
            return;
        }

        this._container = elem;
        this._container.appendChild(this.getCanvasElement());

        if (resize) {
            this.resize();

            this._resizeObserver?.unobserve(this._container as HTMLElement);
            this._resizeObserver = null;

            let timer: number | undefined;
            this._resizeObserver = new ResizeObserver(() => {
                if (!timer) {
                    timer = window.requestIdleCallback(() => {
                        this.resize();
                        timer = undefined;
                    });
                }
            });
            this._resizeObserver.observe(this._container);

            this.disposeWithMe(() => {
                this._resizeObserver?.unobserve(this._container as HTMLElement);
                if (timer !== undefined) window.cancelIdleCallback(timer);
            });
        }
    }

    resize() {
        if (!this._container) {
            return;
        }

        const { width, height } = getSizeForDom(this._container);

        if (width === this._previousWidth && height === this._previousHeight) {
            return;
        }

        this._previousWidth = width;

        this._previousHeight = height;

        this.resizeBySize(width, height);
    }

    resizeBySize(width: number, height: number) {
        const preWidth = this.width;
        const preHeight = this.height;
        this.getCanvas().setSize(width, height);
        this.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
            value: {
                width,
                height,
            },
            preValue: {
                width: preWidth,
                height: preHeight,
            },
        });
    }

    override dispose() {
        super.dispose();

        const eventPrefix = getPointerPrefix();
        const canvasEle = this.getCanvasElement();
        canvasEle.removeEventListener(`${eventPrefix}leave`, this._pointerLeaveEvent);
        canvasEle.removeEventListener(`${eventPrefix}enter`, this._pointerEnterEvent);
        canvasEle.removeEventListener(`${eventPrefix}move`, this._pointerMoveEvent);
        canvasEle.removeEventListener(`${eventPrefix}down`, this._pointerDownEvent);
        canvasEle.removeEventListener(`${eventPrefix}up`, this._pointerUpEvent);
        canvasEle.removeEventListener(`${eventPrefix}out`, this._pointerOutEvent);
        canvasEle.removeEventListener(`${eventPrefix}cancel`, this._pointerCancelEvent);
        canvasEle.removeEventListener('blur', this._pointerBlurEvent);
        canvasEle.removeEventListener('dragenter', this._dragEnterEvent);
        canvasEle.removeEventListener('dragleave', this._dragLeaveEvent);
        canvasEle.removeEventListener('dragover', this._dragOverEvent);
        canvasEle.removeEventListener('drop', this._dropEvent);
        canvasEle.removeEventListener(this._getWheelEventName(), this._pointerWheelEvent);

        this._renderFrameTasks = [];
        this._performanceMonitor.dispose();
        this.getCanvas().dispose();

        this.onTransformChange$.complete();
        this._beginFrame$.complete();
        this._endFrame$.complete();

        this._resizeObserver?.disconnect();
        this._container = null;
    }

    addFunction2RenderLoop(renderFunction: () => void): void {
        if (this._renderFrameTasks.indexOf(renderFunction) === -1) {
            this._renderFrameTasks.push(renderFunction);
        }
    }

    startRenderLoop(): void {
        if (!this._renderingQueueLaunched) {
            this._renderStartTime = performance.now();
            this._renderingQueueLaunched = true;
            this._renderFunction = this._renderFunctionCore.bind(this);
            this._requestNewFrameHandler = requestNewFrame(this._renderFunction);
        }
    }

    /**
     * Register and execute a render loop. The engine could manage more than one render function
     * @param renderFunction defines the function to continuously execute
     */
    runRenderLoop(renderFunction: () => void): void {
        this.addFunction2RenderLoop(renderFunction);
        this.startRenderLoop();
    }

    /**
     * stop executing a render loop function and remove it from the execution array
     * @param renderFunction defines the function to be removed. If not provided all functions will be removed.
     */
    stopRenderLoop(renderFunction?: () => void): void {
        if (!renderFunction) {
            this._renderFrameTasks.length = 0;
            this._cancelFrame();
            return;
        }

        const index = this._renderFrameTasks.indexOf(renderFunction);

        if (index >= 0) {
            this._renderFrameTasks.splice(index, 1);
            if (this._renderFrameTasks.length === 0) {
                this._cancelFrame();
            }
        }
    }

    /**
     * Begin a new frame
     */
    _beginFrame(_timestamp: number): void {
        this._frameId++;
        this._beginFrame$.next(this._frameId);
    }

    /**
     * End the current frame
     */
    _endFrame(timestamp: number): void {
        this._performanceMonitor.endFrame(timestamp);
        this._fps = this._performanceMonitor.averageFPS;
        this._deltaTime = this._performanceMonitor.instantaneousFrameTime || 0;
        this._endFrame$.next({
            FPS: this.getFps(),
            frameTime: this.getDeltaTime(),
            elapsedTime: this.elapsedTime,
        } as IBasicFrameInfo);
    }

    /**
     * Gets the current framerate
     * @returns a number representing the framerate
     */
    getFps(): number {
        return this._fps;
    }

    /**
     * Gets the time spent between current and previous frame
     * @returns a number representing the delta time in ms
     */
    getDeltaTime(): number {
        return this._deltaTime;
    }

    /**
     * Exec all function in _renderFrameTasks
     */
    private _renderFrame(_timestamp: number) {
        for (let index = 0; index < this._renderFrameTasks.length; index++) {
            const renderFunction = this._renderFrameTasks[index];
            renderFunction();
        }
    }

    private _cancelFrame() {
        if (this._renderingQueueLaunched && this._requestNewFrameHandler) {
            this._renderingQueueLaunched = false;
            if (typeof window === 'undefined') {
                if (typeof cancelAnimationFrame === 'function') {
                    return cancelAnimationFrame(this._requestNewFrameHandler);
                }
            } else {
                const { cancelAnimationFrame } = this._getHostWindow() || window;
                if (typeof cancelAnimationFrame === 'function') {
                    return cancelAnimationFrame(this._requestNewFrameHandler);
                }
            }
            return clearTimeout(this._requestNewFrameHandler);
        }
    }

    private _getHostWindow(): Nullable<Window> {
        if (typeof window === 'undefined') {
            return null;
        }

        if (this.getCanvasElement().ownerDocument?.defaultView) {
            return this.getCanvasElement().ownerDocument.defaultView;
        }

        return window;
    }

    /**
     * call itself by raf
     * Exec all function in _renderFrameTasks in _renderFrame()
     */
    private _renderFunctionCore(timestamp: number): void {
        let shouldRender = true;
        if (!this.renderEvenInBackground) {
            shouldRender = false;
        }

        if (shouldRender) {
            // Start new frame
            this._beginFrame(timestamp);
            this._renderFrame(timestamp);
            this._endFrame(timestamp);
        }

        if (this._renderFrameTasks.length > 0) {
            this._requestNewFrameHandler = requestNewFrame(this._renderFunction);
        } else {
            this._renderingQueueLaunched = false;
        }
    }

    private _handleKeyboardAction() {
        const keyboardDownEvent = (evt: KeyboardEvent) => {
            const deviceEvent = evt as unknown as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 0;
            deviceEvent.currentState = 1;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const keyboardUpEvent = (evt: KeyboardEvent) => {
            const deviceEvent = evt as unknown as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const canvasEle = this.getCanvasElement();
        canvasEle.addEventListener('keydown', keyboardDownEvent);
        canvasEle.addEventListener('keyup', keyboardUpEvent);
    }

    // eslint-disable-next-line max-lines-per-function
    private _handlePointerAction() {
        const eventPrefix = getPointerPrefix();

        this._pointerMoveEvent = (e: Event) => {
            const evt = e as PointerEvent | MouseEvent;
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            // const previousHorizontal = this.pointer[PointerInput.Horizontal];
            // const previousVertical = this.pointer[PointerInput.Vertical];
            // const previousDeltaHorizontal = this.pointer[PointerInput.DeltaHorizontal];
            // const previousDeltaVertical = this.pointer[PointerInput.DeltaVertical];
            this.pointer[PointerInput.Horizontal] = evt.clientX;
            this.pointer[PointerInput.Vertical] = evt.clientY;
            this.pointer[PointerInput.DeltaHorizontal] = evt.movementX;
            this.pointer[PointerInput.DeltaVertical] = evt.movementY;
            const deviceEvent = evt as unknown as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            deviceEvent.inputIndex = PointerInput.Horizontal;// horizon 0 vertical 1
            this.onInputChanged$.emitEvent(deviceEvent);

            // TODO @lumixraku
            //if (previousHorizontal !== evt.clientX) {
            //    deviceEvent.inputIndex = PointerInput.Horizontal;
            //    deviceEvent.previousState = previousHorizontal;
            //    deviceEvent.currentState = this.pointer[PointerInput.Horizontal];

            //    this.onInputChanged$.emitEvent(deviceEvent);
            //}
            //if (previousVertical !== evt.clientY) {
            //    deviceEvent.inputIndex = PointerInput.Vertical;
            //    deviceEvent.previousState = previousVertical;
            //    deviceEvent.currentState = this.pointer[PointerInput.Vertical];

            //    this.onInputChanged$.emitEvent(deviceEvent);
            //}
            //if (this.pointer[PointerInput.DeltaHorizontal] !== 0) {
            //    deviceEvent.inputIndex = PointerInput.DeltaHorizontal;
            //    deviceEvent.previousState = previousDeltaHorizontal;
            //    deviceEvent.currentState = this.pointer[PointerInput.DeltaHorizontal];

            //    this.onInputChanged$.emitEvent(deviceEvent);
            //}
            //if (this.pointer[PointerInput.DeltaVertical] !== 0) {
            //    deviceEvent.inputIndex = PointerInput.DeltaVertical;
            //    deviceEvent.previousState = previousDeltaVertical;
            //    deviceEvent.currentState = this.pointer[PointerInput.DeltaVertical];

            //    this.onInputChanged$.emitEvent(deviceEvent);
            //}

            // Lets Propagate the event for move with same position.
            if (!this._usingSafari && evt.button !== -1) {
                deviceEvent.inputIndex = evt.button + 2;
                deviceEvent.previousState = this.pointer[evt.button + 2];
                this.pointer[evt.button + 2] = this.pointer[evt.button + 2] ? 0 : 1; // Reverse state of button if evt.button has value
                deviceEvent.currentState = this.pointer[evt.button + 2];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
        };

        this._pointerDownEvent = (nativeEvent: Event) => {
            const evt = nativeEvent as IPointerEvent;
            // TODO: maybe we should wrap the native event to an CustomEvent

            const deviceType = this._getPointerType(evt);
            const previousHorizontal = this.pointer[PointerInput.Horizontal];
            const previousVertical = this.pointer[PointerInput.Vertical];
            const previousButton = this.pointer[evt.button + 2];

            if (deviceType === DeviceType.Mouse) {
                // Mouse; Among supported browsers, value is either 1 or 0 for mouse
                if (this._mouseId === -1) {
                    if (evt.pointerId === undefined) {
                        // If there is no pointerId (eg. manually dispatched MouseEvent)
                        this._mouseId = this._isUsingFirefox ? 0 : 1;
                    } else {
                        this._mouseId = evt.pointerId;
                    }
                }
                if (!document.pointerLockElement) {
                    this._remainCapture = this._mouseId;
                    this.getCanvasElement().setPointerCapture(this._mouseId);
                }
            } else {
                // Touch; Since touches are dynamically assigned, only set capture if we have an id
                if (evt.pointerId && !document.pointerLockElement) {
                    this._remainCapture = evt.pointerId;
                    this.getCanvasElement().setPointerCapture(evt.pointerId);
                }
            }

            this.pointer[PointerInput.Horizontal] = evt.clientX;
            this.pointer[PointerInput.Vertical] = evt.clientY;
            this.pointer[evt.button + 2] = 1;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.pointer[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.pointer[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            // evt.button + 2  ---> leftClick: 2, middleClick: 3, rightClick:4
            deviceEvent.inputIndex = evt.button + 2;
            deviceEvent.previousState = previousButton;
            deviceEvent.currentState = this.pointer[evt.button + 2];
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerUpEvent = (_evt: Event) => {
            const evt = _evt as PointerEvent | MouseEvent;

            const deviceType = this._getPointerType(evt);
            const previousHorizontal = this.pointer[PointerInput.Horizontal];
            const previousVertical = this.pointer[PointerInput.Vertical];
            const previousButton = this.pointer[evt.button + 2];

            this.pointer[PointerInput.Horizontal] = evt.clientX;
            this.pointer[PointerInput.Vertical] = evt.clientY;
            this.pointer[evt.button + 2] = 0;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.pointer[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.pointer[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            deviceEvent.inputIndex = evt.button + 2;
            deviceEvent.previousState = previousButton;
            deviceEvent.currentState = this.pointer[evt.button + 2];

            const canvasEle = this.getCanvasElement();
            if (
                deviceType === DeviceType.Mouse &&
                this._mouseId >= 0 &&
                canvasEle.hasPointerCapture(this._mouseId)
            ) {
                this._remainCapture = this._mouseId;
                canvasEle.releasePointerCapture(this._mouseId);
            } else if (deviceEvent.pointerId && canvasEle.hasPointerCapture(deviceEvent.pointerId)) {
                this._remainCapture = deviceEvent.pointerId;
                canvasEle.releasePointerCapture(deviceEvent.pointerId);
            }

            this.onInputChanged$.emitEvent(deviceEvent);

            // We don't want to unregister the mouse because we may miss input data when a mouse is moving after a click
            if (deviceType !== DeviceType.Mouse) {
                this.pointer = {};
            }
        };

        this._pointerEnterEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 2;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerLeaveEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 3;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerOutEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            deviceEvent.currentState = 3;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerCancelEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 3;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerBlurEvent = () => {
            if (this._mouseId >= 0 && this.getCanvasElement().hasPointerCapture(this._mouseId)) {
                // NOTE: @wzhudev comment so the canvas could keep capturing pointer events.
                // May lead to unknown problems.
                // this.getCanvasElement().releasePointerCapture(this._mouseId);
                // this._remainCapture = this._mouseId;
                // this._mouseId = -1;
            }

            this.pointer = {};
        };

        this._pointerWheelEvent = (evt: any) => {
            const deviceType = DeviceType.Mouse;
            // Store previous values for event
            const previousWheelScrollX = this.pointer[PointerInput.MouseWheelX];
            const previousWheelScrollY = this.pointer[PointerInput.MouseWheelY];
            const previousWheelScrollZ = this.pointer[PointerInput.MouseWheelZ];

            this.pointer[PointerInput.MouseWheelX] = evt.deltaX || 0;
            this.pointer[PointerInput.MouseWheelY] = evt.deltaY || evt.wheelDelta || 0;
            this.pointer[PointerInput.MouseWheelZ] = evt.deltaZ || 0;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (this.pointer[PointerInput.MouseWheelX] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelX;
                deviceEvent.previousState = previousWheelScrollX;
                deviceEvent.currentState = this.pointer[PointerInput.MouseWheelX];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this.pointer[PointerInput.MouseWheelY] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelY;
                deviceEvent.previousState = previousWheelScrollY;
                deviceEvent.currentState = this.pointer[PointerInput.MouseWheelY];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this.pointer[PointerInput.MouseWheelZ] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelZ;
                deviceEvent.previousState = previousWheelScrollZ;
                deviceEvent.currentState = this.pointer[PointerInput.MouseWheelZ];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
        };

        const canvasEle = this.getCanvasElement();
        canvasEle.addEventListener(`${eventPrefix}enter`, this._pointerEnterEvent);
        canvasEle.addEventListener(`${eventPrefix}leave`, this._pointerLeaveEvent);
        canvasEle.addEventListener(`${eventPrefix}move`, this._pointerMoveEvent);
        canvasEle.addEventListener(`${eventPrefix}down`, this._pointerDownEvent);
        canvasEle.addEventListener(`${eventPrefix}up`, this._pointerUpEvent);
        canvasEle.addEventListener(`${eventPrefix}out`, this._pointerOutEvent);
        canvasEle.addEventListener(`${eventPrefix}cancel`, this._pointerCancelEvent);
        canvasEle.addEventListener('blur', this._pointerBlurEvent);
        canvasEle.addEventListener(
            this._getWheelEventName(),
            this._pointerWheelEvent,
            this._getPassive() ? { passive: false } : false
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _handleDragAction() {
        this._dragEnterEvent = (evt: any) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 4;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._dragLeaveEvent = (evt: any) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 5;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._dragOverEvent = (evt: any) => {
            // prevent default to allow drop
            evt.preventDefault();

            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const previousHorizontal = this.pointer[PointerInput.Horizontal];
            const previousVertical = this.pointer[PointerInput.Vertical];
            const previousDeltaHorizontal = this.pointer[PointerInput.DeltaHorizontal];
            const previousDeltaVertical = this.pointer[PointerInput.DeltaVertical];

            this.pointer[PointerInput.Horizontal] = evt.clientX;
            this.pointer[PointerInput.Vertical] = evt.clientY;
            this.pointer[PointerInput.DeltaHorizontal] = evt.movementX;
            this.pointer[PointerInput.DeltaVertical] = evt.movementY;
            // console.log('pointerMoveEvent_1', previousHorizontal, evt.clientX, previousVertical, evt.clientY, this._pointer);
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.pointer[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.pointer[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this.pointer[PointerInput.DeltaHorizontal] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaHorizontal;
                deviceEvent.previousState = previousDeltaHorizontal;
                deviceEvent.currentState = this.pointer[PointerInput.DeltaHorizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this.pointer[PointerInput.DeltaVertical] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaVertical;
                deviceEvent.previousState = previousDeltaVertical;
                deviceEvent.currentState = this.pointer[PointerInput.DeltaVertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            // Lets Propagate the event for move with same position.
            if (!this._usingSafari && evt.button !== -1) {
                deviceEvent.inputIndex = evt.button + 2;
                deviceEvent.previousState = this.pointer[evt.button + 2];
                this.pointer[evt.button + 2] = this.pointer[evt.button + 2] ? 0 : 1; // Reverse state of button if evt.button has value
                deviceEvent.currentState = this.pointer[evt.button + 2];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
        };

        this._dropEvent = (evt: any) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            deviceEvent.currentState = 6;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const canvasEle = this.getCanvasElement();
        canvasEle.addEventListener('dragenter', this._dragEnterEvent);
        canvasEle.addEventListener('dragleave', this._dragLeaveEvent);
        canvasEle.addEventListener('dragover', this._dragOverEvent);
        canvasEle.addEventListener('drop', this._dropEvent);
    }

    private _getWheelEventName(): string {
        const wheelEventName =
            'onwheel' in document.createElement('div')
                ? 'wheel' // Modern browsers support "wheel"
                : (document as any).onmousewheel !== undefined
                    ? 'mousewheel' // Webkit and IE support at least "mousewheel"
                    : 'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
        return wheelEventName;
    }

    private _getPassive(): boolean {
        // Code originally in scene.inputManager.ts
        // Chrome reports warning in console if wheel listener doesn't set an explicit passive option.
        // IE11 only supports captureEvent:boolean, not options:object, and it defaults to false.
        // Feature detection technique copied from: https://github.com/github/eventlistener-polyfill (MIT license)
        let passiveSupported = false;
        const noop = () => { /* empty */ };

        try {
            const options: object = {
                passive: {
                    get() {
                        passiveSupported = true;
                    },
                },
            };

            const canvasEle = this.getCanvasElement();
            canvasEle.addEventListener('test', noop, options);
            canvasEle.removeEventListener('test', noop, options);
        } catch (e) {
            /* */
        }

        return passiveSupported;
    }

    private _getPointerType(evt: any): DeviceType {
        let deviceType = DeviceType.Mouse;

        if (evt.pointerType === 'touch' || evt.pointerType === 'pen' || evt.touches) {
            deviceType = DeviceType.Touch;
        }

        return deviceType;
    }

    private _matchMediaHandler() {
        if (!window?.matchMedia) {
            return;
        }

        const mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);

        const _handleMediaChange = () => {
            this.resize();
        };

        mediaQueryList.addEventListener('change', _handleMediaChange);

        this.disposeWithMe(
            toDisposable(() => {
                mediaQueryList.removeEventListener('change', _handleMediaChange);
            })
        );
    }
}
