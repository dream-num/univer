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
import { Observable, Tools } from '@univerjs/core';

import type { BaseObject } from './base-object';
import { RENDER_CLASS_TYPE } from './basics/const';
import type { IWheelEvent } from './basics/i-events';
import { PointerInput } from './basics/i-events';
import { fixLineWidthByScale, getScale, toPx } from './basics/tools';
import { Transform } from './basics/transform';
import type { IBoundRectNoAngle, IViewportInfo } from './basics/vector2';
import { Vector2 } from './basics/vector2';
import { subtractViewportRange } from './basics/viewport-subtract';
import { Spreadsheet } from './components/sheets/spreadsheet';
import type { UniverRenderingContext } from './context';
import { Scene } from './scene';
import type { BaseScrollBar } from './shape/base-scroll-bar';
import type { ThinScene } from './thin-scene';
import { Canvas as UniverCanvas } from './canvas';

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
    scrollX?: number;
    scrollY?: number;
    x?: number;
    y?: number;
    actualScrollX?: number;
    actualScrollY?: number;
    limitX?: number;
    limitY?: number;
    isTrigger?: boolean;
}

interface IScrollBarPosition {
    x?: number;
    y?: number;
}

enum SCROLL_TYPE {
    scrollTo,
    scrollBy,
}

const MOUSE_WHEEL_SPEED_SMOOTHING_FACTOR = 3;
const BUFFER_EDGE_SIZE_X = 100;
const BUFFER_EDGE_SIZE_Y = 50;
export { BUFFER_EDGE_SIZE_X, BUFFER_EDGE_SIZE_Y };
const bufferMap = {
    'viewMain': {
        BUFFER_EDGE_SIZE_X: 100,
        BUFFER_EDGE_SIZE_Y: 50,
    },
    'viewMainTop': {
        BUFFER_EDGE_SIZE_X: 100,
        BUFFER_EDGE_SIZE_Y: 0,
    },
    'viewMainLeft': {
        BUFFER_EDGE_SIZE_X: 0,
        BUFFER_EDGE_SIZE_Y: 50,
    },
    'viewMainLeftTop': {
        BUFFER_EDGE_SIZE_X: 0,
        BUFFER_EDGE_SIZE_Y: 0,
    }
}
const calcBufferSize = (viewPortKey: keyof typeof bufferMap) => {
    return bufferMap[viewPortKey] || {
        BUFFER_EDGE_SIZE_X: 0,
        BUFFER_EDGE_SIZE_Y: 0,
    };
}
export { calcBufferSize };
export class Viewport {
    /**
     * scrollX means scroll x value for scrollbar in viewMain
     * use getBarScroll to get scrolling value(scrollX, scrollY) for scrollbar
     */
    scrollX: number = 0;
    scrollY: number = 0;
    _preScrollX: number = 0;
    _preScrollY: number = 0;
    _deltaScrollX: number = 0;
    _deltaScrollY: number = 0;

    /**
     * The actual scroll offset equals the distance from the content area position to the top, and there is a conversion relationship with scrollX and scrollY
     * use getActualScroll to get scrolling value for spreadsheet.
     */
    actualScrollX: number = 0;

    actualScrollY: number = 0;

    onMouseWheelObserver = new Observable<IWheelEvent>();

    onScrollAfterObserver = new Observable<IScrollObserverParam>();

    onScrollBeforeObserver = new Observable<IScrollObserverParam>();

    onScrollStopObserver = new Observable<IScrollObserverParam>();

    onScrollByBarObserver = new Observable<IScrollObserverParam>();

    private _viewPortKey: string = '';

    private _topOrigin: number = 0;

    /**
     * 没有处理 scaleX 的 left 值
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

    private _renderClipState = true;

    private _active = true;

    private _paddingStartX: number = 0;

    private _paddingEndX: number = 0;

    private _paddingStartY: number = 0;

    private _paddingEndY: number = 0;

    private _isRelativeX: boolean = false;

    private _isRelativeY: boolean = false;

    private _preViewportInfo: Nullable<IViewportInfo>;


    /**
     * viewbound of cache area, cache area is slightly bigger than viewbound.
     */
    private _cacheBound: IBoundRectNoAngle;
    private _preCacheBound: IBoundRectNoAngle;

