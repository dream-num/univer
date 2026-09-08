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
import type { FilterOperator } from '../../models/conditions';
import type { ByConditionsModel } from '../../services/sheets-filter-panel.service';
import { LocaleService } from '@univerjs/core';
import { Input, MobileSelect, Radio, RadioGroup } from '@univerjs/design';
import { useDependency, useObservable } from '@univerjs/ui';
import { FilterConditionItems } from '../../models/conditions';

export function MobileFilterByCondition(props: { model: ByConditionsModel }) {
    const { model } = props;
    const localeService = useDependency(LocaleService);
    const condition = useObservable(model.conditionItem$, undefined, true);
    const formParams = useObservable(model.filterConditionFormParams$, undefined, true);
    const secondaryOptions = FilterConditionItems.ALL_CONDITIONS
        .filter((item) => item.numOfParameters !== 2)
        .map((item) => ({ label: localeService.t(item.label), value: item.operator }));

    if (!condition || !formParams) {
        return null;
    }

    function renderSecondaryCondition(operator: FilterOperator, value: string, name: 'operator1' | 'operator2') {
        const needsValue = FilterConditionItems.getItemByOperator(operator).numOfParameters === 1;
        return (
            <div className="univer-grid univer-gap-3">
                {name === 'operator2' && (
                    <RadioGroup
                        value={formParams?.and ? 'AND' : 'OR'}
                        onChange={(join) => model.onConditionFormChange({ and: join === 'AND' })}
                    >
                        <Radio value="AND">{localeService.t<LocaleKey>('sheets-filter-ui.panel.and')}</Radio>
                        <Radio value="OR">{localeService.t<LocaleKey>('sheets-filter-ui.panel.or')}</Radio>
                    </RadioGroup>
                )}
                <MobileSelect
                    value={operator}
                    options={secondaryOptions}
                    onChange={(nextOperator) => model.onConditionFormChange({
                        [name]: nextOperator as FilterOperator,
                    })}
                />
                {needsValue && (
                    <Input
                        value={value}
                        placeholder={localeService.t<LocaleKey>('sheets-filter-ui.panel.input-values-placeholder')}
                        onChange={(nextValue) => model.onConditionFormChange({
                            [name === 'operator1' ? 'val1' : 'val2']: nextValue,
                        })}
                    />
                )}
            </div>
        );
    }

    function renderConditionEditor() {
        return (
            <div className="univer-grid univer-gap-3 univer-pb-4 univer-pl-7">
                {condition!.numOfParameters === 1 && (
                    <Input
                        value={formParams!.val1 ?? ''}
                        placeholder={localeService.t<LocaleKey>('sheets-filter-ui.panel.input-values-placeholder')}
                        onChange={(value) => model.onConditionFormChange({ val1: value })}
                    />
                )}
                {condition!.numOfParameters >= 2 && renderSecondaryCondition(
                    formParams!.operator1!,
                    formParams!.val1 ?? '',
                    'operator1'
                )}
                {condition!.numOfParameters >= 2 && renderSecondaryCondition(
                    formParams!.operator2!,
                    formParams!.val2 ?? '',
                    'operator2'
                )}
                <p className="univer-m-0 univer-text-xs univer-text-gray-500">
                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.?')}
                    <br />
                    {localeService.t<LocaleKey>('sheets-filter-ui.panel.*')}
                </p>
            </div>
        );
    }

    return (
        <div data-u-comp="mobile-sheets-filter-by-conditions" className="univer-grid univer-gap-4">
            <div
                className="
                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                  dark:!univer-bg-gray-800
                "
            >
                {FilterConditionItems.ALL_CONDITIONS.map((item) => {
                    const selected = condition.operator === item.operator;
                    return (
                        <div
                            key={item.operator}
                            data-u-comp="mobile-filter-condition-item"
                            data-selected={selected}
                            className="
                              univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-px-4
                              last:univer-border-b-0
                              dark:!univer-border-gray-700
                            "
                        >
                            <Radio
                                value={item.operator}
                                checked={selected}
                                onChange={(operator) => model.onPrimaryConditionChange(operator as FilterOperator)}
                            >
                                <span className="univer-flex univer-min-h-12 univer-items-center univer-text-base">
                                    {localeService.t(item.label)}
                                </span>
                            </Radio>
                            {selected && condition.numOfParameters > 0 && renderConditionEditor()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
