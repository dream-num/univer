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
import { InputNumber, SelectList } from '@univerjs/design';
import { getDecimalFromPattern, getNumberFormatOptions, isPatternEqualWithoutDecimal, isPatternHasDecimal, setPatternDecimal } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import React, { useMemo, useState } from 'react';

export const isThousandthPercentilePanel = (pattern: string) =>
    getNumberFormatOptions().some((item) => isPatternEqualWithoutDecimal(item.value, pattern));

export const ThousandthPercentilePanel: FC<IBusinessComponentProps> = (props) => {
    const localeService = useDependency(LocaleService);

    const options = useMemo(getNumberFormatOptions, []);
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, suffixSet] = useState(() => {
        const item = options.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern || ''));
        return item?.value || options[0].value;
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const isInputDisable = useMemo(() => !isPatternHasDecimal(suffix), [suffix]);

    const handleDecimalChange = (decimal: number | null) => {
        decimalSet(decimal || 0);
        props.onChange(setPatternDecimal(suffix, Number(decimal || 0)));
    };
    const handleClick = (v: any) => {
        if (v === undefined) {
            return;
        }
        decimalSet(getDecimalFromPattern(v, 0));
        suffixSet(v);
        props.onChange(v);
    };

    props.action.current = () => pattern;

    return (
        <div>
            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">{localeService.t('sheet.numfmt.decimalLength')}</div>
            <div className="univer-mt-2">
                <InputNumber
                    disabled={isInputDisable}
                    value={decimal}
                    max={20}
                    min={0}
                    onChange={handleDecimalChange}
                />
            </div>
            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">
                {' '}
                {localeService.t('sheet.numfmt.negType')}
            </div>
            <div className="univer-mt-2">
                <SelectList onChange={handleClick} options={options} value={suffix} />
            </div>
            <div
                className={`
                  univer-mt-3.5 univer-text-sm/5 univer-text-gray-600
                  dark:univer-text-gray-200
                `}
            >
                {localeService.t('sheet.numfmt.thousandthPercentileDes')}
            </div>
        </div>
    );
};
