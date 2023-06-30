import { EventState, IKeyValue } from '@univerjs/core';
import { Vector2 } from '../Basics/Vector2';
import { IMouseEvent, IPointerEvent } from '../Basics/IEvents';
import { COLORS, EVENT_TYPE, RENDER_CLASS_TYPE } from '../Basics/Const';
import { getColor } from '../Basics/Tools';
import { Transform } from '../Basics/Transform';
import { Scene } from '../Scene';
import { Viewport } from '../Viewport';
import { Rect } from './Rect';
import { SceneViewer } from '../SceneViewer';

const MINI_THUMB_SIZE = 17;

interface IScrollBarProps {
    thumbMargin?: number;
    thumbLengthRatio?: number;
    thumbBackgroundColor?: string;
    thumbHoverBackgroundColor?: string;
    thumbActiveBackgroundColor?: string;
    barSize?: number;
    barBackgroundColor?: string;
    barBorder?: number;
    barBorderColor?: string;

    enableHorizontal?: boolean;
    enableVertical?: boolean;

    mainScene?: Scene;
}

export class ScrollBar {
    protected _view: Viewport;

    private _thumbMargin = 2;

    private _thumbLengthRatio = 1;

    private _thumbBackgroundColor = getColor(COLORS.black, 0.2);

    private _thumbHoverBackgroundColor = getColor(COLORS.black, 0.35);

    private _thumbActiveBackgroundColor = getColor(COLORS.black, 0.4);

    private _barSize = 14;

    private _barBackgroundColor = getColor(COLORS.white);

    private _barBorder = 1;

    private _barBorderColor = getColor([218, 220, 224]);

    private _enableHorizontal: boolean = true;

    private _horizontalThumbWidth: number;

    private _horizontalBarWidth: number;

    private _horizonBarRect: Rect;

    private _horizonThumbRect: Rect;

    private _enableVertical: boolean = true;

    private _verticalThumbHeight: number;

    private _verticalBarHeight: number;

    private _verticalBarRect: Rect;

    private _verticalThumbRect: Rect;

    private _verticalMinusMiniThumb: number = 0;

    private _horizontalMinusMiniThumb: number = 0;

    private _placeholderBarRect: Rect;

    private _mainScene?: Scene;

    private _lastX: number;

    private _lastY: number;

    private _isHorizonMove = false;

    private _isVerticalMove = false;

    constructor(view: Viewport, props?: IScrollBarProps) {
        if (!view) {
            console.warn('Missing viewport');
        }
        this._view = view;
        this.setProps(props);
        this._initialScrollRect();
        this._view.setScrollBar(this);
    }

    get limitX() {
        if (!this._horizonThumbRect.visible) {
            return 0;
        }
        return this._horizontalBarWidth - this._horizontalThumbWidth;
    }

    get limitY() {
        if (!this._verticalThumbRect.visible) {
            return 0;
        }
        return this._verticalBarHeight - this._verticalThumbHeight;
    }

    get horizontalThumbWidth() {
        return this._horizontalThumbWidth;
    }

    get verticalThumbHeight() {
        return this._verticalThumbHeight;
    }

    get ratioScrollX(): number {
        if (this._horizontalThumbWidth === undefined || this._horizontalBarWidth === undefined) {
            return 1;
        }
        return (this._horizontalThumbWidth - this._horizontalMinusMiniThumb) / this._horizontalBarWidth;
    }

    get ratioScrollY(): number {
        if (this._verticalThumbHeight === undefined || this._verticalBarHeight === undefined) {
            return 1;
        }
        return (this._verticalThumbHeight - this._verticalMinusMiniThumb) / this._verticalBarHeight;
    }

    get barSize() {
        return this._barSize;
    }

    get barBorder() {
        return this._barBorder;
    }

    static attachTo(view: Viewport, props?: IScrollBarProps) {
        return new ScrollBar(view, props);
    }

    setProps(props?: IScrollBarProps) {
        if (!props) {
            return;
        }

        const themeKeys = Object.keys(props);
        if (themeKeys.length === 0) {
            return;
        }

        themeKeys.forEach((key) => {
            if (props[key as keyof IScrollBarProps] !== undefined) {
                (this as IKeyValue)[`_${key}`] = props[key as keyof IScrollBarProps];
            }
        });
    }

    render(ctx: CanvasRenderingContext2D, left: number = 0, top: number = 0) {
        let { scrollX, scrollY } = this._view;
        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._horizonBarRect.render(ctx);
        this._horizonThumbRect.translate(scrollX).render(ctx);
        this._verticalBarRect.render(ctx);
        this._verticalThumbRect.translate(undefined, scrollY).render(ctx);
        this._placeholderBarRect.render(ctx);
        ctx.restore();
    }

