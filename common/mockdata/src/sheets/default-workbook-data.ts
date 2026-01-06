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

import type { IDocumentData, IWorkbookData } from '@univerjs/core';
import {
    BaselineOffset,
    BooleanNumber,
    BorderStyleTypes,
    ColumnSeparatorType,
    DrawingTypeEnum,
    HorizontalAlign,
    LocaleType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    PresetListType,
    SectionType,
    Tools,
    VerticalAlign,
    WrapStrategy,
    WrapTextType,
} from '@univerjs/core';

const richTextTestFloat: IDocumentData = {
    id: 'd',
    drawings: {
        shapeTest1: {
            unitId: 'd',
            subUnitId: 'd',
            drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            drawingId: 'shapeTest1',
            title: 'test shape',
            description: 'test shape',
            docTransform: {
                size: {
                    width: 100,
                    height: 400,
                },
                positionH: {
                    relativeFrom: ObjectRelativeFromH.COLUMN,
                    posOffset: 100,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PARAGRAPH,
                    posOffset: 160,
                },
                angle: 0,
                // imageProperties: {
                //     contentUrl: 'https://cnbabylon.com/assets/img/agents.png',
                // },
            },
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            behindDoc: BooleanNumber.FALSE,
            wrapText: WrapTextType.BOTH_SIDES,
        },
    },
    body: {
        dataStream: '在“第1题”工作表中完成以下操作\b上标日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）\r\n',
        textRuns: [
            {
                st: 0,
                ed: 15,
                ts: {
                    fs: 12,
                    bg: {
                        rgb: 'rgb(200,0,90)',
                    },
                    cl: {
                        rgb: 'rgb(255,130,0)',
                    },
                },
            },
            {
                st: 17,
                ed: 18,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(2,128,2)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,55)',
                    },
                    va: BaselineOffset.SUPERSCRIPT,
                },
            },
            {
                st: 19,
                ed: 60,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(90,128,255)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,255)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 60,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 61,
                columnProperties: [
                    {
                        width: 200,
                        paddingEnd: 20,
                    },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
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

const richTextTest: IDocumentData = {
    id: 'd',
    body: {
        dataStream: '在“第1题”工作表中完成以下操作\b上标日期列单元格数据验证，限制只能输入日期（介于1949年1月1日至2099年1月1日）\r\n',
        textRuns: [
            {
                st: 0,
                ed: 15,
                ts: {
                    fs: 12,
                    bg: {
                        rgb: 'rgb(200,0,90)',
                    },
                    cl: {
                        rgb: 'rgb(255,130,0)',
                    },
                },
            },
            {
                st: 17,
                ed: 18,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(2,128,2)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,55)',
                    },
                    va: BaselineOffset.SUPERSCRIPT,
                },
            },
            {
                st: 19,
                ed: 60,
                ts: {
                    fs: 14,
                    bg: {
                        rgb: 'rgb(90,128,255)',
                    },
                    cl: {
                        rgb: 'rgb(0,1,255)',
                    },
                },
            },
        ],
        paragraphs: [
            {
                startIndex: 60,
                bullet: {
                    listId: 'orderList',
                    listType: PresetListType.ORDER_LIST,
                    nestingLevel: 0,
                    textStyle: {
                        fs: 20,
                    },
                },
            },
        ],
        sectionBreaks: [
            {
                startIndex: 61,
                columnProperties: [
                    {
                        width: 200,
                        paddingEnd: 20,
                    },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                // textDirection: textDirectionDocument,
                // contentDirection: textDirection!,
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

/**
 * Default workbook data
 */
export const DEFAULT_WORKBOOK_DATA: IWorkbookData = {
    id: 'workbook-left',
    locale: LocaleType.ZH_CN,
    name: 'universheet',
    sheetOrder: ['sheet-01', 'sheet-02', 'sheet-03', 'sheet-04', 'sheet-05', 'sheet-06'],
    styles: {
        1: {
            cl: {
                rgb: 'blue',
            },
            fs: 16,
            bd: {
                t: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
            ht: 3,
        },
        2: {
            bg: {
                rgb: 'rgb(200, 2, 0)',
            },
            fs: 24,
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.TOP,
        },
        3: {
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.MIDDLE,
            tb: WrapStrategy.WRAP,
            // va: BaselineOffset.SUPERSCRIPT,
            // cl: {
            //     rgb: 'rgb(0, 255, 0)',
            // },
            // st: {
            //     s: BooleanNumber.TRUE, // show
            // },
            bg: {
                rgb: 'rgb(255, 255, 0)',
            },
            tr: {
                a: 45,
                v: BooleanNumber.FALSE,
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
        },
        4: {
            bg: {
                rgb: 'rgb(0, 0, 255)',
            },
        },
        5: {
            tb: WrapStrategy.WRAP,
        },
    },
    appVersion: '3.0.0-alpha',
    sheets: {
        'sheet-01': {
            id: 'sheet-01',
            cellData: {
                0: {
                    0: {
                        s: '1',
                        v: 1,
                    },
                    1: {
                        s: '1',
                        v: 1,
                    },
                    5: {
                        s: '1',
                        v: 8,
                    },
                    6: {
                        s: '2',
                        v: 8,
                    },
                },
                1: {
                    0: {
                        v: 1,
                    },
                    1: {
                        v: 1,
                    },
                    2: {
                        v: 80,
                        s: '3',
                    },
                    3: {
                        v: '富文本编辑',
                        s: '2',
                    },
                },
                2: {
                    0: {
                        v: 1111,
                    },
                    1: {
                        v: 1111,
                    },
                    5: {
                        s: '1',
                        v: 8,
                    },
                    6: {
                        s: '1',
                        v: 8,
                    },
                    7: {
                        s: '1',
                        v: 8,
                    },
                    8: {
                        s: '1',
                        v: 8,
                    },
                },
                3: {
                    0: {
                        v: 1111,
                    },
                    1: {
                        v: 1111,
                    },
                },
                10: {
                    9: {
                        v: 1111,
                        s: '2',
                    },
                },
                13: {
                    9: {
                        v: 1111,
                        s: '4',
                    },
                },
                17: {
                    3: {
                        v: '做移动端开发和前端开发的人员，对 MVC、MVP、MVVM 这几个名词应该都不陌生，这是三个最常用的应用架构模式，目的都是为了将业务和视图的实现代码分离',
                        s: '3',
                        p: richTextTest,
                    },
                },
                20: {
                    10: {
                        v: '北京马拉松组委会办公室一位接电话的女士证实，的确有这项规定，她还称2014年马拉松的预登记工作将在本周启动。北京马拉松比赛将在10月19日举行。',
                        s: '3',
                    },
                    12: {
                        s: '4',
                    },
                },
                29: {
                    13: {
                        p: Tools.deepClone(richTextTest),
                        s: '4',
                    },
                },
                32: {
                    3: {
                        p: richTextTestFloat,
                        s: '5',
                    },
                },
            },
            name: 'sheet1',
            tabColor: 'red',
            hidden: BooleanNumber.FALSE,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 27,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                {
                    startRow: 2,
                    endRow: 6,
                    startColumn: 5,
                    endColumn: 10,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 17,
                    endRow: 21,
                    startColumn: 3,
                    endColumn: 6,
                },
                {
                    startRow: 13,
                    endRow: 15,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 24,
                    endRow: 27,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 32,
                    endRow: 53,
                    startColumn: 3,
                    endColumn: 5,
                },
            ],
            rowData: {
                3: {
                    h: 50,
                    hd: BooleanNumber.FALSE,
                },
                4: {
                    h: 60,
                    hd: BooleanNumber.FALSE,
                },
                29: {
                    h: 200,
                    hd: BooleanNumber.FALSE,
                },
            },
            columnData: {
                5: {
                    w: 100,
                    hd: BooleanNumber.FALSE,
                },
                6: {
                    w: 200,
                    hd: BooleanNumber.FALSE,
                },
                13: {
                    w: 300,
                    hd: BooleanNumber.FALSE,
                },
            },
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnHeader: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            rightToLeft: BooleanNumber.FALSE,
        },
        'sheet-02': {
            id: 'sheet-02',
            name: 'sheet2',
            cellData: {
                0: {
                    0: {
                        s: '1',
                        v: 1,
                    },
                    1: {
                        s: '1',
                        v: 1,
                    },
                    5: {
                        s: '1',
                        v: 8,
                    },
                    6: {
                        s: '2',
                        v: 8,
                    },
                },
                20: {
                    0: {
                        v: 'sheet2',
                    },
                    1: {
                        v: 'sheet2 - 2',
                    },
                },
            },
        },
        'sheet-03': {
            id: 'sheet-03',
            name: 'sheet3',
        },
        'sheet-04': {
            id: 'sheet-04',
            name: 'sheet4',
        },
        'sheet-05': {
            id: 'sheet-05',
            name: 'sheet5',
        },
        'sheet-06': {
            id: 'sheet-06',
            name: 'sheet6',
        },
    },
    // namedRanges: [
    //     {
    //         namedRangeId: 'named-range-01',
    //         name: 'namedRange01',
    //         range: {
    //             sheetId: 'sheet-01',
    //             range: {
    //                 startRow: 0,
    //                 startColumn: 0,
    //                 endRow: 1,
    //                 endColumn: 1,
    //             },
    //         },
    //     },
    //     {
    //         namedRangeId: 'named-range-02',
    //         name: 'namedRange02',
    //         range: {
    //             sheetId: 'sheet-01',
    //             range: {
    //                 startRow: 4,
    //                 startColumn: 2,
    //                 endRow: 5,
    //                 endColumn: 3,
    //             },
    //         },
    //     },
    // ],
};
/**
 * Default workbook data
 */
export const DEFAULT_WORKBOOK_DATA_DOWN: IWorkbookData = {
    id: 'workbook-02',
    locale: LocaleType.ZH_CN,
    name: 'universheet',
    sheetOrder: [],
    styles: {
        1: {
            cl: {
                rgb: 'green',
            },
            fs: 16,
            bd: {
                t: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.MEDIUM_DASHED,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THICK,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'blue',
                    },
                },
            },
            ht: 3,
        },
        2: {
            bg: {
                rgb: 'rgb(2, 200, 0)',
            },
            fs: 24,
        },
        3: {
            ht: HorizontalAlign.RIGHT,
            vt: VerticalAlign.TOP,
            tb: WrapStrategy.WRAP,
            // va: BaselineOffset.SUPERSCRIPT,
            // cl: {
            //     rgb: 'rgb(0, 255, 0)',
            // },
            // st: {
            //     s: BooleanNumber.TRUE, // show
            // },
            bg: {
                rgb: 'rgb(255, 255, 0)',
            },
            tr: {
                a: 45,
                v: BooleanNumber.FALSE,
            },
            bd: {
                t: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                l: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                r: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'black',
                    },
                },
                b: {
                    s: BorderStyleTypes.THIN,
                    cl: {
                        rgb: 'red',
                    },
                },
            },
        },
        4: {
            bg: {
                rgb: 'rgb(0, 0, 255)',
            },
        },
    },
    appVersion: '3.0.0-alpha',
    sheets: {
        'sheet-0001': {
            id: 'sheet-0001',
            cellData: {
                0: {
                    0: {
                        s: '1',
                        v: 2,
                    },
                    1: {
                        s: '1',
                        v: 1,
                    },
                    5: {
                        s: '1',
                        v: 8,
                    },
                    6: {
                        s: '2',
                        v: 8,
                    },
                },
                1: {
                    0: {
                        v: 22,
                    },
                    1: {
                        v: 22,
                    },
                    2: {
                        v: 80,
                        s: '3',
                    },
                    3: {
                        v: '富文本编辑',
                        s: '2',
                    },
                },
                2: {
                    0: {
                        v: 2222,
                    },
                    1: {
                        v: 2222,
                    },
                    5: {
                        s: '1',
                        v: 8,
                    },
                    6: {
                        s: '1',
                        v: 8,
                    },
                    7: {
                        s: '1',
                        v: 8,
                    },
                    8: {
                        s: '1',
                        v: 8,
                    },
                },
                3: {
                    0: {
                        v: 1111,
                    },
                    1: {
                        v: 1111,
                    },
                },
                10: {
                    9: {
                        v: 1111,
                        s: '2',
                    },
                },
                13: {
                    9: {
                        v: 1111,
                        s: '4',
                    },
                },
                17: {
                    3: {
                        v: '做移动端开发和前端开发的人员，对 MVC、MVP、MVVM 这几个名词应该都不陌生，这是三个最常用的应用架构模式，目的都是为了将业务和视图的实现代码分离',
                        s: '3',
                        p: richTextTest,
                    },
                },
                20: {
                    10: {
                        v: '北京马拉松组委会办公室一位接电话的女士证实，的确有这项规定，她还称2014年马拉松的预登记工作将在本周启动。北京马拉松比赛将在10月19日举行。',
                        s: '3',
                    },
                    12: {
                        s: '4',
                    },
                },
                29: {
                    13: {
                        p: Tools.deepClone(richTextTest),
                        s: '4',
                    },
                },
            },
            name: 'sheet0001',
            tabColor: 'green',
            hidden: BooleanNumber.FALSE,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
            scrollTop: 200,
            scrollLeft: 100,
            defaultColumnWidth: 93,
            defaultRowHeight: 27,
            mergeData: [
                {
                    startRow: 0,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: 1,
                },
                {
                    startRow: 2,
                    endRow: 6,
                    startColumn: 5,
                    endColumn: 10,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 10,
                    endRow: 12,
                    startColumn: 9,
                    endColumn: 12,
                },
                {
                    startRow: 17,
                    endRow: 21,
                    startColumn: 3,
                    endColumn: 6,
                },
                {
                    startRow: 13,
                    endRow: 15,
                    startColumn: 9,
                    endColumn: 10,
                },
                {
                    startRow: 24,
                    endRow: 27,
                    startColumn: 9,
                    endColumn: 10,
                },
            ],
            rowData: {
                3: {
                    h: 50,
                    hd: BooleanNumber.FALSE,
                },
                4: {
                    h: 60,
                    hd: BooleanNumber.FALSE,
                },
                29: {
                    h: 200,
                    hd: BooleanNumber.FALSE,
                },
            },
            columnData: {
                5: {
                    w: 100,
                    hd: BooleanNumber.FALSE,
                },
                6: {
                    w: 200,
                    hd: BooleanNumber.FALSE,
                },
                13: {
                    w: 300,
                    hd: BooleanNumber.FALSE,
                },
            },
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnHeader: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            rightToLeft: BooleanNumber.FALSE,
        },
        'sheet-0002': {
            id: 'sheet-0002',
            name: 'sheet0003',
        },
    },
    // namedRanges: [
    //     {
    //         namedRangeId: 'named-range-0001',
    //         name: 'namedRange0001',
    //         range: {
    //             sheetId: 'sheet-0001',
    //             range: {
    //                 startRow: 0,
    //                 startColumn: 0,
    //                 endRow: 1,
    //                 endColumn: 1,
    //             },
    //         },
    //     },
    // ],
};
