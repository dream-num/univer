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

import type { ICustomTable, IParagraph, ISectionBreak, ITable, ITableCell, ITableColumn, ITableRow, Nullable } from '@univerjs/core';
import type { DocumentViewModel, ITextRangeWithStyle } from '@univerjs/engine-render';
import { createParagraphId, createSectionId, DataStreamTreeTokenType, generateRandomId, ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableRowHeightRule, TableSizeType, TableTextWrapType, Tools } from '@univerjs/core';

export enum INSERT_ROW_POSITION {
    ABOVE,
    BELLOW,
}

export enum INSERT_COLUMN_POSITION {
    LEFT,
    RIGHT,
}

export function genEmptyTable(rowCount: number, colCount: number) {
    let dataStream: string = DataStreamTreeTokenType.TABLE_START;
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];
    const existingParagraphIds = new Set<string>();
    const existingSectionIds = new Set<string>();

    for (let i = 0; i < rowCount; i++) {
        dataStream += DataStreamTreeTokenType.TABLE_ROW_START;

        for (let j = 0; j < colCount; j++) {
            dataStream += `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
            paragraphs.push({
                startIndex: dataStream.length - 3,
                paragraphId: createParagraphId(existingParagraphIds),
                paragraphStyle: {
                    spaceAbove: { v: 3 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            });
            sectionBreaks.push({
                sectionId: createSectionId(existingSectionIds),
                startIndex: dataStream.length - 2,
            });
        }

        dataStream += DataStreamTreeTokenType.TABLE_ROW_END;
    }

    dataStream += DataStreamTreeTokenType.TABLE_END;

    return {
        dataStream,
        paragraphs,
        sectionBreaks,
    };
}

export function getEmptyTableCell() {
    const tableCell: ITableCell = {
        margin: {
            start: {
                v: 10,
            },
            end: {
                v: 10,
            },
            top: {
                v: 5,
            },
            bottom: {
                v: 5,
            },
        },
    };

    return tableCell;
}

export function getEmptyTableRow(col: number) {
    const tableCell = getEmptyTableCell();
    const tableRow: ITableRow = {
        tableCells: [...new Array(col).fill(null).map(() => Tools.deepClone(tableCell))],
        trHeight: {
            val: { v: 30 },
            hRule: TableRowHeightRule.AUTO,
        },
    };

    return tableRow;
}

export function getTableColumn(width: number) {
    const tableColumn: ITableColumn = {
        size: {
            type: TableSizeType.SPECIFIED,
            width: {
                v: width,
            },
        },
    };

    return tableColumn;
}

export function genTableSource(rowCount: number, colCount: number, pageContentWidth: number) {
    const tableColumn: ITableColumn = getTableColumn(pageContentWidth / colCount);
    const tableRow = getEmptyTableRow(colCount);
    const tableRows = [...new Array(rowCount).fill(null).map(() => Tools.deepClone(tableRow))];
    const tableColumns = [...new Array(colCount).fill(null).map(() => Tools.deepClone(tableColumn))];
    const tableId = generateRandomId(6);
    const table: ITable = {
        tableRows,
        tableColumns,
        tableId,
        align: TableAlignmentType.START,
        indent: {
            v: 0,
        },
        textWrap: TableTextWrapType.NONE,
        position: {
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: 0,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 0,
            },
        },
        dist: {
            distB: 0,
            distL: 0,
            distR: 0,
            distT: 0,
        },
        cellMargin: {
            start: {
                v: 10,
            },
            end: {
                v: 10,
            },
            top: {
                v: 5,
            },
            bottom: {
                v: 5,
            },
        },
        size: {
            type: TableSizeType.UNSPECIFIED,
            width: {
                v: pageContentWidth,
            },
        },
    };

    return table;
}

interface IRangeInfo {
    startOffset: number;
    endOffset: number;
    segmentId: string;
}

export function getRangeInfoFromRanges(textRange: Nullable<ITextRangeWithStyle>, rectRanges: Readonly<Nullable<ITextRangeWithStyle[]>>): Nullable<IRangeInfo> {
    if (!textRange && !rectRanges) {
        return null;
    }

    if (rectRanges && rectRanges.length > 0) {
        let startOffset = Number.POSITIVE_INFINITY;
        let endOffset = Number.NEGATIVE_INFINITY;
        const segmentId = '';

        for (const rectRange of rectRanges) {
            const { startOffset: st, endOffset: ed, segmentId: sid } = rectRange;

            if (st == null || ed == null || sid == null) {
                continue;
            }
            startOffset = Math.min(startOffset, st);
            endOffset = Math.max(endOffset, ed);
        }

        if (Number.isFinite(startOffset) && Number.isFinite(endOffset)) {
            return {
                startOffset,
                endOffset,
                segmentId,
            };
        }
    } else if (textRange) {
        const { startOffset, endOffset, segmentId } = textRange;
        if (startOffset == null || endOffset == null || segmentId == null) {
            return null;
        }

        return {
            startOffset,
            endOffset,
            segmentId,
        };
    }
}

function getInnermostTable(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);
    const tableRange = vm.getBody()?.tables?.reduce((current, table) =>
        startOffset >= table.startIndex &&
        endOffset <= table.endIndex &&
        (current == null || table.endIndex - table.startIndex < current.endIndex - current.startIndex)
            ? table
            : current, null as Nullable<ICustomTable>);

    if (!tableRange) {
        return null;
    }

    const table = vm.findTableNodeById(tableRange.tableId);
    return table ? { table, tableId: tableRange.tableId } : null;
}

export function getInsertRowBody(col: number) {
    let dataStream: string = DataStreamTreeTokenType.TABLE_ROW_START;
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];
    const existingParagraphIds = new Set<string>();
    const existingSectionIds = new Set<string>();

    for (let i = 0; i < col; i++) {
        dataStream += `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
        paragraphs.push({
            startIndex: dataStream.length - 3,
            paragraphId: createParagraphId(existingParagraphIds),
            paragraphStyle: {
                spaceAbove: { v: 3 },
                lineSpacing: 2,
                spaceBelow: { v: 0 },
            },
        });
        sectionBreaks.push({
            sectionId: createSectionId(existingSectionIds),
            startIndex: dataStream.length - 2,
        });
    }

    dataStream += DataStreamTreeTokenType.TABLE_ROW_END;

    return {
        dataStream,
        paragraphs,
        sectionBreaks,
    };
}

