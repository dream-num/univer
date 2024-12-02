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
import { BooleanNumber, DocumentFlavor, HorizontalAlign, ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableRowHeightRule, TableSizeType, TableTextWrapType, Tools, VerticalAlignmentType } from '@univerjs/core';
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
    ['Description', 'Date', 'Location'],
    ['Academic Senate Meeting 1 Academic Senate Meeting 2 Academic Senate Meeting 3 Academic Senate Meeting 4 Academic Senate Meeting 5', 'May 25, 2205', 'Building 99 Room 1'],
    ['Faculty Council', 'June 1, 2205', 'Building 35 Room 5'],
    ['Faculty Council', 'June 15, 2205', 'Building 35 Room 5'],
    ['Faculty Council', 'June 30, 2205', 'Building 35 Room 5'],
    ['Commencement Meeting	', 'December 15, 2205', 'Building 42 Room 10'],
    ['Dean\'s Council', 'February 1, 2206', 'Building 35 Room 5'],
    ['Faculty Council', 'March 1, 2206', 'Building 35 Room 5'],
];

const title = 'Examples of Accessible Data Tables\r';
const description = 'Basic Data Table with Column Headings\r';
const summary = 'These example tables contain captions and summaries. When you copy any of these tables into your page you must edit the caption and summary. The caption can be edited in the Design view but the summary text must be edited in Code view. Click inside the table, then select the table tag on the tag selector, then switch to Code view and edit the text in the summary attribute.\r';
const tableStream = createTableDataStream(exampleTables);

const dataStream = `${title}${description}${tableStream}${summary}\n`;

const startIndex = dataStream.indexOf(TABLE_START);
const endIndex = tableStream.length + startIndex;

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

function createTextRuns() {
    const textRuns = [];
    let offset = 0;

    textRuns.push({
        st: offset,
        ed: offset + title.length,
        ts: {
            fs: 16,
            ff: 'Helvetica Neue',
            cl: {
                rgb: '#154734',
            },
            bl: BooleanNumber.TRUE,
            ul: {
                s: BooleanNumber.TRUE,
            },
        },
    });

    offset += title.length;

    textRuns.push({
        st: offset,
        ed: offset + description.length,
        ts: {
            fs: 12,
            ff: 'Helvetica Neue',
            cl: {
                rgb: '#54585a',
            },
            bl: BooleanNumber.FALSE,
        },
    });

    offset += description.length;

    textRuns.push({
        st: offset,
        ed: offset + tableStream.length,
        ts: {
            fs: 11,
            ff: 'Helvetica Neue',
            cl: {
                rgb: '#54585a',
            },
            bl: BooleanNumber.TRUE,
        },
    });

    offset += tableStream.length;

    textRuns.push({
        st: offset,
        ed: offset + summary.length,
        ts: {
            fs: 12,
            ff: 'Helvetica Neue',
            cl: {
                rgb: '#54585a',
            },
            bl: BooleanNumber.FALSE,
        },
    });

    return textRuns;
}

const { paragraphs, sectionBreaks } = createParagraphAndSectionBreaks(dataStream);

const tableCell: ITableCell = {
    rowSpan: 1,
    columnSpan: 1,
    vAlign: VerticalAlignmentType.TOP,
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
        val: { v: 50 },
        hRule: TableRowHeightRule.AUTO,
    },
    cantSplit: BooleanNumber.TRUE,
};

const tableColumn: ITableColumn = {
    size: {
        type: TableSizeType.SPECIFIED,
        width: {
            v: 100,
        },
    },
};

const tableRows: ITableRow[] = [...new Array(exampleTables.length).fill(null).map((_, i) => {
    return {
        ...Tools.deepClone(tableRow),
        isFirstRow: i === 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
        repeatHeaderRow: i === 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
    };
})];
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
    textWrap: TableTextWrapType.WRAP,
    position: {
        positionH: {
            relativeFrom: ObjectRelativeFromH.PAGE,
            posOffset: 100,
        },
        positionV: {
            relativeFrom: ObjectRelativeFromV.PAGE,
            posOffset: 600,
        },
    },
    dist: {
        distB: 5,
        distL: 5,
        distR: 10,
        distT: 5,
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
        textRuns: createTextRuns(),
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
        autoHyphenation: BooleanNumber.TRUE,
        consecutiveHyphenLimit: 3,
        doNotHyphenateCaps: BooleanNumber.TRUE,
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
