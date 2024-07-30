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

import type { IParagraph, ISectionBreak, ITable, ITableCell, ITableColumn, ITableRow, Nullable } from '@univerjs/core';
import { DataStreamTreeTokenType, generateRandomId, ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableCellHeightRule, TableSizeType, TableTextWrapType, Tools } from '@univerjs/core';
import type { DataStreamTreeNode, DocumentViewModel, RectRange, TextRange } from '@univerjs/engine-render';

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

    for (let i = 0; i < rowCount; i++) {
        dataStream += DataStreamTreeTokenType.TABLE_ROW_START;

        for (let j = 0; j < colCount; j++) {
            dataStream += `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
            paragraphs.push({
                startIndex: dataStream.length - 2,
                paragraphStyle: {
                    spaceAbove: { v: 3 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            });
            sectionBreaks.push({
                startIndex: dataStream.length - 1,
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
            hRule: TableCellHeightRule.AUTO,
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

export function getRangeInfoFromRanges(textRange: Nullable<TextRange>, rectRanges: Readonly<Nullable<RectRange[]>>): Nullable<IRangeInfo> {
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

export function getInsertRowBody(col: number) {
    let dataStream: string = DataStreamTreeTokenType.TABLE_ROW_START;
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];

    for (let i = 0; i < col; i++) {
        dataStream += `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
        paragraphs.push({
            startIndex: dataStream.length - 2,
            paragraphStyle: {
                spaceAbove: { v: 3 },
                lineSpacing: 2,
                spaceBelow: { v: 0 },
            },
        });
        sectionBreaks.push({
            startIndex: dataStream.length - 1,
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
        paragraphStyle: {
            spaceAbove: { v: 3 },
            lineSpacing: 2,
            spaceBelow: { v: 0 },
        },
    });
    sectionBreaks.push({
        startIndex: 2,
    });

    return {
        dataStream,
        paragraphs,
        sectionBreaks,
    };
}

export function getInsertRowActionsParams(rangeInfo: IRangeInfo, position: INSERT_ROW_POSITION, viewModel: DocumentViewModel) {
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);
    const index = position === INSERT_ROW_POSITION.ABOVE ? startOffset : endOffset;

    let tableRow = null;
    const tableId = viewModel.getBody()?.tables?.find((t) => index >= t.startIndex && index <= t.endIndex)?.tableId;
    let rowIndex = 0;

    // TODO: handle nested tables
    for (const section of vm.children) {
        for (const paragraph of section.children) {
            const { children } = paragraph;
            const table = children[0];

            if (table) {
                for (const row of table.children) {
                    if (row.startIndex <= index && index <= row.endIndex) {
                        rowIndex = table.children.indexOf(row);
                        tableRow = row;
                        break;
                    }
                }
            }

            if (tableRow) {
                break;
            }
        }

        if (tableRow) {
            break;
        }
    }

    if (tableRow == null || tableId == null) {
        return null;
    }

    return {
        offset: position === INSERT_ROW_POSITION.ABOVE ? tableRow.startIndex : tableRow.endIndex + 1,
        colCount: tableRow.children.length,
        tableId,
        insertRowIndex: position === INSERT_ROW_POSITION.ABOVE ? rowIndex : rowIndex + 1,
    };
}