export function getInsertColumnBody() {
    const dataStream = `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];

    paragraphs.push({
        startIndex: 1,
        paragraphId: createParagraphId(new Set()),
        paragraphStyle: {
            spaceAbove: { v: 3 },
            lineSpacing: 2,
            spaceBelow: { v: 0 },
        },
    });
    sectionBreaks.push({
        sectionId: createSectionId(new Set()),
        startIndex: 2,
    });

    return {
        dataStream,
        paragraphs,
        sectionBreaks,
    };
}

export function getInsertRowActionsParams(rangeInfo: IRangeInfo, position: INSERT_ROW_POSITION, viewModel: DocumentViewModel) {
    const { startOffset, endOffset } = rangeInfo;
    const index = position === INSERT_ROW_POSITION.ABOVE ? startOffset : endOffset;
    const target = getInnermostTable(rangeInfo, viewModel);
    const tableRow = target?.table.children.find((row) => row.startIndex <= index && index <= row.endIndex);

    if (!target || !tableRow) {
        return null;
    }
    const { table, tableId } = target;
    const rowIndex = table.children.indexOf(tableRow);

    return {
        offset: position === INSERT_ROW_POSITION.ABOVE ? tableRow.startIndex : tableRow.endIndex + 1,
        colCount: tableRow.children.length,
        tableId,
        insertRowIndex: position === INSERT_ROW_POSITION.ABOVE ? rowIndex : rowIndex + 1,
    };
}

export function getInsertColumnActionsParams(rangeInfo: IRangeInfo, position: INSERT_COLUMN_POSITION, viewModel: DocumentViewModel) {
    const { startOffset, endOffset } = rangeInfo;
    const index = position === INSERT_COLUMN_POSITION.LEFT ? startOffset : endOffset;
    const target = getInnermostTable(rangeInfo, viewModel);
    const offsets: number[] = [];
    let columnIndex = -1;

    if (!target) {
        return null;
    }
    const { table, tableId } = target;
    for (const row of table.children) {
        for (const cell of row.children) {
            if (index >= cell.startIndex && index <= cell.endIndex) {
                columnIndex = row.children.indexOf(cell);
                break;
            }
        }
        if (columnIndex !== -1) {
            break;
        }
    }

    if (columnIndex === -1) {
        return null;
    }

    let cursor = 0;

    for (const row of table.children) {
        const cell = row.children[columnIndex];
        const insertIndex = position === INSERT_COLUMN_POSITION.LEFT ? cell.startIndex : cell.endIndex + 1;
        offsets.push(insertIndex - cursor);

        cursor = insertIndex;
    }

    return {
        offsets,
        tableId,
        columnIndex,
        rowCount: table.children.length,
    };
}

export function getColumnWidths(pageWidth: number, tableColumns: ITableColumn[], insertColumnIndex: number) {
    const widths: number[] = [];
    let newColWidth = tableColumns[insertColumnIndex].size.width.v;
    let totalWidth = 0;

    for (let i = 0; i < tableColumns.length; i++) {
        totalWidth += tableColumns[i].size.width.v;
    }

    totalWidth += newColWidth;

    for (let i = 0; i < tableColumns.length; i++) {
        widths.push((tableColumns[i].size.width.v / totalWidth) * pageWidth);
    }

    newColWidth = (newColWidth / totalWidth) * pageWidth;

    return {
        widths,
        newColWidth,
    };
}

export function getDeleteRowsActionsParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset } = rangeInfo;
    const target = getInnermostTable(rangeInfo, viewModel);
    const rowIndexes: number[] = [];
    let offset = -1;
    let len = 0;
    let cursor = -1;
    let selectWholeTable = false;

    if (!target) {
        return null;
    }
    const { table, tableId } = target;
    cursor = table.startIndex + 3;
    for (const row of table.children) {
        const rowIndex = table.children.indexOf(row);
        const { startIndex: rowStartIndex, endIndex: rowEndIndex } = row;

        if (startOffset >= rowStartIndex && startOffset <= rowEndIndex) {
            offset = rowStartIndex;
            rowIndexes.push(rowIndex);
            len += rowEndIndex - rowStartIndex + 1;
        } else if (rowStartIndex > startOffset && rowEndIndex < endOffset) {
            rowIndexes.push(rowIndex);
            len += rowEndIndex - rowStartIndex + 1;
        } else if (endOffset >= rowStartIndex && endOffset <= rowEndIndex) {
            rowIndexes.push(rowIndex);
            len += rowEndIndex - rowStartIndex + 1;
        }
    }
    selectWholeTable = rowIndexes.length === table.children.length;

    if (rowIndexes.length === 0) {
        return null;
    }

    return {
        tableId,
        rowIndexes,
        offset,
        len,
        cursor,
        selectWholeTable,
    };
}

interface IRetainDeleteOffset {
    retain: number;
    delete: number;
}

export function getDeleteColumnsActionParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset } = rangeInfo;
    const target = getInnermostTable(rangeInfo, viewModel);
    const offsets: IRetainDeleteOffset[] = [];
    const columnIndexes: number[] = [];
    let cursor = -1;
    let startColumnIndex = -1;
    let endColumnIndex = -1;

    if (!target) {
        return null;
    }
    const { table, tableId } = target;
    for (const row of table.children) {
        for (const cell of row.children) {
            const cellIndex = row.children.indexOf(cell);

            if (startOffset >= cell.startIndex && startOffset <= cell.endIndex) {
                startColumnIndex = cellIndex;
            }

            if (endOffset >= cell.startIndex && endOffset <= cell.endIndex) {
                endColumnIndex = cellIndex;
            }
        }
    }

    if (startColumnIndex === -1 || endColumnIndex === -1) {
        return null;
    }

    for (let i = startColumnIndex; i <= endColumnIndex; i++) {
        columnIndexes.push(i);
    }

    let delta = 0;
    for (const row of table.children) {
        const startCell = row.children[startColumnIndex];
        const endCell = row.children[endColumnIndex];

        offsets.push({
            retain: startCell.startIndex - delta,
            delete: endCell.endIndex - startCell.startIndex + 1,
        });

        delta = endCell.endIndex + 1;
    }

    cursor = table.startIndex + 3;

    return {
        offsets,
        tableId,
        columnIndexes,
        cursor,
        selectWholeTable: columnIndexes.length === table.children[0].children.length,
        rowCount: table.children.length,
    };
}

export function getDeleteTableActionParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const target = getInnermostTable(rangeInfo, viewModel);
    if (!target) {
        return null;
    }
    const { table, tableId } = target;

    return {
        tableId,
        offset: table.startIndex,
        len: table.endIndex - table.startIndex + 1,
        cursor: table.startIndex,
    };
}

export function getDeleteRowContentActionParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset } = rangeInfo;
    const target = getInnermostTable(rangeInfo, viewModel);
    const offsets: IRetainDeleteOffset[] = [];
    let cursor = -1;
    let rowIndex = -1;
    let startColumnIndex = -1;
    let endColumnIndex = -1;

    if (!target) {
        return null;
    }
    const { table, tableId } = target;
    for (const row of table.children) {
        const rIndex = table.children.indexOf(row);

        for (const cell of row.children) {
            const cellIndex = row.children.indexOf(cell);

            if (startOffset >= cell.startIndex && startOffset <= cell.endIndex) {
                rowIndex = rIndex;
                startColumnIndex = cellIndex;
            }

            if (endOffset >= cell.startIndex && endOffset <= cell.endIndex) {
                endColumnIndex = cellIndex;
            }
        }
    }

    if (rowIndex === -1) {
        return null;
    }

    const row = table.children[rowIndex];

    for (let i = startColumnIndex; i <= endColumnIndex; i++) {
        const cell = row.children[i];

        offsets.push({
            retain: cell.startIndex + 1,
            delete: cell.endIndex - cell.startIndex - 3,
        });
    }

    cursor = table.startIndex + 3;

    return {
        offsets,
        tableId,
        cursor,
        rowCount: table.children.length,
    };
}

export interface IOffsets {
    startOffset: number;
    endOffset: number;
}

export enum CellPosition {
    NEXT,
    PREV,
}

export function getCellOffsets(viewModel: DocumentViewModel, range: ITextRangeWithStyle, position: CellPosition): Nullable<IOffsets> {
    const { startOffset, endOffset, segmentId = '' } = range;
    const target = getInnermostTable({ startOffset, endOffset, segmentId }, viewModel);
    if (!target) {
        return null;
    }
    const targetTable = target.table;

    let cellIndex = -1;
    let rowIndex = -1;
    let targetRow = null;

    for (const row of targetTable.children) {
        for (const cell of row.children) {
            if (startOffset > cell.startIndex && startOffset < cell.endIndex) {
                cellIndex = row.children.indexOf(cell);
                rowIndex = targetTable.children.indexOf(row);
                targetRow = row;
                break;
            }
        }

        if (cellIndex > -1) {
            break;
        }
    }

    if (cellIndex === -1 || rowIndex === -1 || targetRow == null) {
        return null;
    }

    let newCell = null;

    if (position === CellPosition.NEXT) {
        newCell = targetRow.children[cellIndex + 1];

        if (!newCell) {
            const nextRow = targetTable.children[rowIndex + 1];

            if (nextRow) {
                newCell = nextRow.children[0];
            }
        }
    } else {
        newCell = targetRow.children[cellIndex - 1];

        if (!newCell) {
            const prevRow = targetTable.children[rowIndex - 1];

            if (prevRow) {
                newCell = prevRow.children[prevRow.children.length - 1];
            }
        }
    }

    if (newCell) {
        const { startIndex, endIndex } = newCell;

        return {
            startOffset: startIndex + 1,
            endOffset: endIndex - 2,
        };
    }
}
