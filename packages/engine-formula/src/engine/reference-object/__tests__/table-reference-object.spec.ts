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

import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { TableOptionType } from '../../../basics/common';
import { ErrorType } from '../../../basics/error-type';
import { TableReferenceObject } from '../table-reference-object';

const options = new Map([
    ['#All', TableOptionType.ALL],
    ['#Data', TableOptionType.DATA],
    ['#Totals', TableOptionType.TOTALS],
    ['#This Row', TableOptionType.THIS_ROW],
]);

describe('TableReferenceObject current row', () => {
    it('includes row zero for a headerless Base virtual table', () => {
        const reference = new TableReferenceObject('Orders[[#Data],[Amount]]', {
            sheetId: 'orders',
            titleMap: new Map([['Amount', 0]]),
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            showHeader: false,
        }, '[[#Data],[Amount]]', options);
        reference.setDefaultUnitId('base');
        reference.setUnitData({
            base: {
                orders: {
                    cellData: new ObjectMatrix({ 0: { 0: { v: 10 } }, 1: { 0: { v: 20 } } }),
                    rowCount: 2,
                    columnCount: 1,
                    rowData: {},
                    columnData: {},
                },
            },
        });

        expect(reference.toArrayValueObject(false).getFirstCell().getValue()).toBe(10);
    });

    it('returns N/A when the host row has no corresponding target table row', () => {
        const reference = new TableReferenceObject('Table[[#This Row],[Amount]]', {
            sheetId: 'sheet',
            titleMap: new Map([['Amount', 0]]),
            range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
        }, '[[#This Row],[Amount]]', options);
        reference.setDefaultUnitId('unit');
        reference.setCurrentRowAndColumn(4, 0);
        reference.setUnitData({
            unit: {
                sheet: {
                    cellData: new ObjectMatrix({ 1: { 0: { v: 10 } }, 2: { 0: { v: 20 } } }),
                    rowCount: 3,
                    columnCount: 1,
                    rowData: {},
                    columnData: {},
                },
            },
        });

        expect(reference.toArrayValueObject(false).getFirstCell().getValue()).toBe(ErrorType.NA);
    });

    it('excludes a declared totals row from data references', () => {
        const table = {
            sheetId: 'sheet',
            titleMap: new Map([['Amount', 0]]),
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 0 },
            showFooter: true,
        };

        expect(new TableReferenceObject('Table[Amount]', table, '[Amount]', options).getRangeData()).toEqual({
            startRow: 1,
            endRow: 2,
            startColumn: 0,
            endColumn: 0,
        });
        expect(new TableReferenceObject(
            'Table[[#Totals],[Amount]]',
            table,
            '[[#Totals],[Amount]]',
            options
        ).getRangeData()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 0,
        });
    });

    it('matches CRLF structured references against LF table column names', () => {
        const reference = new TableReferenceObject('Table_FMEA[[#This Row],[F\r\n(1-5)]]', {
            sheetId: 'sheet',
            titleMap: new Map([['F\n(1-5)', 3]]),
            range: { startRow: 7, endRow: 33, startColumn: 0, endColumn: 14 },
        }, '[[#This Row],[F\r\n(1-5)]]', options);
        reference.setCurrentRowAndColumn(8, 6);

        expect(reference.getRangeData()).toEqual({
            startRow: 8,
            endRow: 8,
            startColumn: 3,
            endColumn: 3,
        });
    });

    it('treats commas inside single-bracket column titles as title text', () => {
        const reference = new TableReferenceObject('Table1[Deposit,\r\nCredit (+)]', {
            sheetId: 'sheet',
            titleMap: new Map([['Deposit,\nCredit (+)', 6]]),
            range: { startRow: 0, endRow: 10, startColumn: 0, endColumn: 7 },
        }, '[Deposit,\r\nCredit (+)]', options);

        expect(reference.getRangeData()).toEqual({
            startRow: 1,
            endRow: 10,
            startColumn: 6,
            endColumn: 6,
        });
    });

    it('treats a trailing colon inside a single-bracket column title as title text', () => {
        const reference = new TableReferenceObject('Table1[Business Name:]', {
            sheetId: 'sheet',
            titleMap: new Map([['Business Name:', 3]]),
            range: { startRow: 0, endRow: 10, startColumn: 0, endColumn: 6 },
        }, '[Business Name:]', options);

        expect(reference.getRangeData()).toEqual({
            startRow: 1,
            endRow: 10,
            startColumn: 3,
            endColumn: 3,
        });
    });
});
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
