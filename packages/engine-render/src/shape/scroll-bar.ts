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

import type { EventState, IKeyValue, Nullable, Observer } from '@univerjs/core';

import { Subscription } from 'rxjs';
import { EVENT_TYPE } from '../basics/const';
import type { IMouseEvent, IPointerEvent } from '../basics/i-events';
import { Transform } from '../basics/transform';
import type { Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { ThinScene } from '../thin-scene';
import type { Viewport } from '../viewport';
import type { IScrollBarProps } from './base-scroll-bar';
import { BaseScrollBar } from './base-scroll-bar';
import { Rect } from './rect';

const MINI_THUMB_SIZE = 17;

export class ScrollBar extends BaseScrollBar {
    protected _view!: Viewport;

    private _mainScene: Nullable<ThinScene>;

    private _lastX: number = -1;

    private _lastY: number = -1;

    private _isHorizonMove = false;

    private _isVerticalMove = false;

    private _horizonPointerMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _horizonPointerUpObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _verticalPointerMoveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _verticalPointerUpObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    barSize = 14;

    barBorder = 1;

    thumbMargin = 2;

    thumbLengthRatio = 1;

    /**
     * todo: @DR-univer。 Mainly inject themeService in order to obtain colors.
     */
    thumbBackgroundColor = '#cccccc';

    thumbHoverBackgroundColor = '#b2b2b2';

    thumbActiveBackgroundColor = '#999999';

    barBackgroundColor = 'rgba(255,255,255,0.5)';

    barBorderColor = 'rgba(255,255,255,0.7)';

    private _eventSub = new Subscription();

    constructor(view: Viewport, props?: IScrollBarProps) {
        super();
        if (!view) {
            console.warn('Missing viewport');
        }
        this.setProps(props);
        this._view = view;
        this._initialScrollRect();
        this._initialVerticalEvent();
        this._initialHorizontalEvent();
        this._view.setScrollBar(this);
    }

    static attachTo(view: Viewport, props?: IScrollBarProps) {
        return new ScrollBar(view, props);
    }

    override dispose() {
        super.dispose();
        this._horizonPointerMoveObserver?.dispose();
        this._horizonPointerUpObserver?.dispose();
        this._verticalPointerMoveObserver?.dispose();
        this._verticalPointerUpObserver?.dispose();
        this._eventSub.unsubscribe();
        this._mainScene = null;
        this._view.removeScrollBar();
    }

    override render(ctx: UniverRenderingContext, left: number = 0, top: number = 0) {
        const { scrollX, scrollY } = this._view;
        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (this.enableHorizontal) {
            this.horizonBarRect!.render(ctx);
            this.horizonThumbRect!.translate(scrollX).render(ctx);
        }

        if (this.enableVertical) {
            this.verticalBarRect!.render(ctx);
            this.verticalThumbRect!.translate(undefined, scrollY).render(ctx);
        }

        if (this.enableHorizontal && this.enableVertical) {
            this.placeholderBarRect!.render(ctx);
        }

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

        if (this.enableHorizontal && this.enableVertical) {
            this.placeholderBarRect?.transformByState({
                left: parentWidth - this.barSize,
                top: parentHeight - this.barSize,
                width: this.barSize - this.barBorder,
                height: this.barSize - this.barBorder,
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
        const mainScene = this._mainScene || this._view.scene;
        mainScene.makeDirty(state);
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
                (this as IKeyValue)[`${key}`] = props[key as keyof IScrollBarProps];
            }
        });
    }

    private _resizeHorizontal(parentWidth: number, parentHeight: number, contentWidth: number) {
        // ratioScrollY = 内容可视区高度/内容实际区高度= 滑动条的高度/滑道高度=滚动条的顶部距离/实际内容区域顶部距离；
        if (!this.enableHorizontal) {
            return;
        }

        this.horizontalMinusMiniThumb = 0;
        this.horizontalBarWidth = parentWidth - (this.enableVertical ? this.barSize : 0) - this.barBorder;
        this.horizontalThumbWidth =
            ((this.horizontalBarWidth * (this.horizontalBarWidth - this.barBorder)) / contentWidth) *
            this.thumbLengthRatio;

        // this._horizontalThumbWidth = this._horizontalThumbWidth < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._horizontalThumbWidth;
        if (this.horizontalThumbWidth < MINI_THUMB_SIZE) {
            this.horizontalMinusMiniThumb = MINI_THUMB_SIZE - this.horizontalThumbWidth;
            this.horizontalThumbWidth = MINI_THUMB_SIZE;
        }

        this.horizonBarRect?.transformByState({
            left: 0,
            top: parentHeight - this.barSize,
            width: this.horizontalBarWidth,
            height: this.barSize - this.barBorder,
        });

        if (this.horizontalThumbWidth >= parentWidth - this.barSize) {
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
                top: parentHeight - this.barSize + this.thumbMargin,
                width: this.horizontalThumbWidth,
                height: this.barSize - this.thumbMargin * 2,
            });
        }
    }

    private _resizeVertical(parentWidth: number, parentHeight: number, contentHeight: number) {
        if (!this.enableVertical) {
            return;
        }

        this.verticalMinusMiniThumb = 0;
        this.verticalBarHeight = parentHeight - (this.enableHorizontal ? this.barSize : 0) - this.barBorder;
        this.verticalThumbHeight =
            ((this.verticalBarHeight * this.verticalBarHeight) / contentHeight) * this.thumbLengthRatio;
        // this._verticalThumbHeight = this._verticalThumbHeight < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._verticalThumbHeight;
        if (this.verticalThumbHeight < MINI_THUMB_SIZE) {
            this.verticalMinusMiniThumb = MINI_THUMB_SIZE - this.verticalThumbHeight;
            this.verticalThumbHeight = MINI_THUMB_SIZE;
        }

        this.verticalBarRect?.transformByState({
            left: parentWidth - this.barSize,
            top: 0,
            width: this.barSize - this.barBorder,
            height: this.verticalBarHeight,
        });

        if (this.verticalThumbHeight >= parentHeight - this.barSize) {
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
                left: parentWidth - this.barSize + this.thumbMargin,
                top: this._view.scrollY,
                width: this.barSize - this.thumbMargin * 2,
                height: this.verticalThumbHeight,
            });
        }
    }

    private _initialScrollRect() {
        if (this.enableHorizontal) {
            this.horizonBarRect = new Rect('__horizonBarRect__', {
                fill: this.barBackgroundColor!,
                strokeWidth: this.barBorder,
                stroke: this.barBorderColor!,
            });

            this.horizonThumbRect = new Rect('__horizonThumbRect__', {
                radius: 6,
                fill: this.thumbBackgroundColor!,
            });
        }

        if (this.enableVertical) {
            this.verticalBarRect = new Rect('__verticalBarRect__', {
                fill: this.barBackgroundColor!,
                strokeWidth: this.barBorder,
                stroke: this.barBorderColor!,
            });

            this.verticalThumbRect = new Rect('__verticalThumbRect__', {
                radius: 6,
                fill: this.thumbBackgroundColor!,
            });
        }

        if (this.enableHorizontal && this.enableVertical) {
            this.placeholderBarRect = new Rect('__placeholderBarRect__', {
                fill: this.barBackgroundColor!,
                strokeWidth: this.barBorder,
                stroke: this.barBorderColor!,
            });
        }
    }

    private _initialVerticalEvent() {
        if (!this.enableVertical) {
            return;
        }

        const mainScene = this._mainScene || this._view.scene;

        this.verticalThumbRect?.on(
            EVENT_TYPE.PointerEnter,
            this._hoverFunc(this.thumbHoverBackgroundColor!, this.verticalThumbRect)
        );
        this.verticalThumbRect?.on(
            EVENT_TYPE.PointerLeave,
            this._hoverFunc(this.thumbBackgroundColor!, this.verticalThumbRect)
        );

        this.verticalBarRect && this._eventSub.add(this.verticalBarRect.pointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._view.scrollTo({
                y: e.offsetY - this._view.top - this.verticalThumbHeight / 2,
            });
            state.stopPropagation();
        }));

        // 垂直滚动条的拖拽事件
        this.verticalThumbRect && this._eventSub.add(this.verticalThumbRect.pointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            const srcElement = this.verticalThumbRect;
            this._isVerticalMove = true;
            this._lastX = e.offsetX;
            this._lastY = e.offsetY;
            // srcElement.fill = this._thumbHoverBackgroundColor!;
            srcElement?.setProps({
                fill: this.thumbActiveBackgroundColor!,
            });
            mainScene.disableEvent();
            this.makeViewDirty(true);
            state.stopPropagation();
        }));

        this._verticalPointerMoveObserver = mainScene.onPointerMoveObserver.add((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._isVerticalMove) {
                return;
            }
            this._view.scrollByBar({
                y: e.offsetY - this._lastY,
            });
            this._lastY = e.offsetY;
            mainScene.getEngine()?.setRemainCapture();
        });
        this._verticalPointerUpObserver = mainScene.onPointerUpObserver.add((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            const srcElement = this.verticalThumbRect;
            this._isVerticalMove = false;
            // srcElement.fill = this._thumbBackgroundColor!;
            mainScene.enableEvent();
            srcElement?.setProps({
                fill: this.thumbBackgroundColor!,
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
        if (!this.enableHorizontal) {
            return;
        }

        const mainScene = this._mainScene || this._view.scene;

        this.horizonThumbRect?.on(
            EVENT_TYPE.PointerEnter,
            this._hoverFunc(this.thumbHoverBackgroundColor!, this.horizonThumbRect)
        );
        this.horizonThumbRect?.on(
            EVENT_TYPE.PointerLeave,
            this._hoverFunc(this.thumbBackgroundColor!, this.horizonThumbRect)
        );

        // 水平滚动条槽的点击滚动事件
        this.horizonBarRect && this._eventSub.add(this.horizonBarRect.pointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._view.scrollTo({
                x: e.offsetX - this._view.left - this.horizontalThumbWidth / 2,
            });
            state.stopPropagation();
        }));

        // 水平滚动条的拖拽事件
        this.horizonThumbRect && this._eventSub.add(this.horizonThumbRect.pointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            this._isHorizonMove = true;
            this._lastX = e.offsetX;
            this._lastY = e.offsetY;
            // this.fill = this._thumbHoverBackgroundColor!;
            this.horizonThumbRect?.setProps({
                fill: this.thumbActiveBackgroundColor!,
            });
            this.makeViewDirty(true);
            mainScene.disableEvent();
            state.stopPropagation();
        }));

        this._horizonPointerMoveObserver = mainScene.onPointerMoveObserver.add((evt: unknown, state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._isHorizonMove) {
                return;
            }
            this._view.scrollByBar({
                x: e.offsetX - this._lastX,
            });
            this._lastX = e.offsetX;
            mainScene.getEngine()?.setRemainCapture();
        });
        this._horizonPointerUpObserver = mainScene.onPointerUpObserver.add((evt: unknown, state: EventState) => {
            const srcElement = this.horizonThumbRect;
            this._isHorizonMove = false;
            mainScene.enableEvent();
            // srcElement.fill = this._thumbBackgroundColor!;
            srcElement?.setProps({
                fill: this.thumbBackgroundColor!,
            });
            // srcElement.makeDirty(true);
            this.makeViewDirty(true);
        });
    }
}
