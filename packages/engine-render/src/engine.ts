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

import type { IDisposable, Nullable } from '@univerjs/core';

import type { CURSOR_TYPE } from './basics/const';
import type { IEvent, IKeyboardEvent, IPointerEvent } from './basics/i-events';
import type { ITimeMetric, ITransformChangeState } from './basics/interfaces';
import type { IBasicFrameInfo } from './basics/performance-monitor';
import type { Scene } from './scene';
import { Disposable, EventSubject, toDisposable, Tools } from '@univerjs/core';
import { Observable, shareReplay, Subject } from 'rxjs';
import { RENDER_CLASS_TYPE } from './basics/const';
import { DeviceType, PointerInput } from './basics/i-events';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './basics/interfaces';
import { PerformanceMonitor } from './basics/performance-monitor';
import { getPointerPrefix, getSizeForDom, IsSafari, requestNewFrame } from './basics/tools';
import { Canvas, CanvasRenderMode } from './canvas';
import { observeClientRect } from './floating/util';
import { ICanvasColorService } from './services/canvas-color.service';

export interface IEngineOption {
    elementWidth: number;
    elementHeight: number;
    dpr?: number;
    renderMode?: CanvasRenderMode;
}

export class Engine extends Disposable {
    renderEvenInBackground = true;

    private readonly _beginFrame$ = new Subject<number>();
    readonly beginFrame$ = this._beginFrame$.asObservable();

    private readonly _endFrame$ = new Subject<IBasicFrameInfo>();
    readonly endFrame$ = this._endFrame$.asObservable();

    readonly renderFrameTimeMetric$ = new Subject<ITimeMetric>();
    readonly renderFrameTags$ = new Subject<[string, any]>();

    /**
     * Pass event to scene.input-manager
     */
    readonly onInputChanged$ = new EventSubject<IEvent>();
    readonly onTransformChange$ = new EventSubject<ITransformChangeState>();

    private _scenes: { [sceneKey: string]: Scene } = {};

    private _activeScene: Scene | null = null;

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
    private _requestNewFrameHandler: number = -1;

    private _frameId: number = -1;

    private _usingSafari: boolean = IsSafari();

    private _resizeObserver: Nullable<ResizeObserver>;

    // FPS
    private _fps = 60;
    private _deltaTime = 0;
    private _performanceMonitor: PerformanceMonitor;

    private _pointerClickEvent!: (evt: Event) => void;
    private _pointerDblClickEvent!: (evt: Event) => void;
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
    private _pointerPosRecord: { [deviceSlot: number]: number } = {};

    private _mouseId = -1;

    private _isUsingFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

    private _previousWidth = -1000;

    private _previousHeight = -1000;

    private _unitId: string = ''; // unitId

    get unitId(): string {
        return this._unitId;
    }

    get elapsedTime(): number {
        return Tools.now() - this._renderStartTime;
    }

    get width() {
        return this.getCanvas().getWidth();
    }

    get height() {
        return this.getCanvas().getHeight();
    }

    get classType() {
        return RENDER_CLASS_TYPE.ENGINE;
    }

    get activeScene() {
        return this._activeScene;
    }

    constructor(
        unitId?: string,
        _options?: IEngineOption,
        @ICanvasColorService readonly canvasColorService?: ICanvasColorService
    ) {
        super();

        this._unitId = unitId ?? '';

        const options = Object.assign({}, {
            elementHeight: 1,
            elementWidth: 1,
            renderMode: CanvasRenderMode.Rendering,
            dpr: 1,
        }, _options);

        this._canvas = new Canvas({
            mode: options.renderMode,
            width: options.elementWidth,
            height: options.elementHeight,
            pixelRatio: options.dpr,
            colorService: this.canvasColorService,
        });

        this._performanceMonitor = new PerformanceMonitor();

        this._handleKeyboardAction();
        this._handlePointerAction();
        this._handleDragAction();

        if (options.renderMode !== CanvasRenderMode.Printing) {
            this._matchMediaHandler();
        }
    }

    getScenes() {
        return this._scenes;
    }

    getScene(sceneKey: string): Scene | null {
        return this._scenes[sceneKey];
    }

    hasScene(sceneKey: string): boolean {
        return sceneKey in this._scenes;
    }

    addScene(sceneInstance: Scene): Scene {
        const sceneKey = sceneInstance.sceneKey;
        if (this.hasScene(sceneKey)) {
            console.warn('Scenes has same key, it will be covered');
        }
        this._scenes[sceneKey] = sceneInstance;
        return sceneInstance;
    }