    resize(parentWidth: number = 0, parentHeight: number = 0, contentWidth: number = 0, contentHeight: number = 0) {
        if (parentWidth === 0 && parentWidth === 0) {
            return;
        }
        // ratioScrollY = 内容可视区高度/内容实际区高度= 滑动条的高度/滑道高度=滚动条的顶部距离/实际内容区域顶部距离；
        if (this._enableHorizontal) {
            this._horizontalMinusMiniThumb = 0;
            this._horizontalBarWidth = parentWidth - this._barSize;
            this._horizontalThumbWidth = ((this._horizontalBarWidth * (this._horizontalBarWidth - this._barBorder)) / contentWidth) * this._thumbLengthRatio;

            // this._horizontalThumbWidth = this._horizontalThumbWidth < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._horizontalThumbWidth;
            if (this._horizontalThumbWidth < MINI_THUMB_SIZE) {
                this._horizontalMinusMiniThumb = MINI_THUMB_SIZE - this._horizontalThumbWidth;
                this._horizontalThumbWidth = MINI_THUMB_SIZE;
            }

            this._horizonBarRect?.transformByState({
                left: 0,
                top: parentHeight - this._barSize,
                width: this._horizontalBarWidth,
                height: this._barSize - this._barBorder,
            });

            if (this._horizontalThumbWidth >= parentWidth) {
                this._horizonThumbRect?.setProps({
                    visible: false,
                });
            } else {
                if (!this._horizonThumbRect?.visible) {
                    this._horizonThumbRect?.setProps({
                        visible: true,
                    });
                }

                this._horizonThumbRect?.transformByState({
                    left: this._view.scrollX,
                    top: parentHeight - this._barSize + this._thumbMargin,
                    width: this._horizontalThumbWidth,
                    height: this._barSize - this._thumbMargin * 2,
                });
            }
        }

        if (this._enableVertical) {
            this._verticalMinusMiniThumb = 0;
            this._verticalBarHeight = parentHeight - this._barSize;
            this._verticalThumbHeight = ((this._verticalBarHeight * (this._verticalBarHeight - this._barBorder)) / contentHeight) * this._thumbLengthRatio;
            // this._verticalThumbHeight = this._verticalThumbHeight < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._verticalThumbHeight;
            if (this._verticalThumbHeight < MINI_THUMB_SIZE) {
                this._verticalMinusMiniThumb = MINI_THUMB_SIZE - this._verticalThumbHeight;
                this._verticalThumbHeight = MINI_THUMB_SIZE;
            }

            this._verticalBarRect?.transformByState({
                left: parentWidth - this._barSize,
                top: 0,
                width: this._barSize - this._barBorder,
                height: this._verticalBarHeight,
            });

            if (this._verticalThumbHeight >= parentHeight) {
                this._verticalThumbRect?.setProps({
                    visible: false,
                });
            } else {
                if (!this._verticalThumbRect?.visible) {
                    this._verticalThumbRect?.setProps({
                        visible: true,
                    });
                }

                this._verticalThumbRect?.transformByState({
                    left: parentWidth - this._barSize + this._thumbMargin,
                    top: this._view.scrollY,
                    width: this._barSize - this._thumbMargin * 2,
                    height: this._verticalThumbHeight,
                });
            }
        }

        if (this._enableHorizontal && this._enableVertical) {
            this._placeholderBarRect?.transformByState({
                left: parentWidth - this._barSize,
                top: parentHeight - this._barSize,
                width: this._barSize - this._barBorder,
                height: this._barSize - this._barBorder,
            });
        }
    }

    makeDirty(state: boolean) {
        this._horizonBarRect?.makeDirty(state);
        this._horizonThumbRect?.makeDirty(state);
        this._verticalBarRect?.makeDirty(state);
        this._verticalThumbRect?.makeDirty(state);
        this._placeholderBarRect?.makeDirty(state);

        this.makeViewDirty(state);
    }

