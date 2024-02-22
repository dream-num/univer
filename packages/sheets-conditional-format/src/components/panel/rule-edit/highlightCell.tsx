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

import React, { useEffect, useMemo, useState } from 'react';
import { Input, InputNumber, Select } from '@univerjs/design';
import { NumberOperator,
    RuleType,
    SubRuleType,
    TextOperator,
    TimePeriodOperator } from '../../../base/const';
import type {
    IHighlightCell,
    INumberHighlightCell,
    ITextHighlightCell,
    ITimePeriodHighlightCell } from '../../../models/type';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import type { IStyleEditorProps } from './type';

const createOptionItem = (text: string) => ({ label: text, value: text });
type IValue = number | string | [number, number];
type IResult = Pick<ITextHighlightCell | INumberHighlightCell | ITimePeriodHighlightCell, 'operator' | 'subType'> & { value?: IValue };

const HighlightCellInput = (props: { type: IResult['subType'];
                                     operator: IResult['operator'];
                                     interceptorManager: IStyleEditorProps['interceptorManager'];
                                     rule?: IHighlightCell;
                                     value: IValue;
                                     onChange: (value: IValue) => void; }) => {
    const { type, operator, onChange, value } = props;
    const [inputNumberValue, inputNumberValueSet] = useState(() => typeof value === 'number' ? value : 0);
    const [inputTextValue, inputTextValueSet] = useState(() => typeof value === 'string' ? value : '');
    const [inputNumberMin, inputNumberMinSet] = useState(() => Array.isArray(value) ? value[0] || 0 : 0);
    const [inputNumberMax, inputNumberMaxSet] = useState(() => Array.isArray(value) ? value[1] || 100 : 100);

    useEffect(() => {
        switch (type) {
            case SubRuleType.text:{
                if ([TextOperator.beginsWith, TextOperator.containsText,
                    TextOperator.equal, TextOperator.endWith,
                    TextOperator.notEqual].includes(operator as TextOperator)) {
                    onChange(inputTextValue);
                }
                break;
            }
            case SubRuleType.number:{
                if ([NumberOperator.equal, NumberOperator.greaterThan,
                    NumberOperator.greaterThanOrEqual,
                    NumberOperator.lessThan, NumberOperator.lessThanOrEqual,
                ].includes(operator as NumberOperator)) {
                    onChange(inputNumberValue);
                }
                if ([NumberOperator.between, NumberOperator.notBetween].includes(operator as NumberOperator)) {
                    onChange([inputNumberMin, inputNumberMax]);
                }
                break;
            }
        }
    }, [type]);

    switch (type) {
        case SubRuleType.text:{
            if ([TextOperator.beginsWith, TextOperator.containsText,
                TextOperator.equal, TextOperator.endWith,
                TextOperator.notEqual].includes(operator as TextOperator)) {
                const _onChange = (value: string) => {
                    inputTextValueSet(value);
                    onChange(value);
                };
                return <Input value={inputTextValue} onChange={_onChange} />;
            }
            break;
        }
        case SubRuleType.number:{
            if ([NumberOperator.equal, NumberOperator.greaterThan,
                NumberOperator.greaterThanOrEqual,
                NumberOperator.lessThan, NumberOperator.lessThanOrEqual,
            ].includes(operator as NumberOperator)) {
                const _onChange = (value: number | null) => {
                    inputNumberValueSet(value || 0);
                    onChange(value || 0);
                };
                return <InputNumber value={inputNumberValue} onChange={_onChange} />;
            }
            if ([NumberOperator.between, NumberOperator.notBetween].includes(operator as NumberOperator)) {
                const onChangeMin = (_value: number | null) => {
                    inputNumberMinSet(_value || 0);
                    const value: [number, number] = [_value || 0, inputNumberMax];
                    onChange(value);
                };
                const onChangeMax = (_value: number | null) => {
                    inputNumberMaxSet(_value || 0);
                    const value: [number, number] = [inputNumberMin, _value || 0];
                    onChange(value);
                };
                return (
                    <>
                        <InputNumber value={inputNumberMin} onChange={onChangeMin} />
                        <InputNumber value={inputNumberMax} onChange={onChangeMax} />
                    </>
                );
            }
        }
    }
    return null;
};
const getOperatorOptions = (type: SubRuleType.number | SubRuleType.text | SubRuleType.timePeriod) => {
    switch (type) {
        case SubRuleType.text:{
            return [
                createOptionItem(TextOperator.containsBlanks),
                createOptionItem(TextOperator.beginsWith),
                createOptionItem(TextOperator.containsText),
                createOptionItem(TextOperator.endWith),
                createOptionItem(TextOperator.equal),
                createOptionItem(TextOperator.notEqual),
                createOptionItem(TextOperator.notContainsText),
                createOptionItem(TextOperator.notContainsBlanks)];
        }
        case SubRuleType.number:{
            return [createOptionItem(NumberOperator.between),
                createOptionItem(NumberOperator.equal),
                createOptionItem(NumberOperator.greaterThan),
                createOptionItem(NumberOperator.greaterThanOrEqual),
                createOptionItem(NumberOperator.lessThan),
                createOptionItem(NumberOperator.lessThanOrEqual),
                createOptionItem(NumberOperator.notEqual),
                createOptionItem(NumberOperator.notBetween)];
        }
        case SubRuleType.timePeriod:{
            return [createOptionItem(TimePeriodOperator.last7Days),
                createOptionItem(TimePeriodOperator.lastMonth),
                createOptionItem(TimePeriodOperator.lastWeek),
                createOptionItem(TimePeriodOperator.nextMonth),
                createOptionItem(TimePeriodOperator.nextWeek),
                createOptionItem(TimePeriodOperator.thisMonth),
                createOptionItem(TimePeriodOperator.thisWeek),
                createOptionItem(TimePeriodOperator.tomorrow),
                createOptionItem(TimePeriodOperator.yesterday)];
        }
    }
};
export const HighlightCellStyleEditor = (props: IStyleEditorProps<any, ITextHighlightCell | INumberHighlightCell | ITimePeriodHighlightCell>) => {
    const { interceptorManager, onChange } = props;
    const rule = props.rule?.type === RuleType.highlightCell ? props.rule : undefined;
    const [subType, subTypeSet] = useState<SubRuleType.number | SubRuleType.text | SubRuleType.timePeriod>(() => {
        const defaultV = SubRuleType.text;
        if (!rule) {
            return defaultV;
        }
        return rule.subType || defaultV;
    });

    const typeOptions = [createOptionItem(SubRuleType.text), createOptionItem(SubRuleType.number), createOptionItem(SubRuleType.timePeriod)];
    const operatorOptions = useMemo(() => getOperatorOptions(subType), [subType]);

    const [operator, operatorSet] = useState<IResult['operator']>(() => {
        const defaultV = operatorOptions[0].value as IResult['operator'];
        if (!rule) {
            return defaultV;
        }
        return rule.operator || defaultV;
    });

    const [value, valueSet] = useState<IValue>(() => {
        const defaultV = '';
        if (!rule) {
            return defaultV;
        }
        switch (rule.subType) {
            case SubRuleType.text:{
                if ([TextOperator.beginsWith, TextOperator.containsText, TextOperator.endWith, TextOperator.equal, TextOperator.notContainsText, TextOperator.notEqual].includes(rule.operator)) {
                    return rule.value || defaultV;
                }
                break;
            }
            case SubRuleType.number:{
                if ([NumberOperator.between, NumberOperator.notBetween].includes(rule.operator)) {
                    return rule.value || [0, 0];
                }
                return rule.value || 0;
            }
        }
        return defaultV;
    });

    const [style, styleSet] = useState<IHighlightCell['style']>({});
    const getResult = useMemo(() => (option: { subType?: string;operator?: string;value?: IValue;style?: IHighlightCell['style'] }) => {
        switch (option.subType || subType) {
            case SubRuleType.text:{
                if ([TextOperator.beginsWith, TextOperator.containsText,
                    TextOperator.equal, TextOperator.endWith,
                    TextOperator.notEqual].includes(operator as TextOperator)) {
                    return {
                        type: RuleType.highlightCell,
                        subType: option.subType ?? subType,
                        operator: option.operator ?? operator,
                        style: option.style ?? style,
                        value: option.value ?? value,
                    };
                }
                break;
            }
            case SubRuleType.number:{
                if ([NumberOperator.equal, NumberOperator.greaterThan,
                    NumberOperator.greaterThanOrEqual,
                    NumberOperator.lessThan, NumberOperator.lessThanOrEqual,
                ].includes(operator as NumberOperator)) {
                    return {
                        type: RuleType.highlightCell,
                        subType: option.subType ?? subType,
                        operator: option.operator ?? operator,
                        style: option.style ?? style,
                        value: option.value ?? value,
                    };
                }
                if ([NumberOperator.between, NumberOperator.notBetween].includes(operator as NumberOperator)) {
                    return {
                        type: RuleType.highlightCell,
                        subType: option.subType ?? subType,
                        operator: option.operator ?? operator,
                        style: option.style ?? style,
                        value: option.value ?? value,
                    };
                }
                break;
            }
        }
        return {
            type: RuleType.highlightCell,
            subType: option.subType ?? subType,
            operator: option.operator ?? operator,
            style: option.style ?? style,
        };
    }, [subType, operator, value, style]);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                return getResult({});
            },
        });
        return dispose as () => void;
    }, [getResult, interceptorManager]);

    useEffect(() => {
        if (!typeOptions.some((item) => item.value === subType)) {
            subTypeSet(typeOptions[0].value as SubRuleType.text);
        }
    }, [typeOptions]);

    const onTypeChange = (v: string) => {
        const _subType = v as typeof subType;
        const _operator = getOperatorOptions(_subType)[0].value as typeof operator;
        subTypeSet(_subType);
        operatorSet(_operator);
        onChange(getResult({ subType: _subType, operator: _operator }));
    };
    const onOperatorChange = (v: string) => {
        const _operator = v as typeof operator;
        operatorSet(_operator);
        onChange(getResult({ operator: _operator }));
    };

    const onInputChange = (value: number | string | [number, number]) => {
        valueSet(value);
        onChange(getResult({ value }));
    };
    const inputRenderKey = useMemo(() => {
        return `${subType}_${operator}_${Math.random()}`;
    }, [subType, operator]);

    return (
        <div>
            <div>符合以下条件时</div>
            <Select onChange={onTypeChange} value={subType} options={typeOptions} />
            <Select onChange={onOperatorChange} value={operator} options={operatorOptions} />
            <HighlightCellInput key={inputRenderKey} value={value} interceptorManager={interceptorManager} type={subType} operator={operator} rule={rule} onChange={onInputChange} />
            <ConditionalStyleEditor
                style={rule?.style}
                onChange={(v) => {
                    styleSet(v);
                    onChange(getResult({ style: v }));
                }}
            />
        </div>
    );
};
