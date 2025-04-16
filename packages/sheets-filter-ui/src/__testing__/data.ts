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

import type { IWorkbookData } from '@univerjs/core';
import { LocaleType } from '@univerjs/core';
import { CustomFilterOperator, SHEET_FILTER_SNAPSHOT_ID } from '@univerjs/sheets-filter';

/// This file contains mock up snapshots for testing purposes.

export function WithCustomFilterModelFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: { 0: { v: 'Header' } },
                    1: { 0: { v: 1 } },
                    2: { 0: { v: 2 } },
                    3: { 0: { v: 3 } },
                    4: { 0: { v: 4 } },
                    5: { 0: { v: 5 } },
                    6: { 0: { v: 6 } },
                    7: { 0: { v: 7 } },
                    8: { 0: { v: 8 } },
                    9: { 0: { v: 9 } },
                },
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 5, endRow: 5 },
                        filterColumns: [
                            {
                                colId: 0,
                                customFilters: {
                                    customFilters: [{ val: 123, operator: CustomFilterOperator.GREATER_THAN }],
                                },
                            },
                        ],
                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [
            'sheet1',
        ],
        styles: {},
    };
}

/* eslint-disable max-lines-per-function */
export function WithValuesFilterModelFactory(): IWorkbookData {
    return {
        id: 'test',
        sheetOrder: [
            'sheet1',
        ],
        name: '',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        styles: {
            GOAhZb: {
                n: {
                    pattern: 'yyyy-mm-dd',
                },
            },
            'A-iqEg': {
                n: {
                    pattern: 'yyyy/mm/dd',
                },
            },
            _yIXzW: {
                n: {
                    pattern: 'yyyy-m-d am/pm h:mm',
                },
            },
            qLSh7Z: {
                n: {
                    pattern: 'yyyy"年"MM"月"dd"日"',
                },
            },
        },
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 'Column Header',
                        },
                    },
                    1: {
                        0: {
                            v: '1',
                        },
                    },
                    2: {
                        0: {
                            v: '2',
                        },
                    },
                    3: {
                        0: {
                            v: 'Michael Jackson King of Pop',
                        },
                    },
                    4: {
                        0: {
                            v: 'Michael',
                        },
                    },
                    5: {
                        0: {
                            v: 'Jackson',
                        },
                    },
                    6: {
                        0: {
                            v: 44876,
                            t: 2,
                            s: 'GOAhZb',
                        },
                    },
                    7: {
                        0: {
                            v: 44877,
                            t: 2,
                            s: 'GOAhZb',
                        },
                    },
                    8: {
                        0: {
                            v: 44878,
                            t: 2,
                            s: 'A-iqEg',
                        },
                    },
                    9: {
                        0: {
                            v: 44879,
                            t: 2,
                            s: '_yIXzW',
                        },
                    },
                    10: {
                        0: {
                            v: 44880,
                            t: 2,
                            s: 'qLSh7Z',
                        },
                    },
                },
                name: 'Sheet1',
                rowCount: 1000,
                columnCount: 20,
                mergeData: [],
            },
        },
        resources: [
            {
                name: 'SHEET_FILTER_PLUGIN',
                data: '{"sheet1":{"ref":{"startRow":0,"startColumn":0,"endRow":10,"endColumn":10},"filterColumns":[],"cachedFilteredOut":[]}}',
            },
        ],
    };
}

export function WithValuesAndEmptyFilterModelFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: { 0: { v: 'Column Header' } }, // this row should not appear in filter panel
                    1: { 0: { v: '1' } },
                    2: { 0: { v: '2' } },
                    3: { 0: { v: 'Michael Jackson King of Pop' } },
                    4: { 0: { v: 'Michael' } },
                    5: { 0: { v: 'Jackson' } },
                    6: { 0: { v: 'Evan Wallace' } },
                    7: { 0: { v: 'Evan' } },
                    8: { 0: { v: 'Wallace' } },
                    9: { 0: { v: 'Steve' } },
                    10: { 0: { v: 'Minecraft' } },
                    11: { 0: { v: '' } },
                },
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 11, endRow: 11 },
                        filterColumns: [
                            {
                                colId: 0,
                                filters: { blank: true, filters: ['1'] },
                            },
                        ],

                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [
            'sheet1',
        ],
        styles: {},
    };
}

export function WithMultiEmptyCellsModelFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: { 0: { v: 'Column Header' } }, // this row should not appear in filter panel
                    1: { 0: { v: '1' } },
                    2: { 0: { v: '2' } },
                    3: { 0: { v: 'Michael Jackson King of Pop' } },
                    4: { 0: { v: 'Michael' } },
                    5: { 0: { v: 'Jackson' } },
                    6: { 0: { v: '' } },
                    7: { 0: { v: '' } },
                    8: { 0: { v: '' } },
                    9: { 0: { v: 'Steve' } },
                    10: { 0: { v: 'Minecraft' } },
                    11: { 0: { v: '' } },
                },
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 11, endRow: 11 },
                        filterColumns: [
                            {
                                colId: 0,
                                filters: { blank: true, filters: ['1'] },
                            },
                        ],

                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [
            'sheet1',
        ],
        styles: {},
    };
}

export function WithTwoFilterColumnsFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: { 0: { v: 'Column Header' }, 1: { v: 'Header 2' } }, // this row should not appear in filter panel
                    1: { 0: { v: '1' }, 1: { v: 'a' } },
                    2: { 0: { v: '2' }, 1: { v: 'b' } },
                    3: { 0: { v: '3' }, 1: { v: 'c' } },
                    4: { 0: { v: '4' }, 1: { v: 'd' } },
                    5: { 0: { v: '5' }, 1: { v: 'e' } },
                    6: { 0: { v: '6' }, 1: { v: 'f' } },
                    7: { 0: { v: '7' }, 1: { v: 'g' } },
                    8: { 0: { v: '8' }, 1: { v: 'h' } },
                },
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 11, endRow: 11 },
                        filterColumns: [
                            {
                                colId: 0,
                                filters: { blank: true, filters: ['1', '2', '3'] },
                            },
                        ],
                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [
            'sheet1',
        ],
        styles: {},
    };
}

