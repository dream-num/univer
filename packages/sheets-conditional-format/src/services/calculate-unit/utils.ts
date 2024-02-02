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

import type { ICellData, ObjectMatrix } from '@univerjs/core';
import type { IValueConfig } from '../../models/type';
import { ValueType } from '../../base/const';

export function isFloatsEqual(a: number, b: number) {
    return Math.abs(a - b) < Number.EPSILON;
}
export const isNullable = (v: any) => [undefined, null].includes(v);
export const getCellValue = (cell?: ICellData) => {
    if (!cell) {
        return null;
    }
    const v = cell.v;
    const dataStream = cell.p?.body?.dataStream.replace(/\r\n$/, '');
    return !isNullable(v) ? v : !isNullable(dataStream) ? dataStream : null;
};
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export const serialTimeToTimestamp = (serialValue: number, is1900 = true) => {
    const excelBaseDate = new Date('1900-01-01').getTime();
    const timestamp = (serialValue - (is1900 ? 25569 : 24107)) * millisecondsPerDay + excelBaseDate;
    return timestamp;
};
export const getValueByType = (value: IValueConfig, matrix: ObjectMatrix< number>) => {
    switch (value.type) {
        case ValueType.max:{
            let max = 0;
            matrix.forValue((row, col, value) => {
                if (value > max) {
                    max = value;
                }
            });
            return max;
        }
        case ValueType.min:{
            let min: number | undefined;
            matrix.forValue((row, col, value) => {
                if (min === undefined) {
                    min = value;
                }
                if (value < min!) {
                    min = value;
                }
            });
            return min;
        }
        case ValueType.percent:{
            let max: number | undefined;
            let min: number | undefined;
            matrix.forValue((row, col, value) => {
                if (max === undefined || min === undefined) {
                    max = value;
                    min = value;
                }
                if (value > max!) {
                    max = value;
                }
                if (value < min!) {
                    min = value;
                }
            });
            const length = (max || 0) - (min || 0);
            return (length * (value.value || 0) / 100) + (min || 0);
        }
        case ValueType.percentile:{
            const list = matrix.toNativeArray().sort((a, b) => a - b);
            const index = (list.length - 1) * (value.value || 0) / 100;
            const intIndex = Math.floor(index);
            const decimalIndex = index - intIndex;
            const result = list[intIndex] + (list[Math.min(intIndex + 1, list.length - 1)] - list[intIndex]) * decimalIndex;
            return result;
        }

        case ValueType.formula:{
            return value.value;
        }
        case ValueType.num:{
            return value.value;
        }
    }
};
