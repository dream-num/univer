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

import type { IDocumentData, ITable } from '@univerjs/core';
import {
    DocStyleType,
    NumberUnitType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    getTableCellSpacing,
    getTableCellSpacingInsets,
    hasTableCellSpacing,
    resolveTableCellSpacing,
} from '../table-cell-spacing';

function table(): ITable {
    return {
        tableId: 'spacing',
        align: TableAlignmentType.START,
        indent: { v: 0 },
        textWrap: TableTextWrapType.NONE,
        position: { positionH: { relativeFrom: ObjectRelativeFromH.PAGE }, positionV: { relativeFrom: ObjectRelativeFromV.PAGE } },
        dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
        size: { type: TableSizeType.SPECIFIED, width: { v: 200 } },
        tableColumns: [100, 100].map((width) => ({ size: { type: TableSizeType.SPECIFIED, width: { v: width } } })),
        tableRows: [0, 1].map(() => ({ trHeight: { hRule: TableRowHeightRule.AUTO, val: { v: 0 } }, tableCells: [{}, {}] })),
    };
}

describe('table cell spacing', () => {
    it('resolves editable table-style inheritance and direct zero without changing authored data', () => {
        const source = table();
        source.styleId = 'Derived';
        const document: Partial<IDocumentData> = { styles: {
            Base: { name: 'Base', type: DocStyleType.table, tableProperties: { cellSpacing: { v: 6 } }, rowProperties: { cellSpacing: { v: 3 } } },
            Derived: { name: 'Derived', type: DocStyleType.table, basedOn: 'Base' },
        } };
        source.tableRows[1].cellSpacing = { v: 0 };
        const before = JSON.stringify({ source, document });
        const resolved = resolveTableCellSpacing(source, document);
        expect(resolved.cellSpacing).toEqual({ v: 6 });
        expect(resolved.tableRows.map((_, row) => getTableCellSpacing(resolved, row))).toEqual([3, 0]);
        expect(JSON.stringify({ source, document })).toBe(before);
        document.styles!.Base.rowProperties!.cellSpacing = { v: 4 };
        expect(getTableCellSpacing(resolveTableCellSpacing(source, document), 0)).toBe(4);
        delete document.styles!.Base.rowProperties;
        source.tableRows[0].defaultCellSpacing = { v: 2 };
        expect(getTableCellSpacing(resolveTableCellSpacing(source, document), 0)).toBe(2);
        document.styles!.Base.basedOn = 'Derived';
        expect(resolveTableCellSpacing(source, document).cellSpacing).toEqual({ v: 6 });
    });

    it('distinguishes absence from explicit zero and uses the current default table style', () => {
        const source = table();
        expect(hasTableCellSpacing(source)).toBe(false);
        const resolved = resolveTableCellSpacing(source, {
            documentStyle: { defaultTableStyleId: 'Zero' },
            styles: { Zero: { name: 'Zero', type: DocStyleType.table, tableProperties: { cellSpacing: { v: 0 } } } },
        });
        expect(hasTableCellSpacing(resolved)).toBe(true);
        expect(getTableCellSpacing(resolved, 0)).toBe(0);
        expect(source.cellSpacing).toBeUndefined();
        source.cellSpacing = { v: 8, u: NumberUnitType.PERCENT };
        expect(getTableCellSpacing(source, 0)).toBe(0);
        source.cellSpacing = { v: -1 };
        expect(getTableCellSpacing(source, 0)).toBeUndefined();
    });

    it('reserves outer and internal gaps independently of the cell text margins', () => {
        const source = table();
        source.cellSpacing = { v: 6 };
        expect(getTableCellSpacingInsets(source, 0, 0)).toEqual({ left: 12, right: 6, top: 6, bottom: 6 });
        expect(getTableCellSpacingInsets(source, 0, 1)).toEqual({ left: 6, right: 12, top: 6, bottom: 6 });
        source.tableRows[0].tableCells = [{ columnSpan: 2 }, { columnSpan: 0 }];
        expect(getTableCellSpacingInsets(source, 0, 0)).toEqual({ left: 12, right: 12, top: 6, bottom: 6 });
        source.tableRows[1].gridBefore = 1;
        expect(getTableCellSpacingInsets(source, 1, 0).left).toBe(6);
        source.tableRows[0].tableCells[0].rowSpan = 2;
        source.tableRows[1].cellSpacing = { v: 0 };
        expect(getTableCellSpacingInsets(source, 0, 0)).toEqual({ left: 12, right: 12, top: 6, bottom: 0 });
    });

    it.each([undefined, 0, 6])('keeps each separated top border outside its own padding (spacing: %s)', (spacing) => {
        const source = table();
        source.cellSpacing = spacing == null ? undefined : { v: spacing };
        source.cellMargin = { top: { v: 1 }, bottom: { v: 1 }, start: { v: 1 }, end: { v: 1 } };
        source.tableRows[0].tableCells = [3, 0].map((top) => ({
            margin: { top: { v: top }, bottom: { v: 0 }, start: { v: 1 }, end: { v: 1 } },
            borderTop: { width: { v: 2 }, color: { rgb: '#000000' } },
            borderBottom: { width: { v: 2 }, color: { rgb: '#000000' } },
        }));
        const before = JSON.stringify(source);
        // Word COM994/995: content shares the row's 3px top padding, while the
        // zero-padding cell's top border starts 3px below its neighbour.
        expect([0, 1].map((column) => getTableCellSpacingInsets(source, 0, column).top))
            .toEqual(spacing == null ? [0, 0] : [spacing + 1, spacing + 4]);
        expect([0, 1].map((column) => getTableCellSpacingInsets(source, 0, column).bottom))
            .toEqual(spacing == null ? [0, 0] : [spacing + 1, spacing + 1]);
        expect(JSON.stringify(source)).toBe(before);
    });
});
