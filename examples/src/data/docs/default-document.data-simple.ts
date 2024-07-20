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

import type { IDocumentData, IParagraph } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';

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
            dataStream += `${TABLE_CELL_START + tables[i][j]}\r${TABLE_CELL_END}`;
        }
        dataStream += TABLE_ROW_END;
    }

    return dataStream + TABLE_END;
}

const exampleTables = [
    ['姓名', '语文', '数学', '英语', '总分'],
    ['张三', '80', '90', '70', '240'],
    ['李四', '80', '90', '70', '240'],
    ['王五', '80', '90', '70', '240'],
    ['赵六', '80', '90', '70', '240'],
];

const dataStream = `这是一个表格的用例\r${createTableDataStream(exampleTables)}班级成绩统计\r\n`;

function createParagraphs(dataStream: string) {
    const paragraphs: IParagraph[] = [];
    for (let i = 0; i < dataStream.length; i++) {
        const char = dataStream[i];
        if (char === '\r') {
            paragraphs.push({
                startIndex: i,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 2,
                    spaceBelow: { v: 0 },
                },
            });
        }
    }

    return paragraphs;
}

const paragraphs = createParagraphs(dataStream);

export const DEFAULT_DOCUMENT_DATA_SIMPLE: IDocumentData = {
    id: 'default-document-id',
    body: {
        dataStream,
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
                ed: dataStream.length - 2,
                ts: {
                    fs: 18,
                    ff: 'Times New Roman',
                    cl: {
                        rgb: 'rgb(30, 30, 30)',
                    },
                    bl: BooleanNumber.FALSE,
                },
            },
        ],
        paragraphs,
        sectionBreaks: [
            {
                startIndex: dataStream.length - 1,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: 595,
            height: 842,
        },
        documentFlavor: DocumentFlavor.TRADITIONAL,
        marginTop: 50,
        marginBottom: 50,
        marginRight: 40,
        marginLeft: 40,
        renderConfig: {
            vertexAngle: 0,
            centerAngle: 0,
        },
    },
};
