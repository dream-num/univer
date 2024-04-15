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

import { CellValueType, ColorKit, ObjectMatrix, Range } from '@univerjs/core';
import { isObject } from '@univerjs/engine-render';
import { CFRuleType } from '../../base/const';
import type { IColorScale, IConditionFormattingRule } from '../../models/type';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../conditional-formatting-formula.service';
import { filterRange, getColorScaleFromValue, getValueByType, isNullable } from './utils';
import type { ICalculateUnit } from './type';

const emptyStyle = '';
export const colorScaleCellCalculateUnit: ICalculateUnit = {
    type: CFRuleType.colorScale,
    handle: async (rule: IConditionFormattingRule, context) => {
        const ruleConfig = rule.rule as IColorScale;
        const conditionalFormattingFormulaService = context.accessor.get(ConditionalFormattingFormulaService);
        const { worksheet } = context;
        const matrix = new ObjectMatrix<number>();
        const ranges = filterRange(rule.ranges, worksheet.getMaxRows() - 1, worksheet.getMaxColumns() - 1);
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const cell = worksheet?.getCellRaw(row, col);
                const v = cell && cell.v;
                if (!isNullable(v) && cell?.t === CellValueType.NUMBER) {
                    const _value = Number(v);
                    !Number.isNaN(_value) && matrix.setValue(row, col, _value);
                }
            });
        });

        const computeResult = new ObjectMatrix<string>();
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                computeResult.setValue(row, col, emptyStyle);
            });
        });

        const _configList = [...ruleConfig.config].sort((a, b) => a.index - b.index).map((config) => {
            return {
                value: getValueByType(config.value, matrix, { ...context, cfId: rule.cfId }), color: new ColorKit(config.color),
            };
        });
        // If the formula triggers the calculation, wait for the result,
        // and use the previous style cache until the result comes out
        const isFormulaWithoutSuccess = _configList.some((item) => isObject(item.value) ? item.value.status !== FormulaResultStatus.SUCCESS : false);
        if (isFormulaWithoutSuccess) {
            return conditionalFormattingFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) ?? computeResult;
        }

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

        if (colorList.length <= 1) {
            return computeResult;
        }

        matrix.forValue((row, col, value) => {
            const color = getColorScaleFromValue(colorList, value);
            color && computeResult.setValue(row, col, color);
        });
        return computeResult;
    },

};
