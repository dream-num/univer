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

import { BooleanNumber, type IColumnData, type IRowData } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getOldColumnData, getOldRowData } from '../row-column-value';

describe('test getOldRowData', () => {
    it('should return null if currentRow is null or undefined', () => {
        expect(getOldRowData(null, {})).toBeNull();
        expect(getOldRowData(undefined, {})).toBeUndefined();
    });

    it('should return a deep clone of currentRow if newRow is null or undefined', () => {
        const currentRow: Partial<IRowData> = { h: 20, ia: BooleanNumber.TRUE };
        const result = getOldRowData(currentRow, null);
        expect(result).toEqual(currentRow);
        expect(result).not.toBe(currentRow); // Ensure it's a deep clone

        const result2 = getOldRowData(currentRow, undefined);
        expect(result2).toEqual(currentRow);
        expect(result2).not.toBe(currentRow); // Ensure it's a deep clone
    });

    it('should return only the changed properties from currentRow', () => {
        const currentRow: Partial<IRowData> = { h: 20, ia: BooleanNumber.TRUE, ah: 30, hd: BooleanNumber.FALSE, s: 'style', custom: { key: 'customData' } };
        const newRow: Partial<IRowData> = { h: 25, ia: BooleanNumber.FALSE };

        const result = getOldRowData(currentRow, newRow);
        expect(result).toEqual({ h: 20, ia: BooleanNumber.TRUE });
    });

    it('should return an empty object if no properties have changed', () => {
        const currentRow: Partial<IRowData> = { h: 20, ia: BooleanNumber.TRUE };
        const newRow: Partial<IRowData> = {};

        const result = getOldRowData(currentRow, newRow);
        expect(result).toEqual({});
    });

    it('should handle mixed property changes correctly', () => {
        const currentRow: Partial<IRowData> = { h: 20, ia: BooleanNumber.TRUE, ah: 30, hd: BooleanNumber.FALSE, s: 'style', custom: { key: 'customData' } };
        const newRow: Partial<IRowData> = { h: 25, ah: 40, custom: { key: 'newCustomData' } };

        const result = getOldRowData(currentRow, newRow);
        expect(result).toEqual({ h: 20, ah: 30, custom: { key: 'customData' } });
    });
});

describe('test getOldColumnData', () => {
    it('should return null if currenColumn is null or undefined', () => {
        expect(getOldColumnData(null, {})).toBeNull();
        expect(getOldColumnData(undefined, {})).toBeUndefined();
    });

    it('should return a deep clone of currenColumn if newColumn is null or undefined', () => {
        const currenColumn: Partial<IColumnData> = { w: 20, hd: BooleanNumber.TRUE };
        const result = getOldColumnData(currenColumn, null);
        expect(result).toEqual(currenColumn);
        expect(result).not.toBe(currenColumn); // Ensure it's a deep clone

        const result2 = getOldColumnData(currenColumn, undefined);
        expect(result2).toEqual(currenColumn);
        expect(result2).not.toBe(currenColumn); // Ensure it's a deep clone
    });

    it('should return only the changed properties from currenColumn', () => {
        const currenColumn: Partial<IColumnData> = { w: 20, hd: BooleanNumber.TRUE, s: 'style', custom: { key: 'customData' } };
        const newColumn: Partial<IColumnData> = { w: 25, hd: BooleanNumber.FALSE };

        const result = getOldColumnData(currenColumn, newColumn);
        expect(result).toEqual({ w: 20, hd: BooleanNumber.TRUE });
    });

    it('should return an empty object if no properties have changed', () => {
        const currenColumn: Partial<IColumnData> = { w: 20, hd: BooleanNumber.TRUE };
        const newColumn: Partial<IColumnData> = {};

        const result = getOldColumnData(currenColumn, newColumn);
        expect(result).toEqual({});
    });

    it('should handle mixed property changes correctly', () => {
        const currenColumn: Partial<IColumnData> = { w: 20, hd: BooleanNumber.FALSE, s: 'style', custom: { key: 'customData' } };
        const newColumn: Partial<IColumnData> = { w: 25, custom: { key: 'newCustomData' } };

        const result = getOldColumnData(currenColumn, newColumn);
        expect(result).toEqual({ w: 20, custom: { key: 'customData' } });
    });
});
