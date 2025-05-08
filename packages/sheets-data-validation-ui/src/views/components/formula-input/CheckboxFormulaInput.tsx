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

import type { IFormulaInputProps } from '@univerjs/data-validation';
import { LocaleService } from '@univerjs/core';
import { Checkbox, FormLayout, Input } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import React, { useState } from 'react';

export function CheckboxFormulaInput(props: IFormulaInputProps) {
    const { value, onChange, showError, validResult } = props;
    const localeService = useDependency(LocaleService);
    const formula1Res = showError ? validResult?.formula1 : '';
    const formula2Res = showError ? validResult?.formula2 : '';

    const [checked, setChecked] = useState(!(value?.formula1 === undefined && value?.formula2 === undefined));

    return (
        <>
            <FormLayout>
                <Checkbox
                    checked={checked}
                    onChange={(newValue) => {
                        if (newValue) {
                            setChecked(true);
                        } else {
                            setChecked(false);
                            onChange?.({
                                ...value,
                                formula1: undefined,
                                formula2: undefined,
                            });
                        }
                    }}
                >
                    {localeService.t('dataValidation.checkbox.tips')}
                </Checkbox>
            </FormLayout>
            {checked
                ? (
                    <FormLayout label={localeService.t('dataValidation.checkbox.checked')} error={formula1Res}>
                        <Input
                            className="univer-w-full"
                            placeholder={localeService.t('dataValidation.panel.valuePlaceholder')}
                            value={value?.formula1}
                            onChange={(newValue) => {
                                onChange?.({
                                    ...value,
                                    formula1: newValue || undefined,
                                });
                            }}
                        />
                    </FormLayout>
                )
                : null}
            {checked
                ? (
                    <FormLayout label={localeService.t('dataValidation.checkbox.unchecked')} error={formula2Res}>
                        <Input
                            className="univer-w-full"
                            placeholder={localeService.t('dataValidation.panel.valuePlaceholder')}
                            value={value?.formula2}
                            onChange={(newValue) => {
                                onChange?.({
                                    ...value,
                                    formula2: newValue || undefined,
                                });
                            }}
                        />
                    </FormLayout>
                )
                : null}
        </>
    );
}
