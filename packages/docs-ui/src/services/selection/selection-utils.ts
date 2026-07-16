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
import type {
    DataStreamTreeNode,
    Documents,
    DocumentSkeleton,
    Engine,
    IDocumentSkeletonGlyph,
    INodePosition,
    IRectRangeWithStyle,
    ITextRangeWithStyle,
    ITextSelectionStyle,
    Scene,
} from '@univerjs/engine-render';
import type { IDocRange } from './range-interface';
import { DataStreamTreeNodeType, RANGE_DIRECTION, Tools } from '@univerjs/core';
import { DocumentSkeletonPageType, getDocumentSkeletonColumnPagePathInfo, getOffsetRectForDom } from '@univerjs/engine-render';
import { isInSameTableCell, isInSameTableCellData, isValidRectRange } from './convert-rect-range';
import { compareNodePosition } from './convert-text-range';
import { convertPositionsToRectRanges, RectRange } from './rect-range';
import { TextRange } from './text-range';

interface IDocRangeList {
    textRanges: TextRange[];
    rectRanges: RectRange[];
}

function disposeRangeList({ textRanges, rectRanges }: IDocRangeList) {
    textRanges.forEach((range) => range.dispose());
    rectRanges.forEach((range) => range.dispose());
}

function isCompatibleTextRange(start: Nullable<INodePosition>, end: Nullable<INodePosition>) {
    if (start == null || end == null || start.pageType !== end.pageType) {
        return false;
    }

    if (
        (start.pageType === DocumentSkeletonPageType.HEADER || start.pageType === DocumentSkeletonPageType.FOOTER) &&
        start.segmentPage !== end.segmentPage
    ) {
        return false;
    }

    const startColumn = getDocumentSkeletonColumnPagePathInfo(start);
    const endColumn = getDocumentSkeletonColumnPagePathInfo(end);

    if (startColumn == null || endColumn == null) {
        return startColumn == null && endColumn == null;
    }

    return startColumn.pageIndex === endColumn.pageIndex &&
        startColumn.columnGroupId === endColumn.columnGroupId &&
        startColumn.columnIndex === endColumn.columnIndex;
}

function getDescendantTables(node: DataStreamTreeNode): DataStreamTreeNode[] {
    if (node.nodeType === DataStreamTreeNodeType.TABLE) {
        return [node];
    }

    return node.children.flatMap(getDescendantTables);
}

function isInSameColumnPage(anchorPosition: INodePosition, focusPosition: INodePosition): boolean {
    const anchorColumnInfo = getDocumentSkeletonColumnPagePathInfo(anchorPosition);
    const focusColumnInfo = getDocumentSkeletonColumnPagePathInfo(focusPosition);

    const anchorPageIndex = anchorPosition.path?.indexOf('page') ?? -1;
    const focusPageIndex = focusPosition.path?.indexOf('page') ?? -1;

    return anchorPageIndex >= 0 &&
        focusPageIndex >= 0 &&
        anchorPageIndex === anchorPosition.path!.length - 1 &&
        focusPageIndex === focusPosition.path!.length - 1 &&
        !!anchorColumnInfo && !!focusColumnInfo &&
        anchorColumnInfo.pageIndex === focusColumnInfo.pageIndex &&
        anchorColumnInfo.columnGroupId === focusColumnInfo.columnGroupId &&
        anchorColumnInfo.columnIndex === focusColumnInfo.columnIndex;
}

