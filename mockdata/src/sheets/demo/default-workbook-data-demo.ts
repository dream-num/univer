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
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
import { BooleanNumber, DataValidationErrorStyle, DataValidationOperator, DataValidationType, LocaleType } from '@univerjs/core';
import { DATA_VALIDATION_PLUGIN_NAME } from '@univerjs/sheets-data-validation';
import { PAGE5_RICHTEXT_1 } from '../../slides/rich-text/page5-richtext1';
=======
import type { ICellHyperLink } from '@univerjs/sheets-hyper-link';

<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
import { DataValidationErrorStyle, DataValidationOperator, DataValidationType } from '@univerjs/core';
>>>>>>> 9367a46da (perf(formula): add r_tree for dependency):examples/src/data/sheets/demo/default-workbook-data-demo.ts
=======
import { BooleanNumber, DataValidationErrorStyle, DataValidationOperator, DataValidationType, LocaleType } from '@univerjs/core';
import { DATA_VALIDATION_PLUGIN_NAME } from '@univerjs/sheets-data-validation';
import { PAGE5_RICHTEXT_1 } from '../../slides/rich-text/page5-richtext1';
>>>>>>> efa80aa84 (fix(formula): big demo):examples/src/data/sheets/demo/default-workbook-data-demo.ts
=======
import type { ICellHyperLink } from '@univerjs/sheets-hyper-link';

