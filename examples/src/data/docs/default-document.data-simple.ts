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

import type { IDocumentData, IParagraph, ISectionBreak, ITable, ITableCell, ITableColumn, ITableRow } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor, HorizontalAlign, ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableCellHeightRule, TableSizeType, TableTextWrapType, Tools } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';

const TABLE_START = '\x1A'; // 表格开始
const TABLE_ROW_START = '\x1B'; // 表格行开始
const TABLE_CELL_START = '\x1C'; // 表格单元格开始
const TABLE_CELL_END = '\x1D'; // 表格单元格结束
const TABLE_ROW_END = '\x0E'; // 表格行结束
const TABLE_END = '\x0F'; // 表格结束

function createTableDataStream(tables: string[][]) {
    const row = tables.length;
    const col = tables[0].length;
    let dataStream = TABLE_START;

    for (let i = 0; i < row; i++) {
        dataStream += TABLE_ROW_START;
        for (let j = 0; j < col; j++) {
            dataStream += `${TABLE_CELL_START + tables[i][j]}\r\n${TABLE_CELL_END}`;
        }
        dataStream += TABLE_ROW_END;
    }

    return dataStream + TABLE_END;
}

const exampleTables = [
    ['姓名\r这是一个段落\r这是二个段落\r这是三个段落\r这是四个段落', '语文', '数学', '英语', '总分'],
    ['张三', '80', '90', '70', '240'],
    ['李四', '80', '90', '70', '240'],
    ['王五', '80', '90', '70', '240'],
    ['赵六', '80', '90', '70', '240'],
];

const dataStream = `这是一个表格的用例\r${createTableDataStream(exampleTables)}班级成绩统计\r\n`;

const startIndex = dataStream.indexOf(TABLE_START);
const endIndex = dataStream.indexOf(TABLE_END);

function createParagraphAndSectionBreaks(dataStream: string) {
    const paragraphs: IParagraph[] = [];
    const sectionBreaks: ISectionBreak[] = [];
    for (let i = 0; i < dataStream.length; i++) {
        const char = dataStream[i];
        if (char === '\r') {
            paragraphs.push({
                startIndex: i,
                paragraphStyle: {
                    spaceAbove: { v: 5 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                    horizontalAlign: HorizontalAlign.LEFT,
                },
            });
        }

        if (char === '\n') {
            sectionBreaks.push({
                startIndex: i,
            });
        }
    }

    return { paragraphs, sectionBreaks };
}

const { paragraphs, sectionBreaks } = createParagraphAndSectionBreaks(dataStream);

const tableCell: ITableCell = {
    rowSpan: 1,
    columnSpan: 1,
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

const tableRow: ITableRow = {
    tableCells: [...new Array(exampleTables[0].length).fill(Tools.deepClone(tableCell))],
    trHeight: {
        val: { v: 30 },
        hRule: TableCellHeightRule.AUTO,
    },
};

const tableColumn: ITableColumn = {
    size: {
        type: TableSizeType.SPECIFIED,
        width: {
            v: 100,
        },
    },
};

const tableRows = [...new Array(exampleTables.length).fill(null).map(() => Tools.deepClone(tableRow))];
const tableColumns = [...new Array(exampleTables[0].length).fill(null).map(() => Tools.deepClone(tableColumn))];

tableColumns[0].size.width.v = 250;

const table: ITable = {
    tableRows,
    tableColumns,
    tableId: 'table-id',
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
            v: 1000,
        },
    },
};

export const DEFAULT_DOCUMENT_DATA_SIMPLE: IDocumentData = {
    id: 'default-document-id',
    tableSource: {
        'table-id': table,
    },
    headers: {},
    footers: {},
    drawings: {},
    drawingsOrder: [],
    body: {
        dataStream,
        customBlocks: [],
        textRuns: [
            {
                st: 0,
                ed: 9,
                ts: {
                    fs: 24,
                    ff: 'Microsoft YaHei',
                    cl: {
                        rgb: 'rgb(0, 0, 0)',
                    },
                    bl: BooleanNumber.TRUE,
                    ul: {
                        s: BooleanNumber.TRUE,
                    },
                },
            },
            {
                st: 9,
                ed: 12,
                ts: {
                    fs: 14,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
            {
                st: 13,
                ed: 15,
                ts: {
                    fs: 14,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(130, 30, 30)',
                    },
                    bl: BooleanNumber.TRUE,
                },
            },
            {
                st: 16,
                ed: dataStream.length - 2,
                ts: {
                    fs: 14,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
        ],
        paragraphs,
        tables: [{
            startIndex,
            endIndex,
            tableId: 'table-id',
        }],
        sectionBreaks,
    },
    documentStyle: {
        pageSize: {
            width: ptToPixel(595),
            height: ptToPixel(842),
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: ptToPixel(50),
        marginBottom: ptToPixel(50),
        marginRight: ptToPixel(50),
        marginLeft: ptToPixel(50),
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
        defaultHeaderId: '',
        defaultFooterId: '',
        evenPageHeaderId: '',
        evenPageFooterId: '',
        firstPageHeaderId: '',
        firstPageFooterId: '',
        evenAndOddHeaders: BooleanNumber.FALSE,
        useFirstPageHeaderFooter: BooleanNumber.FALSE,
        marginHeader: 30,
        marginFooter: 30,
    },
};
