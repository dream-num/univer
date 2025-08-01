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

import type { IPopup } from '@univerjs/ui';
import type { IBaseDropdownProps } from '../type';
import { dayjs, LocaleService } from '@univerjs/core';
import { borderTopClassName, Button, Calendar, clsx, TimeInput } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useMemo, useState } from 'react';

export interface IDateDropdownProps {
    defaultValue?: dayjs.Dayjs;
    onChange?: (value: dayjs.Dayjs | undefined) => boolean | Promise<boolean>;
    patternType?: 'datetime' | 'date' | 'time';
    showTime?: boolean;
}

export function DateDropdown(props: { popup: IPopup<IDateDropdownProps & IBaseDropdownProps> }) {
    const { popup } = props;
    const { extraProps } = popup;
    const { hideFn, patternType, defaultValue, onChange, showTime } = extraProps!;
    const [localDate, setLocalDate] = useState<dayjs.Dayjs | undefined>(defaultValue);
    const defaultDate = useMemo(() => patternType !== 'time' ? dayjs() : dayjs('1900-01-01 00:00:00'), []);
    const date = localDate && localDate.isValid() ? localDate : defaultDate;
    const localeService = useDependency(LocaleService);

    const handleSave = async () => {
        if (!date) return;
        const result = await onChange?.(date);
        if (result) {
            hideFn();
        }
    };

    return (
        <div
            className={`
              univer-rounded univer-bg-white univer-p-2 univer-shadow-lg
              dark:!univer-bg-black
            `}
        >
            {patternType === 'time'
                ? (
                    <TimeInput
                        value={date.toDate()}
                        onValueChange={(newValue) => {
                            setLocalDate(dayjs(newValue));
                        }}
                    />
                )
                : (
                    <Calendar
                        value={date.toDate()}
                        showTime={showTime ?? patternType === 'datetime'}
                        onValueChange={(newValue) => {
                            setLocalDate(dayjs(newValue));
                        }}
                    />
                )}

            <footer
                className={clsx('univer-mt-2 univer-flex univer-justify-end univer-pt-2', borderTopClassName)}
            >
                <Button size="small" variant="primary" onClick={handleSave} disabled={!date || !date.isValid()}>
                    {localeService.t('dataValidation.alert.ok')}
                </Button>
            </footer>
        </div>

    );
}

DateDropdown.componentKey = 'sheets.dropdown.date';
