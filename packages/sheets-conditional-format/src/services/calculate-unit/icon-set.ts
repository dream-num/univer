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
import { RuleType } from '../../base/const';

import type { IIconSetRenderParams } from '../../render/type';
import type { IConditionFormatRule, IIconSet } from '../../models/type';
import { ConditionalFormatFormulaService, FormulaResultStatus } from '../conditional-format-formula.service';
import { compareWithNumber, getCellValue, getOppositeOperator, getValueByType, isNullable } from './utils';
import type { ICalculateUnit } from './type';
import { EMPTY_STYLE } from './type';

export const iconSetCalculateUnit: ICalculateUnit = {
    type: RuleType.iconSet,
    handle: async (rule: IConditionFormatRule, context) => {
        const ruleConfig = rule.rule as IIconSet;
        const conditionalFormatFormulaService = context.accessor.get(ConditionalFormatFormulaService);

        const { worksheet } = context;
        const matrix = new ObjectMatrix<number>();

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

        const computeResult = new ObjectMatrix<IIconSetRenderParams >();
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                computeResult.setValue(row, col, EMPTY_STYLE as IIconSetRenderParams);
            });
        });

        const splitValueResult = ruleConfig.config.map((v) => getValueByType(v.value, matrix, { ...context, cfId: rule.cfId }));

        const isFormulaWithoutSuccess = splitValueResult.some((item) => item.status !== FormulaResultStatus.SUCCESS);
        if (isFormulaWithoutSuccess) {
            return conditionalFormatFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) ?? computeResult;
        }
        const splitValue = splitValueResult.map((item, index) => ({
            operator: ruleConfig.config[index].operator,
            value: Number(item.result) || 0,
        }));
        const isShowValue = ruleConfig.isShowValue === undefined ? true : !!ruleConfig.isShowValue;
        matrix.forValue((row, col, value) => {
            for (let index = 0; index < splitValue.length; index++) {
                const item = splitValue[index];
                const start = { ...item };
                const end = { ...item };
                const { iconId, iconType } = ruleConfig.config[index];
                if (index === 0) {
                    if (compareWithNumber(item, value)) {
                        computeResult.setValue(row, col, { iconId, iconType, isShowValue });
                        return;
                    }
                } else {
                    const pre = splitValue[index - 1];
                    end.operator = getOppositeOperator(pre.operator);
                    end.value = pre.value;
                }
                if (compareWithNumber(start, value) && compareWithNumber(end, value)) {
                    computeResult.setValue(row, col, { iconId, iconType, isShowValue });
                    return;
                }
            }
        });

        return computeResult;
    },

};
