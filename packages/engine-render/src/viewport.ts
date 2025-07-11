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

import type { EventState, IPosition, IRange, Nullable } from '@univerjs/core';
import type { BaseObject } from './base-object';

import type { IWheelEvent } from './basics/i-events';
import type { IBoundRectNoAngle, IViewportInfo } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import type { Scene } from './scene';
import type { ScrollBar } from './shape/scroll-bar';
import { EventSubject, Tools } from '@univerjs/core';
import { Subject } from 'rxjs';
import { RENDER_CLASS_TYPE } from './basics/const';
import { fixLineWidthByScale, toPx } from './basics/tools';
import { Transform } from './basics/transform';
import { Vector2 } from './basics/vector2';
import { subtractViewportRange } from './basics/viewport-subtract';
import { Canvas as UniverCanvas } from './canvas';

interface ILimitedScrollResult {
    viewportScrollX: number;
    viewportScrollY: number;
    isLimitedX?: boolean;
    isLimitedY?: boolean;
}

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

    explicitViewportWidthSet?: boolean;
    explicitViewportHeightSet?: boolean;

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

export interface IViewportReSizeParam {
    width: number;
    height: number;
    left: number;
    top: number;
    paddingStartX?: number;
    paddingStartY?: number;
    paddingEndX?: number;
    paddingEndY?: number;
}

const MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR = 3;

export class Viewport {
    private _viewportKey: string = '';

    /**
     * scrollX means scroll x value for scrollbar in viewMain
     * use getBarScroll to get scrolling value(scrollX, scrollY) for scrollbar
     */
    _scrollX: number = 0;
    _scrollY: number = 0;
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
    onScrollEnd$ = new EventSubject<IScrollObserverParam>();
    onScrollByBar$ = new EventSubject<IScrollObserverParam>();
    onResized$ = new Subject<IViewportReSizeParam>();

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

    /**
     * this._topOrigin * scaleY;
     */
    private _top: number = 0;
    /**
     * this._leftOrigin * scaleX;
     */
    private _left: number = 0;
    private _bottom: number = 0;
    private _right: number = 0;
    private _width: Nullable<number>;
    private _height: Nullable<number>;

    private _scene!: Scene;

    private _scrollBar?: Nullable<ScrollBar>;

    private _isWheelPreventDefaultX: boolean = false;
    private _isWheelPreventDefaultY: boolean = false;

    private _scrollStopNum: NodeJS.Timeout | number = 0;

    private _clipViewport = true;
    private _active = true;

    /**
     * after create a freeze column & row, there is a "padding distance" from row header to curr viewport.
     */
    private _paddingStartX: number = 0;
    private _paddingEndX: number = 0;
    private _paddingStartY: number = 0;
    private _paddingEndY: number = 0;

    /**
     * viewbound of cache area, cache area is slightly bigger than viewbound.
     */
    private _cacheBound: IBoundRectNoAngle | null;
    private _preCacheBound: IBoundRectNoAngle | null;
    private _preCacheVisibleBound: IBoundRectNoAngle | null;

    /**
     * bound of visible area
     */
    private _viewBound: IBoundRectNoAngle = { top: 0, left: 0, bottom: 0, right: 0 };
    private _preViewBound: IBoundRectNoAngle;

    /**
     *  Whether the viewport needs to be updated.
     *  In future, viewMain dirty would not affect other viewports.
     */
    private _isDirty = true;

    /**
     * Canvas for cache if allowCache is true.
     */
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

    constructor(viewportKey: string, scene: Scene, props?: IViewProps) {
        this._viewportKey = viewportKey;
        this._scene = scene;
        this._scene.addViewport(this);
        this._active = Tools.isDefine(props?.active) ? props?.active : true;

        this.setViewportSize(props);
        this.initCacheCanvas(props, scene);

        this._isWheelPreventDefaultX = props?.isWheelPreventDefaultX || false;
        this._isWheelPreventDefaultY = props?.isWheelPreventDefaultY || false;

        this.resetCanvasSizeAndUpdateScroll();
        this.getBounding();

        this.scene.getEngine()?.onTransformChange$.subscribeEvent(() => {
            this.markForceDirty(true);
        });
        this.markForceDirty(true);
    }

