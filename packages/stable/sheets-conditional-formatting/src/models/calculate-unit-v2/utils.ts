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

import type { CellValue, ICellData, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import type { IConditionFormattingRule, IValueConfig } from '../../models/type';
import type { IContext } from './base-calculate-unit';
import { BooleanNumber, CellValueType, ColorKit, dayjs, ObjectMatrix, Range } from '@univerjs/core';
import { BooleanValue } from '@univerjs/engine-formula';
import { CFNumberOperator, CFValueType } from '../../base/const';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../../services/conditional-formatting-formula.service';
import { ConditionalFormattingViewModel } from '../conditional-formatting-view-model';

export function isFloatsEqual(a: number, b: number) {
    return Math.abs(a - b) < Number.EPSILON;
}
export const isNullable = (v: any) => [undefined, null].includes(v);
export const getCellValue = (cell?: ICellData) => {
    if (!cell) {
        return null;
    }
    if (cell.t === CellValueType.BOOLEAN) {
        return cell.v === BooleanNumber.TRUE ? BooleanValue.TRUE : BooleanValue.FALSE;
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
    const dt = dayjs(`${y}/${m}/${d} ${hh}:${mm}:${ss}`);
    const result = dt.valueOf();
    return result;
};
// eslint-disable-next-line max-lines-per-function
export const getValueByType = (value: IValueConfig, matrix: ObjectMatrix<number>, context: IContext & { cfId: string }) => {
    switch (value.type) {
        case CFValueType.max: {
            let max = 0;
            matrix.forValue((row, col, value) => {
                if (value > max) {
                    max = value;
                }
            });
            return {
                status: FormulaResultStatus.SUCCESS,
                result: max,
            };
        }
        case CFValueType.min: {
            let min: number | undefined;
            matrix.forValue((row, col, value) => {
                if (min === undefined) {
                    min = value;
                }
                if (value < min!) {
                    min = value;
                }
            });
            return {
                status: FormulaResultStatus.SUCCESS,
                result: min,
            };
        }
        case CFValueType.percent: {
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
            const v = Math.max(Math.min(Number(value.value) || 0, 100), 0);
            return {
                status: FormulaResultStatus.SUCCESS,
                result: length * (v / 100) + (min || 0),
            };
        }
        case CFValueType.percentile: {
            const list = matrix.toNativeArray().sort((a, b) => a - b);
            const v = Math.max(Math.min(Number(value.value) || 0, 100), 0);
            const index = (list.length - 1) * v / 100;
            const intIndex = Math.floor(index);
            const decimalIndex = index - intIndex;
            const result = list[intIndex] + (list[Math.min(intIndex + 1, list.length - 1)] - list[intIndex]) * decimalIndex;
            return {
                status: FormulaResultStatus.SUCCESS,
                result,
            };
        }

        case CFValueType.formula: {
            const { accessor, unitId, subUnitId, cfId } = context;
            const formulaText = String(value.value);
            const conditionalFormattingFormulaService = accessor.get(ConditionalFormattingFormulaService);
            conditionalFormattingFormulaService.registerFormulaWithRange(unitId, subUnitId, cfId, formulaText);
            const result = conditionalFormattingFormulaService.getFormulaResultWithCoords(unitId, subUnitId, cfId, formulaText);
            return result;
        }
        case CFValueType.num: {
            const v = Number(value.value);
            return {
                status: FormulaResultStatus.SUCCESS,
                result: Number.isNaN(v) ? 0 : v,
            };
        }
    }
};

export const getCacheStyleMatrix = <S = any>(unitId: string, subUnitId: string, rule: IConditionFormattingRule, context: IContext) => {
    const { accessor } = context;
    const conditionalFormattingViewModel = accessor.get(ConditionalFormattingViewModel);
    const matrix = new ObjectMatrix<S>();
    rule.ranges.forEach((range) => {
        Range.foreach(range, (row, col) => {
            const cellCfItem = conditionalFormattingViewModel.getCellCfs(unitId, subUnitId, row, col);
            if (cellCfItem) {
                const item = cellCfItem.find((item) => item.cfId === rule.cfId);
                item?.result && matrix.setValue(row, col, item.result);
            }
        });
    });
    return matrix;
};
// eslint-disable-next-line complexity
export const compareWithNumber = (config: { operator: CFNumberOperator; value: number | [number, number] }, v: number) => {
    switch (config.operator) {
        case CFNumberOperator.between: {
            if (typeof config.value !== 'object' || !(config.value as unknown as Array<number>).length) {
                return;
            }
            const start = Math.min(...config.value as [number, number]);
            const end = Math.max(...config.value as [number, number]);
            return v >= start && v <= end;
        }
        case CFNumberOperator.notBetween: {
            if (typeof config.value !== 'object' || !(config.value as unknown as Array<number>).length) {
                return;
            }
            const start = Math.min(...config.value as [number, number]);
            const end = Math.max(...config.value as [number, number]);
            return !(v >= start && v <= end);
        }
        case CFNumberOperator.equal: {
            const condition = (config.value || 0) as number;
            return isFloatsEqual(condition, v);
        }
        case CFNumberOperator.notEqual: {
            const condition = (config.value || 0) as number;
            return !isFloatsEqual(condition, v);
        }
        case CFNumberOperator.greaterThan: {
            const condition = (config.value || 0) as number;
            return v > condition;
        }
        case CFNumberOperator.greaterThanOrEqual: {
            const condition = (config.value || 0) as number;
            return v >= condition;
        }
        case CFNumberOperator.lessThan: {
            const condition = (config.value || 0) as number;
            return v < condition;
        }
        case CFNumberOperator.lessThanOrEqual: {
            const condition = (config.value || 0) as number;
            return v <= condition;
        }
        default: {
            return false;
        }
    }
};
export const getOppositeOperator = (operator: CFNumberOperator) => {
    switch (operator) {
        case CFNumberOperator.greaterThan: {
            return CFNumberOperator.lessThanOrEqual;
        }
        case CFNumberOperator.greaterThanOrEqual: {
            return CFNumberOperator.lessThan;
        }
        case CFNumberOperator.lessThan: {
            return CFNumberOperator.greaterThanOrEqual;
        }
        case CFNumberOperator.lessThanOrEqual: {
            return CFNumberOperator.greaterThan;
        }
    }
    return operator;
};

export const getColorScaleFromValue = (colorList: { color: ColorKit; value: number }[], value: number) => {
    interface IRgbColor {
        b: number;
        g: number;
        r: number;
        a?: number;
    }
    const prefixRgba = (rgb: IRgbColor): Required<IRgbColor> => {
        if (rgb.a !== undefined) {
            return rgb as Required<IRgbColor>;
        } else {
            return { ...rgb, a: 1 };
        }
    };
    const index = colorList.findIndex((item) => item.value >= value);
    const preIndex = index - 1;
    if (index === 0) {
        return colorList[0].color.toRgbString();
    } else if (preIndex >= 0) {
        const minItem = colorList[preIndex];
        const maxItem = colorList[index];

        if (minItem.color.isValid && maxItem.color.isValid) {
            const minRgb = prefixRgba(minItem.color.toRgb());
            const maxRgb = prefixRgba(maxItem.color.toRgb());
            const length = maxItem.value - minItem.value;
            const v = (value - minItem.value) / length;
            const rgbResult = ['r', 'g', 'b', 'a'].reduce((obj, key) => {
                const minV = minRgb[key as unknown as keyof IRgbColor];
                obj[key as unknown as keyof IRgbColor] = (maxRgb[key as unknown as keyof IRgbColor] - minV) * v + minV;
                return obj;
            }, {} as IRgbColor);
            const result = new ColorKit(rgbResult).toRgbString();
            return result;
        }
    } else {
        return colorList[colorList.length - 1].color.toRgbString();
    }
};

export const filterRange = (ranges: IRange[], maxRow: number, maxCol: number): IRange[] => {
    return ranges.map((range) => {
        if (range.startColumn > maxCol || range.startRow > maxRow) {
            return null as unknown as IRange;
        }
        const _range = { ...range };
        _range.endRow = Math.min(_range.endRow, maxRow);
        _range.endColumn = Math.min(_range.endColumn, maxCol);
        return _range;
    }).filter((range) => !!range);
};

export function getMaxInFormulaResult(result: IObjectMatrixPrimitiveType<Nullable<CellValue>>) {
    let max = 0;
    new ObjectMatrix(result).forValue((row, col, value) => {
        max = Math.max(Number.isNaN(max) ? 0 : max, Number(value));
    });
    return max;
}
