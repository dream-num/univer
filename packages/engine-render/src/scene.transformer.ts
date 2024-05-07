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

import type { IAbsoluteTransform, IKeyValue, Nullable, Observer } from '@univerjs/core';
import { Disposable, Observable, toDisposable } from '@univerjs/core';

import type { BaseObject } from './base-object';
import { CURSOR_TYPE } from './basics/const';
import type { IMouseEvent, IPointerEvent } from './basics/i-events';
import { getCurrentScrollXY } from './basics/scroll-xy';
import { Group } from './group';
import { ScrollTimer } from './scroll-timer';
import type { IRectProps } from './shape/rect';
import { Rect } from './shape/rect';

import { radToDeg } from './basics/tools';
import type { Scene } from './scene';
import type { IPoint } from './basics/vector2';
import { Vector2 } from './basics/vector2';
import type { ITransformerConfig } from './basics/transformer-config';
import { type IRegularPolygonProps, RegularPolygon } from './shape/regular-polygon';

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

interface IChangeObserverConfig {
    objects: Map<string, BaseObject>;
    moveX?: number;
    moveY?: number;
    angle?: number;
    type: MoveObserverType;
}

const DEFAULT_TRANSFORMER_LAYER_INDEX = 2;

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

    anchorFill = 'rgb(255,255,255)';
    anchorStroke = 'rgb(185,185,185)';
    anchorStrokeWidth = 1;
    anchorSize = 10;
    anchorCornerRadius = 10;

    keepRatio = true;
    centeredScaling = false;

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

    onChangeStartObservable = new Observable<IChangeObserverConfig>();
    onChangingObservable = new Observable<IChangeObserverConfig>();
    onChangeEndObservable = new Observable<IChangeObserverConfig>();

    onClearControlObservable = new Observable<boolean>();
    onCreateControlObservable = new Observable<Group>();

    private _startOffsetX: number = -1;
    private _startOffsetY: number = -1;

    private _startStateMap = new Map<string, IAbsoluteTransform>();

    private _viewportScrollX: number = -1;
    private _viewportScrollY: number = -1;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;
    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;
    private _cancelFocusObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _transformerControlMap = new Map<string, Group>();
    private _selectedObjectMap = new Map<string, BaseObject>();
    private _observerObjectMap = new Map<string, Nullable<Observer<IPointerEvent | IMouseEvent>>>();
    private _copperControl: Nullable<Group>;
    private _copperSelectedObject: Nullable<BaseObject>;

    constructor(
        private _scene: Scene,
        config?: ITransformerConfig
    ) {
        super();
        this._initialProps(config);
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


    clearSelectedObjects() {
        this._selectedObjectMap.clear();
        this._cancelFocusObserver?.dispose();
        this._clearControls(true);
    }

    refreshControls() {
        this._selectedObjectMap.forEach((object) => {
            this._createControl(object);
        });
    }

    createControlForCopper(applyObject: BaseObject) {
        this._createControl(applyObject, false);
    }

    clearCopperControl() {
        this._copperControl?.dispose();
        this._copperControl = null;
    }

    // eslint-disable-next-line complexity
    private _getConfig(applyObject: BaseObject) {
        const objectTransformerConfig = applyObject.transformerConfig;
        let {
            isCropper, hoverEnabled, hoverEnterFunc, hoverLeaveFunc, resizeEnabled,
            rotateEnabled, rotationSnaps, rotationSnapTolerance, rotateAnchorOffset, rotateSize, rotateCornerRadius,
            borderEnabled, borderStroke, borderStrokeWidth, borderDash, borderSpacing,
            anchorFill, anchorStroke, anchorStrokeWidth, anchorSize, anchorCornerRadius,
            keepRatio, centeredScaling, enabledAnchors, flipEnabled, ignoreStroke,
            boundBoxFunc, useSingleNodeRotation, shouldOverdrawWholeArea,
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
            isCropper, hoverEnabled, hoverEnterFunc, hoverLeaveFunc, resizeEnabled,
            rotateEnabled, rotationSnaps, rotationSnapTolerance, rotateAnchorOffset, rotateSize, rotateCornerRadius,
            borderEnabled, borderStroke, borderStrokeWidth, borderDash, borderSpacing,
            anchorFill, anchorStroke, anchorStrokeWidth, anchorSize, anchorCornerRadius,
            keepRatio, centeredScaling, enabledAnchors, flipEnabled, ignoreStroke,
            boundBoxFunc, useSingleNodeRotation, shouldOverdrawWholeArea,
        };
    }

    // eslint-disable-next-line max-lines-per-function
    attachTo(applyObject: BaseObject) {
        if (this.hoverEnabled) {
            this.hoverEnterFunc && applyObject.onPointerEnterObserver.add(this.hoverEnterFunc);
            this.hoverLeaveFunc && applyObject.onPointerLeaveObserver.add(this.hoverLeaveFunc);
        }

        const observer = applyObject.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

            const { isCropper } = this._getConfig(applyObject);

            const scene = this._getTopScene();

            if (!scene) {
                return;
            }

            this._addCancelObserver(scene);

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(scene);
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            if (!isCropper) {
                this._updateActiveObjectList(applyObject, evt);
            } else {
                this._copperSelectedObject = applyObject;
            }

            if (!isCropper) {
                this.onChangeStartObservable.notifyObservers({
                    objects: this._selectedObjectMap,
                    type: MoveObserverType.MOVE_START,
                });
            } else {
                this.onChangeStartObservable.notifyObservers({
                    objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                    type: MoveObserverType.MOVE_START,
                });
            }


            const moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper);

                !isCropper && this._clearControls();

                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer, isCropper);
                });
            });

            const upObserver = scene.onPointerUpObserver.add(() => {
                moveObserver?.dispose();
                upObserver?.dispose();
                scene.enableEvent();
                !isCropper && this.refreshControls();
                scrollTimer.dispose();

                if (!isCropper) {
                    this.onChangeEndObservable.notifyObservers({
                        objects: this._selectedObjectMap,
                        type: MoveObserverType.MOVE_END,
                    });
                } else {
                    this.onChangeEndObservable.notifyObservers({
                        objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                        type: MoveObserverType.MOVE_END,
                    });
                }
            });

            state.stopPropagation();
        });

        this.disposeWithMe(toDisposable(observer));

        this._observerObjectMap.set(applyObject.oKey, observer);

        return applyObject;
    }

    detachFrom(applyObject: BaseObject) {
        const observer = this._observerObjectMap.get(applyObject.oKey);

        if (observer) {
            observer.dispose();
            this._observerObjectMap.delete(applyObject.oKey);
        }

        return applyObject;
    }

    override dispose() {
        this._moveObserver?.dispose();
        this._upObserver?.dispose();

        this._cancelFocusObserver?.dispose();

        this._moveObserver = null;
        this._upObserver = null;
        this._cancelFocusObserver = null;

        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._selectedObjectMap.forEach((control) => {
            control.dispose();
        });
        this.onChangeStartObservable.clear();
        this.onChangingObservable.clear();
        this.onChangeEndObservable.clear();
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

        const { ancestorScaleX, ancestorScaleY } = this._scene;

        const moveLeft = (x - this._startOffsetX) / ancestorScaleX;
        const moveTop = (y - this._startOffsetY) / ancestorScaleY;

        const moveFunc = (moveObject: BaseObject) => {
            const { left, top, width, height } = moveObject;
            const originState = this._startStateMap.get(moveObject.oKey) || {};
            let state: ITransformState = {};

            if (keepRatio
                && type !== TransformerManagerType.RESIZE_CT
                && type !== TransformerManagerType.RESIZE_CB
                && type !== TransformerManagerType.RESIZE_LM
                && type !== TransformerManagerType.RESIZE_RM
            ) {
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


                this._startOffsetX = x;
                this._startOffsetY = y;
            }
            moveObject.transformByState(state);
        };

        if (!isCropper) {
            this._selectedObjectMap.forEach((moveObject) => {
                moveFunc(moveObject);
            });
            this.onChangingObservable.notifyObservers({
                objects: this._selectedObjectMap,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
            });
        } else {
            // for cropper
            moveFunc(applyObject);
            this.onChangingObservable.notifyObservers({
                objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
            });
        }
    }

    private _updateCloseKeepRatioState(type: TransformerManagerType, left: number, top: number, width: number, height: number, moveLeft: number, moveTop: number) {
        const state: ITransformState = {};

        switch (type) {
            case TransformerManagerType.RESIZE_LT:
                state.left = left + moveLeft;
                state.top = top + moveTop;
                state.width = width - moveLeft;
                state.height = height - moveTop;
                break;
            case TransformerManagerType.RESIZE_CT:
                state.top = top + moveTop;
                state.height = height - moveTop;
                break;
            case TransformerManagerType.RESIZE_RT:
                state.top = top + moveTop;
                state.width = width + moveLeft;
                state.height = height - moveTop;
                break;
            case TransformerManagerType.RESIZE_LM:
                state.left = left + moveLeft;
                state.width = width - moveLeft;
                break;
            case TransformerManagerType.RESIZE_RM:
                state.width = moveLeft + width;
                break;
            case TransformerManagerType.RESIZE_LB:
                state.left = left + moveLeft;
                state.width = width - moveLeft;
                state.height = height + moveTop;
                break;
            case TransformerManagerType.RESIZE_CB:
                state.height = moveTop + height;
                break;
            case TransformerManagerType.RESIZE_RB:
                state.width = moveLeft + width;
                state.height = moveTop + height;
                break;
        }

        return state;
    }

    private _resizeLeftTop(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left, top, width, height } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        return {
            left: originLeft + moveLeftFix,
            top: originTop + moveTopFix,
            width: originWidth - moveLeftFix,
            height: originHeight - moveTopFix,
        };
    }

    private _resizeRightBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left, top, width, height } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        return {
            width: originWidth + moveLeftFix,
            height: originHeight + moveTopFix,
        };
    }

    private _resizeLeftBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left, top, width, height } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        return {
            left: originLeft + moveLeftFix,
            width: originWidth - moveLeftFix,
            height: originHeight + moveTopFix,
        };
    }

    private _resizeRightTop(moveObject: BaseObject, moveLeft: number, moveTop: number, originState: IAbsoluteTransform): ITransformState {
        const { left, top, width, height } = moveObject.getState();
        const { width: originWidth = width, height: originHeight = height, left: originLeft = left, top: originTop = top } = originState;
        const aspectRatio = originWidth / originHeight;

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, originWidth, originHeight, aspectRatio);

        return {
            top: originTop + moveTopFix,
            width: originWidth + moveLeftFix,
            height: originHeight - moveTopFix,
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
        const { keepRatio, isCropper } = this._getConfig(applyObject);
        this.disposeWithMe(
            toDisposable(
                anchor.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;
                    const scene = this._getTopScene();

                    if (scene == null) {
                        return;
                    }
                    scene.disableEvent();
                    const scrollTimer = ScrollTimer.create(scene);
                    scrollTimer.startScroll(evtOffsetX, evtOffsetY);
                    const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
                    this._viewportScrollX = scrollX;
                    this._viewportScrollY = scrollY;

                    const cursor = this._getRotateAnchorCursor(type);
                    if (!isCropper) {
                        this._clearControls();
                        this.onChangeStartObservable.notifyObservers({
                            objects: this._selectedObjectMap,
                            type: MoveObserverType.MOVE_START,
                        });
                        this._selectedObjectMap.forEach((moveObject) => {
                            const { width, height, left, top } = moveObject.getState();
                            this._startStateMap.set(moveObject.oKey, { width, height, left, top });
                        });
                    } else {
                        // for cropper
                        this.onChangeStartObservable.notifyObservers({
                            objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                            type: MoveObserverType.MOVE_START,
                        });
                        const { width, height, left, top } = applyObject.getState();
                        this._startStateMap.set(applyObject.oKey, { width, height, left, top });
                    }

                    this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject);
                        scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                            this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer, keepRatio, isCropper, applyObject);
                        });
                        scene.setCursor(cursor);
                    });

                    this._upObserver = scene.onPointerUpObserver.add(() => {
                        scene.onPointerMoveObserver.remove(this._moveObserver);
                        scene.onPointerUpObserver.remove(this._upObserver);
                        scene.enableEvent();
                        scene.resetCursor();
                        scrollTimer.dispose();
                        this.refreshControls();
                        this._startStateMap.clear();
                        if (!isCropper) {
                            this.onChangeEndObservable.notifyObservers({
                                objects: this._selectedObjectMap,
                                type: MoveObserverType.MOVE_END,
                            });
                        } else {
                            this.onChangeEndObservable.notifyObservers({
                                objects: new Map([[applyObject.oKey, applyObject]]) as Map<string, BaseObject>,
                                type: MoveObserverType.MOVE_END,
                            });
                        }
                    });
                    state.stopPropagation();
                })
            )
        );
    }

    private _attachEventToRotate(rotateControl: Rect, applyObject: BaseObject) {
        this.disposeWithMe(
            toDisposable(
                rotateControl.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
                    const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

                    this._startOffsetX = evtOffsetX;
                    this._startOffsetY = evtOffsetY;

                    const topScene = this._getTopScene() as Scene;

                    if (topScene == null) {
                        return;
                    }

                    topScene.disableEvent();

                    const viewportActualXY = topScene.getScrollXYByRelativeCoords(Vector2.create(evtOffsetX, evtOffsetY));

                    this._viewportScrollX = viewportActualXY.x;
                    this._viewportScrollY = viewportActualXY.y;

                    const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE_LINE);

                    const { ancestorLeft, ancestorTop, width, height, angle: agentOrigin } = applyObject;

                    const centerX = (width / 2) + ancestorLeft;
                    const centerY = (height / 2) + ancestorTop;
                    this._clearControls();

                    this.onChangeStartObservable.notifyObservers({
                        objects: this._selectedObjectMap,
                        type: MoveObserverType.MOVE_START,
                    });

                    const moveObserver = topScene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._rotateMoving(moveOffsetX, moveOffsetY, centerX, centerY, agentOrigin);
                        topScene.setCursor(cursor);
                    });

                    const upObserver = topScene.onPointerUpObserver.add(() => {
                        moveObserver?.dispose();
                        upObserver?.dispose();
                        topScene.enableEvent();
                        topScene.resetCursor();
                        this.refreshControls();

                        this.onChangeEndObservable.notifyObservers({
                            objects: this._selectedObjectMap,
                            type: MoveObserverType.MOVE_END,
                        });
                    });

                    state.stopPropagation();
                })
            )
        );
    }

    private _rotateMoving(moveOffsetX: number, moveOffsetY: number, centerX: number, centerY: number, agentOrigin: number) {
        const { ancestorScaleX, ancestorScaleY } = this._scene;

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

        this._selectedObjectMap.forEach((moveObject) => {
            moveObject.transformByState({ angle });
        });

        this.onChangingObservable.notifyObservers({
            objects: this._selectedObjectMap,
            angle,
            type: MoveObserverType.MOVING,
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
                left += width / 2;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RT:
                left += width + borderSpacing - borderStrokeWidth - longEdge;
                top += -borderSpacing - borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LM:
                left += borderSpacing - borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + borderSpacing - borderStrokeWidth - shortEdge;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -this.borderSpacing - borderStrokeWidth;
                top += height + borderSpacing - borderStrokeWidth - longEdge;

                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2;
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
        const { height, width, scaleX, scaleY } = applyObject.getState();

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
        const { height, width, scaleX, scaleY } = applyObject.getState();

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
                o.onPointerEnterObserver.add(() => {
                    o.cursor = cursorIn;
                })
            )
        );

        this.disposeWithMe(
            toDisposable(
                o.onPointerLeaveObserver.add(() => {
                    o.cursor = cursorOut;
                })
            )
        );
    }

    private _clearControls(changeSelf = false) {
        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._transformerControlMap.clear();

        this.onClearControlObservable.notifyObservers(changeSelf);
    }

    private _createControl(applyObject: BaseObject, isSkipOnCropper = true) {
        const { left, top, height, width, angle, scaleX, scaleY, ancestorLeft, ancestorTop, skewX, skewY, flipX, flipY } = applyObject;
        const { isCropper, resizeEnabled, rotateAnchorOffset, rotateSize, rotateCornerRadius, borderEnabled, borderStroke, borderStrokeWidth, borderSpacing, enabledAnchors } = this._getConfig(applyObject);
        if (isSkipOnCropper && isCropper) {
            return;
        }
        const oKey = applyObject.oKey;
        const zIndex = this._selectedObjectMap.size + applyObject.zIndex + 1;
        const layerIndex = applyObject.getLayerIndex() || DEFAULT_TRANSFORMER_LAYER_INDEX;
        const groupElements: BaseObject[] = [];

        if (borderEnabled && !isCropper) {
            const outline = new Rect(`${TransformerManagerType.OUTLINE}_${zIndex}`, {
                zIndex: zIndex - 1, evented: false, strokeWidth: borderStrokeWidth, stroke: borderStroke,
                ...this._getOutlinePosition(width, height, borderSpacing, borderStrokeWidth),
            });
            groupElements.push(outline);
        }
        if (resizeEnabled && !isCropper) {
            const { left: lineLeft, top: lineTop } = this._getRotateAnchorPosition(
                TransformerManagerType.ROTATE_LINE, height, width, applyObject
            );

            const rotateLine = new Rect(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
                zIndex: zIndex - 1, evented: false, left: lineLeft, top: lineTop, height: rotateAnchorOffset, width: 1,
                strokeWidth: borderStrokeWidth, stroke: borderStroke });

            const { left, top } = this._getRotateAnchorPosition(TransformerManagerType.ROTATE, height, width, applyObject);

            const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE);

            const rotate = new Rect(`${TransformerManagerType.ROTATE}_${zIndex}`, {
                zIndex: zIndex - 1, left, top, height: rotateSize, width: rotateSize,
                radius: rotateCornerRadius, strokeWidth: borderStrokeWidth * 2, stroke: borderStroke });
            this._attachEventToRotate(rotate, applyObject);
            this._attachHover(rotate, cursor, CURSOR_TYPE.DEFAULT);
            groupElements.push(rotateLine, rotate);
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
        transformerControl.transformByState({ height, width, left, top, angle });
        const scene = this.getScene();
        scene.addObject(transformerControl, layerIndex);

        if (!isCropper) {
            if (this._transformerControlMap.has(oKey)) {
                this._transformerControlMap.get(oKey)!.dispose();
            }
            this._transformerControlMap.set(oKey, transformerControl);
            this.onCreateControlObservable.notifyObservers(transformerControl);
        } else {
            this._copperControl = transformerControl;
        }


        return transformerControl;
    }

    private _getTopScene() {
        const currentScene = this.getScene();
        return currentScene.getEngine()?.activeScene as Nullable<Scene>;
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer, isCropper = false) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const { ancestorScaleX, ancestorScaleY } = this._scene;

        const moveLeft = (x - this._startOffsetX) / ancestorScaleX;
        const moveTop = (y - this._startOffsetY) / ancestorScaleY;

        if (!isCropper) {
            this._selectedObjectMap.forEach((moveObject) => {
                moveObject.translate(moveLeft + moveObject.left, moveTop + moveObject.top);
            });
            this.onChangingObservable.notifyObservers({
                objects: this._selectedObjectMap,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
            });
        } else if (this._copperSelectedObject) {
            const cropper = this._copperSelectedObject;
            cropper.translate(moveLeft + cropper.left, moveTop + cropper.top);
            this.onChangingObservable.notifyObservers({
                objects: new Map([[cropper.oKey, cropper]]) as Map<string, BaseObject>,
                moveX: moveLeft,
                moveY: moveTop,
                type: MoveObserverType.MOVING,
            });
        }


        this._startOffsetX = x;
        this._startOffsetY = y;
    }

    private _updateActiveObjectList(applyObject: BaseObject, evt: IPointerEvent | IMouseEvent) {
        const { isCropper } = this._getConfig(applyObject);
        if (this._selectedObjectMap.has(applyObject.oKey)) {
            return;
        }

        if (!evt.ctrlKey) {
            this._selectedObjectMap.clear();
            this._clearControls(true);
        }

        if (!isCropper) {
            this._selectedObjectMap.set(applyObject.oKey, applyObject);
        }

        this._createControl(applyObject);
    }

    private _addCancelObserver(scene: Scene) {
        this._cancelFocusObserver?.dispose();
        this._cancelFocusObserver = scene.onPointerDownObserver.add(() => {
            this.clearSelectedObjects();
        });
    }
}
