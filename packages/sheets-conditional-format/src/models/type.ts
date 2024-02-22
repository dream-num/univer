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

import type { IRange, IStyleBase } from '@univerjs/core';
import type { NumberOperator, RuleType, SubRuleType, TextOperator, TimePeriodOperator, ValueType } from '../base/const';

export interface IBaseCfRule {
    type: string;
}
export interface IHighlightCell extends IBaseCfRule {
    style: IStyleBase;
    type: RuleType.highlightCell; // cellIs
    subType: SubRuleType;
}

export interface IValueConfig {
    type: ValueType;
    value?: number;
}

export interface IUniqueValuesHighlightCell extends IHighlightCell {
    subType: SubRuleType.uniqueValues;
}
export interface IDuplicateValuesHighlightCell extends IHighlightCell {
    subType: SubRuleType.duplicateValues;
}

export interface IRankHighlightCell extends IHighlightCell {
    subType: SubRuleType.rank; // top10
    isBottom: boolean;
    isPercent: boolean;
    value: number;
}

export interface ITextHighlightCell extends IHighlightCell {
    subType: SubRuleType.text;
    operator: TextOperator;
    value?: string;
}

export interface ITimePeriodHighlightCell extends IHighlightCell {
    subType: SubRuleType.timePeriod;
    operator: TimePeriodOperator;
}
export type INumberHighlightCell = ({
    subType: SubRuleType.number;
    operator: NumberOperator.between | NumberOperator.notBetween;
    value: [number, number];
} & IHighlightCell) | ({
    subType: SubRuleType.number;
    operator: NumberOperator.equal | NumberOperator.notEqual | NumberOperator.greaterThan | NumberOperator.greaterThanOrEqual | NumberOperator.lessThanOrEqual | NumberOperator.lessThan;
    value?: number;
} & IHighlightCell);

export interface IAverageHighlightCell extends IHighlightCell {
    subType: SubRuleType.average;
    operator: NumberOperator.greaterThan | NumberOperator.greaterThanOrEqual | NumberOperator.lessThan | NumberOperator.lessThanOrEqual | NumberOperator.equal | NumberOperator.notEqual;
}

export interface IDataBar extends IBaseCfRule {
    type: RuleType.dataBar;
    config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient: boolean;
        positiveColor: string;
        nativeColor: string;
    };
}

export interface IColorScale extends IBaseCfRule {
    type: RuleType.colorScale;
    config: { index: number; color: string; value: IValueConfig }[];
}

export type IConditionalFormatRuleConfig = IColorScale | IDataBar | IUniqueValuesHighlightCell |
IDuplicateValuesHighlightCell | IRankHighlightCell | ITextHighlightCell |
ITimePeriodHighlightCell | INumberHighlightCell | IAverageHighlightCell;
export interface IConditionFormatRule<C = IConditionalFormatRuleConfig> {
    ranges: IRange [];
    cfId: string;
    stopIfTrue: boolean;
    rule: C;
}
