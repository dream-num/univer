import { EventState } from '@univerjs/core';

import { COLORS, EVENT_TYPE } from '../Basics/Const';
import { IMouseEvent, IPointerEvent } from '../Basics/IEvents';
import { getColor } from '../Basics/Tools';
import { Transform } from '../Basics/Transform';
import { Vector2 } from '../Basics/Vector2';
import { ThinScene } from '../ThinScene';
import { Viewport } from '../Viewport';
import { BaseScrollBar, IScrollBarProps } from './BaseScrollBar';
import { Rect } from './Rect';

const MINI_THUMB_SIZE = 17;

export class ScrollBar extends BaseScrollBar {
    protected _view: Viewport;

    private _barSize = 14;

    private _barBorder = 1;

    private _thumbMargin = 2;

    private _thumbLengthRatio = 1;

    private _thumbBackgroundColor = getColor(COLORS.black, 0.2);

    private _thumbHoverBackgroundColor = getColor(COLORS.black, 0.35);

    private _thumbActiveBackgroundColor = getColor(COLORS.black, 0.4);

    private _barBackgroundColor = getColor(COLORS.white);

    private _barBorderColor = getColor([218, 220, 224]);

    private _enableHorizontal: boolean = true;

    private _enableVertical: boolean = true;

    private _mainScene?: ThinScene;

    private _lastX: number;

    private _lastY: number;

    private _isHorizonMove = false;

    private _isVerticalMove = false;

    constructor(view: Viewport, props?: IScrollBarProps) {
        super(props);
        if (!view) {
            console.warn('Missing viewport');
        }
        this._view = view;
        this._initialScrollRect();
        this._view.setScrollBar(this);
    }

    static attachTo(view: Viewport, props?: IScrollBarProps) {
        return new ScrollBar(view, props);
    }

    override render(ctx: CanvasRenderingContext2D, left: number = 0, top: number = 0) {
        const { scrollX, scrollY } = this._view;
        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this.horizonBarRect.render(ctx);
        this.horizonThumbRect.translate(scrollX).render(ctx);
        this.verticalBarRect.render(ctx);
        this.verticalThumbRect.translate(undefined, scrollY).render(ctx);
        this.placeholderBarRect.render(ctx);
        ctx.restore();
    }

    override resize(
        parentWidth: number = 0,
        parentHeight: number = 0,
        contentWidth: number = 0,
        contentHeight: number = 0
    ) {
        if (parentWidth === 0 && parentWidth === 0) {
            return;
        }

        this._resizeHorizontal(parentWidth, parentHeight, contentWidth);

        this._resizeVertical(parentWidth, parentHeight, contentHeight);

        if (this._enableHorizontal && this._enableVertical) {
            this.placeholderBarRect?.transformByState({
                left: parentWidth - this._barSize,
                top: parentHeight - this._barSize,
                width: this._barSize - this._barBorder,
                height: this._barSize - this._barBorder,
            });
        }
    }

    override makeDirty(state: boolean) {
        this.horizonBarRect?.makeDirty(state);
        this.horizonThumbRect?.makeDirty(state);
        this.verticalBarRect?.makeDirty(state);
        this.verticalThumbRect?.makeDirty(state);
        this.placeholderBarRect?.makeDirty(state);

        this.makeViewDirty(state);
    }

    makeViewDirty(state: boolean) {
        this._view.makeDirty(state, true);
    }

    override pick(coord: Vector2) {
        if (this.horizonThumbRect?.isHit(coord)) {
            return this.horizonThumbRect;
        }

        if (this.verticalThumbRect?.isHit(coord)) {
            return this.verticalThumbRect;
        }

        if (this.horizonBarRect?.isHit(coord)) {
            return this.horizonBarRect;
        }

        if (this.verticalBarRect?.isHit(coord)) {
            return this.verticalBarRect;
        }

        return null;
    }

    private _resizeHorizontal(parentWidth: number, parentHeight: number, contentWidth: number) {
        // ratioScrollY = 内容可视区高度/内容实际区高度= 滑动条的高度/滑道高度=滚动条的顶部距离/实际内容区域顶部距离；
        if (!this._enableHorizontal) {
            return;
        }

        this.horizontalMinusMiniThumb = 0;
        this.horizontalBarWidth = parentWidth - this._barSize;
        this.horizontalThumbWidth =
            ((this.horizontalBarWidth * (this.horizontalBarWidth - this._barBorder)) / contentWidth) *
            this._thumbLengthRatio;

        // this._horizontalThumbWidth = this._horizontalThumbWidth < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._horizontalThumbWidth;
        if (this.horizontalThumbWidth < MINI_THUMB_SIZE) {
            this.horizontalMinusMiniThumb = MINI_THUMB_SIZE - this.horizontalThumbWidth;
            this.horizontalThumbWidth = MINI_THUMB_SIZE;
        }

        this.horizonBarRect?.transformByState({
            left: 0,
            top: parentHeight - this._barSize,
            width: this.horizontalBarWidth,
            height: this._barSize - this._barBorder,
        });

        if (this.horizontalThumbWidth >= parentWidth) {
            this.horizonThumbRect?.setProps({
                visible: false,
            });
        } else {
            if (!this.horizonThumbRect?.visible) {
                this.horizonThumbRect?.setProps({
                    visible: true,
                });
            }

            this.horizonThumbRect?.transformByState({
                left: this._view.scrollX,
                top: parentHeight - this._barSize + this._thumbMargin,
                width: this.horizontalThumbWidth,
                height: this._barSize - this._thumbMargin * 2,
            });
        }
    }

