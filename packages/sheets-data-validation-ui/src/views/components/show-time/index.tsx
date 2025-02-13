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
import { LocaleService } from '@univerjs/core';
import { Checkbox, FormLayout } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import React from 'react';

export interface IDateShowTimeOptionProps {
    value: IDataValidationRuleOptions;
    onChange: (value: IDataValidationRuleOptions) => void;
}
const DATE_SHOW_TIME_OPTION = 'DATE_SHOW_TIME_OPTION';

export function DateShowTimeOption(props: IDateShowTimeOptionProps) {
    const { value, onChange } = props;
    const localeService = useDependency(LocaleService);

    return (
        <FormLayout>
            <Checkbox
                checked={value.bizInfo?.showTime}
                onChange={(showTime) => {
                    onChange({
                        ...value,
                        bizInfo: {
                            ...value.bizInfo,
                            showTime: showTime as boolean,
                        },
                    });
                }}
            >
                {localeService.t('dataValidation.showTime.label')}
            </Checkbox>
        </FormLayout>
    );
}

DateShowTimeOption.componentKey = DATE_SHOW_TIME_OPTION;
