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

import { LocaleService } from '@univerjs/core';
import type { ISelectProps } from '@univerjs/design';
import { FormDualColumnLayout, FormLayout, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { useObservable } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { Fragment, useCallback, useMemo } from 'react';

import type { ByConditionsModel } from '../../services/sheets-filter-panel.service';

import type { FilterOperator, IFilterConditionFormParams } from '../../models/conditions';
import { FilterConditionItems } from '../../models/conditions';

/**
 * Filter by conditions.
 */
export function FilterByCondition(props: { model: ByConditionsModel }) {
    const { model } = props;

    const localeService = useDependency(LocaleService);

    // form state is from the model
    const condition = useObservable(model.conditionItem$, undefined, true);
    const formParams = useObservable(model.filterConditionFormParams$, undefined, true);
    const { operator, numOfParameters } = condition;
    const { operator1, operator2, val1, val2, and } = formParams;

    const radioValue = and ? 'AND' : 'OR';
    const onRadioChange = useCallback((key: string | number | boolean) => {
        model.onConditionFormChange({ and: key === 'AND' });
    }, [model]);

    const primaryOptions = usePrimaryOptions(localeService);
    const onPrimaryConditionChange = useCallback((value: string) => {
        model.onPrimaryConditionChange(value as FilterOperator);
    }, [model]);

    const secondaryOptions = useSecondaryOptions(localeService);
    const firstSecondaryItem = useMemo(() => operator1 ? FilterConditionItems.getItemByOperator(operator1) : null, [operator1]);
    const secondSecondaryItem = useMemo(() => operator2 ? FilterConditionItems.getItemByOperator(operator2) : null, [operator2]);
    const onFormParamsChange = useCallback((diffParams: Partial<IFilterConditionFormParams>) => {
        model.onConditionFormChange(diffParams);
    }, [model]);

    return (
        <div>
            <FormLayout>
                {/* primary condition */}
                <Select value={operator} options={primaryOptions} onChange={onPrimaryConditionChange} />
            </FormLayout>

            { numOfParameters >= 1 ?
                firstSecondaryItem?.numOfParameters === 0
                    ? (
                        <FormLayout>
                            <Select
                                value={operator1!}
                                options={secondaryOptions}
                                onChange={(operator) => onFormParamsChange({ operator1: operator as FilterOperator })}
                            />
                        </FormLayout>
                    )
                    : (
                        <FormDualColumnLayout>
                            {/* first secondary condition */}
                            <Fragment>
                                <FormLayout>
                                    <Select
                                        value={operator1!}
                                        options={secondaryOptions}
                                        onChange={(operator) => onFormParamsChange({ operator1: operator as FilterOperator })}
                                    />
                                </FormLayout>
                                <FormLayout>
                                    <Input value={val1} onChange={(value) => onFormParamsChange({ val1: value })} />
                                </FormLayout>
                            </Fragment>
                        </FormDualColumnLayout>
                    ) : null}

            { numOfParameters >= 2 ? (
                <Fragment>
                    <FormLayout>
                        <RadioGroup value={radioValue} onChange={onRadioChange}>
                            <Radio value="AND">AND</Radio>
                            <Radio value="OR">OR</Radio>
                        </RadioGroup>
                    </FormLayout>
                    <FormDualColumnLayout>
                        {/* second secondary condition */}
                        <Fragment>
                            <FormLayout>
                                <Select
                                    value={operator2!}
                                    options={secondaryOptions}
                                    onChange={(operator) => onFormParamsChange({ operator2: operator as FilterOperator })}
                                />
                            </FormLayout>
                            <FormLayout>
                                <Input value={val2} onChange={(value) => onFormParamsChange({ val2: value })} />
                            </FormLayout>
                        </Fragment>
                    </FormDualColumnLayout>
                </Fragment>
            ) : null }
        </div>
    );
}

function usePrimaryOptions(localeService: LocaleService): ISelectProps['options'] {
    const locale = localeService.getCurrentLocale();

    return useMemo(() => [
        { options: [
            { label: localeService.t(FilterConditionItems.NONE.label), value: FilterConditionItems.NONE.operator },
        ] },
        { options: [
            { label: localeService.t(FilterConditionItems.EMPTY.label), value: FilterConditionItems.EMPTY.operator },
            { label: localeService.t(FilterConditionItems.NOT_EMPTY.label), value: FilterConditionItems.NOT_EMPTY.operator },
        ] },
        { options: [
            { label: localeService.t(FilterConditionItems.TEXT_CONTAINS.label), value: FilterConditionItems.TEXT_CONTAINS.operator },
            { label: localeService.t(FilterConditionItems.DOES_NOT_CONTAIN.label), value: FilterConditionItems.DOES_NOT_CONTAIN.operator },
            { label: localeService.t(FilterConditionItems.STARTS_WITH.label), value: FilterConditionItems.STARTS_WITH.operator },
            { label: localeService.t(FilterConditionItems.ENDS_WITH.label), value: FilterConditionItems.ENDS_WITH.operator },
            { label: localeService.t(FilterConditionItems.EQUALS.label), value: FilterConditionItems.EQUALS.operator },
        ] },
        { options: [
            { label: localeService.t(FilterConditionItems.GREATER_THAN.label), value: FilterConditionItems.GREATER_THAN.operator },
            { label: localeService.t(FilterConditionItems.GREATER_THAN_OR_EQUAL.label), value: FilterConditionItems.GREATER_THAN_OR_EQUAL.operator },
            { label: localeService.t(FilterConditionItems.LESS_THAN.label), value: FilterConditionItems.LESS_THAN.operator },
            { label: localeService.t(FilterConditionItems.LESS_THAN_OR_EQUAL.label), value: FilterConditionItems.LESS_THAN_OR_EQUAL.operator },
            { label: localeService.t(FilterConditionItems.EQUAL.label), value: FilterConditionItems.EQUAL.operator },
            { label: localeService.t(FilterConditionItems.NOT_EQUAL.label), value: FilterConditionItems.NOT_EQUAL.operator },
            { label: localeService.t(FilterConditionItems.BETWEEN.label), value: FilterConditionItems.BETWEEN.operator },
            { label: localeService.t(FilterConditionItems.NOT_BETWEEN.label), value: FilterConditionItems.NOT_BETWEEN.operator },
        ] },
        { options: [
            { label: localeService.t(FilterConditionItems.CUSTOM.label), value: FilterConditionItems.CUSTOM.operator },
        ] },
    ] as ISelectProps['options'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, localeService]);
}

function useSecondaryOptions(localeService: LocaleService): ISelectProps['options'] {
    const locale = localeService.getCurrentLocale();

    return useMemo(() => FilterConditionItems.ALL_CONDITIONS
        .filter((c) => c.numOfParameters !== 2)
        .map((c) => ({ label: localeService.t(c.label), value: c.operator })) as ISelectProps['options'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, localeService]);
}
