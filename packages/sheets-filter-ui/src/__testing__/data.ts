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

export function WithValuesFilterModelFactory(): IWorkbookData {
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
                },
            },
        },
        resources: [
            {
                name: SHEET_FILTER_SNAPSHOT_ID,
                data: JSON.stringify({
                    sheet1: {
                        ref: { startColumn: 0, startRow: 0, endColumn: 10, endRow: 10 },
                        filterColumns: [
                            {
                                colId: 0,
                                filters: { filters: ['1'] },
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
        checked: true,
        count: 1,
        index: 0,
        isEmpty: false,
        value: '1',
    },
    {
        checked: false,
        count: 1,
        index: 1,
        isEmpty: false,
        value: '2',
    },
    {
        checked: false,
        count: 1,
        index: 2,
        isEmpty: false,
        value: 'Michael Jackson King of Pop',
    },
    {
        checked: false,
        count: 1,
        index: 3,
        isEmpty: false,
        value: 'Michael',
    },
    {
        checked: false,
        count: 1,
        index: 4,
        isEmpty: false,
        value: 'Jackson',
    },
    {
        checked: false,
        count: 1,
        index: 5,
        isEmpty: false,
        value: 'Evan Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 6,
        isEmpty: false,
        value: 'Evan',
    },
    {
        checked: false,
        count: 1,
        index: 7,
        isEmpty: false,
        value: 'Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 8,
        isEmpty: false,
        value: 'Steve',
    },
    {
        checked: false,
        count: 1,
        index: 9,
        isEmpty: false,
        value: 'Minecraft',
    },
];

export const E_ITEMS = [
    {
        checked: false,
        count: 1,
        index: 2,
        isEmpty: false,
        value: 'Michael Jackson King of Pop',
    },
    {
        checked: false,
        count: 1,
        index: 3,
        isEmpty: false,
        value: 'Michael',
    },
    {
        checked: false,
        count: 1,
        index: 5,
        isEmpty: false,
        value: 'Evan Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 6,
        isEmpty: false,
        value: 'Evan',
    },
    {
        checked: false,
        count: 1,
        index: 7,
        isEmpty: false,
        value: 'Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 8,
        isEmpty: false,
        value: 'Steve',
    },
    {
        checked: false,
        count: 1,
        index: 9,
        isEmpty: false,
        value: 'Minecraft',
    },
];
