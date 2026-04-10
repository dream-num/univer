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

import { describe, expect, it } from 'vitest';
import {
    compareNodePositionInTable,
    isInSameTableCell,
    isInSameTableCellData,
    isValidRectRange,
} from '../convert-rect-range';

function createNodePosition(path: Array<string | number>) {
    return {
        page: 0,
        section: 0,
        column: 0,
        line: 0,
        divide: 0,
        glyph: 0,
        path,
    } as never;
}

describe('selection rect range helpers', () => {
    it('validates rectangle selections across table cells', () => {
        const sameCell = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]);
        const otherCell = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 1]);
        const otherTable = createNodePosition(['pages', 0, 'skeTables', 'table-2#-#0', 'rows', 0, 'cells', 0]);
        const nonTable = createNodePosition(['pages', 0, 'sections', 0]);

        expect(isValidRectRange(sameCell, otherCell)).toBe(true);
        expect(isValidRectRange(sameCell, sameCell)).toBe(false);
        expect(isValidRectRange(sameCell, otherTable)).toBe(false);
        expect(isValidRectRange(sameCell, nonTable)).toBe(false);
        expect(isInSameTableCell(sameCell, createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]))).toBe(true);
        expect(isInSameTableCell(sameCell, otherCell)).toBe(false);
    });

    it('detects same table-cell data across pages and compares table order', () => {
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 1, 'cells', 2]);
        const focus = createNodePosition(['pages', 1, 'skeTables', 'table#-#1', 'rows', 1, 'cells', 2]);

        const anchorCellPage: Record<string, unknown> = {};
        const focusCellPage: Record<string, unknown> = {};
        const anchorRow = { index: 1, cells: [null, null, anchorCellPage] };
        const focusRow = { index: 1, cells: [null, null, focusCellPage] };

        const skeleton = {
            findGlyphByPosition: (position: unknown) => ({
                parent: {
                    parent: {
                        parent: {
                            parent: {
                                parent: position === anchor ? { ...anchorCellPage, parent: anchorRow } : { ...focusCellPage, parent: focusRow },
                            },
                        },
                    },
                },
            }),
        } as never;

        expect(isInSameTableCellData(skeleton, anchor, focus)).toBe(true);
        expect(compareNodePositionInTable(
            createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]),
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 0, 'cells', 0])
        )).toBe(true);
        expect(compareNodePositionInTable(
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 2, 'cells', 1]),
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 2, 'cells', 0])
        )).toBe(false);
    });
});
