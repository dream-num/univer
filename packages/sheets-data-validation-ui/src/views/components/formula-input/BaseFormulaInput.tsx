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
import { FormLayout, Input } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';

export const BaseFormulaInput = (props: IFormulaInputProps) => {
    const { isTwoFormula = false, value, onChange, showError, validResult } = props;
    const localeService = useDependency(LocaleService);
    const formula1Res = showError ? validResult?.formula1 : '';
    const formula2Res = showError ? validResult?.formula2 : '';

    if (isTwoFormula) {
        return (
            <>
                <FormLayout error={formula1Res}>
                    <Input
                        className="univer-w-full"
                        placeholder={localeService.t('dataValidation.panel.formulaPlaceholder')}
                        value={value?.formula1}
                        onChange={(newValue) => {
                            onChange?.({
                                ...value,
                                formula1: newValue,
                            });
                        }}
                    />
                </FormLayout>
                <div className="-univer-mt-2 univer-mb-1 univer-text-sm univer-text-gray-400">
                    {localeService.t('dataValidation.panel.formulaAnd')}
                </div>
                <FormLayout error={formula2Res}>
                    <Input
                        className="univer-w-full"
                        placeholder={localeService.t('dataValidation.panel.formulaPlaceholder')}
                        value={value?.formula2}
                        onChange={(newValue) => {
                            onChange?.({
                                ...value,
                                formula2: newValue,
                            });
                        }}
                    />
                </FormLayout>
            </>
        );
    }

    return (
        <FormLayout error={formula1Res}>
            <Input
                className="univer-w-full"
                placeholder={localeService.t('dataValidation.panel.formulaPlaceholder')}
                value={value?.formula1}
                onChange={(newValue) => {
                    onChange?.({ formula1: newValue });
                }}
            />
        </FormLayout>
    );
};
