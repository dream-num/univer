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
import { ColorKit, ObjectMatrix, Range } from '@univerjs/core';
import { RuleType } from '../../base/const';
import type { IColorScale, IConditionFormatRule } from '../../models/type';
import { getCellValue, getValueByType, isNullable } from './utils';

interface IRgbColor {
    b: number;

    g: number;

    r: number;

    a?: number;
}

const handleRgbA = (rgb: IRgbColor): Required<IRgbColor> => {
    if (rgb.a !== undefined) {
        return rgb as Required<IRgbColor>;
    } else {
        return { ...rgb, a: 1 };
    }
};
export type IColorScaleRenderParams = string;
export const colorScaleCellCalculateUnit = {
    type: RuleType.colorScale,
    handle: (rule: IConditionFormatRule, worksheet: Worksheet) => {
        const ruleConfig = rule.rule as IColorScale;
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
        const colorList = ruleConfig.config.sort((a, b) => a.index - b.index).map((config) => ({
            value: getValueByType(config.value, matrix)!, color: new ColorKit(config.color),
        }));
        // 如果存在相等或者后者大于前者的情况,报错。
        const isNotValid = colorList.some((item, index) => {
            if (index + 1 < colorList.length) {
                const next = colorList[index + 1];
                if (!item.color.isValid) {
                    return true;
                }
                if (isNullable(item.value) || isNullable(next.value)) {
                    return next.value;
                }
                if (item.value! >= next.value!) {
                    return true;
                }
            }
            return false;
        }) || colorList.length <= 1;

        const computeResult = new ObjectMatrix< IColorScaleRenderParams >();
        if (isNotValid) {
            return computeResult;
        }

        matrix.forValue((row, col, value) => {
            const index = colorList.findIndex((item) => item.value >= value);
            const preIndex = index - 1;
            if (index <= 0) {
                computeResult.setValue(row, col, colorList[0].color.toRgbString());
            } else if (preIndex > -1) {
                const minItem = colorList[preIndex];
                const maxItem = colorList[index];

                if (minItem.color.isValid && maxItem.color.isValid) {
                    const minRgb = handleRgbA(minItem.color.toRgb());
                    const maxRgb = handleRgbA(maxItem.color.toRgb());
                    const length = maxItem.value - minItem.value;
                    const v = (value - minItem.value) / length;
                    const rgbResult = ['r', 'g', 'b', 'a'].reduce((obj, key) => {
                        const minV = minRgb[key as unknown as keyof IRgbColor];
                        obj[key as unknown as keyof IRgbColor] = (maxRgb[key as unknown as keyof IRgbColor] - minV) * v + minV;
                        return obj;
                    }, {} as IRgbColor);
                    const result = new ColorKit(rgbResult).toRgbString();
                    computeResult.setValue(row, col, result);
                }
            } else {
                computeResult.setValue(row, col, colorList[index].color.toRgbString());
            }
        });

        const emptyStyle = '';
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
