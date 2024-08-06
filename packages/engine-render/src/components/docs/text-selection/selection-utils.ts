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

import type { Nullable } from '@univerjs/core';
import type { IDocumentSkeletonGlyph, INodePosition, ITextSelectionStyle } from '../../../basics';
import { RANGE_DIRECTION } from '../../../basics';
import { getOffsetRectForDom } from '../../../basics/position';
import type { DocumentSkeleton } from '../layout/doc-skeleton';
import type { Engine } from '../../../engine';
import type { Documents } from '../document';
import type { Scene } from '../../../scene';
import { convertPositionsToRectRanges, type RectRange } from './rect-range';
import { TextRange } from './text-range';
import { isInSameTableCell, isValidRectRange } from './convert-rect-range';

interface IDocRangeList {
    textRanges: TextRange[];
    rectRanges: RectRange[];
}

export function getRangeListFromCharIndex(
    startOffset: number,
    endOffset: number,
    scene: Scene,
    document: Documents,
    skeleton: DocumentSkeleton,
    style: ITextSelectionStyle,
    segmentId: string,
    segmentPage: number
): Nullable<IDocRangeList> {
    const startNodePosition = skeleton.findNodePositionByCharIndex(startOffset, true, segmentId, segmentPage);
    const endNodePosition = skeleton.findNodePositionByCharIndex(endOffset, true, segmentId, segmentPage);

    if (startNodePosition == null || endNodePosition == null) {
        return;
    }

    return getRangeListFromSelection(
        startNodePosition,
        endNodePosition,
        scene,
        document,
        skeleton,
        style,
        segmentId,
        segmentPage
    );
}

export function getRangeListFromSelection(
    anchorPosition: INodePosition,
    focusPosition: INodePosition,
    scene: Scene,
    document: Documents,
    skeleton: DocumentSkeleton,
    style: ITextSelectionStyle,
    segmentId: string,
    segmentPage: number
): Nullable<IDocRangeList> {
    const textRanges: TextRange[] = [];
    const rectRanges: RectRange[] = [];
    const rangeParams: [
        Scene,
        Documents,
        DocumentSkeleton,
        INodePosition,
        INodePosition,
        ITextSelectionStyle,
        string
    ] = [scene, document, skeleton, anchorPosition, focusPosition, style, segmentId];

    // TODO: @JOCS handle NEST table.
    // Handle selection in same table cell.
    if (isInSameTableCell(anchorPosition, focusPosition)) {
        textRanges.push(new TextRange(...rangeParams));

        return {
            textRanges,
            rectRanges,
        };
    }

    // Handle selection in different table cell but in the same table.
    if (isValidRectRange(anchorPosition, focusPosition)) {
        const ranges = convertPositionsToRectRanges(
            ...rangeParams
        );

        rectRanges.push(...ranges);

        return {
            textRanges,
            rectRanges,
        };
    }

    const viewModel = skeleton.getViewModel().getSelfOrHeaderFooterViewModel(segmentId);
    const anchorOffset = skeleton.findCharIndexByPosition(anchorPosition);
    const focusOffset = skeleton.findCharIndexByPosition(focusPosition);

    if (anchorOffset == null || focusOffset == null) {
        return;
    }

    const direction = anchorOffset <= focusOffset ? RANGE_DIRECTION.FORWARD : RANGE_DIRECTION.BACKWARD;

    const startOffset = Math.min(anchorOffset, focusOffset);
    const endOffset = Math.max(anchorOffset, focusOffset);

    let start = startOffset;
    let end = endOffset;

    // TODO: @JOCS handle in header and footer.
    for (const section of viewModel.children) {
        for (const paragraph of section.children) {
            const { startIndex, endIndex, children } = paragraph;
            const table = children[0];

            let endInTable = false;

            if (table) {
                const { startIndex: tableStart, endIndex: tableEnd, children } = table;
                let tableStartPosition = null;
                let tableEndPosition = null;

                const startRow = children.find((row) => row.startIndex <= startOffset && row.endIndex >= startOffset)!;
                const endRow = children.find((row) => row.startIndex <= endOffset && row.endIndex >= endOffset)!;

                if (startOffset > tableStart && startOffset < tableEnd) {
                    tableStartPosition = skeleton.findNodePositionByCharIndex(startRow.startIndex + 2, true, segmentId, segmentPage);
                    tableEndPosition = skeleton.findNodePositionByCharIndex(tableEnd - 4, true, segmentId, segmentPage);
                    start = tableEnd + 1;
                } else if (endOffset > tableStart && endOffset < tableEnd) {
                    tableStartPosition = skeleton.findNodePositionByCharIndex(tableStart + 3, true, segmentId, segmentPage);
                    tableEndPosition = skeleton.findNodePositionByCharIndex(endRow.endIndex - 3, true, segmentId, segmentPage);
                    end = tableStart - 1;

                    endInTable = true;
                } else if (tableStart > startOffset && tableEnd < endOffset) {
                    tableStartPosition = skeleton.findNodePositionByCharIndex(tableStart + 3, true, segmentId, segmentPage);
                    tableEndPosition = skeleton.findNodePositionByCharIndex(tableEnd - 4, true, segmentId, segmentPage);

                    if (start < tableStart - 1) {
                        const sp = skeleton.findNodePositionByCharIndex(start, true, segmentId, segmentPage);
                        const ep = skeleton.findNodePositionByCharIndex(tableStart - 1, true, segmentId, segmentPage);
                        const ap = direction ? sp : ep;
                        const fp = direction ? ep : sp;

                        textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId));
                    }
                    start = tableEnd + 1;
                }

                if (tableStartPosition && tableEndPosition) {
                    const ap = direction ? tableStartPosition : tableEndPosition;
                    const fp = direction ? tableEndPosition : tableStartPosition;

                    rectRanges.push(...convertPositionsToRectRanges(
                        scene,
                        document,
                        skeleton,
                        ap,
                        fp,
                        style,
                        segmentId
                    ));
                }
            }

            if ((end >= startIndex && end <= endIndex) || endInTable) {
                const sp = skeleton.findNodePositionByCharIndex(start, true, segmentId, segmentPage);
                const ep = skeleton.findNodePositionByCharIndex(end, true, segmentId, segmentPage);
                const ap = direction ? sp : ep;
                const fp = direction ? ep : sp;

                textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId));
            }
        }
    }

    return {
        textRanges,
        rectRanges,
    };
}

export function getCanvasOffsetByEngine(engine: Nullable<Engine>) {
    const canvas = engine?.getCanvasElement();

    if (!canvas) {
        return {
            left: 0,
            top: 0,
        };
    }

    const { top, left } = getOffsetRectForDom(canvas);

    return {
        left,
        top,
    };
}

export function getParagraphInfoByGlyph(node: IDocumentSkeletonGlyph) {
    const line = node.parent?.parent;
    const column = line?.parent;

    if (line == null || column == null) {
        return;
    }

    const { paragraphIndex } = line;
    const lines = column.lines.filter((line) => line.paragraphIndex === paragraphIndex);
    let nodeIndex = -1;
    let content = '';
    let hasFound = false;

    for (const line of lines) {
        for (const divide of line.divides) {
            for (const glyph of divide.glyphGroup) {
                if (!hasFound) {
                    nodeIndex += glyph.count;
                }
                if (glyph === node) {
                    hasFound = true;
                }

                content += glyph.count > 0 ? glyph.content : '';
            }
        }
    }

    return {
        st: lines[0].st,
        ed: paragraphIndex,
        content,
        nodeIndex,
    };
}