    setActiveScene(sceneKey: string): Scene | null {
        const scene = this.getScene(sceneKey);
        if (scene) {
            this._activeScene = scene;
        }
        return scene;
    }

    hasActiveScene(): boolean {
        return this._activeScene != null;
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

    setCanvasCursor(val: CURSOR_TYPE) {
        const canvasEl = this.getCanvas().getCanvasEle();
        canvasEl.style.cursor = val;
    }

    clearCanvas() {
        this.getCanvas().clear();
    }

    getCanvas() {
        return this._canvas!;
    }

    getCanvasElement() {
        return this.getCanvas().getCanvasEle()!;
    }

    /**
     * To ensure mouse events remain bound to the host element,
     * preventing the events from becoming ineffective once the mouse leaves the host.
     */
    setCapture() {
        try {
            this.getCanvasElement().setPointerCapture(this._remainCapture);
        } catch {
            console.warn('no capture');
        }
    }

    getPixelRatio() {
        return this.getCanvas().getPixelRatio();
    }

    private _resizeListenerDisposable: IDisposable | undefined;

    /**
     * Mount the canvas to the element so it would be rendered on UI.
     * @param {HTMLElement} element - The element the canvas will mount on.
     * @param {true} [resize] If should perform resize when mounted and observe resize event.
     */
    mount(element: HTMLElement, resize = true): void {
        this.setContainer(element, resize);
    }

    /**
     * Unmount the canvas without disposing it so it can be mounted again.
     */
    unmount(): void {
        this._clearResizeListener();

        if (!this._container) {
            throw new Error('[Engine]: cannot unmount when container is not set!');
        }

        this._container.removeChild(this.getCanvasElement());
        this._container = null;
    }

    /**
     * Mount the canvas to the element so it would be rendered on UI.
     * @deprecated Please use `mount` instead.
     * @param {HTMLElement} element - The element the canvas will mount on.
     * @param {true} [resize] If should perform resize when mounted and observe resize event.
     */
    setContainer(element: HTMLElement, resize = true) {
        if (this._container === element) {
            return;
        }

        this._container = element;
        this._container.appendChild(this.getCanvasElement());

        this._clearResizeListener();

        if (resize) {
            this.resize();

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

            this._resizeListenerDisposable = toDisposable(() => {
                this._resizeObserver!.unobserve(this._container as HTMLElement);
                if (timer !== undefined) window.cancelIdleCallback(timer);
            });
        }
    }

    private _clearResizeListener(): void {
        this._resizeListenerDisposable?.dispose();
        this._resizeListenerDisposable = undefined;
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

    dprChange() {
        const width = this._previousWidth;
        const height = this._previousHeight;
        this.resizeBySize(width, height);
    }

    /**
     * set canvas element size
     * @param width
     * @param height
     */
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

        const scenes = { ...this.getScenes() };
        const sceneKeys = Object.keys(scenes);
        sceneKeys.forEach((key) => {
            (scenes[key] as IDisposable).dispose();
        });
        this._scenes = {};

        const eventPrefix = getPointerPrefix();
        const canvasEle = this.getCanvasElement();
        canvasEle.removeEventListener('click', this._pointerClickEvent);
        canvasEle.removeEventListener('dblclick', this._pointerDblClickEvent);
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

        this._resizeObserver?.disconnect();

        this.onTransformChange$.complete();
        this._beginFrame$.complete();
        this._endFrame$.complete();
        this.renderFrameTags$.complete();
        this.renderFrameTimeMetric$.complete();

        this._clearResizeListener();
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
            // this._renderFunction = this._renderFunctionCore.bind(this);
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
     * call itself by raf
     * Exec all function in _renderFrameTasks in _renderFrame()
     */
    private _renderFunction = (timestamp: number) => {
        let shouldRender = true;
        if (!this.renderEvenInBackground) {
            shouldRender = false;
        }

        if (shouldRender) {
            // Start new frame
            this._beginFrame(timestamp);
            // exec functions in _renderFrameTasks
            this._renderFrame(timestamp);
            this._endFrame(timestamp);
        }

        if (this._renderFrameTasks.length > 0) {
            this._requestNewFrameHandler = requestNewFrame(this._renderFunction);
        } else {
            this._renderingQueueLaunched = false;
        }
    };

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

    private _handleKeyboardAction() {
        const keyboardDownEvent = (evt: KeyboardEvent) => {
            const deviceEvent = evt as unknown as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const keyboardUpEvent = (evt: KeyboardEvent) => {
            const deviceEvent = evt as unknown as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const canvasEle = this.getCanvasElement();
        canvasEle.addEventListener('keydown', keyboardDownEvent);
        canvasEle.addEventListener('keyup', keyboardUpEvent);
    }

    // eslint-disable-next-line max-lines-per-function
    private _handlePointerAction() {
        const eventPrefix = getPointerPrefix();

        this._pointerClickEvent = (e: Event) => {
            const deviceType = this._getPointerType(e);
            const deviceEvent = e as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerDblClickEvent = (e: Event) => {
            const deviceType = this._getPointerType(e);
            const deviceEvent = e as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerMoveEvent = (e: Event) => {
            const evt = e as PointerEvent | MouseEvent;
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            // const previousHorizontal = this.pointer[PointerInput.Horizontal];
            // const previousVertical = this.pointer[PointerInput.Vertical];
            // const previousDeltaHorizontal = this.pointer[PointerInput.DeltaHorizontal];
            // const previousDeltaVertical = this.pointer[PointerInput.DeltaVertical];
            this._pointerPosRecord[PointerInput.Horizontal] = evt.clientX;
            this._pointerPosRecord[PointerInput.Vertical] = evt.clientY;
            this._pointerPosRecord[PointerInput.DeltaHorizontal] = evt.movementX;
            this._pointerPosRecord[PointerInput.DeltaVertical] = evt.movementY;
            const deviceEvent = evt as unknown as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            deviceEvent.inputIndex = PointerInput.Horizontal;// horizon 0 vertical 1
            this.onInputChanged$.emitEvent(deviceEvent);

            // Lets Propagate the event for move with same position.
            // evt.button is readonly and value is 0 1 2 3 4, it never be -1.
            //if (!this._usingSafari && evt.button !== -1) {

            if (!this._usingSafari) {
                deviceEvent.inputIndex = evt.button + 2;
                // deviceEvent.previousState = this._pointerPosRecord[evt.button + 2];

                // Reverse state of button if evt.button has value // WHY?
                // this._pointerPosRecord[evt.button + 2] = this._pointerPosRecord[evt.button + 2] ? 0 : 1;

                // deviceEvent.currentState = this._pointerPosRecord[evt.button + 2];
                this.onInputChanged$.emitEvent(deviceEvent);
            }
        };

        this._pointerDownEvent = (nativeEvent: Event) => {
            const evt = nativeEvent as IPointerEvent;
            // TODO: maybe we should wrap the native event to an CustomEvent

            const deviceType = this._getPointerType(evt);
            const previousHorizontal = this._pointerPosRecord[PointerInput.Horizontal];
            const previousVertical = this._pointerPosRecord[PointerInput.Vertical];

            // why ???
            // const previousButton = this._pointerPosRecord[evt.button + 2];

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
                }
            } else {
                // Touch; Since touches are dynamically assigned, only set capture if we have an id
                if (evt.pointerId && !document.pointerLockElement) {
                    this._remainCapture = evt.pointerId;
                }
            }

            this._pointerPosRecord[PointerInput.Horizontal] = evt.clientX;
            this._pointerPosRecord[PointerInput.Vertical] = evt.clientY;
            // why??
            // this._pointerPosRecord[evt.button + 2] = 1;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                // deviceEvent.previousState = previousHorizontal;
                // deviceEvent.currentState = this._pointerPosRecord[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                // deviceEvent.previousState = previousVertical;
                // deviceEvent.currentState = this._pointerPosRecord[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            // evt.button + 2  ---> leftClick: 2, middleClick: 3, rightClick:4
            deviceEvent.inputIndex = evt.button + 2;
            // deviceEvent.previousState = previousButton;
            // deviceEvent.currentState = this._pointerPosRecord[evt.button + 2];
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerUpEvent = (_evt: Event) => {
            const evt = _evt as PointerEvent | MouseEvent;

            const deviceType = this._getPointerType(evt);
            const previousHorizontal = this._pointerPosRecord[PointerInput.Horizontal];
            const previousVertical = this._pointerPosRecord[PointerInput.Vertical];

            // why?
            // const previousButton = this._pointerPosRecord[evt.button + 2];

            this._pointerPosRecord[PointerInput.Horizontal] = evt.clientX;
            this._pointerPosRecord[PointerInput.Vertical] = evt.clientY;

            // why??
            // this._pointerPosRecord[evt.button + 2] = 0;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                // deviceEvent.previousState = previousHorizontal;
                // deviceEvent.currentState = this._pointerPosRecord[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                // deviceEvent.previousState = previousVertical;
                // deviceEvent.currentState = this._pointerPosRecord[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            deviceEvent.inputIndex = evt.button + 2;
            // deviceEvent.previousState = previousButton;
            // deviceEvent.currentState = this._pointerPosRecord[evt.button + 2];

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
                this._pointerPosRecord = {};
            }
        };

        this._pointerEnterEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            // deviceEvent.currentState = 2;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerLeaveEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            // deviceEvent.currentState = 3;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerOutEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;
            // deviceEvent.currentState = 3;

            this.onInputChanged$.emitEvent(deviceEvent);
        };

        this._pointerCancelEvent = (evt: Event) => {
            const deviceType = this._getPointerType(evt);
            // Store previous values for event
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            // deviceEvent.currentState = 3;

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

            this._pointerPosRecord = {};
        };

        this._pointerWheelEvent = (evt: any) => {
            const deviceType = DeviceType.Mouse;
            // Store previous values for event
            // const previousWheelScrollX = this._pointerPosRecord[PointerInput.MouseWheelX];
            // const previousWheelScrollY = this._pointerPosRecord[PointerInput.MouseWheelY];
            // const previousWheelScrollZ = this._pointerPosRecord[PointerInput.MouseWheelZ];

            this._pointerPosRecord[PointerInput.MouseWheelX] = evt.deltaX || 0;
            this._pointerPosRecord[PointerInput.MouseWheelY] = evt.deltaY || evt.wheelDelta || 0;
            this._pointerPosRecord[PointerInput.MouseWheelZ] = evt.deltaZ || 0;

            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (this._pointerPosRecord[PointerInput.MouseWheelX] !== 0) {
                // deviceEvent.inputIndex = PointerInput.MouseWheelX;
                // deviceEvent.previousState = previousWheelScrollX;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.MouseWheelX];
                // this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this._pointerPosRecord[PointerInput.MouseWheelY] !== 0) {
                // deviceEvent.inputIndex = PointerInput.MouseWheelY;
                // deviceEvent.previousState = previousWheelScrollY;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.MouseWheelY];
                // this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this._pointerPosRecord[PointerInput.MouseWheelZ] !== 0) {
                // deviceEvent.inputIndex = PointerInput.MouseWheelZ;
                // deviceEvent.previousState = previousWheelScrollZ;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.MouseWheelZ];
                // this.onInputChanged$.emitEvent(deviceEvent);
            }
            this.onInputChanged$.emitEvent(deviceEvent);
        };

        const canvasEle = this.getCanvasElement();
        canvasEle.addEventListener('click', this._pointerClickEvent);
        canvasEle.addEventListener('dblclick', this._pointerDblClickEvent);
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
            const previousHorizontal = this._pointerPosRecord[PointerInput.Horizontal];
            const previousVertical = this._pointerPosRecord[PointerInput.Vertical];
            // const previousDeltaHorizontal = this._pointerPosRecord[PointerInput.DeltaHorizontal];
            // const previousDeltaVertical = this._pointerPosRecord[PointerInput.DeltaVertical];

            this._pointerPosRecord[PointerInput.Horizontal] = evt.clientX;
            this._pointerPosRecord[PointerInput.Vertical] = evt.clientY;
            this._pointerPosRecord[PointerInput.DeltaHorizontal] = evt.movementX;
            this._pointerPosRecord[PointerInput.DeltaVertical] = evt.movementY;
            const deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                // deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.Horizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                // deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.Vertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this._pointerPosRecord[PointerInput.DeltaHorizontal] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaHorizontal;
                // deviceEvent.previousState = previousDeltaHorizontal;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.DeltaHorizontal];

                this.onInputChanged$.emitEvent(deviceEvent);
            }
            if (this._pointerPosRecord[PointerInput.DeltaVertical] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaVertical;
                // deviceEvent.previousState = previousDeltaVertical;
                deviceEvent.currentState = this._pointerPosRecord[PointerInput.DeltaVertical];

                this.onInputChanged$.emitEvent(deviceEvent);
            }

            // Lets Propagate the event for move with same position.
            // -1 ??? evt.button varies from 0 to 4
            // if (!this._usingSafari && evt.button !== -1) {

            if (!this._usingSafari) {
                deviceEvent.inputIndex = evt.button + 2;
                // deviceEvent.previousState = this._pointerPosRecord[evt.button + 2];

                // Reverse state of button if evt.button has value.  // WHY ?? why reverse value?
                // this._pointerPosRecord[evt.button + 2] = this._pointerPosRecord[evt.button + 2] ? 0 : 1;
                deviceEvent.currentState = this._pointerPosRecord[evt.button + 2];
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
            this.dprChange();
        };

        mediaQueryList.addEventListener('change', _handleMediaChange);

        this.disposeWithMe(
            toDisposable(() => {
                mediaQueryList.removeEventListener('change', _handleMediaChange);
            })
        );
    }
}
