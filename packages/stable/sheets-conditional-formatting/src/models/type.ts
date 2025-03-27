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

import type { IRange, IStyleBase } from '@univerjs/core';
import type { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFTimePeriodOperator, CFValueType } from '../base/const';
import type { IIconType } from './icon-map';

export interface IBaseCfRule {
    type: string;
}
export interface IHighlightCell extends IBaseCfRule {
    style: IStyleBase;
    type: CFRuleType.highlightCell; // cellIs
    subType: CFSubRuleType;
}

export interface IValueConfig {
    type: CFValueType;
    value?: number | string;
}

export interface IUniqueValuesHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.uniqueValues;
}
export interface IDuplicateValuesHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.duplicateValues;
}

export interface IRankHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.rank; // top10
    isBottom: boolean;
    isPercent: boolean;
    value: number;
}

export interface ITextHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.text;
    operator: CFTextOperator;
    value?: string;
}

export interface ITimePeriodHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.timePeriod;
    operator: CFTimePeriodOperator;
}

export interface IFormulaHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.formula;
    value: string;
}
export type INumberHighlightCell = ({
    subType: CFSubRuleType.number;
    operator: CFNumberOperator.between | CFNumberOperator.notBetween;
    value: [number, number];
} & IHighlightCell) | ({
    subType: CFSubRuleType.number;
    operator: CFNumberOperator.equal | CFNumberOperator.notEqual | CFNumberOperator.greaterThan | CFNumberOperator.greaterThanOrEqual | CFNumberOperator.lessThanOrEqual | CFNumberOperator.lessThan;
    value?: number;
} & IHighlightCell);

export interface IAverageHighlightCell extends IHighlightCell {
    subType: CFSubRuleType.average;
    operator: CFNumberOperator.greaterThan | CFNumberOperator.greaterThanOrEqual | CFNumberOperator.lessThan | CFNumberOperator.lessThanOrEqual | CFNumberOperator.equal | CFNumberOperator.notEqual;
}

export interface IDataBar extends IBaseCfRule {
    type: CFRuleType.dataBar;
    isShowValue: boolean;
    config: {
        min: IValueConfig;
        max: IValueConfig;
        isGradient: boolean;
        positiveColor: string;
        nativeColor: string;
    };
}

export interface IColorScale extends IBaseCfRule {
    type: CFRuleType.colorScale;
    config: { index: number; color: string; value: IValueConfig }[];
}

export interface IIconSet extends IBaseCfRule {
    type: CFRuleType.iconSet;
    isShowValue: boolean;
    config: { operator: CFNumberOperator; value: IValueConfig; iconType: IIconType; iconId: string }[];
}

export type IConditionalFormattingRuleConfig = IColorScale | IDataBar | IUniqueValuesHighlightCell |
IDuplicateValuesHighlightCell | IRankHighlightCell | ITextHighlightCell |
ITimePeriodHighlightCell | INumberHighlightCell | IAverageHighlightCell | IFormulaHighlightCell | IIconSet;
export interface IConditionFormattingRule<C = IConditionalFormattingRuleConfig> {
    ranges: IRange [];
    cfId: string;
    stopIfTrue: boolean;
    rule: C;
}
export type IRuleModel = Map<string, Map<string, IConditionFormattingRule[]>>;
export type IRuleModelJson = Record<string, Record<string, IConditionFormattingRule[]>>;
