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

import { CellValueType, ObjectMatrix, Range } from '@univerjs/core';
import { CFRuleType } from '../../base/const';
import type { IDataBarRenderParams } from '../../render/type';
import type { IConditionFormattingRule, IDataBar } from '../../models/type';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../conditional-formatting-formula.service';
import { filterRange, getValueByType, isNullable } from './utils';
import type { ICalculateUnit } from './type';
import { EMPTY_STYLE } from './type';

export const dataBarCellCalculateUnit: ICalculateUnit = {
    type: CFRuleType.dataBar,
    handle: async (rule: IConditionFormattingRule, context) => {
        const ruleConfig = rule.rule as IDataBar;
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

        const computeResult = new ObjectMatrix<IDataBarRenderParams>();
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                computeResult.setValue(row, col, EMPTY_STYLE as IDataBarRenderParams);
            });
        });

        const _min = getValueByType(ruleConfig.config.min, matrix, { ...context, cfId: rule.cfId });
        const _max = getValueByType(ruleConfig.config.max, matrix, { ...context, cfId: rule.cfId });
        let min = 0;
        let max = 0;

        // If the formula triggers the calculation, wait for the result,
        // and use the previous style cache until the result comes out。
        if (_min.status === FormulaResultStatus.WAIT) {
            return conditionalFormattingFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) || computeResult;
        } else if (_min.status === FormulaResultStatus.SUCCESS) {
            const v = Number(_min.result);
            min = Number.isNaN(v) ? 0 : v;
        } else {
            return computeResult;
        }
        if (_max.status === FormulaResultStatus.WAIT) {
            return conditionalFormattingFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) || computeResult;
        } else if (_max.status === FormulaResultStatus.SUCCESS) {
            const v = Number(_max.result);
            max = Number.isNaN(v) ? 0 : v;
        } else {
            return computeResult;
        }

        const isGradient = ruleConfig.config.isGradient;
        const isShowValue = ruleConfig.isShowValue;

        const getSafeValue = (v: number) => Math.max(Math.min(100, v), 0);

        if (min === max || max < min) {
            // do nothing,don't know how it work.
        } else if (min < 0 && max <= 0) {
            const length = max - min;
            const startPoint = 100;
            matrix.forValue((row, col, value) => {
                if (value > max) {
                    return;
                }
                const v = getSafeValue((max - value) / length * 100);
                computeResult.setValue(row, col, { color: ruleConfig.config.nativeColor, startPoint, value: -v, isGradient, isShowValue });
            });
        } else if (min < 0 && max > 0) {
            const length = Math.abs(max) + Math.abs(min);
            const startPoint = Math.abs(min) / length * 100;
            matrix.forValue((row, col, value) => {
                if (!value) {
                    return;
                }
                if (value > 0) {
                    const v = getSafeValue(Math.min(value / max, 1) * 100);
                    computeResult.setValue(row, col, { color: ruleConfig.config.positiveColor, startPoint, value: v, isGradient, isShowValue });
                } else {
                    const v = getSafeValue(Math.min(Math.abs(value) / Math.abs(min), 1) * 100);
                    computeResult.setValue(row, col, { color: ruleConfig.config.nativeColor, startPoint, value: -v, isGradient, isShowValue });
                }
            });
        } else if (min >= 0 && max > 0) {
            const length = max - min;
            const startPoint = 0;
            matrix.forValue((row, col, value) => {
                if (value < min) {
                    return;
                }
                const v = getSafeValue((1 - (max - value) / length) * 100);
                computeResult.setValue(row, col, { color: ruleConfig.config.positiveColor, startPoint, value: v, isGradient, isShowValue });
            });
        }
        return computeResult;
    },

};