    /**
     * bound of visible area
     */
    private _viewBound: IBoundRectNoAngle;
    private _preViewBound: IBoundRectNoAngle;

    private _isDirty = true;
    private _cacheCanvas: UniverCanvas | null = null;
    private _allowCache: boolean = true;
    /**
     * 主 canvas 宽高
     * 用于和 viewport 下的 position 计算得到 cacheCanvas 大小
     */
    private _mainCanvasW: number;
    private _mainCanvasH: number;

    /**
     * Buffer Area size, default is zero
     */
    bufferEdgeX: number = 0;
    bufferEdgeY: number = 0;

    constructor(viewPortKey: string, scene: ThinScene, props?: IViewProps) {
        this._viewPortKey = viewPortKey;

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

        this._setWithAndHeight(props);
        this.initCacheCanvas(props);

        this._isWheelPreventDefaultX = props?.isWheelPreventDefaultX || false;
        this._isWheelPreventDefaultY = props?.isWheelPreventDefaultY || false;

        this._resizeCacheCanvasAndScrollBar();
        this.getBounding();

        this.scene.getEngine()?.onTransformChangeObservable.add(() => {
            this._spreadSheetResizeHandler();
        });
        this._spreadSheetResizeHandler();

        this._testDisplayCache();
    }

    initCacheCanvas(props?: IViewProps) {
        if(props?.allowCache) {
            this._cacheCanvas = new UniverCanvas();
        }
        this._allowCache = props?.allowCache || true;
        this.bufferEdgeX = props?.bufferEdgeX || 0;
        this.bufferEdgeY = props?.bufferEdgeY || 0;
    }


