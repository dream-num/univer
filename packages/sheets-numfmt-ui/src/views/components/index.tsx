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

import type { ISelectProps } from '@univerjs/design';
import type { FC } from 'react';
import type { IBusinessComponentProps } from './interface';
import { LocaleService } from '@univerjs/core';
import { Button, Select } from '@univerjs/design';
import { getCurrencyType } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserHabitCurrencyContext } from '../../controllers/user-habit.controller';
import { useCurrencyOptions } from '../hooks/use-currency-options';
import { useNextTick } from '../hooks/use-next-tick';
import { AccountingPanel, isAccountingPanel } from './Accounting';
import { CurrencyPanel, isCurrencyPanel } from './Currency';
import { CustomFormat } from './CustomFormat';
import { DatePanel, isDatePanel } from './Date';
import { GeneralPanel, isGeneralPanel } from './General';
import { isThousandthPercentilePanel, ThousandthPercentilePanel } from './ThousandthPercentile';

export interface ISheetNumfmtPanelProps {
    value: { defaultValue: number; defaultPattern: string; row: number; col: number };
    onChange: (config: { type: 'change' | 'cancel' | 'confirm'; value: string }) => void;
}

export const SheetNumfmtPanel: FC<ISheetNumfmtPanelProps> = (props) => {
    const { defaultValue, defaultPattern, row, col } = props.value;
    const localeService = useDependency(LocaleService);
    const getCurrentPattern = useRef<() => string | null>(() => '');
    const t = localeService.t;
    const nextTick = useNextTick();
    const typeOptions = useMemo(
        () =>
            [
                { label: 'sheet.numfmt.general', component: GeneralPanel },
                { label: 'sheet.numfmt.accounting', component: AccountingPanel },
                { label: 'sheet.numfmt.currency', component: CurrencyPanel },
                { label: 'sheet.numfmt.date', component: DatePanel },
                { label: 'sheet.numfmt.thousandthPercentile', component: ThousandthPercentilePanel },
                { label: 'sheet.numfmt.customFormat', component: CustomFormat },
            ].map((item) => ({ ...item, label: t(item.label) })),
        []
    );
    const [type, setType] = useState(findDefaultType);
    const [key, setKey] = useState(() => `${row}_${col}`);
    const { mark, userHabitCurrency } = useCurrencyOptions(() => setKey(`${row}_${col}_userCurrency'`));

    const BusinessComponent = useMemo(() => typeOptions.find((item) => item.label === type)?.component, [type]);

    function findDefaultType() {
        const list = [isGeneralPanel, isAccountingPanel, isCurrencyPanel, isDatePanel, isThousandthPercentilePanel];
        return (
            list.reduce((pre, curFn, index) => pre || (curFn(defaultPattern) ? typeOptions[index].label : ''), '') ||
            typeOptions[0].label
        );
    }

    const selectOptions: ISelectProps['options'] = typeOptions.map((option) => ({
        label: option.label,
        value: option.label,
    }));

    const handleSelect: ISelectProps['onChange'] = (value) => {
        setType(value);
        // after the BusinessComponent render.
        nextTick(() => props.onChange({ type: 'change', value: getCurrentPattern.current() || '' }));
    };

    const handleChange = useCallback((v: string) => {
        props.onChange({ type: 'change', value: v });
    }, []);

    const handleConfirm = () => {
        const pattern = getCurrentPattern.current() || '';
        const currency = getCurrencyType(pattern);
        if (currency) {
            mark(currency);
        }
        props.onChange({ type: 'confirm', value: pattern });
    };

    const handleCancel = () => {
        props.onChange({ type: 'cancel', value: '' });
    };

    const subProps: IBusinessComponentProps = {
        onChange: handleChange,
        defaultValue,
        defaultPattern,
        action: getCurrentPattern,
    };

    useEffect(() => {
        setType(findDefaultType());
        setKey(`${row}_${col}`);
    }, [row, col]);

    return (
        <div
            className={`
              univer-flex univer-h-full univer-flex-col univer-justify-between univer-overflow-y-auto univer-pb-5
            `}
        >
            <div>
                <div className="univer-mt-3.5 univer-text-sm univer-text-gray-400">{t('sheet.numfmt.numfmtType')}</div>
                <div className="univer-mt-2">
                    <Select className="univer-w-full" value={type} options={selectOptions} onChange={handleSelect} />
                </div>
                <div>
                    {BusinessComponent && (
                        <UserHabitCurrencyContext.Provider value={userHabitCurrency}>
                            <BusinessComponent {...subProps} key={key} />
                        </UserHabitCurrencyContext.Provider>
                    )}
                </div>
            </div>

            <div className="univer-mb-5 univer-mt-3.5 univer-flex univer-justify-end">
                <Button onClick={handleCancel} className="univer-mr-3">
                    {t('sheet.numfmt.cancel')}
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    {t('sheet.numfmt.confirm')}
                </Button>
            </div>
        </div>
    );
};
