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
    /** Margin between the track to the edge of the scrollable area. Default is 2px. */
    thumbMargin?: number;
    thumbLengthRatio?: number;
    /** Background color of the thumb. */
    thumbBackgroundColor?: string;
    /** Background color of the thumb on hover. */
    thumbHoverBackgroundColor?: string;
    /** Background color of the thumb when active. */
    thumbActiveBackgroundColor?: string;
    /** Background color of the track. */
    trackBackgroundColor?: string;
    /** Background color of the track border. */
    trackBorderColor?: string;
    /** The thickness of a scrolling track (not scrolling thumb). */
    barSize?: number;
    /** The thickness of track border. */
    barBorder?: number;
    /** Enable the horizontal scroll bar. True by default. */
    enableHorizontal?: boolean;
    /** Enable the vertical scroll bar. True by default. */
    enableVertical?: boolean;
    /** The min width of horizon thumb. Default is 17 px. */
    minThumbSizeH?: number;
    /** The min height of vertical thumb. Default is 17 px. */
    minThumbSizeV?: number;
}

const MIN_THUMB_SIZE = 17;
const DEFAULT_TRACK_SIZE = 10;
const HOVER_TRACK_SIZE = 10;
const DEFAULT_THUMB_MARGIN = 2;
const HOVER_THUMB_MARGIN = 1;

export class ScrollBar extends Disposable {
    private _enableHorizontal: boolean = true;
    private _enableVertical: boolean = true;

    private _horizontalMetrics = {
        thumbSize: 0,
        minusMiniThumb: 0,
        trackWidth: 0,
    };

    private _verticalMetrics = {
        thumbSize: 0,
        minusMiniThumb: 0,
        trackHeight: 0,
    };

    private _scrollElements = {
        horizonTrack: null as Nullable<Rect>,
        horizonThumb: null as Nullable<Rect>,
        verticalTrack: null as Nullable<Rect>,
        verticalThumb: null as Nullable<Rect>,
        placeholder: null as Nullable<Rect>,
    };

    protected _viewport!: Viewport;
    private _mainScene: Nullable<Scene>;

    private _pointerState = {
        lastX: -1,
        lastY: -1,
        isHorizonMove: false,
        isVerticalMove: false,
    };

    private _subscriptions = {
        horizonMove: null as Nullable<Subscription>,
        horizonUp: null as Nullable<Subscription>,
        verticalMove: null as Nullable<Subscription>,
        verticalUp: null as Nullable<Subscription>,
    };

    private readonly _colors = {
        thumbDefault: '#D9D9D9',
        thumbHover: '#BFBFBF',
        thumbActive: '#8C8C8C',
        trackBackground: 'rgba(255,255,255,0.5)',
        trackBorder: 'rgba(255,255,255,0.7)',
    } as const;

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
        this._mainScene = view.scene;
        this._initialScrollRect();
        this._initialHorizontalEvent();
        this._initialVerticalEvent();
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

