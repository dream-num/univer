import { IKeyValue, Nullable, Observable, Observer } from '@univerjs/core';
import { BaseObject } from './BaseObject';
import { CURSOR_TYPE } from './Basics/Const';
import { IMouseEvent, IPointerEvent } from './Basics/IEvents';
import { getCurrentScrollXY } from './Basics/Position';
import { Group } from './Group';
import { Scene } from './Scene';
import { ScrollTimer } from './ScrollTimer';
import { Rect } from './Shape';

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

interface transformState {
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
    type: MoveObserverType;
}

export interface ITransformerConfig {
    hoverEnabled?: boolean;
    hoverEnterFunc?: (e: IPointerEvent | IMouseEvent) => void;
    hoverLeaveFunc?: (e: IPointerEvent | IMouseEvent) => void;

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
    boundBoxFunc?: (oldBox: BaseObject, newBox: BaseObject) => BaseObject;
    useSingleNodeRotation?: boolean;
    shouldOverdrawWholeArea?: boolean;
}

/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 */
export class Transformer implements ITransformerConfig {
    hoverEnabled = false;

    hoverEnterFunc?: (e: IPointerEvent | IMouseEvent) => void;

    hoverLeaveFunc?: (e: IPointerEvent | IMouseEvent) => void;

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

    borderSpacing = 10;

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

    boundBoxFunc?: (oldBox: BaseObject, newBox: BaseObject) => BaseObject;

    useSingleNodeRotation?: boolean;

    shouldOverdrawWholeArea?: boolean;

    onChangeStartObservable = new Observable<IChangeObserverConfig>();

    onChangingObservable = new Observable<IChangeObserverConfig>();

    onChangeEndObservable = new Observable<IChangeObserverConfig>();

    onClearControlObservable = new Observable<null>();

    onCreateControlObservable = new Observable<Group>();

    private _startOffsetX: number;

    private _startOffsetY: number;

    private _viewportScrollX: number;

    private _viewportScrollY: number;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _cancelFocusObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _transformerControlMap = new Map<string, Group>();

    private _selectedObjectMap = new Map<string, BaseObject>();

    constructor(private _scene: Scene, config?: ITransformerConfig) {
        this._initialProps(config);
    }

    getScene() {
        return this._scene;
    }