    initCacheCanvas(props: IViewProps | undefined, scene: Scene) {
        this._allowCache = props?.allowCache || false;
        if (this._allowCache) {
            this._cacheCanvas = new UniverCanvas({ colorService: scene.getEngine()?.canvasColorService });
            this.bufferEdgeX = props?.bufferEdgeX || 0;
            this.bufferEdgeY = props?.bufferEdgeY || 0;
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

    set height(height: Nullable<number>) {
        const maxHeight = this.scene.getParent().height;
        if (Tools.isDefine(height)) {
            this._height = Tools.clamp(height!, 0, maxHeight);
        } else {
            this._height = height;
        }
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
        // const { x } = this.transViewportScroll2ScrollValue(this._viewportScrollX, this._viewportScrollY);
        // this.scrollX = x;
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

    set scrollX(val: number) {
        this._scrollX = val;
    }

    set scrollY(val: number) {
        this._scrollY = val;
    }

    get scrollX() {
        return this._scrollX;
    }

    get scrollY() {
        return this._scrollY;
    }

    set top(num: number) {
        this._topOrigin = num;
        this._top = toPx(num, this._scene?.getParent()?.height);
    }

    set left(num: number) {
        this._leftOrigin = num;
        this._left = toPx(num, this.scene.getParent()?.width);
    }

    set bottom(num: number) {
        this._bottomOrigin = num;
        this._bottom = toPx(num, this.scene.getParent()?.height);
    }

    set right(num: number) {
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

    get _deltaScrollX() {
        return this.scrollX - this._preScrollX;
    }

    get _deltaScrollY() {
        return this.scrollY - this._preScrollY;
    }

    get _deltaViewportScrollX() {
        return this.viewportScrollX - this._preViewportScrollX;
    }

    get _deltaViewportScrollY() {
        return this.viewportScrollY - this._preViewportScrollY;
    }

    get canvas() { return this._cacheCanvas; }

    enable() {
        this._active = true;
    }

    disable() {
        this._active = false;
    }

    /**
     * canvas resize & freeze change would invoke this method
     */
    resetCanvasSizeAndUpdateScroll() {
        this._resizeCacheCanvas();
        this._updateScrollByViewportScrollValue();
        this.onResized$.next({
            width: this._width,
            height: this._height,
            left: this._left,
            top: this._top,
            paddingStartX: this._paddingStartX,
            paddingEndX: this._paddingEndX,
            paddingStartY: this._paddingStartY,
            paddingEndY: this._paddingEndY,
        } as IViewportReSizeParam);
    }

    setScrollBar(instance: ScrollBar) {
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
        this.setViewportSize(position);
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
     * ScrollBar scroll to certain position.
     * @param pos position of scrollBar
     */
    // There are serval cases to call this method.
    // the most common case is scrolling. Other situations include:
    // 1. changing the frozen row & col settings
    // 2. changing curr skeleton
    // 3. changing selection which cross viewport
    // 4. changing the viewport size (also include change window size)
    // 5. changing the scroll bar position(click at certain pos of scroll track)
    // Debug
    // scene.getViewports()[0].scrollTo({x: 14.2, y: 1.8}, true)
    scrollToBarPos(pos: Partial<IScrollBarPosition>) {
        return this._scrollToBarPosCore(pos);
    }

    /**
     * Scrolling by current position plus delta.
     * the most common case is triggered by scroll-timer(in sheet)
     * @param delta
     * @returns isLimited
     */
    scrollByBarDeltaValue(delta: Partial<IScrollBarPosition>, isTrigger = true) {
        const x = this.scrollX + (delta.x || 0);
        const y = this.scrollY + (delta.y || 0);
        return this._scrollToBarPosCore({ x, y }, isTrigger);
    }

    /**
     * Viewport scroll to certain position.
     * @param pos
     * @param isTrigger
     * @returns {ILimitedScrollResult | null | undefined}
     */
    scrollToViewportPos(pos: Partial<IViewportScrollPosition>, isTrigger = true) {
        // TODO @lumixraku Now scrollManager only call viewportMain@scrollToViewportPos.
        // this method in other viewports won't get called.
        // viewport is inactive when it's out of visible area (see #univer-pro/issues/2479)
        // so there should not return when inactive.
        // it's not right, this method in other viewport should be called.

        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const { viewportScrollX, viewportScrollY } = pos;
        return this._scrollToViewportPosCore({ viewportScrollX, viewportScrollY }, isTrigger);
    }

    /**
     * Scrolling by current position plus delta.
     * if viewport can not scroll(e.g. viewport size is bigger than content size), then return null.
     * @param delta
     * @param isTrigger
     * @returns {ILimitedScrollResult | null | undefined}
     */
    scrollByViewportDeltaVal(delta: IViewportScrollPosition, isTrigger = true) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const viewportScrollX = this.viewportScrollX + (delta.viewportScrollX || 0);
        const viewportScrollY = this.viewportScrollY + (delta.viewportScrollY || 0);
        return this._scrollToViewportPosCore({ viewportScrollX, viewportScrollY }, isTrigger);
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

    /**
     * Just record state of scroll. This method won't scroll viewport and scrollbar.
     * TODO: @lumixraku this method is so wried, viewportMain did not call it, now only called in freeze situation.
     * @param current
     * @returns Viewport
     */
    updateScrollVal(current: Partial<IScrollObserverParam>) {
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
        }

        if (viewportScrollY !== undefined) {
            this._preViewportScrollY = this.viewportScrollY;
            this.viewportScrollY = viewportScrollY;
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
     * Render function in each render loop.
     * @param parentCtx parentCtx is cacheCtx from layer when layer._allowCache is true
     * @param objects
     * @param isMaxLayer
     */
    render(parentCtx?: UniverRenderingContext, objects: BaseObject[] = [], isMaxLayer = false): void {
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
        const viewPortInfo = this.calcViewportInfo();

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
        // TODO @lumixraku, preScrollX is also handled by updateScroll(), this method is empty.
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
    calcViewportInfo(): IViewportInfo {
        if (this.isActive === false) {
            return this._makeDefaultViewport();
        }

        const sceneTrans = this._scene.transform.clone();

        let width = this._width;
        let height = this._height;
        const size = this._calcViewPortSize();

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

    /**
     * Get viewport info
     * @deprecated use `calcViewportInfo`
     */
    getBounding() {
        return this.calcViewportInfo();
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
     * In sheet, wheel event is handled by scroll.render-controller@scene.onMouseWheel$
     * @param evt
     * @param state
     */

    onMouseWheel(evt: IWheelEvent, state: EventState) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        let offsetX = 0;
        let offsetY = 0;
        const allWidth = this._scene.width;
        const viewWidth = this.width || 1;
        offsetX = (viewWidth / allWidth) * evt.deltaX;

        const allHeight = this._scene.height;
        const viewHeight = this.height || 1;
        if (evt.shiftKey) {
            offsetX = (viewHeight / allHeight) * evt.deltaY * MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR;
        } else {
            offsetY = (viewHeight / allHeight) * evt.deltaY;
        }

        const isLimitedStore = this.scrollByBarDeltaValue({
            x: offsetX,
            y: offsetY,
        });

        if (isLimitedStore && !isLimitedStore.isLimitedX && !isLimitedStore.isLimitedY) {
            // if viewport still have space to scroll, prevent default event. (DO NOT move canvas element)
            // if scrolling is reaching limit, let scrolling event do the default behavior.
            evt.preventDefault();
            if (this._scene.getParent().classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                state.stopPropagation();
            }
        }

        if (this._isWheelPreventDefaultX && this._isWheelPreventDefaultY) {
            evt.preventDefault();
        }

        this._scene.makeDirty(true);
    }

    /**
     * Check if coord is in viewport.
     * Coord is relative to canvas (scale is handled in isHit, Just pass in the original coord from event)
     * @param coord
     * @returns {boolean} is in viewport
     */
    isHit(coord: Vector2) {
        if (this.isActive === false) {
            return false;
        }
        const { width, height } = this._calcViewPortSize();
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
        // this.onScrollBefore$.complete();
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
        const { height, width } = this._calcViewPortSize();
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
     */
    _limitViewportScroll(viewportScrollX: number, viewportScrollY: number): ILimitedScrollResult {
        const { width, height } = this._calcViewPortSize();
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
        const { width, height } = this._calcViewPortSize();
        this.width = width;
        this.height = height;
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
     * Update scroll when viewport is resizing and removing rol & col
     */
    private _updateScrollByViewportScrollValue() {
        // zoom.render-controller ---> scene._setTransform --> _updateScrollBarPosByViewportScroll
        // viewport width is negative when canvas container has not been set to engine.
        if (!this.width || this.width < 0) return;
        if (!this.height || this.height < 0) return;
        const { width, height } = this._calcViewPortSize();
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

    private _calcViewPortSize() {
        const parent = this._scene.getParent();
        const { width: parentWidth, height: parentHeight } = parent;
        const { scaleX = 1, scaleY = 1 } = this._scene;

        let width;
        let height;

        const left = this._leftOrigin * scaleX;
        const top = this._topOrigin * scaleY;

        this._left = left;
        this._top = top;

        if (Tools.isDefine(this._widthOrigin)) {
            // viewMainLeft viewMainLeftTop ---> width is specific by freeze line
            width = (this._widthOrigin || 0) * scaleX;
        } else {
            // viewMainTop  viewMain
            width = parentWidth - (this._left + this._right);
        }

        if (Tools.isDefine(this._heightOrigin)) {
            //viewMainLeftTop viewMainTop ---> height is specific by freeze line
            height = (this._heightOrigin || 0) * scaleY;
        } else {
            // viewMainLeft viewMain
            height = parentHeight - (this._top + this._bottom);
        }
        // width = Math.max(0, width);
        // height = Math.max(0, height);

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

    /**
     * mock scrollend.
     * @param scrollSubParam
     */
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
        this.onScrollAfter$.emitEvent(scrollSubParam);
        this._emitScrollEnd$(scrollSubParam);

        // exec sheet.command.scroll-view
        this.onScrollByBar$.emitEvent({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            viewportScrollX: this.viewportScrollX,
            viewportScrollY: this.viewportScrollY,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        });
        return afterLimit;
    }

    /**
     * Scroll to position in viewport.
     * @param scrollVpPos Partial<IViewportScrollPosition>
     * @param isTrigger
     */
    private _scrollToViewportPosCore(scrollVpPos: Partial<IViewportScrollPosition>, isTrigger: boolean = true): Nullable<ILimitedScrollResult> {
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

        this._preScrollX = this.scrollX;
        this._preScrollY = this.scrollY;
        this._preViewportScrollX = this.viewportScrollX;
        this._preViewportScrollY = this.viewportScrollY;
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

        // set valid scrollInfo
        this.onScrollAfter$.emitEvent(scrollSubParam);
        this._emitScrollEnd$(scrollSubParam);

        return afterLimitViewportXY;
    }

    expandBounds(value: { top: number; left: number; bottom: number; right: number }) {
        const onePixelFix = 0;//FIX_ONE_PIXEL_BLUR_OFFSET * 2;
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

    setViewportSize(props?: IViewProps) {
        if (Tools.isDefine(props?.top)) {
            this.top = props.top;
        }

        if (Tools.isDefine(props?.left)) {
            this.left = props.left;
        }

        if (Tools.isDefine(props?.bottom)) {
            this.bottom = props.bottom;
        }

        if (Tools.isDefine(props?.right)) {
            this.right = props.right;
        }

        if (Tools.isDefine(props?.width)) {
            this.width = props?.width;
            this._widthOrigin = props?.width;
        } else {
            // this.width = null;
            // this._widthOrigin = null;
        }

        if (Tools.isDefine(props?.height)) {
            this.height = props?.height;
            this._heightOrigin = props?.height;
        } else {
            // this.height = null;
            // this._heightOrigin = null;
        }
    }
}