import { DataValidationErrorStyle, DataValidationOperator, DataValidationType } from '@univerjs/core';
>>>>>>> d0467e0e9 (fix(formula): multi minus error):examples/src/data/sheets/demo/default-workbook-data-demo.ts

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
    id: 'workbook-01',
    sheetOrder: [
        '65RDQ8vlAdCUq9NjwYABw',
    ],
    name: 'UniverSheet Demo',
    appVersion: '3.0.0-alpha',
    locale: 'zhCN',
    styles: {
        cbP8kH: {
            ff: 'Segoe UI',
            fs: 10,
            it: 0,
            bl: 0,
            ul: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            st: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            ol: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            tr: {
                a: 0,
                v: 0,
            },
            td: 0,
            cl: {
                rgb: 'rgb(80,80,80)',
            },
            ht: 0,
            vt: 3,
            tb: 0,
            pd: {
                t: 0,
                b: 1,
                l: 2,
                r: 2,
            },
            bd: {
                l: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                r: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                t: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                b: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
            },
        },
        TMfID0: {
            ff: 'Segoe UI',
            fs: 10,
            it: 0,
            bl: 0,
            ul: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            st: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            ol: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            tr: {
                a: 0,
                v: 0,
            },
            td: 0,
            cl: {
                rgb: 'rgb(80,80,80)',
            },
            ht: 0,
            vt: 3,
            tb: 0,
            pd: {
                t: 0,
                b: 1,
                l: 2,
                r: 2,
            },
            bd: {
                r: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                t: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                b: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
            },
        },
        ffUq_1: {
            ff: 'Segoe UI',
            fs: 10,
            it: 0,
            bl: 0,
            ul: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            st: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            ol: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            tr: {
                a: 0,
                v: 0,
            },
            td: 0,
            cl: {
                rgb: 'rgb(80,80,80)',
            },
            ht: 0,
            vt: 3,
            tb: 0,
            pd: {
                t: 0,
                b: 1,
                l: 2,
                r: 2,
            },
            bd: {
                l: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                r: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                b: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
            },
        },
        '-Cr5uu': {
            ff: 'Segoe UI',
            fs: 10,
            it: 0,
            bl: 0,
            ul: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            st: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            ol: {
                s: 0,
                cl: {
                    rgb: 'rgb(80,80,80)',
                },
            },
            tr: {
                a: 0,
                v: 0,
            },
            td: 0,
            cl: {
                rgb: 'rgb(80,80,80)',
            },
            ht: 0,
            vt: 3,
            tb: 0,
            pd: {
                t: 0,
                b: 1,
                l: 2,
                r: 2,
            },
            bd: {
                r: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                b: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
            },
        },
        xrMXOi: {
            ff: 'Arial',
            fs: 10,
            it: 0,
            bl: 0,
            ul: {
                s: 0,
                cl: {
                    rgb: '#000',
                },
            },
            st: {
                s: 0,
                cl: {
                    rgb: '#000',
                },
            },
            ol: {
                s: 0,
                cl: {
                    rgb: '#000',
                },
            },
            tr: {
                a: 0,
                v: 0,
            },
            td: 0,
            cl: {
                rgb: '#000',
            },
            ht: 0,
            vt: 3,
            tb: 0,
            pd: {
                t: 0,
                b: 1,
                l: 2,
                r: 2,
            },
            bd: {
                r: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
                b: {
                    cl: {
                        rgb: 'rgb(204,204,204)',
                    },
                    s: 1,
                },
            },
        },
    },
    sheets: {
        '65RDQ8vlAdCUq9NjwYABw': {
            name: '工作表1',
            id: '65RDQ8vlAdCUq9NjwYABw',
            tabColor: '',
            hidden: 0,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
            cellData: {
                0: {
                    0: {
                        s: '1',
                        v: 'A Schedule of Items',
                    },
                    10: {
                        v: 10,
                    },
                    11: {
                        v: 234,
                    },
                },
                1: {
                    0: {
                        s: {
                            n: {
                                pattern: 'yyyy-mm-dd;@',
                            },
                        },
                        v: 1,
                    },
                    10: {
                        v: 12313,
                    },
                    11: {
                        v: 123,
                    },
                },
                2: {
                    0: {
                        f: '=A2',
                    },
                    10: {
                        v: 0,
                    },
                    11: {
                        v: 235,
                    },
                },
                4: {
                    10: {
                        v: 123,
                    },
                    11: {
                        v: 632,
                    },
                },
                5: {
                    5: {
                        s: 'uJSelZ11',
                        v: 'sadf',
                    },
                    6: {
                        s: 'uJSelZ11',
                    },
                    7: {
                        s: 'uJSelZ11',
                    },
                    8: {
                        s: 'uJSelZ11',
                    },
                    9: {
                        s: 'uJSelZ22',
                    },
                    11: {
                        v: 126,
                    },
                },
                6: {
                    5: {
                        s: 'uJSelZ22',
                        v: '123123',
                    },
                    6: {
                        s: 'uJSelZ22',
                    },
                    7: {
                        s: 'uJSelZ22',
                    },
                    8: {
                        s: 'uJSelZ22',
                    },
                    10: {
                        v: 'ewe',
                    },
                    11: {
                        v: 893,
                    },
                },
                10: {
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
                    0: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    1: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    2: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    3: {
                        v: 1000,
                        t: 2,
                        s: 'rILI9F',
                    },
                    4: {
                        v: '测试人名',
                        custom: '1114',
                        t: 1,
                        s: 'rILI9F',
                    },
                    5: {
                        v: '测试岗位',
                        t: 1,
                        s: 'rILI9F',
                    },
                    6: {
                        v: 18,
                        t: 2,
                        s: 'rILI9F',
                    },
                    7: {
                        v: 144,
                        t: 2,
                        s: 'rILI9F',
                    },
                    8: {
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
                        p: {
                            id: '__INTERNAL_EDITOR__DOCS_NORMAL',
                            documentStyle: {
                                pageSize: {
                                    width: 270.44940185546875,
                                    height: undefined,
                                },
                                marginTop: 0,
                                marginBottom: 1,
                                marginRight: 2,
                                marginLeft: 2,
                                renderConfig: {
                                    horizontalAlign: 0,
                                    verticalAlign: 0,
                                    centerAngle: 0,
                                    vertexAngle: 0,
                                    wrapStrategy: 0,
                                },
                            },
                            body: {
                                dataStream:
                                    '\u001Fhttps://univer-preview.vercel.app/sheets/\u001E\r12323\r\u001FA100\u001E\r\n',
                                textRuns: [],
                                paragraphs: [
                                    {
                                        startIndex: 43,
                                        paragraphStyle: {
                                            horizontalAlign: 0,
                                        },
                                    },
                                    {
                                        startIndex: 49,
                                        paragraphStyle: {
                                            horizontalAlign: 0,
                                        },
                                    },
                                    {
                                        startIndex: 93,
                                        paragraphStyle: {
                                            horizontalAlign: 0,
                                        },
                                    },
                                ],
                                sectionBreaks: [
                                    {
                                        startIndex: 94,
                                    },
                                ],
                                customRanges: [
                                    {
                                        startIndex: 0,
                                        endIndex: 42,
                                        rangeId: 'tnxxGNtWAuHrpz4fBGAYh',
                                        rangeType: 0,
                                        properties: {
                                            url: 'https://univer-preview.vercel.app/sheets/',
                                        },
                                    },
                                    {
                                        startIndex: 50,
                                        endIndex: 55,
                                        rangeId: 'j4NsUHxjolNihMoYdZ-oj',
                                        rangeType: 0,
                                        properties: {
                                            url: '#gid=sheet-0011&range=A100',
                                        },
                                    },
                                ],
                                customDecorations: [],
                            },
                            drawings: {},
                            drawingsOrder: [],
                            settings: {
                                zoomRatio: 1,
                            },
                        },
                    },
                    12: {
                        p: {
                            id: 'd',
                            documentStyle: {
                                pageSize: {
                                    width: 111.55900573730469,
                                },
                                marginTop: 0,
                                marginBottom: 1,
                                marginRight: 2,
                                marginLeft: 2,
                                renderConfig: {
                                    horizontalAlign: 0,
                                    verticalAlign: 0,
                                    centerAngle: 0,
                                    vertexAngle: 0,
                                    wrapStrategy: 0,
                                },
                            },
                            body: {
                                dataStream: '\u001Fhttps://univer.ai/\u001E\r\n',
                                customRanges: [
                                    {
                                        startIndex: 0,
                                        endIndex: 19,
                                        rangeId: 'QY6zbQrxGw8IaLGXDgVVj',
                                        rangeType: 0,
                                        properties: {
                                            url: 'https://univer.ai/',
                                        },
                                    },
                                ],
                            },
                            drawings: {},
                            drawingsOrder: [],
                        },
=======
                        f: '=H11-(K11+M11+O11+Q11+S11+U11+W11+Y11+AA11+AC11+AE11+AG11+AI11+AK11+AM11+AO11+AQ11+AS11+AU11+AW11+AY11+BA11+BC11+BE11+BG11+BI11+BK11+BM11+BO11+BQ11+BS11+BU11+BW11+BY11+CA11+CC11+CE11+CG11+CI11+CK11+CM11+CO11+CQ11+CS11+CU11+CW11+CY11+DA11+DC11+DE11+DG11+DI11+DK11+DM11+DO11+DQ11+DS11+DU11+DW11+DY11+EA11+EC11+EE11+EG11+EI11+EK11+EM11+EO11+EQ11+ES11+EU11+EW11+EY11+FA11+FC11+FE11+FG11+FI11+FK11+FM11+FO11+FQ11+FS11+FU11+FW11+FY11+GA11+GC11+GE11+GG11+GI11+GK11+GM11+GO11+GQ11+GS11+GU11+GW11+GY11+HA11)',
                        custom: 'rowPrjtotal',
                        v: 144,
                        t: 2,
                        s: 'rILI9F',
                    },
                    9: {
                        f: '=K11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    10: {
                        v: 0,
                        custom: '10118',
                        t: 2,
                        s: 'rILI9F',
                    },
                    11: {
                        f: '=M11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    12: {
                        v: 0,
                        custom: '10116',
                        t: 2,
                        s: 'rILI9F',
                    },
                    13: {
                        f: '=O11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    14: {
                        v: 0,
                        custom: '10122',
                        t: 2,
                        s: 'rILI9F',
                    },
                    15: {
                        f: '=Q11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    16: {
                        v: 0,
                        custom: '10126',
                        t: 2,
                        s: 'rILI9F',
                    },
                    17: {
                        f: '=S11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    18: {
                        v: 0,
                        custom: '10128',
                        t: 2,
                        s: 'rILI9F',
                    },
                    19: {
                        f: '=U11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    20: {
                        v: 0,
                        custom: '10132',
                        t: 2,
                        s: 'rILI9F',
                    },
                    21: {
                        f: '=W11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    22: {
                        v: 0,
                        custom: '10136',
                        t: 2,
                        s: 'rILI9F',
                    },
                    23: {
                        f: '=Y11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    24: {
                        v: 0,
                        custom: '10138',
                        t: 2,
                        s: 'rILI9F',
                    },
                    25: {
                        f: '=AA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    26: {
                        v: 0,
                        custom: '10142',
                        t: 2,
                        s: 'rILI9F',
                    },
                    27: {
                        f: '=AC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    28: {
                        v: 0,
                        custom: '10144',
                        t: 2,
                        s: 'rILI9F',
                    },
                    29: {
                        f: '=AE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    30: {
                        v: 0,
                        custom: '10146',
                        t: 2,
                        s: 'rILI9F',
                    },
                    31: {
                        f: '=AG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    32: {
                        v: 0,
                        custom: '10150',
                        t: 2,
                        s: 'rILI9F',
                    },
                    33: {
                        f: '=AI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    34: {
                        v: 0,
                        custom: '10152',
                        t: 2,
                        s: 'rILI9F',
                    },
                    35: {
                        f: '=AK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    36: {
                        v: 0,
                        custom: '10156',
                        t: 2,
                        s: 'rILI9F',
                    },
                    37: {
                        f: '=AM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    38: {
                        v: 0,
                        custom: '10158',
                        t: 2,
                        s: 'rILI9F',
                    },
                    39: {
                        f: '=AO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    40: {
                        v: 0,
                        custom: '10160',
                        t: 2,
                        s: 'rILI9F',
                    },
                    41: {
                        f: '=AQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    42: {
                        v: 0,
                        custom: '10162',
                        t: 2,
                        s: 'rILI9F',
                    },
                    43: {
                        f: '=AS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    44: {
                        v: 0,
                        custom: '10166',
                        t: 2,
                        s: 'rILI9F',
                    },
                    45: {
                        f: '=AU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    46: {
                        v: 0,
                        custom: '10168',
                        t: 2,
                        s: 'rILI9F',
                    },
                    47: {
                        f: '=AW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    48: {
                        v: 0,
                        custom: '10170',
                        t: 2,
                        s: 'rILI9F',
                    },
                    49: {
                        f: '=AY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    50: {
                        v: 0,
                        custom: '10172',
                        t: 2,
                        s: 'rILI9F',
                    },
                    51: {
                        f: '=BA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    52: {
                        v: 0,
                        custom: '10174',
                        t: 2,
                        s: 'rILI9F',
                    },
                    53: {
                        f: '=BC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    54: {
                        v: 0,
                        custom: '10176',
                        t: 2,
                        s: 'rILI9F',
                    },
                    55: {
                        f: '=BE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    56: {
                        v: 0,
                        custom: '10178',
                        t: 2,
                        s: 'rILI9F',
                    },
                    57: {
                        f: '=BG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    58: {
                        v: 0,
                        custom: '10180',
                        t: 2,
                        s: 'rILI9F',
                    },
                    59: {
                        f: '=BI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    60: {
                        v: 0,
                        custom: '10182',
                        t: 2,
                        s: 'rILI9F',
                    },
                    61: {
                        f: '=BK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    62: {
                        v: 0,
                        custom: '10184',
                        t: 2,
                        s: 'rILI9F',
                    },
                    63: {
                        f: '=BM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    64: {
                        v: 0,
                        custom: '10186',
                        t: 2,
                        s: 'rILI9F',
                    },
                    65: {
                        f: '=BO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    66: {
                        v: 0,
                        custom: '10188',
                        t: 2,
                        s: 'rILI9F',
                    },
                    67: {
                        f: '=BQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    68: {
                        v: 0,
                        custom: '10190',
                        t: 2,
                        s: 'rILI9F',
                    },
                    69: {
                        f: '=BS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    70: {
                        v: 0,
                        custom: '10192',
                        t: 2,
                        s: 'rILI9F',
                    },
                    71: {
                        f: '=BU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    72: {
                        v: 0,
                        custom: '10194',
                        t: 2,
                        s: 'rILI9F',
                    },
                    73: {
                        f: '=BW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    74: {
                        v: 0,
                        custom: '10196',
                        t: 2,
                        s: 'rILI9F',
                    },
                    75: {
                        f: '=BY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    76: {
                        v: 0,
                        custom: '10198',
                        t: 2,
                        s: 'rILI9F',
                    },
                    77: {
                        f: '=CA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    78: {
                        v: 0,
                        custom: '10200',
                        t: 2,
                        s: 'rILI9F',
                    },
                    79: {
                        f: '=CC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    80: {
                        v: 0,
                        custom: '10202',
                        t: 2,
                        s: 'rILI9F',
                    },
                    81: {
                        f: '=CE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    82: {
                        v: 0,
                        custom: '10204',
                        t: 2,
                        s: 'rILI9F',
                    },
                    83: {
                        f: '=CG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    84: {
                        v: 0,
                        custom: '10206',
                        t: 2,
                        s: 'rILI9F',
                    },
                    85: {
                        f: '=CI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    86: {
                        v: 0,
                        custom: '10208',
                        t: 2,
                        s: 'rILI9F',
                    },
                    87: {
                        f: '=CK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    88: {
                        v: 0,
                        custom: '10210',
                        t: 2,
                        s: 'rILI9F',
                    },
                    89: {
                        f: '=CM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    90: {
                        v: 0,
                        custom: '10212',
                        t: 2,
                        s: 'rILI9F',
                    },
                    91: {
                        f: '=CO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    92: {
                        v: 0,
                        custom: '10214',
                        t: 2,
                        s: 'rILI9F',
                    },
                    93: {
                        f: '=CQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    94: {
                        v: 0,
                        custom: '10216',
                        t: 2,
                        s: 'rILI9F',
                    },
                    95: {
                        f: '=CS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    96: {
                        v: 0,
                        custom: '10218',
                        t: 2,
                        s: 'rILI9F',
                    },
                    97: {
                        f: '=CU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    98: {
                        v: 0,
                        custom: '10220',
                        t: 2,
                        s: 'rILI9F',
                    },
                    99: {
                        f: '=CW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    100: {
                        v: 0,
                        custom: '10222',
                        t: 2,
                        s: 'rILI9F',
                    },
                    101: {
                        f: '=CY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    102: {
                        v: 0,
                        custom: '10224',
                        t: 2,
                        s: 'rILI9F',
                    },
                    103: {
                        f: '=DA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    104: {
                        v: 0,
                        custom: '10226',
                        t: 2,
                        s: 'rILI9F',
                    },
                    105: {
                        f: '=DC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    106: {
                        v: 0,
                        custom: '10228',
                        t: 2,
                        s: 'rILI9F',
                    },
                    107: {
                        f: '=DE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    108: {
                        v: 0,
                        custom: '10230',
                        t: 2,
                        s: 'rILI9F',
                    },
                    109: {
                        f: '=DG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    110: {
                        v: 0,
                        custom: '10232',
                        t: 2,
                        s: 'rILI9F',
                    },
                    111: {
                        f: '=DI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    112: {
                        v: 0,
                        custom: '10234',
                        t: 2,
                        s: 'rILI9F',
                    },
                    113: {
                        f: '=DK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    114: {
                        v: 0,
                        custom: '10236',
                        t: 2,
                        s: 'rILI9F',
                    },
                    115: {
                        f: '=DM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    116: {
                        v: 0,
                        custom: '10238',
                        t: 2,
                        s: 'rILI9F',
                    },
                    117: {
                        f: '=DO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    118: {
                        v: 0,
                        custom: '10240',
                        t: 2,
                        s: 'rILI9F',
                    },
                    119: {
                        f: '=DQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    120: {
                        v: 0,
                        custom: '10242',
                        t: 2,
                        s: 'rILI9F',
                    },
                    121: {
                        f: '=DS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    122: {
                        v: 0,
                        custom: '10244',
                        t: 2,
                        s: 'rILI9F',
                    },
                    123: {
                        f: '=DU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    124: {
                        v: 0,
                        custom: '10246',
                        t: 2,
                        s: 'rILI9F',
                    },
                    125: {
                        f: '=DW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    126: {
                        v: 0,
                        custom: '10248',
                        t: 2,
                        s: 'rILI9F',
                    },
                    127: {
                        f: '=DY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    128: {
                        v: 0,
                        custom: '10250',
                        t: 2,
                        s: 'rILI9F',
                    },
                    129: {
                        f: '=EA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    130: {
                        v: 0,
                        custom: '10252',
                        t: 2,
                        s: 'rILI9F',
                    },
                    131: {
                        f: '=EC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    132: {
                        v: 0,
                        custom: '10254',
                        t: 2,
                        s: 'rILI9F',
                    },
                    133: {
                        f: '=EE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    134: {
                        v: 0,
                        custom: '10256',
                        t: 2,
                        s: 'rILI9F',
                    },
                    135: {
                        f: '=EG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    136: {
                        v: 0,
                        custom: '10258',
                        t: 2,
                        s: 'rILI9F',
                    },
                    137: {
                        f: '=EI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    138: {
                        v: 0,
                        custom: '10260',
                        t: 2,
                        s: 'rILI9F',
                    },
                    139: {
                        f: '=EK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    140: {
                        v: 0,
                        custom: '10262',
                        t: 2,
                        s: 'rILI9F',
                    },
                    141: {
                        f: '=EM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    142: {
                        v: 0,
                        custom: '10264',
                        t: 2,
                        s: 'rILI9F',
                    },
                    143: {
                        f: '=EO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    144: {
                        v: 0,
                        custom: '10266',
                        t: 2,
                        s: 'rILI9F',
                    },
                    145: {
                        f: '=EQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    146: {
                        v: 0,
                        custom: '10268',
                        t: 2,
                        s: 'rILI9F',
                    },
                    147: {
                        f: '=ES11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    148: {
                        v: 0,
                        custom: '10270',
                        t: 2,
                        s: 'rILI9F',
                    },
                    149: {
                        f: '=EU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    150: {
                        v: 0,
                        custom: '10272',
                        t: 2,
                        s: 'rILI9F',
                    },
                    151: {
                        f: '=EW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    152: {
                        v: 0,
                        custom: '10274',
                        t: 2,
                        s: 'rILI9F',
                    },
                    153: {
                        f: '=EY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    154: {
                        v: 0,
                        custom: '10276',
                        t: 2,
                        s: 'rILI9F',
                    },
                    155: {
                        f: '=FA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    156: {
                        v: 0,
                        custom: '10278',
                        t: 2,
                        s: 'rILI9F',
                    },
                    157: {
                        f: '=FC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    158: {
                        v: 0,
                        custom: '10280',
                        t: 2,
                        s: 'rILI9F',
                    },
                    159: {
                        f: '=FE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    160: {
                        v: 0,
                        custom: '10282',
                        t: 2,
                        s: 'rILI9F',
                    },
                    161: {
                        f: '=FG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    162: {
                        v: 0,
                        custom: '10284',
                        t: 2,
                        s: 'rILI9F',
                    },
                    163: {
                        f: '=FI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    164: {
                        v: 0,
                        custom: '10286',
                        t: 2,
                        s: 'rILI9F',
                    },
                    165: {
                        f: '=FK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    166: {
                        v: 0,
                        custom: '10288',
                        t: 2,
                        s: 'rILI9F',
                    },
                    167: {
                        f: '=FM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    168: {
                        v: 0,
                        custom: '10290',
                        t: 2,
                        s: 'rILI9F',
                    },
                    169: {
                        f: '=FO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    170: {
                        v: 0,
                        custom: '10292',
                        t: 2,
                        s: 'rILI9F',
                    },
                    171: {
                        f: '=FQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    172: {
                        v: 0,
                        custom: '10294',
                        t: 2,
                        s: 'rILI9F',
                    },
                    173: {
                        f: '=FS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    174: {
                        v: 0,
                        custom: '10296',
                        t: 2,
                        s: 'rILI9F',
                    },
                    175: {
                        f: '=FU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    176: {
                        v: 0,
                        custom: '10298',
                        t: 2,
                        s: 'rILI9F',
                    },
                    177: {
                        f: '=FW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    178: {
                        v: 0,
                        custom: '10300',
                        t: 2,
                        s: 'rILI9F',
                    },
                    179: {
                        f: '=FY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    180: {
                        v: 0,
                        custom: '10302',
                        t: 2,
                        s: 'rILI9F',
                    },
                    181: {
                        f: '=GA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    182: {
                        v: 0,
                        custom: '10304',
                        t: 2,
                        s: 'rILI9F',
                    },
                    183: {
                        f: '=GC11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    184: {
                        v: 0,
                        custom: '10306',
                        t: 2,
                        s: 'rILI9F',
                    },
                    185: {
                        f: '=GE11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    186: {
                        v: 0,
                        custom: '10308',
                        t: 2,
                        s: 'rILI9F',
                    },
                    187: {
                        f: '=GG11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    188: {
                        v: 0,
                        custom: '10310',
                        t: 2,
                        s: 'rILI9F',
                    },
                    189: {
                        f: '=GI11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    190: {
                        v: 0,
                        custom: '10312',
                        t: 2,
                        s: 'rILI9F',
                    },
                    191: {
                        f: '=GK11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    192: {
                        v: 0,
                        custom: '10314',
                        t: 2,
                        s: 'rILI9F',
                    },
                    193: {
                        f: '=GM11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    194: {
                        v: 0,
                        custom: '10164',
                        t: 2,
                        s: 'rILI9F',
                    },
                    195: {
                        f: '=GO11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    196: {
                        v: 0,
                        custom: '10154',
                        t: 2,
                        s: 'rILI9F',
                    },
                    197: {
                        f: '=GQ11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    198: {
                        v: 0,
                        custom: '10120',
                        t: 2,
                        s: 'rILI9F',
                    },
                    199: {
                        f: '=GS11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    200: {
                        v: 0,
                        custom: '10134',
                        t: 2,
                        s: 'rILI9F',
                    },
                    201: {
                        f: '=GU11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    202: {
                        v: 0,
                        custom: '10124',
                        t: 2,
                        s: 'rILI9F',
                    },
                    203: {
                        f: '=GW11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    204: {
                        v: 0,
                        custom: '11372',
                        t: 2,
                        s: 'rILI9F',
                    },
                    205: {
                        f: '=GY11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    206: {
                        v: 0,
                        custom: '10130',
                        t: 2,
                        s: 'rILI9F',
                    },
                    207: {
                        f: '=HA11/$H11',
                        v: 0,
                        t: 2,
                        s: 'rILI9F',
                    },
                    208: {
                        v: 0,
                        custom: '10140',
                        t: 2,
                        s: 'rILI9F',
                    },
                    209: {
                        v: '',
                        custom: 'rowPrjtotal',
                        t: 1,
                        s: 'CKxwJF',
>>>>>>> 9367a46da (perf(formula): add r_tree for dependency):examples/src/data/sheets/demo/default-workbook-data-demo.ts
=======
                    11: {
                        v: 12,
>>>>>>> efa80aa84 (fix(formula): big demo):examples/src/data/sheets/demo/default-workbook-data-demo.ts
                    },
                },
                11: {
                    4: {
                        v: 123,
                        t: 2,
                    },
                },
                12: {
                    4: {
                        v: '123tu',
                        t: 1,
                    },
                    5: {
                        v: 'sdfj',
                        t: 1,
                    },
                },
                13: {
                    4: {
                        v: 'ghj',
                        t: 1,
                    },
                    5: {
                        v: 'ghk',
                        t: 1,
                    },
                },
                17: {
                    4: {
                        v: 'fh',
                        t: 1,
                    },
                    5: {
                        v: 'jk',
                        t: 1,
                    },
                },
                18: {
                    4: {
                        v: 'dfg',
                        t: 1,
                    },
                    5: {
                        v: 'l',
                        t: 1,
                    },
                },
                19: {
                    4: {
                        v: 'sdfg',
                        t: 1,
                    },
                    5: {
                        v: 'h',
                        t: 1,
                    },
                },
                20: {
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
                    hd: 0,
                    h: 60,
                    ah: 60,
=======
                    0: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    1: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    2: {
                        v: '测试部门',
                        t: 1,
                        s: 'rILI9F',
                    },
                    3: {
                        v: 1000,
                        t: 2,
                        s: 'rILI9F',
                    },
=======
>>>>>>> efa80aa84 (fix(formula): big demo):examples/src/data/sheets/demo/default-workbook-data-demo.ts
                    4: {
                        v: 'fdgh',
                        t: 1,
                    },
                    5: {
                        v: 345,
                        t: 2,
                    },
                    8: {
                        v: 'linkTest',
                        t: 1,
                    },
                    12: {
                        v: 'linkTest哈哈哈哈',
                        t: 1,
                    },
>>>>>>> 9367a46da (perf(formula): add r_tree for dependency):examples/src/data/sheets/demo/default-workbook-data-demo.ts
                },
                21: {
                    4: {
                        v: 'sgh',
                        t: 1,
                    },
                    5: {
                        v: 'fgs',
                        t: 1,
                    },
                },
                22: {
                    4: {
                        v: 'sdfh',
                        t: 1,
                    },
                    5: {
                        v: 'gth',
                        t: 1,
                    },
                },
                23: {
                    5: {
                        v: 'iop',
                        t: 1,
                    },
                },
            },

=======
>>>>>>> d0467e0e9 (fix(formula): multi minus error):examples/src/data/sheets/demo/default-workbook-data-demo.ts
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 88,
            defaultRowHeight: 24,
            mergeData: [],
            cellData: {
                0: {
                    0: {
                        s: 'cbP8kH',
                        v: '销售代表',
                        t: 1,
                    },
                    1: {
                        s: 'TMfID0',
                        v: '负责区域',
                        t: 1,
                    },
                    2: {
                        s: 'TMfID0',
                        v: '产品',
                        t: 1,
                    },
                    3: {
                        s: 'TMfID0',
                        v: '利润',
                        t: 1,
                    },
                    4: {
                        f: '=IF(ISBLANK(FILTER(A2:D8,A2:A8="何石")),"-",FILTER(A2:D8,A2:A8="何石"))',
                    },
                    5: {},
                },
                1: {
                    0: {
                        s: 'ffUq_1',
                        v: '柏隼',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '东部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '苹果',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥1.33',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                2: {
                    0: {
                        s: 'ffUq_1',
                        v: '何石',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '南部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '香蕉',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥0.09',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                3: {
                    0: {
                        s: 'ffUq_1',
                        v: '柏隼',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '西部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '芒果',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥1.85',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                4: {
                    0: {
                        s: 'ffUq_1',
                        v: '何石',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '北部',
                        t: 1,
                    },
                    2: {
                        s: 'xrMXOi',
                        v: '',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥0.82',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                5: {
                    0: {
                        s: 'ffUq_1',
                        v: '何石',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '西部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '香蕉',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥1.25',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                6: {
                    0: {
                        s: 'ffUq_1',
                        v: '柏隼',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '东部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '苹果',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥0.72',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                7: {
                    0: {
                        s: 'ffUq_1',
                        v: '何石',
                        t: 1,
                    },
                    1: {
                        s: '-Cr5uu',
                        v: '北部',
                        t: 1,
                    },
                    2: {
                        s: '-Cr5uu',
                        v: '芒果',
                        t: 1,
                    },
                    3: {
                        s: '-Cr5uu',
                        v: '￥0.54',
                        t: 1,
                    },
                    4: {},
                    5: {},
                },
                8: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                9: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                10: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                11: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                12: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                13: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                    6: {
                        f: '=LET(x, 5, SUM(x, 1))',
                        v: 6,
                        t: 2,
                    },
                },
                14: {
                    0: {},
                    1: {},
                    2: {},
                    3: {},
                    4: {},
                    5: {},
                },
                15: {
                    0: {},
                    1: {},
                },
                16: {
                    0: {},
                    1: {},
                },
                17: {
                    0: {},
                    1: {},
                },
                19: {
                    2: {
                        f: '=LET(filterCriteria,"何石",filteredRange,FILTER(A2:D8,A2:A8=filterCriteria),IF(ISBLANK(filteredRange),"-",filteredRange))',
                        v: '#SPILL!',
                        t: 1,
                    },
                },
            },
            rowData: {
                0: {
                    hd: 0,
                    h: 21,
                    ah: 24,
                },
                1: {
                    hd: 0,
                    h: 21,
                },
                2: {
                    hd: 0,
                    h: 21,
                },
                3: {
                    hd: 0,
                    h: 21,
                },
                4: {
                    hd: 0,
                    h: 21,
                },
                5: {
                    hd: 0,
                    h: 21,
                },
                6: {
                    hd: 0,
                    h: 21,
                },
                7: {
                    hd: 0,
                    h: 21,
                },
                13: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                15: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
                19: {
                    hd: 0,
                    h: 24,
                    ah: 24,
                },
            },
            columnData: {
                0: {
                    w: 100,
                    hd: 0,
                },
                1: {
                    w: 100,
                    hd: 0,
                },
                2: {
                    w: 100,
                    hd: 0,
                },
                3: {
                    w: 100,
                    hd: 0,
                },
            },
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            selections: [
                'A1',
            ],
            rightToLeft: 0,
        },
    },
    resources: [
        {
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
<<<<<<< HEAD:mockdata/src/sheets/demo/default-workbook-data-demo.ts
            name: DATA_VALIDATION_PLUGIN_NAME,
            data: JSON.stringify({
                'sheet-0011': dataValidation,
                'dv-test': dv2,
            }),
=======
            name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DEFINED_NAME_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DATA_VALIDATION_PLUGIN',
            data: '{"sheet-1":[{"uid":"7995749","formula1":"0","errorStyle":1,"ranges":[{"endColumn":10,"startRow":8,"startColumn":10,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5393133","formula1":"0","errorStyle":1,"ranges":[{"endColumn":12,"startRow":8,"startColumn":12,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6706342","formula1":"0","errorStyle":1,"ranges":[{"endColumn":14,"startRow":8,"startColumn":14,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1292442","formula1":"0","errorStyle":1,"ranges":[{"endColumn":16,"startRow":8,"startColumn":16,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5087000","formula1":"0","errorStyle":1,"ranges":[{"endColumn":18,"startRow":8,"startColumn":18,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9260567","formula1":"0","errorStyle":1,"ranges":[{"endColumn":20,"startRow":8,"startColumn":20,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9016196","formula1":"0","errorStyle":1,"ranges":[{"endColumn":22,"startRow":8,"startColumn":22,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7160993","formula1":"0","errorStyle":1,"ranges":[{"endColumn":24,"startRow":8,"startColumn":24,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3492966","formula1":"0","errorStyle":1,"ranges":[{"endColumn":26,"startRow":8,"startColumn":26,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2802661","formula1":"0","errorStyle":1,"ranges":[{"endColumn":28,"startRow":8,"startColumn":28,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7319233","formula1":"0","errorStyle":1,"ranges":[{"endColumn":30,"startRow":8,"startColumn":30,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1766349","formula1":"0","errorStyle":1,"ranges":[{"endColumn":32,"startRow":8,"startColumn":32,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8159385","formula1":"0","errorStyle":1,"ranges":[{"endColumn":34,"startRow":8,"startColumn":34,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4609062","formula1":"0","errorStyle":1,"ranges":[{"endColumn":36,"startRow":8,"startColumn":36,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5173305","formula1":"0","errorStyle":1,"ranges":[{"endColumn":38,"startRow":8,"startColumn":38,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7820202","formula1":"0","errorStyle":1,"ranges":[{"endColumn":40,"startRow":8,"startColumn":40,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1547110","formula1":"0","errorStyle":1,"ranges":[{"endColumn":42,"startRow":8,"startColumn":42,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2693244","formula1":"0","errorStyle":1,"ranges":[{"endColumn":44,"startRow":8,"startColumn":44,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2585756","formula1":"0","errorStyle":1,"ranges":[{"endColumn":46,"startRow":8,"startColumn":46,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3112613","formula1":"0","errorStyle":1,"ranges":[{"endColumn":48,"startRow":8,"startColumn":48,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6852005","formula1":"0","errorStyle":1,"ranges":[{"endColumn":50,"startRow":8,"startColumn":50,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2739852","formula1":"0","errorStyle":1,"ranges":[{"endColumn":52,"startRow":8,"startColumn":52,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7414351","formula1":"0","errorStyle":1,"ranges":[{"endColumn":54,"startRow":8,"startColumn":54,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9089306","formula1":"0","errorStyle":1,"ranges":[{"endColumn":56,"startRow":8,"startColumn":56,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9269328","formula1":"0","errorStyle":1,"ranges":[{"endColumn":58,"startRow":8,"startColumn":58,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2058374","formula1":"0","errorStyle":1,"ranges":[{"endColumn":60,"startRow":8,"startColumn":60,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6839696","formula1":"0","errorStyle":1,"ranges":[{"endColumn":62,"startRow":8,"startColumn":62,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4450513","formula1":"0","errorStyle":1,"ranges":[{"endColumn":64,"startRow":8,"startColumn":64,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5790150","formula1":"0","errorStyle":1,"ranges":[{"endColumn":66,"startRow":8,"startColumn":66,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3759974","formula1":"0","errorStyle":1,"ranges":[{"endColumn":68,"startRow":8,"startColumn":68,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9000700","formula1":"0","errorStyle":1,"ranges":[{"endColumn":70,"startRow":8,"startColumn":70,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6130607","formula1":"0","errorStyle":1,"ranges":[{"endColumn":72,"startRow":8,"startColumn":72,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9638041","formula1":"0","errorStyle":1,"ranges":[{"endColumn":74,"startRow":8,"startColumn":74,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4696490","formula1":"0","errorStyle":1,"ranges":[{"endColumn":76,"startRow":8,"startColumn":76,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6540762","formula1":"0","errorStyle":1,"ranges":[{"endColumn":78,"startRow":8,"startColumn":78,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5531271","formula1":"0","errorStyle":1,"ranges":[{"endColumn":80,"startRow":8,"startColumn":80,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8008578","formula1":"0","errorStyle":1,"ranges":[{"endColumn":82,"startRow":8,"startColumn":82,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4890444","formula1":"0","errorStyle":1,"ranges":[{"endColumn":84,"startRow":8,"startColumn":84,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6174014","formula1":"0","errorStyle":1,"ranges":[{"endColumn":86,"startRow":8,"startColumn":86,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7483397","formula1":"0","errorStyle":1,"ranges":[{"endColumn":88,"startRow":8,"startColumn":88,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8200120","formula1":"0","errorStyle":1,"ranges":[{"endColumn":90,"startRow":8,"startColumn":90,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7731285","formula1":"0","errorStyle":1,"ranges":[{"endColumn":92,"startRow":8,"startColumn":92,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7678164","formula1":"0","errorStyle":1,"ranges":[{"endColumn":94,"startRow":8,"startColumn":94,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3028638","formula1":"0","errorStyle":1,"ranges":[{"endColumn":96,"startRow":8,"startColumn":96,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1543858","formula1":"0","errorStyle":1,"ranges":[{"endColumn":98,"startRow":8,"startColumn":98,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9638012","formula1":"0","errorStyle":1,"ranges":[{"endColumn":100,"startRow":8,"startColumn":100,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9797278","formula1":"0","errorStyle":1,"ranges":[{"endColumn":102,"startRow":8,"startColumn":102,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5847150","formula1":"0","errorStyle":1,"ranges":[{"endColumn":104,"startRow":8,"startColumn":104,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9192901","formula1":"0","errorStyle":1,"ranges":[{"endColumn":106,"startRow":8,"startColumn":106,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0677581","formula1":"0","errorStyle":1,"ranges":[{"endColumn":108,"startRow":8,"startColumn":108,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7613300","formula1":"0","errorStyle":1,"ranges":[{"endColumn":110,"startRow":8,"startColumn":110,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1653852","formula1":"0","errorStyle":1,"ranges":[{"endColumn":112,"startRow":8,"startColumn":112,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9173213","formula1":"0","errorStyle":1,"ranges":[{"endColumn":114,"startRow":8,"startColumn":114,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6535657","formula1":"0","errorStyle":1,"ranges":[{"endColumn":116,"startRow":8,"startColumn":116,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6564656","formula1":"0","errorStyle":1,"ranges":[{"endColumn":118,"startRow":8,"startColumn":118,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8920756","formula1":"0","errorStyle":1,"ranges":[{"endColumn":120,"startRow":8,"startColumn":120,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8428119","formula1":"0","errorStyle":1,"ranges":[{"endColumn":122,"startRow":8,"startColumn":122,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7903594","formula1":"0","errorStyle":1,"ranges":[{"endColumn":124,"startRow":8,"startColumn":124,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6290358","formula1":"0","errorStyle":1,"ranges":[{"endColumn":126,"startRow":8,"startColumn":126,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3870319","formula1":"0","errorStyle":1,"ranges":[{"endColumn":128,"startRow":8,"startColumn":128,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3210344","formula1":"0","errorStyle":1,"ranges":[{"endColumn":130,"startRow":8,"startColumn":130,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6194380","formula1":"0","errorStyle":1,"ranges":[{"endColumn":132,"startRow":8,"startColumn":132,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4706502","formula1":"0","errorStyle":1,"ranges":[{"endColumn":134,"startRow":8,"startColumn":134,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7635073","formula1":"0","errorStyle":1,"ranges":[{"endColumn":136,"startRow":8,"startColumn":136,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8298270","formula1":"0","errorStyle":1,"ranges":[{"endColumn":138,"startRow":8,"startColumn":138,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4833618","formula1":"0","errorStyle":1,"ranges":[{"endColumn":140,"startRow":8,"startColumn":140,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0908169","formula1":"0","errorStyle":1,"ranges":[{"endColumn":142,"startRow":8,"startColumn":142,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5732135","formula1":"0","errorStyle":1,"ranges":[{"endColumn":144,"startRow":8,"startColumn":144,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9005366","formula1":"0","errorStyle":1,"ranges":[{"endColumn":146,"startRow":8,"startColumn":146,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2070572","formula1":"0","errorStyle":1,"ranges":[{"endColumn":148,"startRow":8,"startColumn":148,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3644941","formula1":"0","errorStyle":1,"ranges":[{"endColumn":150,"startRow":8,"startColumn":150,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7644639","formula1":"0","errorStyle":1,"ranges":[{"endColumn":152,"startRow":8,"startColumn":152,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9745401","formula1":"0","errorStyle":1,"ranges":[{"endColumn":154,"startRow":8,"startColumn":154,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1836722","formula1":"0","errorStyle":1,"ranges":[{"endColumn":156,"startRow":8,"startColumn":156,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4942063","formula1":"0","errorStyle":1,"ranges":[{"endColumn":158,"startRow":8,"startColumn":158,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6495570","formula1":"0","errorStyle":1,"ranges":[{"endColumn":160,"startRow":8,"startColumn":160,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0819027","formula1":"0","errorStyle":1,"ranges":[{"endColumn":162,"startRow":8,"startColumn":162,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9200231","formula1":"0","errorStyle":1,"ranges":[{"endColumn":164,"startRow":8,"startColumn":164,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8568997","formula1":"0","errorStyle":1,"ranges":[{"endColumn":166,"startRow":8,"startColumn":166,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5055682","formula1":"0","errorStyle":1,"ranges":[{"endColumn":168,"startRow":8,"startColumn":168,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7037385","formula1":"0","errorStyle":1,"ranges":[{"endColumn":170,"startRow":8,"startColumn":170,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4495263","formula1":"0","errorStyle":1,"ranges":[{"endColumn":172,"startRow":8,"startColumn":172,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5251588","formula1":"0","errorStyle":1,"ranges":[{"endColumn":174,"startRow":8,"startColumn":174,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0359174","formula1":"0","errorStyle":1,"ranges":[{"endColumn":176,"startRow":8,"startColumn":176,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9210512","formula1":"0","errorStyle":1,"ranges":[{"endColumn":178,"startRow":8,"startColumn":178,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3061807","formula1":"0","errorStyle":1,"ranges":[{"endColumn":180,"startRow":8,"startColumn":180,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4272700","formula1":"0","errorStyle":1,"ranges":[{"endColumn":182,"startRow":8,"startColumn":182,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3222332","formula1":"0","errorStyle":1,"ranges":[{"endColumn":184,"startRow":8,"startColumn":184,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2637152","formula1":"0","errorStyle":1,"ranges":[{"endColumn":186,"startRow":8,"startColumn":186,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8933777","formula1":"0","errorStyle":1,"ranges":[{"endColumn":188,"startRow":8,"startColumn":188,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5273959","formula1":"0","errorStyle":1,"ranges":[{"endColumn":190,"startRow":8,"startColumn":190,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4858874","formula1":"0","errorStyle":1,"ranges":[{"endColumn":192,"startRow":8,"startColumn":192,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0824740","formula1":"0","errorStyle":1,"ranges":[{"endColumn":194,"startRow":8,"startColumn":194,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0085805","formula1":"0","errorStyle":1,"ranges":[{"endColumn":196,"startRow":8,"startColumn":196,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0136508","formula1":"0","errorStyle":1,"ranges":[{"endColumn":198,"startRow":8,"startColumn":198,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6578434","formula1":"0","errorStyle":1,"ranges":[{"endColumn":200,"startRow":8,"startColumn":200,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0597171","formula1":"0","errorStyle":1,"ranges":[{"endColumn":202,"startRow":8,"startColumn":202,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3714332","formula1":"0","errorStyle":1,"ranges":[{"endColumn":204,"startRow":8,"startColumn":204,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3408195","formula1":"0","errorStyle":1,"ranges":[{"endColumn":206,"startRow":8,"startColumn":206,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6502781","formula1":"0","errorStyle":1,"ranges":[{"endColumn":208,"startRow":8,"startColumn":208,"endRow":87}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4668121","formula1":"=I9=0","ranges":[{"endColumn":8,"startRow":8,"startColumn":8,"endRow":87}],"showInputMessage":true,"type":"custom","error":"项目总工时必须等于当前月份总工时"}],"sheet-2":[{"uid":"4681782","formula1":"0","errorStyle":1,"ranges":[{"endColumn":10,"startRow":8,"startColumn":10,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9107307","formula1":"0","errorStyle":1,"ranges":[{"endColumn":12,"startRow":8,"startColumn":12,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4157443","formula1":"0","errorStyle":1,"ranges":[{"endColumn":14,"startRow":8,"startColumn":14,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0843989","formula1":"0","errorStyle":1,"ranges":[{"endColumn":16,"startRow":8,"startColumn":16,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5468030","formula1":"0","errorStyle":1,"ranges":[{"endColumn":18,"startRow":8,"startColumn":18,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2339934","formula1":"0","errorStyle":1,"ranges":[{"endColumn":20,"startRow":8,"startColumn":20,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7699249","formula1":"0","errorStyle":1,"ranges":[{"endColumn":22,"startRow":8,"startColumn":22,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6975555","formula1":"0","errorStyle":1,"ranges":[{"endColumn":24,"startRow":8,"startColumn":24,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5135749","formula1":"0","errorStyle":1,"ranges":[{"endColumn":26,"startRow":8,"startColumn":26,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3643820","formula1":"0","errorStyle":1,"ranges":[{"endColumn":28,"startRow":8,"startColumn":28,"endRow":37}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1867133","formula1":"=I9=0","ranges":[{"endColumn":8,"startRow":8,"startColumn":8,"endRow":37}],"showInputMessage":true,"type":"custom","error":"项目总工时必须等于当前月份总工时"}],"sheet-3":[{"uid":"7561493","formula1":"0","errorStyle":1,"ranges":[{"endColumn":10,"startRow":8,"startColumn":10,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7833501","formula1":"0","errorStyle":1,"ranges":[{"endColumn":12,"startRow":8,"startColumn":12,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1618496","formula1":"0","errorStyle":1,"ranges":[{"endColumn":14,"startRow":8,"startColumn":14,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1997881","formula1":"0","errorStyle":1,"ranges":[{"endColumn":16,"startRow":8,"startColumn":16,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0006702","formula1":"0","errorStyle":1,"ranges":[{"endColumn":18,"startRow":8,"startColumn":18,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5450630","formula1":"0","errorStyle":1,"ranges":[{"endColumn":20,"startRow":8,"startColumn":20,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6856437","formula1":"0","errorStyle":1,"ranges":[{"endColumn":22,"startRow":8,"startColumn":22,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6544270","formula1":"0","errorStyle":1,"ranges":[{"endColumn":24,"startRow":8,"startColumn":24,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4754853","formula1":"0","errorStyle":1,"ranges":[{"endColumn":26,"startRow":8,"startColumn":26,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1270506","formula1":"0","errorStyle":1,"ranges":[{"endColumn":28,"startRow":8,"startColumn":28,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7090012","formula1":"0","errorStyle":1,"ranges":[{"endColumn":30,"startRow":8,"startColumn":30,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4720367","formula1":"0","errorStyle":1,"ranges":[{"endColumn":32,"startRow":8,"startColumn":32,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1034160","formula1":"0","errorStyle":1,"ranges":[{"endColumn":34,"startRow":8,"startColumn":34,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1097351","formula1":"0","errorStyle":1,"ranges":[{"endColumn":36,"startRow":8,"startColumn":36,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6359552","formula1":"0","errorStyle":1,"ranges":[{"endColumn":38,"startRow":8,"startColumn":38,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4551707","formula1":"0","errorStyle":1,"ranges":[{"endColumn":40,"startRow":8,"startColumn":40,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8446157","formula1":"0","errorStyle":1,"ranges":[{"endColumn":42,"startRow":8,"startColumn":42,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6275963","formula1":"0","errorStyle":1,"ranges":[{"endColumn":44,"startRow":8,"startColumn":44,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9837848","formula1":"0","errorStyle":1,"ranges":[{"endColumn":46,"startRow":8,"startColumn":46,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6233096","formula1":"0","errorStyle":1,"ranges":[{"endColumn":48,"startRow":8,"startColumn":48,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6553175","formula1":"0","errorStyle":1,"ranges":[{"endColumn":50,"startRow":8,"startColumn":50,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2287769","formula1":"0","errorStyle":1,"ranges":[{"endColumn":52,"startRow":8,"startColumn":52,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7145761","formula1":"0","errorStyle":1,"ranges":[{"endColumn":54,"startRow":8,"startColumn":54,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9148245","formula1":"0","errorStyle":1,"ranges":[{"endColumn":56,"startRow":8,"startColumn":56,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1467539","formula1":"0","errorStyle":1,"ranges":[{"endColumn":58,"startRow":8,"startColumn":58,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2143001","formula1":"0","errorStyle":1,"ranges":[{"endColumn":60,"startRow":8,"startColumn":60,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6665921","formula1":"0","errorStyle":1,"ranges":[{"endColumn":62,"startRow":8,"startColumn":62,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6143376","formula1":"0","errorStyle":1,"ranges":[{"endColumn":64,"startRow":8,"startColumn":64,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0599535","formula1":"0","errorStyle":1,"ranges":[{"endColumn":66,"startRow":8,"startColumn":66,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4632575","formula1":"0","errorStyle":1,"ranges":[{"endColumn":68,"startRow":8,"startColumn":68,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0833514","formula1":"0","errorStyle":1,"ranges":[{"endColumn":70,"startRow":8,"startColumn":70,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6241495","formula1":"0","errorStyle":1,"ranges":[{"endColumn":72,"startRow":8,"startColumn":72,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6424569","formula1":"0","errorStyle":1,"ranges":[{"endColumn":74,"startRow":8,"startColumn":74,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1767814","formula1":"0","errorStyle":1,"ranges":[{"endColumn":76,"startRow":8,"startColumn":76,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0967058","formula1":"0","errorStyle":1,"ranges":[{"endColumn":78,"startRow":8,"startColumn":78,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3238241","formula1":"0","errorStyle":1,"ranges":[{"endColumn":80,"startRow":8,"startColumn":80,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2587364","formula1":"0","errorStyle":1,"ranges":[{"endColumn":82,"startRow":8,"startColumn":82,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0848488","formula1":"0","errorStyle":1,"ranges":[{"endColumn":84,"startRow":8,"startColumn":84,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6427038","formula1":"0","errorStyle":1,"ranges":[{"endColumn":86,"startRow":8,"startColumn":86,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3996375","formula1":"0","errorStyle":1,"ranges":[{"endColumn":88,"startRow":8,"startColumn":88,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1725024","formula1":"0","errorStyle":1,"ranges":[{"endColumn":90,"startRow":8,"startColumn":90,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6383713","formula1":"0","errorStyle":1,"ranges":[{"endColumn":92,"startRow":8,"startColumn":92,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2085792","formula1":"0","errorStyle":1,"ranges":[{"endColumn":94,"startRow":8,"startColumn":94,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0478223","formula1":"0","errorStyle":1,"ranges":[{"endColumn":96,"startRow":8,"startColumn":96,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3741452","formula1":"0","errorStyle":1,"ranges":[{"endColumn":98,"startRow":8,"startColumn":98,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1429748","formula1":"0","errorStyle":1,"ranges":[{"endColumn":100,"startRow":8,"startColumn":100,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1050198","formula1":"0","errorStyle":1,"ranges":[{"endColumn":102,"startRow":8,"startColumn":102,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1262536","formula1":"0","errorStyle":1,"ranges":[{"endColumn":104,"startRow":8,"startColumn":104,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6797498","formula1":"0","errorStyle":1,"ranges":[{"endColumn":106,"startRow":8,"startColumn":106,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3935800","formula1":"0","errorStyle":1,"ranges":[{"endColumn":108,"startRow":8,"startColumn":108,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2180408","formula1":"0","errorStyle":1,"ranges":[{"endColumn":110,"startRow":8,"startColumn":110,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7232598","formula1":"0","errorStyle":1,"ranges":[{"endColumn":112,"startRow":8,"startColumn":112,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7697484","formula1":"0","errorStyle":1,"ranges":[{"endColumn":114,"startRow":8,"startColumn":114,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4984494","formula1":"0","errorStyle":1,"ranges":[{"endColumn":116,"startRow":8,"startColumn":116,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9937509","formula1":"0","errorStyle":1,"ranges":[{"endColumn":118,"startRow":8,"startColumn":118,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2879228","formula1":"0","errorStyle":1,"ranges":[{"endColumn":120,"startRow":8,"startColumn":120,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8239383","formula1":"0","errorStyle":1,"ranges":[{"endColumn":122,"startRow":8,"startColumn":122,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3357655","formula1":"0","errorStyle":1,"ranges":[{"endColumn":124,"startRow":8,"startColumn":124,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6826812","formula1":"0","errorStyle":1,"ranges":[{"endColumn":126,"startRow":8,"startColumn":126,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2854191","formula1":"0","errorStyle":1,"ranges":[{"endColumn":128,"startRow":8,"startColumn":128,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4090307","formula1":"0","errorStyle":1,"ranges":[{"endColumn":130,"startRow":8,"startColumn":130,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6880474","formula1":"0","errorStyle":1,"ranges":[{"endColumn":132,"startRow":8,"startColumn":132,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4846900","formula1":"0","errorStyle":1,"ranges":[{"endColumn":134,"startRow":8,"startColumn":134,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1083579","formula1":"0","errorStyle":1,"ranges":[{"endColumn":136,"startRow":8,"startColumn":136,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9565867","formula1":"0","errorStyle":1,"ranges":[{"endColumn":138,"startRow":8,"startColumn":138,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3973591","formula1":"0","errorStyle":1,"ranges":[{"endColumn":140,"startRow":8,"startColumn":140,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1179793","formula1":"0","errorStyle":1,"ranges":[{"endColumn":142,"startRow":8,"startColumn":142,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4981688","formula1":"0","errorStyle":1,"ranges":[{"endColumn":144,"startRow":8,"startColumn":144,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6132508","formula1":"0","errorStyle":1,"ranges":[{"endColumn":146,"startRow":8,"startColumn":146,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5339659","formula1":"0","errorStyle":1,"ranges":[{"endColumn":148,"startRow":8,"startColumn":148,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1964568","formula1":"0","errorStyle":1,"ranges":[{"endColumn":150,"startRow":8,"startColumn":150,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6636755","formula1":"0","errorStyle":1,"ranges":[{"endColumn":152,"startRow":8,"startColumn":152,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7734814","formula1":"0","errorStyle":1,"ranges":[{"endColumn":154,"startRow":8,"startColumn":154,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7058177","formula1":"0","errorStyle":1,"ranges":[{"endColumn":156,"startRow":8,"startColumn":156,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9405249","formula1":"0","errorStyle":1,"ranges":[{"endColumn":158,"startRow":8,"startColumn":158,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4315561","formula1":"0","errorStyle":1,"ranges":[{"endColumn":160,"startRow":8,"startColumn":160,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0394956","formula1":"0","errorStyle":1,"ranges":[{"endColumn":162,"startRow":8,"startColumn":162,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5236790","formula1":"0","errorStyle":1,"ranges":[{"endColumn":164,"startRow":8,"startColumn":164,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4630846","formula1":"0","errorStyle":1,"ranges":[{"endColumn":166,"startRow":8,"startColumn":166,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4772388","formula1":"0","errorStyle":1,"ranges":[{"endColumn":168,"startRow":8,"startColumn":168,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5735827","formula1":"0","errorStyle":1,"ranges":[{"endColumn":170,"startRow":8,"startColumn":170,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7355674","formula1":"0","errorStyle":1,"ranges":[{"endColumn":172,"startRow":8,"startColumn":172,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0831828","formula1":"0","errorStyle":1,"ranges":[{"endColumn":174,"startRow":8,"startColumn":174,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3244452","formula1":"0","errorStyle":1,"ranges":[{"endColumn":176,"startRow":8,"startColumn":176,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6399001","formula1":"0","errorStyle":1,"ranges":[{"endColumn":178,"startRow":8,"startColumn":178,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5058781","formula1":"0","errorStyle":1,"ranges":[{"endColumn":180,"startRow":8,"startColumn":180,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8181086","formula1":"0","errorStyle":1,"ranges":[{"endColumn":182,"startRow":8,"startColumn":182,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9025047","formula1":"0","errorStyle":1,"ranges":[{"endColumn":184,"startRow":8,"startColumn":184,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8016353","formula1":"0","errorStyle":1,"ranges":[{"endColumn":186,"startRow":8,"startColumn":186,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2008164","formula1":"0","errorStyle":1,"ranges":[{"endColumn":188,"startRow":8,"startColumn":188,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6826937","formula1":"0","errorStyle":1,"ranges":[{"endColumn":190,"startRow":8,"startColumn":190,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9423167","formula1":"0","errorStyle":1,"ranges":[{"endColumn":192,"startRow":8,"startColumn":192,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0531804","formula1":"0","errorStyle":1,"ranges":[{"endColumn":194,"startRow":8,"startColumn":194,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7786481","formula1":"0","errorStyle":1,"ranges":[{"endColumn":196,"startRow":8,"startColumn":196,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6554428","formula1":"0","errorStyle":1,"ranges":[{"endColumn":198,"startRow":8,"startColumn":198,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7497345","formula1":"0","errorStyle":1,"ranges":[{"endColumn":200,"startRow":8,"startColumn":200,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9223147","formula1":"0","errorStyle":1,"ranges":[{"endColumn":202,"startRow":8,"startColumn":202,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0678958","formula1":"0","errorStyle":1,"ranges":[{"endColumn":204,"startRow":8,"startColumn":204,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7182701","formula1":"0","errorStyle":1,"ranges":[{"endColumn":206,"startRow":8,"startColumn":206,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7731445","formula1":"0","errorStyle":1,"ranges":[{"endColumn":208,"startRow":8,"startColumn":208,"endRow":204}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0628176","formula1":"=I9=0","ranges":[{"endColumn":8,"startRow":8,"startColumn":8,"endRow":204}],"showInputMessage":true,"type":"custom","error":"项目总工时必须等于当前月份总工时"}],"sheet-4":[{"uid":"4246089","formula1":"0","errorStyle":1,"ranges":[{"endColumn":10,"startRow":8,"startColumn":10,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3627054","formula1":"0","errorStyle":1,"ranges":[{"endColumn":12,"startRow":8,"startColumn":12,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7754194","formula1":"0","errorStyle":1,"ranges":[{"endColumn":14,"startRow":8,"startColumn":14,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4601285","formula1":"0","errorStyle":1,"ranges":[{"endColumn":16,"startRow":8,"startColumn":16,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1267163","formula1":"0","errorStyle":1,"ranges":[{"endColumn":18,"startRow":8,"startColumn":18,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3165548","formula1":"0","errorStyle":1,"ranges":[{"endColumn":20,"startRow":8,"startColumn":20,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3747201","formula1":"0","errorStyle":1,"ranges":[{"endColumn":22,"startRow":8,"startColumn":22,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8356732","formula1":"0","errorStyle":1,"ranges":[{"endColumn":24,"startRow":8,"startColumn":24,"endRow":12}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8401536","formula1":"=I9=0","ranges":[{"endColumn":8,"startRow":8,"startColumn":8,"endRow":12}],"showInputMessage":true,"type":"custom","error":"项目总工时必须等于当前月份总工时"}],"sheet-5":[{"uid":"3964654","formula1":"0","errorStyle":1,"ranges":[{"endColumn":10,"startRow":8,"startColumn":10,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4123676","formula1":"0","errorStyle":1,"ranges":[{"endColumn":12,"startRow":8,"startColumn":12,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2540738","formula1":"0","errorStyle":1,"ranges":[{"endColumn":14,"startRow":8,"startColumn":14,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2092463","formula1":"0","errorStyle":1,"ranges":[{"endColumn":16,"startRow":8,"startColumn":16,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4222450","formula1":"0","errorStyle":1,"ranges":[{"endColumn":18,"startRow":8,"startColumn":18,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2974228","formula1":"0","errorStyle":1,"ranges":[{"endColumn":20,"startRow":8,"startColumn":20,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2794543","formula1":"0","errorStyle":1,"ranges":[{"endColumn":22,"startRow":8,"startColumn":22,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7719073","formula1":"0","errorStyle":1,"ranges":[{"endColumn":24,"startRow":8,"startColumn":24,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3613689","formula1":"0","errorStyle":1,"ranges":[{"endColumn":26,"startRow":8,"startColumn":26,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6905114","formula1":"0","errorStyle":1,"ranges":[{"endColumn":28,"startRow":8,"startColumn":28,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2297528","formula1":"0","errorStyle":1,"ranges":[{"endColumn":30,"startRow":8,"startColumn":30,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2089932","formula1":"0","errorStyle":1,"ranges":[{"endColumn":32,"startRow":8,"startColumn":32,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2329911","formula1":"0","errorStyle":1,"ranges":[{"endColumn":34,"startRow":8,"startColumn":34,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5196898","formula1":"0","errorStyle":1,"ranges":[{"endColumn":36,"startRow":8,"startColumn":36,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7450042","formula1":"0","errorStyle":1,"ranges":[{"endColumn":38,"startRow":8,"startColumn":38,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4619229","formula1":"0","errorStyle":1,"ranges":[{"endColumn":40,"startRow":8,"startColumn":40,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1560108","formula1":"0","errorStyle":1,"ranges":[{"endColumn":42,"startRow":8,"startColumn":42,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7486458","formula1":"0","errorStyle":1,"ranges":[{"endColumn":44,"startRow":8,"startColumn":44,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5232477","formula1":"0","errorStyle":1,"ranges":[{"endColumn":46,"startRow":8,"startColumn":46,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2558987","formula1":"0","errorStyle":1,"ranges":[{"endColumn":48,"startRow":8,"startColumn":48,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4524379","formula1":"0","errorStyle":1,"ranges":[{"endColumn":50,"startRow":8,"startColumn":50,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2435116","formula1":"0","errorStyle":1,"ranges":[{"endColumn":52,"startRow":8,"startColumn":52,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3725241","formula1":"0","errorStyle":1,"ranges":[{"endColumn":54,"startRow":8,"startColumn":54,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9475977","formula1":"0","errorStyle":1,"ranges":[{"endColumn":56,"startRow":8,"startColumn":56,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1138023","formula1":"0","errorStyle":1,"ranges":[{"endColumn":58,"startRow":8,"startColumn":58,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0450018","formula1":"0","errorStyle":1,"ranges":[{"endColumn":60,"startRow":8,"startColumn":60,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6756389","formula1":"0","errorStyle":1,"ranges":[{"endColumn":62,"startRow":8,"startColumn":62,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6638013","formula1":"0","errorStyle":1,"ranges":[{"endColumn":64,"startRow":8,"startColumn":64,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3464132","formula1":"0","errorStyle":1,"ranges":[{"endColumn":66,"startRow":8,"startColumn":66,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7491759","formula1":"0","errorStyle":1,"ranges":[{"endColumn":68,"startRow":8,"startColumn":68,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3590270","formula1":"0","errorStyle":1,"ranges":[{"endColumn":70,"startRow":8,"startColumn":70,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1046076","formula1":"0","errorStyle":1,"ranges":[{"endColumn":72,"startRow":8,"startColumn":72,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2623418","formula1":"0","errorStyle":1,"ranges":[{"endColumn":74,"startRow":8,"startColumn":74,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8047599","formula1":"0","errorStyle":1,"ranges":[{"endColumn":76,"startRow":8,"startColumn":76,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0529107","formula1":"0","errorStyle":1,"ranges":[{"endColumn":78,"startRow":8,"startColumn":78,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7201062","formula1":"0","errorStyle":1,"ranges":[{"endColumn":80,"startRow":8,"startColumn":80,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5509312","formula1":"0","errorStyle":1,"ranges":[{"endColumn":82,"startRow":8,"startColumn":82,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6714205","formula1":"0","errorStyle":1,"ranges":[{"endColumn":84,"startRow":8,"startColumn":84,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0416882","formula1":"0","errorStyle":1,"ranges":[{"endColumn":86,"startRow":8,"startColumn":86,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0022914","formula1":"0","errorStyle":1,"ranges":[{"endColumn":88,"startRow":8,"startColumn":88,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4704066","formula1":"0","errorStyle":1,"ranges":[{"endColumn":90,"startRow":8,"startColumn":90,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9508249","formula1":"0","errorStyle":1,"ranges":[{"endColumn":92,"startRow":8,"startColumn":92,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7628650","formula1":"0","errorStyle":1,"ranges":[{"endColumn":94,"startRow":8,"startColumn":94,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3985343","formula1":"0","errorStyle":1,"ranges":[{"endColumn":96,"startRow":8,"startColumn":96,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7929576","formula1":"0","errorStyle":1,"ranges":[{"endColumn":98,"startRow":8,"startColumn":98,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3979661","formula1":"0","errorStyle":1,"ranges":[{"endColumn":100,"startRow":8,"startColumn":100,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7810581","formula1":"0","errorStyle":1,"ranges":[{"endColumn":102,"startRow":8,"startColumn":102,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8024279","formula1":"0","errorStyle":1,"ranges":[{"endColumn":104,"startRow":8,"startColumn":104,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7298039","formula1":"0","errorStyle":1,"ranges":[{"endColumn":106,"startRow":8,"startColumn":106,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1073614","formula1":"0","errorStyle":1,"ranges":[{"endColumn":108,"startRow":8,"startColumn":108,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6419058","formula1":"0","errorStyle":1,"ranges":[{"endColumn":110,"startRow":8,"startColumn":110,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5184222","formula1":"0","errorStyle":1,"ranges":[{"endColumn":112,"startRow":8,"startColumn":112,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8484744","formula1":"0","errorStyle":1,"ranges":[{"endColumn":114,"startRow":8,"startColumn":114,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4279889","formula1":"0","errorStyle":1,"ranges":[{"endColumn":116,"startRow":8,"startColumn":116,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7868105","formula1":"0","errorStyle":1,"ranges":[{"endColumn":118,"startRow":8,"startColumn":118,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9088847","formula1":"0","errorStyle":1,"ranges":[{"endColumn":120,"startRow":8,"startColumn":120,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0234689","formula1":"0","errorStyle":1,"ranges":[{"endColumn":122,"startRow":8,"startColumn":122,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5138891","formula1":"0","errorStyle":1,"ranges":[{"endColumn":124,"startRow":8,"startColumn":124,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1312886","formula1":"0","errorStyle":1,"ranges":[{"endColumn":126,"startRow":8,"startColumn":126,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4893660","formula1":"0","errorStyle":1,"ranges":[{"endColumn":128,"startRow":8,"startColumn":128,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8313844","formula1":"0","errorStyle":1,"ranges":[{"endColumn":130,"startRow":8,"startColumn":130,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0898334","formula1":"0","errorStyle":1,"ranges":[{"endColumn":132,"startRow":8,"startColumn":132,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4577769","formula1":"0","errorStyle":1,"ranges":[{"endColumn":134,"startRow":8,"startColumn":134,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5829071","formula1":"0","errorStyle":1,"ranges":[{"endColumn":136,"startRow":8,"startColumn":136,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8384060","formula1":"0","errorStyle":1,"ranges":[{"endColumn":138,"startRow":8,"startColumn":138,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9341155","formula1":"0","errorStyle":1,"ranges":[{"endColumn":140,"startRow":8,"startColumn":140,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5851977","formula1":"0","errorStyle":1,"ranges":[{"endColumn":142,"startRow":8,"startColumn":142,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9072560","formula1":"0","errorStyle":1,"ranges":[{"endColumn":144,"startRow":8,"startColumn":144,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4682757","formula1":"0","errorStyle":1,"ranges":[{"endColumn":146,"startRow":8,"startColumn":146,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7093963","formula1":"0","errorStyle":1,"ranges":[{"endColumn":148,"startRow":8,"startColumn":148,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8883007","formula1":"0","errorStyle":1,"ranges":[{"endColumn":150,"startRow":8,"startColumn":150,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2680603","formula1":"0","errorStyle":1,"ranges":[{"endColumn":152,"startRow":8,"startColumn":152,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2686795","formula1":"0","errorStyle":1,"ranges":[{"endColumn":154,"startRow":8,"startColumn":154,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0966269","formula1":"0","errorStyle":1,"ranges":[{"endColumn":156,"startRow":8,"startColumn":156,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9320596","formula1":"0","errorStyle":1,"ranges":[{"endColumn":158,"startRow":8,"startColumn":158,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1038996","formula1":"0","errorStyle":1,"ranges":[{"endColumn":160,"startRow":8,"startColumn":160,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5027834","formula1":"0","errorStyle":1,"ranges":[{"endColumn":162,"startRow":8,"startColumn":162,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7622490","formula1":"0","errorStyle":1,"ranges":[{"endColumn":164,"startRow":8,"startColumn":164,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"9740437","formula1":"0","errorStyle":1,"ranges":[{"endColumn":166,"startRow":8,"startColumn":166,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8793499","formula1":"0","errorStyle":1,"ranges":[{"endColumn":168,"startRow":8,"startColumn":168,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5081762","formula1":"0","errorStyle":1,"ranges":[{"endColumn":170,"startRow":8,"startColumn":170,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1105745","formula1":"0","errorStyle":1,"ranges":[{"endColumn":172,"startRow":8,"startColumn":172,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8352528","formula1":"0","errorStyle":1,"ranges":[{"endColumn":174,"startRow":8,"startColumn":174,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0507007","formula1":"0","errorStyle":1,"ranges":[{"endColumn":176,"startRow":8,"startColumn":176,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4966320","formula1":"0","errorStyle":1,"ranges":[{"endColumn":178,"startRow":8,"startColumn":178,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2543550","formula1":"0","errorStyle":1,"ranges":[{"endColumn":180,"startRow":8,"startColumn":180,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8336162","formula1":"0","errorStyle":1,"ranges":[{"endColumn":182,"startRow":8,"startColumn":182,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4896727","formula1":"0","errorStyle":1,"ranges":[{"endColumn":184,"startRow":8,"startColumn":184,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2871616","formula1":"0","errorStyle":1,"ranges":[{"endColumn":186,"startRow":8,"startColumn":186,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5525067","formula1":"0","errorStyle":1,"ranges":[{"endColumn":188,"startRow":8,"startColumn":188,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6141793","formula1":"0","errorStyle":1,"ranges":[{"endColumn":190,"startRow":8,"startColumn":190,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"4334489","formula1":"0","errorStyle":1,"ranges":[{"endColumn":192,"startRow":8,"startColumn":192,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"3342077","formula1":"0","errorStyle":1,"ranges":[{"endColumn":194,"startRow":8,"startColumn":194,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5746538","formula1":"0","errorStyle":1,"ranges":[{"endColumn":196,"startRow":8,"startColumn":196,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"1471263","formula1":"0","errorStyle":1,"ranges":[{"endColumn":198,"startRow":8,"startColumn":198,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"5369632","formula1":"0","errorStyle":1,"ranges":[{"endColumn":200,"startRow":8,"startColumn":200,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"2500821","formula1":"0","errorStyle":1,"ranges":[{"endColumn":202,"startRow":8,"startColumn":202,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"6816382","formula1":"0","errorStyle":1,"ranges":[{"endColumn":204,"startRow":8,"startColumn":204,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7073298","formula1":"0","errorStyle":1,"ranges":[{"endColumn":206,"startRow":8,"startColumn":206,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"0851132","formula1":"0","errorStyle":1,"ranges":[{"endColumn":208,"startRow":8,"startColumn":208,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"8978828","formula1":"0","errorStyle":1,"ranges":[{"endColumn":210,"startRow":8,"startColumn":210,"endRow":9}],"showInputMessage":true,"type":"decimal","error":"必须为数值类型的数据","operator":"greaterThanOrEqual"},{"uid":"7328061","formula1":"=I9=0","ranges":[{"endColumn":8,"startRow":8,"startColumn":8,"endRow":9}],"showInputMessage":true,"type":"custom","error":"项目总工时必须等于当前月份总工时"}]}',
>>>>>>> 9367a46da (perf(formula): add r_tree for dependency):examples/src/data/sheets/demo/default-workbook-data-demo.ts
=======
            name: 'SHEET_HYPER_LINK_PLUGIN',
            data: JSON.stringify({
                'sheet-0011': hyperLink,
            }),
        },
        {
            name: DATA_VALIDATION_PLUGIN_NAME,
            data: JSON.stringify({
                'sheet-0011': dataValidation,
                'dv-test': dv2,
            }),
>>>>>>> efa80aa84 (fix(formula): big demo):examples/src/data/sheets/demo/default-workbook-data-demo.ts
        },
        {
            name: 'SHEET_FILTER_PLUGIN',
            data: JSON.stringify({
                'sheet-0011': {
                    ref: {
                        startRow: 11,
                        endRow: 23,
                        startColumn: 4,
                        endColumn: 6,
                    },
                },
            }),
        },
        {
=======
>>>>>>> d0467e0e9 (fix(formula): multi minus error):examples/src/data/sheets/demo/default-workbook-data-demo.ts
            name: 'SHEET_THREAD_COMMENT_PLUGIN',
            data: '{"sheet-0011":[{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"123\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"jwV0QtHwUbhG3o--iy1qa","ref":"H9","personId":"mockId","unitId":"workbook-01","subUnitId":"sheet-0011"}],"dv-test":[{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"1\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"1","ref":"B6","personId":"mockId","unitId":"workbook-01","subUnitId":"dv-test"},{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"2\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"2","ref":"B7","personId":"mockId","unitId":"workbook-01","subUnitId":"dv-test"},{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"3\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"3","ref":"B8","personId":"mockId","unitId":"workbook-01","subUnitId":"dv-test"},{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"4\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"4","ref":"B9","personId":"mockId","unitId":"workbook-01","subUnitId":"dv-test"},{"text":{"textRuns":[],"paragraphs":[{"startIndex":3,"paragraphStyle":{}}],"sectionBreaks":[{"startIndex":4}],"dataStream":"1\\\\n\\\\r","customRanges":[]},"dT":"2024/05/17 21:16","id":"12","ref":"C6","personId":"mockId","unitId":"workbook-01","subUnitId":"dv-test"}]}',
        },
        {
            name: 'SHEET_WORKSHEET_PROTECTION_PLUGIN',
            data: '{}',
        },
        {
            name: 'SHEET_WORKSHEET_PROTECTION_POINT_PLUGIN',
            data: '{}',
        },
        {
            name: 'SHEET_RANGE_PROTECTION_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_HYPER_LINK_PLUGIN',
            data: '{"sheet-0011":[{"row":20,"column":8,"id":"321","payload":"#gid=sheet-0011&range=1:1"},{"row":20,"column":12,"id":"123","payload":"#gid=sheet-0011&range=1:1"}],"65RDQ8vlAdCUq9NjwYABw":[]}',
        },
        {
            name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DRAWING_PLUGIN',
            data: '{"sheet-0011":{"data":{"sF2ogx":{"unitId":"workbook-01","subUnitId":"sheet-0011","drawingId":"sF2ogx","drawingType":0,"imageSourceType":"BASE64","source":"data:image/jpeg;base64,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","sheetTransform":{"angle":45,"from":{"column":14,"columnOffset":49.7,"row":3,"rowOffset":9.4},"to":{"column":18,"columnOffset":49.6,"row":17,"rowOffset":15.5}},"transform":{"flipY":false,"flipX":false,"angle":45,"skewX":0,"skewY":0,"left":1327.7,"top":101.4,"width":351.9,"height":342.1}}},"order":["sF2ogx"]}}',
        },
        {
            name: 'SHEET_DEFINED_NAME_PLUGIN',
            data: '',
        },
        {
            name: 'SHEET_DATA_VALIDATION_PLUGIN',
            data: "{\"sheet-0011\":[{\"uid\":\"xxx-1\",\"type\":\"decimal\",\"ranges\":[{\"startRow\":0,\"endRow\":5,\"startColumn\":0,\"endColumn\":2}],\"operator\":\"greaterThan\",\"formula1\":\"111\",\"errorStyle\":1},{\"uid\":\"xxx-0\",\"type\":\"date\",\"ranges\":[{\"startRow\":0,\"endRow\":5,\"startColumn\":3,\"endColumn\":5}],\"operator\":\"equal\",\"formula1\":\"2024/04/10\",\"formula2\":\"2024/10/10\"},{\"uid\":\"xxx-2\",\"type\":\"checkbox\",\"ranges\":[{\"startRow\":6,\"endRow\":10,\"startColumn\":0,\"endColumn\":5}]},{\"uid\":\"xxx-3\",\"type\":\"list\",\"ranges\":[{\"startRow\":11,\"endRow\":15,\"startColumn\":0,\"endColumn\":5}],\"formula1\":\"1,2,3,hahaha,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18\"},{\"uid\":\"xxx-4\",\"type\":\"custom\",\"ranges\":[{\"startRow\":16,\"endRow\":20,\"startColumn\":0,\"endColumn\":5}],\"formula1\":\"=A1\"},{\"uid\":\"xxx-5\",\"type\":\"listMultiple\",\"ranges\":[{\"startRow\":21,\"endRow\":21,\"startColumn\":0,\"endColumn\":0}],\"formula1\":\"1,2,3,4,5,哈哈哈哈\"}],\"dv-test\":[{\"uid\":\"xxx-2\",\"type\":\"checkbox\",\"ranges\":[{\"startRow\":1,\"endRow\":2,\"startColumn\":1,\"endColumn\":2}]},{\"uid\":\"adN9-O\",\"type\":\"list\",\"formula1\":\"=='sheet-0005'!F4:F8\",\"ranges\":[{\"startRow\":4,\"startColumn\":5,\"endRow\":14,\"endColumn\":8,\"rangeType\":0}],\"formula2\":\"\"}],\"65RDQ8vlAdCUq9NjwYABw\":[]}",
        },
        {
            name: 'SHEET_AuthzIoMockService_PLUGIN',
            data: '{}',
        },
        {
            name: 'SHEET_FILTER_PLUGIN',
            data: '{"sheet-0011":{"ref":{"startRow":11,"startColumn":4,"endRow":23,"endColumn":6},"filterColumns":[],"cachedFilteredOut":[]}}',
        },
        {
            name: 'SHEET_RANGE_PROTECTION_PLUGIN',
            data: '{"sheet-0011":[{"ranges":[{"startRow":26,"startColumn":6,"endRow":30,"endColumn":8,"rangeType":0,"unitId":"workbook-01","sheetId":"sheet-0011"}],"permissionId":"nLNP3ABg","id":"IYg5","name":"工作表11(G27:I31)","unitType":3,"unitId":"workbook-01","subUnitId":"sheet-0011"}]}',
        },
    ],
    __env__: {
        gitHash: '9386c6b',
        gitBranch: 'dev',
        buildTime: '2024-08-13T02:56:38.422Z',
    },
};