    _testDisplayCache() {
        const globalThis = window as any;
        if (!globalThis.cacheSet) {
            globalThis.cacheSet = new Set();
        }
        const showCache = (cacheCanvas: UniverCanvas) => {
            cacheCanvas.getCanvasEle().style.zIndex = '100';
            cacheCanvas.getCanvasEle().style.position = 'fixed';
            cacheCanvas.getCanvasEle().style.background = 'pink';
            cacheCanvas.getCanvasEle().style.pointerEvents = 'none'; // 禁用事件响应
            cacheCanvas.getCanvasEle().style.border = '1px solid black'; // 设置边框样式
            cacheCanvas.getCanvasEle().style.transformOrigin = '100% 100%';
            cacheCanvas.getCanvasEle().style.transform = 'scale(0.5)';
            // cacheCanvas.getCanvasEle().style.opacity = '0.9';
            document.body.appendChild(cacheCanvas.getCanvasEle());
        }
        if(['viewMain', 'viewMainLeftTop', 'viewMainTop', 'viewMainLeft'].includes(this.viewPortKey )) {
            if(this._cacheCanvas) {
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

    get viewPortKey() {
        return this._viewPortKey;
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

    enable() {
        this._active = true;
    }

    disable() {
        this._active = false;
    }

    /**
     * 物理 canvas 大小改变时调用(调整 window 大小时触发)
     */
    resetSizeAndScrollBar() {
        this._resizeCacheCanvasAndScrollBar();
    }

    setScrollBar(instance: BaseScrollBar) {
        this._scrollBar = instance;
        this._resizeCacheCanvasAndScrollBar();
    }

    removeScrollBar() {
        this._scrollBar = null;
    }

    /**
     * 和 resetSizeAndScrollBar 不同
     * 此方法是调整冻结行列设置时 & 初始化时触发, resize window 时并不会触发
     *
     * 注意参数 position 不一定有 height & width  对于 viewMain 只有 left top bottom right
     * this.width this.height 也有可能是 undefined
     * 因此应通过 _getViewPortSize 获取宽高
     * @param position
     * @returns
     */
    resize(position: IViewPosition) {
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
        this._setWithAndHeight(position);



        this._resizeCacheCanvasAndScrollBar();
        this.makeForceDirty();
    }

    setPadding(param: IPosition) {
        const { startX = 0, startY = 0, endX = 0, endY = 0 } = param;
        this._paddingStartX = startX;
        this._paddingEndX = endX;
        this._paddingStartY = startY;
        this._paddingEndY = endY;

        this._resizeCacheCanvasAndScrollBar();
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
     *
     * 改动 scrollbar 的位置，不是 viewport content 滚动
     * scroll to position, absolute
     * 只有 viewMain 才会被调用 scrollTo 其他 viewport 都不会调用此方法
     * 具体在 scroll.controller 中
     *
     * Debug
     * window.scene.getViewports()[0].scrollTo({x: 14.2, y: 1.8}, true)
     * @param pos
     * @returns
     */
    scrollTo(pos: IScrollBarPosition, isTrigger = true) {
        return this._scroll(SCROLL_TYPE.scrollTo, pos, isTrigger);
    }

    /**
     * current position plus offset, relative
     * @param pos
     * @returns
     */
    scrollBy(pos: IScrollBarPosition, isTrigger = true) {
        return this._scroll(SCROLL_TYPE.scrollBy, pos, isTrigger);
    }

    scrollByBar(pos: IScrollBarPosition, isTrigger = true) {
        this._scroll(SCROLL_TYPE.scrollBy, pos, isTrigger);
        const { x, y } = pos;
        this.onScrollByBarObserver.notifyObservers({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            x,
            y,
            actualScrollX: this.actualScrollX,
            actualScrollY: this.actualScrollY,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        });
    }

    /**
     * current position plus offset relatively
     * the caller no need to deal with the padding when frozen
     * @param offsetX
     * @param offsetY
     * @param isTrigger
     * @returns
     */
    scrollByOffset(offsetX = 0, offsetY = 0, isTrigger = true) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        const x = offsetX + this._paddingStartX;
        const y = offsetY + this._paddingStartY;
        const param = this.getBarScroll(x, y);
        return this.scrollBy(param, isTrigger);
    }

    getBarScroll(actualX: number, actualY: number) {
        let x = actualX - this._paddingStartX;
        let y = actualY - this._paddingStartY;

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

    getActualScroll(scrollX: number, scrollY: number) {
        let x = scrollX;
        let y = scrollY;
        if (this._scrollBar) {
            const { scaleX, scaleY } = this.scene;
            if (this._scrollBar.ratioScrollX !== 0) {
                x /= this._scrollBar.ratioScrollX; // 转换为内容区实际滚动距离
                x /= scaleX;
            } else if (this.actualScrollX !== undefined) {
                x = this.actualScrollX;
            } else {
                x = 0;
            }

            if (this._scrollBar.ratioScrollY !== 0) {
                y /= this._scrollBar.ratioScrollY;

                y /= scaleY;
            } else if (this.actualScrollY !== undefined) {
                y = this.actualScrollY;
            } else {
                y = 0;
            }

            // console.log(y, this._scrollBar.miniThumbRatioY);
            // x *= this._scrollBar.miniThumbRatioX;
            // y *= this._scrollBar.miniThumbRatioY;
        } else {
            if (this.actualScrollX !== undefined) {
                x = this.actualScrollX;
            } else {
                x = 0;
            }

            if (this.actualScrollY !== undefined) {
                y = this.actualScrollY;
            } else {
                y = 0;
            }
        }

        const { scaleX, scaleY } = (this._scene as Scene).getPrecisionScale();

        return {
            x: fixLineWidthByScale(x + this._paddingStartX, scaleX),
            y: fixLineWidthByScale(y + this._paddingStartY, scaleY),
        };
    }

    /**
     * get actual scroll value by scrollXY
     * @returns
     */
    getTransformedScroll() {
        const x = this.scrollX;
        const y = this.scrollY;

        return this.getActualScroll(x, y);
    }

    getScrollBar() {
        return this._scrollBar;
    }

    // _scrollTo ---> _scroll ---> onScrollAfterObserver.notifyObservers ---> updateScroll
    updateScroll(param: IScrollObserverParam) {
        this._deltaScrollX = this.scrollX - this._preScrollX;
        this._deltaScrollY = this.scrollY - this._preScrollY;
        this._preScrollX = this.scrollX;
        this._preScrollY = this.scrollY;
        const { scrollX, scrollY, actualScrollX, actualScrollY } = param;
        if (scrollX !== undefined) {
            this.scrollX = scrollX;
        }

        if (scrollY !== undefined) {
            this.scrollY = scrollY;
        }

        if (actualScrollX !== undefined) {
            this.actualScrollX = actualScrollX;
        }

        if (actualScrollY !== undefined) {
            this.actualScrollY = actualScrollY;
        }
        return this;
    }

    getScrollBarTransForm() {
        const composeResult = Transform.create();

        composeResult.multiply(Transform.create([1, 0, 0, 1, this._left, this._top]));

        return composeResult;
    }

    /**
     * engine.renderLoop ---> scene.render ---> layer.render ---> viewport.render
     * that means each layer call all viewports to render !!!
     * @param parentCtx 如果 layer._allowCache true, 那么 parentCtx 是 layer 中的 cacheCtx
     * @param objects
     * @param isMaxLayer
     * @param isLast
     * @returns
     */
    render(parentCtx?: UniverRenderingContext, objects: BaseObject[] = [], isMaxLayer = false, isLast = false) {
        if (
            this.isActive === false ||
            this.width == null ||
            this.height == null ||
            this.width <= 1 ||
            this.height <= 1
        ) {
            return;
        }
        const mainCtx = parentCtx || (this._scene.getEngine()?.getCanvas().getContext() as UniverRenderingContext);

        const sceneTrans = this._scene.transform.clone();
        sceneTrans.multiply(Transform.create([1, 0, 0, 1, -this.actualScrollX || 0, -this.actualScrollY || 0]));

        // 逻辑上的位移
        const sceneTransM = sceneTrans.getMatrix();
        const scrollbarTransMatrix = this.getScrollBarTransForm().getMatrix();

        mainCtx.save();

        if (this._renderClipState) {
            mainCtx.beginPath();
            // DEPT: left is set by upper views but width and height is not

            const { scaleX, scaleY } = this._getBoundScale(sceneTransM[0], sceneTransM[3]);
            mainCtx.rect(this.left, this.top, (this.width || 0), (this.height || 0));
            mainCtx.clip();
        }

        mainCtx.transform(sceneTransM[0], sceneTransM[1], sceneTransM[2], sceneTransM[3], sceneTransM[4], sceneTransM[5]);
        // e = e' * a  f = f' * d  位移 * scale
        // const mainTF = mainCtx.getTransform()
        // // 向右滚动 200 后, mtf.e = -200
        // cacheCtx?.setTransform(mainTF.a, mainTF.b, mainTF.c, mainTF.d, mainTF.e, mainTF.f);
        // cacheCtx?.setTransform(mainTF.a, mainTF.b, mainTF.c, mainTF.d, mainTF.e + BUFFER_EDGE_SIZE * mainTF.a, mainTF.f + BUFFER_EDGE_SIZE * mainTF.d);
        // cacheCtx 修正 实际上 translate 到 mtf.e = 100
        // cacheCtx?.translate(BUFFER_EDGE_SIZE, BUFFER_EDGE_SIZE);
        let viewPortInfo:IViewportInfo = this._calViewportRelativeBounding();


        // scrolling ---> make Dirty
        if(viewPortInfo.diffX !== 0 || viewPortInfo.diffY !== 0 || viewPortInfo.diffBounds.length !== 0) {
            this.makeDirty();
            viewPortInfo.isDirty = true;
        }
        viewPortInfo.cacheCanvas = this._cacheCanvas!;


        objects.forEach((o) => {
            o.render(mainCtx, viewPortInfo);
        });


        if(isLast) {
            objects.forEach((o) => {
                o.makeDirty(false);
                if(o instanceof Spreadsheet) o.makeForceDirty?.(false);
            });
        }
        this.makeDirty(false);
        this.makeForceDirty(false);

        this._preViewportInfo = viewPortInfo;
        this._preViewBound = viewPortInfo.viewBound;
        if(viewPortInfo.shouldCacheUpdate) {
            this._preCacheBound = viewPortInfo.cacheBound;
        }
        mainCtx.restore();

        if (this._scrollBar && isMaxLayer) {
            mainCtx.save();

            mainCtx.transform(scrollbarTransMatrix[0], scrollbarTransMatrix[1], scrollbarTransMatrix[2], scrollbarTransMatrix[3], scrollbarTransMatrix[4], scrollbarTransMatrix[5]);
            this._drawScrollbar(mainCtx);
            mainCtx.restore();
        }

        this._scrollRendered();
    }

    private _calViewportRelativeBounding(): IViewportInfo {
        if (this.isActive === false) {
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
                viewPortKey: this.viewPortKey,
                isDirty: this.isDirty,
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
                sceneTrans:  Transform.create([1, 0, 0, 1, 0, 0]),
                leftOrigin: 0,
                topOrigin: 0,
                bufferEdgeX: this.bufferEdgeX,
                bufferEdgeY: this.bufferEdgeY,
            } satisfies IViewportInfo;
        }

        const sceneTrans = this._scene.transform.clone();

        const m = sceneTrans.getMatrix();

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
        // console.log('height:::', this.viewPortKey, size.height, height, yTo)
        /**
         * @DR-Univer The coordinates here need to be consistent with the clip in the render,
         * which may be caused by other issues that will be optimized later.
         */
        // const sceneTrans = this._scene.transform.clone();
        // const m = sceneTrans.getMatrix();
        // const { scaleX, scaleY } = this._getBoundScale(m[0], m[3]);

        // let differenceX = 0;

        // let differenceY = 0;

        // const ratioScrollX = this._scrollBar?.ratioScrollX ?? 1;

        // const ratioScrollY = this._scrollBar?.ratioScrollY ?? 1;

        // if (this._preScrollX != null) {
        //     differenceX = (this._preScrollX - this.scrollX) / ratioScrollX;
        // }

        // if (this._preScrollY != null) {
        //     differenceY = (this._preScrollY - this.scrollY) / ratioScrollY;
        // }

        // this.getRelativeVector 加上了 scroll 后的坐标
        const topLeft = this.getRelativeVector(Vector2.FromArray([xFrom, yFrom]));
        const bottomRight = this.getRelativeVector(Vector2.FromArray([xTo, yTo]));
        // if(this.viewPortKey == 'viewMain' || this.viewPortKey == 'viewMainLeft'){

        //     console.log('yTo ', this.viewPortKey, yTo, 'bottomRight', bottomRight.y, 'height', height, 'top', this.top)
        // }


        const viewBound = {
            top: topLeft.y,
            left: topLeft.x,
            right: bottomRight.x,
            bottom: bottomRight.y,
        };
        this._viewBound = viewBound;
        const preViewBound = this._preViewportInfo?.viewBound;
        const diffBounds = this._diffViewBound(viewBound, preViewBound);
        const diffX = (preViewBound?.left || 0) - viewBound.left;
        const diffY = (preViewBound?.top || 0) - viewBound.top;
        const viewPortPosition = {
            top: yFrom,
            left: xFrom,
            bottom: yTo,
            right: xTo,
        };
        let cacheBound = this.expandBounds(viewBound)!;
        this._cacheBound = cacheBound;
        if(!this._preCacheBound) {
            this._preCacheBound = this.expandBounds(viewBound);
        }
        let diffCacheBounds: IBoundRectNoAngle[] = [];// = this._diffViewBound(cacheBounds, prevCacheBounds);
        // const prevCacheBounds = this._prevCacheBound;
        // const cacheDiffX = (prevCacheBounds?.left || 0) - cacheBound.left;
        // const cacheDiffY = (prevCacheBounds?.top || 0) - cacheBound.top;
        // this._prevCacheBound.left += diffX;
        // this._prevCacheBound.right += diffX;
        // console.log('prev cache bound', this._preCacheBound.left, this._preCacheBound.right)
        const cacheViewPortPosition = this.expandBounds(viewPortPosition);

        let shouldCacheUpdate = this._shouldCacheUpdate(viewBound, this._preCacheBound, diffX, diffY);
        if(shouldCacheUpdate) {
            diffCacheBounds = this._diffCacheBound(this._preCacheBound, cacheBound);
        }
        if(this.viewPortKey === 'viewMain') {
            console.log('shouldCacheUpdate', shouldCacheUpdate)
            // if(diffX < 0) {
            //     if(shouldCacheUpdate ) {
            //         console.log('shouldCacheUpdate',shouldCacheUpdate, this._preCacheBound.right, diffCacheBounds.length && diffCacheBounds[0].left)
            //     } else {
            //         console.log(`%cError!`,  'background-color: red; color: white', this._preCacheBound.right, diffCacheBounds.length && diffCacheBounds[0].left);
            //     }
            // }
        }

        return {
            viewBound,
            diffBounds,
            diffX,
            diffY,
            viewPortPosition,
            viewPortKey: this.viewPortKey,
            isDirty: this.isDirty,
            isForceDirty: this.isForceDirty,
            allowCache: this._allowCache,
            cacheBound: this.cacheBound,
            diffCacheBounds,
            cacheViewPortPosition,
            shouldCacheUpdate,
            sceneTrans,
            cacheCanvas: this._cacheCanvas!,
            leftOrigin: this._leftOrigin,
            topOrigin: this._topOrigin,
            bufferEdgeX: this.bufferEdgeX,
            bufferEdgeY: this.bufferEdgeY,
        }  satisfies IViewportInfo;
    }

    getBounding() {
        return this._calViewportRelativeBounding();
    }

    getRelativeVector(coord: Vector2) {
        const sceneTrans = this.scene.transform.clone().invert();
        const scroll = this.getTransformedScroll();

        const svCoord = sceneTrans.applyPoint(coord).add(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }

    getAbsoluteVector(coord: Vector2) {
        const sceneTrans = this.scene.transform.clone();
        const scroll = this.getTransformedScroll();

        const svCoord = sceneTrans.applyPoint(coord.subtract(Vector2.FromArray([scroll.x, scroll.y])));
        return svCoord;
    }

    onMouseWheel(evt: IWheelEvent, state: EventState) {
        if (!this._scrollBar || this.isActive === false) {
            return;
        }
        let isLimitedStore;
        if (evt.inputIndex === PointerInput.MouseWheelX) {
            const deltaFactor = Math.abs(evt.deltaX);
            // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
            const allWidth = this._scene.width;
            const viewWidth = this.width || 1;
            const scrollNum = (viewWidth / allWidth) * deltaFactor;

            if (evt.deltaX > 0) {
                isLimitedStore = this.scrollBy({
                    x: scrollNum,
                });
            } else {
                isLimitedStore = this.scrollBy({
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
                    isLimitedStore = this.scrollBy({
                        x: scrollNum,
                    });
                } else {
                    isLimitedStore = this.scrollBy({
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
                    isLimitedStore = this.scrollBy({
                        y: scrollNum,
                    });
                } else {
                    isLimitedStore = this.scrollBy({
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
            // ...
        }

        this._scene.makeDirty(true);
    }

    // 自己是否被选中
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
        this._renderClipState = true;
    }

    closeClip() {
        this._renderClipState = false;
    }

    dispose() {
        this.onMouseWheelObserver.clear();
        this.onScrollAfterObserver.clear();
        this.onScrollBeforeObserver.clear();
        this.onScrollStopObserver.clear();
        this._scrollBar?.dispose();

        this._scene.removeViewport(this._viewPortKey);
    }

    limitedScroll() {
        if (!this._scrollBar) {
            return;
        }

        const limitX = this._scrollBar?.limitX;
        const limitY = this._scrollBar?.limitY;

        let isLimitedX = true;
        let isLimitedY = true;

        if (this.scrollX < 0) {
            this.scrollX = 0;
        } else if (this.scrollX > limitX) {
            this.scrollX = limitX;
        } else {
            isLimitedX = false;
        }

        if (this.scrollY < 0) {
            this.scrollY = 0;
        } else if (this.scrollY > limitY) {
            this.scrollY = limitY;
        } else {
            isLimitedY = false;
        }

        return {
            isLimitedX,
            isLimitedY,
        };
    }

    makeDirty(state?: boolean) {
        if(state == undefined) {
            state = true;
        }
        this._isDirty = state;
    }

    get isDirty() {
        return this._isDirty;
    }

    private _isForceDirty = true;
    makeForceDirty(state?: boolean) {
        if(state !== undefined) {
            this._isForceDirty = state;
        } else {
            this._isForceDirty = true;
        }
    }

    get isForceDirty() {
        return this._isForceDirty;
    }

    private _resizeCacheCanvasAndScrollBar() {
        const actualScrollX = this.actualScrollX;

        const actualScrollY = this.actualScrollY;
        const { width, height, parentHeight } = this._getViewPortSize();

        const scaleX = this.scene.scaleX;
        const scaleY = this.scene.scaleY;
        const canvasW = width + this.bufferEdgeX * 2 * scaleX;
        const canvasH = height + this.bufferEdgeY * 2 * scaleY;

        this._cacheCanvas?.setSize(canvasW, canvasH);

        const contentWidth = (this._scene.width - this._paddingEndX) * this._scene.scaleX;
        const contentHeight = (this._scene.height - this._paddingEndY) * this._scene.scaleY;

        if (this._scrollBar) {
            this._scrollBar.resize(width, height, contentWidth, contentHeight);
            const { x, y } = this.getBarScroll(actualScrollX, actualScrollY);
            this.scrollTo({
                x,
                y,
            });
        }
        this.makeForceDirty(true);
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

        this._width = width;
        this._height = height;

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
            parentHeight
        };
    }

    private _scrollRendered() {
        this._preScrollX = this.scrollX;
        this._preScrollY = this.scrollY;
    }

    private _triggerScrollStop(
        scroll: {
            x: number;
            y: number;
        },
        x?: number,
        y?: number,
        isTrigger = true
    ) {
        clearTimeout(this._scrollStopNum);
        this._scrollStopNum = setTimeout(() => {
            this.onScrollStopObserver.notifyObservers({
                viewport: this,
                scrollX: this.scrollX,
                scrollY: this.scrollY,
                x,
                y,
                actualScrollX: scroll.x,
                actualScrollY: scroll.y,
                limitX: this._scrollBar?.limitX,
                limitY: this._scrollBar?.limitY,
                isTrigger,
            });
        }, 2);
    }

    /**
     * 只有 viewMain 会进入此函数  其他 viewport 不会
     * 滚动事件处理函数
     * 调用方 scroll.controller viewportMain.proscrollTo(config)
     * @param scrollType
     * @param pos viewMain 滚动条的位置
     * @param isTrigger
     * @returns
     */
    private _scroll(scrollType: SCROLL_TYPE, pos: IScrollBarPosition, isTrigger = true) {
        const { x, y } = pos;
        if (this._scrollBar == null) {
            return;
        }

        if (x !== undefined) {
            if (this._scrollBar.hasHorizonThumb()) {
                if (scrollType === SCROLL_TYPE.scrollBy) {
                    this.scrollX += x;
                } else {
                    this.scrollX = x;
                }
            } else {
                this.scrollX = 0;
            }
        }

        if (y !== undefined) {
            if (this._scrollBar.hasVerticalThumb()) {
                if (scrollType === SCROLL_TYPE.scrollBy) {
                    this.scrollY += y;
                } else {
                    this.scrollY = y;
                }
            } else {
                this.scrollY = 0;
            }
        }

        const limited = this.limitedScroll(); // 限制滚动范围
        // 注意只有 viewMain 才能进入到此函数 _scroll 因此其他能滚动的 viewport 要手动 makeDirty
        // 此函数存在一次 wheel 后调用多次问题, 导致后面几次 handler diffX 计算为 0
        // 因此滚动引起的 dirty 在 render 中 makeDirty
        this.onScrollBeforeObserver.notifyObservers({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            x,
            y,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        });


        if (this._scrollBar) {
            this._scrollBar.makeDirty(true);
        }

        const scroll = this.getTransformedScroll();
        this.actualScrollX = scroll.x;
        this.actualScrollY = scroll.y;

        this.onScrollAfterObserver.notifyObservers({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            x,
            y,
            actualScrollX: scroll.x,
            actualScrollY: scroll.y,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
            isTrigger,
        });

        this._triggerScrollStop(scroll, x, y, isTrigger);

        return limited;
    }

    expandBounds(value: {top:number, left: number, bottom: number, right: number}) {
        return {
            left: Math.max(this.left, value.left - BUFFER_EDGE_SIZE_X),
            top: Math.max(this.top, value.top - BUFFER_EDGE_SIZE_Y),
            right: value.right + BUFFER_EDGE_SIZE_X,
            bottom: value.bottom + BUFFER_EDGE_SIZE_Y,
        } as IBoundRectNoAngle;
    }

    updateCacheBounds(viewBound?:IBoundRectNoAngle) {
        if(viewBound) {
            this._cacheBound = this.expandBounds(viewBound);
        } else if(this._preViewportInfo){
            this._cacheBound = this.expandBounds(this._preViewportInfo?.viewBound);
        }
    }

    private _shouldCacheUpdate(viewBound: IBoundRectNoAngle, cacheBounds:
        IBoundRectNoAngle | null, diffX: number, diffY: number): number {
        if (!cacheBounds) return 0b01;
        const viewBoundOutCacheArea = !(viewBound.right <= cacheBounds.right && viewBound.top >= cacheBounds.top
            && viewBound.left >= cacheBounds.left && viewBound.bottom <= cacheBounds.bottom) ? 0b01 : 0b00;

        const edgeX = BUFFER_EDGE_SIZE_X / 2;
        const edgeY = BUFFER_EDGE_SIZE_Y / 2;
        const nearEdge = (diffX < 0 && Math.abs(viewBound.right - cacheBounds.right) < edgeX ||
            diffX > 0 && Math.abs(viewBound.left - cacheBounds.left) < edgeX ||
            // 滚动条向上, 向上往回滚
            diffY > 0 && Math.abs(viewBound.top - cacheBounds.top) < edgeY ||
            // 滚动条向下, 让更多下方的内容呈现到 spread 中,
            diffY < 0 && Math.abs(viewBound.bottom - cacheBounds.bottom) < edgeY) ? 0b10 : 0b00;

        const shouldCacheUpdate = nearEdge | viewBoundOutCacheArea;



        // 这样判断不足, 例如当 viewBound 在 cache top 的边缘但是往下滑动
        // 只要是在 cacheBounds 核心区域内就利用 cache
        // if (viewBound.left - edge > cacheBounds.left &&
        //     viewBound.right + edge < cacheBounds.right &&
        //     viewBound.top - edge > cacheBounds.top &&
        //     viewBound.bottom + edge < cacheBounds.bottom
        // ) {
        //     return 0;
        // }
        // return 1;
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

    private _diffCacheBound(prevBound: Nullable<IBoundRectNoAngle>, currBound: IBoundRectNoAngle) {
        if (!prevBound) {
            return [currBound];
        }
        let additionalAreas: IBoundRectNoAngle[] = [];

        // 如果B在A的左侧有多余部分
        if (currBound.left < prevBound.left) {
            additionalAreas.push({
                top: currBound.top,
                bottom: currBound.bottom,
                left: currBound.left,
                right: prevBound.left
            });
        }

        // 如果B在A的右侧有多余部分
        if (currBound.right > prevBound.right) {
            additionalAreas.push({
                top: currBound.top,
                bottom: currBound.bottom,
                left: prevBound.right,
                right: currBound.right
            });
        }

        // 如果B在A的上方有多余部分
        if (currBound.top < prevBound.top) {
            additionalAreas.push({
                top: currBound.top,
                bottom: prevBound.top,
                left: Math.max(prevBound.left, currBound.left),
                right: Math.min(prevBound.right, currBound.right)
            });
        }

        // 如果B在A的下方有多余部分
        if (currBound.bottom > prevBound.bottom) {
            additionalAreas.push({
                top: prevBound.bottom,
                bottom: currBound.bottom,
                left: Math.max(prevBound.left, currBound.left),
                right: Math.min(prevBound.right, currBound.right)
            });
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

    private _setWithAndHeight(props?: IViewProps) {
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
     * 物理 canvas 大小改变时调用
     * called by this.scene.getEngine()?.onTransformChangeObservable.add
     * @returns
     */
    private _spreadSheetResizeHandler() {
        if(!this._cacheCanvas) return;
        const mainCanvas = this.scene.getEngine().getCanvas();
        let width = mainCanvas.getWidth();
        let height = mainCanvas.getHeight();
        this._mainCanvasW = width;
        this._mainCanvasH = height;
        this.makeForceDirty(true);
    }
}
