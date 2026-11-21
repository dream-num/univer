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
import type { IDocumentSkeletonPage } from '@univerjs/engine-render';
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

export interface IDocHoverRangeGeometry {
    lines: IHoverLine[];
    bottomThroughLine: number[];
    unbounded: ISourceSpan[];
}

export function buildDocHoverRangeGeometry(root: IDocumentSkeletonPage, docsTop: number): IDocHoverRangeGeometry {
    const lines: IHoverLine[] = [];
    const unbounded: ISourceSpan[] = [];

    const collect = (page: IDocumentSkeletonPage, pageTop: number, tableIds: readonly string[], unboundedAncestor = false): void => {
        const hasUnboundedGeometry = unboundedAncestor || page.cellTextDirection === 'tbRlV';
        for (const section of page.sections) {
            for (const column of section.columns) {
                for (const line of column.lines) {
                    const lineTop = pageTop + section.top + (line.top + line.marginTop);
                    const start = lineTop + docsTop;
                    const end = getDocRangeBorderBoxBottom(line, lineTop) + docsTop;
                    for (const divide of line.divides) {
                        if (divide.glyphGroup.length === 0) {
                            continue;
                        }
                        const span = { startIndex: divide.st, endIndex: divide.ed, tableIds };
                        if (hasUnboundedGeometry || !Number.isFinite(start) || !Number.isFinite(end)) {
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
                    collect(cell, pageTop + (table.top + row.top) + cell.marginTop, cellTableIds, hasUnboundedGeometry);
                }
            }
        }
        for (const group of page.skeColumnGroups.values()) {
            for (const column of group.columns) {
                // Nested groups use their own selection page path.
                collect(column.page, pageTop + (group.top + column.top) + column.page.marginTop, tableIds, hasUnboundedGeometry || page !== root);
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
    return { lines, bottomThroughLine, unbounded };
}

export function findDocHoverRangeCandidates(
    geometry: IDocHoverRangeGeometry,
    ranges: readonly ICustomRange[],
    top: number,
    bottom: number
): { candidates: ICustomRange[]; tableIds: Set<string> } {
    const { lines, bottomThroughLine, unbounded } = geometry;
    const paddedTop = top - DOC_VERTICAL_PADDING;
    const paddedBottom = bottom + DOC_VERTICAL_PADDING;
    // A tall or overflowing line can end below a later line. Search cumulative
    // bottoms so a viewport starting inside that earlier line still finds it.
    let first = 0;
    let end = lines.length;
    while (first < end) {
        const middle = (first + end) >>> 1;
        if (bottomThroughLine[middle] < paddedTop) {
            first = middle + 1;
        } else {
            end = middle;
        }
    }
    const visible: ISourceSpan[] = [...unbounded];
    for (let index = first; index < lines.length && lines[index].top <= paddedBottom; index++) {
        if (lines[index].bottom >= paddedTop) {
            visible.push(lines[index]);
        }
    }

    const candidates = ranges.filter((range) =>
        visible.some((line) => range.startIndex <= line.endIndex && range.endIndex >= line.startIndex)
    );
    const tableIds = new Set<string>();
    for (const span of visible) {
        span.tableIds.forEach((id) => tableIds.add(id));
    }
    return { candidates, tableIds };
}
