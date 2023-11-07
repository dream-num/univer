import { ITextRange, Nullable, Tools } from '@univerjs/core';

import { COLORS } from '../../../Basics/Const';
import { INodePosition } from '../../../Basics/Interfaces';
import { ITextRangeWithStyle, ITextSelectionStyle, NORMAL_TEXT_SELECTION_PLUGIN_STYLE } from '../../../Basics/range';
import { getColor } from '../../../Basics/Tools';
import { IPoint } from '../../../Basics/Vector2';
import { Scene } from '../../../Scene';
import { Rect } from '../../../Shape/Rect';
import { RegularPolygon } from '../../../Shape/RegularPolygon';
import { ThinScene } from '../../../ThinScene';
import { DocumentSkeleton } from '../DocSkeleton';
import { IDocumentOffsetConfig } from '../Document';
import { compareNodePosition, NodePositionConvertToCursor, NodePositionMap } from './convert-cursor';

const TEXT_RANGE_KEY_PREFIX = '__TestSelectionRange__';

const TEXT_ANCHOR_KEY_PREFIX = '__TestSelectionAnchor__';

const ID_LENGTH = 6;

export function cursorConvertToTextRange(
    scene: Scene,
    range: ITextRangeWithStyle,
    docSkeleton: DocumentSkeleton,
    documentOffsetConfig: IDocumentOffsetConfig
): Nullable<TextRange> {
    const { startOffset, endOffset, style = NORMAL_TEXT_SELECTION_PLUGIN_STYLE } = range;

    const anchorNodePosition = docSkeleton.findNodePositionByCharIndex(startOffset);
    const focusNodePosition = startOffset !== endOffset ? docSkeleton.findNodePositionByCharIndex(endOffset) : null;

    const textRange = new TextRange(
        scene,
        documentOffsetConfig,
        docSkeleton,
        anchorNodePosition,
        focusNodePosition,
        style
    );

    textRange.refresh();

    return textRange;
}

export class TextRange {
    // Identifies whether the range is the current one, most of which is the last range.
    private _current = false;
    // The rendered range graphic when collapsed is false
    private _rangeShape: Nullable<RegularPolygon>;
    // The rendered range graphic when collapsed is true
    private _anchorShape: Nullable<Rect>;
    // The start position of the range
    startOffset: number;
    // The end position of the range
    endOffset: number;

    constructor(
        private _scene: ThinScene,
        private _documentOffsetConfig: IDocumentOffsetConfig,
        private _docSkeleton: DocumentSkeleton,
        public anchorNodePosition?: Nullable<INodePosition>,
        public focusNodePosition?: Nullable<INodePosition>,
        private _style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE
    ) {}

    get collapsed() {
        const { startOffset, endOffset } = this;

        return startOffset != null && startOffset === endOffset;
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

    dispose() {
        this._rangeShape?.dispose();
        this._rangeShape = null;
        this._anchorShape?.dispose();
        this._anchorShape = null;
    }

    isIntersection(compareRange: TextRange) {
        const { startOffset: activeStart, endOffset: activeEnd } = this;
        const { startOffset: compareStart, endOffset: compareEnd } = compareRange;

        return activeStart <= compareEnd && activeEnd >= compareStart;
    }

    refresh() {
        const { _documentOffsetConfig, _docSkeleton } = this;
        const anchor = this.anchorNodePosition;
        const focus = this.focusNodePosition;

        this._anchorShape?.hide();
        this._rangeShape?.hide();

        if (this._isEmpty()) {
            return;
        }

        const { docsLeft, docsTop } = _documentOffsetConfig;

        const convertor = new NodePositionConvertToCursor(_documentOffsetConfig, _docSkeleton);

        if (this._isCollapsed()) {
            const { pointGroup, cursorList } = convertor.getRangePointData(anchor, anchor);

            this._setOffsets(cursorList);
            pointGroup.length > 0 && this._createOrUpdateAnchor(pointGroup, docsLeft, docsTop);

            return;
        }

        const { pointGroup, cursorList } = convertor.getRangePointData(anchor, focus);

        this._setOffsets(cursorList);

        pointGroup.length > 0 && this._createOrUpdateRange(pointGroup, docsLeft, docsTop);
    }

    getStart() {
        if (this.anchorNodePosition == null) {
            return null;
        }

        if (this.focusNodePosition == null) {
            return this.anchorNodePosition;
        }

        const { start } = compareNodePosition(this.anchorNodePosition, this.focusNodePosition);

        return start;
    }

    getEnd() {
        if (this.anchorNodePosition == null) {
            return this.focusNodePosition;
        }

        if (this.focusNodePosition == null) {
            return null;
        }

        const { end } = compareNodePosition(this.anchorNodePosition, this.focusNodePosition);

        return end;
    }

    private _isEmpty() {
        return this.anchorNodePosition == null && this.focusNodePosition == null;
    }

    private _isCollapsed() {
        const start = this.anchorNodePosition;
        const end = this.focusNodePosition;

        if (start != null && end == null) {
            return true;
        }

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

    private _setOffsets(cursorList: ITextRange[]) {
        if (cursorList[0] == null) {
            return;
        }

        const { startOffset, endOffset } = cursorList[0];

        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }
}
