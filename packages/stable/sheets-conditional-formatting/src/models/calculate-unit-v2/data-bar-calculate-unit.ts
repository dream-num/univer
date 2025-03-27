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

import type { ICellData } from '@univerjs/core';
import type { IConditionFormattingRule, IDataBar } from '../type';
import type { IContext } from './base-calculate-unit';
import { CellValueType, ObjectMatrix, Range } from '@univerjs/core';
import { CFValueType } from '../../base/const';
import { defaultDataBarNativeColor, defaultDataBarPositiveColor, defaultPlaceholderColor } from '../../render/data-bar.render';
import { FormulaResultStatus } from '../../services/conditional-formatting-formula.service';
import { BaseCalculateUnit, CalculateEmitStatus } from './base-calculate-unit';
import { filterRange, getValueByType, isNullable } from './utils';

const getSafeValue = (v: number) => Math.max(Math.min(100, v), 0);

const getValue = (row: number, col: number, getCell: (row: number, col: number) => ICellData) => {
    const cell = getCell(row, col);
    if (cell && cell.t === CellValueType.NUMBER) {
        const value = Number(cell.v);
        return Number.isNaN(value) ? null : value;
    }
    return null;
};
interface IConfig {
    min: number;
    max: number;
    startPoint: number;
}
export class DataBarCalculateUnit extends BaseCalculateUnit<IConfig> {
    override preComputing(row: number, col: number, context: IContext): void {
        const rule = context.rule as IConditionFormattingRule<IDataBar>;
        const ruleConfig = rule.rule;
        const worksheet = context.worksheet;
        const matrix = new ObjectMatrix<number>();
        const isNeedMatrix = ![rule.rule.config.max, rule.rule.config.min].every((e) => e.type === CFValueType.num);
        if (isNeedMatrix) {
            const ranges = filterRange(rule.ranges, worksheet.getMaxRows() - 1, worksheet.getMaxColumns() - 1);
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
        const _min = getValueByType(ruleConfig.config.min, matrix, { ...context, cfId: rule.cfId });
        const _max = getValueByType(ruleConfig.config.max, matrix, { ...context, cfId: rule.cfId });
        let min = 0;
        let max = 0;

        // If the formula triggers the calculation, wait for the result,
        // and use the previous style cache until the result comes out。
        if (_min.status === FormulaResultStatus.SUCCESS) {
            const v = Number(_min.result); // Get the minimum value
            min = Number.isNaN(v) ? 0 : v;
        } else {
            this._preComputingStatus$.next(CalculateEmitStatus.preComputing);
            return;
        }

        if (_max.status === FormulaResultStatus.SUCCESS) {
            const maxResult = Number(_max.result); // Get the maximum value
            const v = Number.isNaN(maxResult) ? 0 : maxResult;
            max = Math.max(v, min);
            min = Math.min(v, min);
            let startPoint = 50;
            if (min < 0 && max <= 0) {
                startPoint = 100;
            } else if (min < 0 && max > 0) {
                const length = Math.abs(max) + Math.abs(min);
                startPoint = Math.abs(min) / length * 100;
            } else if (min >= 0 && max > 0) {
                startPoint = 0;
            }
            this.setPreComputingCache({ min, max, startPoint });
            this._preComputingStatus$.next(CalculateEmitStatus.preComputingEnd);
            return;
        }
        this._preComputingStatus$.next(CalculateEmitStatus.preComputing);
    }

    // eslint-disable-next-line complexity
    protected override getCellResult(row: number, col: number, preComputingResult: IConfig, context: IContext) {
        const { min, max, startPoint } = preComputingResult;
        const rule = context.rule as IConditionFormattingRule<IDataBar>;
        const ruleConfig = rule.rule;
        const isShowValue = ruleConfig.isShowValue;
        const isGradient = ruleConfig.config.isGradient;
        const value = getValue(row, col, context.getCellValue);
        if (value === null || value < min || (min === max || max < min)) {
            return undefined;
        }

        if (value === 0) {
            // Renders a placeholder if the current value is 0
            return { color: defaultPlaceholderColor, startPoint, value: 0, isGradient, isShowValue };
        }
        if (min < 0 && max <= 0) {
            const length = max - min;

            const v = getSafeValue((max - value) / length * 100);
            if (v === 0) {
                // Renders noting if the result value is 0
                return undefined;
            }
            return { color: ruleConfig.config.nativeColor || defaultDataBarNativeColor, startPoint, value: -v, isGradient, isShowValue };
        } else if (min < 0 && max > 0) {
            if (value > 0) {
                const v = getSafeValue(Math.min(value / max, 1) * 100);
                if (v === 0) {
                    return undefined;
                }
                return { color: ruleConfig.config.positiveColor || defaultDataBarPositiveColor, startPoint, value: v, isGradient, isShowValue };
            } else {
                const v = getSafeValue(Math.min(Math.abs(value) / Math.abs(min), 1) * 100);
                if (v === 0) {
                    return undefined;
                }
                return { color: ruleConfig.config.nativeColor || defaultDataBarNativeColor, startPoint, value: -v, isGradient, isShowValue };
            }
        } else if (min >= 0 && max > 0) {
            const length = max - min;
            const startPoint = 0;
            const v = getSafeValue((1 - (max - value) / length) * 100);
            if (v === 0) {
                return undefined;
            }
            return { color: ruleConfig.config.positiveColor || defaultDataBarPositiveColor, startPoint, value: v, isGradient, isShowValue };
        }
    }
}
