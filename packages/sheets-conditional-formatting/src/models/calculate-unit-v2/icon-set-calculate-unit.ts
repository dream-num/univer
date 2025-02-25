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

import type { ICellData, Nullable } from '@univerjs/core';
import type { CFNumberOperator } from '../../base/const';
import type { IIconSet } from '../type';
import type { IContext } from './base-calculate-unit';
import { CellValueType, ObjectMatrix, Range } from '@univerjs/core';
import { CFValueType } from '../../base/const';
import { FormulaResultStatus } from '../../services/conditional-formatting-formula.service';
import { BaseCalculateUnit, CalculateEmitStatus } from './base-calculate-unit';
import { compareWithNumber, filterRange, getOppositeOperator, getValueByType, isNullable } from './utils';

const getValue = (row: number, col: number, getCell: (row: number, col: number) => ICellData) => {
    const cell = getCell(row, col);
    if (cell && cell.t === CellValueType.NUMBER) {
        const value = Number(cell.v);
        return Number.isNaN(value) ? null : value;
    }
    return null;
};
interface IConfigItem {
    operator: CFNumberOperator;
    value: number;
    iconType: string;
    iconId: string;
}
export class IconSetCalculateUnit extends BaseCalculateUnit<IConfigItem[]> {
    override preComputing(_row: number, _col: number, context: IContext): void {
        const ruleConfig = context.rule.rule as IIconSet;
        const worksheet = context.worksheet;
        const matrix = new ObjectMatrix<number>();
        const isNeedMatrix = !ruleConfig.config.every((e) => e.value.type === CFValueType.num);
        if (isNeedMatrix) {
            const ranges = filterRange(context.rule.ranges, worksheet.getMaxRows() - 1, worksheet.getMaxColumns() - 1);
            ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    const cell = context.getCellValue(row, col);
                    const v = cell && cell.v;
                    if (!isNullable(v) && cell?.t === CellValueType.NUMBER) {
                        const _value = Number(v);
                        !Number.isNaN(_value) && matrix.setValue(row, col, _value);
                    }
                });
            });
        }
        const splitValueResult = ruleConfig.config.map((v) => getValueByType(v.value, matrix, { ...context, cfId: context.rule.cfId }));
        const isAllFinished = !splitValueResult.some((item) => item.status !== FormulaResultStatus.SUCCESS);
        if (isAllFinished) {
            const splitValue = splitValueResult.map((item, index) => ({
                operator: ruleConfig.config[index].operator,
                value: Number(item.result) || 0,
            })).reduce((result, cur, index, list) => {
                const item = ruleConfig.config[index];
                if (!index || index === list.length - 1) {
                    result.push({ ...cur, iconId: item.iconId, iconType: item.iconType });
                } else {
                    const pre = list[index - 1];
                    if (!compareWithNumber(pre, cur.value)) {
                        result.push({ ...cur, iconId: item.iconId, iconType: item.iconType });
                    }
                }
                return result;
            }, [] as { operator: CFNumberOperator; value: number; iconType: string; iconId: string }[]);
            this.setPreComputingCache(splitValue);
            this._preComputingStatus$.next(CalculateEmitStatus.preComputingEnd);
            return;
        }
        this._preComputingStatus$.next(CalculateEmitStatus.preComputing);
    }

    protected override getCellResult(row: number, col: number, preComputingResult: Nullable<IConfigItem[]>, context: IContext) {
        if (!preComputingResult) {
            return null;
        }
        const value = getValue(row, col, context.getCellValue);

        if (value === null) {
            return;
        }
        const ruleConfig = context.rule.rule as IIconSet;

        const isShowValue = ruleConfig.isShowValue === undefined ? true : !!ruleConfig.isShowValue;

        for (let index = 0; index < preComputingResult.length; index++) {
            const item = preComputingResult[index];
            const start = { ...item };
            const end = { ...item };
            const { iconId, iconType } = item;
            if (index === 0) {
                if (compareWithNumber(item, value)) {
                    return { iconId, iconType, isShowValue };
                }
            } else if (index === preComputingResult.length - 1) {
                return { iconId, iconType, isShowValue };
            } else {
                const pre = preComputingResult[index - 1];
                end.operator = getOppositeOperator(pre.operator);
                end.value = pre.value;
                if (compareWithNumber(start, value) && compareWithNumber(end, value)) {
                    return { iconId, iconType, isShowValue };
                }
            }
        }
    }
}
