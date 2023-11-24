import './index.less';

import { LocaleService } from '@univerjs/core';
import { Button, ISelectProps, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import { BusinessComponentProps } from '../base/types';
import { AccountingPanel, isAccountingPanel } from './accounting';
import { CurrencyPanel, isCurrencyPanel } from './currency';
import { DatePanel, isDatePanel } from './date';
import { GeneralPanel, isGeneralPanel } from './general';
import { isThousandthPercentilePanel, ThousandthPercentilePanel } from './thousandth-percentile';

export type SheetNumfmtPanelProps = {
    value: { defaultValue: number; defaultPattern: string };
    onChange: (config: { type: 'change' | 'cancel' | 'confirm'; value: string }) => void;
};
export const SheetNumfmtPanel: FC<SheetNumfmtPanelProps> = (props) => {
    const { defaultValue, defaultPattern } = props.value;
    const localeService = useDependency(LocaleService);
    const t = localeService.t;
    const options = useMemo(
        () =>
            [
                { label: 'sheet.numfmt.general', component: GeneralPanel },
                { label: 'sheet.numfmt.accounting', component: AccountingPanel },
                { label: 'sheet.numfmt.currency', component: CurrencyPanel },
                { label: 'sheet.numfmt.date', component: DatePanel },
                { label: 'sheet.numfmt.thousandthPercentile', component: ThousandthPercentilePanel },
            ].map((item) => ({ ...item, label: t(item.label) })),
        []
    );
    const findDefaultType = () => {
        const list = [isGeneralPanel, isAccountingPanel, isCurrencyPanel, isDatePanel, isThousandthPercentilePanel];
        return (
            list.reduce((pre, curFn, index) => pre || (curFn(defaultPattern) ? options[index].label : ''), '') ||
            options[0].label
        );
    };
    const [type, typeSet] = useState(findDefaultType);
    const pattern = useRef('');
    const BusinessComponent = useMemo(() => options.find((item) => item.label === type)?.component, [type]);

    const selectOptions: ISelectProps['options'] = options.map((option) => ({
        label: option.label,
        value: option.label,
    }));
    const handleSelect: ISelectProps['onChange'] = (value) => {
        typeSet(value);
    };
    const handleChange = (v: string) => {
        pattern.current = v;
        props.onChange({ type: 'change', value: v });
    };
    const handleConfirm = () => {
        props.onChange({ type: 'confirm', value: pattern.current });
    };
    const handleCancel = () => {
        props.onChange({ type: 'cancel', value: pattern.current });
    };

    const subProps: BusinessComponentProps = {
        onChange: handleChange,
        defaultValue,
        defaultPattern,
    };

    useEffect(() => {
        typeSet(findDefaultType());
    }, [defaultPattern, defaultValue]);

    return (
        <div className="numfmt-panel p-b-20">
            <div>
                <div className="label m-t-14">{t('sheet.numfmt.numfmtType')}</div>
                <div className="m-t-8">
                    <Select onChange={handleSelect} options={selectOptions} value={type}></Select>
                </div>
                <div>{BusinessComponent && <BusinessComponent {...subProps} />}</div>
            </div>

            <div className="btn-list m-t-14 m-b-20">
                <Button size="small" onClick={handleCancel} className="m-r-12">
                    {t('sheet.numfmt.cancel')}
                </Button>
                <Button type="primary" size="small" onClick={handleConfirm}>
                    {t('sheet.numfmt.confirm')}
                </Button>
            </div>
        </div>
    );
};
