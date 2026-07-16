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
    IDuplicateValuesHighlightCell,
    IHighlightCell,
    INumberHighlightCell,
    ITextHighlightCell,
    ITimePeriodHighlightCell,
    IUniqueValuesHighlightCell,
} from '@univerjs/sheets-conditional-formatting';
import type { LocaleKey } from '../../../locale/types';
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
import { ConditionalStyleEditor } from '../../ConditionalStyleEditor';
import { Preview } from '../../Preview';
import { WrapperError } from '../../wrapper-error/WrapperError';
import { previewClassName } from './styles';

type IEditableHighlightCell = ITextHighlightCell | INumberHighlightCell | ITimePeriodHighlightCell | IDuplicateValuesHighlightCell | IUniqueValuesHighlightCell;
type IEditableSubType = IEditableHighlightCell['subType'];
type IEditableOperator = ITextHighlightCell['operator'] | INumberHighlightCell['operator'] | ITimePeriodHighlightCell['operator'];

const textOperators = new Set<string>(Object.values(CFTextOperator));
const numberOperators = new Set<string>(Object.values(CFNumberOperator));
const timePeriodOperators = new Set<string>(Object.values(CFTimePeriodOperator));

const isTextOperator = (value: unknown): value is CFTextOperator => typeof value === 'string' && textOperators.has(value);
const isNumberOperator = (value: unknown): value is CFNumberOperator => typeof value === 'string' && numberOperators.has(value);
const isTimePeriodOperator = (value: unknown): value is CFTimePeriodOperator => typeof value === 'string' && timePeriodOperators.has(value);

const createOptionItem = <T extends IEditableOperator>(text: T): { label: LocaleKey; value: T } => ({
    label: `sheets-conditional-formatting-ui.operator.${text}`,
    value: text,
});
type IValue = number | string | [number, number];

