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

import type { LocaleKey } from '../../locale/types';
import type { FilterOperator, IFilterConditionFormParams } from '../../models/conditions';
import type { ByConditionsModel } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { borderClassName, clsx, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { useCallback } from 'react';
import { FilterConditionItems } from '../../models/conditions';

const PRIMARY_CONDITION_GROUPS = [
    [FilterConditionItems.NONE],
    [FilterConditionItems.EMPTY, FilterConditionItems.NOT_EMPTY],
    [
        FilterConditionItems.TEXT_CONTAINS,
        FilterConditionItems.DOES_NOT_CONTAIN,
        FilterConditionItems.STARTS_WITH,
        FilterConditionItems.ENDS_WITH,
        FilterConditionItems.EQUALS,
    ],
    [
        FilterConditionItems.GREATER_THAN,
        FilterConditionItems.GREATER_THAN_OR_EQUAL,
        FilterConditionItems.LESS_THAN,
        FilterConditionItems.LESS_THAN_OR_EQUAL,
        FilterConditionItems.EQUAL,
        FilterConditionItems.NOT_EQUAL,
        FilterConditionItems.BETWEEN,
        FilterConditionItems.NOT_BETWEEN,
    ],
    [FilterConditionItems.CUSTOM],
];

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

    const primaryOptions = PRIMARY_CONDITION_GROUPS.map((group) => ({
        options: group.map((conditionItem) => ({
            label: localeService.t(conditionItem.label),
            value: conditionItem.operator,
        })),
    }));
    const onPrimaryConditionChange = useCallback((value: string) => {
        model.onPrimaryConditionChange(value as FilterOperator);
    }, [model]);

    const secondaryOptions = FilterConditionItems.ALL_CONDITIONS
        .filter((conditionItem) => conditionItem.numOfParameters !== 2)
        .map((conditionItem) => ({
            label: localeService.t(conditionItem.label),
            value: conditionItem.operator,
        }));
    const onFormParamsChange = useCallback((diffParams: Partial<IFilterConditionFormParams>) => {
        model.onConditionFormChange(diffParams);
    }, [model]);

    const placeholder = localeService.t<LocaleKey>('sheets-filter-ui.panel.input-values-placeholder');
    function renderSecondaryCondition(operator: FilterOperator, val: string, name: 'operator1' | 'operator2') {
        const shouldRenderInput = FilterConditionItems.getItemByOperator(operator).numOfParameters === 1;
        return (
            <>
                {name === 'operator2' && (
                    <RadioGroup value={radioValue} onChange={onRadioChange}>
                        <Radio value="AND">{localeService.t<LocaleKey>('sheets-filter-ui.panel.and')}</Radio>
                        <Radio value="OR">{localeService.t<LocaleKey>('sheets-filter-ui.panel.or')}</Radio>
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
            className="univer-flex univer-h-full univer-min-h-[300px] univer-flex-col"
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
                                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.?')}
                                    <br />
                                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.*')}
                                </div>
                            </div>
                        )
                        : null}
                </>
            )}
        </div>
    );
}
