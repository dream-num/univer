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

import { ObjectMatrix, Range } from '@univerjs/core';
import { RuleType, ValueType } from '../../base/const';
import type { IDataBarRenderParams } from '../../render/type';
import type { IConditionFormatRule, IDataBar } from '../../models/type';
import { ConditionalFormatFormulaService, FormulaResultStatus } from '../conditional-format-formula.service';
import { getCellValue, getValueByType, isNullable } from './utils';
import type { ICalculateUnit } from './type';

const EMPTY_STYLE = {} as IDataBarRenderParams;
Object.freeze(EMPTY_STYLE);

export const dataBarCellCalculateUnit: ICalculateUnit = {
    type: RuleType.dataBar,
    handle: async (rule: IConditionFormatRule, context) => {
        const ruleConfig = rule.rule as IDataBar;
        const conditionalFormatFormulaService = context.accessor.get(ConditionalFormatFormulaService);

        const { worksheet } = context;
        const matrix = new ObjectMatrix< number>();

        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const cell = worksheet?.getCellRaw(row, col);
                const v = cell && getCellValue(cell);
                if (!isNullable(v)) {
                    const _value = Number(v);
                    !Number.isNaN(_value) && matrix.setValue(row, col, _value);
                }
            });
        });

        const computeResult = new ObjectMatrix<IDataBarRenderParams >();
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                computeResult.setValue(row, col, EMPTY_STYLE);
            });
        });

        let min = getValueByType(ruleConfig.config.min, matrix, { ...context, cfId: rule.cfId }) as number;
        let max = getValueByType(ruleConfig.config.max, matrix, { ...context, cfId: rule.cfId }) as number;

         // If the formula triggers the calculation, wait for the result,
         // and use the previous style cache until the result comes out。
        if (ruleConfig.config.min.type === ValueType.formula) {
            // eslint-disable-next-line ts/no-explicit-any
            const _min = min as unknown as { result: any;status: FormulaResultStatus };
            if (_min.status === FormulaResultStatus.WAIT) {
                return conditionalFormatFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) || computeResult;
            } else if (_min.status === FormulaResultStatus.SUCCESS) {
                const v = Number(_min.result);
                min = Number.isNaN(v) ? 0 : v;
            } else {
                return computeResult;
            }
        }
        if (ruleConfig.config.max.type === ValueType.formula) {
            const _max = max as unknown as { result: any;status: FormulaResultStatus };
            if (_max.status === FormulaResultStatus.WAIT) {
                return conditionalFormatFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) || computeResult;
            } else if (_max.status === FormulaResultStatus.SUCCESS) {
                const v = Number(_max.result);
                max = Number.isNaN(v) ? 0 : v;
            } else {
                return computeResult;
            }
        }

        const isGradient = ruleConfig.config.isGradient;

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
                computeResult.setValue(row, col, { color: ruleConfig.config.nativeColor, startPoint, value: -v, isGradient });
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
                    computeResult.setValue(row, col, { color: ruleConfig.config.positiveColor, startPoint, value: v, isGradient });
                } else {
                    const v = getSafeValue(Math.min(Math.abs(value) / Math.abs(min), 1) * 100);
                    computeResult.setValue(row, col, { color: ruleConfig.config.nativeColor, startPoint, value: -v, isGradient });
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
                computeResult.setValue(row, col, { color: ruleConfig.config.positiveColor, startPoint, value: v, isGradient });
            });
        }
        return computeResult;
    },

};
