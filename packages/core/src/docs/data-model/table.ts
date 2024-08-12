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

import { generateRandomId, Tools } from '../../shared';
import type { IParagraph, ISectionBreak, ITable, ITableCell, ITableColumn, ITableRow } from '../../types/interfaces';
import { ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableCellHeightRule, TableSizeType, TableTextWrapType } from '../../types/interfaces';
import { DataStreamTreeTokenType } from './types';

export function genEmptyTable(rowCount: number, colCount: number) {
    let dataStream: string = DataStreamTreeTokenType.TABLE_START;
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];

    for (let i = 0; i < rowCount; i++) {
        dataStream += DataStreamTreeTokenType.TABLE_ROW_START;

        for (let j = 0; j < colCount; j++) {
            dataStream += `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;
            paragraphs.push({
                startIndex: dataStream.length - 3,
                paragraphStyle: {
                    spaceAbove: { v: 3 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            });
            sectionBreaks.push({
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
