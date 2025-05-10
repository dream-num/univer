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

import type { dayjs } from '@univerjs/core';
import type { PickerProps } from 'rc-picker';
import { CalendarSingle } from '@univerjs/icons';
import RcPicker from 'rc-picker';
import generateConfig from 'rc-picker/lib/generate/dayjs';
import { useContext } from 'react';
import { ConfigContext } from '../config-provider/ConfigProvider';
import './index.css';

export interface IDatePickerProps extends Omit<PickerProps<dayjs.Dayjs>, 'value' | 'onChange' | 'locale' | 'generateConfig' | 'prefixCls'> {
    /**
     * The value of the date picker.
     */
    value: dayjs.Dayjs;

    /**
     * Callback when the value of the date picker changes.
     */
    onChange: (date: dayjs.Dayjs, dateString: string) => void;
}

export function DatePicker(props: IDatePickerProps) {
    const { value, onChange, ...ext } = props;

    const { locale } = useContext(ConfigContext);

    function handleChange(date: dayjs.Dayjs | dayjs.Dayjs[], dateString: string | string[]) {
        if (!Array.isArray(date) && !Array.isArray(dateString)) {
            onChange(date, dateString);
        }
    }

    return (
        <RcPicker<dayjs.Dayjs>
            {...ext}
            value={value}
            prefixCls="univer-date-picker"
            generateConfig={generateConfig}
            locale={locale?.Picker!}
            suffixIcon={<CalendarSingle className="univer-date-picker-suffix-icon" />}
            onChange={handleChange}
        />
    );
}
