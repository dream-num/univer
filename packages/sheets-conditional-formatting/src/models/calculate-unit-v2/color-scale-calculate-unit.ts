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

import type { IColorScale, IConditionFormattingRule } from '../type';
import type { IContext } from './base-calculate-unit';
import { CellValueType, ColorKit, ObjectMatrix, Range } from '@univerjs/core';
import { isObject } from '@univerjs/engine-render';
import { CFValueType } from '../../base/const';
import { FormulaResultStatus } from '../../services/conditional-formatting-formula.service';
import { BaseCalculateUnit, CalculateEmitStatus } from './base-calculate-unit';
import { filterRange, getColorScaleFromValue, getValueByType, isNullable } from './utils';

interface IConfigItem {
    value: number;
    color: ColorKit;
}

export class ColorScaleCalculateUnit extends BaseCalculateUnit<IConfigItem[], string> {
    override preComputing(_row: number, _col: number, context: IContext): void {
        const rule = context.rule as IConditionFormattingRule<IColorScale>;
        const worksheet = context.worksheet;
        const matrix = new ObjectMatrix<number>();
        const isNeedMatrix = !rule.rule.config.every((item) => item.value.type === CFValueType.num);
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
        const _configList = [...rule.rule.config].sort((a, b) => a.index - b.index).map((config) => {
            return {
                value: getValueByType(config.value, matrix, {
                    ...context,
                    cfId: rule.cfId,
                }),
                color: new ColorKit(config.color),
            };
        });
        const isAllFinished = !_configList.some((item) => isObject(item.value) ? item.value.status !== FormulaResultStatus.SUCCESS : false);

        if (isAllFinished) {
            const colorList = _configList
                .map((item) => item.color)
                .reduce((result, color, index) => {
                    result.result.push({ color, value: result.sortValue[index] });
                    return result;
                }, {
                    result: [] as { value: number; color: ColorKit }[],
                    sortValue: _configList.map((item) => item.value.result as number).sort((a, b) => a - b),
                })
                .result;
            this.setPreComputingCache(colorList);
            this._preComputingStatus$.next(CalculateEmitStatus.preComputingEnd);
            return;
        }
        this._preComputingStatus$.next(CalculateEmitStatus.preComputing);
    }

    protected override getCellResult(row: number, col: number, preComputingResult: IConfigItem[], context: IContext) {
        if (!preComputingResult) {
            return null;
        }
        const value = context.getCellValue(row, col);
        if (value.t === CellValueType.NUMBER) {
            const v = Number(value.v);
            if (!Number.isNaN(v)) {
                const color = getColorScaleFromValue(preComputingResult, v);
                return color;
            }
        }
        return undefined;
    }
}
