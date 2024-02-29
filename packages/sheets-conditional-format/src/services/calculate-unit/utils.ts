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

import type { ICellData } from '@univerjs/core';
import { ObjectMatrix, Range } from '@univerjs/core';
import type { IConditionFormatRule, IValueConfig } from '../../models/type';
import { ValueType } from '../../base/const';
import { ConditionalFormatFormulaService } from '../conditional-format-formula.service';
import { ConditionalFormatViewModel } from '../../models/conditional-format-view-model';
import type { IContext } from './type';

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
const DAY_SIZE = 86400;

export function toYMD_1900(ord: number, leap1900 = true) {
    if (leap1900 && ord >= 0) {
        if (ord === 0) {
            return [1900, 1, 0];
        }
        if (ord === 60) {
            return [1900, 2, 29];
        }
        if (ord < 60) {
            return [1900, (ord < 32 ? 1 : 2), ((ord - 1) % 31) + 1];
        }
    }
    let l = ord + 68569 + 2415019;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const nDay = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const nMonth = j + 2 - (12 * l);
    const nYear = 100 * (n - 49) + i + l;
    return [nYear | 0, nMonth | 0, nDay | 0];
}
export const serialTimeToTimestamp = (value: number) => {
    let date = (value | 0);
    const t = DAY_SIZE * (value - date);
    let time = Math.floor(t); // in seconds
    // date "epsilon" correction
    if ((t - time) > 0.9999) {
        time += 1;
        if (time === DAY_SIZE) {
            time = 0;
            date += 1;
        }
    }
    // serial date/time to gregorian calendar
    const x = (time < 0) ? DAY_SIZE + time : time;
    const [y, m, d] = toYMD_1900(value, true);
    const hh = Math.floor((x / 60) / 60) % 60;
    const mm = Math.floor(x / 60) % 60;
    const ss = Math.floor(x) % 60;
    // return it as a native date object
    const dt = new Date(0);
    dt.setUTCFullYear(y, m - 1, d);
    dt.setUTCHours(hh, mm, ss);
    return dt.getTime();
};
export const getValueByType = (value: IValueConfig, matrix: ObjectMatrix< number>, context: IContext & { cfId: string }) => {
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
            return (length * (Number(value.value) || 0) / 100) + (min || 0);
        }
        case ValueType.percentile:{
            const list = matrix.toNativeArray().sort((a, b) => a - b);
            const index = (list.length - 1) * (Number(value.value) || 0) / 100;
            const intIndex = Math.floor(index);
            const decimalIndex = index - intIndex;
            const result = list[intIndex] + (list[Math.min(intIndex + 1, list.length - 1)] - list[intIndex]) * decimalIndex;
            return result;
        }

        case ValueType.formula:{
            const { accessor, unitId, subUnitId, cfId } = context;
            const formulaText = String(value.value);
            const conditionalFormatFormulaService = accessor.get(ConditionalFormatFormulaService);
            conditionalFormatFormulaService.registerFormula(unitId, subUnitId, cfId, formulaText);
            const result = conditionalFormatFormulaService.getFormulaResult(unitId, subUnitId, formulaText);
            return result;
        }
        case ValueType.num:{
            const v = Number(value.value);
            return Number.isNaN(v) ? 0 : v;
        }
    }
};

export const getCacheStyleMatrix = <S = any>(unitId: string, subUnitId: string, rule: IConditionFormatRule, context: IContext) => {
    const { accessor } = context;
    const conditionalFormatViewModel = accessor.get(ConditionalFormatViewModel);
    const matrix = new ObjectMatrix<S>();
    rule.ranges.forEach((range) => {
        Range.foreach(range, (row, col) => {
            const cellCfItem = conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
            if (cellCfItem) {
                const item = cellCfItem.cfList.find((item) => item.cfId === rule.cfId);
                item?.ruleCache && matrix.setValue(row, col, item.ruleCache as any);
            }
        });
    });
    return matrix;
};