export function getInsertColumnActionsParams(rangeInfo: IRangeInfo, position: INSERT_COLUMN_POSITION, viewModel: DocumentViewModel) {
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);
    const index = position === INSERT_COLUMN_POSITION.LEFT ? startOffset : endOffset;

    const tableId = viewModel.getBody()?.tables?.find((t) => index >= t.startIndex && index <= t.endIndex)?.tableId;
    const offsets: number[] = [];
    let table: Nullable<DataStreamTreeNode> = null;
    let columnIndex = -1;

    for (const section of vm.children) {
        for (const paragraph of section.children) {
            const { children } = paragraph;
            const tableNode = children[0];

            if (tableNode) {
                if (index < tableNode.startIndex || index > tableNode.endIndex) {
                    continue;
                }

                table = tableNode;

                for (const row of tableNode.children) {
                    for (const cell of row.children) {
                        const cellIndex = row.children.indexOf(cell);

                        if (index >= cell.startIndex && index <= cell.endIndex) {
                            columnIndex = position === INSERT_COLUMN_POSITION.LEFT ? cellIndex : cellIndex + 1;
                            break;
                        }
                    }

                    if (columnIndex !== -1) {
                        break;
                    }
                }
            }

            if (table) {
                break;
            }
        }

        if (table) {
            break;
        }
    }

    if (table == null || tableId == null || columnIndex === -1) {
        return null;
    }

    let cursor = 0;

    for (const row of table.children) {
        const cell = row.children[columnIndex];
        offsets.push(cell.startIndex - cursor);

        cursor = cell.startIndex;
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
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);
    const tableId = viewModel.getBody()?.tables?.find((t) => startOffset >= t.startIndex && endOffset <= t.endIndex)?.tableId;
    const rowIndexes: number[] = [];
    let offset = -1;
    let len = 0;
    let cursor = -1;

    for (const section of vm.children) {
        for (const paragraph of section.children) {
            const { children } = paragraph;
            const table = children[0];

            if (table) {
                if (startOffset < table.startIndex || endOffset > table.endIndex) {
                    continue;
                }

                cursor = table.startIndex + 3;

                for (const row of table.children) {
                    const rowIndex = table.children.indexOf(row);
                    const { startIndex, endIndex } = row;

                    if (startOffset >= startIndex && startOffset <= endIndex) {
                        offset = startIndex;
                        rowIndexes.push(rowIndex);
                        len += endIndex - startIndex + 1;
                    } else if (startIndex > startOffset && endIndex < endOffset) {
                        rowIndexes.push(rowIndex);
                        len += endIndex - startIndex + 1;
                    } else if (endOffset >= startIndex && endOffset <= endIndex) {
                        rowIndexes.push(rowIndex);
                        len += endIndex - startIndex + 1;
                    }
                }
            }

            if (rowIndexes.length) {
                break;
            }
        }

        if (rowIndexes.length) {
            break;
        }
    }

    if (tableId == null || rowIndexes.length === 0) {
        return null;
    }

    return {
        tableId,
        rowIndexes,
        offset,
        len,
        cursor,
    };
}

interface IDeleteColumnsOffset {
    retain: number;
    delete: number;
}

export function getDeleteColumnsActionParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);

    const tableId = viewModel.getBody()?.tables?.find((t) => startOffset >= t.startIndex && endOffset <= t.endIndex)?.tableId;
    const offsets: IDeleteColumnsOffset[] = [];
    let table: Nullable<DataStreamTreeNode> = null;
    const columnIndexes: number[] = [];
    let cursor = -1;
    let startColumnIndex = -1;
    let endColumnIndex = -1;

    for (const section of vm.children) {
        for (const paragraph of section.children) {
            const { children } = paragraph;
            const tableNode = children[0];

            if (tableNode) {
                if (startOffset < tableNode.startIndex || endOffset > tableNode.endIndex) {
                    continue;
                }

                table = tableNode;

                for (const row of tableNode.children) {
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
            }

            if (table) {
                break;
            }
        }

        if (table) {
            break;
        }
    }

    if (table == null || tableId == null) {
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
        rowCount: table.children.length,
    };
}

export function getDeleteTableActionParams(rangeInfo: IRangeInfo, viewModel: DocumentViewModel) {
    const { startOffset, endOffset, segmentId } = rangeInfo;
    const vm = viewModel.getSelfOrHeaderFooterViewModel(segmentId);

    const tableId = viewModel.getBody()?.tables?.find((t) => startOffset >= t.startIndex && endOffset <= t.endIndex)?.tableId;
    let offset = -1;
    let len = 0;
    let cursor = -1;

    for (const section of vm.children) {
        for (const paragraph of section.children) {
            const { children } = paragraph;
            const table = children[0];

            if (table) {
                if (startOffset < table.startIndex || endOffset > table.endIndex) {
                    continue;
                }

                offset = table.startIndex;
                len = table.endIndex - table.startIndex + 1;
                cursor = table.startIndex;
            }

            if (table) {
                break;
            }
        }

        if (len > 0) {
            break;
        }
    }

    if (tableId == null) {
        return null;
    }

    return {
        tableId,
        offset,
        len,
        cursor,
    };
}
