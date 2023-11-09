import { ITextRange, Nullable, Tools } from '@univerjs/core';

import { COLORS } from '../../../basics/const';
import { INodePosition } from '../../../basics/interfaces';
import {
    ITextRangeWithStyle,
    ITextSelectionStyle,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    RANGE_DIRECTION,
} from '../../../basics/range';
import { getColor } from '../../../basics/tools';
import { IPoint } from '../../../basics/vector2';
import { Scene } from '../../../scene';
import { Rect } from '../../../shape/rect';
import { RegularPolygon } from '../../../shape/regular-polygon';
import { ThinScene } from '../../../thin-scene';
import { DocumentSkeleton } from '../doc-skeleton';
import { IDocumentOffsetConfig } from '../document';
import {
    compareNodePosition,
    compareNodePositionLogic,
    getOneTextSelectionRange,
    NodePositionConvertToCursor,
    NodePositionMap,
} from './convert-cursor';

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

    private _cursorList: ITextRange[] = [];

    constructor(
        private _scene: ThinScene,
        private _documentOffsetConfig: IDocumentOffsetConfig,
        private _docSkeleton: DocumentSkeleton,
        public anchorNodePosition?: Nullable<INodePosition>,
        public focusNodePosition?: Nullable<INodePosition>,
        private _style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE
    ) {}

    // The start position of the range
    get startOffset() {
        const { startOffset } = getOneTextSelectionRange(this._cursorList) ?? {};

        return startOffset;
    }

    // The end position of the range
    get endOffset() {
        const { endOffset } = getOneTextSelectionRange(this._cursorList) ?? {};

        return endOffset;
    }

    get collapsed() {
        const { startOffset, endOffset } = this;

        return startOffset != null && startOffset === endOffset;
    }

    get startNodePosition() {
        if (this.anchorNodePosition == null) {
            return null;
        }

        if (this.focusNodePosition == null) {
            return this.anchorNodePosition;
        }

        const { start } = compareNodePosition(this.anchorNodePosition, this.focusNodePosition);

        return start;
    }

    get endNodePosition() {
        if (this.anchorNodePosition == null) {
            return this.focusNodePosition;
        }

        if (this.focusNodePosition == null) {
            return null;
        }

        const { end } = compareNodePosition(this.anchorNodePosition, this.focusNodePosition);

        return end;
    }

    get direction() {
        const { collapsed, anchorNodePosition, focusNodePosition } = this;

        if (collapsed || anchorNodePosition == null || focusNodePosition == null) {
            return RANGE_DIRECTION.NONE;
        }

        const compare = compareNodePositionLogic(anchorNodePosition, focusNodePosition);

        return compare ? RANGE_DIRECTION.FORWARD : RANGE_DIRECTION.BACKWARD;
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

        if (activeStart == null || activeEnd == null || compareStart == null || compareEnd == null) {
            return false;
        }

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

            this._setCursorList(cursorList);
            pointGroup.length > 0 && this._createOrUpdateAnchor(pointGroup, docsLeft, docsTop);

            return;
        }

        const { pointGroup, cursorList } = convertor.getRangePointData(anchor, focus);

        this._setCursorList(cursorList);

        pointGroup.length > 0 && this._createOrUpdateRange(pointGroup, docsLeft, docsTop);
    }

    private _isEmpty() {
        return this.anchorNodePosition == null && this.focusNodePosition == null;
    }

    private _isCollapsed() {
        const anchor = this.anchorNodePosition;
        const focus = this.focusNodePosition;

        if (anchor != null && focus == null) {
            return true;
        }

        if (anchor == null || focus == null) {
            return false;
        }

        const keys = Object.keys(NodePositionMap);

        for (const key of keys) {
            const startNodeValue = anchor[key as keyof INodePosition] as number;
            const endNodeValue = focus[key as keyof INodePosition] as number;

            if (startNodeValue !== endNodeValue) {
                return false;
            }
        }

        if (anchor.isBack !== focus.isBack) {
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

    private _setCursorList(cursorList: ITextRange[]) {
        if (cursorList.length === 0) {
            return;
        }

        this._cursorList = cursorList;
    }
}
