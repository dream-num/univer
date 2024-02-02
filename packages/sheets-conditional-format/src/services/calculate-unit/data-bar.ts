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

import type { Worksheet } from '@univerjs/core';
import { ObjectMatrix, Range } from '@univerjs/core';
import { RuleType } from '../../base/const';
import type { IDataBarRenderParams } from '../../render/type';
import type { IConditionFormatRule, IDataBar } from '../../models/type';
import { getCellValue, getValueByType, isNullable } from './utils';

export const dataBarCellCalculateUnit = {
    type: RuleType.dataBar,
    handle: (rule: IConditionFormatRule, worksheet: Worksheet) => {
        const ruleConfig = rule.rule as IDataBar;
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
        const min = getValueByType(ruleConfig.config.min, matrix)!;
        const max = getValueByType(ruleConfig.config.max, matrix)!;
        const computeResult = new ObjectMatrix<{ dataBar: IDataBarRenderParams['dataBar'] }>();
        if (min === max || max < min) {
            // todo nothing,i don't know how it work.
        } else if (min < 0 && max <= 0) {
            const length = max - min;
            const startPoint = 100;
            matrix.forValue((row, col, value) => {
                if (value > max) {
                    return;
                }
                const v = (max - value) / length * 100;
                computeResult.setValue(row, col, { dataBar: { color: ruleConfig.config.nativeColor, startPoint, value: -v } });
            });
        } else if (min < 0 && max > 0) {
            const length = Math.abs(max) + Math.abs(min);
            const startPoint = Math.abs(min) / length * 100;
            matrix.forValue((row, col, value) => {
                if (!value) {
                    return;
                }
                if (value > 0) {
                    const v = Math.min(value / max, 1) * 100;
                    computeResult.setValue(row, col, { dataBar: { color: ruleConfig.config.positiveColor, startPoint, value: v } });
                } else {
                    const v = Math.min(Math.abs(value) / Math.abs(min), 1) * 100;
                    computeResult.setValue(row, col, { dataBar: { color: ruleConfig.config.nativeColor, startPoint, value: -v } });
                }
            });
        } else if (min >= 0 && max > 0) {
            const length = max - min;
            const startPoint = 0;
            matrix.forValue((row, col, value) => {
                if (value < min) {
                    return;
                }
                const v = (1 - (max - value) / length) * 100;
                computeResult.setValue(row, col, { dataBar: { color: ruleConfig.config.positiveColor, startPoint, value: v } });
            });
        }
        const emptyStyle = {} as { dataBar: IDataBarRenderParams['dataBar'] };
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (!computeResult.getValue(row, col)) {
                    computeResult.setValue(row, col, emptyStyle);
                }
            });
        });
        return computeResult;
    },

};
