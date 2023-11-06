import { ITextSelectionRange, Nullable, Tools } from '@univerjs/core';

import { COLORS } from '../../../Basics/Const';
import { INodePosition } from '../../../Basics/Interfaces';
import {
    ITextSelectionRangeWithStyle,
    ITextSelectionStyle,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
} from '../../../Basics/TextSelection';
import { getColor } from '../../../Basics/Tools';
import { IPoint } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { RegularPolygon } from '../../../Shape/RegularPolygon';
import { ThinScene } from '../../../ThinScene';
import { DocumentSkeleton } from '../DocSkeleton';
import { IDocumentOffsetConfig } from '../Document';
import {
    compareNodePosition,
    getOneTextSelectionRange,
    NodePositionConvertToCursor,
    NodePositionMap,
} from './convert-cursor';

const TEXT_RANGE_KEY_PREFIX = '__TestSelectionRange__';

const TEXT_ANCHOR_KEY_PREFIX = '__TestSelectionAnchor__';

const ID_LENGTH = 6;

export function cursorConvertToTextSelection(
    scene: Scene,
    range: ITextSelectionRangeWithStyle,
    docSkeleton: DocumentSkeleton,
    documentOffsetConfig: IDocumentOffsetConfig
): Nullable<TextSelection> {
    const { cursorStart, cursorEnd, style = NORMAL_TEXT_SELECTION_PLUGIN_STYLE } = range;

    const startNode = docSkeleton.findNodePositionByCharIndex(cursorStart);
    const endNode = cursorStart !== cursorEnd ? docSkeleton.findNodePositionByCharIndex(cursorEnd) : null;

    const textSelection = new TextSelection(scene, startNode, endNode, style);

    textSelection.refresh(documentOffsetConfig, docSkeleton);

    return textSelection;
}

export class TextSelection {
    private _current = false;

    private _rangeShape: Nullable<RegularPolygon>;

    private _anchorShape: Nullable<Rect>;

    private _rangeList: ITextSelectionRange[] = [];

    constructor(
        private _scene: ThinScene,
        public startNodePosition?: Nullable<INodePosition>,
        public endNodePosition?: Nullable<INodePosition>,
        private _style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE
    ) {}

    getRange(): Nullable<ITextSelectionRange> {
        return getOneTextSelectionRange(this._rangeList);
    }

    getRangeList() {
        return this._rangeList;
    }

    getAnchor() {
        return this._anchorShape;
    }

    activeStatic() {
        this._anchorShape?.setProps({
            stroke: this._style?.strokeActive || getColor(COLORS.black, 1),
        });
    }

    deactivateStatic() {
        this._anchorShape?.setProps({
            stroke: this._style?.stroke || getColor(COLORS.black, 0),
        });
    }

    isActive() {
        return this._current === true;
    }

    activate() {
        this._current = true;
    }

    deactivate() {
        this._current = false;
    }

    isEmpty() {
        return this.startNodePosition == null && this.endNodePosition == null;
    }

    isCollapsed() {
        if (this.startNodePosition != null && this.endNodePosition == null) {
            return true;
        }

        if (this.isSamePosition()) {
            return true;
        }

        return false;
    }

    isRange() {
        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (start == null || end == null) {
            return false;
        }

        if (this.isSamePosition()) {
            return false;
        }

        return true;
    }

    dispose() {
        this._rangeShape?.dispose();
        this._rangeShape = null;
        this._anchorShape?.dispose();
        this._anchorShape = null;
    }

    isIntersection(textSelection: TextSelection) {
        const activeRange = this.getRange();

        const compareRange = textSelection.getRange();

        if (compareRange == null || activeRange == null) {
            return false;
        }

        const { cursorStart: activeStart, cursorEnd: activeEnd } = activeRange;
        const { cursorStart: compareStart, cursorEnd: compareEnd } = compareRange;

        return activeStart <= compareEnd && activeEnd >= compareStart;
    }

