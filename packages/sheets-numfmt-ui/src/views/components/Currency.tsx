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
import { isPatternEqualWithoutDecimal, LocaleService } from '@univerjs/core';
import { InputNumber, Select, SelectList } from '@univerjs/design';
import {
    getCurrencyFormatOptions,
    getCurrencyType,
    getDecimalFromPattern,
    setPatternDecimal,
} from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useContext, useLayoutEffect, useMemo, useState } from 'react';
import { UserHabitCurrencyContext } from '../../controllers/user-habit.controller';

export const isCurrencyPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && !pattern.startsWith('_(');
};

export function CurrencyPanel(props: IBusinessComponentProps) {
    const { onActionChange, onChange: onValueChange } = props;
    const localeService = useDependency(LocaleService);
    const userHabitCurrency = useContext(UserHabitCurrencyContext);
    const [suffix, setSuffix] = useState(() => getCurrencyType(props.defaultPattern) || userHabitCurrency[0]);
    const [decimal, setDecimal] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [pattern, setPattern] = useState(() => {
        const negativeOptions = getCurrencyFormatOptions(suffix);
        const pattern =
            negativeOptions.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern))?.value ||
            negativeOptions[0].value;
        return pattern;
    });

    const negativeOptions = useMemo(() => getCurrencyFormatOptions(suffix), [suffix]);
    const options = useMemo(() => userHabitCurrency.map((key) => ({ label: key, value: key })), [userHabitCurrency]);

    useLayoutEffect(() => {
        onActionChange(() => setPatternDecimal(pattern, decimal));
    }, [decimal, onActionChange, pattern]);

    const onSelect = (value: string) => {
        if (value === undefined) {
            return;
        }
        setSuffix(value);
        const pattern = getCurrencyFormatOptions(value)[0].value;
        setPattern(pattern);
        onValueChange(setPatternDecimal(pattern, decimal));
    };

    const onChange = (value: any) => {
        if (value === undefined) {
            return;
        }
        setPattern(value);
        onValueChange(setPatternDecimal(value, decimal));
    };

    const onDecimalChange = (v: number | null) => {
        setDecimal(v || 0);
        onValueChange(setPatternDecimal(pattern, v || 0));
    };

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
                            max={20}
                            min={0}
                            onChange={onDecimalChange}
                        />
                    </div>
                </div>
                <div className="option">
                    <div className="univer-text-sm univer-text-gray-400">
                        {localeService.t<LocaleKey>('sheets-numfmt-ui.currencyType')}
                    </div>
                    <div className="univer-mt-2 univer-w-36">
                        <Select
                            value={suffix}
                            options={options}
                            onChange={onSelect}
                        />
                    </div>
                </div>
            </div>
            <div className="label univer-mt-4">
                {localeService.t<LocaleKey>('sheets-numfmt-ui.negType')}
            </div>

            <div className="univer-mt-2">
                <SelectList value={pattern} options={negativeOptions} onChange={onChange} />
            </div>

            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">
                {localeService.t<LocaleKey>('sheets-numfmt-ui.currencyDes')}
            </div>
        </div>
    );
};
