import { EventState, Observable, Nullable, IKeyValue } from '@univerjs/core';
import { toPx } from './Basics/Tools';

import { PointerInput, IWheelEvent } from './Basics/IEvents';

import { Canvas } from './Canvas';

import { Scene } from './Scene';

import { IBoundRect, Vector2 } from './Basics/Vector2';

import { Transform } from './Basics/Transform';

import { SceneViewer } from './SceneViewer';

import { ScrollBar } from './Shape/ScrollBar';
import { RENDER_CLASS_TYPE } from './Basics/Const';

interface IViewPosition {
    top?: number | string;
    left?: number | string;
    bottom?: number | string;
    right?: number | string;
    width?: number;
    height?: number;
}

interface IViewProps extends IViewPosition {
    attachX?: boolean;
    attachY?: boolean;
    isWheelPreventDefaultX?: boolean;
    isWheelPreventDefaultY?: boolean;
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
}

interface IScrollBarPosition {
    x?: number;
    y?: number;
}

enum SCROLL_TYPE {
    scrollTo,
    scrollBy,
}

export class Viewport {
    scrollX: number = 0;

    scrollY: number = 0;

    actualScrollX: number;

    actualScrollY: number;

    onMouseWheelObserver = new Observable<IWheelEvent>();

    onScrollAfterObserver = new Observable<IScrollObserverParam>();

    onScrollBeforeObserver = new Observable<IScrollObserverParam>();

    onScrollStopObserver = new Observable<IScrollObserverParam>();

    private _viewPortKey: string;

    private _dirty: boolean = true;

    private _topOrigin: number | string = 0;

    private _leftOrigin: number | string = 0;

    private _bottomOrigin: number | string = 0;

    private _rightOrigin: number | string = 0;

    private _widthOrigin: Nullable<number>;

    private _heightOrigin: Nullable<number>;

    private _top: number = 0;

    private _left: number = 0;

    private _bottom: number = 0;

    private _right: number = 0;

    private _width: Nullable<number>;

    private _height: Nullable<number>;

    private _scene: Scene;

    private _cacheCanvas: Canvas;

    private _scrollBar?: ScrollBar;

    private _isWheelPreventDefaultX: boolean = false;

    private _isWheelPreventDefaultY: boolean = false;

    private _allowCache: boolean = false;

    private _scrollStopNum: number;

    private _preScrollX: Nullable<number> = 0;

    private _preScrollY: Nullable<number> = 0;

    private _renderClipState = true;