    attachTo(applyObject: BaseObject) {
        if (!applyObject.isTransformer) {
            return;
        }

        if (this.hoverEnabled) {
            this.hoverEnterFunc && applyObject.onPointerEnterObserver.add(this.hoverEnterFunc);
            this.hoverLeaveFunc && applyObject.onPointerLeaveObserver.add(this.hoverLeaveFunc);
        }

        applyObject.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
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

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                this._hiddenControl();
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();
                this._updateControl();
                scrollTimer.stopScroll();

                this.onChangeEndObservable.notifyObservers({
                    objects: this._selectedObjectMap,
                    type: MoveObserverType.MOVE_END,
                });
            });

            state.stopPropagation();
        });

        return applyObject;
    }

    dispose() {
        this._moveObserver = null;
        this._upObserver = null;
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

    private _updateControlChildren() {
        this._updateControlIterator((control, applyObject) => {
            const { left, top, width, height, scaleX, scaleY } = applyObject.getState();
            const children = control.getObjects();
            children.forEach((o: BaseObject) => {
                const key = o.oKey;
                const type = this._checkTransformerType(key);

                if (!type) {
                    return true;
                }

                if (type === TransformerManagerType.OUTLINE) {
                    o.transformByState(this._getOutlinePosition(width, height, scaleX, scaleY));
                } else {
                    const { left, top } = this._getRotateAnchorPosition(type, height, width, scaleX, scaleY);
                    o.transformByState({
                        left,
                        top,
                    });
                }
            });
            control.transformByState({
                left,
                top,
            });
        });
    }

    private _anchorMoving(type: TransformerManagerType, moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const moveLeft = x - this._startOffsetX;
        const moveTop = y - this._startOffsetY;

        this._selectedObjectMap.forEach((moveObject) => {
            // console.log(moveLeft + moveObject.width, moveTop + moveObject.height);
            const { left, top, width, height } = moveObject;
            const state: transformState = {};

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
            moveObject.transformByState(state);
        });

        this._updateControlChildren();

        this.onChangingObservable.notifyObservers({
            objects: this._selectedObjectMap,
            moveX: moveLeft,
            moveY: moveTop,
            type: MoveObserverType.MOVING,
        });

        this._startOffsetX = x;
        this._startOffsetY = y;
    }

    private _attachEventToAnchor(anchor: Rect, type = TransformerManagerType.RESIZE_LT) {
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

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer);
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._anchorMoving(type, moveOffsetX, moveOffsetY, scrollTimer);
                });
                scene.setCursor(cursor);
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();
                scene.resetCursor();
                scrollTimer.stopScroll();
            });

            state.stopPropagation();
        });
    }

    private _attachEventToRotate(rotateControl: Rect) {
        rotateControl.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent, state) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;

            const scene = this._getTopScene();

            if (scene == null) {
                return;
            }

            scene.disableEvent();

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();
            });

            state.stopPropagation();
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

    private _getRotateAnchorPosition(type: TransformerManagerType, height: number, width: number, scaleX: number, scaleY: number) {
        // width /= scaleX;

        // height /= scaleY;

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
        let { height, width, scaleX, scaleY } = applyObject.getState();

        const { left, top } = this._getRotateAnchorPosition(type, height, width, scaleX, scaleY);

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

    private _hiddenControl() {
        this._transformerControlMap.forEach((control) => {
            control.hide();
            control.makeDirty(true);
        });
    }

    private _attachHover(o: BaseObject, cursorIn: CURSOR_TYPE, cursorOut: CURSOR_TYPE) {
        o.onPointerEnterObserver.add(() => {
            o.cursor = cursorIn;
        });

        o.onPointerLeaveObserver.add(() => {
            o.cursor = cursorOut;
        });
    }

    private _clearControl() {
        this._transformerControlMap.forEach((control) => {
            control.dispose();
        });
        this._transformerControlMap.clear();

        this.onClearControlObservable.notifyObservers(null);
    }

    private _createControl(applyObject: BaseObject) {
        let { left, top, height, width, angle, scaleX, scaleY, skewX, skewY, flipX, flipY } = applyObject.getState();
        const oKey = applyObject.oKey;
        const zIndex = this._selectedObjectMap.size;

        const groupElements: BaseObject[] = [];

        // width *= scaleX;

        // height *= scaleY;

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
            const { left: lineLeft, top: lineTop } = this._getRotateAnchorPosition(TransformerManagerType.ROTATE_LINE, height, width, scaleX, scaleY);
            const rotateLine = new Rect(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
                zIndex: zIndex - 1,
                evented: false,
                left: lineLeft,
                top: lineTop,
                height: this.rotateAnchorOffset,
                width: 1,
                strokeWidth: this.borderStrokeWidth,
                stroke: this.borderStroke,
            });

            const { left, top } = this._getRotateAnchorPosition(TransformerManagerType.ROTATE, height, width, scaleX, scaleY);
            const cursor = this._getRotateAnchorCursor(TransformerManagerType.ROTATE);
            const rotate = new Rect(`${TransformerManagerType.ROTATE}_${zIndex}`, {
                zIndex: zIndex - 1,
                left,
                top,
                height: this.rotateSize,
                width: this.rotateSize,
                radius: this.rotateCornerRadius,
                strokeWidth: this.borderStrokeWidth * 2,
                stroke: this.borderStroke,
            });
            this._attachEventToRotate(rotate);
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
                this._attachEventToAnchor(anchor, type);
                groupElements.push(anchor);
            }
        }

        const transformerControl = new Group(`${TransformerManagerType.GROUP}_${zIndex}`, ...groupElements);

        transformerControl.zIndex = zIndex;

        transformerControl.evented = false;

        transformerControl.transformByState({
            left,
            top,
        });

        const scene = this.getScene();
        scene.addObject(transformerControl, 2);

        console.log(scene, applyObject);

        this._transformerControlMap.set(oKey, transformerControl);

        this.onCreateControlObservable.notifyObservers(transformerControl);

        return transformerControl;
    }

    private _getTopScene() {
        const currentScene = this.getScene();
        return currentScene.getEngine()?.activeScene;
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
        this._cancelFocusObserver = scene.onPointerDownObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._selectedObjectMap.clear();
            this._clearControl();
            scene.onPointerDownObserver.remove(this._cancelFocusObserver);
        });
    }
}
