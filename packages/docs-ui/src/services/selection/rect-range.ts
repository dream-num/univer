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

import type { Nullable } from '@univerjs/core';
import type { Documents, DocumentSkeleton, INodePosition, IPoint, ITextSelectionStyle, Scene } from '@univerjs/engine-render';
import type { IDocRange } from './range-interface';
import { COLORS, DOC_RANGE_TYPE, RANGE_DIRECTION, Rectangle, Tools } from '@univerjs/core';
import { getColor, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RegularPolygon } from '@univerjs/engine-render';
import { compareNodePositionInTable, NodePositionConvertToRectRange } from './convert-rect-range';
import { TEXT_RANGE_LAYER_INDEX } from './text-range';

const RECT_RANGE_KEY_PREFIX = '__DocTableRectRange__';
const ID_LENGTH = 6;

export function convertPositionsToRectRanges(
    scene: Scene,
    document: Documents,
    docSkeleton: DocumentSkeleton,
    anchorNodePosition: INodePosition,
    focusNodePosition: INodePosition,
    style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    segmentId: string = '',
    segmentPage: number = -1
): RectRange[] {
    const documentOffsetConfig = document.getOffsetConfig();
    const convertor = new NodePositionConvertToRectRange(documentOffsetConfig, docSkeleton);
    const nodePositionGroup = convertor.getNodePositionGroup(anchorNodePosition, focusNodePosition);

    return (nodePositionGroup ?? []).map((position) => new RectRange(
        scene,
        document,
        docSkeleton,
        position.anchor,
        position.focus,
        style,
        segmentId,
        segmentPage
    ));
}

export class RectRange implements IDocRange {
    public rangeType: DOC_RANGE_TYPE = DOC_RANGE_TYPE.RECT;
    // The rendered rect range
    private _rangeShape: Nullable<RegularPolygon>;
    // Identifies whether the range is the current one, most of which is the last range.
    private _current = false;
    // Rect Range start row.
    private _startRow: number;
    // Rect Range start column.
    private _startCol: number;
    // Rect Range end row.
    private _endRow: number;
    // Rect Range end column.
    private _endCol: number;
    // table id in view model.
    private _tableId: string;

    constructor(
        private _scene: Scene,
        private _document: Documents,
        private _docSkeleton: DocumentSkeleton,
        public anchorNodePosition: INodePosition,
        public focusNodePosition: INodePosition,
        public style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
        private _segmentId: string = '',
        private _segmentPage: number = -1
    ) {
        this.refresh();
    }

    get startOffset(): Nullable<number> {
        const { startNodePosition } = this;

        return this._docSkeleton.findCharIndexByPosition(startNodePosition);
    }

    get endOffset(): Nullable<number> {
        const { endNodePosition } = this;

        return this._docSkeleton.findCharIndexByPosition(endNodePosition);
    }

    get collapsed(): boolean {
        return false;
    }

    get startRow() {
        return this._startRow;
    }

    get startColumn() {
        return this._startCol;
    }

    get endRow() {
        return this._endRow;
    }

    get endColumn() {
        return this._endCol;
    }

    get tableId() {
        return this._tableId;
    }

    get segmentId() {
        return this._segmentId;
    }

    get segmentPage() {
        return this._segmentPage;
    }

    get spanEntireRow(): boolean {
        const viewModel = this._docSkeleton.getViewModel();
        const table = viewModel.getSnapshot().tableSource?.[this._tableId];
        const { _startCol, _endCol } = this;
        if (table == null) {
            throw new Error('Table is not found.');
        }

        const { tableColumns } = table;

        return _startCol === 0 && _endCol === tableColumns.length - 1;
    }

    get spanEntireColumn(): boolean {
        const viewModel = this._docSkeleton.getViewModel();
        const table = viewModel.getSnapshot().tableSource?.[this._tableId];
        const { _startRow, _endRow } = this;
        if (table == null) {
            throw new Error('Table is not found.');
        }

        const { tableRows } = table;

        return _startRow === 0 && _endRow === tableRows.length - 1;
    }

    get spanEntireTable(): boolean {
        return this.spanEntireRow && this.spanEntireColumn;
    }

    get startNodePosition(): INodePosition {
        const { anchorNodePosition, focusNodePosition } = this;
        const compare = compareNodePositionInTable(anchorNodePosition, focusNodePosition);

        return compare ? anchorNodePosition : focusNodePosition;
    }

    get endNodePosition(): INodePosition {
        const { anchorNodePosition, focusNodePosition } = this;
        const compare = compareNodePositionInTable(anchorNodePosition, focusNodePosition);

        return compare ? focusNodePosition : anchorNodePosition;
    }

    get direction(): RANGE_DIRECTION {
        const { anchorNodePosition, focusNodePosition } = this;
        const compare = compareNodePositionInTable(anchorNodePosition, focusNodePosition);

        return compare ? RANGE_DIRECTION.FORWARD : RANGE_DIRECTION.BACKWARD;
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

    dispose(): void {
        this._rangeShape?.dispose();
        this._rangeShape = null;
    }

    isIntersection(compareRange: RectRange) {
        const { startRow, startColumn, endRow, endColumn } = this;
        const { startRow: cStartRow, startColumn: cStartColumn, endRow: cEndRow, endColumn: cEndColumn } = compareRange;
        const rect1 = {
            left: startColumn,
            top: startRow,
            right: endColumn,
            bottom: endRow,
        };
        const rect2 = {
            left: cStartColumn,
            top: cStartRow,
            right: cEndColumn,
            bottom: cEndRow,
        };

        return Rectangle.hasIntersectionBetweenTwoRect(rect1, rect2);
    }

    refresh(): void {
        this._rangeShape?.hide();

        const { startNodePosition, endNodePosition, _document, _docSkeleton } = this;

        const documentOffsetConfig = _document.getOffsetConfig();

        const { docsLeft, docsTop } = documentOffsetConfig;

        const convertor = new NodePositionConvertToRectRange(documentOffsetConfig, _docSkeleton);

        const rectInfo = convertor.getRangePointData(startNodePosition, endNodePosition);

        if (rectInfo == null) {
            return;
        }

        const { pointGroup = [], startRow, endRow, startColumn, endColumn, tableId } = rectInfo;

        if (pointGroup?.length > 0) {
            this._createOrUpdateRange(pointGroup, docsLeft, docsTop);
        }

        this._updateTableInfo(startRow, endRow, startColumn, endColumn, tableId);
    }

    private _updateTableInfo(startRow: number, endRow: number, startCol: number, endCol: number, tableId: string) {
        this._startRow = startRow;
        this._endRow = endRow;
        this._startCol = startCol;
        this._endCol = endCol;
        this._tableId = tableId;
    }

    private _createOrUpdateRange(pointsGroup: IPoint[][], left: number, top: number) {
        if (this._rangeShape) {
            this._rangeShape.translate(left, top);
            this._rangeShape.updatePointGroup(pointsGroup);
            this._rangeShape.show();

            return;
        }

        const OPACITY = 0.3;
        const polygon = new RegularPolygon(RECT_RANGE_KEY_PREFIX + Tools.generateRandomId(ID_LENGTH), {
            pointsGroup,
            fill: this.style?.fill || getColor(COLORS.black, OPACITY),
            left,
            top,
            evented: false,
            debounceParentDirty: false,
        });

        this._rangeShape = polygon;

        this._scene.addObject(polygon, TEXT_RANGE_LAYER_INDEX);
    }
}
