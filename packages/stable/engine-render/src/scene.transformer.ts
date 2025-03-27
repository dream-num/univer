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

import type { IAbsoluteTransform, IKeyValue, Nullable } from '@univerjs/core';
import type { Subscription } from 'rxjs';

import type { BaseObject } from './base-object';
import type { IMouseEvent, IPointerEvent } from './basics/i-events';
import type { ITransformerConfig } from './basics/transformer-config';
import type { IPoint } from './basics/vector2';
import type { Scene } from './scene';
import type { IRectProps } from './shape/rect';
import type { IRegularPolygonProps } from './shape/regular-polygon';
import { Disposable, MOVE_BUFFER_VALUE, requestImmediateMacroTask, toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { ObjectType } from './base-object';
import { CURSOR_TYPE } from './basics/const';

import { offsetRotationAxis } from './basics/offset-rotation-axis';
import { getCurrentScrollXY } from './basics/scroll-xy';
import { degToRad, precisionTo, radToDeg } from './basics/tools';
import { Vector2 } from './basics/vector2';
import { Group } from './group';
import { ScrollTimer } from './scroll-timer';
import { Rect } from './shape/rect';
import { RegularPolygon } from './shape/regular-polygon';

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

const SINGLE_ACTIVE_OBJECT_TYPE_MAP = new Set<ObjectType>([
    ObjectType.CHART,
]);

/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 */
export class Transformer extends Disposable implements ITransformerConfig {
    isCropper: boolean = false;

    hoverEnabled = false;
    hoverEnterFunc: Nullable<(e: IPointerEvent | IMouseEvent) => void>;
    hoverLeaveFunc: Nullable<(e: IPointerEvent | IMouseEvent) => void>;

    resizeEnabled = true;

    rotateEnabled = true;
    rotationSnaps: number[] = [];
    rotationSnapTolerance = 5;
    rotateAnchorOffset = 50;
    rotateSize = 10;

    rotateCornerRadius = 10;
    borderEnabled = true;

    borderStroke = 'rgb(97, 97, 97)';
    borderStrokeWidth = 1;
    borderDash: number[] = [];
    borderSpacing = 0;

    anchorFill = 'rgb(255, 255, 255)';
    anchorStroke = 'rgb(185, 185, 185)';
    anchorStrokeWidth = 1;
    anchorSize = 10;
    anchorCornerRadius = 10;

    keepRatio = true;
    centeredScaling = false;

    zeroLeft = 0;
    zeroTop = 0;

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

    private readonly _changeStart$ = new Subject<IChangeObserverConfig>();

    /**
     * actually pointer down on a object,
     * trigger when pick an object even object not change.
     */
    readonly changeStart$ = this._changeStart$.asObservable();

    private readonly _changing$ = new Subject<IChangeObserverConfig>();
    readonly changing$ = this._changing$.asObservable();

    private readonly _changeEnd$ = new Subject<IChangeObserverConfig>();
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

    private _topScenePointerMoveSub: Nullable<Subscription>;
    private _topScenePointerUpSub: Nullable<Subscription>;
    private _cancelFocusSubscription: Nullable<Subscription>;

    private _transformerControlMap = new Map<string, Group>();
    private _selectedObjectMap = new Map<string, BaseObject>();

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
        applyObject = this._findGroupObject(applyObject);
        this._selectedObjectMap.set(applyObject.oKey, applyObject);
        this._createControl(applyObject);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _getConfig(applyObject: BaseObject) {
        const objectTransformerConfig = applyObject.transformerConfig;
        let {
            isCropper,
            hoverEnabled,
            hoverEnterFunc,
            hoverLeaveFunc,
            resizeEnabled,
            rotateEnabled,
            rotationSnaps,
            rotationSnapTolerance,
            rotateAnchorOffset,
            rotateSize,
            rotateCornerRadius,
            borderEnabled,
            borderStroke,
            borderStrokeWidth,
            borderDash,
            borderSpacing,
            anchorFill,
            anchorStroke,
            anchorStrokeWidth,
            anchorSize,
            anchorCornerRadius,
            keepRatio,
            centeredScaling,
            enabledAnchors,
            flipEnabled,
            ignoreStroke,
            boundBoxFunc,
            useSingleNodeRotation,
            shouldOverdrawWholeArea,
        } = this;
        if (objectTransformerConfig != null) {
            isCropper = objectTransformerConfig.isCropper ?? isCropper;
            hoverEnabled = objectTransformerConfig.hoverEnabled ?? hoverEnabled;
            hoverEnterFunc = objectTransformerConfig.hoverEnterFunc ?? hoverEnterFunc;
            hoverLeaveFunc = objectTransformerConfig.hoverLeaveFunc ?? hoverLeaveFunc;
            resizeEnabled = objectTransformerConfig.resizeEnabled ?? resizeEnabled;
            rotateEnabled = objectTransformerConfig.rotateEnabled ?? rotateEnabled;
            rotationSnaps = objectTransformerConfig.rotationSnaps ?? rotationSnaps;
            rotationSnapTolerance = objectTransformerConfig.rotationSnapTolerance ?? rotationSnapTolerance;
            rotateAnchorOffset = objectTransformerConfig.rotateAnchorOffset ?? rotateAnchorOffset;
            rotateSize = objectTransformerConfig.rotateSize ?? rotateSize;
            rotateCornerRadius = objectTransformerConfig.rotateCornerRadius ?? rotateCornerRadius;
            borderEnabled = objectTransformerConfig.borderEnabled ?? borderEnabled;
            borderStroke = objectTransformerConfig.borderStroke ?? borderStroke;
            borderStrokeWidth = objectTransformerConfig.borderStrokeWidth ?? borderStrokeWidth;
            borderDash = objectTransformerConfig.borderDash ?? borderDash;
            borderSpacing = objectTransformerConfig.borderSpacing ?? borderSpacing;
            anchorFill = objectTransformerConfig.anchorFill ?? anchorFill;
            anchorStroke = objectTransformerConfig.anchorStroke ?? anchorStroke;
            anchorStrokeWidth = objectTransformerConfig.anchorStrokeWidth ?? anchorStrokeWidth;
            anchorSize = objectTransformerConfig.anchorSize ?? anchorSize;
            anchorCornerRadius = objectTransformerConfig.anchorCornerRadius ?? anchorCornerRadius;
            keepRatio = objectTransformerConfig.keepRatio ?? keepRatio;
            centeredScaling = objectTransformerConfig.centeredScaling ?? centeredScaling;
            enabledAnchors = objectTransformerConfig.enabledAnchors ?? enabledAnchors;
            flipEnabled = objectTransformerConfig.flipEnabled ?? flipEnabled;
            ignoreStroke = objectTransformerConfig.ignoreStroke ?? ignoreStroke;
            boundBoxFunc = objectTransformerConfig.boundBoxFunc ?? boundBoxFunc;
            useSingleNodeRotation = objectTransformerConfig.useSingleNodeRotation ?? useSingleNodeRotation;
            shouldOverdrawWholeArea = objectTransformerConfig.shouldOverdrawWholeArea ?? shouldOverdrawWholeArea;
        }

        return {
            isCropper,
            hoverEnabled,
            hoverEnterFunc,
            hoverLeaveFunc,
            resizeEnabled,
            rotateEnabled,
            rotationSnaps,
            rotationSnapTolerance,
            rotateAnchorOffset,
            rotateSize,
            rotateCornerRadius,
            borderEnabled,
            borderStroke,
            borderStrokeWidth,
            borderDash,
            borderSpacing,
            anchorFill,
            anchorStroke,
            anchorStrokeWidth,
            anchorSize,
            anchorCornerRadius,
            keepRatio,
            centeredScaling,
            enabledAnchors,
            flipEnabled,
            ignoreStroke,
            boundBoxFunc,
            useSingleNodeRotation,
            shouldOverdrawWholeArea,
        };
    }

    // eslint-disable-next-line max-lines-per-function
    attachTo(applyObject: BaseObject) {
        if (this.hoverEnabled) {
            this.hoverEnterFunc && applyObject.onPointerEnter$.subscribeEvent(this.hoverEnterFunc);
            this.hoverLeaveFunc && applyObject.onPointerLeave$.subscribeEvent(this.hoverLeaveFunc);
        }

        // eslint-disable-next-line max-lines-per-function
        const observer = applyObject.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

            const { isCropper } = this._getConfig(applyObject);

            const scene = this._getTopScene();

            if (!scene) {
                return;
            }

            this._addCancelObserver(scene);

            scene.disableObjectsEvent();

            const scrollTimer = ScrollTimer.create(scene);
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            if (!isCropper) {
                this._updateActiveObjectList(applyObject, evt);
                this._changeStart$.next({
                    target: applyObject,
                    objects: this._selectedObjectMap,
                    type: MoveObserverType.MOVE_START,
                });
            } else {
                this._copperSelectedObject = applyObject;
                this._changeStart$.next({
                    target: applyObject,
                    objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                    type: MoveObserverType.MOVE_START,
                });
            }

            this._moveBufferSkip = false;

            const scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper);

                !isCropper && this._clearControlMap();

                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper);
                });
            });

            const scenePointerUpSub = scene.onPointerUp$.subscribeEvent((event) => {
                scenePointerMoveSub?.unsubscribe();
                scenePointerUpSub?.unsubscribe();
                scene.enableObjectsEvent();
                !isCropper && this.refreshControls();
                scrollTimer.dispose();

                const { offsetX, offsetY } = event;

                if (!isCropper) {
                    this._changeEnd$.next({
                        objects: this._selectedObjectMap,
                        type: MoveObserverType.MOVE_END,
                        offsetX,
                        offsetY,
                    });
                } else {
                    this._changeEnd$.next({
                        objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                        type: MoveObserverType.MOVE_END,
                        offsetX,
                        offsetY,
                    });
                }
            });

            state.stopPropagation();
        });

        this.disposeWithMe(toDisposable(observer));

        this._subscriptionObjectMap.set(applyObject.oKey, observer);

        return applyObject;
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
        super.dispose();

        this._topScenePointerMoveSub?.unsubscribe();
        this._topScenePointerUpSub?.unsubscribe();

        this._cancelFocusSubscription?.unsubscribe();
        this._cancelFocusSubscription = null;

        this._topScenePointerMoveSub = null;
        this._topScenePointerUpSub = null;
        this._cancelFocusSubscription = null;

        this._transformerControlMap.forEach((control) => control.dispose());
        this._selectedObjectMap.forEach((control) => control.dispose());

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

            (this as IKeyValue)[key] = props[key as keyof ITransformerConfig];
        });
    }

    private _checkMoveBoundary(moveObject: BaseObject, moveLeft: number, moveTop: number, ancestorLeft: number, ancestorTop: number, topSceneWidth: number, topSceneHeight: number) {
        const { left, top, width, height } = moveObject;

        if (moveLeft + left + ancestorLeft < this.zeroLeft) {
            moveLeft = -ancestorLeft;
        }

        if (moveTop + top + ancestorTop < this.zeroTop) {
            moveTop = -ancestorTop;
        }

        if (moveLeft + left + width + ancestorLeft > topSceneWidth + this.zeroLeft) {
            moveLeft = this.zeroLeft + topSceneWidth - width - left - ancestorLeft;
        }

        if (moveTop + top + height + ancestorTop > topSceneHeight + this.zeroTop) {
            moveTop = this.zeroTop + topSceneHeight - height - top - ancestorTop;
        }

        return {
            moveLeft,
            moveTop,
        };
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer, isCropper = false) {
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
            const selectedObjects = Array.from(this._selectedObjectMap.values());
            // move boundary check
            for (let i = 0; i < selectedObjects.length; i++) {
                const moveObject = selectedObjects[i];

                const boundary = this._checkMoveBoundary(
                    moveObject,
                    moveLeft,
                    moveTop,
                    ancestorLeft,
                    ancestorTop,
                    topSceneWidth,
                    topSceneHeight
                );

                moveLeft = boundary.moveLeft;
                moveTop = boundary.moveTop;
            }

            this._selectedObjectMap.forEach((moveObject) => {
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
            const boundary = this._checkMoveBoundary(cropper, moveLeft, moveTop, ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);

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
        applyObject: BaseObject
    ) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        if (this._moveBufferBlocker(moveOffsetX, moveOffsetY)) {
            return;
        }

        const isGroup = applyObject instanceof Group;

        if (!isCropper) {
            this._selectedObjectMap.forEach((moveObject) => {
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

    // eslint-disable-next-line complexity
    private _updateCloseKeepRatioState(type: TransformerManagerType, left: number, top: number, width: number, height: number, moveLeft: number, moveTop: number) {
        const state: ITransformState = { left, top, width, height };

        switch (type) {
            case TransformerManagerType.RESIZE_LT:
                state.width = width - moveLeft < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : width - moveLeft;
                state.height = height - moveTop < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : height - moveTop;
                state.left = left + width - state.width;
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_CT:
                state.height = height - moveTop < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : height - moveTop;
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_RT:
                state.width = width + moveLeft < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : width + moveLeft;
                state.height = height - moveTop < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : height - moveTop;
                state.top = top + height - state.height;
                break;
            case TransformerManagerType.RESIZE_LM:
                state.width = width - moveLeft < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : width - moveLeft;
                state.left = left + width - state.width;
                break;
            case TransformerManagerType.RESIZE_RM:
                state.width = moveLeft + width < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : moveLeft + width;
                break;
            case TransformerManagerType.RESIZE_LB:
                state.width = width - moveLeft < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : width - moveLeft;
                state.height = height + moveTop < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : height + moveTop;
                state.left = state.width <= MINI_WIDTH_LIMIT ? left : left + moveLeft;
                break;
            case TransformerManagerType.RESIZE_CB:
                state.height = moveTop + height < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : moveTop + height;
                break;
            case TransformerManagerType.RESIZE_RB:
                state.width = moveLeft + width < MINI_WIDTH_LIMIT ? MINI_WIDTH_LIMIT : moveLeft + width;
                state.height = moveTop + height < MINI_HEIGHT_LIMIT ? MINI_HEIGHT_LIMIT : moveTop + height;
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
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
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
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
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
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
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
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
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

    // eslint-disable-next-line max-lines-per-function
    private _attachEventToAnchor(anchor: BaseObject, type = TransformerManagerType.RESIZE_LT, applyObject: BaseObject) {
        this.disposeWithMe(
            toDisposable(
                // eslint-disable-next-line max-lines-per-function
                anchor.onPointerDown$.subscribeEvent((evt, state) => {
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;
                    const topScene = this._getTopScene();
                    const { keepRatio, isCropper } = this._getConfig(applyObject);
                    if (topScene == null) {
                        return;
                    }
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
                        this._selectedObjectMap.forEach((moveObject) => {
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
                    this._topScenePointerMoveSub = topScene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject);

                        scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                            this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject);
                        });
                        topScene.setCursor(cursor);
                    });

                    this._topScenePointerUpSub = topScene.onPointerUp$.subscribeEvent((event) => {
                        // topScene.onPointerMove$.remove(this._moveObserver);
                        // topScene.onPointerUp$.remove(this._topScenePointerUpSub);
                        this._topScenePointerMoveSub?.unsubscribe();
                        this._topScenePointerUpSub?.unsubscribe();
                        topScene.enableObjectsEvent();
                        topScene.resetCursor();
                        scrollTimer.dispose();
                        this._startStateMap.clear();
                        const { offsetX, offsetY } = event;

                        if (!isCropper) {
                            this._recoverySizeBoundary(Array.from(this._selectedObjectMap.values()), ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);
                            this._changeEnd$.next({
                                objects: this._selectedObjectMap,
                                type: MoveObserverType.MOVE_END,
                                offsetX,
                                offsetY,
                            });
                        } else {
                            this._recoverySizeBoundary([applyObject], ancestorLeft, ancestorTop, topSceneWidth, topSceneHeight);
                            this._changeEnd$.next({
                                objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                                type: MoveObserverType.MOVE_END,
                                offsetX,
                                offsetY,
                            });
                        }
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
            const { left, top, width, height } = moveObject;

            const newTransform: ITransformState = {};

            if (left + ancestorLeft < this.zeroLeft) {
                newTransform.left = this.zeroLeft - ancestorLeft;
                newTransform.width = width + left;
            } else if (left + width + ancestorLeft > topSceneWidth + this.zeroLeft) {
                newTransform.width = this.zeroLeft + topSceneWidth - left - ancestorLeft;
            }

            if (top + ancestorTop < this.zeroTop) {
                newTransform.top = this.zeroTop - ancestorTop;
                newTransform.height = height + top;
            } else if (top + height + ancestorTop > topSceneHeight + this.zeroTop) {
                newTransform.height = this.zeroTop + topSceneHeight - top - ancestorTop;
            }

            moveObject.transformByState(newTransform);
        }
    }

    private _attachEventToRotate(rotateControl: Rect, applyObject: BaseObject) {
        this.disposeWithMe(
            toDisposable(
                rotateControl.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent, state) => {
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;

                    const topScene = this._getTopScene() as Scene;

                    if (topScene == null) {
                        return;
                    }

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

                    const topScenePointerUpSub = topScene.onPointerUp$.subscribeEvent((event) => {
                        // topScenePointerMoveSub?.dispose();
                        // topScenePointerUpSub?.dispose();
                        topScenePointerMoveSub?.unsubscribe();
                        topScenePointerUpSub?.unsubscribe();
                        topScene.enableObjectsEvent();
                        topScene.resetCursor();
                        this.refreshControls();

                        const { offsetX, offsetY } = event;

                        this._changeEnd$.next({
                            objects: this._selectedObjectMap,
                            type: MoveObserverType.MOVE_END,
                            offsetX,
                            offsetY,
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

        const angle1 = Math.atan2(
            (moveOffsetY - centerY) / ancestorScaleY + this._viewportScrollY,
            (moveOffsetX - centerX) / ancestorScaleX + this._viewportScrollX
        );

        const angle2 = Math.atan2(
            (this._startOffsetY - centerY) / ancestorScaleY + this._viewportScrollY,
            (this._startOffsetX - centerX) / ancestorScaleX + this._viewportScrollX
        );

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
        return {
            left: borderSpacing - borderStrokeWidth,
            top: -borderSpacing - this.borderStrokeWidth,
            width: width + borderSpacing * 2,
            height: height + borderSpacing * 2,
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
                left += borderSpacing - borderStrokeWidth;
                top += height / 2 - longEdge / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + borderSpacing - borderStrokeWidth - shortEdge;
                top += height / 2 - longEdge / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -this.borderSpacing - borderStrokeWidth;
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
        const { rotateAnchorOffset, rotateSize, borderStrokeWidth, borderSpacing, anchorSize } = this._getConfig(applyObject);

        let left = -anchorSize / 2;
        let top = -anchorSize / 2;

        switch (type) {
            case TransformerManagerType.ROTATE:
                left = width / 2 - rotateSize / 2;
                top = -rotateAnchorOffset - borderSpacing - borderStrokeWidth * 2 - rotateSize;

                break;
            case TransformerManagerType.ROTATE_LINE:
                left = width / 2;
                top = -rotateAnchorOffset - borderSpacing - borderStrokeWidth;

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
                left += width + borderSpacing - borderStrokeWidth;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LM:
                left += borderSpacing - borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + borderSpacing - borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -this.borderSpacing - borderStrokeWidth;
                top += height + borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2;
                top += height + borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RB:
                left += width + borderSpacing - borderStrokeWidth;
                top += height + borderSpacing - borderStrokeWidth;

                break;
        }

        return {
            left,
            top,
        };
    }

    private _createResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height = 0, width = 0, scaleX = 1, scaleY = 1 } = applyObject.getState();

        const { anchorFill, anchorStroke, anchorStrokeWidth, anchorCornerRadius, anchorSize } = this._getConfig(applyObject);

        const { left, top } = this._getRotateAnchorPosition(type, height, width, applyObject);

        const cursor = this._getRotateAnchorCursor(type);

        const anchor = new Rect(`${type}_${zIndex}`, {
            zIndex: zIndex - 1,
            fill: anchorFill,
            stroke: anchorStroke,
            strokeWidth: anchorStrokeWidth,
            width: anchorSize,
            height: anchorSize,
            radius: anchorCornerRadius,
            left,
            top,
        });

        this._attachHover(anchor, cursor, CURSOR_TYPE.DEFAULT);
        // anchor.cursor = cursor;

        return anchor;
    }

    private _createCopperResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height = 0, width = 0, scaleX = 1, scaleY = 1 } = applyObject.getState();

        const { anchorFill, anchorStroke, anchorStrokeWidth, anchorSize } = this._getConfig(applyObject);

        const { left, top } = this._getCopperAnchorPosition(type, height, width, applyObject);

        const cursor = this._getRotateAnchorCursor(type);

        let anchor: BaseObject;
        const oKey = `${type}_${zIndex}`;
        const config: IRectProps | IRegularPolygonProps = {
            zIndex: zIndex - 1,
            fill: anchorFill,
            stroke: anchorStroke,
            strokeWidth: anchorStrokeWidth,
            width: anchorSize,
            height: anchorSize,
            left,
            top,
        };
        const longEdge = anchorSize;
        const shortEdge = anchorSize / 4;
        if (cursor === CURSOR_TYPE.EAST_RESIZE) {
            config.width = shortEdge;
            config.height = longEdge;
            anchor = new Rect(oKey, config);
        } else if (cursor === CURSOR_TYPE.WEST_RESIZE) {
            config.width = shortEdge;
            config.height = longEdge;
            anchor = new Rect(oKey, config);
        } else if (cursor === CURSOR_TYPE.NORTH_RESIZE) {
            config.width = longEdge;
            config.height = shortEdge;
            anchor = new Rect(oKey, config);
        } else if (cursor === CURSOR_TYPE.SOUTH_RESIZE) {
            config.width = longEdge;
            config.height = shortEdge;
            anchor = new Rect(oKey, config);
        } else if (cursor === CURSOR_TYPE.NORTH_EAST_RESIZE) {
            (config as IRegularPolygonProps).pointsGroup = this._getNorthEastPoints(longEdge, shortEdge);
            anchor = new RegularPolygon(oKey, config as IRegularPolygonProps);
        } else if (cursor === CURSOR_TYPE.NORTH_WEST_RESIZE) {
            (config as IRegularPolygonProps).pointsGroup = this._getNorthWestPoints(longEdge, shortEdge);
            anchor = new RegularPolygon(oKey, config as IRegularPolygonProps);
        } else if (cursor === CURSOR_TYPE.SOUTH_EAST_RESIZE) {
            (config as IRegularPolygonProps).pointsGroup = this._getSouthEastPoints(longEdge, shortEdge);
            anchor = new RegularPolygon(oKey, config as IRegularPolygonProps);
        } else if (cursor === CURSOR_TYPE.SOUTH_WEST_RESIZE) {
            (config as IRegularPolygonProps).pointsGroup = this._getSouthWestPoints(longEdge, shortEdge);
            anchor = new RegularPolygon(oKey, config as IRegularPolygonProps);
        }

        this._attachHover(anchor!, cursor, CURSOR_TYPE.DEFAULT);

        return anchor!;
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

    private _updateControl() {
        this._updateControlIterator((control, applyObject) => {
            const { left, top, height, width, angle } = applyObject.getState();
            control.transformByState({
                left,
                top,
                height,
                width,
                angle,
            });
            control.show();
            control.makeDirty(true);
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
        }
        this.refreshControls();
    }

    private _clearControlMap() {
        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._transformerControlMap.clear();
    }

    private _createControl(applyObject: BaseObject, isSkipOnCropper = true) {
        const { left = 0, top = 0, height = 0, width = 0 } = applyObject.getState();
        const angle = applyObject.angle;
        const { isCropper, resizeEnabled, rotateEnabled, rotateAnchorOffset, rotateSize, rotateCornerRadius, borderEnabled, borderStroke, borderStrokeWidth, borderSpacing, enabledAnchors } = this._getConfig(applyObject);
        if (isSkipOnCropper && isCropper) {
            return;
        }
        const oKey = applyObject.oKey;
        const zIndex = this._selectedObjectMap.size + applyObject.maxZIndex + DEFAULT_CONTROL_PLUS_INDEX;
        const layerIndex = applyObject.getLayerIndex() || DEFAULT_TRANSFORMER_LAYER_INDEX;
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
        if (resizeEnabled && !isCropper) {
            const { left: lineLeft, top: lineTop } = this._getRotateAnchorPosition(
                TransformerManagerType.ROTATE_LINE,
                height,
                width,
                applyObject
            );
            if (rotateEnabled) {
                const rotateLine = new Rect(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
                    zIndex: zIndex - 1,
                    evented: false,
                    left: lineLeft,
                    top: lineTop,
                    height: rotateAnchorOffset,
                    width: 1,
                    strokeWidth: borderStrokeWidth,
                    stroke: borderStroke,
                });

                const { left, top } = this._getRotateAnchorPosition(TransformerManagerType.ROTATE, height, width, applyObject);

                const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE);
                const rotate = new Rect(`${TransformerManagerType.ROTATE}_${zIndex}`, {
                    zIndex: zIndex - 1,
                    left,
                    top,
                    height: rotateSize,
                    width: rotateSize,
                    radius: rotateCornerRadius,
                    strokeWidth: borderStrokeWidth * 2,
                    stroke: borderStroke,
                });
                this._attachEventToRotate(rotate, applyObject);
                this._attachHover(rotate, cursor, CURSOR_TYPE.DEFAULT);
                groupElements.push(rotateLine, rotate);
            }
        }
        if (resizeEnabled) {
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
                groupElements.push(anchor);
            }
        }

        const transformerControl = new Group(`${TransformerManagerType.GROUP}_${oKey}`, ...groupElements);
        transformerControl.zIndex = zIndex;
        transformerControl.evented = false;
        transformerControl.openSelfSizeMode();
        transformerControl.transformByState({ left, top, angle, width, height });
        const scene = this.getScene();
        scene.addObject(transformerControl, layerIndex);

        if (!isCropper) {
            if (this._transformerControlMap.has(oKey)) {
                this._transformerControlMap.get(oKey)!.dispose();
            }
            this._transformerControlMap.set(oKey, transformerControl);
            this._createControl$.next(transformerControl);
        } else {
            this._copperControl = transformerControl;
        }

        return transformerControl;
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

        applyObject = this._findGroupObject(applyObject);

        if (this._selectedObjectMap.has(applyObject.oKey)) {
            return;
        }

        if (!evt.ctrlKey || SINGLE_ACTIVE_OBJECT_TYPE_MAP.has(applyObject.objectType)) {
            this._selectedObjectMap.clear();
            this._clearControlMap();
        }

        if (!isCropper) {
            this._selectedObjectMap.set(applyObject.oKey, applyObject);
        }

        this._createControl(applyObject);
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