    constructor(viewPortKey: string, scene: Scene, props?: IViewProps) {
        this._viewPortKey = viewPortKey;

        this._scene = scene;

        this.top = props?.top || 0;
        this.left = props?.left || 0;
        this.bottom = props?.bottom || 0;
        this.right = props?.right || 0;

        if (props?.width) {
            this.width = props?.width;
            this._widthOrigin = this.width;
        }

        if (props?.height) {
            this.height = props?.height;
            this._heightOrigin = this.height;
        }

        if (this._allowCache) {
            this._cacheCanvas = new Canvas();
        }

        this._isWheelPreventDefaultX = props?.isWheelPreventDefaultX || false;
        this._isWheelPreventDefaultY = props?.isWheelPreventDefaultY || false;

        this._resizeCacheCanvasAndScrollBar();

        this._scene?.getParent().onTransformChangeObservable.add(() => {
            this._resizeCacheCanvasAndScrollBar();
        });
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

    set width(w: Nullable<number>) {
        this._width = w;
    }

    set height(h: Nullable<number>) {
        this._height = h;
    }

    private set top(num: number | string) {
        this._topOrigin = num;
        this._top = toPx(num, this._scene?.getParent()?.height);
    }

    private set left(num: number | string) {
        this._leftOrigin = num;
        this._left = toPx(num, this.scene.getParent()?.width);
    }

    private set bottom(num: number | string) {
        this._bottomOrigin = num;
        this._bottom = toPx(num, this.scene.getParent()?.height);
    }

    private set right(num: number | string) {
        this._rightOrigin = num;
        this._right = toPx(num, this.scene.getParent()?.width);
    }

    resetSize() {
        this._resizeCacheCanvasAndScrollBar(true);
    }

    setScrollBar(instance: ScrollBar) {
        if (this._scrollBar) {
            console.warn('Old scrollBar will be replaced ');
        }
        this._scrollBar = instance;
        this._resizeCacheCanvasAndScrollBar();
    }

    resize(position: IViewPosition) {
        const positionKeys = Object.keys(position);
        if (positionKeys.length === 0) {
            return;
        }
        this._width = undefined;
        this._height = undefined;
        positionKeys.forEach((pKey) => {
            if (position[pKey as keyof IViewPosition] !== undefined) {
                (this as IKeyValue)[pKey] = position[pKey as keyof IViewPosition];
            }
        });
        this._resizeCacheCanvasAndScrollBar();
    }

    resizeScrollBar() {
        this._resizeCacheCanvasAndScrollBar();
    }

    makeDirty(state: boolean = true) {
        this._dirty = state;
    }

    isDirty(): boolean {
        return this._dirty;
    }

    scrollTo(pos: IScrollBarPosition) {
        return this._scroll(SCROLL_TYPE.scrollTo, pos);
    }

    scrollBy(pos: IScrollBarPosition) {
        return this._scroll(SCROLL_TYPE.scrollBy, pos);
    }

    getBarScroll(actualX: number, actualY: number) {
        let x = actualX;
        let y = actualY;
        if (this._scrollBar) {
            x *= this._scrollBar.ratioScrollX; // convert to scroll coord
            y *= this._scrollBar.ratioScrollY;
            const { scaleX, scaleY } = this.scene;
            x = Math.round(x) * scaleX;
            y = Math.round(y) * scaleY;
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
            x /= this._scrollBar.ratioScrollX; // 转换为内容区实际滚动距离
            y /= this._scrollBar.ratioScrollY;
            const { scaleX, scaleY } = this.scene;
            x = Math.round(x) / scaleX;
            y = Math.round(y) / scaleY;
        } else {
            if (this.actualScrollX !== undefined) {
                x = this.actualScrollX;
            }

            if (this.actualScrollY !== undefined) {
                y = this.actualScrollY;
            }
        }
        return {
            x,
            y,
        };
    }

    transformScroll() {
        let x = this.scrollX;
        let y = this.scrollY;

        return this.getActualScroll(x, y);
    }

    getScrollBar() {
        return this._scrollBar;
    }

    updateScroll(param: IScrollObserverParam) {
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

    getScrollBarTransForm(isMouseFix: boolean = false) {
        const composeResult = Transform.create();

        if (isMouseFix || !this._allowCache) {
            composeResult.multiply(Transform.create([1, 0, 0, 1, this._left, this._top]));
        }
        return composeResult;
    }

    render(parentCtx?: CanvasRenderingContext2D) {
        const mainCtx = parentCtx || this._scene.getEngine()?.getCanvas().getContext();
        // console.log(this.viewPortKey, this._cacheCanvas);
        if (!this.isDirty() && this._allowCache) {
            this._applyCache(mainCtx);
            return;
        }
        let sceneTrans = this._scene.transform.clone();

        sceneTrans.multiply(Transform.create([1, 0, 0, 1, -this.actualScrollX || 0, -this.actualScrollY || 0]));

        let ctx = mainCtx;
        if (!ctx) {
            return;
        }

        const applyCanvasState = this._getApplyCanvasState();

        if (applyCanvasState) {
            sceneTrans.multiply(Transform.create([1, 0, 0, 1, -this.left / this._scene.scaleX, -this.top / this._scene.scaleY]));
            ctx = this._cacheCanvas.getContext();
            this._cacheCanvas.clear();
        }

        const m = sceneTrans.getMatrix();
        const n = this.getScrollBarTransForm().getMatrix();

        ctx.save();

        if (!applyCanvasState && this._renderClipState) {
            ctx.beginPath();
            // DEPT: left is set by upper views but width and height is not
            ctx.rect(this.left, this.top, (this.width || 0) * m[0], (this.height || 0) * m[3]);
            ctx.clip();
        }

        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._scene.renderObjects(ctx, this._calViewportRelativeBounding());
        ctx.restore();

        if (this._scrollBar) {
            ctx.save();
            ctx.transform(n[0], n[1], n[2], n[3], n[4], n[5]);
            this.drawScrollbar(ctx);
            ctx.restore();
        }

        if (applyCanvasState) this._applyCache(mainCtx);

        this.makeDirty(false);
        this._scrollRendered();
    }

    getBounding() {
        return this._calViewportRelativeBounding();
    }

    getRelativeVector(coord: Vector2) {
        const sceneTrans = this.scene.transform.clone().invert();
        const scroll = this.transformScroll();

        const svCoord = sceneTrans.applyPoint(coord).add(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }

    getAbsoluteVector(coord: Vector2) {
        const sceneTrans = this.scene.transform.clone();
        const scroll = this.transformScroll();

        const svCoord = sceneTrans.applyPoint(coord).subtract(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }

    onMouseWheel(evt: IWheelEvent, state: EventState) {
        if (!this._scrollBar) {
            return;
        }
        let isLimitedStore;
        if (evt.inputIndex === PointerInput.MouseWheelX) {
            const deltaFactor = Math.abs(evt.deltaX);
            // let magicNumber = deltaFactor < 40 ? 2 : deltaFactor < 80 ? 3 : 4;
            const allWidth = this._scene.width;
            const viewWidth = this.width || 1;
            let scrollNum = (viewWidth / allWidth) * deltaFactor;

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
    }

    // 自己是否被选中
    isHit(coord: Vector2) {
        const { width, height } = this._getViewPortSize();
        // const pixelRatio = this.getPixelRatio();
        // coord = Transform.create([pixelRatio, 0, 0, pixelRatio, 0, 0]).applyPoint(
        //     coord
        // );
        if (coord.x >= this.left && coord.x <= this.left + width && coord.y >= this.top && coord.y <= this.top + height) {
            return true;
        }
        return false;
    }

    pickScrollBar(coord: Vector2) {
        if (!this._scrollBar) {
            return;
        }

        const scrollBarTrans = this.getScrollBarTransForm(true);
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
    }

    private _resizeCacheCanvasAndScrollBar(forceCalculate = false) {
        const { width, height } = this._getViewPortSize(forceCalculate);

        this.width = width;
        this.height = height;

        const contentWidth = this._scene.width * this._scene.scaleX;
        const contentHeight = this._scene.height * this._scene.scaleY;

        this._scrollBar?.resize(width, height, contentWidth, contentHeight);
        this.makeDirty(true);
    }

    private _getViewPortSize(forceCalculate = false) {
        const parent = this._scene?.getParent();
        let width;
        let height;

        if (!forceCalculate && this._widthOrigin !== undefined) {
            width = this._widthOrigin!;
        } else {
            const referenceWidth = parent.width;
            let containerWidth = parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER ? referenceWidth * (parent as SceneViewer).scaleX : referenceWidth;
            width = containerWidth - (this._left + this._right);
        }

        if (!forceCalculate && this._heightOrigin !== undefined) {
            height = this._heightOrigin!;
        } else {
            const referenceHeight = parent.height;
            let containerHeight = parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER ? referenceHeight * (parent as SceneViewer).scaleY : referenceHeight;
            height = containerHeight - (this._top + this._bottom);
        }

        return {
            width,
            height,
        };
    }

    private _getApplyCanvasState() {
        return this._allowCache && this._renderClipState;
    }

    private _scrollRendered() {
        this._preScrollX = this.scrollX;
        this._preScrollY = this.scrollY;
    }

    private _limitedScroll() {
        if (!this._scrollBar) {
            return;
        }

        const limitX = this._scrollBar?.limitX || Infinity;
        const limitY = this._scrollBar?.limitY || Infinity;

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

    private _triggerScrollStop(
        scroll: {
            x: number;
            y: number;
        },
        x?: number,
        y?: number
    ) {
        window.clearTimeout(this._scrollStopNum);
        this._scrollStopNum = window.setTimeout(() => {
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
            });
        }, 0);
    }

    private _scroll(scrollType: SCROLL_TYPE, pos: IScrollBarPosition) {
        const { x, y } = pos;
        if (x !== undefined) {
            if (scrollType === SCROLL_TYPE.scrollBy) {
                this.scrollX += x;
            } else {
                this.scrollX = x;
            }
        }

        if (y !== undefined) {
            if (scrollType === SCROLL_TYPE.scrollBy) {
                this.scrollY += y;
            } else {
                this.scrollY = y;
            }
        }

        const limited = this._limitedScroll(); // 限制滚动范围

        this.onScrollBeforeObserver.notifyObservers({
            viewport: this,
            scrollX: this.scrollX,
            scrollY: this.scrollY,
            x,
            y,
            limitX: this._scrollBar?.limitX,
            limitY: this._scrollBar?.limitY,
        });

        if (this._scrollBar) {
            this._scrollBar.makeDirty(true);
        } else {
            this.makeDirty(true);
        }

        const scroll = this.transformScroll();
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
        });

        this._triggerScrollStop(scroll, x, y);

        return limited;
    }

    private _calViewportRelativeBounding() {
        let ratioScrollX = this._scrollBar?.ratioScrollX ?? 1;
        let ratioScrollY = this._scrollBar?.ratioScrollY ?? 1;
        let xFrom: number = this.left;
        let xTo: number = (this.width || 0) + this.left;
        let yFrom: number = this.top;
        let yTo: number = (this.height || 0) + this.top;

        let differenceX = 0;
        let differenceY = 0;

        if (this._preScrollX != null) {
            differenceX = (this._preScrollX - this.scrollX) / ratioScrollX;
        }

        if (this._preScrollY != null) {
            differenceY = (this._preScrollY - this.scrollY) / ratioScrollY;
        }

        const bounding: IBoundRect = {
            tl: Vector2.FromArray([xFrom, yFrom]),
            tr: Vector2.FromArray([xTo, yFrom]),
            bl: Vector2.FromArray([xFrom, yTo]),
            br: Vector2.FromArray([xTo, yTo]),
            dx: differenceX,
            dy: differenceY,
        };

        bounding.tl = this.getRelativeVector(bounding.tl);
        bounding.tr = this.getRelativeVector(bounding.tr);
        bounding.bl = this.getRelativeVector(bounding.bl);
        bounding.br = this.getRelativeVector(bounding.br);

        return bounding;
    }

    private drawScrollbar(ctx: CanvasRenderingContext2D) {
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

    private _applyCache(ctx?: CanvasRenderingContext2D) {
        if (!ctx) {
            return;
        }
        const pixelRatio = this._cacheCanvas.getPixelRatio();
        const width = this._cacheCanvas.getWidth() * pixelRatio;
        const height = this._cacheCanvas.getHeight() * pixelRatio;
        // console.log(this.viewPortKey, this._cacheCanvas, width, height, this.left, this.top, this.width, this.height, pixelRatio);
        ctx.drawImage(this._cacheCanvas.getCanvasEle(), 0, 0, width, height, this.left, this.top, this.width || 0, this.height || 0);
    }
}