        if (Tools.isDefine(props.thumbBackgroundColor)) {
            this._thumbDefaultBackgroundColor = props.thumbBackgroundColor;
        }

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
        if (!this._scrollElements.horizonThumb?.visible) {
            return 0;
        }
        return this.horizontalTrackWidth - this.horizontalThumbSize;
    }

    get limitY() {
        if (!this._scrollElements.verticalThumb?.visible) {
            return 0;
        }
        return this.verticalTrackHeight - this.verticalThumbSize;
    }

    get ratioScrollX() {
        if (!this._enableHorizontal) return 1;
        const { thumbSize, minusMiniThumb, trackWidth } = this._horizontalMetrics;
        if (thumbSize === undefined || trackWidth === undefined) return 0;
        return thumbSize / (trackWidth - minusMiniThumb);
    }

    get ratioScrollY() {
        if (!this._enableVertical) return 1;
        const { thumbSize, minusMiniThumb, trackHeight } = this._verticalMetrics;
        if (thumbSize === undefined || trackHeight === undefined) return 0;
        return thumbSize / (trackHeight - minusMiniThumb);
    }

    // get ratioX() {
    //     if (!this._enableHorizontal) return 0;
    //     const { thumbSize, minusMiniThumb, trackWidth } = this._horizontalMetrics;
    //     const { horizonThumb } = this._scrollElements;
    //     if (!horizonThumb?.getState()) return 0;
    //     return horizonThumb.getState().left / (trackWidth - minusMiniThumb);
    // }

    // get ratioY() {
    //     if (!this._enableVertical) return 0;
    //     const { thumbSize, minusMiniThumb, trackHeight } = this._verticalMetrics;
    //     const { verticalThumb } = this._scrollElements;
    //     if (!verticalThumb?.getState()) return 0;
    //     return verticalThumb.getState().top / (trackHeight - minusMiniThumb);
    // }

    get miniThumbRatioX() {
        if (!this._enableHorizontal) return 0;
        const { thumbSize, minusMiniThumb, trackWidth } = this._horizontalMetrics;
        if (thumbSize === undefined || trackWidth === undefined) return 0;
        return (thumbSize - minusMiniThumb) / trackWidth;
    }

    get miniThumbRatioY() {
        if (!this._enableVertical) return 0;
        const { thumbSize, minusMiniThumb, trackHeight } = this._verticalMetrics;
        if (thumbSize === undefined || trackHeight === undefined) return 0;
        return (thumbSize - minusMiniThumb) / trackHeight;
    }

    get horizontalTrackWidth() {
        if (!this._enableHorizontal) return 0;
        return this._viewportW - this._trackThickness;
    }

    get horizontalThumbSize() {
        if (!this._enableHorizontal) return 0;
        return Math.max(MIN_THUMB_SIZE, this._viewportW * (this._viewportW / this._contentW));
    }

    get verticalTrackHeight() {
        if (!this._enableVertical) return 0;
        return this._viewportH - this._trackThickness;
    }

    get verticalThumbSize() {
        if (!this._enableVertical) return 0;
        return Math.max(MIN_THUMB_SIZE, this._viewportH * (this._viewportH / this._contentH));
    }

    hasHorizonThumb() {
        return this._scrollElements.horizonThumb?.visible || false;
    }

    hasVerticalThumb() {
        return this._scrollElements.verticalThumb?.visible || false;
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
        const { horizonTrack, horizonThumb, verticalTrack, verticalThumb, placeholder } = this._scrollElements;
        const { horizonMove, horizonUp, verticalMove, verticalUp } = this._subscriptions;

        // Dispose scroll elements
        horizonTrack?.dispose();
        horizonThumb?.dispose();
        verticalTrack?.dispose();
        verticalThumb?.dispose();
        placeholder?.dispose();

        // Clear references
        this._scrollElements = {
            horizonTrack: null,
            horizonThumb: null,
            verticalTrack: null,
            verticalThumb: null,
            placeholder: null,
        };

        // Cleanup subscriptions
        horizonMove?.unsubscribe();
        horizonUp?.unsubscribe();
        verticalMove?.unsubscribe();
        verticalUp?.unsubscribe();
        this._eventSub.unsubscribe();

        this._mainScene = null;
        this._viewport.removeScrollBar();
    }

    render(ctx: UniverRenderingContext, left: number = 0, top: number = 0) {
        const { scrollX, scrollY } = this._viewport;
        const { horizonTrack, horizonThumb, verticalTrack, verticalThumb, placeholder } = this._scrollElements;

        ctx.save();
        const transform = new Transform([1, 0, 0, 1, left, top]);
        const m = transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

        if (this._enableHorizontal && horizonTrack && horizonThumb) {
            horizonTrack.render(ctx);
            horizonThumb.translate(scrollX).render(ctx);
        }

        if (this._enableVertical && verticalTrack && verticalThumb) {
            verticalTrack.render(ctx);
            verticalThumb.translate(undefined, scrollY).render(ctx);
        }

        if (this._enableHorizontal && this._enableVertical && placeholder) {
            placeholder.render(ctx);
        }

        ctx.restore();
    }

    private _resizeHorizontal() {
        if (!this._enableHorizontal) return;

        const { horizonTrack, horizonThumb } = this._scrollElements;
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        const contentWidth = this._contentW;

        // Reset metrics
        this._horizontalMetrics.minusMiniThumb = 0;
        this._horizontalMetrics.trackWidth = viewportW -
            (this._enableVertical ? this._trackThickness : 0) -
            this._trackBorderThickness;

        // Calculate thumb size
        this._horizontalMetrics.thumbSize =
            ((this._horizontalMetrics.trackWidth *
                (this._horizontalMetrics.trackWidth - this._trackBorderThickness)) / contentWidth) *
            this._thumbLengthRatio;

        // Enforce minimum thumb size
        if (this._horizontalMetrics.thumbSize < this._minThumbSizeH) {
            this._horizontalMetrics.minusMiniThumb = this._minThumbSizeH - this._horizontalMetrics.thumbSize;
            this._horizontalMetrics.thumbSize = this._minThumbSizeH;
        }

        // Update track position and size
        horizonTrack?.transformByState({
            left: 0,
            top: viewportH - this._trackThickness,
            width: this._horizontalMetrics.trackWidth,
            height: Math.max(0, this._trackThickness - this._trackBorderThickness),
        });

        // Handle thumb visibility and position
        if (this._horizontalMetrics.thumbSize >= viewportW - (this._trackThickness + 2)) {
            horizonThumb?.setProps({ visible: false });
        } else {
            if (!horizonThumb?.visible) {
                horizonThumb?.setProps({ visible: true });
            }

            horizonThumb?.transformByState({
                left: this._viewport.scrollX,
                top: viewportH - this._trackThickness + this._hThumbMargin,
                width: this._horizontalMetrics.thumbSize,
                height: this.scrollHorizonThumbThickness,
            });
        }
    }

    private _resizeVertical() {
        if (!this._enableVertical) return;

        const { verticalTrack, verticalThumb } = this._scrollElements;
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        const contentHeight = this._contentH;

        // Reset metrics
        this._verticalMetrics.minusMiniThumb = 0;
        this._verticalMetrics.trackHeight = viewportH -
            (this._enableHorizontal ? this._trackThickness : 0) -
            this._trackBorderThickness;

        // Calculate thumb size
        this._verticalMetrics.thumbSize =
            ((this._verticalMetrics.trackHeight *
                this._verticalMetrics.trackHeight) / contentHeight) *
            this._thumbLengthRatio;

        // Enforce minimum thumb size
        if (this._verticalMetrics.thumbSize < this._minThumbSizeV) {
            this._verticalMetrics.minusMiniThumb = this._minThumbSizeV - this._verticalMetrics.thumbSize;
            this._verticalMetrics.thumbSize = this._minThumbSizeV;
        }

        // Update track position and size
        verticalTrack?.transformByState({
            left: viewportW - this._trackThickness,
            top: 0,
            width: Math.max(0, this._trackThickness - this._trackBorderThickness),
            height: this._verticalMetrics.trackHeight,
        });

        // Handle thumb visibility and position
        if (this._verticalMetrics.thumbSize >= viewportH - this._trackThickness) {
            verticalThumb?.setProps({ visible: false });
        } else {
            if (!verticalThumb?.visible) {
                verticalThumb?.setProps({ visible: true });
            }
            verticalThumb?.transformByState({
                left: viewportW - this._trackThickness + this._vThumbMargin,
                top: this._viewport.scrollY,
                width: this.scrollVerticalThumbThickness,
                height: this._verticalMetrics.thumbSize,
            });
        }
    }

    private _resizeRightBottomCorner() {
        if (!this._enableHorizontal || !this._enableVertical) return;

        const { placeholder } = this._scrollElements;
        const viewportH = this._viewportH;
        const viewportW = this._viewportW;
        const thickness = Math.max(0, this._trackThickness - this._trackBorderThickness);

        placeholder?.transformByState({
            left: viewportW - this._trackThickness,
            top: viewportH - this._trackThickness,
            width: thickness,
            height: thickness,
        });
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
        const { horizonTrack, horizonThumb, verticalTrack, verticalThumb, placeholder } = this._scrollElements;

        horizonTrack?.makeDirty(state);
        horizonThumb?.makeDirty(state);
        verticalTrack?.makeDirty(state);
        verticalThumb?.makeDirty(state);
        placeholder?.makeDirty(state);

        this.makeViewDirty(state);
    }

    makeViewDirty(state: boolean) {
        const mainScene = this._mainScene || this._viewport.scene;
        mainScene.makeDirty(state);
    }

    pick(coord: Vector2) {
        if (this._scrollElements.horizonThumb?.isHit(coord)) {
            return this._scrollElements.horizonThumb;
        }

        if (this._scrollElements.verticalThumb?.isHit(coord)) {
            return this._scrollElements.verticalThumb;
        }

        if (this._scrollElements.horizonTrack?.isHit(coord)) {
            return this._scrollElements.horizonTrack;
        }

        if (this._scrollElements.verticalTrack?.isHit(coord)) {
            return this._scrollElements.verticalTrack;
        }

        if (this._scrollElements.verticalThumb?.isHit(coord)) {
            return this._scrollElements.verticalThumb;
        }

        if (this._scrollElements.horizonTrack?.isHit(coord)) {
            return this._scrollElements.horizonTrack;
        }

        if (this._scrollElements.verticalTrack?.isHit(coord)) {
            return this._scrollElements.verticalTrack;
        }

        return null;
    }

    private _initialScrollRect() {
        const { thumbDefault, trackBackground, trackBorder } = this._colors;

        const trackConfig = {
            fill: trackBackground,
            strokeWidth: this._trackBorderThickness,
            stroke: trackBorder,
        };

        const thumbConfig = {
            fill: thumbDefault,
            strokeWidth: 0,
        };

        if (this._enableHorizontal) {
            const horizonTrack = new Rect('__horizonBarRect__', {
                ...trackConfig,
                width: this._viewportW,
                height: this._trackThickness,
                left: 0,
                top: this._viewportH - this._trackThickness,
            });

            const horizonThumb = new Rect('__horizonThumbRect__', {
                ...thumbConfig,
                radius: 6,
                width: this.horizontalThumbSize,
                height: this.scrollHorizonThumbThickness,
                left: 0,
                top: this._viewportH - this._trackThickness + this._hThumbMargin,
            });

            this._scrollElements.horizonTrack = horizonTrack;
            this._scrollElements.horizonThumb = horizonThumb;
            // this._mainScene?.addObject(horizonTrack);
            // this._mainScene?.addObject(horizonThumb);
        }

        if (this._enableVertical) {
            const verticalTrack = new Rect('__verticalBarRect__', {
                ...trackConfig,
                width: this._trackThickness,
                height: this._viewportH,
                left: this._viewportW - this._trackThickness,
                top: 0,
            });

            const verticalThumb = new Rect('__verticalThumbRect__', {
                ...thumbConfig,
                radius: 6,
                width: this.scrollVerticalThumbThickness,
                height: this.verticalThumbSize,
                left: this._viewportW - this._trackThickness + this._vThumbMargin,
                top: 0,
            });

            this._scrollElements.verticalTrack = verticalTrack;
            this._scrollElements.verticalThumb = verticalThumb;
            // this._mainScene?.addObject(verticalTrack);
            // this._mainScene?.addObject(verticalThumb);
        }
    }

    private _initialVerticalEvent() {
        const mainScene = this._mainScene || this._viewport.scene;
        const { thumbDefault, thumbHover, thumbActive } = this._colors;

        // drag events for vertical scrollbar
        // scene.input-manager@_onPointerDown --> base-object@triggerPointerDown!
        if (this._scrollElements.verticalThumb) {
            const verticalThumb = this._scrollElements.verticalThumb;

            // Pointer enter event
            this._eventSub.add(verticalThumb.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                this._verticalHoverFunc(thumbHover, evt, state);
            }));

            // Pointer leave event
            this._eventSub.add(verticalThumb.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                if (verticalThumb._eventPass === true) return;
                this._verticalHoverLeaveFunc(thumbDefault, evt, state);
            }));

            // Pointer down event
            this._eventSub.add(verticalThumb.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                const e = evt as IPointerEvent | IMouseEvent;
                this._pointerState.isVerticalMove = true;
                this._pointerState.lastX = e.offsetX;
                this._pointerState.lastY = e.offsetY;

                verticalThumb.setProps({ fill: thumbActive });
                verticalThumb.setProps({ eventPass: true });
                this._scrollElements.verticalTrack?.setProps({ eventPass: true });
                mainScene.setCaptureObject(verticalThumb);
                // mainScene.disableObjectsEvent();
                this.makeViewDirty(true);
                state.stopPropagation();
            }));
        }

        // Handle pointer move events
        this._subscriptions.verticalMove = mainScene.onPointerMove$.subscribeEvent((evt: unknown, _state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._pointerState.isVerticalMove) return;

            this._viewport.scrollByBarDeltaValue({
                y: e.offsetY - this._pointerState.lastY,
            });

            this._pointerState.lastY = e.offsetY;
            mainScene.getEngine()?.setCapture();
        });

        // Handle pointer up events
        this._subscriptions.verticalUp = mainScene.onPointerUp$.subscribeEvent((evt: unknown, state: EventState) => {
            const { verticalThumb } = this._scrollElements;
            const { thumbHover } = this._colors;

            this._pointerState.isVerticalMove = false;
            this._verticalHoverLeaveFunc(thumbDefault, evt, state);
            mainScene.releaseCapturedObject();
            mainScene.enableObjectsEvent();
            if (verticalThumb) {
                verticalThumb.setProps({ fill: thumbHover });
                verticalThumb.setProps({ eventPass: false });
                this._scrollElements.verticalTrack?.setProps({ eventPass: false });
            }
            this.makeViewDirty(true);
        });
    }

    private _initialHorizontalEvent() {
        if (!this._enableHorizontal) return;

        const mainScene = this._mainScene || this._viewport.scene;
        const { horizonThumb, horizonTrack } = this._scrollElements;
        const { thumbHover, thumbDefault, thumbActive } = this._colors;

        // Thumb hover events
        if (horizonThumb) {
            this._eventSub.add(
                horizonThumb.onPointerEnter$.subscribeEvent((evt: unknown, state: EventState) => {
                    this._horizonHoverFunc(thumbHover, evt, state);
                })
            );

            this._eventSub.add(
                horizonThumb.onPointerLeave$.subscribeEvent((evt: unknown, state: EventState) => {
                    if (horizonThumb._eventPass === true) return;
                    this._horizonHoverLeaveFunc(thumbDefault, evt, state);
                })
            );
        }

        // Track click events
        if (horizonTrack) {
            this._eventSub.add(
                horizonTrack.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                    const e = evt as IPointerEvent | IMouseEvent;
                    this._viewport.scrollToBarPos({
                        x: e.offsetX - this._viewport.left - this._horizontalMetrics.thumbSize / 2,
                    });
                    state.stopPropagation();
                })
            );
        }

        // Thumb drag events
        if (horizonThumb) {
            this._eventSub.add(
                horizonThumb.onPointerDown$.subscribeEvent((evt: unknown, state: EventState) => {
                    const e = evt as IPointerEvent | IMouseEvent;
                    this._pointerState.isHorizonMove = true;
                    this._pointerState.lastX = e.offsetX;
                    this._pointerState.lastY = e.offsetY;

                    horizonThumb.setProps({ fill: thumbActive });
                    horizonThumb.setProps({ eventPass: true });
                    this._scrollElements.horizonTrack?.setProps({ eventPass: true });
                    this.makeViewDirty(true);
                    mainScene.setCaptureObject(horizonThumb);
                    // mainScene.disableObjectsEvent();
                    state.stopPropagation();
                })
            );
        }
        // pointer down then move on scrollbar
        this._subscriptions.horizonMove = mainScene.onPointerMove$.subscribeEvent((evt: unknown, _state: EventState) => {
            const e = evt as IPointerEvent | IMouseEvent;
            if (!this._pointerState.isHorizonMove) {
                return;
            }
            this._viewport.scrollByBarDeltaValue({
                x: e.offsetX - this._pointerState.lastX,
            });
            this._pointerState.lastX = e.offsetX;
            mainScene.getEngine()?.setCapture();
        });
        this._subscriptions.horizonUp = mainScene.onPointerUp$.subscribeEvent((evt: unknown, state: EventState) => {
            this._pointerState.isHorizonMove = false;
            mainScene.releaseCapturedObject();
            mainScene.enableObjectsEvent();
            this._horizonHoverLeaveFunc(thumbDefault, evt, state);
            this._scrollElements.horizonThumb?.setProps({
                fill: thumbDefault,
                eventPass: false,
            });
            this._scrollElements.horizonTrack?.setProps({ eventPass: false });
            this.makeViewDirty(true);
        });
    }

    private _horizonHoverFunc(color: string, evt: unknown, state: EventState) {
        const { horizonThumb } = this._scrollElements;
        this._hThumbMargin = HOVER_THUMB_MARGIN;
        this._resizeHorizontal();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, horizonThumb!)(evt, state);
    }

    private _horizonHoverLeaveFunc(color: string, evt: unknown, state: EventState) {
        const { horizonThumb } = this._scrollElements;
        this._hThumbMargin = DEFAULT_THUMB_MARGIN;
        this._resizeHorizontal();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, horizonThumb!)(evt, state);
    }

    private _verticalHoverFunc = (color: string, evt: unknown, state: EventState) => {
        const { verticalThumb } = this._scrollElements;
        this._vThumbMargin = HOVER_THUMB_MARGIN;
        this._resizeVertical();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, verticalThumb!)(evt, state);
    };

    private _verticalHoverLeaveFunc(color: string, evt: unknown, state: EventState) {
        const { verticalThumb } = this._scrollElements;
        this._vThumbMargin = DEFAULT_THUMB_MARGIN;
        this._resizeVertical();
        this._resizeRightBottomCorner();
        this._hoverFunc(color, verticalThumb!)(evt, state);
    }

    private _hoverFunc(color: string, thumb: Rect): (evt: unknown, state: EventState) => void {
        return (_evt: unknown, _state: EventState) => {
            thumb.setProps({ fill: color });
            this._trackThickness = HOVER_TRACK_SIZE;
            this._resizeHorizontal();
            this.makeViewDirty(true);
        };
    }
}
