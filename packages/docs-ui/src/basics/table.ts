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

import { DocumentSkeletonPageType, getLastLine, lineIterator } from '@univerjs/engine-render';
import type { Nullable } from '@univerjs/core';
import type { IDocumentSkeletonCached, IDocumentSkeletonLine, IDocumentSkeletonPage, IDocumentSkeletonRow, IDocumentSkeletonTable } from '@univerjs/engine-render';

export function firstLineInTable(table: IDocumentSkeletonTable) {
    const firstRow = table.rows[0];
    const firstCell = firstRow.cells[0];
    const firstLine = firstCell.sections[0].columns[0].lines[0];

    return firstLine;
}

export function lastLineInTable(table: IDocumentSkeletonTable) {
    const lastRow = table.rows[table.rows.length - 1];
    const lastCell = lastRow.cells[lastRow.cells.length - 1];
    const lastLine = getLastLine(lastCell);

    return lastLine;
}

export function findTableAfterLine(line: IDocumentSkeletonLine, page: IDocumentSkeletonPage) {
    const { ed } = line;
    const { skeTables } = page;

    let table = null;

    for (const t of skeTables.values()) {
        if (t.st === ed + 1) {
            table = t;
            break;
        }
    }

    return table;
}

export function findLineBeforeAndAfterTable(table: Nullable<IDocumentSkeletonTable>) {
    const tablePage = table?.parent as IDocumentSkeletonPage;
    let lineBeforeTable = null;
    let lineAfterTable = null;

    if (table == null || tablePage == null) {
        return {
            lineBeforeTable,
            lineAfterTable,
        };
    }

    const { st, ed } = table;

    const pages = tablePage.type === DocumentSkeletonPageType.CELL ? [tablePage] : (tablePage.parent as IDocumentSkeletonCached).pages;

    lineIterator(pages, (l) => {
        if (l.st === ed + 1) {
            lineAfterTable = l;
        } else if (l.ed === st - 1) {
            lineBeforeTable = l;
        }
    });

    return {
        lineBeforeTable,
        lineAfterTable,
    };
}

export function findBellowCell(cell: IDocumentSkeletonPage) {
    const row = cell.parent as IDocumentSkeletonRow;
    const table = row?.parent as IDocumentSkeletonTable;

    if (row == null || table == null) {
        return;
    }

    const bellowRow = table.rows[table.rows.indexOf(row) + 1];

    if (bellowRow == null) {
        return;
    }

    const col = row.cells.indexOf(cell);

    return bellowRow.cells[col];
}

export function findAboveCell(cell: IDocumentSkeletonPage) {
    const row = cell.parent as IDocumentSkeletonRow;
    const table = row?.parent as IDocumentSkeletonTable;

    if (row == null || table == null) {
        return;
    }

    const aboveRow = table.rows[table.rows.indexOf(row) - 1];

    if (aboveRow == null) {
        return;
    }

    const col = row.cells.indexOf(cell);

    return aboveRow.cells[col];
}

export function findTableBeforeLine(line: IDocumentSkeletonLine, page: IDocumentSkeletonPage) {
    const { st } = line;
    const { skeTables } = page;

    let table = null;

    for (const t of skeTables.values()) {
        if (t.ed === st - 1) {
            table = t;
            break;
        }
    }

    return table;
}

export function firstLineInCell(cell: IDocumentSkeletonPage) {
    const firstLine = cell.sections[0].columns[0].lines[0];

    return firstLine;
}

export function lastLineInCell(cell: IDocumentSkeletonPage) {
    const lastLine = getLastLine(cell);

    return lastLine;
}

export function isFirstLineInCell(line: IDocumentSkeletonLine, cell: IDocumentSkeletonPage) {
    const firstLine = firstLineInCell(cell);

    return line === firstLine;
}

export function isLastLineInCell(line: IDocumentSkeletonLine, cell: IDocumentSkeletonPage) {
    const lastLine = lastLineInCell(cell);

    return line === lastLine;
}
