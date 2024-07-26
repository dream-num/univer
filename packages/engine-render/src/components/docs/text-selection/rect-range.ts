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

import { COLORS, type Nullable, Tools } from '@univerjs/core';
import type { INodePosition, IPoint, ITextSelectionStyle } from '../../../basics';
import { getColor, NORMAL_TEXT_SELECTION_PLUGIN_STYLE, RANGE_DIRECTION } from '../../../basics';
import type { ThinScene } from '../../../thin-scene';
import type { Documents } from '../document';
import type { DocumentSkeleton } from '../layout/doc-skeleton';
import { RegularPolygon } from '../../../shape';
import type { IDocRange } from './range-interface';
import { DOC_RANGE_TYPE } from './range-interface';
import { compareNodePositionInTable, NodePositionConvertToRectRange } from './convert-rect-range';
import { TEXT_RANGE_LAYER_INDEX } from './text-range';

const RECT_RANGE_KEY_PREFIX = '__DocTableRectRange__';
const ID_LENGTH = 6;

export function convertPositionsToRectRanges(
    scene: ThinScene,
    document: Documents,
    docSkeleton: DocumentSkeleton,
    anchorNodePosition: INodePosition,
    focusNodePosition: INodePosition,
    style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    segmentId: string = ''
): RectRange[] {
    const documentOffsetConfig = document.getOffsetConfig();
    const convertor = new NodePositionConvertToRectRange(documentOffsetConfig, docSkeleton);
    const nodePositionGroup = convertor.getNodePositionGroup(anchorNodePosition, focusNodePosition);

    return (nodePositionGroup ?? []).map((position) => new RectRange(
        scene, document, docSkeleton, position.anchor, position.focus, style, segmentId
    ));
}

export class RectRange implements IDocRange {
    public rangeType: DOC_RANGE_TYPE = DOC_RANGE_TYPE.RECT;
    // The rendered rect range
    private _rangeShape: Nullable<RegularPolygon>;
    // Identifies whether the range is the current one, most of which is the last range.
    private _current = false;

    constructor(
        private _scene: ThinScene,
        private _document: Documents,
        private _docSkeleton: DocumentSkeleton,
        public anchorNodePosition: INodePosition,
        public focusNodePosition: INodePosition,
        public style: ITextSelectionStyle = NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
        private _segmentId: string = ''
    ) {
        this.refresh();
    }

    get startOffset(): Nullable<number> {
        // TODO: Implement this.
        return null;
    }

    get endOffset(): Nullable<number> {
        // TODO: Implement this.
        return null;
    }

    get collapsed(): boolean {
        return false;
    }

    get spanEntireRow(): boolean {
        // TODO: Implement this.
        return true;
    }

    get spanEntireColumn(): boolean {
        // TODO: Implement this.
        return true;
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

    refresh(): void {
        this._rangeShape?.hide();

        const { startNodePosition, endNodePosition, _document, _docSkeleton } = this;

        const documentOffsetConfig = _document.getOffsetConfig();

        const { docsLeft, docsTop } = documentOffsetConfig;

        const convertor = new NodePositionConvertToRectRange(documentOffsetConfig, _docSkeleton);

        const { pointGroup = [] } = convertor.getRangePointData(startNodePosition, endNodePosition) ?? {};

        if (pointGroup?.length > 0) {
            this._createOrUpdateRange(pointGroup, docsLeft, docsTop);
        }
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
