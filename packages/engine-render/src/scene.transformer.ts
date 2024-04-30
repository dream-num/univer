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

import type { IKeyValue, Nullable, Observer } from '@univerjs/core';
import { Disposable, Observable, toDisposable } from '@univerjs/core';

import type { BaseObject } from './base-object';
import { CURSOR_TYPE } from './basics/const';
import type { IMouseEvent, IPointerEvent } from './basics/i-events';
import { getCurrentScrollXY } from './basics/scroll-xy';
import { Group } from './group';
import { ScrollTimer } from './scroll-timer';
import { Rect } from './shape/rect';

import { radToDeg } from './basics/tools';
import type { Scene } from './scene';
import { Vector2 } from './basics/vector2';

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

export interface ITransformerConfig {
    hoverEnabled?: boolean;
    hoverEnterFunc?: Nullable<(e: IPointerEvent | IMouseEvent) => void>;
    hoverLeaveFunc?: Nullable<(e: IPointerEvent | IMouseEvent) => void>;

    rotateEnabled?: boolean;
    rotationSnaps?: number[];
    rotationSnapTolerance?: number;
    rotateAnchorOffset?: number;
    rotateSize?: number;
    rotateCornerRadius?: number;

    borderEnabled?: boolean;
    borderStroke?: string;
    borderStrokeWidth?: number;
    borderDash?: number[];
    borderSpacing: number;

    resizeEnabled?: boolean;
    enabledAnchors?: number[];
    anchorFill?: string;
    anchorStroke?: string;
    anchorStrokeWidth?: number;
    anchorSize?: number;
    anchorCornerRadius?: number;

    keepRatio?: boolean;
    centeredScaling?: boolean;

    flipEnabled?: boolean;
    ignoreStroke?: boolean;
    boundBoxFunc?: Nullable<(oldBox: BaseObject, newBox: BaseObject) => BaseObject>;
    useSingleNodeRotation?: boolean;
    shouldOverdrawWholeArea?: boolean;
}

/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 */
export class Transformer extends Disposable implements ITransformerConfig {
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

    onClearControlObservable = new Observable<null>();

    onCreateControlObservable = new Observable<Group>();

    private _startOffsetX: number = -1;

    private _startOffsetY: number = -1;

    private _viewportScrollX: number = -1;

    private _viewportScrollY: number = -1;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _cancelFocusObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _transformerControlMap = new Map<string, Group>();

    private _selectedObjectMap = new Map<string, BaseObject>();

    private _observerObjectMap = new Map<string, Nullable<Observer<IPointerEvent | IMouseEvent>>>();

    constructor(
        private _scene: Scene,
        config?: ITransformerConfig
    ) {
        super();
        this._initialProps(config);
    }

    resetProps(config?: ITransformerConfig) {
        this._initialProps(config);
    }

    getScene() {
        return this._scene;
    }

    hideControl() {
        this._hideControl();
    }