export function WithMergedCellFilterFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: { 0: { v: 'Column Header' }, 1: { v: 'Header 2' } }, // this row should not appear in filter panel
                    1: { 0: { v: '1' }, 1: { v: 'a' } },
                    2: { 0: { v: '2' }, 1: { v: 'b' } },
                    3: { 0: { v: '3' }, 1: { v: 'c' } },
                    4: { 0: { v: '' }, 1: { v: '' } },
                    5: { 0: { v: '5' }, 1: { v: 'e' } },
                    6: { 0: { v: '6' }, 1: { v: 'f' } },
                    7: { 0: { v: '7' }, 1: { v: 'g' } },
                    8: { 0: { v: '8' }, 1: { v: 'h' } },
                },
                mergeData: [
                    { startRow: 3, endRow: 4, startColumn: 0, endColumn: 1 },
                ],
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 11, endRow: 11 },
                        filterColumns: [
                            {
                                colId: 0,
                                filters: { blank: true, filters: ['3', '4', '5'] },
                            },
                        ],

                    },
                }),
            },
        ],
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [
            'sheet1',
        ],
        styles: {},
    };
}

export const ITEMS = [
    {
        title: '2022',
        key: '2022',
        children: [
            {
                title: 'sheets-filter.date.11',
                key: '2022-11',
                children: [
                    {
                        title: '11',
                        key: '2022-11-11',
                        count: 1,
                        originValues: new Set(['44876']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '12',
                        key: '2022-11-12',
                        count: 1,
                        originValues: new Set(['44877']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '13',
                        key: '2022-11-13',
                        count: 1,
                        originValues: new Set(['44878']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '14',
                        key: '2022-11-14',
                        count: 1,
                        originValues: new Set(['44879']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '15',
                        key: '2022-11-15',
                        count: 1,
                        originValues: new Set(['44880']),
                        leaf: true,
                        checked: true,
                    },
                ],
                count: 5,
                leaf: false,
                checked: false,
            },
        ],
        count: 5,
        leaf: false,
        checked: false,
    },
    {
        title: '1',
        leaf: true,
        checked: true,
        key: '1',
        count: 1,
    },
    {
        title: '2',
        leaf: true,
        checked: true,
        key: '2',
        count: 1,
    },
    {
        title: 'Jackson',
        leaf: true,
        checked: true,
        key: 'Jackson',
        count: 1,
    },
    {
        title: 'Michael',
        leaf: true,
        checked: true,
        key: 'Michael',
        count: 1,
    },
    {
        title: 'Michael Jackson King of Pop',
        leaf: true,
        checked: true,
        key: 'Michael Jackson King of Pop',
        count: 1,
    },
];

export const ITEMS_WITH_EMPTY = [
    {
        title: '1',
        leaf: true,
        checked: true,
        key: '1',
        count: 1,
    },
    {
        title: '2',
        leaf: true,
        checked: false,
        key: '2',
        count: 1,
    },
    {
        title: 'Evan',
        leaf: true,
        checked: false,
        key: 'Evan',
        count: 1,
    },
    {
        title: 'Evan Wallace',
        leaf: true,
        checked: false,
        key: 'Evan Wallace',
        count: 1,
    },
    {
        title: 'Jackson',
        leaf: true,
        checked: false,
        key: 'Jackson',
        count: 1,
    },
    {
        title: 'Michael',
        leaf: true,
        checked: false,
        key: 'Michael',
        count: 1,
    },
    {
        title: 'Michael Jackson King of Pop',
        leaf: true,
        checked: false,
        key: 'Michael Jackson King of Pop',
        count: 1,
    },
    {
        title: 'Minecraft',
        leaf: true,
        checked: false,
        key: 'Minecraft',
        count: 1,
    },
    {
        title: 'sheets-filter.panel.empty',
        count: 1,
        leaf: true,
        checked: true,
        key: 'empty',
    },
    {
        title: 'Steve',
        leaf: true,
        checked: false,
        key: 'Steve',
        count: 1,
    },
    {
        title: 'Wallace',
        leaf: true,
        checked: false,
        key: 'Wallace',
        count: 1,
    },
];

export const E_ITEMS = [
    {
        title: '2022',
        key: '2022',
        children: [
            {
                title: 'sheets-filter.date.11',
                key: '2022-11',
                children: [
                    {
                        title: '11',
                        key: '2022-11-11',
                        count: 1,
                        originValues: new Set(['44876']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '12',
                        key: '2022-11-12',
                        count: 1,
                        originValues: new Set(['44877']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '13',
                        key: '2022-11-13',
                        count: 1,
                        originValues: new Set(['44878']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '14',
                        key: '2022-11-14',
                        count: 1,
                        originValues: new Set(['44879']),
                        leaf: true,
                        checked: true,
                    },
                    {
                        title: '15',
                        key: '2022-11-15',
                        count: 1,
                        originValues: new Set(['44880']),
                        leaf: true,
                        checked: true,
                    },
                ],
                count: 5,
                leaf: false,
                checked: false,
            },
        ],
        count: 5,
        leaf: false,
        checked: false,
    },
    {
        title: 'Michael',
        leaf: true,
        checked: true,
        key: 'Michael',
        count: 1,
    },
    {
        title: 'Michael Jackson King of Pop',
        leaf: true,
        checked: true,
        key: 'Michael Jackson King of Pop',
        count: 1,
    },
];
