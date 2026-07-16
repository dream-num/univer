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
import { InputNumber, SelectList } from '@univerjs/design';
import {
    getDecimalFromPattern,
    getNumberFormatOptions,
    isPatternHasDecimal,
    setPatternDecimal,
} from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useLayoutEffect, useMemo, useState } from 'react';

export const isThousandthPercentilePanel = (pattern: string) =>
    getNumberFormatOptions().some((item) => isPatternEqualWithoutDecimal(item.value, pattern));

export function ThousandthPercentilePanel(props: IBusinessComponentProps) {
    const { onActionChange, onChange } = props;
    const localeService = useDependency(LocaleService);

    const options = useMemo(getNumberFormatOptions, []);
    const [decimal, setDecimal] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 0));

    const [suffix, setSuffix] = useState(() => {
        const item = options.find((item) => isPatternEqualWithoutDecimal(item.value, props.defaultPattern || ''));
        return item?.value || options[0].value;
    });

    const pattern = useMemo(() => setPatternDecimal(suffix, Number(decimal || 0)), [suffix, decimal]);

    const isInputDisable = !isPatternHasDecimal(suffix);

    const handleDecimalChange = (decimal: number | null) => {
        setDecimal(decimal || 0);
        onChange(setPatternDecimal(suffix, Number(decimal || 0)));
    };
    const handleClick = (v: any) => {
        if (v === undefined) {
            return;
        }
        setDecimal(getDecimalFromPattern(v, 0));
        setSuffix(v);
        onChange(v);
    };

    useLayoutEffect(() => {
        onActionChange(() => pattern);
    }, [onActionChange, pattern]);

    return (
        <div>
            <div className="univer-mt-4 univer-text-sm univer-text-gray-400">
                {localeService.t<LocaleKey>('sheets-numfmt-ui.decimalLength')}
            </div>
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
                {localeService.t<LocaleKey>('sheets-numfmt-ui.negType')}
            </div>
            <div className="univer-mt-2">
                <SelectList onChange={handleClick} options={options} value={suffix} />
            </div>
            <div
                className={`
                  univer-mt-3.5 univer-text-sm/5 univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                {localeService.t<LocaleKey>('sheets-numfmt-ui.thousandthPercentileDes')}
            </div>
        </div>
    );
};
