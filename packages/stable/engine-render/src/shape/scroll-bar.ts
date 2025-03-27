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
import { Disposable, Tools } from '@univerjs/core';
import { Subscription } from 'rxjs';
import { Transform } from '../basics/transform';
import { Rect } from './rect';

export interface IScrollBarProps {
    mainScene?: Scene;
    thumbMargin?: number;
    thumbLengthRatio?: number;
    thumbBackgroundColor?: string;
    thumbHoverBackgroundColor?: string;
    thumbActiveBackgroundColor?: string;
    /**
     * The thickness of a scrolling track(not scrolling thumb).
     */
    barSize?: number;
    /**
     * The thickness of track border.
     */
    barBorder?: number;

    enableHorizontal?: boolean;
    enableVertical?: boolean;

    /**
     * The min width of horizon thumb
     */
    minThumbSizeH?: number;

    /**
     * The min height of vertical thumb
     */
    minThumbSizeV?: number;
}

const MIN_THUMB_SIZE = 17;
const DEFAULT_TRACK_SIZE = 10;
const HOVER_TRACK_SIZE = 10;
const DEFAULT_THUMB_MARGIN = 2;
const HOVER_THUMB_MARGIN = 1;

export class ScrollBar extends Disposable {
    _enableHorizontal: boolean = true;
    _enableVertical: boolean = true;

    horizontalThumbSize: number = 0;
    horizontalMinusMiniThumb: number = 0;
    horizontalTrackWidth: number = 0;
    horizonScrollTrack: Nullable<Rect>;
    horizonThumbRect: Nullable<Rect>;

    verticalThumbSize: number = 0;
    verticalTrackHeight: number = 0;
    verticalMinusMiniThumb: number = 0;
    verticalScrollTrack: Nullable<Rect>;
    verticalThumbRect: Nullable<Rect>;

    placeholderBarRect: Nullable<Rect>;

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

    private _thumbDefaultBackgroundColor = 'rgba(24, 28, 42, 0.20)';
    private _thumbHoverBackgroundColor = 'rgba(24, 28, 42, 0.30)';
    private _thumbActiveBackgroundColor = 'rgba(24, 28, 42, 0.40)';
    private _trackBackgroundColor = 'rgba(255,255,255,0.5)';
    private _trackBorderColor = 'rgba(255,255,255,0.7)';

    /**
     * The thickness of a scrolling track
     * ThumbSize = trackSize - thumbMargin * 2
     */
    private _trackThickness: number = DEFAULT_TRACK_SIZE;
    // private _hTrackThickness: number = DEFAULT_TRACK_SIZE;
    // private _vTrackThickness: number = DEFAULT_TRACK_SIZE;

    /**
     * The margin between thumb and bar.
     * ThumbSize = barSize - thumbMargin * 2
     */
    // private _thumbMargin = DEFAULT_THUMB_MARGIN;
    private _vThumbMargin = DEFAULT_THUMB_MARGIN;
    private _hThumbMargin = DEFAULT_THUMB_MARGIN;

    // origin: barBorder
    private _trackBorderThickness = 1;
    private _thumbLengthRatio = 1;

    /**
     * The min width of horizon thumb, Corresponds to minThumbSizeH in props
     */
    private _minThumbSizeH = MIN_THUMB_SIZE;
    /**
     * The min height of vertical thumb,  Corresponds to minThumbSizeV in props
     */
    private _minThumbSizeV = MIN_THUMB_SIZE;

    private _eventSub = new Subscription();

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

        if (Tools.isDefine(props.barSize)) {
            this._trackThickness = props.barSize;
        }

        if (Tools.isDefine(props.barBorder)) {
            this._trackBorderThickness = props.barBorder;
        }

