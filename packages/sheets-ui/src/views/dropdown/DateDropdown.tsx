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

import type { DateKit } from '@univerjs/core';
import type { IPopupWithExtraProps } from '@univerjs/ui';
import type { LocaleKey } from '../../locale/types';
import type { IBaseDropdownProps } from './type';
import { dateKit, LocaleService } from '@univerjs/core';
import { borderTopClassName, Button, Calendar, clsx, Input, TimeInput } from '@univerjs/design';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';

export interface IDateDropdownProps {
    defaultValue?: DateKit;
    onChange?: (value: DateKit | undefined, changeType?: 'date' | 'time') => boolean | Promise<boolean>;
    durationValue?: number;
    onDurationChange?: (value: number | undefined) => boolean | Promise<boolean>;
    /** A calendar serial that cannot be represented by the configured Excel date system. */
    unsupportedValue?: number;
    onSerialChange?: (value: number | undefined) => boolean | Promise<boolean>;
    exceptionalDateLabel?: string;
    patternType?: 'datetime' | 'date' | 'time' | 'duration';
    showTime?: boolean;
    /** Keep the original serial when the picker is opened and confirmed without an actual selection change. */
    preserveDefaultValue?: boolean;
}

export function formatDuration(value: number | undefined): string {
    if (value == null || !Number.isFinite(value)) return '';
    const sign = value < 0 ? '-' : '';
    const totalMilliseconds = Math.round(Math.abs(value) * 24 * 60 * 60 * 1000);
    const hours = Math.floor(totalMilliseconds / 3_600_000);
    const minutes = Math.floor(totalMilliseconds / 60_000) % 60;
    const seconds = Math.floor(totalMilliseconds / 1000) % 60;
    const milliseconds = totalMilliseconds % 1000;
    return `${sign}${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${milliseconds ? `.${String(milliseconds).padStart(3, '0')}` : ''}`;
}

export function parseDuration(value: string): number | null {
    const match = value.trim().match(/^([+-])?(\d+):([0-5]\d):([0-5]\d)(?:\.(\d{1,3}))?$/);
    if (!match) return null;
    const [, sign, hours, minutes, seconds, milliseconds = ''] = match;
    const totalSeconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds.padEnd(3, '0')) / 1000;
    return (sign === '-' ? -1 : 1) * totalSeconds / 86400;
}

export function DateDropdown(props: {
    popup: IPopupWithExtraProps<IDateDropdownProps & IBaseDropdownProps>;
}) {
    const { popup } = props;
    const { extraProps } = popup;
    const { hideFn, patternType, defaultValue, durationValue, unsupportedValue, onChange, onDurationChange, onSerialChange, exceptionalDateLabel, preserveDefaultValue, showTime } = extraProps;
    const [localDate, setLocalDate] = useState<DateKit | undefined>(defaultValue);
    const [durationText, setDurationText] = useState(() => formatDuration(durationValue));
    const [serialText, setSerialText] = useState(() => unsupportedValue == null ? '' : String(unsupportedValue));
    const [isDirty, setIsDirty] = useState(false);
    const [changeType, setChangeType] = useState<'date' | 'time'>();
    const [defaultDate] = useState(() => patternType !== 'time' ? dateKit() : dateKit('1900-01-01 00:00:00'));
    const date = localDate && localDate.isValid() ? localDate : defaultDate;
    const localeService = useDependency(LocaleService);
    const durationSerial = parseDuration(durationText);
    const parsedSerial = Number(serialText);
    const serialValue = serialText.trim() !== '' && Number.isFinite(parsedSerial) && parsedSerial >= 0 ? parsedSerial : null;
    const shouldPreserveDefaultValue = preserveDefaultValue && !isDirty && (
        patternType === 'duration' ? durationValue != null : defaultValue != null
    );

    const handleSave = async () => {
        if (unsupportedValue != null) {
            if (!isDirty || serialValue == null) return;
            const result = await onSerialChange?.(serialValue);
            if (result) hideFn();
            return;
        }
        if (patternType === 'duration') {
            if (durationSerial == null) return;
            const result = await onDurationChange?.(shouldPreserveDefaultValue ? undefined : durationSerial);
            if (result) hideFn();
            return;
        }
        if (!date) return;
        const result = await onChange?.(shouldPreserveDefaultValue ? undefined : date, changeType);
        if (result) {
            hideFn();
        }
    };

    function renderPicker() {
        if (unsupportedValue != null) {
            return (
                <Input
                    value={serialText}
                    onChange={(value) => {
                        setSerialText(value);
                        setIsDirty(true);
                    }}
                />
            );
        }

        if (patternType === 'duration') {
            return (
                <Input
                    value={durationText}
                    onChange={(value) => {
                        setDurationText(value);
                        setIsDirty(true);
                    }}
                />
            );
        }

        if (patternType === 'time') {
            return (
                <TimeInput
                    value={date.toDate()}
                    onValueChange={(newValue) => {
                        setLocalDate(dateKit(newValue));
                        setIsDirty(true);
                        setChangeType('time');
                    }}
                />
            );
        }

        return (
            <Calendar
                value={date.toDate()}
                showSelection={!exceptionalDateLabel}
                showTime={showTime ?? patternType === 'datetime'}
                onValueChange={(newValue, nextChangeType) => {
                    setLocalDate(dateKit(newValue));
                    setIsDirty(true);
                    setChangeType(nextChangeType);
                }}
            />
        );
    }

    return (
        <div
            className={`
              univer-rounded univer-bg-gray-0 univer-p-2 univer-shadow-lg
              dark:!univer-bg-gray-1000
            `}
        >
            {renderPicker()}
            {exceptionalDateLabel && unsupportedValue == null && (
                <div className="univer-px-2 univer-pb-2 univer-text-center univer-text-sm">
                    {exceptionalDateLabel}
                </div>
            )}

            <footer
                className={clsx('univer-mt-2 univer-flex univer-justify-end univer-pt-2', borderTopClassName)}
            >
                <Button
                    size="small"
                    variant="primary"
                    onClick={handleSave}
                    disabled={unsupportedValue != null
                        ? !isDirty || serialValue == null
                        : patternType === 'duration' ? durationSerial == null : !date || !date.isValid()}
                >
                    {localeService.t<LocaleKey>('sheets-ui.data-validation.alert.ok')}
                </Button>
            </footer>
        </div>

    );
}

DateDropdown.componentKey = 'sheets.dropdown.date';
