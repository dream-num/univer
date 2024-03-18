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

export function WithCustomFiltersModelFactory(): IWorkbookData {
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
        sheetOrder: [],
        styles: {},
    };
}
