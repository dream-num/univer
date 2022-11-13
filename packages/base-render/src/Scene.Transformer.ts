import { Nullable, Observer } from '@univer/core';
import { BaseObject } from './BaseObject';
import { IMouseEvent, IPointerEvent } from './Basics';
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

    anchorCornerRadius = 0;

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

    private _startOffsetX: number;

    private _startOffsetY: number;

    private _viewportScrollX: number;

    private _viewportScrollY: number;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _observerMap = new Map<string, Observer>();

    private _transformerControlMap = new Map<string, Group>();

    private _selectedObjectMap = new Map<string, BaseObject>();

    constructor(private _scene: Scene, config?: ITransformerConfig) {
        this._initialProps(config);
        this._scene.onPointerDownObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this._selectedObjectMap.clear();
        });
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
            if (props[key] === undefined) {
                return true;
            }

            this[key] = props[key];
        });
    }

    private _moving(moveOffsetX: number, moveOffsetY: number, scrollTimer: ScrollTimer) {
        const { scrollX, scrollY } = this._getCurrentScrollXY(scrollTimer);
        const x = moveOffsetX - this._viewportScrollX + scrollX;
        const y = moveOffsetY - this._viewportScrollY + scrollY;

        const moveLeft = x - this._startOffsetX;
        const moveTop = y - this._startOffsetY;

        this._selectedObjectMap.forEach((moveObject) => {
            moveObject.translate(moveLeft + moveObject.left, moveTop + moveObject.top);
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
        }
        this._selectedObjectMap.set(applyObject.oKey, applyObject);
    }

    private _getCurrentScrollXY(scrollTimer: ScrollTimer) {
        const viewport = scrollTimer.getViewportByCoord(this.getScene());
        let scrollX = 0;
        let scrollY = 0;
        if (!viewport) {
            return {
                scrollX,
                scrollY,
            };
        }
        const actualScroll = viewport.getActualScroll(viewport.scrollX, viewport.scrollY);
        return {
            scrollX: actualScroll.x,
            scrollY: actualScroll.y,
        };
    }

    private _createResizeAnchor(type: TransformerManagerType, applyObject: BaseObject, zIndex: number) {
        const { height, width } = applyObject;

        let left = -this.anchorSize / 2;
        let top = -this.anchorSize / 2;

        switch (type) {
            case TransformerManagerType.RESIZE_LT:
                break;
            case TransformerManagerType.RESIZE_CT:
                left += width / 2;
                break;
            case TransformerManagerType.RESIZE_RT:
                left += width;
                break;
            case TransformerManagerType.RESIZE_LM:
                top += height / 2;
                break;
            case TransformerManagerType.RESIZE_RM:
                left += width;
                top += height / 2;
                break;
            case TransformerManagerType.RESIZE_LB:
                left += width / 2;
                top += height;
                break;
            case TransformerManagerType.RESIZE_CB:
                left += width / 2;
                top += height;
                break;
            case TransformerManagerType.RESIZE_RB:
                left += width / 2;
                top += height;
                break;
        }

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

        return anchor;
    }

    private _createControl(applyObject: BaseObject) {
        const { left, top, height, width, angle, scaleX, scaleY, skewX, skewY, flipX, flipY } = applyObject;

        const zIndex = this._selectedObjectMap.size;

        const groupElements: BaseObject[] = [];

        if (this.borderEnabled) {
            const outline = new Rect(`${TransformerManagerType.OUTLINE}_${zIndex}`, {
                zIndex: zIndex - 1,
                evented: false,
                left: this.borderSpacing + this.borderStrokeWidth,
                top: this.borderSpacing + this.borderStrokeWidth,
                width: width + this.borderSpacing * 2 + this.borderStrokeWidth * 2,
                height: height + this.borderSpacing * 2 + this.borderStrokeWidth * 2,
                strokeWidth: this.borderStrokeWidth,
                stroke: this.borderStroke,
            });
            groupElements.push(outline);
        }

        if (this.resizeEnabled) {
            const rotateLine = new Rect(`${TransformerManagerType.ROTATE_LINE}_${zIndex}`, {
                zIndex: zIndex - 1,
                evented: false,
                top: -this.rotateAnchorOffset,
                height: this.rotateAnchorOffset,
                width: 1,
                strokeWidth: this.borderStrokeWidth,
                stroke: this.borderStroke,
            });

            const rotate = new Rect(`${TransformerManagerType.ROTATE}_${zIndex}`, {
                zIndex: zIndex - 1,
                top: -this.rotateAnchorOffset,
                height: this.rotateSize,
                width: this.rotateSize,
                radius: this.rotateCornerRadius,
            });

            groupElements.push(rotateLine, rotate);
        }

        if (this.resizeEnabled) {
            for (let i = 0, len = this.enabledAnchors.length; i < len; i++) {
                const isEnable = this.enabledAnchors[i];
                if (isEnable !== 1) {
                    continue;
                }
                const anchor = this._createResizeAnchor(TransformerManagerType[i], applyObject, zIndex);

                groupElements.push(anchor);
            }
        }

        const transformerControl = new Group(`${TransformerManagerType.GROUP}_${zIndex}`, ...groupElements);

        transformerControl.zIndex = zIndex;

        transformerControl.evented = false;

        const scene = this.getScene();
        scene.addObject(transformerControl);

        this._transformerControlMap.set(transformerControl.oKey, transformerControl);
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

            const scene = this.getScene();

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(this.getScene());
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            const { scrollX, scrollY } = this._getCurrentScrollXY(scrollTimer);

            this._viewportScrollX = scrollX;
            this._viewportScrollY = scrollY;

            this._updateActiveObjectList(applyObject, evt);

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
                this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this._moving(moveOffsetX, moveOffsetY, scrollTimer);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();
                scrollTimer.stopScroll();
            });

            state.stopPropagation();
        });

        return applyObject;
    }
}
