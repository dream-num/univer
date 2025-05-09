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

import type { ISelectProps } from '@univerjs/design';
import type { FilterOperator, IFilterConditionFormParams } from '../../models/conditions';
import type { ByConditionsModel } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { borderClassName, clsx, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';

import React, { useCallback, useMemo } from 'react';
import { FilterConditionItems } from '../../models/conditions';

/**
 * Filter by conditions.
 */
export function FilterByCondition(props: { model: ByConditionsModel }) {
    const { model } = props;

    const localeService = useDependency(LocaleService);

    // form state is from the model
    const condition = useObservable(model.conditionItem$, undefined);
    const formParams = useObservable(model.filterConditionFormParams$, undefined);

    const radioValue = formParams?.and ? 'AND' : 'OR';
    const onRadioChange = useCallback((key: string | number | boolean) => {
        model.onConditionFormChange({ and: key === 'AND' });
    }, [model]);

    const primaryOptions = usePrimaryOptions(localeService);
    const onPrimaryConditionChange = useCallback((value: string) => {
        model.onPrimaryConditionChange(value as FilterOperator);
    }, [model]);

    const secondaryOptions = useSecondaryOptions(localeService);
    const onFormParamsChange = useCallback((diffParams: Partial<IFilterConditionFormParams>) => {
        model.onConditionFormChange(diffParams);
    }, [model]);

    const placeholder = localeService.t('sheets-filter.panel.input-values-placeholder');
    function renderSecondaryCondition(operator: FilterOperator, val: string, name: 'operator1' | 'operator2') {
        const shouldRenderInput = FilterConditionItems.getItemByOperator(operator).numOfParameters === 1;
        return (
            <>
                {name === 'operator2' && (
                    <RadioGroup value={radioValue} onChange={onRadioChange}>
                        <Radio value="AND">{localeService.t('sheets-filter.panel.and')}</Radio>
                        <Radio value="OR">{localeService.t('sheets-filter.panel.or')}</Radio>
                    </RadioGroup>
                )}
                <Select
                    value={operator}
                    options={secondaryOptions}
                    onChange={(operator) => onFormParamsChange({ [name]: operator as FilterOperator })}
                />
                {shouldRenderInput && (
                    <div>
                        <Input
                            className="univer-mt-2"
                            value={val}
                            placeholder={placeholder}
                            onChange={(value) => onFormParamsChange({ [name === 'operator1' ? 'val1' : 'val2']: value })}
                        />
                    </div>
                )}
            </>
        );
    }

    return (
        <div
            data-u-comp="sheets-filter-panel-conditions-container"
            className="univer-flex univer-h-full univer-flex-col"
        >
            {/* primary condition */}
            {(condition && formParams) && (
                <>
                    <Select value={condition.operator} options={primaryOptions} onChange={onPrimaryConditionChange} />
                    {FilterConditionItems.getItemByOperator(condition.operator).numOfParameters !== 0
                        ? (
                            <div
                                data-u-comp="sheets-filter-panel-conditions-container-inner"
                                className={clsx(`
                                  univer-mt-2 univer-flex-grow univer-overflow-hidden univer-rounded-md univer-p-2
                                `, borderClassName)}
                            >
                                {condition.numOfParameters >= 1 && renderSecondaryCondition(formParams.operator1!, formParams.val1 ?? '', 'operator1')}
                                {condition.numOfParameters >= 2 && renderSecondaryCondition(formParams.operator2!, formParams.val2 ?? '', 'operator2')}
                                <div
                                    data-u-comp="sheets-filter-panel-conditions-desc"
                                    className="univer-mt-2 univer-text-xs univer-text-gray-500"
                                >
                                    {localeService.t('sheets-filter.panel.?')}
                                    <br />
                                    {localeService.t('sheets-filter.panel.*')}
                                </div>
                            </div>
                        )
                        : null}
                </>
            )}
        </div>
    );
}

function usePrimaryOptions(localeService: LocaleService): ISelectProps['options'] {
    const locale = localeService.getCurrentLocale();

    return useMemo(() => [
        {
            options: [
                { label: localeService.t(FilterConditionItems.NONE.label), value: FilterConditionItems.NONE.operator },
            ],
        },
        {
            options: [
                { label: localeService.t(FilterConditionItems.EMPTY.label), value: FilterConditionItems.EMPTY.operator },
                { label: localeService.t(FilterConditionItems.NOT_EMPTY.label), value: FilterConditionItems.NOT_EMPTY.operator },
            ],
        },
        {
            options: [
                { label: localeService.t(FilterConditionItems.TEXT_CONTAINS.label), value: FilterConditionItems.TEXT_CONTAINS.operator },
                { label: localeService.t(FilterConditionItems.DOES_NOT_CONTAIN.label), value: FilterConditionItems.DOES_NOT_CONTAIN.operator },
                { label: localeService.t(FilterConditionItems.STARTS_WITH.label), value: FilterConditionItems.STARTS_WITH.operator },
                { label: localeService.t(FilterConditionItems.ENDS_WITH.label), value: FilterConditionItems.ENDS_WITH.operator },
                { label: localeService.t(FilterConditionItems.EQUALS.label), value: FilterConditionItems.EQUALS.operator },
            ],
        },
        {
            options: [
                { label: localeService.t(FilterConditionItems.GREATER_THAN.label), value: FilterConditionItems.GREATER_THAN.operator },
                { label: localeService.t(FilterConditionItems.GREATER_THAN_OR_EQUAL.label), value: FilterConditionItems.GREATER_THAN_OR_EQUAL.operator },
                { label: localeService.t(FilterConditionItems.LESS_THAN.label), value: FilterConditionItems.LESS_THAN.operator },
                { label: localeService.t(FilterConditionItems.LESS_THAN_OR_EQUAL.label), value: FilterConditionItems.LESS_THAN_OR_EQUAL.operator },
                { label: localeService.t(FilterConditionItems.EQUAL.label), value: FilterConditionItems.EQUAL.operator },
                { label: localeService.t(FilterConditionItems.NOT_EQUAL.label), value: FilterConditionItems.NOT_EQUAL.operator },
                { label: localeService.t(FilterConditionItems.BETWEEN.label), value: FilterConditionItems.BETWEEN.operator },
                { label: localeService.t(FilterConditionItems.NOT_BETWEEN.label), value: FilterConditionItems.NOT_BETWEEN.operator },
            ],
        },
        {
            options: [
                { label: localeService.t(FilterConditionItems.CUSTOM.label), value: FilterConditionItems.CUSTOM.operator },
            ],
        },
    ] as ISelectProps['options'], [locale, localeService]);
}

function useSecondaryOptions(localeService: LocaleService): ISelectProps['options'] {
    const locale = localeService.getCurrentLocale();

    return useMemo(() => FilterConditionItems.ALL_CONDITIONS
        .filter((c) => c.numOfParameters !== 2)
        .map((c) => ({ label: localeService.t(c.label), value: c.operator })) as ISelectProps['options'], [locale, localeService]);
}
