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

import type {
    IConditionalFormattingRuleConfig,
    IHighlightCell,
    INumberHighlightCell,
    ITextHighlightCell,
    ITimePeriodHighlightCell,
} from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';
import { LocaleService } from '@univerjs/core';
import { Input, InputNumber, Select } from '@univerjs/design';
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    CFTimePeriodOperator,
    createDefaultValue,
} from '@univerjs/sheets-conditional-formatting';
import { useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useState } from 'react';
import { ConditionalStyleEditor } from '../../conditional-style-editor';
import { Preview } from '../../preview';
import { WrapperError } from '../../wrapper-error/WrapperError';
import { previewClassName } from './styles';

const createOptionItem = (text: string, localeService: LocaleService) => ({ label: localeService.t(`sheet.cf.operator.${text}`), value: text });
type IValue = number | string | [number, number];
type IResult = (Pick<ITextHighlightCell | INumberHighlightCell | ITimePeriodHighlightCell, 'operator' | 'subType'>) & { value?: IValue };

const HighlightCellInput = (props: {
    type: IResult['subType'] | CFSubRuleType.duplicateValues | CFSubRuleType.uniqueValues;
    operator?: IResult['operator'];
    interceptorManager: IStyleEditorProps['interceptorManager'];
    rule?: IHighlightCell;
    value: IValue;
    onChange: (value: IValue) => void;
}) => {
    const { type, operator, onChange, value, interceptorManager } = props;

    const localeService = useDependency(LocaleService);
    const [inputNumberValue, setInputNumberValue] = useState(() => typeof value === 'number' ? value : 0);
    const [numberError, setNumberError] = useState('');

    const [inputTextValue, setInputTextValue] = useState(() => typeof value === 'string' ? value : '');
    const [textError, setTextError] = useState('');
    const [inputNumberMin, setInputNumberMin] = useState(() => Array.isArray(value) ? value[0] === undefined ? 0 : value[0] : 0);
    const [numberMinError, setNumberMinError] = useState('');

    const [inputNumberMax, setInputNumberMax] = useState(() => Array.isArray(value) ? value[1] === undefined ? 100 : value[1] : 100);
    const [numberMaxError, setNumberMaxError] = useState('');

    useEffect(() => {
        switch (type) {
            case CFSubRuleType.text: {
                if ([CFTextOperator.beginsWith, CFTextOperator.endsWith, CFTextOperator.containsText, CFTextOperator.notContainsText, CFTextOperator.equal, CFTextOperator.notEqual].includes(operator as CFTextOperator)) {
                    onChange(inputTextValue);
                }
                break;
            }
            case CFSubRuleType.number: {
                if ([CFNumberOperator.equal, CFNumberOperator.notEqual, CFNumberOperator.greaterThan, CFNumberOperator.greaterThanOrEqual, CFNumberOperator.lessThan, CFNumberOperator.lessThanOrEqual].includes(operator as CFNumberOperator)) {
                    onChange(inputNumberValue);
                }
                if ([CFNumberOperator.between, CFNumberOperator.notBetween].includes(operator as CFNumberOperator)) {
                    onChange([inputNumberMin, inputNumberMax]);
                }
                break;
            }
        }
    }, [type]);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
            handler: (v, _c, next) => {
                switch (type) {
                    case CFSubRuleType.text: {
                        if ([CFTextOperator.beginsWith, CFTextOperator.containsText, CFTextOperator.endsWith, CFTextOperator.notEqual, CFTextOperator.notContainsText, CFTextOperator.equal].includes(operator as any)) {
                            if (!inputTextValue) {
                                setTextError(localeService.t('sheet.cf.errorMessage.notBlank'));
                                return false;
                            }
                            return next(v);
                        }
                    }
                }
                return next(v);
            },
        });
        return () => {
            dispose();
        };
    }, [type, inputNumberValue, inputTextValue, operator]);

    switch (type) {
        case CFSubRuleType.text: {
            if ([CFTextOperator.beginsWith, CFTextOperator.endsWith, CFTextOperator.containsText, CFTextOperator.notContainsText, CFTextOperator.equal, CFTextOperator.notEqual].includes(operator as CFTextOperator)) {
                const _onChange = (value: string) => {
                    setInputTextValue(value);
                    onChange(value);
                };
                return (
                    <div className="univer-mt-3">
                        <WrapperError errorText={textError}>
                            <Input
                                value={inputTextValue}
                                onChange={(v) => {
                                    setTextError('');
                                    _onChange(v);
                                }}
                            />
                        </WrapperError>
                    </div>
                );
            }
            break;
        }
        case CFSubRuleType.number: {
            if ([CFNumberOperator.equal, CFNumberOperator.notEqual, CFNumberOperator.greaterThan, CFNumberOperator.greaterThanOrEqual, CFNumberOperator.lessThan, CFNumberOperator.lessThanOrEqual].includes(operator as CFNumberOperator)) {
                const _onChange = (value: number | null) => {
                    setInputNumberValue(value || 0);
                    onChange(value || 0);
                    setNumberError('');
                };
                return (
                    <div className="univer-mt-3">
                        <WrapperError errorText={numberError}>
                            <InputNumber
                                className="univer-w-full"
                                min={Number.MIN_SAFE_INTEGER}
                                max={Number.MAX_SAFE_INTEGER}
                                value={inputNumberValue}
                                onChange={_onChange}
                            />
                        </WrapperError>
                    </div>
                );
            }
            if ([CFNumberOperator.between, CFNumberOperator.notBetween].includes(operator as CFNumberOperator)) {
                const onChangeMin = (_value: number | null) => {
                    setInputNumberMin(_value || 0);
                    const value: [number, number] = [_value || 0, inputNumberMax];
                    onChange(value);
                    setNumberMinError('');
                };
                const onChangeMax = (_value: number | null) => {
                    setInputNumberMax(_value || 0);
                    const value: [number, number] = [inputNumberMin, _value || 0];
                    onChange(value);
                    setNumberMaxError('');
                };
                return (
                    <div className="univer-mt-3 univer-flex univer-items-center">
                        <WrapperError errorText={numberMinError}>
                            <InputNumber min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} value={inputNumberMin} onChange={onChangeMin} />
                        </WrapperError>
                        <WrapperError errorText={numberMaxError}>
                            <InputNumber
                                className="univer-ml-3"
                                min={Number.MIN_SAFE_INTEGER}
                                max={Number.MAX_SAFE_INTEGER}
                                value={inputNumberMax}
                                onChange={onChangeMax}
                            />
                        </WrapperError>

                    </div>
                );
            }
        }
    }
    return null;
};
const getOperatorOptions = (type: CFSubRuleType.duplicateValues | CFSubRuleType.uniqueValues | CFSubRuleType.number | CFSubRuleType.text | CFSubRuleType.timePeriod | CFSubRuleType.formula, localeService: LocaleService) => {
    switch (type) {
        case CFSubRuleType.text: {
            return [
                createOptionItem(CFTextOperator.containsText, localeService),
                createOptionItem(CFTextOperator.notContainsText, localeService),
                createOptionItem(CFTextOperator.beginsWith, localeService),
                createOptionItem(CFTextOperator.endsWith, localeService),
                createOptionItem(CFTextOperator.equal, localeService),
                createOptionItem(CFTextOperator.notEqual, localeService),
                createOptionItem(CFTextOperator.containsBlanks, localeService),
                createOptionItem(CFTextOperator.notContainsBlanks, localeService),
                createOptionItem(CFTextOperator.containsErrors, localeService),
                createOptionItem(CFTextOperator.notContainsErrors, localeService),
            ];
        }
        case CFSubRuleType.number: {
            return [
                createOptionItem(CFNumberOperator.between, localeService),
                createOptionItem(CFNumberOperator.notBetween, localeService),
                createOptionItem(CFNumberOperator.equal, localeService),
                createOptionItem(CFNumberOperator.notEqual, localeService),
                createOptionItem(CFNumberOperator.greaterThan, localeService),
                createOptionItem(CFNumberOperator.greaterThanOrEqual, localeService),
                createOptionItem(CFNumberOperator.lessThan, localeService),
                createOptionItem(CFNumberOperator.lessThanOrEqual, localeService),
            ];
        }
        case CFSubRuleType.timePeriod: {
            return [
                createOptionItem(CFTimePeriodOperator.yesterday, localeService),
                createOptionItem(CFTimePeriodOperator.today, localeService),
                createOptionItem(CFTimePeriodOperator.tomorrow, localeService),
                createOptionItem(CFTimePeriodOperator.last7Days, localeService),
                createOptionItem(CFTimePeriodOperator.lastWeek, localeService),
                createOptionItem(CFTimePeriodOperator.thisWeek, localeService),
                createOptionItem(CFTimePeriodOperator.nextWeek, localeService),
                createOptionItem(CFTimePeriodOperator.lastMonth, localeService),
                createOptionItem(CFTimePeriodOperator.thisMonth, localeService),
                createOptionItem(CFTimePeriodOperator.nextMonth, localeService),
            ];
        }
    }
};
export const HighlightCellStyleEditor = (props: IStyleEditorProps<any, ITextHighlightCell | INumberHighlightCell | ITimePeriodHighlightCell>) => {
    const { interceptorManager, onChange } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined;
    const [subType, subTypeSet] = useState<CFSubRuleType.number | CFSubRuleType.text | CFSubRuleType.timePeriod | CFSubRuleType.duplicateValues | CFSubRuleType.uniqueValues>(() => {
        const defaultV = CFSubRuleType.text;
        if (!rule) {
            return defaultV;
        }
        return rule.subType || defaultV;
    });

    const typeOptions = [{
        value: CFSubRuleType.text,
        label: localeService.t('sheet.cf.subRuleType.text'),
    }, {
        value: CFSubRuleType.number,
        label: localeService.t('sheet.cf.subRuleType.number'),
    }, {
        value: CFSubRuleType.timePeriod,
        label: localeService.t('sheet.cf.subRuleType.timePeriod'),
    }, {
        value: CFSubRuleType.duplicateValues,
        label: localeService.t('sheet.cf.subRuleType.duplicateValues'),
    }, {
        value: CFSubRuleType.uniqueValues,
        label: localeService.t('sheet.cf.subRuleType.uniqueValues'),
    }];

    const operatorOptions = useMemo(() => getOperatorOptions(subType, localeService), [subType]);

    const [operator, operatorSet] = useState<IResult['operator'] | undefined>(() => {
        const defaultV = operatorOptions ? operatorOptions[0].value as IResult['operator'] : undefined;
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
        const v = (rule as ITextHighlightCell | INumberHighlightCell).value ?? createDefaultValue(rule.subType, rule.operator);
        return v;
    });

    const [style, setStyle] = useState<IHighlightCell['style']>({});

    const getResult = useMemo(() => (option: { subType?: string; operator?: string; value?: IValue; style?: IHighlightCell['style'] }) => {
        switch (option.subType || subType) {
            case CFSubRuleType.text: {
                if ([CFTextOperator.beginsWith, CFTextOperator.endsWith, CFTextOperator.containsText, CFTextOperator.notContainsText, CFTextOperator.equal, CFTextOperator.notEqual].includes(operator as CFTextOperator)) {
                    return {
                        type: CFRuleType.highlightCell,
                        subType: option.subType ?? subType,
                        operator: option.operator ?? operator,
                        style: option.style ?? style,
                        value: option.value ?? value,
                    };
                }
                break;
            }
            case CFSubRuleType.number: {
                if ([CFNumberOperator.equal, CFNumberOperator.notEqual, CFNumberOperator.greaterThan, CFNumberOperator.greaterThanOrEqual, CFNumberOperator.lessThan, CFNumberOperator.lessThanOrEqual].includes(operator as CFNumberOperator)) {
                    return {
                        type: CFRuleType.highlightCell,
                        subType: option.subType ?? subType,
                        operator: option.operator ?? operator,
                        style: option.style ?? style,
                        value: option.value ?? value,
                    };
                }
                if ([CFNumberOperator.between, CFNumberOperator.notBetween].includes(operator as CFNumberOperator)) {
                    return {
                        type: CFRuleType.highlightCell,
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
            type: CFRuleType.highlightCell,
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
            subTypeSet(typeOptions[0].value as CFSubRuleType.text);
        }
    }, [typeOptions]);

    const onTypeChange = (v: string) => {
        const _subType = v as typeof subType;
        const operatorList = getOperatorOptions(_subType, localeService);
        const _operator = operatorList && operatorList[0].value as typeof operator;
        subTypeSet(_subType);
        operatorSet(_operator);
        _operator && valueSet(createDefaultValue(_subType, _operator));
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
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <div className="univer-flex univer-justify-between univer-gap-4">
                <Select
                    className="univer-mt-3 univer-w-full"
                    onChange={onTypeChange}
                    value={subType}
                    options={typeOptions}
                />
                {operatorOptions?.length && (
                    <Select
                        className="univer-mt-3 univer-w-full"
                        onChange={onOperatorChange}
                        value={operator || ''}
                        options={operatorOptions}
                    />
                )}
            </div>
            <HighlightCellInput
                key={inputRenderKey}
                value={value}
                interceptorManager={interceptorManager}
                type={subType}
                operator={operator}
                rule={rule}
                onChange={onInputChange}
            />
            <div className={previewClassName}>
                <Preview rule={getResult({}) as IConditionalFormattingRuleConfig} />
            </div>
            <ConditionalStyleEditor
                style={rule?.style}
                className="univer-ml-1"
                onChange={(v) => {
                    setStyle(v);
                    onChange(getResult({ style: v }));
                }}
            />
        </div>
    );
};