function HighlightCellInput(props: {
    type: IEditableSubType;
    operator?: IEditableOperator;
    interceptorManager: IStyleEditorProps['interceptorManager'];
    rule?: IHighlightCell;
    value: IValue;
    onChange: (value: IValue) => void;
}) {
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
                                setTextError(localeService.t<LocaleKey>('sheets-conditional-formatting-ui.errorMessage.notBlank'));
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
const getOperatorOptions = (type: IEditableSubType) => {
    switch (type) {
        case CFSubRuleType.text: {
            return [
                createOptionItem(CFTextOperator.containsText),
                createOptionItem(CFTextOperator.notContainsText),
                createOptionItem(CFTextOperator.beginsWith),
                createOptionItem(CFTextOperator.endsWith),
                createOptionItem(CFTextOperator.equal),
                createOptionItem(CFTextOperator.notEqual),
                createOptionItem(CFTextOperator.containsBlanks),
                createOptionItem(CFTextOperator.notContainsBlanks),
                createOptionItem(CFTextOperator.containsErrors),
                createOptionItem(CFTextOperator.notContainsErrors),
            ];
        }
        case CFSubRuleType.number: {
            return [
                createOptionItem(CFNumberOperator.between),
                createOptionItem(CFNumberOperator.notBetween),
                createOptionItem(CFNumberOperator.equal),
                createOptionItem(CFNumberOperator.notEqual),
                createOptionItem(CFNumberOperator.greaterThan),
                createOptionItem(CFNumberOperator.greaterThanOrEqual),
                createOptionItem(CFNumberOperator.lessThan),
                createOptionItem(CFNumberOperator.lessThanOrEqual),
            ];
        }
        case CFSubRuleType.timePeriod: {
            return [
                createOptionItem(CFTimePeriodOperator.yesterday),
                createOptionItem(CFTimePeriodOperator.today),
                createOptionItem(CFTimePeriodOperator.tomorrow),
                createOptionItem(CFTimePeriodOperator.last7Days),
                createOptionItem(CFTimePeriodOperator.lastWeek),
                createOptionItem(CFTimePeriodOperator.thisWeek),
                createOptionItem(CFTimePeriodOperator.nextWeek),
                createOptionItem(CFTimePeriodOperator.lastMonth),
                createOptionItem(CFTimePeriodOperator.thisMonth),
                createOptionItem(CFTimePeriodOperator.nextMonth),
            ];
        }
        default:
            return [];
    }
};
export const HighlightCellStyleEditor = (props: IStyleEditorProps<any, IEditableHighlightCell>) => {
    const { interceptorManager, onChange } = props;
    const localeService = useDependency(LocaleService);

    const rule = props.rule?.type === CFRuleType.highlightCell ? props.rule : undefined;
    const [subType, setSubType] = useState<IEditableSubType>(() => {
        const defaultV = CFSubRuleType.text;
        if (!rule) {
            return defaultV;
        }
        return rule.subType || defaultV;
    });

    const typeOptions: Array<{ value: IEditableSubType; label: string }> = [{
        value: CFSubRuleType.text,
        label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.text'),
    }, {
        value: CFSubRuleType.number,
        label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.number'),
    }, {
        value: CFSubRuleType.timePeriod,
        label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.timePeriod'),
    }, {
        value: CFSubRuleType.duplicateValues,
        label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.duplicateValues'),
    }, {
        value: CFSubRuleType.uniqueValues,
        label: localeService.t<LocaleKey>('sheets-conditional-formatting-ui.subRuleType.uniqueValues'),
    }];

    const operatorOptions = useMemo(() => getOperatorOptions(subType).map((option) => ({ ...option, label: localeService.t(option.label) })), [localeService, subType]);

    const [operator, setOperator] = useState<IEditableOperator | undefined>(() => {
        const defaultV = operatorOptions[0]?.value;
        if (!rule) {
            return defaultV;
        }
        return 'operator' in rule ? rule.operator : defaultV;
    });

    const [value, setValue] = useState<IValue>(() => {
        const defaultV = '';
        if (!rule) {
            return defaultV;
        }
        if ('value' in rule && rule.value !== undefined) {
            return rule.value;
        }
        return 'operator' in rule ? createDefaultValue(rule.subType, rule.operator) : defaultV;
    });

    const [style, setStyle] = useState<IHighlightCell['style']>({});

    const getResult = useMemo(() => (option: { subType?: IEditableSubType; operator?: IEditableOperator; value?: IValue; style?: IHighlightCell['style'] }): IEditableHighlightCell => {
        const nextSubType = option.subType ?? subType;
        const nextOperator = option.operator ?? operator;
        const nextValue = option.value ?? value;
        const nextStyle = option.style ?? style;

        switch (nextSubType) {
            case CFSubRuleType.duplicateValues: {
                return {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.duplicateValues,
                    style: nextStyle,
                };
            }
            case CFSubRuleType.uniqueValues:
                return {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.uniqueValues,
                    style: nextStyle,
                };
            case CFSubRuleType.text: {
                return {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.text,
                    operator: isTextOperator(nextOperator) ? nextOperator : CFTextOperator.containsText,
                    style: nextStyle,
                    value: typeof nextValue === 'string' ? nextValue : undefined,
                };
            }
            case CFSubRuleType.timePeriod: {
                return {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.timePeriod,
                    operator: isTimePeriodOperator(nextOperator) ? nextOperator : CFTimePeriodOperator.today,
                    style: nextStyle,
                };
            }
            case CFSubRuleType.number: {
                const numberOperator = isNumberOperator(nextOperator) ? nextOperator : CFNumberOperator.equal;
                if (numberOperator === CFNumberOperator.between || numberOperator === CFNumberOperator.notBetween) {
                    const range: [number, number] = Array.isArray(nextValue) ? nextValue : [0, 100];
                    return {
                        type: CFRuleType.highlightCell,
                        subType: CFSubRuleType.number,
                        operator: numberOperator,
                        style: nextStyle,
                        value: range,
                    };
                }
                return {
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: numberOperator,
                    style: nextStyle,
                    value: typeof nextValue === 'number' ? nextValue : undefined,
                };
            }
        }
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
            setSubType(typeOptions[0].value as CFSubRuleType.text);
        }
    }, [typeOptions]);

    const onTypeChange = (v: string) => {
        const _subType = typeOptions.find((item) => item.value === v)?.value;
        if (!_subType) {
            return;
        }
        const operatorList = getOperatorOptions(_subType).map((option) => ({ ...option, label: localeService.t(option.label) }));
        const _operator = operatorList[0]?.value;
        setSubType(_subType);
        setOperator(_operator);
        _operator && setValue(createDefaultValue(_subType, _operator));
        onChange(getResult({ subType: _subType, operator: _operator }));
    };

    const onOperatorChange = (v: string) => {
        const _operator = operatorOptions.find((item) => item.value === v)?.value;
        if (!_operator) {
            return;
        }
        setOperator(_operator);
        onChange(getResult({ operator: _operator }));
    };

    const onInputChange = (value: number | string | [number, number]) => {
        setValue(value);
        onChange(getResult({ value }));
    };

    return (
        <div>
            <div
                className={`
                  univer-mt-4 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-conditional-formatting-ui.panel.styleRule')}
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
                key={`${subType}_${operator}`}
                value={value}
                interceptorManager={interceptorManager}
                type={subType}
                operator={operator}
                rule={rule}
                onChange={onInputChange}
            />
            <div className={previewClassName}>
                <Preview rule={getResult({})} />
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
