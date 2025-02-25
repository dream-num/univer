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

import type { Documents, DocumentSkeleton, Engine, IDocumentSkeletonGlyph, INodePosition, IRectRangeWithStyle, ITextRangeWithStyle, ITextSelectionStyle, Scene } from '@univerjs/engine-render';
import type { IDocRange } from './range-interface';
import { type Nullable, RANGE_DIRECTION, Tools } from '@univerjs/core';
import { getOffsetRectForDom } from '@univerjs/engine-render';
import { isInSameTableCell, isInSameTableCellData, isValidRectRange } from './convert-rect-range';
import { convertPositionsToRectRanges, RectRange } from './rect-range';
import { TextRange } from './text-range';

interface IDocRangeList {
    textRanges: TextRange[];
    rectRanges: RectRange[];
}

export function getTextRangeFromCharIndex(
    startOffset: number,
    endOffset: number,
    scene: Scene,
    document: Documents,
    skeleton: DocumentSkeleton,
    style: ITextSelectionStyle,
    segmentId: string,
    segmentPage: number,
    startIsBack = true,
    endIsBack = true
): Nullable<TextRange> {
    const startNodePosition = skeleton.findNodePositionByCharIndex(startOffset, startIsBack, segmentId, segmentPage);
    const endNodePosition = skeleton.findNodePositionByCharIndex(endOffset, endIsBack, segmentId, segmentPage);

    if (startNodePosition == null || endNodePosition == null) {
        return;
    }

    return new TextRange(scene, document, skeleton, startNodePosition, endNodePosition, style, segmentId, segmentPage);
}

export function getRectRangeFromCharIndex(
    startOffset: number,
    endOffset: number,
    scene: Scene,
    document: Documents,
    skeleton: DocumentSkeleton,
    style: ITextSelectionStyle,
    segmentId: string,
    segmentPage: number
): Nullable<RectRange> {
    const startNodePosition = skeleton.findNodePositionByCharIndex(startOffset, true, segmentId, segmentPage);
    const endNodePosition = skeleton.findNodePositionByCharIndex(endOffset, true, segmentId, segmentPage);

    if (startNodePosition == null || endNodePosition == null) {
        return;
    }

    return new RectRange(scene, document, skeleton, startNodePosition, endNodePosition, style, segmentId, segmentPage);
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

// eslint-disable-next-line max-lines-per-function, complexity
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
        string,
        number
    ] = [scene, document, skeleton, anchorPosition, focusPosition, style, segmentId, segmentPage];

    // TODO: @JOCS handle NEST table.
    // Handle selection in same table cell.
    if (isInSameTableCellData(skeleton, anchorPosition, focusPosition)) {
        // Table cell in one page.
        if (isInSameTableCell(anchorPosition, focusPosition)) {
            textRanges.push(new TextRange(...rangeParams));

            return {
                textRanges,
                rectRanges,
            };
        } else {
            const ranges = convertPositionsToRectRanges(
                ...rangeParams
            );

            rectRanges.push(...ranges);

            return {
                textRanges,
                rectRanges,
            };
        }
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
    for (const section of viewModel.getChildren()) {
        for (const paragraph of section.children) {
            const { startIndex, endIndex, children } = paragraph;
            const paragraphIndex = section.children.indexOf(paragraph);
            const nextParagraph = section.children[paragraphIndex + 1];
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

                    if (start <= tableStart - 1) {
                        const sp = skeleton.findNodePositionByCharIndex(start, true, segmentId, segmentPage);
                        const ep = skeleton.findNodePositionByCharIndex(tableStart - 1, false, segmentId, segmentPage);
                        const ap = direction === RANGE_DIRECTION.FORWARD ? sp : ep;
                        const fp = direction === RANGE_DIRECTION.FORWARD ? ep : sp;

                        textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId, segmentPage));
                    }

                    start = tableEnd + 1;
                }

                if (tableStartPosition && tableEndPosition) {
                    const ap = direction === RANGE_DIRECTION.FORWARD ? tableStartPosition : tableEndPosition;
                    const fp = direction === RANGE_DIRECTION.FORWARD ? tableEndPosition : tableStartPosition;

                    rectRanges.push(...convertPositionsToRectRanges(
                        scene,
                        document,
                        skeleton,
                        ap,
                        fp,
                        style,
                        segmentId,
                        segmentPage
                    ));
                }
            }

            // TO fix https://github.com/dream-num/univer-pro/issues/3437.
            if (end === endIndex + 1 && !endInTable && nextParagraph && nextParagraph.children.length) {
                end = endIndex;
                endInTable = true;
            }

            if ((end >= startIndex && end <= endIndex) || endInTable) {
                const sp = skeleton.findNodePositionByCharIndex(start, true, segmentId, segmentPage);
                const ep = skeleton.findNodePositionByCharIndex(end, !endInTable, segmentId, segmentPage);
                const ap = direction === RANGE_DIRECTION.FORWARD ? sp : ep;
                const fp = direction === RANGE_DIRECTION.FORWARD ? ep : sp;

                // Can not create cursor(startOffset === endOffset) and rect range at the same time.
                if (rectRanges.length && Tools.diffValue(ap, fp)) {
                    continue;
                }

                textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId, segmentPage));
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

export function serializeTextRange(textRange: IDocRange): ITextRangeWithStyle {
    const { startOffset, endOffset, collapsed, rangeType, startNodePosition, endNodePosition, direction, segmentId, segmentPage } = textRange;
    const serializedTextRange: ITextRangeWithStyle = {
        startOffset: startOffset!,
        endOffset: endOffset!,
        collapsed,
        rangeType,
        startNodePosition,
        endNodePosition,
        direction,
        segmentId,
        segmentPage,
        isActive: textRange.isActive(),
    };

    return serializedTextRange;
}

export function serializeRectRange(rectRange: RectRange): IRectRangeWithStyle {
    const serializedTextRange = serializeTextRange(rectRange);

    const {
        startRow,
        startColumn,
        endRow,
        endColumn,
        tableId,
        spanEntireRow,
        spanEntireColumn,
        spanEntireTable,
    } = rectRange;

    return {
        ...serializedTextRange,
        startRow,
        startColumn,
        endRow,
        endColumn,
        tableId,
        spanEntireRow,
        spanEntireColumn,
        spanEntireTable,
    };
}
