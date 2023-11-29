import { LocaleService } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

import type { BusinessComponentProps } from '../../base/types';
import { getCurrencyType } from '../../utils/currency';
import { getDecimalFromPattern, setPatternDecimal } from '../../utils/decimal';
import { getCurrencyOptions } from '../../utils/options';

export const isAccountingPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && pattern.startsWith('_(');
};

export const AccountingPanel: FC<BusinessComponentProps> = (props) => {
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [suffix, suffixSet] = useState(
        () => getCurrencyType(props.defaultPattern || '') || getCurrencyOptions()[0].value
    );
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const pattern = useMemo(
        () => setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal),
        [suffix, decimal]
    );

    const currencyOptions = useMemo(getCurrencyOptions, []);

    useEffect(() => {
        props.onChange(pattern);
    }, [pattern]);

    return (
        <div>
            <div className="m-t-16 options ">
                <div className="option">
                    <div className="label">{t('sheet.numfmt.decimalLength')}</div>

                    <div className="m-t-8 w-120">
                        <InputNumber value={decimal} max={20} min={0} onChange={(value) => decimalSet(value || 0)} />
                    </div>
                </div>
                <div className="option">
                    <div className="label">{t('sheet.numfmt.currencyType')}</div>

                    <div className="m-t-8 w-140">
                        <Select onChange={suffixSet} options={currencyOptions} value={suffix} />
                    </div>
                </div>
            </div>

            <div className="describe m-t-14">{t('sheet.numfmt.accountingDes')}</div>
        </div>
    );
};
