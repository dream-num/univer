import { Observable } from '@univer/core';
import { DeviceType, IEvent, IKeyboardEvent, IPointerEvent, PointerInput } from './Base/IEvents';

import { getPointerPrefix, IsSafari, requestNewFrame } from './Base/Tools';

import { ITransformChangeState, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './Base/Interfaces';

import { PerformanceMonitor } from './Base/PerformanceMonitor';

import { Canvas } from './Canvas';

import { Scene } from './Scene';
import { RENDER_CLASS_TYPE } from './Base/Const';

export class Engine {
    private _container: HTMLElement;

    private _canvas: Canvas = new Canvas();

    private _canvasEle: HTMLCanvasElement;

    private _scenes: { [sceneKey: string]: Scene } = {};

    private _activeScene: Scene | null = null;

    private _renderingQueueLaunched = false;

    private _activeRenderLoops = new Array<() => void>();

    onInputChangedObservable = new Observable<IEvent>();

    renderEvenInBackground = true;

    private _renderFunction: any;

    private _requestNewFrameHandler: number;

    private _frameId: number;

    private _usingSafari: boolean = IsSafari();

    // FPS
    private _fps = 60;

    private _deltaTime = 0;

    private _performanceMonitor = new PerformanceMonitor();

    /**
     * Observable raised when the engine begins a new frame
     */
    onBeginFrameObservable = new Observable<Engine>();

    /**
     * Observable raised when the engine ends the current frame
     */
    onEndFrameObservable = new Observable<Engine>();

    onTransformChangeObservable = new Observable<ITransformChangeState>();

    constructor(elemWidth: number = 100, elemHeight: number = 100) {
        this._canvasEle = this._canvas.getCanvasEle();
        this._canvas.setSize(elemWidth, elemHeight);
        this._handleKeyboardAction();
        this._handlePointerAction();
    }

    get width() {
        return this._canvas.getWidth();
    }

    get height() {
        return this._canvas.getHeight();
    }

    get classType() {
        return RENDER_CLASS_TYPE.ENGINE;
    }

    getCanvas() {
        return this._canvas;
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
            console.warn('Scenes has similar key, it will be covered');
        }
        // const newScene = new Scene(this);
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
        return !!this._activeScene;
    }

    get activeScene() {
        return this._activeScene;
    }

    setContainer(elem: HTMLElement) {
        this._container = elem;
        this._container.appendChild(this._canvasEle);
        this.resize();
    }

    resize() {
        if (!this._container) {
            return;
        }

        const { offsetWidth, offsetHeight } = this._container;
        this.resizeBySize(offsetWidth, offsetHeight);
    }

    resizeBySize(width: number, height: number) {
        this._canvas.setSize(width, height);
        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
            value: {
                x: width,
                y: height,
            },
        });
    }

    /**
     * Register and execute a render loop. The engine can have more than one render function
     * @param renderFunction defines the function to continuously execute
     */
    runRenderLoop(renderFunction: () => void): void {
        if (this._activeRenderLoops.indexOf(renderFunction) !== -1) {
            return;
        }

        this._activeRenderLoops.push(renderFunction);

        if (!this._renderingQueueLaunched) {
            this._renderingQueueLaunched = true;
            this._renderFunction = this._renderLoop.bind(this);
            this._requestNewFrameHandler = requestNewFrame(this._renderFunction);
        }
    }

    get requestNewFrameHandler() {
        return this._requestNewFrameHandler;
    }

    /** @hidden */
    private _renderLoop(): void {
        let shouldRender = true;
        if (!this.renderEvenInBackground) {
            shouldRender = false;
        }

        if (shouldRender) {
            // Start new frame
            this.beginFrame();
            this._renderFrame();
            // Present
            this.endFrame();
        }

        if (this._activeRenderLoops.length > 0) {
            this._requestNewFrameHandler = requestNewFrame(this._renderFunction);
        } else {
            this._renderingQueueLaunched = false;
        }
    }

    /**
     * Begin a new frame
     */
    beginFrame(): void {
        this._measureFps();
        this.onBeginFrameObservable.notifyObservers(this);
    }

    /**
     * End the current frame
     */
    endFrame(): void {
        this._frameId++;
        this.onEndFrameObservable.notifyObservers(this);
    }

    // FPS

    /**
     * Gets the current framerate
     * @returns a number representing the framerate
     */
    getFps(): number {
        return this._fps;
    }

    /**
     * Gets the current frame id
     */
    get frameId(): number {
        return this._frameId;
    }

    /**
     * Gets the time spent between current and previous frame
     * @returns a number representing the delta time in ms
     */
    getDeltaTime(): number {
        return this._deltaTime;
    }

    private _measureFps(): void {
        this._performanceMonitor.sampleFrame();
        this._fps = this._performanceMonitor.averageFPS;
        this._deltaTime = this._performanceMonitor.instantaneousFrameTime || 0;
    }

    _renderFrame() {
        for (let index = 0; index < this._activeRenderLoops.length; index++) {
            let renderFunction = this._activeRenderLoops[index];

            renderFunction();
        }
    }

    private _handleKeyboardAction() {
        const keyboardDownEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 0;
            deviceEvent.currentState = 1;

            this.onInputChangedObservable.notifyObservers(deviceEvent);
        };

        const keyboardUpEvent = (evt: any) => {
            let deviceEvent = evt as IKeyboardEvent;
            deviceEvent.deviceType = DeviceType.Keyboard;
            deviceEvent.inputIndex = evt.keyCode;
            deviceEvent.previousState = 1;
            deviceEvent.currentState = 0;

            this.onInputChangedObservable.notifyObservers(deviceEvent);
        };

        this._canvasEle.addEventListener('keydown', keyboardDownEvent);
        this._canvasEle.addEventListener('keyup', keyboardUpEvent);
    }

    private __pointer: { [deviceSlot: number]: number } = {};

    private __mouseId = -1;

    private __isUsingFirefox = navigator.userAgent.indexOf('Firefox') !== -1;

    private _handlePointerAction() {
        const eventPrefix = getPointerPrefix();

        const pointerMoveEvent = (evt: any) => {
            const deviceType = this.__getPointerType(evt);
            // Store previous values for event
            const previousHorizontal = this.__pointer[PointerInput.Horizontal];
            const previousVertical = this.__pointer[PointerInput.Vertical];
            const previousDeltaHorizontal = this.__pointer[PointerInput.DeltaHorizontal];
            const previousDeltaVertical = this.__pointer[PointerInput.DeltaVertical];

            this.__pointer[PointerInput.Horizontal] = evt.clientX;
            this.__pointer[PointerInput.Vertical] = evt.clientY;
            this.__pointer[PointerInput.DeltaHorizontal] = evt.movementX;
            this.__pointer[PointerInput.DeltaVertical] = evt.movementY;
            // console.log('pointerMoveEvent_1', previousHorizontal, evt.clientX, previousVertical, evt.clientY, this.__pointer);
            let deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.__pointer[PointerInput.Horizontal];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.__pointer[PointerInput.Vertical];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (this.__pointer[PointerInput.DeltaHorizontal] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaHorizontal;
                deviceEvent.previousState = previousDeltaHorizontal;
                deviceEvent.currentState = this.__pointer[PointerInput.DeltaHorizontal];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (this.__pointer[PointerInput.DeltaVertical] !== 0) {
                deviceEvent.inputIndex = PointerInput.DeltaVertical;
                deviceEvent.previousState = previousDeltaVertical;
                deviceEvent.currentState = this.__pointer[PointerInput.DeltaVertical];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }

            // Lets Propagate the event for move with same position.
            if (!this._usingSafari && evt.button !== -1) {
                deviceEvent.inputIndex = evt.button + 2;
                deviceEvent.previousState = this.__pointer[evt.button + 2];
                this.__pointer[evt.button + 2] = this.__pointer[evt.button + 2] ? 0 : 1; // Reverse state of button if evt.button has value
                deviceEvent.currentState = this.__pointer[evt.button + 2];
                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
        };

        const pointerDownEvent = (evt: any) => {
            const deviceType = this.__getPointerType(evt);
            const previousHorizontal = this.__pointer[PointerInput.Horizontal];
            const previousVertical = this.__pointer[PointerInput.Vertical];
            const previousButton = this.__pointer[evt.button + 2];
            // console.log('pointerDownEvent_1', previousHorizontal, evt.clientX, previousVertical, evt.clientY, this.__pointer);

            if (deviceType === DeviceType.Mouse) {
                // Mouse; Among supported browsers, value is either 1 or 0 for mouse
                if (this.__mouseId === -1) {
                    if (evt.pointerId === undefined) {
                        // If there is no pointerId (eg. manually dispatched MouseEvent)
                        this.__mouseId = this.__isUsingFirefox ? 0 : 1;
                    } else {
                        this.__mouseId = evt.pointerId;
                    }
                }
                if (!document.pointerLockElement) {
                    this._canvasEle.setPointerCapture(this.__mouseId);
                }
            } else {
                // Touch; Since touches are dynamically assigned, only set capture if we have an id
                if (evt.pointerId && !document.pointerLockElement) {
                    this._canvasEle.setPointerCapture(evt.pointerId);
                }
            }

            this.__pointer[PointerInput.Horizontal] = evt.clientX;
            this.__pointer[PointerInput.Vertical] = evt.clientY;
            this.__pointer[evt.button + 2] = 1;

            let deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.__pointer[PointerInput.Horizontal];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
                console.log('pointerDownEvent_clientX');
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.__pointer[PointerInput.Vertical];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
                console.log('pointerDownEvent_clientY');
            }

            deviceEvent.inputIndex = evt.button + 2;
            deviceEvent.previousState = previousButton;
            deviceEvent.currentState = this.__pointer[evt.button + 2];
            this.onInputChangedObservable.notifyObservers(deviceEvent);
            console.log('pointerDownEvent_2', previousHorizontal, evt.clientX, previousVertical, evt.clientY, this.__pointer);
        };

        const pointerUpEvent = (evt: any) => {
            const deviceType = this.__getPointerType(evt);
            const previousHorizontal = this.__pointer[PointerInput.Horizontal];
            const previousVertical = this.__pointer[PointerInput.Vertical];
            const previousButton = this.__pointer[evt.button + 2];

            this.__pointer[PointerInput.Horizontal] = evt.clientX;
            this.__pointer[PointerInput.Vertical] = evt.clientY;
            this.__pointer[evt.button + 2] = 0;

            let deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (previousHorizontal !== evt.clientX) {
                deviceEvent.inputIndex = PointerInput.Horizontal;
                deviceEvent.previousState = previousHorizontal;
                deviceEvent.currentState = this.__pointer[PointerInput.Horizontal];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (previousVertical !== evt.clientY) {
                deviceEvent.inputIndex = PointerInput.Vertical;
                deviceEvent.previousState = previousVertical;
                deviceEvent.currentState = this.__pointer[PointerInput.Vertical];

                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }

            deviceEvent.inputIndex = evt.button + 2;
            deviceEvent.previousState = previousButton;
            deviceEvent.currentState = this.__pointer[evt.button + 2];

            if (deviceType === DeviceType.Mouse && this.__mouseId >= 0 && this._canvasEle.hasPointerCapture(this.__mouseId)) {
                this._canvasEle.releasePointerCapture(this.__mouseId);
            } else if (evt.pointerId && this._canvasEle.hasPointerCapture(evt.pointerId)) {
                this._canvasEle.releasePointerCapture(evt.pointerId);
            }

            this.onInputChangedObservable.notifyObservers(deviceEvent);

            // We don't want to unregister the mouse because we may miss input data when a mouse is moving after a click
            if (deviceType !== DeviceType.Mouse) {
                this.__pointer = {};
            }
        };

        const pointerBlurEvent = (evt: any) => {
            if (this.__mouseId >= 0 && this._canvasEle.hasPointerCapture(this.__mouseId)) {
                this._canvasEle.releasePointerCapture(this.__mouseId);
                this.__mouseId = -1;
            }

            this.__pointer = {};
        };

        const pointerWheelEvent = (evt: any) => {
            const deviceType = DeviceType.Mouse;
            // Store previous values for event
            let previousWheelScrollX = this.__pointer[PointerInput.MouseWheelX];
            let previousWheelScrollY = this.__pointer[PointerInput.MouseWheelY];
            let previousWheelScrollZ = this.__pointer[PointerInput.MouseWheelZ];

            this.__pointer[PointerInput.MouseWheelX] = evt.deltaX || 0;
            this.__pointer[PointerInput.MouseWheelY] = evt.deltaY || evt.wheelDelta || 0;
            this.__pointer[PointerInput.MouseWheelZ] = evt.deltaZ || 0;

            let deviceEvent = evt as IPointerEvent;
            deviceEvent.deviceType = deviceType;

            if (this.__pointer[PointerInput.MouseWheelX] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelX;
                deviceEvent.previousState = previousWheelScrollX;
                deviceEvent.currentState = this.__pointer[PointerInput.MouseWheelX];
                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (this.__pointer[PointerInput.MouseWheelY] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelY;
                deviceEvent.previousState = previousWheelScrollY;
                deviceEvent.currentState = this.__pointer[PointerInput.MouseWheelY];
                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
            if (this.__pointer[PointerInput.MouseWheelZ] !== 0) {
                deviceEvent.inputIndex = PointerInput.MouseWheelZ;
                deviceEvent.previousState = previousWheelScrollZ;
                deviceEvent.currentState = this.__pointer[PointerInput.MouseWheelZ];
                this.onInputChangedObservable.notifyObservers(deviceEvent);
            }
        };

        this._canvasEle.addEventListener(`${eventPrefix}move`, pointerMoveEvent);
        this._canvasEle.addEventListener(`${eventPrefix}down`, pointerDownEvent);
        this._canvasEle.addEventListener(`${eventPrefix}up`, pointerUpEvent);
        this._canvasEle.addEventListener('blur', pointerBlurEvent);
        this._canvasEle.addEventListener(this._getWheelEventName(), pointerWheelEvent, this._getPassive() ? { passive: false } : false);
    }

    private _getWheelEventName(): string {
        let wheelEventName =
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
        const noop = () => {};

        try {
            const options: object = {
                passive: {
                    get() {
                        passiveSupported = true;
                    },
                },
            };

            this._canvasEle.addEventListener('test', noop, options);
            this._canvasEle.removeEventListener('test', noop, options);
        } catch (e) {
            /* */
        }

        return passiveSupported;
    }

    private __getPointerType(evt: any): DeviceType {
        let deviceType = DeviceType.Mouse;

        if (evt.pointerType === 'touch' || evt.pointerType === 'pen' || evt.touches) {
            deviceType = DeviceType.Touch;
        }

        return deviceType;
    }
}