    private _resizeVertical(parentWidth: number, parentHeight: number, contentHeight: number) {
        if (!this._enableVertical) {
            return;
        }

        this.verticalMinusMiniThumb = 0;
        this.verticalBarHeight = parentHeight - this._barSize;
        this.verticalThumbHeight =
            ((this.verticalBarHeight * (this.verticalBarHeight - this._barBorder)) / contentHeight) *
            this._thumbLengthRatio;
        // this._verticalThumbHeight = this._verticalThumbHeight < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._verticalThumbHeight;
        if (this.verticalThumbHeight < MINI_THUMB_SIZE) {
            this.verticalMinusMiniThumb = MINI_THUMB_SIZE - this.verticalThumbHeight;
            this.verticalThumbHeight = MINI_THUMB_SIZE;
        }

        this.verticalBarRect?.transformByState({
            left: parentWidth - this._barSize,
            top: 0,
            width: this._barSize - this._barBorder,
            height: this.verticalBarHeight,
        });

        if (this.verticalThumbHeight >= parentHeight) {
            this.verticalThumbRect?.setProps({
                visible: false,
            });
        } else {
            if (!this.verticalThumbRect?.visible) {
                this.verticalThumbRect?.setProps({
                    visible: true,
                });
            }

            this.verticalThumbRect?.transformByState({
                left: parentWidth - this._barSize + this._thumbMargin,
                top: this._view.scrollY,
                width: this._barSize - this._thumbMargin * 2,
                height: this.verticalThumbHeight,
            });
        }
    }

    private _initialScrollRect() {
        if (this._enableHorizontal) {
            this.horizonBarRect = new Rect('__horizonBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });

            this.horizonThumbRect = new Rect('__horizonThumbRect__', {
                radius: 6,
                fill: this._thumbBackgroundColor!,
            });
        }

        if (this._enableVertical) {
            this.verticalBarRect = new Rect('__verticalBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });

            this.verticalThumbRect = new Rect('__verticalThumbRect__', {
                radius: 6,
                fill: this._thumbBackgroundColor!,
            });
        }

        if (this._enableHorizontal && this._enableVertical) {
            this.placeholderBarRect = new Rect('__placeholderBarRect__', {
                fill: this._barBackgroundColor!,
                strokeWidth: this._barBorder,
                stroke: this._barBorderColor!,
            });
        }

        this._initialVerticalEvent();
        this._initialHorizontalEvent();
    }

    private _initialVerticalEvent() {
        if (!this._enableVertical) {
            return;
        }

        const mainScene = this._mainScene || this._view.scene;

        this.verticalThumbRect.on(
            EVENT_TYPE.PointerEnter,
            this._hoverFunc(this._thumbHoverBackgroundColor!, this.verticalThumbRect)
        );
        this.verticalThumbRect.on(
            EVENT_TYPE.PointerLeave,
            this._hoverFunc(this._thumbBackgroundColor!, this.verticalThumbRect)
        );

        // 垂直滚动条槽的点击滚动事件
        this.verticalBarRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._view.scrollTo({
                y: e.offsetY - this._view.top - this.verticalThumbHeight / 2,
            });
            state.stopPropagation();
        });

        // 垂直滚动条的拖拽事件
        this.verticalThumbRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            const srcElement = this.verticalThumbRect;
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
            const srcElement = this.verticalThumbRect;
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

    private _hoverFunc(color: string, object: Rect) {
        return (evt: unknown, state: EventState) => {
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
    }

    private _initialHorizontalEvent() {
        if (!this._enableHorizontal) {
            return;
        }

        const mainScene = this._mainScene || this._view.scene;

        this.horizonThumbRect.on(
            EVENT_TYPE.PointerEnter,
            this._hoverFunc(this._thumbHoverBackgroundColor!, this.horizonThumbRect)
        );
        this.horizonThumbRect.on(
            EVENT_TYPE.PointerLeave,
            this._hoverFunc(this._thumbBackgroundColor!, this.horizonThumbRect)
        );

        // 水平滚动条槽的点击滚动事件
        this.horizonBarRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._view.scrollTo({
                x: e.offsetX - this._view.left - this.horizontalThumbWidth / 2,
            });
            state.stopPropagation();
        });

        // 水平滚动条的拖拽事件
        this.horizonThumbRect.on(EVENT_TYPE.PointerDown, (evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._isHorizonMove = true;
            this._lastX = e.offsetX;
            this._lastY = e.offsetY;
            // this.fill = this._thumbHoverBackgroundColor!;
            this.horizonThumbRect.setProps({
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
            const srcElement = this.horizonThumbRect;
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
}
