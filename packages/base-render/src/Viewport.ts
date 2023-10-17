import { EventState, IPosition, Nullable, Observable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from './Basics/Const';
import { IWheelEvent, PointerInput } from './Basics/IEvents';
import { toPx } from './Basics/Tools';
import { Transform } from './Basics/Transform';
import { IBoundRect, Vector2 } from './Basics/Vector2';
import { Canvas } from './Canvas';
import { BaseScrollBar } from './Shape/BaseScrollBar';
import { ThinScene } from './ThinScene';

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

export class Viewport {
    /**
     * The offset of the scrollbar equals the distance from the top to the scrollbar
     * use getActualScroll, convert to actualScrollX, actualScrollY
     *
     */
    scrollX: number = 0;

    scrollY: number = 0;

    /**
     * The actual scroll offset equals the distance from the content area position to the top, and there is a conversion relationship with scrollX and scrollY
     * use getBarScroll, convert to scrollX, scrollY
     */
    actualScrollX: number = 0;

    actualScrollY: number = 0;

    onMouseWheelObserver = new Observable<IWheelEvent>();

    onScrollAfterObserver = new Observable<IScrollObserverParam>();

    onScrollBeforeObserver = new Observable<IScrollObserverParam>();

    onScrollStopObserver = new Observable<IScrollObserverParam>();

    private _viewPortKey: string = '';

    private _dirty: boolean = true;

    private _topOrigin: number = 0;

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

    private _cacheCanvas: Nullable<Canvas>;

    private _scrollBar?: Nullable<BaseScrollBar>;

    private _isWheelPreventDefaultX: boolean = false;

    private _isWheelPreventDefaultY: boolean = false;

    private _allowCache: boolean = false;

    private _scrollStopNum: number = 0;

    private _preScrollX: Nullable<number> = 0;

    private _preScrollY: Nullable<number> = 0;

    private _renderClipState = true;

    private _active = true;

    private _paddingStartX: number = 0;

    private _paddingEndX: number = 0;

    private _paddingStartY: number = 0;

    private _paddingEndY: number = 0;

    private _isRelativeX: boolean = false;

    private _isRelativeY: boolean = false;

    constructor(viewPortKey: string, scene: ThinScene, props?: IViewProps) {
        this._viewPortKey = viewPortKey;

        this._scene = scene;

        if (props?.active != null) {
            this._active = props.active;
        }

        // if (props?.width) {
        //     this.width = props?.width;
        //     this._widthOrigin = this.width;
        // }

        // if (props?.height) {
        //     this.height = props?.height;
        //     this._heightOrigin = this.height;
        // }

        this._setWithAndHeight(props);

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

    enable() {
        this._active = true;
    }

    disable() {
        this._active = false;
    }

    resetSizeAndScrollBar() {
        this._resizeCacheCanvasAndScrollBar();
    }

    setScrollBar(instance: BaseScrollBar) {
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
        // this._width = undefined;
        // this._height = undefined;
        // positionKeys.forEach((pKey) => {
        //     if (position[pKey as keyof IViewPosition] !== undefined) {
        //         (this as IKeyValue)[pKey] = position[pKey as keyof IViewPosition];
        //     }
        // });

        this._setWithAndHeight(position);

        this._resizeCacheCanvasAndScrollBar();
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

    makeDirty(state: boolean = true, refreshParent = false) {
        this._dirty = state;

        if (refreshParent) {
            const parent = this.scene.getParent();
            if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                parent.makeDirty(true);
            }
        }
    }

    isDirty(): boolean {
        return this._dirty;
    }

    /**
     * scroll to position, absolute
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
            x /= this._scrollBar.ratioScrollX; // 转换为内容区实际滚动距离
            y /= this._scrollBar.ratioScrollY;
            const { scaleX, scaleY } = this.scene;
            x /= scaleX;
            y /= scaleY;

            // console.log(y, this._scrollBar.miniThumbRatioY);
            // x *= this._scrollBar.miniThumbRatioX;
            // y *= this._scrollBar.miniThumbRatioY;
        } else {
            if (this.actualScrollX !== undefined) {
                x = this.actualScrollX;
            }

            if (this.actualScrollY !== undefined) {
                y = this.actualScrollY;
            }
        }
        return {
            x: Math.round(x + this._paddingStartX),
            y: Math.round(y + this._paddingStartY),
        };
    }

    getTransformedScroll() {
        const x = this.scrollX;
        const y = this.scrollY;

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
        if (this.isActive === false) {
            return;
        }
        const mainCtx = parentCtx || this._scene.getEngine()?.getCanvas().getContext();
        // console.log(this.viewPortKey, this._cacheCanvas);
        if (!this.isDirty() && this._allowCache) {
            this._applyCache(mainCtx);
            return;
        }
        const sceneTrans = this._scene.transform.clone();

        // if (this._viewPortKey === 'viewMainTop') {
        //     console.log(this._viewPortKey, this.scrollX, this.scrollY, this.actualScrollX, this.actualScrollY);
        // }

        sceneTrans.multiply(Transform.create([1, 0, 0, 1, -this.actualScrollX || 0, -this.actualScrollY || 0]));

        let ctx = mainCtx;
        if (!ctx) {
            return;
        }

        const applyCanvasState = this._getApplyCanvasState();

        if (applyCanvasState) {
            sceneTrans.multiply(
                Transform.create([1, 0, 0, 1, -this.left / this._scene.scaleX, -this.top / this._scene.scaleY])
            );
            if (this._cacheCanvas == null) {
                throw new Error('cache canvas is null');
            }
            ctx = this._cacheCanvas.getContext();
            this._cacheCanvas.clear();
        }

        const m = sceneTrans.getMatrix();
        const n = this.getScrollBarTransForm().getMatrix();

        ctx.save();

        if (!applyCanvasState && this._renderClipState) {
            ctx.beginPath();
            // DEPT: left is set by upper views but width and height is not
            const { scaleX, scaleY } = this._getBoundScale(m[0], m[3]);
            ctx.rect(this.left, this.top, (this.width || 0) * scaleX, (this.height || 0) * scaleY);
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
        const scroll = this.getTransformedScroll();

        const svCoord = sceneTrans.applyPoint(coord).add(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }

    getAbsoluteVector(coord: Vector2) {
        const sceneTrans = this.scene.transform.clone();
        const scroll = this.getTransformedScroll();

        const svCoord = sceneTrans.applyPoint(coord).subtract(Vector2.FromArray([scroll.x, scroll.y]));
        return svCoord;
    }
    // eslint-disable-next-line max-lines-per-function
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
                scrollNum *= 3;
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
        this._cacheCanvas?.dispose();

        this._scene.removeViewport(this._viewPortKey);
    }

    limitedScroll() {
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

    private _resizeCacheCanvasAndScrollBar() {
        const { width, height } = this._getViewPortSize();

        const contentWidth = (this._scene.width - this._paddingEndX) * this._scene.scaleX;

        const contentHeight = (this._scene.height - this._paddingEndY) * this._scene.scaleY;

        this._scrollBar?.resize(width, height, contentWidth, contentHeight);

        this.makeDirty(true);
    }

    private _getViewPortSize() {
        const parent = this._scene.getParent();

        const { width: parentWidth, height: parentHeight } = parent;

        const { scaleX = 1, scaleY = 1 } = this._scene;

        let width;
        let height;

        let left = this.left * scaleX;
        let top = this.top * scaleY;

        if (this._leftOrigin != null) {
            left = this._leftOrigin * scaleX;
        }

        if (this._topOrigin != null) {
            top = this._topOrigin * scaleY;
        }

        if (this._widthOrigin != null) {
            width = this._widthOrigin * scaleX;
        } else {
            width = parentWidth - (left + this._right);
            this.width = width;
        }

        if (this._heightOrigin != null) {
            height = this._heightOrigin * scaleY;
        } else {
            height = parentHeight - (top + this._bottom);
            this.height = height;
        }

        this._left = left;
        this._top = top;
        // this._width = width;
        // this._height = height;

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
        };
    }

    private _getApplyCanvasState() {
        return this._allowCache && this._renderClipState;
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
                isTrigger,
            });
        }, 0);
    }

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
        } else {
            this.makeDirty(true);
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

    private _calViewportRelativeBounding() {
        if (this.isActive === false) {
            return {
                tl: Vector2.FromArray([-1, -1]),
                tr: Vector2.FromArray([-1, -1]),
                bl: Vector2.FromArray([-1, -1]),
                br: Vector2.FromArray([-1, -1]),
                dx: -1,
                dy: -1,
            };
        }

        const { scaleX, scaleY } = this._getBoundScale(this.scene.scaleX, this.scene.scaleY);

        const ratioScrollX = this._scrollBar?.ratioScrollX ?? 1;
        const ratioScrollY = this._scrollBar?.ratioScrollY ?? 1;
        const xFrom: number = this.left;
        const xTo: number = (this.width || 0) * scaleX + this.left;
        const yFrom: number = this.top;
        const yTo: number = (this.height || 0) * scaleY + this.top;

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
        if (!ctx || this._cacheCanvas == null) {
            return;
        }
        const pixelRatio = this._cacheCanvas.getPixelRatio();
        const width = this._cacheCanvas.getWidth() * pixelRatio;
        const height = this._cacheCanvas.getHeight() * pixelRatio;
        // console.log(this.viewPortKey, this._cacheCanvas, width, height, this.left, this.top, this.width, this.height, pixelRatio);
        ctx.drawImage(
            this._cacheCanvas.getCanvasEle(),
            0,
            0,
            width,
            height,
            this.left,
            this.top,
            this.width || 0,
            this.height || 0
        );
    }

    private _setWithAndHeight(props?: IViewProps) {
        this.top = props?.top || 0;
        this.left = props?.left || 0;
        this.bottom = props?.bottom || 0;
        this.right = props?.right || 0;

        if (props?.width) {
            this.width = props?.width;
            this._widthOrigin = this.width;
            this._isRelativeX = false;
        } else {
            this.width = null;
            this._widthOrigin = null;
            this._isRelativeX = true;
        }

        if (props?.height) {
            this.height = props?.height;
            this._heightOrigin = this.height;
            this._isRelativeY = false;
        } else {
            this.height = null;
            this._heightOrigin = null;
            this._isRelativeY = true;
        }
    }

    private _getBoundScale(scaleX: number, scaleY: number) {
        scaleX = this._isRelativeX ? (scaleX < 1 ? 1 : scaleX) : scaleX;
        scaleY = this._isRelativeY ? (scaleY < 1 ? 1 : scaleY) : scaleY;

        return { scaleX, scaleY };
    }
}