        if (Tools.isDefine(props.thumbMargin)) {
            this._hThumbMargin = props.thumbMargin;
            this._vThumbMargin = props.thumbMargin;
        }
    }

    get enableHorizontal() {
        return this._enableHorizontal;
    }

    set enableHorizontal(val: boolean) {
        this._enableHorizontal = val;
    }

    get enableVertical() {
        return this._enableVertical;
    }

    set enableVertical(val: boolean) {
        this._enableVertical = val;
    }

    get limitX() {
        if (!this.horizonThumbRect?.visible) {
            return 0;
        }
        return this.horizontalTrackWidth - this.horizontalThumbSize;
    }

    get limitY() {
        if (!this.verticalThumbRect?.visible) {
            return 0;
        }
        return this.verticalTrackHeight - this.verticalThumbSize;
    }

    get ratioScrollX(): number {
        if (
            this._enableHorizontal === false ||
            this.horizontalThumbSize === undefined ||
            this.horizontalTrackWidth === undefined
        ) {
            return 1;
        }

        const ratio = (
            ((this.horizontalThumbSize - this.horizontalMinusMiniThumb) * this.miniThumbRatioX) /
            this.horizontalTrackWidth
        );

        if (Number.isNaN(ratio)) {
            return 1;
        } else {
            return ratio;
        }
    }

    get ratioScrollY(): number {
        if (
            this._enableVertical === false ||
            this.verticalThumbSize === undefined ||
            this.verticalTrackHeight === undefined
        ) {
            return 1;
        }
        const ratio = (
            ((this.verticalThumbSize - this.verticalMinusMiniThumb) * this.miniThumbRatioY) / this.verticalTrackHeight
        );

        if (Number.isNaN(ratio)) {
            return 1;
        } else {
            return ratio;
        }
    }

    get miniThumbRatioX() {
        const limit = this.horizontalTrackWidth - this.horizontalThumbSize;

        if (limit === 0) {
            return 0;
        }

        const actual = this.horizontalTrackWidth - (this.horizontalThumbSize - this.horizontalMinusMiniThumb);

        if (actual === 0) {
            return 0;
        }

        return limit / actual;
    }

    get miniThumbRatioY() {
        const limit = this.verticalTrackHeight - this.verticalThumbSize;

        if (limit === 0) {
            return 0;
        }

        const actual = this.verticalTrackHeight - (this.verticalThumbSize - this.verticalMinusMiniThumb);

        if (actual === 0) {
            return 0;
        }

        return limit / actual;
    }

    hasHorizonThumb() {
        return this.horizonThumbRect?.visible || false;
    }

    hasVerticalThumb() {
        return this.verticalThumbRect?.visible || false;
    }

    get scrollHorizonThumbThickness() {
        return Math.max(0, this._trackThickness - this._hThumbMargin * 2);
    }

    get scrollVerticalThumbThickness() {
        return Math.max(0, this._trackThickness - this._vThumbMargin * 2);
    }

    set barSize(v: number) {
        this._trackThickness = v;
    }

    get barSize() {
        return this._trackThickness;
    }

    set trackThickness(v: number) {
        this._trackThickness = v;
    }

    get trackThickness() {
        return this._trackThickness;
    }

    static attachTo(view: Viewport, props?: IScrollBarProps) {
        return new ScrollBar(view, props);
    }

    override dispose() {
        super.dispose();
        this.horizonScrollTrack?.dispose();
        this.horizonThumbRect?.dispose();
        this.verticalScrollTrack?.dispose();
        this.verticalThumbRect?.dispose();
        this.placeholderBarRect?.dispose();

        this.horizonScrollTrack = null;
        this.horizonThumbRect = null;
        this.verticalScrollTrack = null;
        this.verticalThumbRect = null;
        this.placeholderBarRect = null;

        this._horizonPointerMoveSub?.unsubscribe();
        this._horizonPointerUpSub?.unsubscribe();
        this._verticalPointerMoveSub?.unsubscribe();
        this._verticalPointerUpSub?.unsubscribe();
        this._eventSub.unsubscribe();
        this._mainScene = null;
        this._viewport.removeScrollBar();
    }

    render(ctx: UniverRenderingContext, left: number = 0, top: number = 0) {
        const { scrollX, scrollY } = this._viewport;
        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        if (this._enableHorizontal) {
            this.horizonScrollTrack!.render(ctx);
            this.horizonThumbRect!.translate(scrollX).render(ctx);
        }

        if (this._enableVertical) {
            this.verticalScrollTrack!.render(ctx);
            this.verticalThumbRect!.translate(undefined, scrollY).render(ctx);
        }

        if (this._enableHorizontal && this._enableVertical) {
            this.placeholderBarRect!.render(ctx);
        }

        ctx.restore();
    }

    private _resizeHorizontal() {
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        const contentWidth = this._contentW;

        // ratioScrollY = 内容可视区高度/内容实际区高度= 滑动条的高度/滑道高度=滚动条的顶部距离/实际内容区域顶部距离；
        if (!this._enableHorizontal) {
            return;
        }

        this.horizontalMinusMiniThumb = 0;
        this.horizontalTrackWidth = viewportW - (this._enableVertical ? this._trackThickness : 0) - this._trackBorderThickness;

        this.horizontalThumbSize =
            ((this.horizontalTrackWidth * (this.horizontalTrackWidth - this._trackBorderThickness)) / contentWidth) *
            this._thumbLengthRatio;

        // this._horizontalThumbWidth = this._horizontalThumbWidth < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._horizontalThumbWidth;
        if (this.horizontalThumbSize < this._minThumbSizeH) {
            this.horizontalMinusMiniThumb = this._minThumbSizeH - this.horizontalThumbSize;
            this.horizontalThumbSize = this._minThumbSizeH;
        }

        this.horizonScrollTrack?.transformByState({
            left: 0,
            top: viewportH - this._trackThickness,
            width: this.horizontalTrackWidth,
            height: Math.max(0, this._trackThickness - this._trackBorderThickness),
        });

        // content is smaller than viewport size
        if (this.horizontalThumbSize >= viewportW - (this._trackThickness + 2)) {
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
                left: this._viewport.scrollX,
                top: viewportH - this._trackThickness + this._hThumbMargin,
                width: this.horizontalThumbSize,
                height: this.scrollHorizonThumbThickness,
            });
        }
    }

    private _resizeVertical() {
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        const contentHeight = this._contentH;

        if (!this._enableVertical) {
            return;
        }

        this.verticalMinusMiniThumb = 0;
        this.verticalTrackHeight = viewportH - (this._enableHorizontal ? this._trackThickness : 0) - this._trackBorderThickness;
        this.verticalThumbSize =
            ((this.verticalTrackHeight * this.verticalTrackHeight) / contentHeight) * this._thumbLengthRatio;
        // this._verticalThumbHeight = this._verticalThumbHeight < MINI_THUMB_SIZE ? MINI_THUMB_SIZE : this._verticalThumbHeight;
        if (this.verticalThumbSize < this._minThumbSizeV) {
            this.verticalMinusMiniThumb = this._minThumbSizeV - this.verticalThumbSize;
            this.verticalThumbSize = this._minThumbSizeV;
        }

        this.verticalScrollTrack?.transformByState({
            left: viewportW - this._trackThickness,
            top: 0,
            width: Math.max(0, this._trackThickness - this._trackBorderThickness),
            height: this.verticalTrackHeight,
        });

        // content is smaller than viewport size
        if (this.verticalThumbSize >= viewportH - this._trackThickness) {
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
                left: viewportW - this._trackThickness + this._vThumbMargin,
                top: this._viewport.scrollY,
                width: this.scrollVerticalThumbThickness,
                height: this.verticalThumbSize,
            });
        }
    }

    private _resizeRightBottomCorner() {
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        if (this._enableHorizontal && this._enableVertical) {
            this.placeholderBarRect?.transformByState({
                left: viewportW - this._trackThickness,
                top: viewportH - this._trackThickness,
                width: Math.max(0, this._trackThickness - this._trackBorderThickness),
                height: Math.max(0, this._trackThickness - this._trackBorderThickness),
            });
        }
    }

    private _viewportH = 0;
    private _viewportW = 0;
    private _contentW = 0;
    private _contentH = 0;
    /**
     * Adjust scroll track & thumb size based on the viewport size.
     * @param viewportWidth
     * @param viewportHeight
     * @param contentWidth
     * @param contentHeight
     */
    resize(
        viewportWidth: number = 0,
        viewportHeight: number = 0,
        contentWidth: number = 0,
        contentHeight: number = 0
    ) {
        if (viewportWidth === 0 && viewportWidth === 0) {
            return;
        }

        this._viewportH = viewportHeight;
        this._viewportW = viewportWidth;
        this._contentW = contentWidth;
        this._contentH = contentHeight;

        this._resizeHorizontal();
        this._resizeVertical();
        this._resizeRightBottomCorner();
    }

    makeDirty(state: boolean) {
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

    pick(coord: Vector2) {
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

    private _initialScrollRect() {
        if (this._enableHorizontal) {
            this.horizonScrollTrack = new Rect('__horizonBarRect__', {
                fill: this._trackBackgroundColor!,
                strokeWidth: this._trackBorderThickness,
                stroke: this._trackBorderColor!,
            });

            this.horizonThumbRect = new Rect('__horizonThumbRect__', {
                radius: 6,
                fill: this._thumbDefaultBackgroundColor!,
            });
        }

        if (this._enableVertical) {
            this.verticalScrollTrack = new Rect('__verticalBarRect__', {
                fill: this._trackBackgroundColor!,
                strokeWidth: this._trackBorderThickness,
                stroke: this._trackBorderColor!,
            });

            this.verticalThumbRect = new Rect('__verticalThumbRect__', {
                radius: 6,
                fill: this._thumbDefaultBackgroundColor!,
            });
        }

        if (this._enableHorizontal && this._enableVertical) {
            this.placeholderBarRect = new Rect('__placeholderBarRect__', {
                fill: this._trackBackgroundColor!,
                strokeWidth: this._trackBorderThickness,
                stroke: this._trackBorderColor!,
            });
        }
    }

    private _initialVerticalEvent() {
        if (!this._enableVertical) {
            return;
        }

        const mainScene = this._mainScene || this._viewport.scene;

        if (this.verticalThumbRect) {
            this._eventSub.add(this.verticalThumbRect.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                this._verticalHoverFunc(this._thumbHoverBackgroundColor!, evt, state);
            }));
        }
        if (this.verticalThumbRect) {
            this._eventSub.add(this.verticalThumbRect.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                this._verticalHoverLeaveFunc(this._thumbDefaultBackgroundColor!, evt, state);
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
                    fill: this._thumbActiveBackgroundColor!,
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
                fill: this._thumbHoverBackgroundColor!,
            });
            this.makeViewDirty(true);
        });
    }

    private _horizonHoverFunc(color: string, evt: unknown, state: EventState) {
        // this._trackThickness = HOVER_TRACK_SIZE;
        this._hThumbMargin = HOVER_THUMB_MARGIN;
        this._resizeHorizontal();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, this.horizonThumbRect!)(evt, state);
    }

    private _horizonHoverLeaveFunc(color: string, evt: unknown, state: EventState) {
        // this._trackThickness = DEFAULT_TRACK_SIZE;
        this._hThumbMargin = DEFAULT_THUMB_MARGIN;
        this._resizeHorizontal();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, this.horizonThumbRect!)(evt, state);
    }

    private _verticalHoverFunc(color: string, evt: unknown, state: EventState) {
        this._vThumbMargin = HOVER_THUMB_MARGIN;
        this._resizeVertical();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, this.verticalThumbRect!)(evt, state);
    }

    private _verticalHoverLeaveFunc(color: string, evt: unknown, state: EventState) {
        this._vThumbMargin = DEFAULT_THUMB_MARGIN;
        this._resizeVertical();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, this.verticalThumbRect!)(evt, state);
    }

    private _hoverFunc(color: string, thumb: Rect): (evt: unknown, state: EventState) => void {
        return (_evt: unknown, _state: EventState) => {
            thumb.setProps({
                fill: color,
            });
            this._trackThickness = HOVER_TRACK_SIZE;
            this._resizeHorizontal();
            this.makeViewDirty(true);
        };
    }

    private _initialHorizontalEvent() {
        if (!this._enableHorizontal) {
            return;
        }

        const mainScene = this._mainScene || this._viewport.scene;

        if (this.horizonThumbRect) {
            this._eventSub.add(this.horizonThumbRect.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                this._horizonHoverFunc(this._thumbHoverBackgroundColor, evt, state);
            }));
        }
        if (this.horizonThumbRect) {
            this._eventSub.add(this.horizonThumbRect.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                this._horizonHoverLeaveFunc(this._thumbDefaultBackgroundColor, evt, state);
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
                    fill: this._thumbActiveBackgroundColor!,
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
            ;
            this._isHorizonMove = false;
            mainScene.releaseCapturedObject();
            mainScene.enableObjectsEvent();
            this.horizonThumbRect?.setProps({
                fill: this._thumbHoverBackgroundColor!,
            });
            this.makeViewDirty(true);
        });
    }
}