    attachTo(applyObject: BaseObject) {
        if (this.hoverEnabled) {
            this.hoverEnterFunc && applyObject.onPointerEnterObserver.add(this.hoverEnterFunc);
            this.hoverLeaveFunc && applyObject.onPointerLeaveObserver.add(this.hoverLeaveFunc);
        }

        const observer = applyObject.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

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

            this._updateActiveObjectList(applyObject, evt);

            const moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                this._hideControl();
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                });
            });

            const upObserver = scene.onPointerUpObserver.add(() => {
                // scene.onPointerMoveObserver.remove(this._moveObserver);
                // scene.onPointerUpObserver.remove(this._upObserver);
                moveObserver?.dispose();
                upObserver?.dispose();
                scene.enableEvent();
                this._updateControl();
                scrollTimer.dispose();

                this.onChangeEndObservable.notifyObservers({
                    objects: this._selectedObjectMap,
                    type: MoveObserverType.MOVE_END,
                });
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
        scrollTimer: ScrollTimer
    ) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const moveLeft = x - this._startOffsetX;
        const moveTop = y - this._startOffsetY;

        this._selectedObjectMap.forEach((moveObject) => {
            // console.log(moveLeft + moveObject.width, moveTop + moveObject.height);
            const { left, top, width, height } = moveObject;
            let state: ITransformState = {};
            const aspectRatio = width / height;

            switch (type) {
                case TransformerManagerType.RESIZE_LT:
                    state = this._resizeLeftTop(moveObject, moveLeft, moveTop, aspectRatio);
                    break;
                case TransformerManagerType.RESIZE_CT:
                    state.top = top + moveTop;
                    state.height = height - moveTop;
                    break;
                case TransformerManagerType.RESIZE_RT:
                    state = this._resizeRightTop(moveObject, moveLeft, moveTop, aspectRatio);
                    break;
                case TransformerManagerType.RESIZE_LM:
                    state.left = left + moveLeft;
                    state.width = width - moveLeft;
                    break;
                case TransformerManagerType.RESIZE_RM:
                    state.width = moveLeft + width;
                    break;
                case TransformerManagerType.RESIZE_LB:
                    state = this._resizeLeftBottom(moveObject, moveLeft, moveTop, aspectRatio);
                    break;
                case TransformerManagerType.RESIZE_CB:
                    state.height = moveTop + height;
                    break;
                case TransformerManagerType.RESIZE_RB:
                    state = this._resizeRightBottom(moveObject, moveLeft, moveTop, aspectRatio);
                    break;
            }
            moveObject.transformByState(state);
        });

        this.onChangingObservable.notifyObservers({
            objects: this._selectedObjectMap,
            moveX: moveLeft,
            moveY: moveTop,
            type: MoveObserverType.MOVING,
        });

        this._startOffsetX = x;
        this._startOffsetY = y;
    }

    private _resizeLeftTop(moveObject: BaseObject, moveLeft: number, moveTop: number, aspectRatio: number): ITransformState {
        const { left, top, width, height } = moveObject.getState();

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, aspectRatio);

        return {
            left: left + moveLeftFix,
            top: top + moveTopFix,
            width: width - moveLeftFix,
            height: height - moveTopFix,
        };
    }

    private _resizeRightBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, aspectRatio: number): ITransformState {
        const { left, top, width, height } = moveObject.getState();

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLtRb(moveLeft, moveTop, aspectRatio);

        return {
            width: width + moveLeftFix,
            height: height + moveTopFix,
        };
    }

    private _resizeLeftBottom(moveObject: BaseObject, moveLeft: number, moveTop: number, aspectRatio: number): ITransformState {
        const { left, top, width, height } = moveObject.getState();

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, aspectRatio);

        return {
            left: left + moveLeftFix,
            width: width - moveLeftFix,
            height: height + moveTopFix,
        };
    }

    private _resizeRightTop(moveObject: BaseObject, moveLeft: number, moveTop: number, aspectRatio: number): ITransformState {
        const { left, top, width, height } = moveObject.getState();

        const { moveLeft: moveLeftFix, moveTop: moveTopFix } = this._fixMoveLbRt(moveLeft, moveTop, aspectRatio);

        return {
            top: top + moveTopFix,
            width: width + moveLeftFix,
            height: height - moveTopFix,
        };
    }


    private _fixMoveLtRb(moveLeft: number, moveTop: number, aspectRatio: number) {
        let moveLeftFix = moveLeft;
        let moveTopFix = moveTop;


        if (moveLeftFix / moveTopFix > aspectRatio) {
            moveTopFix = moveLeftFix / aspectRatio;
        } else {
            moveLeftFix = moveTopFix * aspectRatio;
        }

        return {
            moveLeft: moveLeftFix,
            moveTop: moveTopFix,
        };
    }

    private _fixMoveLbRt(moveLeft: number, moveTop: number, aspectRatio: number) {
        let moveLeftFix = moveLeft;
        let moveTopFix = moveTop;


        if (Math.abs(moveLeftFix / moveTopFix) > aspectRatio) {
            moveTopFix = -moveLeftFix / aspectRatio;
        } else {
            moveLeftFix = -moveTopFix * aspectRatio;
        }

        return {
            moveLeft: moveLeftFix,
            moveTop: moveTopFix,
        };
    }

    private _attachEventToAnchor(anchor: Rect, type = TransformerManagerType.RESIZE_LT, applyObject: BaseObject) {
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
                    this._clearControl();
                    this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                        const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                        this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer);
                        scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                            this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer);
                        });
                        scene.setCursor(cursor);
                    });

                    this._upObserver = scene.onPointerUpObserver.add(() => {
                        scene.onPointerMoveObserver.remove(this._moveObserver);
                        scene.onPointerUpObserver.remove(this._upObserver);
                        scene.enableEvent();
                        scene.resetCursor();
                        scrollTimer.dispose();
                        this._createControl(applyObject);
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
                    this._clearControl();

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
                        this._createControl(applyObject);
                    });

                    state.stopPropagation();
                })
            )
        );
    }

    private _rotateMoving(moveOffsetX: number, moveOffsetY: number, centerX: number, centerY: number, agentOrigin: number) {
        const angle1 = Math.atan2(
            moveOffsetY + this._viewportScrollY + -centerY,
            moveOffsetX + this._viewportScrollX - centerX
        );

        const angle2 = Math.atan2(
            this._startOffsetY + this._viewportScrollY - centerY,
            this._startOffsetX + this._viewportScrollX - centerX
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

    private _getOutlinePosition(width: number, height: number, scaleX: number, scaleY: number) {
        return {
            left: -this.borderSpacing - this.borderStrokeWidth,
            top: -this.borderSpacing - this.borderStrokeWidth,
            width: width + this.borderSpacing * 2,
            height: height + this.borderSpacing * 2,
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

    private _getRotateAnchorPosition(type: TransformerManagerType, height: number, width: number) {
        let left = -this.anchorSize / 2;
        let top = -this.anchorSize / 2;

        switch (type) {
            case TransformerManagerType.ROTATE:
                left = width / 2 - this.rotateSize / 2;
                top = -this.rotateAnchorOffset - this.borderSpacing - this.borderStrokeWidth * 2 - this.rotateSize;

                break;
            case TransformerManagerType.ROTATE_LINE:
                left = width / 2;
                top = -this.rotateAnchorOffset - this.borderSpacing - this.borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LT:
                left += -this.borderSpacing - this.borderStrokeWidth;
                top += -this.borderSpacing - this.borderStrokeWidth;
                break;
            case TransformerManagerType.RESIZE_CT:
                left += width / 2;
                top += -this.borderSpacing - this.borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RT:
                left += width + this.borderSpacing - this.borderStrokeWidth;
                top += -this.borderSpacing - this.borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_LM:
                left += -this.borderSpacing - this.borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_RM:
                left += width + this.borderSpacing - this.borderStrokeWidth;
                top += height / 2;

                break;
            case TransformerManagerType.RESIZE_LB:
                left += -this.borderSpacing - this.borderStrokeWidth;
                top += height + this.borderSpacing - this.borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2;
                top += height + this.borderSpacing - this.borderStrokeWidth;

                break;
            case TransformerManagerType.RESIZE_RB:
                left += width + this.borderSpacing - this.borderStrokeWidth;
                top += height + this.borderSpacing - this.borderStrokeWidth;

                break;
        }

        return {
            left,
            top,
        };
    }

    private _createResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height, width, scaleX, scaleY } = applyObject.getState();

        const { left, top } = this._getRotateAnchorPosition(type, height, width);

        const cursor = this._getRotateAnchorCursor(type);

        const anchor = new Rect(`${type}_${zIndex}`, {
            zIndex: zIndex - 1,
            fill: this.anchorFill,
            stroke: this.anchorStroke,
            strokeWidth: this.anchorStrokeWidth,
            width: this.anchorSize,
            height: this.anchorSize,
            radius: this.anchorCornerRadius,
            left,
            top,
        });

        this._attachHover(anchor, cursor, CURSOR_TYPE.DEFAULT);
        // anchor.cursor = cursor;

        return anchor;
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

    private _updateControlIterator(func: (control: Group, applyObject: BaseObject) => void) {
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
            const { left, top } = applyObject.getState();
            control.transformByState({
                left,
                top,
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

    private _clearControl() {
        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._transformerControlMap.clear();

        this.onClearControlObservable.notifyObservers(null);
    }

    private _createControl(applyObject: BaseObject) {
        const { left, top, height, width, angle, scaleX, scaleY, ancestorLeft, ancestorTop, skewX, skewY, flipX, flipY } = applyObject;
        const oKey = applyObject.oKey;
        const zIndex = this._selectedObjectMap.size + applyObject.zIndex + 1;
        const layerIndex = applyObject.getLayerIndex() || DEFAULT_TRANSFORMER_LAYER_INDEX;
        const groupElements: BaseObject[] = [];
        const centerX = width / 2;
        const centerY = height / 2;


        if (this.borderEnabled) {
            const outline = new Rect(`${TransformerManagerType.OUTLINE}_${zIndex}`, {
                zIndex: zIndex - 1,
                evented: false,
                strokeWidth: this.borderStrokeWidth,
                stroke: this.borderStroke,
                ...this._getOutlinePosition(width, height, scaleX, scaleY),
            });
            groupElements.push(outline);
        }

        if (this.resizeEnabled) {
            const { left: lineLeft, top: lineTop } = this._getRotateAnchorPosition(
                TransformerManagerType.ROTATE_LINE,
                height,
                width
            );

            // const rotateLinePos = new Vector2(lineLeft, lineTop);
            // rotateLinePos.rotateByPoint(angle, Vector2.create(centerX, centerY));
            // lineLeft = rotateLinePos.x;
            // lineTop = rotateLinePos.y;

            const rotateLine = new Rect(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
                zIndex: zIndex - 1, evented: false, left: lineLeft,
                top: lineTop, height: this.rotateAnchorOffset, width: 1,
                strokeWidth: this.borderStrokeWidth, stroke: this.borderStroke });

            const { left, top } = this._getRotateAnchorPosition(TransformerManagerType.ROTATE, height, width);

            const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE);

            const rotate = new Rect(`${TransformerManagerType.ROTATE}_${zIndex}`, {
                zIndex: zIndex - 1, left, top, height: this.rotateSize, width: this.rotateSize,
                radius: this.rotateCornerRadius, strokeWidth: this.borderStrokeWidth * 2, stroke: this.borderStroke });
            this._attachEventToRotate(rotate, applyObject);
            this._attachHover(rotate, cursor, CURSOR_TYPE.DEFAULT);
            groupElements.push(rotateLine, rotate);
        }

        if (this.resizeEnabled) {
            for (let i = 0, len = this.enabledAnchors.length; i < len; i++) {
                const isEnable = this.enabledAnchors[i];
                if (isEnable !== 1) {
                    continue;
                }
                const type = TransformerManagerTypeArray[i];
                const anchor = this._createResizeAnchor(type, applyObject, zIndex);
                this._attachEventToAnchor(anchor, type, applyObject);
                groupElements.push(anchor);
            }
        }

        const transformerControl = new Group(`${TransformerManagerType.GROUP}_${zIndex}`, ...groupElements);
        transformerControl.zIndex = zIndex;
        transformerControl.evented = false;
        transformerControl.transformByState({ height, width, left, top, angle });
        const scene = this.getScene();
        scene.addObject(transformerControl, layerIndex);
        this._transformerControlMap.set(oKey, transformerControl);
        this.onCreateControlObservable.notifyObservers(transformerControl);

        return transformerControl;
    }

    private _getTopScene() {
        const currentScene = this.getScene();
        return currentScene.getEngine()?.activeScene as Nullable<Scene>;
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const moveLeft = x - this._startOffsetX;
        const moveTop = y - this._startOffsetY;

        this._selectedObjectMap.forEach((moveObject) => {
            moveObject.translate(moveLeft + moveObject.left, moveTop + moveObject.top);
        });

        this.onChangingObservable.notifyObservers({
            objects: this._selectedObjectMap,
            moveX: moveLeft,
            moveY: moveTop,
            type: MoveObserverType.MOVING,
        });

        this._startOffsetX = x;
        this._startOffsetY = y;
    }

    private _updateActiveObjectList(applyObject: BaseObject, evt: IPointerEvent | IMouseEvent) {
        if (this._selectedObjectMap.has(applyObject.oKey)) {
            return;
        }

        if (!evt.ctrlKey) {
            this._selectedObjectMap.clear();
            this._clearControl();
        }
        this._selectedObjectMap.set(applyObject.oKey, applyObject);
        this._createControl(applyObject);
    }

    private _addCancelObserver(scene: Scene) {
        scene.onPointerDownObserver.remove(this._cancelFocusObserver);
        this._cancelFocusObserver = scene.onPointerDownObserver.add(() => {
            this._selectedObjectMap.clear();
            this._clearControl();
            scene.onPointerDownObserver.remove(this._cancelFocusObserver);
        });
    }
}
