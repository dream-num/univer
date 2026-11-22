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

import type { ICustomRange } from '@univerjs/core';
import type { IDocumentSkeletonDivide, IDocumentSkeletonPage } from '@univerjs/engine-render';
import { getTableIdAndSliceIndex } from '@univerjs/engine-render';
import { DOC_VERTICAL_PADDING } from '../types/const/padding';
import { getDocRangeBorderBoxBottom } from './selection/convert-text-range';

interface ISourceSpan {
    startIndex: number;
    endIndex: number;
    tableIds: readonly string[];
}

interface IHoverLine extends ISourceSpan {
    top: number;
    bottom: number;
}

interface IIndexedRange {
    range: ICustomRange;
    startIndex: number;
    endIndex: number;
    order: number;
}

export interface IDocHoverRangeGeometry {
    lines: IHoverLine[];
    bottomThroughLine: number[];
    unbounded: ISourceSpan[];
    ranges: IIndexedRange[];
    endThroughRange: number[];
}

function getVerticalDivideBounds(divide: IDocumentSkeletonDivide, top: number): [number, number] {
    // Selection projects each glyph's logical X edges onto the cell's physical Y axis.
    const origin = top + divide.left + divide.paddingLeft;
    let first = Number.POSITIVE_INFINITY;
    let last = Number.NEGATIVE_INFINITY;
    for (const { left, width } of divide.glyphGroup) {
        first = Math.min(first, origin + left, origin + left + width);
        last = Math.max(last, origin + left, origin + left + width);
    }
    return [first, last];
}

export function buildDocHoverRangeGeometry(
    root: IDocumentSkeletonPage,
    docsTop: number,
    ranges: readonly ICustomRange[]
): IDocHoverRangeGeometry {
    const lines: IHoverLine[] = [];
    const unbounded: ISourceSpan[] = [];

    const collect = (page: IDocumentSkeletonPage, pageTop: number, tableIds: readonly string[], unboundedAncestor = false): void => {
        const vertical = page.cellTextDirection === 'tbRlV';
        for (const section of page.sections) {
            for (const column of section.columns) {
                const verticalTop = pageTop - page.marginTop + page.marginLeft + column.left + docsTop;
                for (const line of column.lines) {
                    const lineTop = pageTop + section.top + (line.top + line.marginTop);
                    const lineStart = lineTop + docsTop;
                    const lineEnd = getDocRangeBorderBoxBottom(line, lineTop) + docsTop;
                    for (const divide of line.divides) {
                        if (divide.glyphGroup.length === 0) {
                            continue;
                        }
                        const span = { startIndex: divide.st, endIndex: divide.ed, tableIds };
                        const [start, end] = vertical ? getVerticalDivideBounds(divide, verticalTop) : [lineStart, lineEnd];
                        if (unboundedAncestor || !Number.isFinite(start) || !Number.isFinite(end)) {
                            unbounded.push(span);
                        } else {
                            lines.push({ ...span, top: Math.min(start, end), bottom: Math.max(start, end) });
                        }
                    }
                }
            }
        }

        // Use the text origin, including overflowing and vertically merged
        // cells. The table frame is too small for some selection rectangles.
        for (const [id, table] of page.skeTables) {
            const cellTableIds = [...tableIds, getTableIdAndSliceIndex(id).tableId];
            for (const row of table.rows) {
                for (const cell of row.cells) {
                    collect(cell, pageTop + (table.top + row.top) + cell.marginTop, cellTableIds, unboundedAncestor || vertical);
                }
            }
        }
        for (const group of page.skeColumnGroups.values()) {
            for (const column of group.columns) {
                // Nested groups use their own selection page path.
                collect(column.page, pageTop + (group.top + column.top) + column.page.marginTop, tableIds, unboundedAncestor || vertical || page !== root);
            }
        }
    };

    collect(root, root.marginTop, []);
    lines.sort((left, right) => left.top - right.top);
    let bottom = Number.NEGATIVE_INFINITY;
    const bottomThroughLine = lines.map((line) => {
        bottom = Math.max(bottom, line.bottom);
        return bottom;
    });
    const indexedRanges = ranges.map((range, order) => ({
        range,
        startIndex: range.startIndex,
        endIndex: range.endIndex,
        order,
    })).sort((left, right) => left.startIndex - right.startIndex);
    let end = Number.NEGATIVE_INFINITY;
    const endThroughRange = indexedRanges.map((range) => {
        end = Math.max(end, range.endIndex);
        return end;
    });
    return { lines, bottomThroughLine, unbounded, ranges: indexedRanges, endThroughRange };
}

// Cumulative endpoints keep earlier, overlapping entries searchable even when
// an item ends after those that follow it.
function findFirstIntersectingEnd(ends: readonly number[], start: number): number {
    let first = 0;
    let end = ends.length;
    while (first < end) {
        const middle = (first + end) >>> 1;
        if (ends[middle] < start) {
            first = middle + 1;
        } else {
            end = middle;
        }
    }
    return first;
}

export function findDocHoverRangeCandidates(
    geometry: IDocHoverRangeGeometry,
    top: number,
    bottom: number
): { candidates: ICustomRange[]; tableIds: Set<string> } {
    const { lines, bottomThroughLine, unbounded, ranges, endThroughRange } = geometry;
    const paddedTop = top - DOC_VERTICAL_PADDING;
    const paddedBottom = bottom + DOC_VERTICAL_PADDING;
    const matching = new Set<IIndexedRange>();
    const tableIds = new Set<string>();
    const addSpan = (span: ISourceSpan) => {
        for (let index = findFirstIntersectingEnd(endThroughRange, span.startIndex);
            index < ranges.length && ranges[index].startIndex <= span.endIndex; index++) {
            const range = ranges[index];
            if (range.endIndex >= span.startIndex) {
                matching.add(range);
            }
        }
        span.tableIds.forEach((id) => tableIds.add(id));
    };

    unbounded.forEach(addSpan);
    const first = findFirstIntersectingEnd(bottomThroughLine, paddedTop);
    for (let index = first; index < lines.length && lines[index].top <= paddedBottom; index++) {
        if (lines[index].bottom >= paddedTop) {
            addSpan(lines[index]);
        }
    }

    // Hit order follows the document's custom ranges, including nested ranges.
    const candidates = Array.from(matching).sort((left, right) => left.order - right.order).map(({ range }) => range);
    return { candidates, tableIds };
}
