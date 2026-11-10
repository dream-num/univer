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

import type { IAbsoluteTransform, Nullable } from '@univerjs/core';
import type { Subscription } from 'rxjs';
import { Disposable, MOVE_BUFFER_VALUE, requestImmediateMacroTask, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { BaseObject } from './base-object';
import type { IMouseEvent, IPointerEvent } from './basics/i-events';
import type { ITransformerConfig } from './basics/transformer-config';
import type { IBoundRectNoAngle, IPoint } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import type { Scene } from './scene';
import type { IRectProps } from './shape/rect';
import type { IRegularPolygonProps } from './shape/regular-polygon';
import type { IRotationHandleCandidate, IRotationHandleObstacle, IRotationHandlePlacement } from './transformer-rotation';
import type { Viewport } from './viewport';
import { CURSOR_TYPE } from './basics/const';
import { DeviceType } from './basics/i-events';
import { offsetRotationAxis } from './basics/offset-rotation-axis';
import { getCurrentScrollXY } from './basics/scroll-xy';
import { degToRad, precisionTo, radToDeg } from './basics/tools';
import { DEFAULT_TRANSFORMER_CONFIG } from './basics/transformer-config';
import { Vector2 } from './basics/vector2';
import { Group } from './group';
import { ScrollTimer } from './scroll-timer';
import { Control, CONTROL_TOUCH_HIT_RADIUS } from './shape/control';
import { Line } from './shape/line';
import { Rect } from './shape/rect';
import { RegularPolygon } from './shape/regular-polygon';
import { placeRotationHandle } from './transformer-rotation';

enum TransformerManagerType {
    RESIZE_LT = '__SpreadsheetTransformerResizeLT__',
    RESIZE_CT = '__SpreadsheetTransformerResizeCT__',
    RESIZE_RT = '__SpreadsheetTransformerResizeRT__',

    RESIZE_LM = '__SpreadsheetTransformerResizeLM__',
    RESIZE_RM = '__SpreadsheetTransformerResizeRM__',

    RESIZE_LB = '__SpreadsheetTransformerResizeLB__',
    RESIZE_CB = '__SpreadsheetTransformerResizeCB__',
    RESIZE_RB = '__SpreadsheetTransformerResizeRB__',

    OUTLINE = '__SpreadsheetTransformerOutline__',
    ROTATE_LINE = '__SpreadsheetTransformerRotateLine__',
    ROTATE = '__SpreadsheetTransformerRotate__',

    GROUP = '__SpreadsheetTransformer__',
}

const TransformerManagerTypeArray: TransformerManagerType[] = [
    TransformerManagerType.RESIZE_LT,
    TransformerManagerType.RESIZE_CT,
    TransformerManagerType.RESIZE_RT,
    TransformerManagerType.RESIZE_LM,
    TransformerManagerType.RESIZE_RM,
    TransformerManagerType.RESIZE_LB,
    TransformerManagerType.RESIZE_CB,
    TransformerManagerType.RESIZE_RB,
];

interface ITransformState {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
}

enum MoveObserverType {
    MOVE_START,
    MOVING,
    MOVE_END,
}

export interface IChangeObserverConfig {
    target?: BaseObject;
    objects: Map<string, BaseObject>;
    type: MoveObserverType;
    moveX?: number;
    moveY?: number;
    angle?: number;
    offsetX?: number;
    offsetY?: number;
}

const DEFAULT_TRANSFORMER_LAYER_INDEX = 2;

const MINI_WIDTH_LIMIT = 20;
const MINI_HEIGHT_LIMIT = 20;

const DEFAULT_CONTROL_PLUS_INDEX = 5000;

const ROTATE_ICON_SIZE = 14;

class TransformerRotateIcon extends Rect {
    protected override _draw(ctx: UniverRenderingContext) {
        const iconWidth = this.width || ROTATE_ICON_SIZE;
        const iconHeight = this.height || ROTATE_ICON_SIZE;
        const scaleX = iconWidth / 24;
        const scaleY = iconHeight / 24;

        ctx.save();
        ctx.scale(scaleX, scaleY);
        ctx.beginPath();
        ctx.lineWidth = (this.strokeWidth || 2) / Math.max(scaleX, scaleY);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = this.stroke || 'currentColor';

        ctx.moveTo(21, 12);
        ctx.arc(12, 12, 9, 0, Math.PI * 1.5, false);
        ctx.bezierCurveTo(14.52, 3, 16.93, 4, 18.74, 5.74);
        ctx.lineTo(21, 8);
        ctx.moveTo(21, 3);
        ctx.lineTo(21, 8);
        ctx.lineTo(16, 8);

        ctx.stroke();
        ctx.restore();
    }
}

class TransformerCropAnchor extends RegularPolygon {
    constructor(key: string, props: IRegularPolygonProps, private readonly _hitSize: number) {
        super(key, props);
    }

    override isHit(coord: Vector2): boolean {
        if (this._hitSize <= 0) {
            return super.isHit(coord);
        }
        const point = this.getInverseCoord(coord);
        const scale = this.getScene()?.getAncestorScale();
        const halfWidth = Math.max(this.width, this._hitSize / Math.max(scale?.scaleX ?? 1, 0.01)) / 2;
        const halfHeight = Math.max(this.height, this._hitSize / Math.max(scale?.scaleY ?? 1, 0.01)) / 2;
        return Math.abs(point.x - this.width / 2) <= halfWidth && Math.abs(point.y - this.height / 2) <= halfHeight;
    }
}

class TransformerAnchor extends Control {
    protected override _draw(ctx: UniverRenderingContext) {
        if (!this.shadowColor || (!this.shadowBlur && !this.shadowOffsetX && !this.shadowOffsetY)) {
            Rect.drawWith(ctx, this as IRectProps);
            return;
        }

        ctx.save();
        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowOffsetX = this.shadowOffsetX;
        ctx.shadowOffsetY = this.shadowOffsetY;
        Rect.drawWith(ctx, this as IRectProps);
        ctx.restore();
    }
}

/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 */
export class Transformer extends Disposable implements ITransformerConfig {
    private static readonly _selectionTapMovementThreshold = 12;

    isCropper: boolean = false;

    hoverEnabled = false;
    hoverEnterFunc: Nullable<(e: IPointerEvent | IMouseEvent) => void>;
    hoverLeaveFunc: Nullable<(e: IPointerEvent | IMouseEvent) => void>;

    moveEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.moveEnabled;
    moveOnlyWhenSelected = false;
    resizeEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.resizeEnabled;

    rotateEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.rotateEnabled;
    rotationSnaps: number[] = [];
    rotationSnapTolerance = 5;
    rotateAnchorOffset = DEFAULT_TRANSFORMER_CONFIG.rotateAnchorOffset;
    rotateAnchorPosition: 'top' | 'bottom' = DEFAULT_TRANSFORMER_CONFIG.rotateAnchorPosition;
    rotateLineEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.rotateLineEnabled;
    rotateSize = DEFAULT_TRANSFORMER_CONFIG.rotateSize;

    rotateCornerRadius = DEFAULT_TRANSFORMER_CONFIG.rotateCornerRadius;
    rotateFill: string | undefined = DEFAULT_TRANSFORMER_CONFIG.rotateFill;
    rotateStroke: string | undefined = DEFAULT_TRANSFORMER_CONFIG.rotateStroke;
    rotateStrokeWidth: number | undefined = DEFAULT_TRANSFORMER_CONFIG.rotateStrokeWidth;
    rotateIconEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.rotateIconEnabled;
    rotateIconStroke: string | undefined = DEFAULT_TRANSFORMER_CONFIG.rotateIconStroke;
    rotateIconStrokeWidth = DEFAULT_TRANSFORMER_CONFIG.rotateIconStrokeWidth;
    borderEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.borderEnabled;

    borderStroke = DEFAULT_TRANSFORMER_CONFIG.borderStroke;
    borderStrokeWidth = DEFAULT_TRANSFORMER_CONFIG.borderStrokeWidth;
    borderDash: number[] = [];
    borderSpacing = DEFAULT_TRANSFORMER_CONFIG.borderSpacing;

    anchorFill = DEFAULT_TRANSFORMER_CONFIG.anchorFill;
    anchorStroke = DEFAULT_TRANSFORMER_CONFIG.anchorStroke;
    anchorStrokeWidth = DEFAULT_TRANSFORMER_CONFIG.anchorStrokeWidth;
    anchorSize = DEFAULT_TRANSFORMER_CONFIG.anchorSize;
    anchorCornerRadius = DEFAULT_TRANSFORMER_CONFIG.anchorCornerRadius;
    anchorStyle: 'default' | 'canva' = DEFAULT_TRANSFORMER_CONFIG.anchorStyle;
    anchorSideLongSize = 16;
    anchorSideShortSize = 5;
    anchorSideCornerRadius = 2.5;
    anchorShadowColor: string | undefined;
    anchorShadowBlur = 0;
    anchorShadowOffsetX = 0;
    anchorShadowOffsetY = 0;

    keepRatio: boolean = DEFAULT_TRANSFORMER_CONFIG.keepRatio;
    centeredScaling = false;

    zeroLeft = 0;
    zeroTop = 0;
    moveBoundaryEnabled: boolean = DEFAULT_TRANSFORMER_CONFIG.moveBoundaryEnabled;

    /**
     * leftTop centerTop rightTop
     * leftMiddle rightMiddle
     * leftBottom centerBottom rightBottom
     */
    enabledAnchors: number[] = [1, 1, 1, 1, 1, 1, 1, 1];

    flipEnabled = false;

    ignoreStroke = false;

    boundBoxFunc: Nullable<(oldBox: BaseObject, newBox: BaseObject) => BaseObject>;

    useSingleNodeRotation: boolean = false;
    shouldOverdrawWholeArea: boolean = false;
    controlLayerIndex: number | undefined;

    private readonly _changeStart$ = new Subject<IChangeObserverConfig>();

    /**
     * actually pointer down on a object,
     * trigger when pick an object even object not change.
     */
    readonly changeStart$ = this._changeStart$.asObservable();

    private readonly _changing$ = new Subject<IChangeObserverConfig>();
    readonly changing$ = this._changing$.asObservable();

    private readonly _changeEnd$ = new Subject<IChangeObserverConfig & { event: IPointerEvent | IMouseEvent }>();
    readonly changeEnd$ = this._changeEnd$.asObservable();

    private readonly _clearControl$ = new Subject<boolean>();
    readonly clearControl$ = this._clearControl$.asObservable();

    private readonly _createControl$ = new Subject<Group>();
    readonly createControl$ = this._createControl$.asObservable();

    private _startOffsetX: number = -1;
    private _startOffsetY: number = -1;

    private _startStateMap = new Map<string, IAbsoluteTransform>();

    private _viewportScrollX: number = -1;
    private _viewportScrollY: number = -1;

    private _finishGesture: (() => void) | null = null;
    private _cancelFocusSubscription: Nullable<Subscription>;

    private _transformerControlMap = new Map<string, Group>();
    private _selectedObjectMap = new Map<string, BaseObject>();
    private readonly _rotationControls = new Map<string, { handle: Control; icon?: Rect; line: Line }>();
    private readonly _rotationSides = new Map<string, IRotationHandlePlacement['side']>();

    private _subscriptionObjectMap = new Map<string, Nullable<Subscription>>();
    private _copperControl: Nullable<Group>;
    private _copperSelectedObject: Nullable<BaseObject>;

    private _moveBufferSkip = false;

    private _debounceClearFunc: Nullable<() => void>;

    constructor(
        private _scene: Scene,
        config?: ITransformerConfig
    ) {
        super();
        this._initialProps(config);
        this.disposeWithMe(this._scene.prepareRender$.subscribe(() => this._updateRotationControls()));
    }

    /** Hit-test the actual displayed handles using canvas coordinates, including viewport edge avoidance. */
    isPointOnControl(objectKey: string, coord: Vector2, deviceType = DeviceType.Mouse): boolean {
        const group = this._transformerControlMap.get(objectKey);
        if (!group?.visible || !this._scene.getActiveViewportByCoord(coord)) return false;
        this._updateRotationControls();
        const hit = this._scene.pick(coord, deviceType);
        return group.getObjects().some((object) => object === hit && object instanceof Control);
    }

    updateZeroPoint(left: number, top: number) {
        this.zeroLeft = left;
        this.zeroTop = top;
    }

    changeNotification() {
        this._changing$.next({
            objects: this._selectedObjectMap,
            type: MoveObserverType.MOVE_START,
        });

        return this;
    }

    getSelectedObjectMap() {
        return this._selectedObjectMap;
    }

    /** Complete the current object transform before another gesture takes ownership of the scene. */
    finishTransform(): void {
        this._finishGesture?.();
    }

    private _bindGestureEnd(scene: Scene, initialEvent: IPointerEvent | IMouseEvent, onEnd: (event: IPointerEvent | IMouseEvent) => void): void {
        let latestEvent = initialEvent;
        const subscriptions: Subscription[] = [];
        subscriptions.push(scene.onPointerMove$.subscribeEvent((event) => {
            latestEvent = event;
        }));
        const finish = (event = latestEvent) => {
            if (this._finishGesture !== finish) {
                return;
            }
            this._finishGesture = null;
            subscriptions.forEach((subscription) => subscription.unsubscribe());
            onEnd(event);
        };
        subscriptions.push(scene.onPointerUp$.subscribeEvent((event) => finish(event)));
        subscriptions.push(scene.onPointerCancel$.subscribeEvent(() => finish()));
        this._finishGesture = finish;
    }

    resetProps(config?: ITransformerConfig) {
        this._initialProps(config);
    }

    getScene() {
        return this._scene;
    }

    clearControls(changeSelf = false) {
        this._clearControls(changeSelf);
    }

    updateControl() {
        this._updateControl();
    }

    debounceRefreshControls() {
        if (this._debounceClearFunc) {
            this._debounceClearFunc();
        }

        // To prevent multiple refreshes caused by setting values for multiple object instances at once.
        this._debounceClearFunc = requestImmediateMacroTask(() => {
            this.refreshControls();
            this._debounceClearFunc = null;
        });
    }

    clearSelectedObjects() {
        this._selectedObjectMap.clear();
        this._rotationSides.clear();
        this._cancelFocusSubscription?.unsubscribe();
        this._cancelFocusSubscription = null;
        this._clearControls(true);
    }

    refreshControls() {
        this._clearControlMap();
        this._selectedObjectMap.forEach((object) => {
            this._createControl(object);
        });
        return this;
    }

    createControlForCopper(applyObject: BaseObject) {
        this._createControl(applyObject, false);
    }

    clearCopperControl() {
        this._copperControl?.dispose();
        this._copperControl = null;
    }

    setSelectedControl(applyObject: BaseObject) {
        const realApplyObject = this._findGroupObject(applyObject);
        this._selectedObjectMap.set(realApplyObject.oKey, realApplyObject);
        this._createControl(realApplyObject);
    }

    private _getConfig(applyObject: BaseObject) {
        const config = {
            isCropper: this.isCropper,
            controlLayerIndex: this.controlLayerIndex,
            hoverEnabled: this.hoverEnabled,
            hoverEnterFunc: this.hoverEnterFunc,
            hoverLeaveFunc: this.hoverLeaveFunc,
            moveEnabled: this.moveEnabled,
            moveOnlyWhenSelected: this.moveOnlyWhenSelected,
            resizeEnabled: this.resizeEnabled,
            rotateEnabled: this.rotateEnabled,
            rotationSnaps: this.rotationSnaps,
            rotationSnapTolerance: this.rotationSnapTolerance,
            rotateAnchorOffset: this.rotateAnchorOffset,
            rotateAnchorPosition: this.rotateAnchorPosition,
            rotateLineEnabled: this.rotateLineEnabled,
            rotateSize: this.rotateSize,
            rotateCornerRadius: this.rotateCornerRadius,
            rotateFill: this.rotateFill,
            rotateStroke: this.rotateStroke,
            rotateStrokeWidth: this.rotateStrokeWidth,
            rotateIconEnabled: this.rotateIconEnabled,
            rotateIconStroke: this.rotateIconStroke,
            rotateIconStrokeWidth: this.rotateIconStrokeWidth,
            borderEnabled: this.borderEnabled,
            borderStroke: this.borderStroke,
            borderStrokeWidth: this.borderStrokeWidth,
            borderDash: this.borderDash,
            borderSpacing: this.borderSpacing,
            anchorFill: this.anchorFill,
            anchorStroke: this.anchorStroke,
            anchorStrokeWidth: this.anchorStrokeWidth,
            anchorSize: this.anchorSize,
            anchorCornerRadius: this.anchorCornerRadius,
            anchorStyle: this.anchorStyle,
            anchorSideLongSize: this.anchorSideLongSize,
            anchorSideShortSize: this.anchorSideShortSize,
            anchorSideCornerRadius: this.anchorSideCornerRadius,
            anchorShadowColor: this.anchorShadowColor,
            anchorShadowBlur: this.anchorShadowBlur,
            anchorShadowOffsetX: this.anchorShadowOffsetX,
            anchorShadowOffsetY: this.anchorShadowOffsetY,
            keepRatio: this.keepRatio,
            centeredScaling: this.centeredScaling,
            enabledAnchors: this.enabledAnchors,
            flipEnabled: this.flipEnabled,
            ignoreStroke: this.ignoreStroke,
            boundBoxFunc: this.boundBoxFunc,
            useSingleNodeRotation: this.useSingleNodeRotation,
            shouldOverdrawWholeArea: this.shouldOverdrawWholeArea,
            moveBoundaryEnabled: this.moveBoundaryEnabled,
        };
        for (const key of Object.keys(config) as Array<keyof typeof config>) {
            const value = applyObject.transformerConfig?.[key];
            if (value != null) Object.assign(config, { [key]: value });
        }
        return config;
    }

    attachTo(applyObject: BaseObject) {
        // First check if there is an old subscription to avoid duplicate subscriptions
        this.detachFrom(applyObject);

        const observer = applyObject.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            this.finishTransform();
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

            const { isCropper, moveEnabled, moveOnlyWhenSelected } = this._getConfig(applyObject);

            if (!isCropper && moveOnlyWhenSelected && !this._selectedObjectMap.has(this._findGroupObject(applyObject).oKey)) {
                return this._selectOnPointerUp(applyObject, evt);
            }

            if (!isCropper && !moveEnabled) {
                return this._updateActiveObjectList(applyObject, evt);
            }

            const scene = this._getTopScene();

            if (!scene) return;

            let transformObjects: ReadonlyMap<string, BaseObject>;
            if (isCropper) {
                transformObjects = new Map([[applyObject.oKey, applyObject]]);
            } else {
                this._updateActiveObjectList(applyObject, evt);
                transformObjects = this._getTransformObjects('moveEnabled');
                if (!transformObjects.size) {
                    return;
                }
            }
            this._addCancelObserver(scene);

            // Selection can mount DOM chrome under the pointer before pointerup.
            // Keep the complete gesture on the canvas, including a click with no move.
            scene.getEngine()?.setCapture();
            scene.disableObjectsEvent();

            const scrollTimer = ScrollTimer.create(scene);
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            if (isCropper) {
                this._copperSelectedObject = applyObject;
            }
            const objects = isCropper ? new Map([[applyObject.oKey, applyObject]]) : this._selectedObjectMap;
            this._changeStart$.next({ target: applyObject, objects, type: MoveObserverType.MOVE_START });

            this._moveBufferSkip = false;

            const scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper, transformObjects);

                !isCropper && this._clearControlMap();

                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper, transformObjects);
                });
            });

            this._bindGestureEnd(scene, evt, (event) => {
                scenePointerMoveSub?.unsubscribe();
                scene.enableObjectsEvent();
                !isCropper && this.refreshControls();
                scrollTimer.dispose();

                const { offsetX, offsetY } = event;

                this._changeEnd$.next({ objects, type: MoveObserverType.MOVE_END, offsetX, offsetY, event });
            });

            state.stopPropagation();
        });

        if (this.hoverEnabled) {
            this.hoverEnterFunc && observer.add(applyObject.onPointerEnter$.subscribeEvent(this.hoverEnterFunc));
            this.hoverLeaveFunc && observer.add(applyObject.onPointerLeave$.subscribeEvent(this.hoverLeaveFunc));
        }

        this._subscriptionObjectMap.set(applyObject.oKey, observer);

        return applyObject;
    }

    private _selectOnPointerUp(applyObject: BaseObject, evt: IPointerEvent | IMouseEvent) {
        const scene = this._getTopScene();
        if (!scene) {
            this._updateActiveObjectList(applyObject, evt);
            return;
        }

        let moved = false;
        let moveSubscription: Nullable<Subscription>;
        let upSubscription: Nullable<Subscription>;
        let cancelSubscription: Nullable<Subscription>;
        const disposeGesture = () => {
            moveSubscription?.unsubscribe();
            upSubscription?.unsubscribe();
            cancelSubscription?.unsubscribe();
        };

        moveSubscription = scene.onPointerMove$.subscribeEvent((moveEvent: IPointerEvent | IMouseEvent) => {
            moved ||= Math.hypot(moveEvent.offsetX - evt.offsetX, moveEvent.offsetY - evt.offsetY) >= Transformer._selectionTapMovementThreshold;
        });
        upSubscription = scene.onPointerUp$.subscribeEvent(() => {
            disposeGesture();
            if (!moved) {
                this._updateActiveObjectList(applyObject, evt);
            }
        });
        cancelSubscription = scene.onPointerCancel$.subscribeEvent(disposeGesture);
    }

    detachFrom(applyObject: BaseObject) {
        const subscription = this._subscriptionObjectMap.get(applyObject.oKey);
        if (subscription) {
            subscription.unsubscribe();
            this._subscriptionObjectMap.delete(applyObject.oKey);
        }

        return applyObject;
    }

    override dispose() {
        this.finishTransform();
        super.dispose();

        this._subscriptionObjectMap.forEach((subscription) => subscription?.unsubscribe());
        this._subscriptionObjectMap.clear();

        this._cancelFocusSubscription?.unsubscribe();
        this._cancelFocusSubscription = null;

        this._cancelFocusSubscription = null;

        this._transformerControlMap.forEach((control) => control.dispose());
        this._selectedObjectMap.forEach((control) => control.dispose());

        this._rotationControls.clear();
        this._rotationSides.clear();
        this._changeStart$.complete();
        this._changing$.complete();
        this._changeEnd$.complete();
    }

    private _initialProps(props?: ITransformerConfig) {
        if (!props) {
            return;
        }

        const propsKeys = Object.keys(props);
        if (propsKeys.length === 0) {
            return;
        }

        propsKeys.forEach((key) => {
            if (props[key as keyof ITransformerConfig] === undefined) {
                return true;
            }

            Object.assign(this, { [key]: props[key as keyof ITransformerConfig] });
        });
    }

    private _checkMoveBoundary(objects: BaseObject[], moveLeft: number, moveTop: number, ancestorLeft: number, ancestorTop: number, topSceneWidth: number, topSceneHeight: number) {
        let minX = -Infinity;
        let minY = -Infinity;
        let maxX = Infinity;
        let maxY = Infinity;
        for (const object of objects) {
            if (this._getConfig(object).moveBoundaryEnabled === false) continue;
            minX = Math.max(minX, this.zeroLeft - object.left - ancestorLeft);
            minY = Math.max(minY, this.zeroTop - object.top - ancestorTop);
            maxX = Math.min(maxX, topSceneWidth - object.left - object.width - ancestorLeft);
            maxY = Math.min(maxY, topSceneHeight - object.top - object.height - ancestorTop);
        }

        // Keep the leading edge reachable when the selection is larger than the scene.
        return {
            moveLeft: Math.max(minX, Math.min(moveLeft, maxX)),
            moveTop: Math.max(minY, Math.min(moveTop, maxY)),
        };
    }

    /**
     * Filters selected objects by the requested capability in their effective transformer config.
     * Objects without that capability stay selected but do not participate in the move or resize gesture.
     */
    private _getTransformObjects(capability: 'moveEnabled' | 'resizeEnabled'): Map<string, BaseObject> {
        return new Map(Array.from(this._selectedObjectMap).filter(([, object]) => this._getConfig(object)[capability]));
    }

    private _moving(
        moveOffsetX: number,
        moveOffsetY: number,
        scrollTimer: ScrollTimer,
        isCropper: boolean,
        transformObjects: ReadonlyMap<string, BaseObject>
    ) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const { ancestorScaleX, ancestorScaleY, ancestorLeft, ancestorTop } = this._scene;

        let moveLeft = this._smoothAccuracy((x - this._startOffsetX) / ancestorScaleX, isCropper);
        let moveTop = this._smoothAccuracy((y - this._startOffsetY) / ancestorScaleY, isCropper);

        if (this._moveBufferBlocker(moveOffsetX, moveOffsetY)) {
            return;
        }

        const topScene = this._getTopScene();
        if (!topScene) {
            return;
        }

        const { width: topSceneWidth, height: topSceneHeight } = topScene;

        if (!isCropper) {
            const selectedObjects = Array.from(transformObjects.values());
            const boundary = this._checkMoveBoundary(selectedObjects, moveLeft, moveTop, ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);
            moveLeft = boundary.moveLeft;
            moveTop = boundary.moveTop;

            transformObjects.forEach((moveObject) => {
                moveObject.translate(moveLeft + moveObject.left, moveTop + moveObject.top);
            });
            this._changing$.next({
                objects: this._selectedObjectMap,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
                offsetX: moveOffsetX,
                offsetY: moveOffsetY,
            });
        } else if (this._copperSelectedObject) {
            const cropper = this._copperSelectedObject;
            // move boundary check
            const boundary = this._checkMoveBoundary([cropper], moveLeft, moveTop, ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);

            moveLeft = boundary.moveLeft;
            moveTop = boundary.moveTop;

            cropper.translate(moveLeft + cropper.left, moveTop + cropper.top);
            this._changing$.next({
                objects: new Map([[cropper.oKey, cropper]]) as Map<string, BaseObject>,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
                offsetX: moveOffsetX,
                offsetY: moveOffsetY,
            });
        }

        this._startOffsetX = x;
        this._startOffsetY = y;
    }

    private _moveBufferBlocker(x: number, y: number) {
        if (!this._moveBufferSkip && Math.abs(x - this._startOffsetX) < MOVE_BUFFER_VALUE && Math.abs(y - this._startOffsetY) < MOVE_BUFFER_VALUE) {
            return true;
        }
        this._moveBufferSkip = true;
        return false;
    }

    private _anchorMoving(
        type: TransformerManagerType,
        moveOffsetX: number,
        moveOffsetY: number,
        scrollTimer: ScrollTimer,
        keepRatio: boolean,
        isCropper = false,
        applyObject: BaseObject,
        transformObjects: ReadonlyMap<string, BaseObject>
    ) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        if (this._moveBufferBlocker(moveOffsetX, moveOffsetY)) {
            return;
        }

        const isGroup = applyObject instanceof Group;

        if (!isCropper) {
            transformObjects.forEach((moveObject) => {
                this._moveFunc(moveObject, type, x, y, keepRatio, isCropper, isGroup);
            });
            this._changing$.next({
                objects: this._selectedObjectMap,
                type: MoveObserverType.MOVING,
                offsetX: moveOffsetX,
                offsetY: moveOffsetY,
            });
        } else {
            // for cropper
            this._moveFunc(applyObject, type, x, y, keepRatio, isCropper, isGroup);
            this._changing$.next({
                objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                type: MoveObserverType.MOVING,
                offsetX: moveOffsetX,
                offsetY: moveOffsetY,
            });
        }

        if (!(keepRatio && type !== TransformerManagerType.RESIZE_CT && type !== TransformerManagerType.RESIZE_CB && type !== TransformerManagerType.RESIZE_LM && type !== TransformerManagerType.RESIZE_RM && !isGroup)) {
            this._startOffsetX = x;
            this._startOffsetY = y;
        }
    }

    private _moveFunc(moveObject: BaseObject, type: TransformerManagerType, x: number, y: number, keepRatio: boolean, isCropper: boolean = false, isGroup: boolean = false) {
        const { left, top, width, height, angle } = moveObject;
        const originState = this._startStateMap.get(moveObject.oKey) || {};
        let state: ITransformState = {};

        const { moveLeft, moveTop } = this._getMovePoint(x, y, moveObject);

        if (keepRatio && type !== TransformerManagerType.RESIZE_CT && type !== TransformerManagerType.RESIZE_CB && type !== TransformerManagerType.RESIZE_LM && type !== TransformerManagerType.RESIZE_RM && !isGroup) {
            switch (type) {
                case TransformerManagerType.RESIZE_LT:
                    state = this._resizeLeftTop(moveObject, moveLeft, moveTop, originState);
                    break;
                case TransformerManagerType.RESIZE_RT:
                    state = this._resizeRightTop(moveObject, moveLeft, moveTop, originState);
                    break;
                case TransformerManagerType.RESIZE_LB:
                    state = this._resizeLeftBottom(moveObject, moveLeft, moveTop, originState);
                    break;
                case TransformerManagerType.RESIZE_RB:
                    state = this._resizeRightBottom(moveObject, moveLeft, moveTop, originState);
                    break;
            }
        } else {
            state = this._updateCloseKeepRatioState(type, left, top, width, height, moveLeft, moveTop);
        }

        moveObject.transformByState(this._applyRotationForResult(state, { left, top, width, height }, angle, isCropper));
    };

    private _getMovePoint(x: number, y: number, moveObject: BaseObject) {
        const { ancestorScaleX, ancestorScaleY } = this._scene;
        const { left, top, width, height, angle } = moveObject;

        const cx = left + width / 2;
        const cy = top + height / 2;
        const centerPoint = new Vector2(cx, cy);

        const xyPoint = new Vector2(x, y);
        xyPoint.rotateByPoint(degToRad(-angle), centerPoint);

        const startPoint = new Vector2(this._startOffsetX, this._startOffsetY);
        startPoint.rotateByPoint(degToRad(-angle), centerPoint);

        const moveLeft = (xyPoint.x - startPoint.x) / ancestorScaleX;
        const moveTop = (xyPoint.y - startPoint.y) / ancestorScaleY;

        return {
            moveLeft,
            moveTop,
        };
    }

    /**
     *
     */
    private _applyRotationForResult(newsState: ITransformState, oldState: ITransformState, angle: number, isCropper = false) {
        if (angle === 0) {
            return newsState;
        }

        const { left = 0, top = 0, width = 0, height = 0 } = newsState;
        const { left: oldLeft = 0, top: oldTop = 0, width: oldWidth = 0, height: oldHeight = 0 } = oldState;

        const oldCx = oldWidth / 2;
        const oldCy = oldHeight / 2;

        const newCx = width / 2 + left - oldLeft;
        const newCy = height / 2 + top - oldTop;

        const finalPoint = offsetRotationAxis(new Vector2(oldCx, oldCy), angle, new Vector2(left, top), new Vector2(newCx, newCy));

        return {
            width: this._smoothAccuracy(width, isCropper),
            height: this._smoothAccuracy(height, isCropper),
            left: this._smoothAccuracy(finalPoint.x, isCropper),
            top: this._smoothAccuracy(finalPoint.y, isCropper),
        };
    }

    private _updateCloseKeepRatioState(type: TransformerManagerType, left: number, top: number, width: number, height: number, moveLeft: number, moveTop: number) {
        const state: ITransformState = { left, top, width, height };

        switch (type) {
            case TransformerManagerType.RESIZE_LT:
                state.width = Math.max(MINI_WIDTH_LIMIT, width - moveLeft);
                state.height = Math.max(MINI_HEIGHT_LIMIT, height - moveTop);
                state.left = left + width - state.width;
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_CT:
                state.height = Math.max(MINI_HEIGHT_LIMIT, height - moveTop);
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_RT:
                state.width = Math.max(MINI_WIDTH_LIMIT, width + moveLeft);
                state.height = Math.max(MINI_HEIGHT_LIMIT, height - moveTop);
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_LM:
                state.width = Math.max(MINI_WIDTH_LIMIT, width - moveLeft);
                state.left = left + width - state.width;
                break;
            case TransformerManagerType.RESIZE_RM:
                state.width = Math.max(MINI_WIDTH_LIMIT, moveLeft + width);
                break;
            case TransformerManagerType.RESIZE_LB:
                state.width = Math.max(MINI_WIDTH_LIMIT, width - moveLeft);
                state.height = Math.max(MINI_HEIGHT_LIMIT, height + moveTop);
                state.left = state.width <= MINI_WIDTH_LIMIT ? left : left + moveLeft;
                break;
            case TransformerManagerType.RESIZE_CB:
                state.height = Math.max(MINI_HEIGHT_LIMIT, moveTop + height);
                break;
            case TransformerManagerType.RESIZE_RB:
                state.width = Math.max(MINI_WIDTH_LIMIT, moveLeft + width);
                state.height = Math.max(MINI_HEIGHT_LIMIT, moveTop + height);
                break;
        }

        return state;
    }

    private _getLimitedSize(newWidth: number, newHeight: number) {
        let limitWidth = MINI_WIDTH_LIMIT;
        let limitHeight = MINI_HEIGHT_LIMIT;
        if (newWidth > newHeight) {
            limitWidth = limitWidth * Math.abs(newWidth / newHeight);
        } else {
            limitHeight = limitHeight * Math.abs(newHeight / newWidth);
        }

        return {
            limitWidth,
            limitHeight,
        };
    }

    private _resizeLeftTop(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left = 0, top = 0, width = 0, height = 0 } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        let newWidth = originWidth - moveLeftFix;
        let newHeight = originHeight - moveTopFix;

        const { limitWidth, limitHeight } = this._getLimitedSize(originWidth, originHeight);
        if (newWidth < limitWidth) {
            newWidth = limitWidth;
        }
        if (newHeight < limitHeight) {
            newHeight = limitHeight;
        }

        return {
            left: left + width - newWidth,
            top: top + height - newHeight,
            width: newWidth,
            height: newHeight,
        };
    }

    private _resizeRightBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left = 0, top = 0, width = 0, height = 0 } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        let newWidth = originWidth + moveLeftFix;
        let newHeight = originHeight + moveTopFix;

        const { limitWidth, limitHeight } = this._getLimitedSize(originWidth, originHeight);
        if (newWidth < limitWidth) {
            newWidth = limitWidth;
        }
        if (newHeight < limitHeight) {
            newHeight = limitHeight;
        }

        return {
            left,
            top,
            width: newWidth,
            height: newHeight,
        };
    }

    private _resizeLeftBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left = 0, top = 0, width = 0, height = 0 } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        let newWidth = originWidth - moveLeftFix;
        let newHeight = originHeight + moveTopFix;

        const { limitWidth, limitHeight } = this._getLimitedSize(originWidth, originHeight);
        if (newWidth < limitWidth) {
            newWidth = limitWidth;
        }
        if (newHeight < limitHeight) {
            newHeight = limitHeight;
        }

        return {
            left: left + width - newWidth,
            top,
            width: newWidth,
            height: newHeight,
        };
    }

    private _resizeRightTop(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left = 0, top = 0, width = 0, height = 0 } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        let newWidth = originWidth + moveLeftFix;
        let newHeight = originHeight - moveTopFix;

        const { limitWidth, limitHeight } = this._getLimitedSize(originWidth, originHeight);
        if (newWidth < limitWidth) {
            newWidth = limitWidth;
        }
        if (newHeight < limitHeight) {
            newHeight = limitHeight;
        }

        return {
            left,
            top: top + height - newHeight,
            width: newWidth,
            height: newHeight,
        };
    }

    private _fixMoveLtRb(moveLeft: number, moveTop: number, originWidth: number, originHeight: number, aspectRatio: number) {
        let moveLeftFix = moveLeft;
        let moveTopFix = moveTop;

        if ((originWidth + moveLeftFix) / (originHeight + moveTopFix) > aspectRatio) {
            moveTopFix = moveLeftFix / aspectRatio;
        } else {
            moveLeftFix = moveTopFix * aspectRatio;
        }

        return {
            moveLeft: moveLeftFix,
            moveTop: moveTopFix,
        };
    }

    private _fixMoveLbRt(moveLeft: number, moveTop: number, originWidth: number, originHeight: number, aspectRatio: number) {
        let moveLeftFix = moveLeft;
        let moveTopFix = moveTop;

        if (Math.abs((originWidth - moveLeftFix) / (originHeight + moveTopFix)) > aspectRatio) {
            moveTopFix = -moveLeftFix / aspectRatio;
        } else {
            moveLeftFix = -moveTopFix * aspectRatio;
        }

        return {
            moveLeft: moveLeftFix,
            moveTop: moveTopFix,
        };
    }

    private _attachEventToAnchor(anchor: BaseObject, type = TransformerManagerType.RESIZE_LT, applyObject: BaseObject) {
        this.disposeWithMe(
            toDisposable(
                anchor.onPointerDown$.subscribeEvent((evt, state) => {
                    this.finishTransform();
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;
                    const topScene = this._getTopScene();
                    const { keepRatio, isCropper } = this._getConfig(applyObject);
                    const transformObjects = this._getTransformObjects('resizeEnabled');
                    if (topScene == null || (!isCropper && !transformObjects.size)) {
                        return;
                    }
                    topScene.getEngine()?.setCapture();
                    topScene.disableObjectsEvent();
                    const scrollTimer = ScrollTimer.create(topScene);
                    scrollTimer.startScroll(evtOffsetX, evtOffsetY);
                    const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
                    this._viewportScrollX = scrollX;
                    this._viewportScrollY = scrollY;
                    const { ancestorLeft, ancestorTop } = this._scene;
                    const { width: topSceneWidth, height: topSceneHeight } = topScene;

                    const cursor = this._getRotateAnchorCursor(type);
                    if (!isCropper) {
                        this._clearControlMap();
                        this._changeStart$.next({
                            objects: this._selectedObjectMap,
                            type: MoveObserverType.MOVE_START,
                        });
                        transformObjects.forEach((moveObject) => {
                            const { width, height, left, top } = moveObject.getState();
                            this._startStateMap.set(moveObject.oKey, { width, height, left, top });
                        });
                    } else {
                        // for cropper
                        this._changeStart$.next({
                            objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                            type: MoveObserverType.MOVE_START,
                        });
                        const { width, height, left, top } = applyObject.getState();
                        this._startStateMap.set(applyObject.oKey, { width, height, left, top });
                    }

                    this._moveBufferSkip = false;
                    const moveSubscription = topScene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject, transformObjects);

                        scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                            this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject, transformObjects);
                        });
                        topScene.setCursor(cursor);
                    });

                    this._bindGestureEnd(topScene, evt, (event) => {
                        moveSubscription.unsubscribe();
                        topScene.enableObjectsEvent();
                        topScene.resetCursor();
                        scrollTimer.dispose();
                        this._startStateMap.clear();
                        const { offsetX, offsetY } = event;

                        const objects = isCropper ? new Map([[applyObject.oKey, applyObject]]) : this._selectedObjectMap;
                        const transformedObjects = isCropper ? [applyObject] : Array.from(transformObjects.values());
                        this._recoverySizeBoundary(transformedObjects, ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);
                        this._changeEnd$.next({ objects, type: MoveObserverType.MOVE_END, offsetX, offsetY, event });
                        this.refreshControls();
                    });
                    state.stopPropagation();
                })
            )
        );
    }

    private _recoverySizeBoundary(selectedObjects: BaseObject[], ancestorLeft: number, ancestorTop: number, topSceneWidth: number, topSceneHeight: number) {
        for (let i = 0; i < selectedObjects.length; i++) {
            const moveObject = selectedObjects[i];
            if (this._getConfig(moveObject).moveBoundaryEnabled === false) {
                continue;
            }
            const { left, top, width, height } = moveObject;

            const newTransform: ITransformState = {};

            if (left + ancestorLeft < this.zeroLeft) {
                newTransform.left = this.zeroLeft - ancestorLeft;
                newTransform.width = width + left + ancestorLeft - this.zeroLeft;
            } else if (left + width + ancestorLeft > topSceneWidth) {
                newTransform.width = topSceneWidth - left - ancestorLeft;
            }

            if (top + ancestorTop < this.zeroTop) {
                newTransform.top = this.zeroTop - ancestorTop;
                newTransform.height = height + top + ancestorTop - this.zeroTop;
            } else if (top + height + ancestorTop > topSceneHeight) {
                newTransform.height = topSceneHeight - top - ancestorTop;
            }

            moveObject.transformByState(newTransform);
        }
    }

    private _attachEventToRotate(rotateControl: Rect, applyObject: BaseObject) {
        this.disposeWithMe(
            toDisposable(
                rotateControl.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                    this.finishTransform();
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;

                    const topScene = this._getTopScene() as Scene;

                    if (topScene == null) {
                        return;
                    }

                    topScene.getEngine()?.setCapture();
                    topScene.disableObjectsEvent();

                    const viewportActualXY = topScene.getScrollXYInfoByViewport(Vector2.create(evtOffsetX, evtOffsetY));

                    this._viewportScrollX = viewportActualXY.x;
                    this._viewportScrollY = viewportActualXY.y;

                    const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE_LINE);

                    const { ancestorLeft, ancestorTop, width, height, angle: agentOrigin } = applyObject;

                    const centerX = (width / 2) + ancestorLeft;
                    const centerY = (height / 2) + ancestorTop;
                    this._clearControlMap();

                    this._changeStart$.next({
                        objects: this._selectedObjectMap,
                        type: MoveObserverType.MOVE_START,
                    });

                    this._moveBufferSkip = false;
                    const topScenePointerMoveSub = topScene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._rotateMoving(moveOffsetX, moveOffsetY, centerX, centerY, agentOrigin);
                        topScene.setCursor(cursor);
                    });

                    this._bindGestureEnd(topScene, evt, (event) => {
                        topScenePointerMoveSub?.unsubscribe();
                        topScene.enableObjectsEvent();
                        topScene.resetCursor();
                        this.refreshControls();

                        const { offsetX, offsetY } = event;

                        this._changeEnd$.next({
                            objects: this._selectedObjectMap,
                            type: MoveObserverType.MOVE_END,
                            offsetX,
                            offsetY,
                            event,
                        });
                    });

                    state.stopPropagation();
                })
            )
        );
    }

    private _rotateMoving(moveOffsetX: number, moveOffsetY: number, centerX: number, centerY: number, agentOrigin: number) {
        const { ancestorScaleX, ancestorScaleY } = this._scene;

        if (this._moveBufferBlocker(moveOffsetX, moveOffsetY)) {
            return;
        }

        const moveSceneX = moveOffsetX / ancestorScaleX + this._viewportScrollX;
        const moveSceneY = moveOffsetY / ancestorScaleY + this._viewportScrollY;
        const startSceneX = this._startOffsetX / ancestorScaleX + this._viewportScrollX;
        const startSceneY = this._startOffsetY / ancestorScaleY + this._viewportScrollY;

        const angle1 = Math.atan2(moveSceneY - centerY, moveSceneX - centerX);
        const angle2 = Math.atan2(startSceneY - centerY, startSceneX - centerX);

        let angle = agentOrigin + radToDeg(angle1 - angle2);

        if (angle < 0) {
            angle = 360 + angle;
        }
        angle %= 360;

        angle = this._smoothAccuracy(angle);

        this._selectedObjectMap.forEach((moveObject) => {
            moveObject.transformByState({ angle });
        });

        this._changing$.next({
            objects: this._selectedObjectMap,
            angle,
            type: MoveObserverType.MOVING,
            offsetX: moveOffsetX,
            offsetY: moveOffsetY,
        });
    }

    private _getOutlinePosition(width: number, height: number, borderSpacing: number, borderStrokeWidth: number) {
        const offset = borderSpacing + borderStrokeWidth;
        const strokeOffset = borderStrokeWidth / 2;

        return {
            left: -offset - strokeOffset,
            top: -offset - strokeOffset,
            width: width + offset * 2,
            height: height + offset * 2,
        };
    }

    private _getRotateAnchorCursor(type: TransformerManagerType) {
        let cursor = CURSOR_TYPE.NORTH_WEST_RESIZE;

        switch (type) {
            case TransformerManagerType.ROTATE:
                cursor = CURSOR_TYPE.MOVE;
                break;
            case TransformerManagerType.ROTATE_LINE:
                cursor = CURSOR_TYPE.MOVE;
                break;
            case TransformerManagerType.RESIZE_LT:
                break;
            case TransformerManagerType.RESIZE_CT:
                cursor = CURSOR_TYPE.NORTH_RESIZE;
                break;
            case TransformerManagerType.RESIZE_RT:
                cursor = CURSOR_TYPE.NORTH_EAST_RESIZE;
                break;
            case TransformerManagerType.RESIZE_LM:
                cursor = CURSOR_TYPE.WEST_RESIZE;
                break;
            case TransformerManagerType.RESIZE_RM:
                cursor = CURSOR_TYPE.EAST_RESIZE;
                break;
            case TransformerManagerType.RESIZE_LB:
                cursor = CURSOR_TYPE.SOUTH_WEST_RESIZE;
                break;
            case TransformerManagerType.RESIZE_CB:
                cursor = CURSOR_TYPE.SOUTH_RESIZE;
                break;
            case TransformerManagerType.RESIZE_RB:
                cursor = CURSOR_TYPE.SOUTH_EAST_RESIZE;
                break;
        }
        return cursor;
    }

    private _createRotateIcon(applyObject: BaseObject, zIndex: number, left: number, top: number) {
        const { rotateSize, rotateIconStroke, rotateIconStrokeWidth, borderStroke } = this._getConfig(applyObject);
        const iconSize = Math.min(ROTATE_ICON_SIZE, Math.max(rotateSize - 4, 1));
        const iconOffset = (rotateSize - iconSize) / 2;

        return new TransformerRotateIcon(`${TransformerManagerType.ROTATE}_ICON_${zIndex}`, {
            zIndex,
            evented: false,
            left: left + iconOffset,
            top: top + iconOffset,
            width: iconSize,
            height: iconSize,
            fill: null,
            stroke: rotateIconStroke ?? borderStroke,
            strokeWidth: rotateIconStrokeWidth,
            strokeLineCap: 'round',
            strokeLineJoin: 'round',
        });
    }

    private _getCopperAnchorPosition(type: TransformerManagerType, height: number, width: number, applyObject: BaseObject) {
        const { borderStrokeWidth, borderSpacing, anchorSize } = this._getConfig(applyObject);

        let left = 0;
        let top = 0;

        const longEdge = anchorSize;
        const shortEdge = anchorSize / 4;

        switch (type) {
            case TransformerManagerType.RESIZE_LT:
                left += -borderSpacing - borderStrokeWidth;
                top += -borderSpacing - borderStrokeWidth;
                break;
            case TransformerManagerType.RESIZE_CT:
                left += width / 2 - longEdge / 2;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RT:
                left += width + borderSpacing - borderStrokeWidth - longEdge;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LM:
                left += -borderSpacing - borderStrokeWidth;
                top += height / 2 - longEdge / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + borderSpacing - borderStrokeWidth - shortEdge;
                top += height / 2 - longEdge / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -borderSpacing - borderStrokeWidth;
                top += height + borderSpacing - borderStrokeWidth - longEdge;

                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2 - longEdge / 2;
                top += height + borderSpacing - borderStrokeWidth - shortEdge;

                break;
            case TransformerManagerType.RESIZE_RB:
                left += width + borderSpacing - borderStrokeWidth - longEdge;
                top += height + borderSpacing - borderStrokeWidth - longEdge;

                break;
        }

        return {
            left,
            top,
        };
    }

    private _getRotateAnchorPosition(type: TransformerManagerType, height: number, width: number, applyObject: BaseObject) {
        const { rotateAnchorOffset, rotateAnchorPosition, rotateSize, borderStrokeWidth, borderSpacing, anchorSize } = this._getConfig(applyObject);
        const isBottomRotateAnchor = rotateAnchorPosition === 'bottom';

        let left = -anchorSize / 2;
        let top = -anchorSize / 2;

        switch (type) {
            case TransformerManagerType.ROTATE:
                left = width / 2 - rotateSize / 2;
                top = isBottomRotateAnchor
                    ? height + rotateAnchorOffset + borderSpacing + borderStrokeWidth * 2
                    : -rotateAnchorOffset - borderSpacing - borderStrokeWidth * 2 - rotateSize;

                break;
            case TransformerManagerType.ROTATE_LINE:
                left = width / 2;
                top = isBottomRotateAnchor
                    ? height + borderSpacing + borderStrokeWidth
                    : -rotateAnchorOffset - borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LT:
                left += -borderSpacing - borderStrokeWidth;
                top += -borderSpacing - borderStrokeWidth;
                break;
            case TransformerManagerType.RESIZE_CT:
                left += width / 2;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RT:
                left += width + borderSpacing + borderStrokeWidth;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LM:
                left += -borderSpacing - borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + borderSpacing + borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -borderSpacing - borderStrokeWidth;
                top += height + borderSpacing + borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2;
                top += height + borderSpacing + borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RB:
                left += width + borderSpacing + borderStrokeWidth;
                top += height + borderSpacing + borderStrokeWidth;

                break;
        }

        return {
            left,
            top,
        };
    }

    private _isMiddleAnchor(type: TransformerManagerType) {
        return type === TransformerManagerType.RESIZE_CT ||
            type === TransformerManagerType.RESIZE_LM ||
            type === TransformerManagerType.RESIZE_RM ||
            type === TransformerManagerType.RESIZE_CB;
    }

    private _getResizeAnchorProps(type: TransformerManagerType, applyObject: BaseObject) {
        const {
            anchorSize,
            anchorCornerRadius,
            anchorStyle,
            anchorSideLongSize,
            anchorSideShortSize,
            anchorSideCornerRadius,
        } = this._getConfig(applyObject);

        if (anchorStyle !== 'canva' || !this._isMiddleAnchor(type)) {
            return {
                width: anchorSize,
                height: anchorSize,
                radius: anchorStyle === 'canva' ? anchorSize / 2 : anchorCornerRadius,
            };
        }

        const isHorizontal = type === TransformerManagerType.RESIZE_CT || type === TransformerManagerType.RESIZE_CB;

        return {
            width: isHorizontal ? anchorSideLongSize : anchorSideShortSize,
            height: isHorizontal ? anchorSideShortSize : anchorSideLongSize,
            radius: anchorSideCornerRadius,
        };
    }

    private _createResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height = 0, width = 0 } = this._getControlState(applyObject);

        const {
            anchorFill,
            anchorStroke,
            anchorStrokeWidth,
            anchorSize,
            anchorShadowColor,
            anchorShadowBlur,
            anchorShadowOffsetX,
            anchorShadowOffsetY,
        } = this._getConfig(applyObject);

        const { left, top } = this._getRotateAnchorPosition(type, height, width, applyObject);
        const anchorProps = this._getResizeAnchorProps(type, applyObject);

        const cursor = this._getRotateAnchorCursor(type);

        const anchor = new TransformerAnchor(`${type}_${zIndex}`, {
            zIndex: zIndex - 1,
            fill: anchorFill,
            stroke: anchorStroke,
            strokeWidth: anchorStrokeWidth,
            width: anchorProps.width,
            height: anchorProps.height,
            radius: anchorProps.radius,
            left: left + (anchorSize - anchorProps.width) / 2 - anchorStrokeWidth / 2,
            top: top + (anchorSize - anchorProps.height) / 2 - anchorStrokeWidth / 2,
            shadowColor: anchorShadowColor,
            shadowBlur: anchorShadowBlur,
            shadowOffsetX: anchorShadowOffsetX,
            shadowOffsetY: anchorShadowOffsetY,
        });

        this._attachHover(anchor, cursor, CURSOR_TYPE.DEFAULT);
        // anchor.cursor = cursor;

        return anchor;
    }

    private _createCopperResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height = 0, width = 0 } = this._getControlState(applyObject);

        const { anchorFill, anchorStroke, anchorStrokeWidth, anchorSize } = this._getConfig(applyObject);

        const { left, top } = this._getCopperAnchorPosition(type, height, width, applyObject);

        const cursor = this._getRotateAnchorCursor(type);

        const oKey = `${type}_${zIndex}`;
        const config: IRegularPolygonProps = {
            zIndex: zIndex - 1,
            fill: anchorFill,
            stroke: anchorStroke,
            strokeWidth: anchorStrokeWidth,
            width: anchorSize,
            height: anchorSize,
            left,
            top,
            pointsGroup: [],
        };
        const longEdge = anchorSize;
        const shortEdge = anchorSize / 4;
        if (cursor === CURSOR_TYPE.EAST_RESIZE) {
            config.width = shortEdge;
            config.height = longEdge;
        } else if (cursor === CURSOR_TYPE.WEST_RESIZE) {
            config.width = shortEdge;
            config.height = longEdge;
        } else if (cursor === CURSOR_TYPE.NORTH_RESIZE) {
            config.width = longEdge;
            config.height = shortEdge;
        } else if (cursor === CURSOR_TYPE.SOUTH_RESIZE) {
            config.width = longEdge;
            config.height = shortEdge;
        } else if (cursor === CURSOR_TYPE.NORTH_EAST_RESIZE) {
            config.pointsGroup = this._getNorthEastPoints(longEdge, shortEdge);
        } else if (cursor === CURSOR_TYPE.NORTH_WEST_RESIZE) {
            config.pointsGroup = this._getNorthWestPoints(longEdge, shortEdge);
        } else if (cursor === CURSOR_TYPE.SOUTH_EAST_RESIZE) {
            config.pointsGroup = this._getSouthEastPoints(longEdge, shortEdge);
        } else if (cursor === CURSOR_TYPE.SOUTH_WEST_RESIZE) {
            config.pointsGroup = this._getSouthWestPoints(longEdge, shortEdge);
        }

        if (config.pointsGroup.length === 0) {
            config.pointsGroup = [[
                { x: 0, y: 0 },
                { x: config.width ?? 0, y: 0 },
                { x: config.width ?? 0, y: config.height ?? 0 },
                { x: 0, y: config.height ?? 0 },
            ]];
        }
        const anchor = new TransformerCropAnchor(oKey, config, applyObject.transformerConfig?.cropAnchorHitSize ?? 0);
        this._attachHover(anchor, cursor, CURSOR_TYPE.DEFAULT);

        return anchor;
    }

    private _getNorthEastPoints(longEdge: number, shortEdge: number): IPoint[][] {
        const minusL_S = longEdge - shortEdge;
        return [
            [
                { x: 0, y: 0 },
                { x: longEdge, y: 0 },
                { x: longEdge, y: longEdge },
                { x: minusL_S, y: longEdge },
                { x: minusL_S, y: shortEdge },
                { x: 0, y: shortEdge },
            ],
        ];
    }

    private _getNorthWestPoints(longEdge: number, shortEdge: number): IPoint[][] {
        return [
            [
                { x: 0, y: 0 },
                { x: longEdge, y: 0 },
                { x: longEdge, y: shortEdge },
                { x: shortEdge, y: shortEdge },
                { x: shortEdge, y: longEdge },
                { x: 0, y: longEdge },
            ],
        ];
    }

    private _getSouthEastPoints(longEdge: number, shortEdge: number): IPoint[][] {
        const minusL_S = longEdge - shortEdge;
        return [
            [
                { x: minusL_S, y: 0 },
                { x: longEdge, y: 0 },
                { x: longEdge, y: longEdge },
                { x: 0, y: longEdge },
                { x: 0, y: minusL_S },
                { x: minusL_S, y: minusL_S },
                { x: minusL_S, y: 0 },
            ],
        ];
    }

    private _getSouthWestPoints(longEdge: number, shortEdge: number): IPoint[][] {
        const minusL_S = longEdge - shortEdge;
        return [
            [
                { x: 0, y: 0 },
                { x: shortEdge, y: 0 },
                { x: shortEdge, y: minusL_S },
                { x: longEdge, y: minusL_S },
                { x: longEdge, y: longEdge },
                { x: 0, y: longEdge },
                { x: 0, y: 0 },
            ],
        ];
    }

    private _checkTransformerType(oKey: string) {
        if (oKey.indexOf(TransformerManagerType.OUTLINE) > -1) {
            return TransformerManagerType.OUTLINE;
        }

        if (oKey.indexOf(TransformerManagerType.ROTATE) > -1) {
            return TransformerManagerType.ROTATE;
        }
        if (oKey.indexOf(TransformerManagerType.ROTATE_LINE) > -1) {
            return TransformerManagerType.ROTATE_LINE;
        }

        if (oKey.indexOf(TransformerManagerType.RESIZE_LT) > -1) {
            return TransformerManagerType.RESIZE_LT;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_CT) > -1) {
            return TransformerManagerType.RESIZE_CT;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_RT) > -1) {
            return TransformerManagerType.RESIZE_RT;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_LM) > -1) {
            return TransformerManagerType.RESIZE_LM;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_RM) > -1) {
            return TransformerManagerType.RESIZE_RM;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_LB) > -1) {
            return TransformerManagerType.RESIZE_LB;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_CB) > -1) {
            return TransformerManagerType.RESIZE_CB;
        }
        if (oKey.indexOf(TransformerManagerType.RESIZE_RB) > -1) {
            return TransformerManagerType.RESIZE_RB;
        }
    }

    private _updateControlIterator(func: (control: BaseObject, applyObject: BaseObject) => void) {
        this._transformerControlMap.forEach((control, oKey) => {
            const applyObject = this._selectedObjectMap.get(oKey);
            if (!applyObject) {
                return true;
            }

            func(control, applyObject);
        });
    }

    private _getControlState(applyObject: BaseObject): ReturnType<BaseObject['getState']> {
        return applyObject.transformerConfig?.controlStateResolver?.(applyObject) ?? applyObject.getState();
    }

    private _updateControl() {
        this._updateControlIterator((control, applyObject) => {
            const { left, top, height, width, angle } = this._getControlState(applyObject);
            control.transformByState({
                left,
                top,
                height,
                width,
                angle,
            });
            control.show();
            control.makeDirty(true);
            this._updateRotationControl(control as Group, applyObject);
        });
    }

    private _hideControl() {
        this._transformerControlMap.forEach((control) => {
            control.hide();
            control.makeDirty(true);
        });
    }

    private _attachHover(o: BaseObject, cursorIn: CURSOR_TYPE, cursorOut: CURSOR_TYPE) {
        this.disposeWithMe(
            toDisposable(
                o.onPointerEnter$.subscribeEvent(() => {
                    o.cursor = cursorIn;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeave$.subscribeEvent(() => {
                    o.cursor = cursorOut;
                })
            )
        );
    }

    private _clearControls(changeSelf = false) {
        this._clearControlMap();

        this._clearControl$.next(changeSelf);
    }

    /**
     * @description Clear the control of the object with the specified id
     * @param {string[]} ids the id of the object to be cleared
     */
    public clearControlByIds(ids: string[]) {
        for (const id of ids) {
            this._selectedObjectMap.delete(id);
            this._rotationSides.delete(id);
        }
        this.refreshControls();
    }

    private _clearControlMap() {
        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._transformerControlMap.clear();
        this._rotationControls.clear();
    }

    private _createControl(applyObject: BaseObject, isSkipOnCropper = true) {
        const { left = 0, top = 0, height = 0, width = 0, angle = 0 } = this._getControlState(applyObject);
        const {
            isCropper,
            resizeEnabled,
            rotateEnabled,
            borderEnabled,
            borderStroke,
            borderStrokeWidth,
            borderSpacing,
            enabledAnchors,
        } = this._getConfig(applyObject);
        if (isSkipOnCropper && isCropper) {
            return;
        }
        const oKey = applyObject.oKey;
        const zIndex = this._selectedObjectMap.size + applyObject.maxZIndex + DEFAULT_CONTROL_PLUS_INDEX;
        const layerIndex = this._getConfig(applyObject).controlLayerIndex ?? (applyObject.getLayerIndex() || DEFAULT_TRANSFORMER_LAYER_INDEX);
        const groupElements: BaseObject[] = [];

        if (borderEnabled && !isCropper) {
            const outline = new Rect(`${TransformerManagerType.OUTLINE}_${zIndex}`, {
                zIndex: zIndex - 1,
                evented: false,
                strokeWidth: borderStrokeWidth,
                stroke: borderStroke,
                ...this._getOutlinePosition(width, height, borderSpacing, borderStrokeWidth),
            });
            groupElements.push(outline);
        }
        if (resizeEnabled && rotateEnabled && !isCropper) {
            groupElements.push(...this._createRotationControls(applyObject, zIndex, width, height));
        }
        if (resizeEnabled) {
            groupElements.push(...this._createResizeControls(applyObject, zIndex, isCropper, enabledAnchors));
        }

        const transformerControl = new Group(`${TransformerManagerType.GROUP}_${oKey}`, ...groupElements);
        transformerControl.zIndex = zIndex;
        transformerControl.evented = false;
        transformerControl.openSelfSizeMode();
        transformerControl.transformByState({
            left,
            top,
            angle,
            width,
            height,
        });
        const scene = this.getScene();
        scene.addObject(transformerControl, layerIndex);

        if (!isCropper) {
            this._transformerControlMap.get(oKey)?.dispose();
            this._transformerControlMap.set(oKey, transformerControl);
            this._updateRotationControl(transformerControl, applyObject);
            this._createControl$.next(transformerControl);
        } else {
            this._copperControl = transformerControl;
        }

        return transformerControl;
    }

    private _createResizeControls(applyObject: BaseObject, zIndex: number, isCropper: boolean, enabledAnchors: number[]): BaseObject[] {
        const anchors: BaseObject[] = [];
        for (let i = 0, len = enabledAnchors.length; i < len; i++) {
            const isEnable = enabledAnchors[i];
            if (isEnable !== 1) {
                continue;
            }
            const type = TransformerManagerTypeArray[i];
            let anchor: BaseObject;
            if (!isCropper) {
                anchor = this._createResizeAnchor(type, applyObject, zIndex);
            } else {
                anchor = this._createCopperResizeAnchor(type, applyObject, zIndex);
            }
            this._attachEventToAnchor(anchor, type, applyObject);
            anchors.push(anchor);
        }
        return anchors;
    }

    private _createRotationControls(applyObject: BaseObject, zIndex: number, width: number, height: number): BaseObject[] {
        const config = this._getConfig(applyObject);
        const { rotateSize, borderStrokeWidth, borderStroke } = config;
        const position = this._getRotateAnchorPosition(TransformerManagerType.ROTATE, height, width, applyObject);
        const line = new Line(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            zIndex: zIndex - 1,
            evented: false,
            strokeWidth: borderStrokeWidth,
            strokeLineCap: 'butt',
            stroke: config.rotateStroke ?? borderStroke,
        });
        const handle = new TransformerAnchor(`${TransformerManagerType.ROTATE}_${zIndex}`, {
            zIndex: zIndex - 1,
            ...position,
            width: rotateSize,
            height: rotateSize,
            radius: config.rotateCornerRadius,
            fill: config.rotateFill,
            strokeWidth: config.rotateStrokeWidth ?? borderStrokeWidth * 2,
            stroke: config.rotateStroke ?? borderStroke,
            shadowColor: config.anchorShadowColor,
            shadowBlur: config.anchorShadowBlur,
            shadowOffsetX: config.anchorShadowOffsetX,
            shadowOffsetY: config.anchorShadowOffsetY,
        });
        const icon = config.rotateIconEnabled ? this._createRotateIcon(applyObject, zIndex, position.left, position.top) : undefined;
        this._attachEventToRotate(handle, applyObject);
        this._attachHover(handle, this._getRotateAnchorCursor(TransformerManagerType.ROTATE), CURSOR_TYPE.DEFAULT);
        this._rotationControls.set(applyObject.oKey, { handle, icon, line });
        return icon ? [line, handle, icon] : [line, handle];
    }

    private _updateRotationControls(): void {
        if (this._finishGesture) return;
        const obstaclesByViewport = new Map<Viewport, IRotationHandleObstacle[]>();
        this._updateControlIterator((control, object) => this._updateRotationControl(control as Group, object, obstaclesByViewport));
    }

    private _getRotationViewport(control: Group): { viewport: Viewport; bounds: IBoundRectNoAngle; corners: Vector2[] } | undefined {
        let best: ReturnType<Transformer['_getRotationViewport']>;
        let maxArea = 0;
        const corners = [new Vector2(0, 0), new Vector2(control.width, 0), new Vector2(control.width, control.height), new Vector2(0, control.height)]
            .map((point) => control.ancestorTransform.applyPoint(point));
        for (const viewport of this._scene.getViewports()) {
            if (!viewport.shouldIntoRender()) continue;
            const bar = viewport.getScrollBar();
            const bounds = {
                left: Math.max(viewport.left, this.zeroLeft * this._scene.scaleX),
                top: Math.max(viewport.top, this.zeroTop * this._scene.scaleY),
                right: viewport.left + (viewport.width ?? 0) - (bar?.enableVertical ? bar.totalSize : 0),
                bottom: viewport.top + (viewport.height ?? 0) - (bar?.enableHorizontal ? bar.totalSize : 0),
            };
            const screenCorners = corners.map((point) => viewport.getAbsoluteVector(point.clone()));
            const left = Math.max(bounds.left, Math.min(...screenCorners.map((point) => point.x)));
            const top = Math.max(bounds.top, Math.min(...screenCorners.map((point) => point.y)));
            const right = Math.min(bounds.right, Math.max(...screenCorners.map((point) => point.x)));
            const bottom = Math.min(bounds.bottom, Math.max(...screenCorners.map((point) => point.y)));
            const area = Math.max(0, right - left) * Math.max(0, bottom - top);
            if (area > maxArea) {
                maxArea = area;
                best = { viewport, bounds, corners: screenCorners };
            }
        }
        return best;
    }

    private _getRotationObstacles(viewport: Viewport) {
        return this._scene.getAllObjectsByOrderForPick()
            .filter((object) => object instanceof Control && object.visible && object.evented && !object.oKey.includes(TransformerManagerType.ROTATE))
            .map((object) => {
                const transform = object.ancestorTransform;
                const center = viewport.getAbsoluteVector(transform.applyPoint(new Vector2(object.width / 2, object.height / 2)));
                const corner = viewport.getAbsoluteVector(transform.applyPoint(new Vector2(0, 0)));
                return { ...center, radius: Math.hypot(corner.x - center.x, corner.y - center.y) };
            });
    }

    private _updateRotationControl(control: Group, applyObject: BaseObject, obstaclesByViewport = new Map<Viewport, IRotationHandleObstacle[]>()): void {
        const controls = this._rotationControls.get(applyObject.oKey);
        if (!controls) return;
        const view = this._getRotationViewport(control);
        if (!view) {
            this._hideRotationControls(controls);
            return;
        }
        const { viewport, bounds, corners } = view;
        let obstacles = obstaclesByViewport.get(viewport);
        if (!obstacles) {
            obstacles = this._getRotationObstacles(viewport);
            obstaclesByViewport.set(viewport, obstacles);
        }
        const config = this._getConfig(applyObject);
        const transform = control.ancestorTransform;
        const toScreen = (point: Vector2) => viewport.getAbsoluteVector(transform.applyPoint(point));
        const candidate = (side: 'top' | 'bottom'): IRotationHandleCandidate => {
            const direction = side === 'top' ? -1 : 1;
            const edge = side === 'top' ? 0 : control.height;
            return {
                side,
                center: toScreen(new Vector2(control.width / 2, edge + direction * (config.rotateAnchorOffset + config.borderSpacing + config.borderStrokeWidth * 2 + config.rotateSize / 2))),
                attachment: toScreen(new Vector2(control.width / 2, edge + direction * (config.borderSpacing + config.borderStrokeWidth))),
            };
        };
        const center = toScreen(new Vector2(control.width / 2, control.height / 2));
        const scale = this._scene.getAncestorScale();
        const artworkRadius = (config.rotateSize / 2 + controls.handle.strokeWidth) * Math.max(scale.scaleX, scale.scaleY);
        const placement = placeRotationHandle({
            bounds,
            corners,
            radius: Math.max(CONTROL_TOUCH_HIT_RADIUS, artworkRadius),
            artworkRadius,
            preferred: candidate(config.rotateAnchorPosition),
            opposite: candidate(config.rotateAnchorPosition === 'top' ? 'bottom' : 'top'),
            obstacles: [...obstacles, { ...center, radius: 0 }],
            previousSide: this._rotationSides.get(applyObject.oKey),
        });
        if (!placement) {
            this._hideRotationControls(controls);
            return;
        }
        this._rotationSides.set(applyObject.oKey, placement.side);
        const toLocal = (point: IPoint) => transform.clone().invert().applyPoint(viewport.transformVector2SceneCoord(new Vector2(point.x, point.y)));
        this._positionRotationControls(controls, toLocal(placement.center), toLocal(placement.attachment), config.rotateLineEnabled || placement.adjusted);
    }

    private _hideRotationControls(controls: { handle: Control; icon?: Rect; line: Line }): void {
        for (const control of Object.values(controls)) {
            if (control?.visible) {
                control.hide();
                this._scene.makeDirty();
            }
        }
    }

    private _positionRotationControls(controls: { handle: Control; icon?: Rect; line: Line }, center: Vector2, attachment: Vector2, showLine: boolean): void {
        const { handle, icon, line } = controls;
        const left = center.x - handle.width / 2 - handle.strokeWidth / 2;
        const top = center.y - handle.height / 2 - handle.strokeWidth / 2;
        if (Math.abs(handle.left - left) > 0.01 || Math.abs(handle.top - top) > 0.01) {
            this._scene.makeDirty();
            handle.transformByState({ left, top });
            icon?.transformByState({ left: center.x - icon.width / 2 - icon.strokeWidth / 2, top: center.y - icon.height / 2 - icon.strokeWidth / 2 });
        }
        if (!handle.visible) {
            this._scene.makeDirty();
            handle.show();
        }
        if (icon && !icon.visible) icon.show();
        const distance = Math.hypot(center.x - attachment.x, center.y - attachment.y);
        const t = Math.max(0, 1 - handle.width / 2 / Math.max(distance, 1));
        const endX = attachment.x + (center.x - attachment.x) * t;
        const endY = attachment.y + (center.y - attachment.y) * t;
        if (line.startX !== attachment.x || line.startY !== attachment.y || line.endX !== endX || line.endY !== endY) {
            this._scene.makeDirty();
            line.setProps({ startX: attachment.x, startY: attachment.y, endX, endY });
        }
        if (showLine !== line.visible) this._scene.makeDirty();
        if (showLine && !line.visible) line.show();
        else if (!showLine && line.visible) line.hide();
    }

    private _getTopScene() {
        const currentScene = this.getScene();
        return currentScene.getEngine()?.activeScene as Nullable<Scene>;
    }

    activeAnObject(applyObject: BaseObject) {
        this._updateActiveObjectList(applyObject, {} as IPointerEvent);
        this._changeStart$.next({
            target: applyObject,
            objects: this._selectedObjectMap,
            type: MoveObserverType.MOVE_START,
        });
    }

    private _updateActiveObjectList(applyObject: BaseObject, evt: IPointerEvent | IMouseEvent) {
        const { isCropper } = this._getConfig(applyObject);

        const targetObject = this._findGroupObject(applyObject);

        if (this._selectedObjectMap.has(targetObject.oKey)) {
            if (!this._transformerControlMap.has(targetObject.oKey)) {
                this._createControl(targetObject);
            }
            return;
        }

        if (!evt.ctrlKey) {
            this._selectedObjectMap.clear();
            this._rotationSides.clear();
            this._clearControlMap();
        }

        if (!isCropper) {
            this._selectedObjectMap.set(targetObject.oKey, targetObject);
        }

        this._createControl(targetObject);
    }

    private _findGroupObject(applyObject: BaseObject) {
        if (!applyObject.isInGroup) {
            return applyObject;
        }

        const group = applyObject.ancestorGroup as Nullable<Group>;
        if (!group) {
            return applyObject;
        } else {
            return group;
        }
    }

    private _addCancelObserver(scene: Scene) {
        this._cancelFocusSubscription?.unsubscribe();
        this._cancelFocusSubscription = scene.onPointerDown$.subscribeEvent(() => {
            this.clearSelectedObjects();
        });
    }

    private _smoothAccuracy(num: number, isCropper = false, accuracy: number = 1) {
        if (isCropper) {
            return precisionTo(num, 3);
        }
        return precisionTo(num, accuracy);
    }
}
