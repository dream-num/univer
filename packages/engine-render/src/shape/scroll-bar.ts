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

import type { EventState, IKeyValue, Nullable } from '@univerjs/core';

import type { IMouseEvent, IPointerEvent } from '../basics/i-events';
import type { Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { Scene } from '../scene';
import type { Viewport } from '../viewport';
import type { IScrollBarProps } from './base-scroll-bar';
import { Subscription } from 'rxjs';
import { Transform } from '../basics/transform';
import { BaseScrollBar } from './base-scroll-bar';
import { Rect } from './rect';

const MIN_THUMB_SIZE = 17;

export class ScrollBar extends BaseScrollBar {
    protected _viewport!: Viewport;

    private _mainScene: Nullable<Scene>;

    private _lastX: number = -1;

    private _lastY: number = -1;

    private _isHorizonMove = false;

    private _isVerticalMove = false;

    private _horizonPointerMoveSub: Nullable<Subscription>;

    private _horizonPointerUpSub: Nullable<Subscription>;

    private _verticalPointerMoveSub: Nullable<Subscription>;

    private _verticalPointerUpSub: Nullable<Subscription>;

    /**
     * The thickness of a scrolling track
     * ThumbSize = barSize - thumbMargin * 2
     */
    barSize = 14;

    barBorder = 1;

    /**
     * The margin between thumb and bar.
     * ThumbSize = barSize - thumbMargin * 2
     */
    thumbMargin = 2;

    thumbLengthRatio = 1;

    /**
     * todo: @DR-univer。 Mainly inject themeService in order to obtain colors.
     */
    thumbBackgroundColor = 'rgba(24, 28, 42, 0.20)';
    thumbHoverBackgroundColor = 'rgba(24, 28, 42, 0.30)';
    thumbActiveBackgroundColor = 'rgba(24, 28, 42, 0.40)';
    barBackgroundColor = 'rgba(255,255,255,0.5)';
    barBorderColor = 'rgba(255,255,255,0.7)';

    /**
     * The min width of horizon thumb.
     */
    minThumbSizeH = MIN_THUMB_SIZE;
    /**
     * The min height of vertical thumb.
     */
    minThumbSizeV = MIN_THUMB_SIZE;

    private _eventSub = new Subscription();

    get scrollHandleThickness() {
        return Math.max(0, this.barSize - this.thumbMargin * 2);
    }

    constructor(view: Viewport, props?: IScrollBarProps) {
        super();
        if (!view) {
            console.warn('Missing viewport');
        }
        this.setProps(props);
        this._viewport = view;
        this._initialScrollRect();
        this._initialVerticalEvent();
        this._initialHorizontalEvent();
        this._viewport.setScrollBar(this);
    }

    static attachTo(view: Viewport, props?: IScrollBarProps) {
        return new ScrollBar(view, props);
    }

    override dispose() {
        super.dispose();
        this._horizonPointerMoveSub?.unsubscribe();
        this._horizonPointerUpSub?.unsubscribe();
        this._verticalPointerMoveSub?.unsubscribe();
        this._verticalPointerUpSub?.unsubscribe();
        this._eventSub.unsubscribe();
        this._mainScene = null;
        this._viewport.removeScrollBar();
    }

    override render(ctx: UniverRenderingContext, left: number = 0, top: number = 0) {
        const { scrollX, scrollY } = this._viewport;
        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (this.enableHorizontal) {
            this.horizonScrollTrack!.render(ctx);
            this.horizonThumbRect!.translate(scrollX).render(ctx);
        }

        if (this.enableVertical) {
            this.verticalScrollTrack!.render(ctx);
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
                width: Math.max(0, this.barSize - this.barBorder),
                height: Math.max(0, this.barSize - this.barBorder),
            });
        }
    }

    override makeDirty(state: boolean) {
        this.horizonScrollTrack?.makeDirty(state);
        this.horizonThumbRect?.makeDirty(state);
        this.verticalScrollTrack?.makeDirty(state);
        this.verticalThumbRect?.makeDirty(state);
        this.placeholderBarRect?.makeDirty(state);

        this.makeViewDirty(state);
    }

    makeViewDirty(state: boolean) {
        const mainScene = this._mainScene || this._viewport.scene;
        mainScene.makeDirty(state);
    }

    override pick(coord: Vector2) {
        if (this.horizonThumbRect?.isHit(coord)) {
            return this.horizonThumbRect;
        }

        if (this.verticalThumbRect?.isHit(coord)) {
            return this.verticalThumbRect;
        }

        if (this.horizonScrollTrack?.isHit(coord)) {
            return this.horizonScrollTrack;
        }

        if (this.verticalScrollTrack?.isHit(coord)) {
            return this.verticalScrollTrack;
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

        this.horizontalThumbSize =
            ((this.horizontalBarWidth * (this.horizontalBarWidth - this.barBorder)) / contentWidth) *
            this.thumbLengthRatio;

        // this._horizontalThumbWidth = this._horizontalThumbWidth < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._horizontalThumbWidth;
        if (this.horizontalThumbSize < this.minThumbSizeH) {
            this.horizontalMinusMiniThumb = this.minThumbSizeH - this.horizontalThumbSize;
            this.horizontalThumbSize = this.minThumbSizeH;
        }

        this.horizonScrollTrack?.transformByState({
            left: 0,
            top: parentHeight - this.barSize,
            width: this.horizontalBarWidth,
            height: Math.max(0, this.barSize - this.barBorder),
        });

        if (this.horizontalThumbSize >= parentWidth - this.barSize) {
            // why hide the thumb rect ?
            // this.horizonThumbRect?.setProps({
            //     visible: false,
            // });
        } else {
            if (!this.horizonThumbRect?.visible) {
                this.horizonThumbRect?.setProps({
                    visible: true,
                });
            }

            this.horizonThumbRect?.transformByState({
                left: this._viewport.scrollX,
                top: parentHeight - this.barSize + this.thumbMargin,
                width: this.horizontalThumbSize,
                height: this.scrollHandleThickness,
            });
        }
    }

    private _resizeVertical(parentWidth: number, parentHeight: number, contentHeight: number) {
        if (!this.enableVertical) {
            return;
        }

        this.verticalMinusMiniThumb = 0;
        this.verticalBarHeight = parentHeight - (this.enableHorizontal ? this.barSize : 0) - this.barBorder;
        this.verticalThumbSize =
            ((this.verticalBarHeight * this.verticalBarHeight) / contentHeight) * this.thumbLengthRatio;
        // this._verticalThumbHeight = this._verticalThumbHeight < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._verticalThumbHeight;
        if (this.verticalThumbSize < this.minThumbSizeV) {
            this.verticalMinusMiniThumb = this.minThumbSizeV - this.verticalThumbSize;
            this.verticalThumbSize = this.minThumbSizeV;
        }

        this.verticalScrollTrack?.transformByState({
            left: parentWidth - this.barSize,
            top: 0,
            width: Math.max(0, this.barSize - this.barBorder),
            height: this.verticalBarHeight,
        });

        if (this.verticalThumbSize >= parentHeight - this.barSize) {
            // why hide the thumb rect ?
            // this.verticalThumbRect?.setProps({
            //     visible: false,
            // });
        } else {
            if (!this.verticalThumbRect?.visible) {
                this.verticalThumbRect?.setProps({
                    visible: true,
                });
            }

            this.verticalThumbRect?.transformByState({
                left: parentWidth - this.barSize + this.thumbMargin,
                top: this._viewport.scrollY,
                width: this.scrollHandleThickness,
                height: this.verticalThumbSize,
            });
        }
    }

    private _initialScrollRect() {
        if (this.enableHorizontal) {
            this.horizonScrollTrack = new Rect('__horizonBarRect__', {
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
            this.verticalScrollTrack = new Rect('__verticalBarRect__', {
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

        const mainScene = this._mainScene || this._viewport.scene;

        if (this.verticalThumbRect) {
            this._eventSub.add(this.verticalThumbRect.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                this._hoverFunc(this.thumbHoverBackgroundColor!, this.verticalThumbRect!)(evt, state);
            }));
        }
        if (this.verticalThumbRect) {
            this._eventSub.add(this.verticalThumbRect.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                this._hoverFunc(this.thumbBackgroundColor!, this.verticalThumbRect!)(evt, state);
            }));
        }

        // events for pointerdown at scroll track
        if (this.verticalScrollTrack) {
            this._eventSub.add(this.verticalScrollTrack.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._viewport.scrollToBarPos({
                    y: e.offsetY - this._viewport.top - this.verticalThumbSize / 2,
                });

                state.stopPropagation();
            }));
        }

        // drag events for vertical scrollbar
        // scene.input-manager@_onPointerDown --> base-object@triggerPointerDown!
        if (this.verticalThumbRect) {
            this._eventSub.add(this.verticalThumbRect.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                const srcElement = this.verticalThumbRect;
                this._isVerticalMove = true;
                this._lastX = e.offsetX;
                this._lastY = e.offsetY;
                // srcElement.fill = this._thumbHoverBackgroundColor!;
                srcElement?.setProps({
                    fill: this.thumbActiveBackgroundColor!,
                });
                mainScene.setCaptureObject(this.verticalThumbRect!);
                mainScene.disableObjectsEvent();
                this.makeViewDirty(true);
                state.stopPropagation();
            }));
        }

        // pointer down then move on scrollbar
        this._verticalPointerMoveSub = mainScene.onPointerMove$.subscribeEvent((evt: unknown, _state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._isVerticalMove) {
                return;
            }
            this._viewport.scrollByBarDeltaValue({
                y: e.offsetY - this._lastY,
            });

            this._lastY = e.offsetY;
            mainScene.getEngine()?.setCapture();
        });

        this._verticalPointerUpSub = mainScene.onPointerUp$.subscribeEvent((_evt: unknown, _state: EventState) => {
            const srcElement = this.verticalThumbRect;
            this._isVerticalMove = false;
            mainScene.releaseCapturedObject();
            mainScene.enableObjectsEvent();
            srcElement?.setProps({
                fill: this.thumbHoverBackgroundColor!,
            });
            this.makeViewDirty(true);
        });
    }

    private _hoverFunc(color: string, object: Rect): (evt: unknown, state: EventState) => void {
        return (_evt: unknown, _state: EventState) => {
            const srcElement = object;
            srcElement.setProps({
                fill: color,
            });
            this.makeViewDirty(true);
        };
    }

    private _initialHorizontalEvent() {
        if (!this.enableHorizontal) {
            return;
        }

        const mainScene = this._mainScene || this._viewport.scene;

        if (this.horizonThumbRect) {
            this._eventSub.add(this.horizonThumbRect.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                this._hoverFunc(this.thumbHoverBackgroundColor, this.horizonThumbRect!)(evt, state);
            }));
        }
        if (this.horizonThumbRect) {
            this._eventSub.add(this.horizonThumbRect.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                this._hoverFunc(this.thumbBackgroundColor, this.horizonThumbRect!)(evt, state);
            }));
        }

        // events for pointerdown at scrolltrack
        if (this.horizonScrollTrack) {
            this._eventSub.add(this.horizonScrollTrack.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._viewport.scrollToBarPos({
                    x: e.offsetX - this._viewport.left - this.horizontalThumbSize / 2,
                });
                state.stopPropagation();
            }));
        }

        // drag and move event
        if (this.horizonThumbRect) {
            this._eventSub.add(this.horizonThumbRect.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._isHorizonMove = true;
                this._lastX = e.offsetX;
                this._lastY = e.offsetY;
                this.horizonThumbRect?.setProps({
                    fill: this.thumbActiveBackgroundColor!,
                });
                this.makeViewDirty(true);
                mainScene.setCaptureObject(this.horizonThumbRect!);
                mainScene.disableObjectsEvent();
                state.stopPropagation();
            }));
        }

        // pointer down then move on scrollbar
        this._horizonPointerMoveSub = mainScene.onPointerMove$.subscribeEvent((evt: unknown, _state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._isHorizonMove) {
                return;
            }
            this._viewport.scrollByBarDeltaValue({
                x: e.offsetX - this._lastX,
            });
            this._lastX = e.offsetX;
            mainScene.getEngine()?.setCapture();
        });
        this._horizonPointerUpSub = mainScene.onPointerUp$.subscribeEvent((evt: unknown, state: EventState) => {
            const srcElement = this.horizonThumbRect;
            this._isHorizonMove = false;
            mainScene.releaseCapturedObject();
            mainScene.enableObjectsEvent();
            srcElement?.setProps({
                fill: this.thumbHoverBackgroundColor!,
            });
            this.makeViewDirty(true);
        });
    }
}
