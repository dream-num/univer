import './index.less';

import { LocaleService } from '@univerjs/core';
import { InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { FC, useEffect, useMemo, useState } from 'react';

import { currencySymbols } from '../../base/const/CURRENCY-SYMBOLS';
import { BusinessComponentProps } from '../../base/types';
import { getCurrencyType } from '../../utils/currency';
import { getDecimalFromPattern, setPatternDecimal } from '../../utils/decimal';

export const isAccountingPanel = (pattern: string) => {
    const type = getCurrencyType(pattern);
    return !!type && pattern.startsWith('_(');
};

export const AccountingPanel: FC<BusinessComponentProps> = (props) => {
    const [decimal, decimalSet] = useState(() => getDecimalFromPattern(props.defaultPattern || '', 2));
    const [suffix, suffixSet] = useState(() => getCurrencyType(props.defaultPattern || '') || currencySymbols[0]);
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const pattern = useMemo(
        () => setPatternDecimal(`_("${suffix}"* #,##0${decimal > 0 ? '.0' : ''}_)`, decimal),
        [suffix, decimal]
    );
    const preview = useMemo(() => {
        const value = numfmt.format(pattern, Number(props.defaultValue) || 0, { locale: 'zh-CN' });
        return value;
    }, [pattern, props.defaultValue]);

    const currencyOptions = useMemo(() => currencySymbols.map((item) => ({ label: item, value: item })), []);

    useEffect(() => {
        props.onChange(pattern);
    }, [pattern]);

    return (
        <div>
            <div className="m-t-16 label">{t('sheet.numfmt.preview')}</div>

            <div className="m-t-8 preview" style={{ color: preview.color }}>
                {preview.result}
            </div>
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
                        <Select onChange={suffixSet} options={currencyOptions} value={suffix}></Select>
                    </div>
                </div>
            </div>

            <div className="describe m-t-14">{t('sheet.numfmt.accountingDes')}</div>
        </div>
    );
};
