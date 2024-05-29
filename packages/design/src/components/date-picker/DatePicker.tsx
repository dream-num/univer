/**
 * Copyright 2023-present DreamNum Inc.
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

import React, { useContext } from 'react';
import type { PickerProps } from 'rc-picker';
import RcPicker from 'rc-picker';
import generateConfig from 'rc-picker/lib/generate/dayjs';
import { CalendarSingle } from '@univerjs/icons';
import type { Dayjs } from 'dayjs';
import { ConfigContext } from '../config-provider/ConfigProvider';
import styles from './index.module.less';

export interface IDatePickerProps extends Omit<PickerProps<Dayjs>, 'value' | 'onChange' | 'locale' | 'generateConfig' | 'prefixCls'> {
    /**
     * The value of the date picker.
     */
    value: Dayjs;

    /**
     * Callback when the value of the date picker changes.
     */
    onChange: (date: Dayjs, dateString: string) => void;
}

export function DatePicker(props: IDatePickerProps) {
    const { value, onChange, ...ext } = props;

    const { locale } = useContext(ConfigContext);

    function handleChange(date: Dayjs | Dayjs[], dateString: string | string[]) {
        if (!Array.isArray(date) && !Array.isArray(dateString)) {
            onChange(date, dateString);
        }
    }

    return (
        <RcPicker<Dayjs>
            {...ext}
            value={value}
            prefixCls={styles.datePicker}
            generateConfig={generateConfig}
            locale={locale?.Picker!}
            suffixIcon={<CalendarSingle className={styles.datePickerSuffixIcon} />}
            onChange={handleChange}
        />
    );
}
