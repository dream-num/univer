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
import type { IBusinessComponentProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { getCurrencyType, getDecimalFromPattern, setPatternDecimal } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useContext, useMemo, useState } from 'react';
import { UserHabitCurrencyContext } from '../../controllers/user-habit.controller';
import { usePanelPattern } from '../hooks/use-panel-pattern';

export const isAccountingPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && pattern.startsWith('_(');
};

export function AccountingPanel(props: IBusinessComponentProps) {
    const { defaultPattern } = props;

    const [decimal, setDecimal] = useState(() => getDecimalFromPattern(defaultPattern || '', 2));
    const userHabitCurrency = useContext(UserHabitCurrencyContext);
    const [selectedCurrency, setSelectedCurrency] = useState(() => getCurrencyType(defaultPattern));
    const suffix = selectedCurrency ?? userHabitCurrency[0];
    const options = useMemo(() => userHabitCurrency.map((key) => ({ label: key, value: key })), [userHabitCurrency]);

    const localeService = useDependency(LocaleService);

    const pattern = setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal);
    usePanelPattern(pattern, props);

    return (
        <div>
            <div className="univer-mt-4 univer-flex univer-justify-between">
                <div className="option">
                    <div className="univer-text-sm univer-text-gray-400">
                        {localeService.t<LocaleKey>('sheets-numfmt-ui.decimalLength')}
                    </div>

                    <div className="univer-mt-2 univer-w-32">
                        <InputNumber
                            value={decimal}
                            step={1}
                            precision={0}
                            max={20}
                            min={0}
                            onChange={(value) => setDecimal(value || 0)}
                        />
                    </div>
                </div>
                <div className="option">
                    <div className="univer-text-sm univer-text-gray-400">
                        {localeService.t<LocaleKey>('sheets-numfmt-ui.currencyType')}
                    </div>

                    <div className="univer-mt-2 univer-w-36">
                        <Select
                            options={options}
                            value={suffix}
                            onChange={setSelectedCurrency}
                        />
                    </div>
                </div>
            </div>

            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">
                {localeService.t<LocaleKey>('sheets-numfmt-ui.accountingDes')}
            </div>
        </div>
    );
};
