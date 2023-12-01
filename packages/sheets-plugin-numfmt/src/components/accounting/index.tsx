import { LocaleService } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { FC } from 'react';
import React, { useContext, useMemo, useState } from 'react';

import type { IBusinessComponentProps } from '../../base/types';
import { UserHabitCurrencyContext } from '../../context/user-habit';
import { getCurrencyType } from '../../utils/currency';
import { getDecimalFromPattern, setPatternDecimal } from '../../utils/decimal';

export const isAccountingPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && pattern.startsWith('_(');
};

export const AccountingPanel: FC<IBusinessComponentProps> = (props) => {
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const userHabitCurrency = useContext(UserHabitCurrencyContext);
    const [suffix, suffixSet] = useState(() => getCurrencyType(props.defaultPattern) || userHabitCurrency[0]);
    const options = useMemo(() => userHabitCurrency.map((key) => ({ label: key, value: key })), []);

    const localeService = useDependency(LocaleService);
    const t = localeService.t;

    props.action.current = () => setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal);

    const onSelect = (v: string) => {
        suffixSet(v);
        props.onChange(setPatternDecimal(`_("${v}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal));
    };

    const onDecimalChange = (v: number | null) => {
        const decimal = v || 0;
        decimalSet(decimal);
        props.onChange(setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal));
    };

    return (
        <div>
            <div className="m-t-16 options ">
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
