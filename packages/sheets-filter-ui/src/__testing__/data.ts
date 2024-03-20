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
import { CustomFilterOperator, LocaleType } from '@univerjs/core';

export function WithCustomFilterModelFactory(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {
                    0: {
                        0: {
                            v: 'A1',
                        },
                    },
                },
                autoFilter: {
                    ref: { startColumn: 0, startRow: 0, endColumn: 5, endRow: 5 },
                    filterColumns: [
                        {
                            colId: 0,
                            customFilters: {
                                customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN }],
                            },
                        },
                    ],
                },
            },
        },
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
                    0: {
                        0: {
                            v: 'A1',
                        },
                    },
                    1: { 0: { v: '1' } },
                    2: { 0: { v: '2' } },
                    3: { 0: { v: 'Michael Jackson' } },
                    4: { 0: { v: 'Michael' } },
                    5: { 0: { v: 'Jackson' } },
                    6: { 0: { v: 'Evan Wallace' } },
                    7: { 0: { v: 'Evan' } },
                    8: { 0: { v: 'Wallace' } },
                    9: { 0: { v: 'Steve' } },
                    10: { 0: { v: 'Minecraft' } },
                },
                autoFilter: {
                    ref: { startColumn: 0, startRow: 0, endColumn: 10, endRow: 10 },
                    filterColumns: [
                        {
                            colId: 0,
                            filters: ['1'],
                        },
                    ],
                },
            },
        },
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
        checked: false,
        count: 1,
        index: 0,
        value: 'A1',
    },
    {
        checked: true,
        count: 1,
        index: 1,
        value: '1',
    },
    {
        checked: false,
        count: 1,
        index: 2,
        value: '2',
    },
    {
        checked: false,
        count: 1,
        index: 3,
        value: 'Michael Jackson',
    },
    {
        checked: false,
        count: 1,
        index: 4,
        value: 'Michael',
    },
    {
        checked: false,
        count: 1,
        index: 5,
        value: 'Jackson',
    },
    {
        checked: false,
        count: 1,
        index: 6,
        value: 'Evan Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 7,
        value: 'Evan',
    },
    {
        checked: false,
        count: 1,
        index: 8,
        value: 'Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 9,
        value: 'Steve',
    },
    {
        checked: false,
        count: 1,
        index: 10,
        value: 'Minecraft',
    },

];

export const E_ITEMS = [
    {
        checked: false,
        count: 1,
        index: 3,
        value: 'Michael Jackson',
    },
    {
        checked: false,
        count: 1,
        index: 4,
        value: 'Michael',
    },
    {
        checked: false,
        count: 1,
        index: 6,
        value: 'Evan Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 7,
        value: 'Evan',
    },
    {
        checked: false,
        count: 1,
        index: 8,
        value: 'Wallace',
    },
    {
        checked: false,
        count: 1,
        index: 9,
        value: 'Steve',
    },
    {
        checked: false,
        count: 1,
        index: 10,
        value: 'Minecraft',
    },
];
