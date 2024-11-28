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

import type { FC } from 'react';
import type { IBusinessComponentProps } from '../interface';
import { LocaleService, useDependency } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { getCurrencyType, getDecimalFromPattern, setPatternDecimal } from '@univerjs/sheets-numfmt';
import React, { useContext, useMemo, useState } from 'react';
import { UserHabitCurrencyContext } from '../../../controllers/user-habit.controller';

export const isAccountingPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && pattern.startsWith('_(');
};

export const AccountingPanel: FC<IBusinessComponentProps> = (props) => {
    const { defaultPattern, action, onChange } = props;

    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(defaultPattern || '', 2));
    const userHabitCurrency = useContext(UserHabitCurrencyContext);
    const [suffix, suffixSet] = useState(() => getCurrencyType(defaultPattern) || userHabitCurrency[0]);
    const options = useMemo(() => userHabitCurrency.map((key) => ({ label: key, value: key })), []);

    const localeService = useDependency(LocaleService);
    const t = localeService.t;

    action.current = () => setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal);

    const onSelect = (v: string) => {
        suffixSet(v);
        onChange(setPatternDecimal(`_("${v}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal));
    };

    const onDecimalChange = (v: number | null) => {
        const decimal = v || 0;
        decimalSet(decimal);
        onChange(setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal));
    };

    return (
        <div>
            <div className="m-t-16 options">
                <div className="option">
                    <div className="label">{t('sheet.numfmt.decimalLength')}</div>

                    <div className="m-t-8 w-120">
                        <InputNumber value={decimal} max={20} min={0} onChange={onDecimalChange} />
                    </div>
                </div>
                <div className="option">
                    <div className="label">{t('sheet.numfmt.currencyType')}</div>

                    <div className="m-t-8 w-140">
                        <Select onChange={onSelect} options={options} value={suffix} />
                    </div>
                </div>
            </div>

            <div className="describe m-t-14">{t('sheet.numfmt.accountingDes')}</div>
        </div>
    );
};
