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

import type { IDataValidationRuleOptions } from '@univerjs/core';
import { DataValidationRenderMode, LocaleService } from '@univerjs/core';
import { FormLayout, Radio, RadioGroup } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';

export interface IListRenderModeInputProps {
    value: IDataValidationRuleOptions;
    onChange: (value: IDataValidationRuleOptions) => void;
}
const LIST_RENDER_MODE_OPTION_INPUT = 'LIST_RENDER_MODE_OPTION_INPUT';

export function ListRenderModeInput(props: IListRenderModeInputProps) {
    const { value, onChange } = props;
    const localeService = useDependency(LocaleService);

    return (
        <FormLayout label={localeService.t('dataValidation.renderMode.label')}>
            <RadioGroup value={`${value.renderMode ?? DataValidationRenderMode.CUSTOM}`} onChange={(renderMode) => onChange({ ...value, renderMode: +renderMode })}>
                <Radio value={`${DataValidationRenderMode.CUSTOM}`}>
                    {localeService.t('dataValidation.renderMode.chip')}
                </Radio>
                <Radio value={`${DataValidationRenderMode.ARROW}`}>
                    {localeService.t('dataValidation.renderMode.arrow')}
                </Radio>
                <Radio value={`${DataValidationRenderMode.TEXT}`}>
                    {localeService.t('dataValidation.renderMode.text')}
                </Radio>
            </RadioGroup>
        </FormLayout>
    );
}

ListRenderModeInput.componentKey = LIST_RENDER_MODE_OPTION_INPUT;
