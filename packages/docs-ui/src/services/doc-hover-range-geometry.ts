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
import type { IDocInterval, IDocIntervalIndex } from './doc-range-interval-index';
import { DOC_VERTICAL_PADDING } from '../types/const/padding';
import { buildDocIntervalIndex, visitDocIntervals } from './doc-range-interval-index';
import { getDocRangeBorderBoxBottom, isDocVerticalTableCell } from './selection/convert-text-range';

interface ISourceSpan {
    startIndex: number;
    endIndex: number;
}

interface IIndexedRange {
    range: ICustomRange;
    order: number;
}

export interface IDocHoverRangeGeometry {
    lines: IDocIntervalIndex<ISourceSpan>;
    unboundedRanges: ReadonlySet<IIndexedRange>;
    ranges: IDocIntervalIndex<IIndexedRange>;
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
    const lines: IDocInterval<ISourceSpan>[] = [];
    const unbounded: ISourceSpan[] = [];

    const collect = (page: IDocumentSkeletonPage, pageTop: number, unboundedAncestor = false): void => {
        const vertical = isDocVerticalTableCell(page);
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
                        const span = { startIndex: divide.st, endIndex: divide.ed };
                        const [start, end] = vertical ? getVerticalDivideBounds(divide, verticalTop) : [lineStart, lineEnd];
                        if (unboundedAncestor || !Number.isFinite(start) || !Number.isFinite(end)) {
                            unbounded.push(span);
                        } else {
                            lines.push({ value: span, start: Math.min(start, end), end: Math.max(start, end) });
                        }
                    }
                }
            }
        }

        // Use the text origin, including overflowing and vertically merged
        // cells. The table frame is too small for some selection rectangles.
        for (const table of page.skeTables.values()) {
            for (const row of table.rows) {
                for (const cell of row.cells) {
                    collect(cell, pageTop + (table.top + row.top) + cell.marginTop, unboundedAncestor || vertical);
                }
            }
        }
        for (const group of page.skeColumnGroups.values()) {
            for (const column of group.columns) {
                // Nested groups use their own selection page path.
                collect(column.page, pageTop + (group.top + column.top) + column.page.marginTop, unboundedAncestor || vertical || page !== root);
            }
        }
    };

    collect(root, root.marginTop);
    const rangeIndex = buildDocIntervalIndex(ranges.map((range, order) => ({
        value: { range, order },
        start: range.startIndex,
        end: range.endIndex,
    })));
    // Unsupported coordinate paths must stay eligible. Map their ranges once,
    // so scrolling never revisits those text fragments.
    const unboundedRanges = new Set<IIndexedRange>();
    for (const span of unbounded) {
        visitDocIntervals(rangeIndex, span.startIndex, span.endIndex, (range) => unboundedRanges.add(range));
    }
    return { lines: buildDocIntervalIndex(lines), unboundedRanges, ranges: rangeIndex };
}

export function findDocHoverRangeCandidates(geometry: IDocHoverRangeGeometry, top: number, bottom: number): ICustomRange[] {
    const { lines, unboundedRanges, ranges } = geometry;
    const matching = new Set(unboundedRanges);
    visitDocIntervals(lines, top - DOC_VERTICAL_PADDING, bottom + DOC_VERTICAL_PADDING, (span) => {
        visitDocIntervals(ranges, span.startIndex, span.endIndex, (range) => matching.add(range));
    });

    // Hit order follows the document's custom ranges, including nested ranges.
    return Array.from(matching).sort((left, right) => left.order - right.order).map(({ range }) => range);
}
