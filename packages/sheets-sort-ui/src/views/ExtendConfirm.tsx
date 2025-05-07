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

import { LocaleService } from '@univerjs/core';
import { Radio, RadioGroup } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export interface IExtendConfirmProps {
    onChange: (value: string) => void;
};

export const ExtendConfirm = (props: IExtendConfirmProps) => {
    const [extend, setExtend] = useState<string>('0');
    const localeService = useDependency(LocaleService);
    return (
        <div className="univer-text-sm">
            <div className="extend-confirm-desc">
                {localeService.t('sheets-sort.dialog.sort-reminder-desc')}
            </div>

            <RadioGroup
                className="univer-mt-4"
                value={extend}
                direction="vertical"
                onChange={(value) => {
                    setExtend(value as string);
                    props.onChange(value as string);
                }}
            >
                <Radio value="0">
                    {localeService.t('sheets-sort.dialog.sort-reminder-no')}
                </Radio>
                <Radio value="1">
                    {localeService.t('sheets-sort.dialog.sort-reminder-ext')}
                </Radio>
            </RadioGroup>
        </div>
    );
};
