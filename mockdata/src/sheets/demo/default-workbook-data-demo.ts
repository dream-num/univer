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

import type { IDataValidationRule, IDocumentData, IWorkbookData } from '@univerjs/core';
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType } from '@univerjs/core';

const richTextDemo: IDocumentData = {
    id: 'd',
    body: {
        dataStream: 'Instructions: ①Project division - Fill in the specific division of labor after the project is disassembled: ②Responsible Person - Enter the responsible person\'s name here: ③Date-The specific execution time of the project (detailed to the date of a certain month), and the gray color block marks the planned real-time time of the division of labor of the project (for example, the specific execution time of [regional scene model arrangement and construction] is the 2 days marked in gray. \r\n',
        textRuns: [
            {
                st: 0,
                ed: 488,
                ts: {
                    cl: {
                        rgb: 'rgb(92,92,92)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 489,
                paragraphStyle: {
                    spaceAbove: { v: 10 },
                    lineSpacing: 1.2,
                },
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

const richTextDemo1: IDocumentData = {
    id: 'd',
    body: {
        dataStream: 'No.2824163\r\n',
        textRuns: [
            {
                st: 0,
                ed: 2,
                ts: {
                    cl: {
                        rgb: '#000',
                    },
                    fs: 20,
                },
            },
            {
                st: 3,
                ed: 10,
                ts: {
                    cl: {
                        rgb: 'rgb(255, 0, 0)',
                    },
                    fs: 20,
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 10,
            },
        ],
    },
    documentStyle: {
        pageSize: {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        },
        marginTop: 0,
        marginBottom: 0,
        marginRight: 2,
        marginLeft: 2,
    },
};

const dataValidation: IDataValidationRule[] = [
    {
        uid: 'xxx-1',
        type: DataValidationType.DECIMAL,
        ranges: [{
            startRow: 0,
            endRow: 5,
            startColumn: 0,
            endColumn: 2,
        }],
        operator: DataValidationOperator.GREATER_THAN,
        formula1: '111',
        errorStyle: DataValidationErrorStyle.STOP,
    },
    {
        uid: 'xxx-0',
        type: DataValidationType.DATE,
        ranges: [{
            startRow: 0,
            endRow: 5,
            startColumn: 3,
            endColumn: 5,
        }],
        operator: DataValidationOperator.LESS_THAN_OR_EQUAL,
        formula1: '2024/04/10',
        formula2: '2024/10/10',
        errorStyle: DataValidationErrorStyle.STOP,
    },
    {
        uid: 'xxx-2',
        type: DataValidationType.CHECKBOX,
        ranges: [{
            startRow: 6,
            endRow: 10,
            startColumn: 0,
            endColumn: 5,
        }],
        formula1: 'TRUE',
        formula2: 'FALSE',
    },
    {
        uid: 'xxx-3',
        type: DataValidationType.LIST,
        ranges: [{
            startRow: 11,
            endRow: 15,
            startColumn: 0,
            endColumn: 5,
        }],
        formula1: '1,2,3,hahaha,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18',
        renderMode: 1,
    },
    {
        uid: 'xxx-4',
        type: DataValidationType.CUSTOM,
        ranges: [{
            startRow: 16,
            endRow: 20,
            startColumn: 0,
            endColumn: 5,
        }],
        formula1: '=A1',
    },
    {
        uid: 'xxx-5',
        type: DataValidationType.LIST_MULTIPLE,
        ranges: [{
            startRow: 21,
            endRow: 21,
            startColumn: 0,
            endColumn: 0,
        }],
        formula1: '1,2,3,4,5,哈哈哈哈',
    },
];

const dv2 = [
    {
        uid: 'xxx-2',
        type: 'checkbox',
        ranges: [
            {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
            },
        ],
    },
    {
        uid: 'adN9-O',
        type: 'list',
        formula1: "='sheet-0005'!F4:F8",
        ranges: [
            {
                startRow: 4,
                startColumn: 5,
                endRow: 14,
                endColumn: 8,
                rangeType: 0,
            },
        ],
        formula2: '',
    },
];

export const DEFAULT_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'hrlgf-kuxcmFMbzNW9h',
    rev: 1,
    sheetOrder: [
        'uni2',
    ],
    appVersion: '',
    locale: 'enUS',
    sheets: {
        uni2: {
            id: 'uni2',
            name: '项目管理',
            rowCount: 35,
            columnCount: 66,
            freeze: {
                xSplit: 0,
                ySplit: 5,
                startRow: 5,
                startColumn: 0,
            },
            zoomRatio: 1,
            rowData: {
                2: {
                    h: 23,
                    ia: 1,
                    ah: 23,
                },
                3: {
                    h: 39,
                    ia: 1,
                    ah: 39,
                },
                4: {
                    h: 25,
                    ia: 1,
                    ah: 25,
                },
                5: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                6: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                7: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                8: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                9: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                10: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                11: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                12: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                13: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                14: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                15: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                16: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                17: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                18: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                19: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                20: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                21: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                22: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                23: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                24: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                25: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                26: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                27: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                28: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                29: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                30: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                31: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                32: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
                33: {
                    h: 29,
                    ia: 1,
                    ah: 29,
                },
            },
            columnData: {
                0: {
                    w: 37,
                    ia: 1,
                    aw: 37,
                },
                1: {
                    w: 193,
                    ia: 1,
                    aw: 193,
                },
                2: {
                    w: 82,
                    ia: 1,
                    aw: 82,
                },
                3: {
                    w: 111,
                    ia: 1,
                    aw: 111,
                },
                4: {
                    w: 111,
                    ia: 1,
                    aw: 111,
                },
                5: {
                    w: 52,
                    ia: 1,
                    aw: 52,
                },
                6: {
                    w: 67,
                    ia: 1,
                    aw: 67,
                },
                7: {
                    w: 67,
                    ia: 1,
                    aw: 67,
                },
                8: {
                    w: 30,
                    ia: 1,
                    aw: 30,
                },
                9: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                10: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                11: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                12: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                13: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                14: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                15: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                16: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                17: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                18: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                19: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                20: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                21: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                22: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                23: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                24: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                25: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                26: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                27: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                28: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                29: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                30: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                31: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                32: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                33: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                34: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                35: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                36: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                37: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                38: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                39: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                40: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                41: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                42: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                43: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                44: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                45: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                46: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                47: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                48: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                49: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                50: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                51: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                52: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                53: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                54: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                55: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                56: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                57: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                58: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                59: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                60: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                61: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                62: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                63: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
                64: {
                    w: 22,
                    ia: 1,
                    aw: 22,
                },
            },
            status: 0,
            showGridlines: 0,
            hidden: 0,
            defaultColumnWidth: 104,
            defaultRowHeight: 25,
            mergeData: [
                {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 8,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 0,
                    startColumn: 9,
                    endRow: 0,
                    endColumn: 15,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 0,
                    startColumn: 18,
                    endRow: 0,
                    endColumn: 20,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 0,
                    startColumn: 23,
                    endRow: 0,
                    endColumn: 25,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 5,
                    endRow: 1,
                    endColumn: 6,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 9,
                    endRow: 1,
                    endColumn: 15,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 16,
                    endRow: 1,
                    endColumn: 22,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 23,
                    endRow: 1,
                    endColumn: 29,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 30,
                    endRow: 1,
                    endColumn: 36,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 37,
                    endRow: 1,
                    endColumn: 43,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 44,
                    endRow: 1,
                    endColumn: 50,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 51,
                    endRow: 1,
                    endColumn: 57,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 1,
                    startColumn: 58,
                    endRow: 1,
                    endColumn: 64,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 5,
                    endRow: 2,
                    endColumn: 8,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 9,
                    endRow: 2,
                    endColumn: 15,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 16,
                    endRow: 2,
                    endColumn: 22,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 23,
                    endRow: 2,
                    endColumn: 29,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 30,
                    endRow: 2,
                    endColumn: 36,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 37,
                    endRow: 2,
                    endColumn: 43,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 44,
                    endRow: 2,
                    endColumn: 50,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 51,
                    endRow: 2,
                    endColumn: 57,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 2,
                    startColumn: 58,
                    endRow: 2,
                    endColumn: 64,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 4,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 1,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
                {
                    startRow: 4,
                    startColumn: 3,
                    endRow: 4,
                    endColumn: 7,
                    startAbsoluteRefType: 0,
                    endAbsoluteRefType: 0,
                    rangeType: 0,
                },
            ],
            cellData: {
                0: {
                    0: {
                        v: 'ABC 项目',
                        t: 1,
                        s: 'R44',
                    },
                    1: {
                        s: 'R44',
                    },
                    2: {
                        s: 'R44',
                    },
                    3: {
                        s: 'R44',
                    },
                    4: {
                        s: 'R44',
                    },
                    5: {
                        s: 'R44',
                    },
                    6: {
                        s: 'R44',
                    },
                    7: {
                        s: 'R44',
                    },
                    8: {
                        s: 'R44',
                    },
                    9: {
                        v: '支持自动高亮“今天”为红色⬇️\n休假日期自动标识为淡黄色',
                        t: 1,
                        s: 'R45',
                    },
                    10: {
                        s: 'R45',
                    },
                    11: {
                        s: 'R45',
                    },
                    12: {
                        s: 'R45',
                    },
                    13: {
                        s: 'R45',
                    },
                    14: {
                        s: 'R45',
                    },
                    15: {
                        s: 'R45',
                    },
                    16: {
                        s: 'R44',
                    },
                    17: {
                        s: 'R47',
                    },
                    18: {
                        v: '待启动',
                        t: 1,
                        s: 'R43',
                    },
                    19: {
                        s: 'R43',
                    },
                    20: {
                        s: 'R43',
                    },
                    21: {
                        s: 'R44',
                    },
                    22: {
                        s: 'R46',
                    },
                    23: {
                        v: '已完成',
                        t: 1,
                        s: 'R43',
                    },
                    24: {
                        s: 'R43',
                    },
                    25: {
                        s: 'R43',
                    },
                    26: {
                        s: 'R44',
                    },
                    27: {
                        s: 'R44',
                    },
                    28: {
                        s: 'R44',
                    },
                    29: {
                        s: 'R44',
                    },
                },
                1: {
                    1: {
                        v: '启动日期',
                        t: 1,
                        s: 'R16',
                    },
                    2: {
                        v: '45301',
                        t: 2,
                        s: 'R19',
                    },
                    3: {
                        v: '➡️切换人名',
                        t: 1,
                        s: 'R16',
                    },
                    4: {
                        v: '@黄泡泡 ',
                        t: 1,
                        s: 'R20',
                    },
                    5: {
                        v: '显示第',
                        t: 1,
                        s: 'R16',
                    },
                    6: {
                        s: 'R16',
                    },
                    7: {
                        v: '1',
                        t: 2,
                        s: 'R17',
                    },
                    8: {
                        v: '周',
                        t: 1,
                        s: 'R18',
                    },
                    9: {
                        s: 'R15',
                        f: '="第 "&(J4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    10: {
                        s: 'R15',
                    },
                    11: {
                        s: 'R15',
                    },
                    12: {
                        s: 'R15',
                    },
                    13: {
                        s: 'R15',
                    },
                    14: {
                        s: 'R15',
                    },
                    15: {
                        s: 'R15',
                    },
                    16: {
                        s: 'R15',
                        f: '="第 "&(Q4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    17: {
                        s: 'R15',
                    },
                    18: {
                        s: 'R15',
                    },
                    19: {
                        s: 'R15',
                    },
                    20: {
                        s: 'R15',
                    },
                    21: {
                        s: 'R15',
                    },
                    22: {
                        s: 'R15',
                    },
                    23: {
                        s: 'R15',
                        f: '="第 "&(X4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    24: {
                        s: 'R15',
                    },
                    25: {
                        s: 'R15',
                    },
                    26: {
                        s: 'R15',
                    },
                    27: {
                        s: 'R15',
                    },
                    28: {
                        s: 'R15',
                    },
                    29: {
                        s: 'R15',
                    },
                    30: {
                        s: 'R15',
                        f: '="第 "&(AE4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    31: {
                        s: 'R15',
                    },
                    32: {
                        s: 'R15',
                    },
                    33: {
                        s: 'R15',
                    },
                    34: {
                        s: 'R15',
                    },
                    35: {
                        s: 'R15',
                    },
                    36: {
                        s: 'R15',
                    },
                    37: {
                        s: 'R15',
                        f: '="第 "&(AL4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    38: {
                        s: 'R15',
                    },
                    39: {
                        s: 'R15',
                    },
                    40: {
                        s: 'R15',
                    },
                    41: {
                        s: 'R15',
                    },
                    42: {
                        s: 'R15',
                    },
                    43: {
                        s: 'R15',
                    },
                    44: {
                        s: 'R15',
                        f: '="第"&(AS4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    45: {
                        s: 'R15',
                    },
                    46: {
                        s: 'R15',
                    },
                    47: {
                        s: 'R15',
                    },
                    48: {
                        s: 'R15',
                    },
                    49: {
                        s: 'R15',
                    },
                    50: {
                        s: 'R15',
                    },
                    51: {
                        s: 'R15',
                        f: '="第 "&(AZ4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    52: {
                        s: 'R15',
                    },
                    53: {
                        s: 'R15',
                    },
                    54: {
                        s: 'R15',
                    },
                    55: {
                        s: 'R15',
                    },
                    56: {
                        s: 'R15',
                    },
                    57: {
                        s: 'R15',
                    },
                    58: {
                        s: 'R15',
                        f: '="第 "&(BG4-($C$2-WEEKDAY($C$2,1)+2))/7+1&" 周"',
                    },
                    59: {
                        s: 'R15',
                    },
                    60: {
                        s: 'R15',
                    },
                    61: {
                        s: 'R15',
                    },
                    62: {
                        s: 'R15',
                    },
                    63: {
                        s: 'R15',
                    },
                    64: {
                        s: 'R15',
                    },
                },
                2: {
                    1: {
                        v: '项目负责人',
                        t: 1,
                        s: 'R16',
                    },
                    2: {
                        t: 1,
                        p: {
                            body: {
                                dataStream: '@黄泡泡 \r\n',
                                textRuns: [
                                    {
                                        st: 0,
                                        ed: 4,
                                        ts: {
                                            ff: 'Calibri',
                                            fs: 9.75,
                                            cl: {
                                                rgb: '#0563C1',
                                                th: 0,
                                            },
                                        },
                                    },
                                    {
                                        st: 4,
                                        ed: 5,
                                        ts: {
                                            ff: 'Calibri',
                                            fs: 9.75,
                                            cl: {
                                                rgb: '#000000',
                                                th: 0,
                                            },
                                        },
                                    },
                                ],
                                tables: [],
                                paragraphs: [
                                    {
                                        startIndex: 5,
                                    },
                                ],
                                sectionBreaks: [
                                    {
                                        startIndex: 6,
                                    },
                                ],
                                customBlocks: [],
                                customRanges: [],
                                customDecorations: [],
                            },
                            documentStyle: {
                                textStyle: {},
                                pageSize: {
                                    width: 0,
                                    height: 0,
                                },
                                renderConfig: {},
                                documentFlavor: 0,
                            },
                            drawings: {},
                            footers: {},
                            headers: {},
                            lists: {},
                            settings: {},
                        },
                        s: 'R20',
                    },
                    3: {
                        v: '查看工作量',
                        t: 1,
                        s: 'R16',
                    },
                    4: {
                        s: 'R56',
                        f: '=SUMIF(C6:C100,$E$2,H6:H100)',
                    },
                    5: {
                        v: '修改⬆️可自动调整右侧时间轴长度',
                        t: 1,
                        s: 'R54',
                    },
                    6: {
                        s: 'R54',
                    },
                    7: {
                        s: 'R54',
                    },
                    8: {
                        s: 'R54',
                    },
                    9: {
                        s: 'R55',
                        f: '=J4',
                    },
                    10: {
                        s: 'R55',
                    },
                    11: {
                        s: 'R55',
                    },
                    12: {
                        s: 'R55',
                    },
                    13: {
                        s: 'R55',
                    },
                    14: {
                        s: 'R55',
                    },
                    15: {
                        s: 'R55',
                    },
                    16: {
                        s: 'R55',
                        f: '=Q4',
                    },
                    17: {
                        s: 'R55',
                    },
                    18: {
                        s: 'R55',
                    },
                    19: {
                        s: 'R55',
                    },
                    20: {
                        s: 'R55',
                    },
                    21: {
                        s: 'R55',
                    },
                    22: {
                        s: 'R55',
                    },
                    23: {
                        s: 'R55',
                        f: '=X4',
                    },
                    24: {
                        s: 'R55',
                    },
                    25: {
                        s: 'R55',
                    },
                    26: {
                        s: 'R55',
                    },
                    27: {
                        s: 'R55',
                    },
                    28: {
                        s: 'R55',
                    },
                    29: {
                        s: 'R55',
                    },
                    30: {
                        s: 'R55',
                        f: '=AE4',
                    },
                    31: {
                        s: 'R55',
                    },
                    32: {
                        s: 'R55',
                    },
                    33: {
                        s: 'R55',
                    },
                    34: {
                        s: 'R55',
                    },
                    35: {
                        s: 'R55',
                    },
                    36: {
                        s: 'R55',
                    },
                    37: {
                        s: 'R55',
                        f: '=AL4',
                    },
                    38: {
                        s: 'R55',
                    },
                    39: {
                        s: 'R55',
                    },
                    40: {
                        s: 'R55',
                    },
                    41: {
                        s: 'R55',
                    },
                    42: {
                        s: 'R55',
                    },
                    43: {
                        s: 'R55',
                    },
                    44: {
                        s: 'R55',
                        f: '=AS4',
                    },
                    45: {
                        s: 'R55',
                    },
                    46: {
                        s: 'R55',
                    },
                    47: {
                        s: 'R55',
                    },
                    48: {
                        s: 'R55',
                    },
                    49: {
                        s: 'R55',
                    },
                    50: {
                        s: 'R55',
                    },
                    51: {
                        s: 'R55',
                        f: '=AZ4',
                    },
                    52: {
                        s: 'R55',
                    },
                    53: {
                        s: 'R55',
                    },
                    54: {
                        s: 'R55',
                    },
                    55: {
                        s: 'R55',
                    },
                    56: {
                        s: 'R55',
                    },
                    57: {
                        s: 'R55',
                    },
                    58: {
                        s: 'R55',
                        f: '=BG4',
                    },
                    59: {
                        s: 'R55',
                    },
                    60: {
                        s: 'R55',
                    },
                    61: {
                        s: 'R55',
                    },
                    62: {
                        s: 'R55',
                    },
                    63: {
                        s: 'R55',
                    },
                    64: {
                        s: 'R55',
                    },
                },
                3: {
                    0: {
                        v: '项目',
                        t: 1,
                        s: 'R26',
                    },
                    1: {
                        v: '项目描述',
                        t: 1,
                        s: 'R26',
                    },
                    2: {
                        v: '跟进人',
                        t: 1,
                        s: 'R23',
                    },
                    3: {
                        v: '启动日期',
                        t: 1,
                        s: 'R23',
                    },
                    4: {
                        v: '完成日期',
                        t: 1,
                        s: 'R23',
                    },
                    5: {
                        v: '工时\n自然日',
                        t: 1,
                        s: 'R23',
                    },
                    6: {
                        v: '完成度 %',
                        t: 1,
                        s: 'R23',
                    },
                    7: {
                        v: '工时\n工作日',
                        t: 1,
                        s: 'R23',
                    },
                    8: {
                        s: 'R25',
                    },
                    9: {
                        s: 'R24',
                        f: '=C2-WEEKDAY(C2,1)+2+7*(H2-1)',
                        // v:1
                    },
                    10: {
                        s: 'R22',
                        f: '=J4+1',
                    },
                    11: {
                        s: 'R22',
                        f: '=K4+1',
                    },
                    12: {
                        s: 'R22',
                        f: '=L4+1',
                    },
                    13: {
                        s: 'R22',
                        f: '=M4+1',
                    },
                    14: {
                        s: 'R22',
                        f: '=N4+1',
                    },
                    15: {
                        s: 'R22',
                        f: '=O4+1',
                    },
                    16: {
                        s: 'R22',
                        f: '=P4+1',
                    },
                    17: {
                        s: 'R22',
                        f: '=Q4+1',
                    },
                    18: {
                        s: 'R22',
                        f: '=R4+1',
                    },
                    19: {
                        s: 'R22',
                        f: '=S4+1',
                    },
                    20: {
                        s: 'R22',
                        f: '=T4+1',
                    },
                    21: {
                        s: 'R22',
                        f: '=U4+1',
                    },
                    22: {
                        s: 'R22',
                        f: '=V4+1',
                    },
                    23: {
                        s: 'R22',
                        f: '=W4+1',
                    },
                    24: {
                        s: 'R22',
                        f: '=X4+1',
                    },
                    25: {
                        s: 'R22',
                        f: '=Y4+1',
                    },
                    26: {
                        s: 'R22',
                        f: '=Z4+1',
                    },
                    27: {
                        s: 'R22',
                        f: '=AA4+1',
                    },
                    28: {
                        s: 'R22',
                        f: '=AB4+1',
                    },
                    29: {
                        s: 'R22',
                        f: '=AC4+1',
                    },
                    30: {
                        s: 'R22',
                        f: '=AD4+1',
                    },
                    31: {
                        s: 'R22',
                        f: '=AE4+1',
                    },
                    32: {
                        s: 'R22',
                        f: '=AF4+1',
                    },
                    33: {
                        s: 'R22',
                        f: '=AG4+1',
                    },
                    34: {
                        s: 'R22',
                        f: '=AH4+1',
                    },
                    35: {
                        s: 'R22',
                        f: '=AI4+1',
                    },
                    36: {
                        s: 'R22',
                        f: '=AJ4+1',
                    },
                    37: {
                        s: 'R22',
                        f: '=AK4+1',
                    },
                    38: {
                        s: 'R22',
                        f: '=AL4+1',
                    },
                    39: {
                        s: 'R22',
                        f: '=AM4+1',
                    },
                    40: {
                        s: 'R22',
                        f: '=AN4+1',
                    },
                    41: {
                        s: 'R22',
                        f: '=AO4+1',
                    },
                    42: {
                        s: 'R22',
                        f: '=AP4+1',
                    },
                    43: {
                        s: 'R22',
                        f: '=AQ4+1',
                    },
                    44: {
                        s: 'R22',
                        f: '=AR4+1',
                    },
                    45: {
                        s: 'R22',
                        f: '=AS4+1',
                    },
                    46: {
                        s: 'R22',
                        f: '=AT4+1',
                    },
                    47: {
                        s: 'R22',
                        f: '=AU4+1',
                    },
                    48: {
                        s: 'R22',
                        f: '=AV4+1',
                    },
                    49: {
                        s: 'R22',
                        f: '=AW4+1',
                    },
                    50: {
                        s: 'R22',
                        f: '=AX4+1',
                    },
                    51: {
                        s: 'R22',
                        f: '=AY4+1',
                    },
                    52: {
                        s: 'R22',
                        f: '=AZ4+1',
                    },
                    53: {
                        s: 'R22',
                        f: '=BA4+1',
                    },
                    54: {
                        s: 'R22',
                        f: '=BB4+1',
                    },
                    55: {
                        s: 'R22',
                        f: '=BC4+1',
                    },
                    56: {
                        s: 'R22',
                        f: '=BD4+1',
                    },
                    57: {
                        s: 'R22',
                        f: '=BE4+1',
                    },
                    58: {
                        s: 'R22',
                        f: '=BF4+1',
                    },
                    59: {
                        s: 'R22',
                        f: '=BG4+1',
                    },
                    60: {
                        s: 'R22',
                        f: '=BH4+1',
                    },
                    61: {
                        s: 'R22',
                        f: '=BI4+1',
                    },
                    62: {
                        s: 'R22',
                        f: '=BJ4+1',
                    },
                    63: {
                        s: 'R22',
                        f: '=BK4+1',
                    },
                    64: {
                        s: 'R22',
                        f: '=BL4+1',
                    },
                },
                4: {
                    0: {
                        v: '灰色底色为任务项，白色底色为子任务项',
                        t: 1,
                        s: 'R1',
                    },
                    1: {
                        s: 'R1',
                    },
                    2: {
                        s: 'R3',
                    },
                    3: {
                        v: '填写绿色区域，灰色底色部分由公式自动计算',
                        t: 1,
                        s: 'R1',
                    },
                    4: {
                        s: 'R1',
                    },
                    5: {
                        s: 'R1',
                    },
                    6: {
                        s: 'R1',
                    },
                    7: {
                        s: 'R1',
                    },
                    9: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(J4,1),"日","一","二","三","四","五","六")',
                    },
                    10: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(K4,1),"日","一","二","三","四","五","六")',
                    },
                    11: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(L4,1),"日","一","二","三","四","五","六")',
                    },
                    12: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(M4,1),"日","一","二","三","四","五","六")',
                    },
                    13: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(N4,1),"日","一","二","三","四","五","六")',
                    },
                    14: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(O4,1),"日","一","二","三","四","五","六")',
                    },
                    15: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(P4,1),"日","一","二","三","四","五","六")',
                    },
                    16: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(Q4,1),"日","一","二","三","四","五","六")',
                    },
                    17: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(R4,1),"日","一","二","三","四","五","六")',
                    },
                    18: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(S4,1),"日","一","二","三","四","五","六")',
                    },
                    19: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(T4,1),"日","一","二","三","四","五","六")',
                    },
                    20: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(U4,1),"日","一","二","三","四","五","六")',
                    },
                    21: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(V4,1),"日","一","二","三","四","五","六")',
                    },
                    22: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(W4,1),"日","一","二","三","四","五","六")',
                    },
                    23: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(X4,1),"日","一","二","三","四","五","六")',
                    },
                    24: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(Y4,1),"日","一","二","三","四","五","六")',
                    },
                    25: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(Z4,1),"日","一","二","三","四","五","六")',
                    },
                    26: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AA4,1),"日","一","二","三","四","五","六")',
                    },
                    27: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AB4,1),"日","一","二","三","四","五","六")',
                    },
                    28: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AC4,1),"日","一","二","三","四","五","六")',
                    },
                    29: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AD4,1),"日","一","二","三","四","五","六")',
                    },
                    30: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AE4,1),"日","一","二","三","四","五","六")',
                    },
                    31: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AF4,1),"日","一","二","三","四","五","六")',
                    },
                    32: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AG4,1),"日","一","二","三","四","五","六")',
                    },
                    33: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AH4,1),"日","一","二","三","四","五","六")',
                    },
                    34: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AI4,1),"日","一","二","三","四","五","六")',
                    },
                    35: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AJ4,1),"日","一","二","三","四","五","六")',
                    },
                    36: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AK4,1),"日","一","二","三","四","五","六")',
                    },
                    37: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AL4,1),"日","一","二","三","四","五","六")',
                    },
                    38: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AM4,1),"日","一","二","三","四","五","六")',
                    },
                    39: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AN4,1),"日","一","二","三","四","五","六")',
                    },
                    40: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AO4,1),"日","一","二","三","四","五","六")',
                    },
                    41: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AP4,1),"日","一","二","三","四","五","六")',
                    },
                    42: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AQ4,1),"日","一","二","三","四","五","六")',
                    },
                    43: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AR4,1),"日","一","二","三","四","五","六")',
                    },
                    44: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AS4,1),"日","一","二","三","四","五","六")',
                    },
                    45: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AT4,1),"日","一","二","三","四","五","六")',
                    },
                    46: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AU4,1),"日","一","二","三","四","五","六")',
                    },
                    47: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AV4,1),"日","一","二","三","四","五","六")',
                    },
                    48: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AW4,1),"日","一","二","三","四","五","六")',
                    },
                    49: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AX4,1),"日","一","二","三","四","五","六")',
                    },
                    50: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AY4,1),"日","一","二","三","四","五","六")',
                    },
                    51: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(AZ4,1),"日","一","二","三","四","五","六")',
                    },
                    52: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BA4,1),"日","一","二","三","四","五","六")',
                    },
                    53: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BB4,1),"日","一","二","三","四","五","六")',
                    },
                    54: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BC4,1),"日","一","二","三","四","五","六")',
                    },
                    55: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BD4,1),"日","一","二","三","四","五","六")',
                    },
                    56: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BE4,1),"日","一","二","三","四","五","六")',
                    },
                    57: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BF4,1),"日","一","二","三","四","五","六")',
                    },
                    58: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BG4,1),"日","一","二","三","四","五","六")',
                    },
                    59: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BH4,1),"日","一","二","三","四","五","六")',
                    },
                    60: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BI4,1),"日","一","二","三","四","五","六")',
                    },
                    61: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BJ4,1),"日","一","二","三","四","五","六")',
                    },
                    62: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BK4,1),"日","一","二","三","四","五","六")',
                    },
                    63: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BL4,1),"日","一","二","三","四","五","六")',
                    },
                    64: {
                        s: 'R2',
                        f: '=CHOOSE(WEEKDAY(BM4,1),"日","一","二","三","四","五","六")',
                    },
                },

            },
        },
    },
    styles: {
        R0: {
            ff: 'Calibri',
            fs: 10,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R1: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R10: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d dddd',
            },
            ht: 2,
            vt: 2,
        },
        R11: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R12: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R13: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
            tb: 3,
        },
        R14: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#BEBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'm/d/yyyy\\ \\(dddd\\)',
            },
            ht: 1,
            vt: 2,
        },
        R15: {
            ff: 'Calibri',
            fs: 10.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R16: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 3,
            vt: 2,
        },
        R17: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R18: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R19: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#BEBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/MM/dd',
            },
            ht: 2,
            vt: 2,
        },
        R2: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#A5A5A5',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R20: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#BEBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'm/d/yyyy\\ \\(dddd\\)',
            },
            ht: 2,
            vt: 2,
        },
        R21: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0%',
            },
            ht: 1,
            vt: 2,
        },
        R22: {
            ff: 'Calibri',
            fs: 7.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'd',
            },
            ht: 2,
            vt: 2,
        },
        R23: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
            tb: 3,
        },
        R24: {
            ff: 'Calibri',
            fs: 7.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'd',
            },
            ht: 2,
            vt: 2,
        },
        R25: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BEBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R26: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
            tb: 3,
        },
        R27: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d dddd',
            },
            ht: 3,
            vt: 2,
        },
        R28: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R29: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R3: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R30: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d dddd',
            },
            ht: 2,
            vt: 2,
        },
        R31: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R32: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0%',
            },
            ht: 2,
            vt: 2,
        },
        R33: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R34: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D9D9D9',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R35: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R36: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R37: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d dddd',
            },
            ht: 2,
            vt: 2,
        },
        R38: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R39: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0%',
            },
            ht: 2,
            vt: 2,
        },
        R4: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R40: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R41: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R42: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D8D8D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R43: {
            ff: 'Calibri',
            fs: 10.5,
            bl: 1,
            cl: {
                rgb: '#373C43',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R44: {
            ff: 'Calibri',
            fs: 15.75,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R45: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 3,
        },
        R46: {
            ff: 'Calibri',
            fs: 15.75,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            bg: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R47: {
            ff: 'Calibri',
            fs: 15.75,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            bg: {
                rgb: '#245BDB',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R48: {
            ff: 'Calibri',
            fs: 9.75,
            it: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R49: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0%',
            },
            ht: 2,
            vt: 2,
        },
        R5: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R50: {
            ff: 'Calibri',
            fs: 9.75,
            it: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R51: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R52: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R53: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EAEAEA',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R54: {
            ff: 'Calibri',
            fs: 9,
            cl: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R55: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                r: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#BFBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy"年"m"月"',
            },
            ht: 2,
            vt: 2,
        },
        R56: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                b: {
                    s: 1,
                    cl: {
                        rgb: '#BEBFBF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R58: {
            ff: 'Calibri',
            fs: 10,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
        },
        R6: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D7E6D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
        R62: {
            ff: 'Calibri',
            fs: 10,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'yyyy/MM/dd',
            },
        },
        R63: {
            ff: 'Calibri',
            fs: 13.5,
            bl: 1,
            cl: {
                rgb: '#124B0C',
                th: 0,
            },
            bg: {
                rgb: '#8EE085',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R64: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#FFFFFF',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R65: {
            ff: 'Calibri',
            fs: 24,
            bl: 1,
            cl: {
                rgb: '#245BDB',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R66: {
            ff: 'Calibri',
            fs: 24,
            bl: 1,
            cl: {
                rgb: '#186010',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R67: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#124B0C',
                th: 0,
            },
            bg: {
                rgb: '#D9F5D6',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#D9F5D6',
                        th: 0,
                    },
                },
                r: {
                    s: 1,
                    cl: {
                        rgb: '#D9F5D6',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#D9F5D6',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#D9F5D6',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
            tb: 3,
        },
        R68: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D9F5D6',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R69: {
            ff: 'Calibri',
            fs: 10.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
            tb: 3,
        },
        R7: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D7E6D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d dddd',
            },
            ht: 2,
            vt: 2,
        },
        R70: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D7E6D8',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R71: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R72: {
            ff: 'Calibri',
            fs: 10.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
            tb: 3,
        },
        R73: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R74: {
            ff: 'Calibri',
            fs: 12,
            bl: 1,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R75: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R76: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#8F959E',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R77: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R78: {
            ff: 'Calibri',
            fs: 18,
            cl: {
                rgb: '#3B608D',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R79: {
            ff: 'Calibri',
            fs: 18,
            cl: {
                rgb: '#3B8741',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R8: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#D7E6D8',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0%',
            },
            ht: 2,
            vt: 2,
        },
        R80: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: '#,##0',
            },
            vt: 2,
        },
        R81: {
            ff: 'Calibri',
            fs: 10.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R82: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            vt: 2,
        },
        R83: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                r: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R84: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                r: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'yyyy/m/d',
            },
            ht: 2,
            vt: 2,
        },
        R85: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
            tb: 3,
        },
        R86: {
            ff: 'Calibri',
            fs: 9.75,
            bl: 1,
            cl: {
                rgb: '#F54A45',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R87: {
            ff: 'Calibri',
            fs: 10.5,
            bl: 1,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bg: {
                rgb: '#E1EAFF',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                r: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
                l: {
                    s: 1,
                    cl: {
                        rgb: '#8F959E',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: 'General',
            },
            ht: 2,
            vt: 2,
        },
        R88: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'yyyy/m/d',
            },
            vt: 2,
        },
        R89: {
            ff: 'Calibri',
            fs: 9.75,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            n: {
                pattern: 'General',
            },
            ht: 1,
            vt: 2,
        },
        R9: {
            ff: 'Calibri',
            fs: 13.5,
            cl: {
                rgb: '#000000',
                th: 0,
            },
            bd: {
                t: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
                b: {
                    s: 1,
                    cl: {
                        rgb: '#EFEFEF',
                        th: 0,
                    },
                },
            },
            n: {
                pattern: '0',
            },
            ht: 2,
            vt: 2,
        },
    },
    company: '',
    createdTime: '',
    lastModifiedBy: '',
    modifiedTime: '',
};