    refresh(documentOffsetConfig: IDocumentOffsetConfig, docSkeleton: DocumentSkeleton) {
        const start = this.startNodePosition;
        const end = this.endNodePosition;

        this._anchorShape?.hide();
        this._rangeShape?.hide();

        if (this.isEmpty()) {
            return;
        }

        const { docsLeft, docsTop } = documentOffsetConfig;

        const convertor = new NodePositionConvertToCursor(documentOffsetConfig, docSkeleton);

        if (this.isCollapsed()) {
            const { pointGroup, cursorList } = convertor.getRangePointData(start, start);

            this._setRangeList(cursorList);
            pointGroup.length > 0 && this._createOrUpdateAnchor(pointGroup, docsLeft, docsTop);

            return;
        }

        const { pointGroup, cursorList } = convertor.getRangePointData(start, end);

        this._setRangeList(cursorList);
        pointGroup.length > 0 && this._createOrUpdateRange(pointGroup, docsLeft, docsTop);
    }

    getStart() {
        if (this.startNodePosition == null) {
            return null;
        }

        if (this.endNodePosition == null) {
            return this.startNodePosition;
        }

        const { start } = compareNodePosition(this.startNodePosition, this.endNodePosition);

        return start;
    }

    getEnd() {
        if (this.startNodePosition == null) {
            return this.endNodePosition;
        }

        if (this.endNodePosition == null) {
            return null;
        }

        const { end } = compareNodePosition(this.startNodePosition, this.endNodePosition);

        return end;
    }

    private isSamePosition() {
        const start = this.startNodePosition;

        const end = this.endNodePosition;

        if (start == null || end == null) {
            return false;
        }

        const keys = Object.keys(NodePositionMap);

        for (const key of keys) {
            const startNodeValue = start[key as keyof INodePosition] as number;
            const endNodeValue = end[key as keyof INodePosition] as number;

            if (startNodeValue !== endNodeValue) {
                return false;
            }
        }

        if (start.isBack !== end.isBack) {
            return false;
        }

        return true;
    }

    private _createOrUpdateRange(pointsGroup: IPoint[][], left: number, top: number) {
        if (this._rangeShape) {
            this._rangeShape.translate(left, top);
            this._rangeShape.updatePointGroup(pointsGroup);
            this._rangeShape.show();

            return;
        }

        const OPACITY = 0.2;
        const polygon = new RegularPolygon(TEXT_RANGE_KEY_PREFIX + Tools.generateRandomId(ID_LENGTH), {
            pointsGroup,
            fill: this._style?.fill || getColor(COLORS.black, OPACITY),
            left,
            top,
            evented: false,
            debounceParentDirty: false,
        });

        this._rangeShape = polygon;

        this._scene.addObject(polygon, 2);
    }

    private _getAnchorBounding(pointsGroup: IPoint[][]) {
        const points = pointsGroup[0];
        const startPoint = points[0];
        const endPoint = points[2];

        const { x: startX, y: startY } = startPoint;

        const { x: endX, y: endY } = endPoint;

        return {
            left: startX,
            top: startY,
            width: endX - startX,
            height: endY - startY,
        };
    }

    private _createOrUpdateAnchor(pointsGroup: IPoint[][], docsLeft: number, docsTop: number) {
        const bounding = this._getAnchorBounding(pointsGroup);
        const { left, top, height } = bounding;

        if (this._anchorShape) {
            this._anchorShape.transformByState({ left: left + docsLeft, top: top + docsTop, height });
            this._anchorShape.show();

            return;
        }

        const anchor = new Rect(TEXT_ANCHOR_KEY_PREFIX + Tools.generateRandomId(ID_LENGTH), {
            left: left + docsLeft,
            top: top + docsTop,
            height,
            strokeWidth: this._style?.strokeWidth || 1,
            stroke: this._style?.stroke || getColor(COLORS.black, 0),
            evented: false,
        });

        this._anchorShape = anchor;

        this._scene.addObject(anchor, 2);
    }

    private _setRangeList(rangeList: ITextSelectionRange[]) {
        if (rangeList.length === 0) {
            return;
        }

        // const firstCursor = cursorList[0];

        this._rangeList = rangeList;
    }
}
