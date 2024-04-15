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
import type { CFNumberOperator } from '../../base/const';
import { CFRuleType } from '../../base/const';

import type { IIconSetRenderParams } from '../../render/type';
import type { IConditionFormattingRule, IIconSet } from '../../models/type';
import { ConditionalFormattingFormulaService, FormulaResultStatus } from '../conditional-formatting-formula.service';
import { compareWithNumber, filterRange, getOppositeOperator, getValueByType, isNullable } from './utils';
import type { ICalculateUnit } from './type';
import { EMPTY_STYLE } from './type';

export const iconSetCalculateUnit: ICalculateUnit = {
    type: CFRuleType.iconSet,
    handle: async (rule: IConditionFormattingRule, context) => {
        const ruleConfig = rule.rule as IIconSet;
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

        const computeResult = new ObjectMatrix<IIconSetRenderParams >();
        ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                computeResult.setValue(row, col, EMPTY_STYLE as IIconSetRenderParams);
            });
        });

        const splitValueResult = ruleConfig.config.map((v) => getValueByType(v.value, matrix, { ...context, cfId: rule.cfId }));

        const isFormulaWithoutSuccess = splitValueResult.some((item) => item.status !== FormulaResultStatus.SUCCESS);
        if (isFormulaWithoutSuccess) {
            return conditionalFormattingFormulaService.getCache(context.unitId, context.subUnitId, rule.cfId) ?? computeResult;
        }

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
        }, [] as { operator: CFNumberOperator;value: number;iconType: string;iconId: string }[]);

        const isShowValue = ruleConfig.isShowValue === undefined ? true : !!ruleConfig.isShowValue;
        matrix.forValue((row, col, value) => {
            for (let index = 0; index < splitValue.length; index++) {
                const item = splitValue[index];
                const start = { ...item };
                const end = { ...item };
                const { iconId, iconType } = item;
                if (index === 0) {
                    if (compareWithNumber(item, value)) {
                        computeResult.setValue(row, col, { iconId, iconType, isShowValue });
                        return;
                    }
                } else if (index === splitValue.length - 1) {
                    computeResult.setValue(row, col, { iconId, iconType, isShowValue });
                    return;
                } else {
                    const pre = splitValue[index - 1];
                    end.operator = getOppositeOperator(pre.operator);
                    end.value = pre.value;
                    if (compareWithNumber(start, value) && compareWithNumber(end, value)) {
                        computeResult.setValue(row, col, { iconId, iconType, isShowValue });
                        return;
                    }
                }
            }
        });

        return computeResult;
    },

};
