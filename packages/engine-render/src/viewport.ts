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

import type { EventState, IPosition, IRange, Nullable } from '@univerjs/core';
import { EventSubject, Tools } from '@univerjs/core';

import type { BaseObject } from './base-object';
import { FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from './basics/const';
import type { IWheelEvent } from './basics/i-events';
import { PointerInput } from './basics/i-events';
import { fixLineWidthByScale, toPx } from './basics/tools';
import { Transform } from './basics/transform';
import type { IBoundRectNoAngle, IViewportInfo } from './basics/vector2';
import { Vector2 } from './basics/vector2';
import { subtractViewportRange } from './basics/viewport-subtract';
import { Canvas as UniverCanvas } from './canvas';
import type { UniverRenderingContext } from './context';
import type { BaseScrollBar } from './shape/base-scroll-bar';
import type { ThinScene } from './thin-scene';

interface IViewPosition {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
    width?: number;
    height?: number;
}

interface IViewProps extends IViewPosition {
    attachX?: boolean;
    attachY?: boolean;
    isWheelPreventDefaultX?: boolean;
    isWheelPreventDefaultY?: boolean;
    active?: boolean;

    isRelativeX?: boolean;
    isRelativeY?: boolean;

    allowCache?: boolean;
    bufferEdgeX?: number;
    bufferEdgeY?: number;
}

export interface IScrollObserverParam {
    viewport?: Viewport;
    /**
     * scrollX for scrollbar
     */
    scrollX: number;
    scrollY: number;

    /**
     * scrollXY before limit function
     * why need this value?
     */
    rawScrollX?: number;
    rawScrollY?: number;
    /**
     * scrollX for viewport
     */
    viewportScrollX: number;
    viewportScrollY: number;
    limitX?: number;
    limitY?: number;
    isTrigger?: boolean;
}

interface IScrollBarPosition {
    x: number;
    y: number;
}

interface IViewportScrollPosition {
    viewportScrollX: number;
    viewportScrollY: number;
}

const MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR = 3;

export class Viewport {
    /**
     * scrollX means scroll x value for scrollbar in viewMain
     * use getBarScroll to get scrolling value(scrollX, scrollY) for scrollbar
     */
    scrollX: number = 0;
    scrollY: number = 0;
    private _preScrollX: number = 0;
    private _preScrollY: number = 0;

    /**
     * The viewport scroll offset equals the distance from the content area position to the top, and there is a conversion relationship with scrollX and scrollY
     * use transScroll2ViewportScrollValue to get scrolling value for spreadsheet.
     */
    private _viewportScrollX: number = 0;
    private _viewportScrollY: number = 0;
    private _preViewportScrollX: number = 0;
    private _preViewportScrollY: number = 0;
    private _deltaViewportScrollX: number = 0;
    private _deltaViewportScrollY: number = 0;

    /**
     * scene size in current viewport port with scale
     * scene size relative to row col settings.
     * if AB col has set to be freeze, then scene size in viewMain will be smaller compared to no freeze state.
     */
    private _sceneWCurrVpAfterScale: number = 0;
    private _sceneHCurrVpAfterScale: number = 0;

    /**
     * scene size with scale
     */
    private _sceneWidthAfterScale: number;
    private _sceneHeightAfterScale: number;

    onMouseWheel$ = new EventSubject<IWheelEvent>();

    onScrollAfter$ = new EventSubject<IScrollObserverParam>();

    onScrollBefore$ = new EventSubject<IScrollObserverParam>();

    onScrollEnd$ = new EventSubject<IScrollObserverParam>();

    onScrollByBar$ = new EventSubject<IScrollObserverParam>();

    private _viewportKey: string = '';

    /**
     * viewport top origin value in logic, scale does not affect it.
     */
    private _topOrigin: number = 0;

    /**
     * viewport left origin value in logic, scale does not affect it.
     */
    private _leftOrigin: number = 0;

    private _bottomOrigin: number = 0;

    private _rightOrigin: number = 0;

    private _widthOrigin: Nullable<number>;

    private _heightOrigin: Nullable<number>;

    private _top: number = 0;

    private _left: number = 0;

    private _bottom: number = 0;

    private _right: number = 0;

    private _width: Nullable<number>;

    private _height: Nullable<number>;

    private _scene!: ThinScene;

    private _scrollBar?: Nullable<BaseScrollBar>;

    private _isWheelPreventDefaultX: boolean = false;

    private _isWheelPreventDefaultY: boolean = false;

    private _scrollStopNum: NodeJS.Timeout | number = 0;

    private _clipViewport = true;

    private _active = true;

    private _paddingStartX: number = 0;

    /**
     * after create a freeze column, there is a "padding distace" from row header to curr viewport.
     */
    private _paddingEndX: number = 0;

    /**
     * after create a freeze row, there is a "padding distace" from column header to curr viewport.
     */
    private _paddingStartY: number = 0;

    private _paddingEndY: number = 0;

    private _isRelativeX: boolean = false;

    private _isRelativeY: boolean = false;

    // private _preViewportInfo: Nullable<IViewportInfo>;

    /**
     * viewbound of cache area, cache area is slightly bigger than viewbound.
     */
    private _cacheBound: IBoundRectNoAngle | null;
    private _preCacheBound: IBoundRectNoAngle | null;
    private _preCacheVisibleBound: IBoundRectNoAngle | null;

    /**
     * bound of visible area
     */
    private _viewBound: IBoundRectNoAngle;
    private _preViewBound: IBoundRectNoAngle;

    /**
     *  Whether the viewport needs to be updated.
     *  In future, viewMain dirty would not affect othew viewports.
     */
    private _isDirty = true;
    private _cacheCanvas: UniverCanvas | null = null;

    /**
     * The configuration comes from the props.allowCache passed in during viewport initialization.
     * When _allowCache is true, a cacheCanvas will be created.
     */
    private _allowCache: boolean = false;

    /**
     * Buffer Area size, default is zero
     */
    bufferEdgeX: number = 0;
    bufferEdgeY: number = 0;

    constructor(viewportKey: string, scene: ThinScene, props?: IViewProps) {
        this._viewportKey = viewportKey;

        this._scene = scene;

        if (props?.active != null) {
            this._active = props.active;
        }

        this._scene.addViewport(this);

        // if (props?.width) {
        //     this.width = props?.width;
        //     this._widthOrigin = this.width;
        // }

        // if (props?.height) {
        //     this.height = props?.height;
        //     this._heightOrigin = this.height;
        // }

        if (props?.isRelativeX != null) {
            this._isRelativeX = props.isRelativeX;
        }

        if (props?.isRelativeY != null) {
            this._isRelativeY = props.isRelativeY;
        }

        this._setViewportWidthAndHeight(props);
        this.initCacheCanvas(props);

        this._isWheelPreventDefaultX = props?.isWheelPreventDefaultX || false;
        this._isWheelPreventDefaultY = props?.isWheelPreventDefaultY || false;

        this.resetCanvasSizeAndUpdateScroll();
        this.getBounding();

        this.scene.getEngine()?.onTransformChange$.subscribeEvent(() => {
            this._mainCanvasResizeHandler();
        });
        this._mainCanvasResizeHandler();
    }

    initCacheCanvas(props?: IViewProps) {
        this._allowCache = props?.allowCache || false;
        if (this._allowCache) {
            this._cacheCanvas = new UniverCanvas();
            this.bufferEdgeX = props?.bufferEdgeX || 0;
            this.bufferEdgeY = props?.bufferEdgeY || 0;
        }
        // this._testDisplayCache();
    }

    /**
     * test
     */
    _testDisplayCache() {
        const globalThis = window as any;
        if (!globalThis.cacheSet) {
            globalThis.cacheSet = new Set();
        }
        const showCache = (cacheCanvas: UniverCanvas) => {
            cacheCanvas.getCanvasEle().classList.remove('univer-render-canvas');
            cacheCanvas.getCanvasEle().classList.add('viewport-cache-canvas');
            cacheCanvas.getCanvasEle().classList.add('cache-canvas', this.viewportKey);
            cacheCanvas.getCanvasEle().style.zIndex = '100';
            cacheCanvas.getCanvasEle().style.position = 'fixed';
            cacheCanvas.getCanvasEle().style.background = 'pink';
            cacheCanvas.getCanvasEle().style.pointerEvents = 'none';
            cacheCanvas.getCanvasEle().style.border = '1px solid black';
            cacheCanvas.getCanvasEle().style.transformOrigin = '100% 100%';
            cacheCanvas.getCanvasEle().style.transform = 'scale(0.5)';
            cacheCanvas.getCanvasEle().style.translate = '-20% 0%';
            cacheCanvas.getCanvasEle().style.opacity = '1';
            document.body.appendChild(cacheCanvas.getCanvasEle());
        };
        if (['viewMain', 'viewMainLeftTop', 'viewMainTop', 'viewMainLeft'].includes(this.viewportKey)) {
            if (this._cacheCanvas) {
                showCache(this._cacheCanvas);
            }
        }
        if (this.viewportKey === 'spreadInSlideViewMaintable1') {
            if (this._cacheCanvas) {
                showCache(this._cacheCanvas);
            }
        }
    }

    get scene() {
        return this._scene;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get viewportKey() {
        return this._viewportKey;
    }

    get topOrigin() {
        return this._topOrigin;
    }

    get leftOrigin() {
        return this._leftOrigin;
    }

    get bottomOrigin() {
        return this._bottomOrigin;
    }

    get rightOrigin() {
        return this._rightOrigin;
    }

    get top(): number {
        return this._top;
    }

    get left(): number {
        return this._left;
    }

    get bottom(): number {
        return this._bottom;
    }

    get right(): number {
        return this._right;
    }

    get isWheelPreventDefaultX() {
        return this._isWheelPreventDefaultX;
    }

    get isWheelPreventDefaultY() {
        return this._isWheelPreventDefaultY;
    }

    set width(w: Nullable<number>) {
        this._width = w;
    }

    set height(h: Nullable<number>) {
        this._height = h;
    }

    get isActive() {
        if (this._active === false) {
            return false;
        }

        if ((this.height || 0) <= 0 || (this.width || 0) <= 0) {
            return false;
        }
        return this._active;
    }

    set viewportScrollX(val: number) {
        this._viewportScrollX = val;
    }

    get viewportScrollX() {
        return this._viewportScrollX;
    }

    set viewportScrollY(val: number) {
        this._viewportScrollY = val;
    }

    get viewportScrollY() {
        return this._viewportScrollY;
    }

    private set top(num: number) {
        this._topOrigin = num;
        this._top = toPx(num, this._scene?.getParent()?.height);
    }

    private set left(num: number) {
        this._leftOrigin = num;
        this._left = toPx(num, this.scene.getParent()?.width);
    }

    private set bottom(num: number) {
        this._bottomOrigin = num;
        this._bottom = toPx(num, this.scene.getParent()?.height);
    }

    private set right(num: number) {
        this._rightOrigin = num;
        this._right = toPx(num, this.scene.getParent()?.width);
    }

    get viewBound() {
        return this._viewBound;
    }

    get cacheBound() {
        return this._cacheBound;
    }

    set cacheBound(val) {
        this._cacheBound = val;
    }

    get preCacheBound() {
        return this._preCacheBound;
    }

    set preCacheBound(val: IBoundRectNoAngle | null) {
        this._preCacheBound = val;
        this._preCacheVisibleBound = Object.assign({}, val);
    }

    enable() {
        this._active = true;
    }

    disable() {
        this._active = false;
    }

    /**
     * invoked when canvas element size change
     * engineResizeObserver --> engine.resizeBySize --> scene._setTransForm
     */
    resetCanvasSizeAndUpdateScroll() {
        this._resizeCacheCanvas();
        this._updateScrollByViewportScrollValue();
    }

    setScrollBar(instance: BaseScrollBar) {
        this._scrollBar = instance;
        this._updateScrollByViewportScrollValue();
    }

    removeScrollBar() {
        this._scrollBar = null;
    }

    /**
     * NOT same as resetCanvasSizeAndScrollbar
     * This method is triggered when adjusting the frozen row & col settings, and during initialization,
     * it is not triggered when resizing the window.
     *
     * Note that the 'position' parameter may not always have 'height' and 'width' properties. For the 'viewMain' element, it only has 'left', 'top', 'bottom', and 'right' properties.
     * Additionally, 'this.width' and 'this.height' may also be 'undefined'.
     * Therefore, you should use the '_getViewPortSize' method to retrieve the width and height.
     * @param position
     */
    resizeWhenFreezeChange(position: IViewPosition) {
        const positionKeys = Object.keys(position);
        if (positionKeys.length === 0) {
            return;
        }
        // this._width = undefined;
        // this._height = undefined;
        // positionKeys.forEach((pKey) => {
        //     if (position[pKey as keyof IViewPosition] !== undefined) {
        //         (this as IKeyValue)[pKey] = position[pKey as keyof IViewPosition];
        //     }
        // });
        this._setViewportWidthAndHeight(position);
        this.resetCanvasSizeAndUpdateScroll();
    }

    setPadding(param: IPosition) {
        const { startX = 0, startY = 0, endX = 0, endY = 0 } = param;
        this._paddingStartX = startX;
        this._paddingEndX = endX;
        this._paddingStartY = startY;
        this._paddingEndY = endY;

        this.resetCanvasSizeAndUpdateScroll();
    }

    resetPadding() {
        this.setPadding({
            startX: 0,
            endX: 0,
            startY: 0,
            endY: 0,
        });
    }

    /**
     * There are serval cases to call this method.
     * the most common case is scrolling. Other situations include:
     * 1. changing the frozen row & col settings
     * 2. changing curr skeleton
     * 3. changing selection which cross viewport
     * 4. changing the viewport size (also include change window size)
     * 5. changing the scroll bar position
     *
     * when scrolling by trackpad:
     * scene.input-manager@_onMouseWheel --> scene@triggerMouseWheel --> sheet-render.controller@scene.onMouseWheel$.add -->
     * set-scroll.command.ts --> scroll.operation.ts -->
     * scrollManagerService.setScrollInfoAndEmitEvent
     *
     * when change skelenton:
     * _currentSkeletonBefore$ ---> scroll.render-controller@_updateSceneSize --> setSearchParam --> scene@_setTransForm ---> viewport.resetCanvasSizeAndUpdateScrollBar ---> scrollToXX
     * --> onScrollAfterObserver.notifyObservers --> scroll.render-controller@onScrollAfterObserver ---> setScrollInfoToCurrSheetWithoutNotify  ---> sms._setScrollInfo
     *
     * _currentSkeleton$ ---> selection.render-controller ---> formula@_autoScroll ---> viewport.resize ---> get scrollXY by viewportScrollXY ---> scrollTo
     * _currentSkeleton$ ---> selection.render-controller ---> setCurrentSelection ---> formula@_autoScroll ---> scrollTo
     * _currentSkeleton$ ---> freeze.render-controller@_refreshFreeze --> viewport.resize ---> scrollTo  ---> _scroll
     *
     * Debug
     * window.scene.getViewports()[0].scrollTo({x: 14.2, y: 1.8}, true)
     *
     * @param pos
     *
     */
    scrollToBarPos(pos: Partial<IScrollBarPosition>) {
        return this._scrollToBarPosCore(pos);
    }

    /**
     * scrolling by current position plus offset
     * the most common case is triggered by scroll-timer(in sheet)
     * @param delta
     * @returns isLimited
     */
    scrollByBarDeltaValue(delta: Partial<IScrollBarPosition>, isTrigger = true) {
        const x = this.scrollX + (delta.x || 0);
        const y = this.scrollY + (delta.y || 0);
        return this._scrollToBarPosCore({ x, y }, isTrigger);
    }

    scrollByBar(delta: Partial<IScrollBarPosition>, isTrigger = true) {
        this.scrollByBarDeltaValue(delta, isTrigger);
        const { x, y } = delta;
        this.onScrollByBar$.emitEvent({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            rawScrollX: x,
            rawScrollY: y,
            viewportScrollX: this.viewportScrollX,
            viewportScrollY: this.viewportScrollY,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        });
    }

    scrollToViewportPos(pos: Partial<IViewportScrollPosition>, isTrigger = true) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const { viewportScrollX, viewportScrollY } = pos;
        return this._scrollToViewportPosCore({ viewportScrollX, viewportScrollY }, isTrigger);
    }

    scrollByViewportDeltaVal(delta: IViewportScrollPosition, isTrigger = true) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const viewportScrollX = this.viewportScrollX + (delta.viewportScrollX || 0);
        const viewportScrollY = this.viewportScrollY + (delta.viewportScrollY || 0);
        return this._scrollToViewportPosCore({ viewportScrollX, viewportScrollY }, isTrigger);
    }

    /**
     * current position plus offset relatively
     * the caller no need to deal with the padding when frozen
     * @param offsetX
     * @param offsetY
     * @param isTrigger
     */
    scrollByOffset(offsetX = 0, offsetY = 0, isTrigger = true) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const x = offsetX + this._paddingStartX;
        const y = offsetY + this._paddingStartY;
        const param = this.transViewportScroll2ScrollValue(x, y);
        return this.scrollByBarDeltaValue(param, isTrigger);
    }

    transViewportScroll2ScrollValue(viewportScrollX: number, viewportScrollY: number) {
        let x = viewportScrollX - this._paddingStartX;
        let y = viewportScrollY - this._paddingStartY;

        if (this._scrollBar) {
            x *= this._scrollBar.ratioScrollX; // convert to scroll coord
            y *= this._scrollBar.ratioScrollY;
            const { scaleX, scaleY } = this.scene;
            x *= scaleX;
            y *= scaleY;
        } else {
            if (this.scrollX !== undefined) {
                x = this.scrollX;
            }

            if (this.scrollY !== undefined) {
                y = this.scrollY;
            }
        }

        return {
            x,
            y,
        };
    }

    transScroll2ViewportScrollValue(scrollX: number, scrollY: number) {
        let x = scrollX;
        let y = scrollY;
        if (this._scrollBar) {
            const { scaleX, scaleY } = this.scene;
            if (this._scrollBar.ratioScrollX !== 0) {
                x /= this._scrollBar.ratioScrollX; // 转换为内容区实际滚动距离
                x /= scaleX;
            } else if (this.viewportScrollX !== undefined) {
                x = this.viewportScrollX;
            } else {
                x = 0;
            }

            if (this._scrollBar.ratioScrollY !== 0) {
                y /= this._scrollBar.ratioScrollY;

                y /= scaleY;
            } else if (this.viewportScrollY !== undefined) {
                y = this.viewportScrollY;
            } else {
                y = 0;
            }

            // console.log(y, this._scrollBar.miniThumbRatioY);
            // x *= this._scrollBar.miniThumbRatioX;
            // y *= this._scrollBar.miniThumbRatioY;
        } else {
            if (this.viewportScrollX !== undefined) {
                x = this.viewportScrollX;
            } else {
                x = 0;
            }

            if (this.viewportScrollY !== undefined) {
                y = this.viewportScrollY;
            } else {
                y = 0;
            }
        }

        const { scaleX, scaleY } = this._scene.getPrecisionScale();

        return {
            x: fixLineWidthByScale(x + this._paddingStartX, scaleX),
            y: fixLineWidthByScale(y + this._paddingStartY, scaleY),
        };
    }

    /**
     * get actual scroll value by scrollXY
     */
    getViewportScrollByScrollXY() {
        const x = this.scrollX;
        const y = this.scrollY;

        return this.transScroll2ViewportScrollValue(x, y);
    }

    getScrollBar() {
        return this._scrollBar;
    }

    // scrollTo ---> _scroll ---> onScrollAfter$.next ---> scroll.render-controller@updateScroll
    // scrollTo ---> _scroll ---> onScrollAfter$.next ---> freeze.render-controller@updateScroll
    updateScrollVal(current: Partial<IScrollObserverParam>) {
        // scrollvalue for scrollbar, when rows over 5000(big sheet), deltaScrollY always 0 when scrolling. Do not use this value to judge scrolling
        // this._deltaScrollX = this.scrollX - this._preScrollX;
        // this._deltaScrollY = this.scrollY - this._preScrollY;
        this._preScrollX = this.scrollX;
        this._preScrollY = this.scrollY;
        const { scrollX, scrollY, viewportScrollX, viewportScrollY } = current;
        if (scrollX !== undefined) {
            this.scrollX = scrollX;
        }

        if (scrollY !== undefined) {
            this.scrollY = scrollY;
        }

        if (viewportScrollX !== undefined) {
            this._preViewportScrollX = this.viewportScrollX;
            this.viewportScrollX = viewportScrollX;
            this._deltaViewportScrollX = viewportScrollX - this._preViewportScrollX;
        }

        if (viewportScrollY !== undefined) {
            this._preViewportScrollY = this.viewportScrollY;
            this.viewportScrollY = viewportScrollY;
            this._deltaViewportScrollY = viewportScrollY - this._preViewportScrollY;
        }
        return this;
    }

    getScrollBarTransForm() {
        const composeResult = Transform.create();

        composeResult.multiply(Transform.create([1, 0, 0, 1, this._left, this._top]));

        return composeResult;
    }

    shouldIntoRender() {
        if (
            this.isActive === false ||
            this.width == null ||
            this.height == null ||
            this.width <= 1 ||
            this.height <= 1
        ) {
            return false;
        }
        return true;
    }

    /**
     * call stack: engine.renderLoop ---> scene.render ---> layer.render ---> viewport.render
     * that means each layer call all viewports to render
     * @param parentCtx parentCtx is cacheCtx from layer when layer._allowCache is true
     * @param objects
     * @param isMaxLayer
     */
    render(parentCtx?: UniverRenderingContext, objects: BaseObject[] = [], isMaxLayer = false) {
        if (!this.shouldIntoRender()) {
            return;
        }
        const mainCtx = parentCtx || (this._scene.getEngine()?.getCanvas().getContext() as UniverRenderingContext);

        // this._scene.transform --> [scale, 0, 0, scale, - viewportScrollX * scaleX, - viewportScrollY * scaleY]
        // see transform.ts@multiply
        const sceneTrans = this._scene.transform.clone();
        sceneTrans.multiply(Transform.create([1, 0, 0, 1, -this.viewportScrollX || 0, -this.viewportScrollY || 0]));

        // Logical translation & scaling, unrelated to dpr.
        const tm = sceneTrans.getMatrix();
        mainCtx.save();// At this time, mainCtx transform is (dpr, 0, 0, dpr, 0, 0)

        if (this._clipViewport) {
            mainCtx.beginPath();
            // DEPT: left is set by upper views but width and height is not
            // this.left has handle scale already, no need to `this.width * scale`
            // const { scaleX, scaleY } = this._getBoundScale(m[0], m[3]);
            mainCtx.rect(this.left, this.top, (this.width || 0), (this.height || 0));
            mainCtx.clip();
        }

        // set scrolling state for mainCtx,
        mainCtx.transform(tm[0], tm[1], tm[2], tm[3], tm[4], tm[5]);
        const viewPortInfo = this._calcViewportInfo();

        for (let i = 0, length = objects.length; i < length; i++) {
            objects[i].render(mainCtx, viewPortInfo);
        }

        this.markDirty(false);
        this.markForceDirty(false);

        this._preViewBound = this._viewBound;
        if (viewPortInfo.shouldCacheUpdate) {
            this.preCacheBound = this._cacheBound;
        }
        mainCtx.restore();

        if (this._scrollBar && isMaxLayer) {
            mainCtx.save();
            const scrollbarTM = this.getScrollBarTransForm().getMatrix();
            mainCtx.transform(scrollbarTM[0], scrollbarTM[1], scrollbarTM[2], scrollbarTM[3], scrollbarTM[4], scrollbarTM[5]);
            this._drawScrollbar(mainCtx);
            mainCtx.restore();
        }
        // TODO @lumix, preScrollX is also handled by updateScroll(), this method is empty.
        this._afterRender();
    }

    private _makeDefaultViewport() {
        return {
            viewBound: {
                left: -1,
                top: -1,
                right: -1,
                bottom: -1,
            },
            diffBounds: [],
            diffX: -1,
            diffY: -1,
            viewPortPosition: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            },
            viewportKey: this.viewportKey,
            isDirty: 0,
            isForceDirty: this.isForceDirty,
            allowCache: false,
            cacheBound: {
                left: -1,
                top: -1,
                right: -1,
                bottom: -1,
            },
            diffCacheBounds: [],
            cacheViewPortPosition: {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            },
            shouldCacheUpdate: 0,
            sceneTrans: Transform.create([1, 0, 0, 1, 0, 0]),
            leftOrigin: 0,
            topOrigin: 0,
            bufferEdgeX: this.bufferEdgeX,
            bufferEdgeY: this.bufferEdgeY,
        } satisfies IViewportInfo;
    }

    // eslint-disable-next-line max-lines-per-function
    private _calcViewportInfo(): IViewportInfo {
        if (this.isActive === false) {
            return this._makeDefaultViewport();
        }

        const sceneTrans = this._scene.transform.clone();

        // const m = sceneTrans.getMatrix();

        // const scaleFromX = this._isRelativeX ? (m[0] < 1 ? m[0] : 1) : 1;

        // const scaleFromY = this._isRelativeY ? (m[3] < 1 ? m[3] : 1) : 1;

        // const scaleToX = this._isRelativeX ? 1 : m[0] < 1 ? m[0] : 1;

        // const scaleToY = this._isRelativeY ? 1 : m[3] < 1 ? m[3] : 1;

        let width = this._width;
        let height = this._height;
        const size = this._getViewPortSize();

        // if (m[0] > 1) {
        width = size.width;
        // }

        // if (m[3] > 1) {
        height = size.height;
        // }

        const xFrom: number = this.left;
        const xTo: number = ((width || 0) + this.left);
        const yFrom: number = this.top;
        const yTo: number = ((height || 0) + this.top);

        // this.getRelativeVector 加上了 scroll 后的坐标
        const topLeft = this.transformVector2SceneCoord(Vector2.FromArray([xFrom, yFrom]));
        const bottomRight = this.transformVector2SceneCoord(Vector2.FromArray([xTo, yTo]));

        const viewBound = {
            left: topLeft.x,
            right: bottomRight.x,
            top: topLeft.y,
            bottom: bottomRight.y,
        };
        this._viewBound = viewBound;
        const preViewBound = this._preViewBound;
        const diffBounds = this._diffViewBound(viewBound, preViewBound);
        const diffX = (preViewBound?.left || 0) - viewBound.left;
        const diffY = (preViewBound?.top || 0) - viewBound.top;
        const viewPortPosition = {
            top: yFrom,
            left: xFrom,
            bottom: yTo,
            right: xTo,
        };
        const cacheBound = this.expandBounds(viewBound);
        this.cacheBound = cacheBound;
        if (!this.preCacheBound) {
            this.preCacheBound = this.expandBounds(viewBound);
        }
        let diffCacheBounds: IBoundRectNoAngle[] = [];// = this._diffViewBound(cacheBounds, prevCacheBounds);
        if (this._preCacheVisibleBound) {
            if (diffX < 0) { // scrolling right (further)
                this._preCacheVisibleBound.left -= diffX;
            } else if (diffX > 0) {
                this._preCacheVisibleBound.right -= diffX;
            }

            if (diffY < 0) { // scrolling down (further)
                this._preCacheVisibleBound.top -= diffY;
            } else if (diffY > 0) {
                this._preCacheVisibleBound.bottom -= diffY;
            }
        }
        const cacheViewPortPosition = this.expandBounds(viewPortPosition);
        const shouldCacheUpdate = this._calcCacheUpdate(viewBound, this._preCacheVisibleBound, diffX, diffY);
        if (shouldCacheUpdate) {
            diffCacheBounds = this._calcDiffCacheBound(this._preCacheBound, cacheBound);
        }

        return {
            viewBound,
            diffBounds,
            diffX,
            diffY,
            viewPortPosition,
            viewportKey: this.viewportKey,
            isDirty: this.isDirty ? 0b10 : 0b00,
            isForceDirty: this.isForceDirty,
            allowCache: this._allowCache,
            cacheBound,
            diffCacheBounds,
            cacheViewPortPosition,
            shouldCacheUpdate,
            sceneTrans,
            cacheCanvas: this._cacheCanvas!,
            leftOrigin: this._leftOrigin,
            topOrigin: this._topOrigin,
            bufferEdgeX: this.bufferEdgeX,
            bufferEdgeY: this.bufferEdgeY,
            updatePrevCacheBounds: (viewbound: IBoundRectNoAngle) => {
                this.updatePrevCacheBounds(viewbound);
            },
        } satisfies IViewportInfo;
    }

    getBounding() {
        return this._calcViewportInfo();
    }

    /**
     * convert vector to scene coordinate, include row & col
     * @param vec
     * @returns Vector2
     */
    transformVector2SceneCoord(vec: Vector2): Vector2 {
        const sceneTrans = this.scene.transform.clone().invert();
        const scroll = this.getViewportScrollByScrollXY();

        const svCoord = sceneTrans.applyPoint(vec).add(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }

    getAbsoluteVector(coord: Vector2): Vector2 {
        const sceneTrans = this.scene.transform.clone();
        const scroll = this.getViewportScrollByScrollXY();

        const svCoord = sceneTrans.applyPoint(coord.subtract(Vector2.FromArray([scroll.x, scroll.y])));
        return svCoord;
    }

    /**
     * At f7140a7c11, only doc need this method.
     * In sheet, wheel event is handled by scroll-manager.service@setScrollInfo
     * @param evt
     * @param state
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    onMouseWheel(evt: IWheelEvent, state: EventState) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        let isLimitedStore;
        if (evt.inputIndex === PointerInput.MouseWheelX) {
            const deltaFactor = Math.abs(evt.deltaX);
            const allWidth = this._scene.width;
            const viewWidth = this.width || 1;
            const scrollNum = (viewWidth / allWidth) * deltaFactor;
            if (evt.deltaX > 0) {
                isLimitedStore = this.scrollByBarDeltaValue({
                    x: scrollNum,
                });
            } else {
                isLimitedStore = this.scrollByBarDeltaValue({
                    x: -scrollNum,
                });
            }

            // 临界点时执行浏览器行为
            if (this._scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                if (!isLimitedStore?.isLimitedX) {
                    state.stopPropagation();
                }
            } else if (this._isWheelPreventDefaultX) {
                evt.preventDefault();
            } else if (!isLimitedStore?.isLimitedX) {
                evt.preventDefault();
            }
        }
        if (evt.inputIndex === PointerInput.MouseWheelY) {
            const deltaFactor = Math.abs(evt.deltaY);
            const allHeight = this._scene.height;
            const viewHeight = this.height || 1;
            // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
            let scrollNum = (viewHeight / allHeight) * deltaFactor;
            if (evt.shiftKey) {
                scrollNum *= MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR;
                if (evt.deltaY > 0) {
                    isLimitedStore = this.scrollByBarDeltaValue({
                        x: scrollNum,
                    });
                } else {
                    isLimitedStore = this.scrollByBarDeltaValue({
                        x: -scrollNum,
                    });
                }

                // 临界点时执行浏览器行为
                if (this._scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                    if (!isLimitedStore?.isLimitedX) {
                        state.stopPropagation();
                    }
                } else if (this._isWheelPreventDefaultX) {
                    evt.preventDefault();
                } else if (!isLimitedStore?.isLimitedX) {
                    evt.preventDefault();
                }
            } else {
                if (evt.deltaY > 0) {
                    isLimitedStore = this.scrollByBarDeltaValue({
                        y: scrollNum,
                    });
                } else {
                    isLimitedStore = this.scrollByBarDeltaValue({
                        y: -scrollNum,
                    });
                }

                // 临界点时执行浏览器行为
                if (this._scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                    if (!isLimitedStore?.isLimitedY) {
                        state.stopPropagation();
                    }
                } else if (this._isWheelPreventDefaultY) {
                    evt.preventDefault();
                } else if (!isLimitedStore?.isLimitedY) {
                    evt.preventDefault();
                }
            }
        }
        if (evt.inputIndex === PointerInput.MouseWheelZ) {
            // TODO
        }

        this._scene.makeDirty(true);
    }

    isHit(coord: Vector2) {
        if (this.isActive === false) {
            return;
        }
        const { width, height } = this._getViewPortSize();
        // const pixelRatio = this.getPixelRatio();
        // coord = Transform.create([pixelRatio, 0, 0, pixelRatio, 0, 0]).applyPoint(
        //     coord
        // );
        if (
            coord.x >= this.left &&
            coord.x <= this.left + (width || 0) &&
            coord.y >= this.top &&
            coord.y <= this.top + (height || 0)
        ) {
            return true;
        }
        return false;
    }

    pickScrollBar(coord: Vector2) {
        if (!this._scrollBar) {
            return;
        }

        const scrollBarTrans = this.getScrollBarTransForm();
        const svCoord = scrollBarTrans.invert().applyPoint(coord);
        return this._scrollBar.pick(svCoord);
    }

    openClip() {
        this._clipViewport = true;
    }

    closeClip() {
        this._clipViewport = false;
    }

    dispose() {
        this.onMouseWheel$.complete();
        this.onScrollAfter$.complete();
        this.onScrollBefore$.complete();
        this.onScrollEnd$.complete();
        this._scrollBar?.dispose();
        this._cacheCanvas?.dispose();
        this._scene.removeViewport(this._viewportKey);
    }

    limitedScroll(scrollX: Nullable<number>, scrollY: Nullable<number>) {
        if (!this._scrollBar) {
            return {
                scrollX: 0,
                scrollY: 0,
                isLimitedX: false,
                isLimitedY: false,
            };
        }

        scrollX = scrollX ?? this.scrollX;
        scrollY = scrollY ?? this.scrollY;
        const { height, width } = this._getViewPortSize();
        if (this._sceneWCurrVpAfterScale <= width) {
            scrollX = 0;
        }
        if (this._sceneHCurrVpAfterScale <= height) {
            scrollY = 0;
        }

        const limitX = this._scrollBar?.limitX;
        const limitY = this._scrollBar?.limitY;

        let isLimitedX = false;
        let isLimitedY = false;

        if (scrollX < 0 || scrollX > limitX) {
            isLimitedX = true;
        }

        if (scrollY < 0 || scrollY > limitY) {
            isLimitedY = true;
        }
        scrollX = Tools.clamp(scrollX, 0, limitX);
        scrollY = Tools.clamp(scrollY, 0, limitY);

        return {
            scrollX,
            scrollY,
            isLimitedX,
            isLimitedY,
        };
    }

    /**
     * Still in working progress, do not use it now.
     * @param viewportScrollX
     * @param viewportScrollY
     * @returns
     */
    _limitViewportScroll(viewportScrollX: number, viewportScrollY: number) {
        const { width, height } = this._getViewPortSize();
        // Not enough! freeze row & col should also take into consideration.
        const freezeHeight = this._paddingEndY - this._paddingStartY;
        const freezeWidth = this._paddingEndX - this._paddingStartX;
        const scaleY = this.scene.scaleY;
        const scaleX = this.scene.scaleX;
        const maxViewportScrollX = this._sceneWidthAfterScale - freezeWidth * scaleX - width;
        const maxViewportScrollY = this._sceneHeightAfterScale - freezeHeight * scaleY - height;
        return {
            viewportScrollX: Tools.clamp(viewportScrollX, this._paddingStartX, maxViewportScrollX / scaleX),
            viewportScrollY: Tools.clamp(viewportScrollY, this._paddingStartY, maxViewportScrollY / scaleY),
            isLimitedX: viewportScrollX > maxViewportScrollX,
            isLimitedY: viewportScrollY > maxViewportScrollY,
        };
    }

    markDirty(state?: boolean) {
        if (state === undefined) {
            state = true;
        }
        this._isDirty = state;
    }

    get isDirty() {
        return this._isDirty;
    }

    private _isForceDirty = true;
    markForceDirty(state?: boolean) {
        if (state === undefined) {
            state = true;
        }
        this._isForceDirty = state;
    }

    resetPrevCacheBounds() {
        this._preCacheBound = null;//this.expandBounds(this._viewBound);
    }

    get isForceDirty() {
        return this._isForceDirty;
    }

    /**
     * resize canvas & use viewportScrollXY to scrollTo
     */
    private _resizeCacheCanvas() {
        const { width, height } = this._getViewPortSize();

        const scaleX = this.scene.scaleX;
        const scaleY = this.scene.scaleY;
        const canvasW = width !== 0 ? width + this.bufferEdgeX * 2 * scaleX : 0;
        const canvasH = height !== 0 ? height + this.bufferEdgeY * 2 * scaleY : 0;
        this._cacheCanvas?.setSize(canvasW, canvasH);
        this.cacheBound = this._viewBound;
        this.preCacheBound = null;

        this.markForceDirty(true);
    }

    /**
     * This method will be invoked when viewport is resizing and removing rol & col
     */
    private _updateScrollByViewportScrollValue() {
        // zoom.render-controller ---> scene._setTransform --> _updateScrollBarPosByViewportScroll
        // viewport width is negative when canvas container has not been set to engine.
        if (!this.width || this.width < 0) return;
        if (!this.height || this.height < 0) return;
        const { width, height } = this._getViewPortSize();
        const sceneWidthCurrVpAfterScale = (this._scene.width - this._paddingEndX) * this._scene.scaleX;
        const sceneHeightCurrVpAfterScale = (this._scene.height - this._paddingEndY) * this._scene.scaleY;
        this._sceneWCurrVpAfterScale = sceneWidthCurrVpAfterScale;
        this._sceneHCurrVpAfterScale = sceneHeightCurrVpAfterScale;
        this._sceneWidthAfterScale = this._scene.width * this._scene.scaleX;
        this._sceneHeightAfterScale = this._scene.height * this._scene.scaleY;

        if (this._scrollBar) {
            this._scrollBar.resize(width, height, sceneWidthCurrVpAfterScale, sceneHeightCurrVpAfterScale);
            const viewportScrollX = this.viewportScrollX;
            const viewportScrollY = this.viewportScrollY;
            this.scrollToViewportPos({
                viewportScrollX,
                viewportScrollY,
            });
        }
        this.markForceDirty(true);
    }

    private _getViewPortSize() {
        const parent = this._scene.getParent();

        const { width: parentWidth, height: parentHeight } = parent;

        const { scaleX = 1, scaleY = 1 } = this._scene;

        let width;
        let height;

        const left = this._leftOrigin * scaleX;
        const top = this._topOrigin * scaleY;

        this._left = left;
        this._top = top;
        if (this._isRelativeX) {
            width = parentWidth - (this._left + this._right);
        } else {
            width = (this._widthOrigin || 0) * scaleX;
        }

        if (this._isRelativeY) {
            height = parentHeight - (this._top + this._bottom);
        } else {
            height = (this._heightOrigin || 0) * scaleY;
        }
        // width = Math.max(0, width);
        // height = Math.max(0, height);

        this.width = width;
        this.height = height;

        // if (!forceCalculate && this._widthOrigin != null) {
        //     width = this._widthOrigin;
        // } else {
        //     const referenceWidth = parent.width;
        //     const containerWidth =
        //         parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER ? referenceWidth * parent.scaleX : referenceWidth;
        //     width = containerWidth - (this._left + this._right);
        // }

        // if (!forceCalculate && this._heightOrigin != null) {
        //     height = this._heightOrigin;
        // } else {
        //     const referenceHeight = parent.height;
        //     const containerHeight =
        //         parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER ? referenceHeight * parent.scaleY : referenceHeight;
        //     height = containerHeight - (this._top + this._bottom);
        // }

        return {
            width,
            height,
            parentHeight,
        };
    }

    /**
     * update pre scroll value has handled in updateScroll()
     */
    private _afterRender() {
        // this._preScrollX = this.scrollX;
        // this._preScrollY = this.scrollY;
    }

    private _emitScrollEnd$(scrollSubParam: IScrollObserverParam) {
        clearTimeout(this._scrollStopNum);
        this._scrollStopNum = setTimeout(() => {
            this.onScrollEnd$.emitEvent({
                rawScrollX: scrollSubParam.rawScrollX,
                rawScrollY: scrollSubParam.rawScrollY,
                viewport: this,
                scrollX: this.scrollX,
                scrollY: this.scrollY,
                viewportScrollX: this.viewportScrollX,
                viewportScrollY: this.viewportScrollY,
                limitX: this._scrollBar?.limitX,
                limitY: this._scrollBar?.limitY,
                isTrigger: false,
            });
        }, 2);
    }

    /**
     *
     * When scroll just in X direction, there is no y definition in scrollXY. So scrollXY is Partial<IScrollBarPosition>
     * @param rawScrollXY Partial<IViewportScrollPosition>
     * @param isTrigger
     */
    private _scrollToBarPosCore(rawScrollXY: Partial<IScrollBarPosition>, isTrigger: boolean = true) {
        if (this._scrollBar == null) {
            return;
        }

        // TODO @lumixraku WTF? ?! sheet can not scroll when horizonThumb is invisible ??
        // if (this._scrollBar.hasHorizonThumb()) {...}

        let scrollX = rawScrollXY.x;
        let scrollY = rawScrollXY.y;
        const afterLimit = this.limitedScroll(scrollX, scrollY);
        const viewportScrollXY = this.transScroll2ViewportScrollValue(afterLimit.scrollX, afterLimit.scrollY);
        this.scrollX = scrollX = afterLimit.scrollX;
        this.scrollY = scrollY = afterLimit.scrollY;
        this.viewportScrollX = viewportScrollXY.x;
        this.viewportScrollY = viewportScrollXY.y;

        const scrollSubParam: IScrollObserverParam = {
            viewport: this,
            scrollX,
            scrollY,
            viewportScrollX: viewportScrollXY.x,
            viewportScrollY: viewportScrollXY.y,
            rawScrollX: rawScrollXY.x,
            rawScrollY: rawScrollXY.y,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        };
        this._scrollBar?.makeDirty(true);

        this.onScrollBefore$.emitEvent(scrollSubParam);
        this.onScrollAfter$.emitEvent(scrollSubParam);
        this._emitScrollEnd$(scrollSubParam);

        return afterLimit;
    }

    /**
     *
     * When scroll just in X direction, there is no y definition in scrollVpPos. So scrollVpPos is Partial<IViewportScrollPosition>
     * @param scrollVpPos Partial<IViewportScrollPosition>
     * @param isTrigger
     */
    private _scrollToViewportPosCore(scrollVpPos: Partial<IViewportScrollPosition>, isTrigger: boolean = true) {
        if (this._scrollBar == null) {
            return;
        }

        let viewportScrollX = scrollVpPos.viewportScrollX ?? this.viewportScrollX;
        let viewportScrollY = scrollVpPos.viewportScrollY ?? this.viewportScrollY;
        const rawScrollXY = this.transViewportScroll2ScrollValue(viewportScrollX, viewportScrollY);
        // const afterLimit = this.limitedScroll(rawScrollXY.x, rawScrollXY.y);
        // const scrollX = afterLimit.scrollX;
        // const scrollY = afterLimit.scrollY;
        // const afterLimitViewportXY = this.transScroll2ViewportScrollValue(scrollX, scrollY);
        // viewportScrollX = afterLimitViewportXY.x;
        // viewportScrollY = afterLimitViewportXY.y;
        const afterLimitViewportXY = this._limitViewportScroll(viewportScrollX, viewportScrollY);
        viewportScrollX = afterLimitViewportXY.viewportScrollX;
        viewportScrollY = afterLimitViewportXY.viewportScrollY;
        const afterLimitScrollXY = this.transViewportScroll2ScrollValue(viewportScrollX, viewportScrollY);
        const scrollX = afterLimitScrollXY.x;
        const scrollY = afterLimitScrollXY.y;

        this.scrollX = scrollX;
        this.scrollY = scrollY;
        this.viewportScrollX = viewportScrollX;
        this.viewportScrollY = viewportScrollY;

        const scrollSubParam: IScrollObserverParam = {
            isTrigger,
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            viewportScrollX,
            viewportScrollY,
            rawScrollX: rawScrollXY.x,
            rawScrollY: rawScrollXY.y,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
        };

        this._scrollBar?.makeDirty(true);

        this.onScrollBefore$.emitEvent(scrollSubParam);
        this.onScrollAfter$.emitEvent(scrollSubParam);
        this._emitScrollEnd$(scrollSubParam);

        return afterLimitViewportXY;
    }

    expandBounds(value: { top: number; left: number; bottom: number; right: number }) {
        const onePixelFix = FIX_ONE_PIXEL_BLUR_OFFSET * 2;
        return {
            left: value.left - this.bufferEdgeX - onePixelFix,
            right: value.right + this.bufferEdgeX + onePixelFix,
            // left: Math.max(this.leftOrigin, value.left - this.bufferEdgeX) - onePixelFix,
            // top: Math.max(this.topOrigin, value.top - this.bufferEdgeY) - onePixelFix,
            top: value.top - this.bufferEdgeY - onePixelFix,
            bottom: value.bottom + this.bufferEdgeY + onePixelFix,
        } as IBoundRectNoAngle;
    }

    updatePrevCacheBounds(viewBound?: IBoundRectNoAngle) {
        if (viewBound) {
            this.preCacheBound = this.cacheBound = this.expandBounds(viewBound);
        }
    }

    private _calcCacheUpdate(viewBound: IBoundRectNoAngle, preCacheVisibleBound:
        IBoundRectNoAngle | null, _diffX: number, _diffY: number): number {
        if (!this._cacheCanvas) return 0b00;
        if (!preCacheVisibleBound) return 0b01;
        const viewBoundOutCacheArea =
            viewBound.right > preCacheVisibleBound.right ||
                viewBound.top < preCacheVisibleBound.top ||
                viewBound.left < preCacheVisibleBound.left ||
                viewBound.bottom > preCacheVisibleBound.bottom
                ? 0b01
                : 0b00;

        const edgeX = this.bufferEdgeX / 50;
        const edgeY = this.bufferEdgeY / 50;

        const nearEdge = (preCacheVisibleBound.right - viewBound.right < edgeX) ||
            (viewBound.left - preCacheVisibleBound.left < edgeX) ||
            (viewBound.top - preCacheVisibleBound.top < edgeY) ||
            (preCacheVisibleBound.bottom - viewBound.bottom < edgeY)
            ? 0b101
            : 0b00;

        const shouldCacheUpdate = nearEdge | viewBoundOutCacheArea;
        return shouldCacheUpdate;
    }

    private _diffViewBound(mainBound: IBoundRectNoAngle, subBound: Nullable<IBoundRectNoAngle>) {
        if (subBound == null) {
            return [mainBound];
        }

        const range1: IRange = {
            startRow: mainBound.top,
            endRow: mainBound.bottom,
            startColumn: mainBound.left,
            endColumn: mainBound.right,
        };

        const range2: IRange = {
            startRow: subBound.top,
            endRow: subBound.bottom,
            startColumn: subBound.left,
            endColumn: subBound.right,
        };

        const ranges = subtractViewportRange(range1, range2);

        return ranges.map((range) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            return {
                left: startColumn,
                top: startRow,
                right: endColumn,
                bottom: endRow,
            };
        });
    }

    private _calcDiffCacheBound(prevBound: Nullable<IBoundRectNoAngle>, currBound: IBoundRectNoAngle) {
        if (!prevBound) {
            return [currBound];
        }
        const additionalAreas: IBoundRectNoAngle[] = [];

        // curr has an extra part on the left compared to prev.
        if (currBound.left < prevBound.left) {
            additionalAreas.push({
                top: currBound.top,
                bottom: currBound.bottom,
                left: currBound.left,
                right: prevBound.left,
            });
        }

        // curr has an extra part on the right compared to prev.
        if (currBound.right > prevBound.right) {
            additionalAreas.push({
                top: currBound.top,
                bottom: currBound.bottom,
                left: prevBound.right,
                right: currBound.right,
            });
        }

        if (currBound.top < prevBound.top) {
            additionalAreas.push({
                top: currBound.top,
                bottom: prevBound.top,
                left: Math.max(prevBound.left, currBound.left),
                right: Math.min(prevBound.right, currBound.right),
            });
        }

        if (currBound.bottom > prevBound.bottom) {
            additionalAreas.push({
                top: prevBound.bottom,
                bottom: currBound.bottom,
                left: Math.max(prevBound.left, currBound.left),
                right: Math.min(prevBound.right, currBound.right),
            });
        }
        const expandX = this.bufferEdgeX;
        const expandY = this.bufferEdgeY;
        for (const bound of additionalAreas) {
            bound.left = bound.left - expandX;
            bound.right = bound.right + expandX;
            bound.top = bound.top - expandY;
            bound.bottom = bound.bottom + expandY;
        }

        return additionalAreas;
    }

    private _drawScrollbar(ctx: UniverRenderingContext) {
        if (!this._scrollBar) {
            return;
        }
        const parent = this._scene.getParent();
        if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            this._scrollBar.render(ctx);
        } else if (parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            this._scrollBar.render(ctx);
        }
    }

    private _setViewportWidthAndHeight(props?: IViewProps) {
        if (props?.top != null) {
            this.top = props.top;
        }

        if (props?.left != null) {
            this.left = props.left;
        }

        if (props?.bottom != null) {
            this.bottom = props.bottom;
        }

        if (props?.right != null) {
            this.right = props.right;
        }

        if (Tools.isDefine(props?.width) && !this._isRelativeX) {
            this.width = props?.width;
            this._widthOrigin = this.width;
        } else {
            this.width = null;
            this._widthOrigin = null;
        }

        if (Tools.isDefine(props?.height) && !this._isRelativeY) {
            this.height = props?.height;
            this._heightOrigin = this.height;
        } else {
            this.height = null;
            this._heightOrigin = null;
        }
    }

    private _getBoundScale(scaleX: number, scaleY: number) {
        scaleX = this._isRelativeX ? (scaleX < 1 ? 1 : scaleX) : scaleX;
        scaleY = this._isRelativeY ? (scaleY < 1 ? 1 : scaleY) : scaleY;

        return { scaleX, scaleY };
    }

    /**
     * main canvas element resize
     * called by this.scene.getEngine()?.onTransformChange$.add
     */
    private _mainCanvasResizeHandler() {
        this.markForceDirty(true);
    }
}
