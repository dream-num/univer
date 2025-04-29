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

import type { FC } from 'react';
import type { IBusinessComponentProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { InputNumber, Select, SelectList } from '@univerjs/design';
import { getCurrencyFormatOptions, getCurrencyType, getDecimalFromPattern, isPatternEqualWithoutDecimal, setPatternDecimal } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useContext, useMemo, useState } from 'react';
import { UserHabitCurrencyContext } from '../../controllers/user-habit.controller';

export const isCurrencyPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && !pattern.startsWith('_(');
};

export const CurrencyPanel: FC<IBusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const userHabitCurrency = useContext(UserHabitCurrencyContext);
    const [suffix, suffixSet] = useState(() => getCurrencyType(props.defaultPattern) || userHabitCurrency[0]);
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [pattern, patternSet] = useState(() => {
        const negativeOptions = getCurrencyFormatOptions(suffix);
        const pattern =
            negativeOptions.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern))?.value ||
            negativeOptions[0].value;
        return pattern;
    });

    const negativeOptions = useMemo(() => getCurrencyFormatOptions(suffix), [suffix]);
    const options = useMemo(() => userHabitCurrency.map((key) => ({ label: key, value: key })), [userHabitCurrency]);

    props.action.current = () => setPatternDecimal(pattern, decimal);

    const onSelect = (value: string) => {
        if (value === undefined) {
            return;
        }
        suffixSet(value);
        const pattern = getCurrencyFormatOptions(value)[0].value;
        patternSet(pattern);
        props.onChange(setPatternDecimal(pattern, decimal));
    };

    const onChange = (value: any) => {
        if (value === undefined) {
            return;
        }
        patternSet(value);
        props.onChange(setPatternDecimal(value, decimal));
    };

    const onDecimalChange = (v: number | null) => {
        decimalSet(v || 0);
        props.onChange(setPatternDecimal(pattern, v || 0));
    };

    return (
        <div>
            <div className="univer-mt-4 univer-flex univer-justify-between">
                <div className="option">
                    <div className="univer-text-sm univer-text-gray-400">{t('sheet.numfmt.decimalLength')}</div>
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
                    <div className="univer-text-sm univer-text-gray-400">{t('sheet.numfmt.currencyType')}</div>
                    <div className="univer-mt-2 univer-w-36">
                        <Select
                            value={suffix}
                            options={options}
                            onChange={onSelect}
                        />
                    </div>
                </div>
            </div>
            <div className="univer-mt-4 label">
                {t('sheet.numfmt.negType')}
            </div>

            <div className="univer-mt-2">
                <SelectList value={pattern} options={negativeOptions} onChange={onChange} />
            </div>

            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">{t('sheet.numfmt.currencyDes')}</div>
        </div>
    );
};