function getColumnInputBoundaryCollapsedPosition(
    anchorPosition: INodePosition,
    focusPosition: INodePosition,
    skeleton: DocumentSkeleton
): Nullable<INodePosition> {
    const anchorColumnInfo = getDocumentSkeletonColumnPagePathInfo(anchorPosition);
    const focusColumnInfo = getDocumentSkeletonColumnPagePathInfo(focusPosition);

    if (
        !anchorColumnInfo ||
        !focusColumnInfo ||
        anchorColumnInfo.pageIndex !== focusColumnInfo.pageIndex ||
        anchorColumnInfo.columnGroupId !== focusColumnInfo.columnGroupId ||
        anchorColumnInfo.columnIndex + 1 !== focusColumnInfo.columnIndex
    ) {
        return;
    }

    const anchorOffset = skeleton.findCharIndexByPosition(anchorPosition);
    const focusOffset = skeleton.findCharIndexByPosition(focusPosition);

    if (anchorOffset == null || focusOffset == null || anchorOffset <= focusOffset) {
        return;
    }

    return anchorPosition;
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

    const collapsedColumnPosition = getColumnInputBoundaryCollapsedPosition(anchorPosition, focusPosition, skeleton);

    if (collapsedColumnPosition) {
        textRanges.push(new TextRange(scene, document, skeleton, collapsedColumnPosition, collapsedColumnPosition, style, segmentId, segmentPage));

        return {
            textRanges,
            rectRanges,
        };
    }

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

    if (isInSameColumnPage(anchorPosition, focusPosition)) {
        textRanges.push(new TextRange(...rangeParams));

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
    const originRange = compareNodePosition(anchorPosition, focusPosition);

    const findStartNodePositionByCharIndex = (charIndex: number, isBack: boolean = true) =>
        skeleton.findNodePositionByCharIndex(charIndex, isBack, segmentId, segmentPage) ??
        (charIndex === startOffset ? originRange.start : undefined);

    const findEndNodePositionByCharIndex = (charIndex: number, isBack: boolean = true) =>
        skeleton.findNodePositionByCharIndex(charIndex, isBack, segmentId, segmentPage) ??
        (charIndex === endOffset ? originRange.end : undefined);

    const appendTextRange = (rangeStart: number, rangeEnd: number, endIsBack = true) => {
        if (rangeStart > rangeEnd) {
            return true;
        }

        const sp = findStartNodePositionByCharIndex(rangeStart, true);
        const ep = findEndNodePositionByCharIndex(rangeEnd, endIsBack);
        const ap = direction === RANGE_DIRECTION.FORWARD ? sp : ep;
        const fp = direction === RANGE_DIRECTION.FORWARD ? ep : sp;
        if (!isCompatibleTextRange(ap, fp)) {
            return false;
        }

        textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId, segmentPage));
        return true;
    };

    const appendTableRange = (table: DataStreamTreeNode, rangeStart: number, rangeEnd: number) => {
        const { startIndex: tableStart, endIndex: tableEnd, children: rows } = table;
        const startRow = rows.find((row) => row.startIndex <= rangeStart && row.endIndex >= rangeStart);
        const endRow = rows.find((row) => row.startIndex <= rangeEnd && row.endIndex >= rangeEnd);
        const tableStartOffset = rangeStart > tableStart && rangeStart < tableEnd
            ? startRow?.startIndex == null ? undefined : startRow.startIndex + 2
            : tableStart + 3;
        const tableEndOffset = rangeEnd > tableStart && rangeEnd < tableEnd
            ? endRow?.endIndex == null ? undefined : endRow.endIndex - 3
            : tableEnd - 4;

        if (tableStartOffset == null || tableEndOffset == null) {
            return false;
        }

        const startPosition = skeleton.findNodePositionByCharIndex(tableStartOffset, true, segmentId, segmentPage);
        const endPosition = skeleton.findNodePositionByCharIndex(tableEndOffset, true, segmentId, segmentPage);
        if (startPosition == null || endPosition == null) {
            return false;
        }

        const ap = direction === RANGE_DIRECTION.FORWARD ? startPosition : endPosition;
        const fp = direction === RANGE_DIRECTION.FORWARD ? endPosition : startPosition;
        rectRanges.push(...convertPositionsToRectRanges(scene, document, skeleton, ap, fp, style, segmentId, segmentPage));
        return true;
    };

    const appendColumnRanges = (column: DataStreamTreeNode, rangeStart: number, rangeEnd: number) => {
        let offset = rangeStart;
        const tables = getDescendantTables(column).sort((left, right) => left.startIndex - right.startIndex);

        for (const table of tables) {
            if (table.endIndex < rangeStart || table.startIndex > rangeEnd) {
                continue;
            }

            if (!appendTextRange(offset, Math.min(rangeEnd, table.startIndex - 1), false) ||
                !appendTableRange(table, Math.max(rangeStart, table.startIndex), Math.min(rangeEnd, table.endIndex))) {
                return false;
            }
            offset = table.endIndex + 1;
        }

        return appendTextRange(offset, rangeEnd);
    };

    let start = startOffset;
    let end = endOffset;

    try {
        // TODO: @JOCS handle in header and footer.
        for (const section of viewModel.getChildren()) {
            for (const paragraph of section.children) {
                const { startIndex, endIndex, children } = paragraph;

                if (paragraph.nodeType === DataStreamTreeNodeType.COLUMN_GROUP && start <= endIndex && end >= startIndex) {
                    if (start < startIndex && !appendTextRange(start, Math.min(end, startIndex - 1), false)) {
                        disposeRangeList({ textRanges, rectRanges });
                        return;
                    }

                    for (const column of children.filter((child) => child.nodeType === DataStreamTreeNodeType.COLUMN)) {
                        const columnStart = Math.max(start, column.startIndex + 1);
                        const columnEnd = Math.min(end, column.endIndex - 1);
                        if (columnStart <= columnEnd && !appendColumnRanges(column, columnStart, columnEnd)) {
                            disposeRangeList({ textRanges, rectRanges });
                            return;
                        }
                    }

                    start = endIndex + 1;
                    continue;
                }

                const paragraphIndex = section.children.indexOf(paragraph);
                const nextParagraph = section.children[paragraphIndex + 1];
                const table = children.find((child) => child.nodeType === DataStreamTreeNodeType.TABLE);
                const nextTable = nextParagraph?.children.find((child) => child.nodeType === DataStreamTreeNodeType.TABLE);

                let endInTable = false;

                if (table) {
                    const { startIndex: tableStart, endIndex: tableEnd, children } = table;
                    let tableStartPosition = null;
                    let tableEndPosition = null;

                    if (startOffset > tableStart && startOffset < tableEnd) {
                        const startRow = children.find((row) => row.startIndex <= startOffset && row.endIndex >= startOffset);
                        if (startRow == null) {
                            disposeRangeList({ textRanges, rectRanges });
                            return;
                        }

                        tableStartPosition = skeleton.findNodePositionByCharIndex(startRow.startIndex + 2, true, segmentId, segmentPage);
                        tableEndPosition = skeleton.findNodePositionByCharIndex(tableEnd - 4, true, segmentId, segmentPage);
                        start = tableEnd + 1;
                    } else if (endOffset > tableStart && endOffset < tableEnd) {
                        const endRow = children.find((row) => row.startIndex <= endOffset && row.endIndex >= endOffset);
                        if (endRow == null) {
                            disposeRangeList({ textRanges, rectRanges });
                            return;
                        }

                        tableStartPosition = skeleton.findNodePositionByCharIndex(tableStart + 3, true, segmentId, segmentPage);
                        tableEndPosition = skeleton.findNodePositionByCharIndex(endRow.endIndex - 3, true, segmentId, segmentPage);
                        end = tableStart - 1;

                        endInTable = true;
                    } else if (tableStart > startOffset && tableEnd < endOffset) {
                        tableStartPosition = skeleton.findNodePositionByCharIndex(tableStart + 3, true, segmentId, segmentPage);
                        tableEndPosition = skeleton.findNodePositionByCharIndex(tableEnd - 4, true, segmentId, segmentPage);

                        if (start <= tableStart - 1) {
                            const sp = findStartNodePositionByCharIndex(start, true);
                            const ep = findEndNodePositionByCharIndex(tableStart - 1, false);
                            const ap = direction === RANGE_DIRECTION.FORWARD ? sp : ep;
                            const fp = direction === RANGE_DIRECTION.FORWARD ? ep : sp;

                            if (!isCompatibleTextRange(ap, fp)) {
                                disposeRangeList({ textRanges, rectRanges });
                                return;
                            }

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
                if (end === endIndex + 1 && !endInTable && nextTable) {
                    end = endIndex;
                    endInTable = true;
                }

                if ((end >= startIndex && end <= endIndex) || endInTable) {
                    const sp = findStartNodePositionByCharIndex(start, true);
                    const ep = findEndNodePositionByCharIndex(end, !endInTable);
                    const ap = direction === RANGE_DIRECTION.FORWARD ? sp : ep;
                    const fp = direction === RANGE_DIRECTION.FORWARD ? ep : sp;

                // Can not create cursor(startOffset === endOffset) and rect range at the same time.
                    if (rectRanges.length && Tools.diffValue(ap, fp)) {
                        continue;
                    }

                    if (!isCompatibleTextRange(ap, fp)) {
                        disposeRangeList({ textRanges, rectRanges });
                        return;
                    }

                    textRanges.push(new TextRange(scene, document, skeleton, ap, fp, style, segmentId, segmentPage));
                }
            }
        }

        return {
            textRanges,
            rectRanges,
        };
    } catch (error) {
        disposeRangeList({ textRanges, rectRanges });
        throw error;
    }
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
