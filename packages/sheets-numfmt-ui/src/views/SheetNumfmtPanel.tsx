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
import type { ComponentType } from 'react';
import type { LocaleKey } from '../locale/types';
import type { IBusinessComponentProps } from './components/interface';
import { LocaleService } from '@univerjs/core';
import { Button, clsx, scrollbarClassName, Select } from '@univerjs/design';
import { getCurrencyType } from '@univerjs/sheets-numfmt';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { UserHabitCurrencyContext } from '../controllers/user-habit.controller';
import { AccountingPanel, isAccountingPanel } from './components/Accounting';
import { CurrencyPanel, isCurrencyPanel } from './components/Currency';
import { CustomFormat } from './components/CustomFormat';
import { DatePanel, isDatePanel } from './components/Date';
import { GeneralPanel, isGeneralPanel } from './components/General';
import { isThousandthPercentilePanel, ThousandthPercentilePanel } from './components/ThousandthPercentile';
import { useCurrencyOptions } from './hooks/use-currency-options';
import { useNextTick } from './hooks/use-next-tick';

export interface ISheetNumfmtPanelProps {
    value: { defaultValue: number; defaultPattern: string; row: number; col: number };
    onChange: (config: { type: 'change' | 'cancel' | 'confirm'; value: string }) => void;
}

export function SheetNumfmtPanel(props: ISheetNumfmtPanelProps) {
    const { defaultValue, defaultPattern, row, col } = props.value;
    const localeService = useDependency(LocaleService);
    const currentPatternRef = useRef<() => string | null>(() => '');
    const nextTick = useNextTick();

    const typeOptions = useMemo(
        () => {
            const typeOptions: Array<{ label: LocaleKey; component: ComponentType<IBusinessComponentProps> }> = [
                { label: 'sheets-numfmt-ui.general', component: GeneralPanel },
                { label: 'sheets-numfmt-ui.accounting', component: AccountingPanel },
                { label: 'sheets-numfmt-ui.currency', component: CurrencyPanel },
                { label: 'sheets-numfmt-ui.date', component: DatePanel },
                { label: 'sheets-numfmt-ui.thousandthPercentile', component: ThousandthPercentilePanel },
                { label: 'sheets-numfmt-ui.customFormat', component: CustomFormat },
            ];

            return typeOptions.map((item) => ({ ...item, label: localeService.t<LocaleKey>(item.label) }));
        },
        [localeService]
    );
    const [type, setType] = useState(findDefaultType);
    const [key, setKey] = useState(() => `${row}_${col}_${defaultPattern}`);
    const { mark, userHabitCurrency } = useCurrencyOptions(() => setKey(`${row}_${col}_${defaultPattern}_userCurrency`));

    const BusinessComponent = typeOptions.find((item) => item.label === type)?.component;

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
        nextTick(() => props.onChange({ type: 'change', value: currentPatternRef.current() || '' }));
    };

    const handleChange = useCallback((v: string) => {
        props.onChange({ type: 'change', value: v });
    }, []);

    const handleActionChange = useCallback((action: () => string | null) => {
        currentPatternRef.current = action;
    }, []);

    const handleConfirm = () => {
        const pattern = currentPatternRef.current() || '';
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
        onActionChange: handleActionChange,
        defaultValue,
        defaultPattern,
    };

    useEffect(() => {
        setType(findDefaultType());
        setKey(`${row}_${col}_${defaultPattern}`);
    }, [row, col, defaultPattern]);

    return (
        <div
            className={clsx(
                'univer-flex univer-h-full univer-flex-col univer-justify-between univer-overflow-y-auto univer-pb-5',
                scrollbarClassName
            )}
        >
            <div>
                <div className="univer-mt-3.5 univer-text-sm univer-text-gray-400">
                    {localeService.t<LocaleKey>('sheets-numfmt-ui.numfmtType')}
                </div>
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

            <div
                className="
                  univer-mb-5 univer-mt-3.5 univer-flex univer-justify-end univer-gap-2
                  rtl:univer-flex-row-reverse
                "
            >
                <Button onClick={handleCancel}>
                    {localeService.t<LocaleKey>('sheets-numfmt-ui.cancel')}
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    {localeService.t<LocaleKey>('sheets-numfmt-ui.confirm')}
                </Button>
            </div>
        </div>
    );
};