    makeViewDirty(state: boolean) {
        this._view.makeDirty(state);
        const parent = this._view.scene.getParent();
        if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (parent as SceneViewer).makeDirty(true);
        }
    }

    pick(coord: Vector2) {
        if (this._horizonThumbRect?.isHit(coord)) {
            return this._horizonThumbRect;
        }

        if (this._verticalThumbRect?.isHit(coord)) {
            return this._verticalThumbRect;
        }

        if (this._horizonBarRect?.isHit(coord)) {
            return this._horizonBarRect;
        }

        if (this._verticalBarRect?.isHit(coord)) {
            return this._verticalBarRect;
        }

        return null;
    }

    dispose() {
        this._horizonBarRect.dispose();
        this._horizonThumbRect.dispose();
        this._verticalBarRect.dispose();
        this._verticalThumbRect.dispose();
        this._placeholderBarRect.dispose();
    }

    private _initialScrollRect() {
        if (this._enableHorizontal) {
            this._horizonBarRect = new Rect('__horizonBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });

            this._horizonThumbRect = new Rect('__horizonThumbRect__', {
                radius: 6,
                fill: this._thumbBackgroundColor!,
            });
        }

        if (this._enableVertical) {
            this._verticalBarRect = new Rect('__verticalBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });

            this._verticalThumbRect = new Rect('__verticalThumbRect__', {
                radius: 6,
                fill: this._thumbBackgroundColor!,
            });
        }

        if (this._enableHorizontal && this._enableVertical) {
            this._placeholderBarRect = new Rect('__placeholderBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });
        }

        this.__initialEvent();
    }

    private __initialEvent() {
        const mainScene = this._mainScene || this._view.scene;
        const hoverFunc = (color: string, object: Rect) => (evt: unknown, state: EventState) => {
            if (this._isHorizonMove || this._isVerticalMove) {
                return;
            }
            const e = evt as IPointerEvent | IMouseEvent;
            const srcElement = object;
            srcElement.setProps({
                fill: color,
            });
            // srcElement.fill = color;
            // srcElement.makeDirty(true);
            this.makeViewDirty(true);
        };
        if (this._enableHorizontal) {
            this._horizonThumbRect.on(EVENT_TYPE.PointerEnter, hoverFunc(this._thumbHoverBackgroundColor!, this._horizonThumbRect));
            this._horizonThumbRect.on(EVENT_TYPE.PointerLeave, hoverFunc(this._thumbBackgroundColor!, this._horizonThumbRect));

            // 水平滚动条槽的点击滚动事件
            this._horizonBarRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._view.scrollTo({
                    x: e.offsetX - this._view.left - this._horizontalThumbWidth / 2,
                });
                state.stopPropagation();
            });

            // 水平滚动条的拖拽事件
            this._horizonThumbRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._isHorizonMove = true;
                this._lastX = e.offsetX;
                this._lastY = e.offsetY;
                // this.fill = this._thumbHoverBackgroundColor!;
                this._horizonThumbRect.setProps({
                    fill: this._thumbActiveBackgroundColor!,
                });
                this.makeViewDirty(true);
                mainScene.disableEvent();
                state.stopPropagation();
            });
            mainScene.on(EVENT_TYPE.PointerMove, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                if (!this._isHorizonMove) {
                    return;
                }
                this._view.scrollBy({
                    x: e.offsetX - this._lastX,
                });
                this._lastX = e.offsetX;
            });
            mainScene.on(EVENT_TYPE.PointerUp, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                const srcElement = this._horizonThumbRect;
                this._isHorizonMove = false;
                mainScene.enableEvent();
                // srcElement.fill = this._thumbBackgroundColor!;
                srcElement.setProps({
                    fill: this._thumbBackgroundColor!,
                });
                // srcElement.makeDirty(true);
                this.makeViewDirty(true);
            });
        }

        if (this._enableVertical) {
            this._verticalThumbRect.on(EVENT_TYPE.PointerEnter, hoverFunc(this._thumbHoverBackgroundColor!, this._verticalThumbRect));
            this._verticalThumbRect.on(EVENT_TYPE.PointerLeave, hoverFunc(this._thumbBackgroundColor!, this._verticalThumbRect));

            // 垂直滚动条槽的点击滚动事件
            this._verticalBarRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._view.scrollTo({
                    y: e.offsetY - this._view.top - this._verticalThumbHeight / 2,
                });
                state.stopPropagation();
            });

            // 垂直滚动条的拖拽事件
            this._verticalThumbRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                const srcElement = this._verticalThumbRect;
                this._isVerticalMove = true;
                this._lastX = e.offsetX;
                this._lastY = e.offsetY;
                // srcElement.fill = this._thumbHoverBackgroundColor!;
                srcElement.setProps({
                    fill: this._thumbActiveBackgroundColor!,
                });
                mainScene.disableEvent();
                this.makeViewDirty(true);
                state.stopPropagation();
            });
            mainScene.on(EVENT_TYPE.PointerMove, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                if (!this._isVerticalMove) {
                    return;
                }
                this._view.scrollBy({
                    y: e.offsetY - this._lastY,
                });
                this._lastY = e.offsetY;
            });
            mainScene.on(EVENT_TYPE.PointerUp, (evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                const srcElement = this._verticalThumbRect;
                this._isVerticalMove = false;
                // srcElement.fill = this._thumbBackgroundColor!;
                mainScene.enableEvent();
                srcElement.setProps({
                    fill: this._thumbBackgroundColor!,
                });
                // srcElement.makeDirty(true);
                this.makeViewDirty(true);
            });
        }
    }
}
